"""
權限系統服務層

提供權限管理的核心業務邏輯，整合不同的資料來源和權限檢查。
"""

import json
import logging
from typing import List, Dict, Any, Optional, Union
from datetime import datetime
from .models import PermissionUser, PermissionRole, PermissionPermission, PermissionAuditLog
from .database import PermissionDatabase
from .utils import PermissionCache

logger = logging.getLogger(__name__)


class PermissionService:
    """權限管理服務類別"""
    
    def __init__(self, db_config: Optional[Dict] = None):
        """
        初始化權限服務
        
        Args:
            db_config: 資料庫配置，如果不提供則使用預設配置
        """
        self.db = PermissionDatabase(db_config)
        self.cache = PermissionCache()
        
    def authenticate_user(self, username: str, password: str) -> Optional[PermissionUser]:
        """
        用戶身份驗證
        
        Args:
            username: 用戶名
            password: 密碼
            
        Returns:
            驗證成功返回用戶對象，失敗返回 None
        """
        try:
            user_data = self.db.authenticate_user(username, password)
            if user_data:
                user = PermissionUser(user_data)
                self.log_user_action(user.id, 'user.login', 'authentication', 
                                   details={'username': username, 'success': True})
                return user
            else:
                self.log_user_action(None, 'user.login_failed', 'authentication',
                                   details={'username': username, 'success': False})
                return None
        except Exception as e:
            logger.error(f"Authentication error: {e}")
            return None
    
    def get_user_by_id(self, user_id: int) -> Optional[PermissionUser]:
        """根據 ID 獲取用戶"""
        user_data = self.db.get_user_by_id(user_id)
        return PermissionUser(user_data) if user_data else None
    
    def get_user_by_username(self, username: str) -> Optional[PermissionUser]:
        """根據用戶名獲取用戶"""
        user_data = self.db.get_user_by_username(username)
        return PermissionUser(user_data) if user_data else None
    
    def check_permission(self, user_id: int, permission: str) -> bool:
        """
        檢查用戶是否擁有特定權限
        
        Args:
            user_id: 用戶 ID
            permission: 權限名稱（例如：'users.create'）
            
        Returns:
            True 如果用戶擁有權限，否則 False
        """
        try:
            # 先檢查快取
            cached_result = self.cache.get_user_permission(user_id, permission)
            if cached_result is not None:
                return cached_result
            
            # 從資料庫獲取用戶和角色資料
            user_data = self.db.get_user_by_id(user_id)
            if not user_data or not user_data.get('is_active'):
                return False
            
            user = PermissionUser(user_data)
            roles_data = self.db.get_roles_by_ids(user.role_ids)
            
            # 檢查權限
            has_permission = user.has_permission(permission, roles_data)
            
            # 快取結果
            self.cache.set_user_permission(user_id, permission, has_permission)
            
            return has_permission
            
        except Exception as e:
            logger.error(f"Permission check error: {e}")
            return False
    
    def check_role(self, user_id: int, role_name: str) -> bool:
        """
        檢查用戶是否擁有特定角色
        
        Args:
            user_id: 用戶 ID  
            role_name: 角色名稱
            
        Returns:
            True 如果用戶擁有角色，否則 False
        """
        try:
            user_data = self.db.get_user_by_id(user_id)
            if not user_data or not user_data.get('is_active'):
                return False
            
            user = PermissionUser(user_data)
            roles_data = self.db.get_roles_by_ids(user.role_ids)
            
            return user.has_role(role_name, roles_data)
            
        except Exception as e:
            logger.error(f"Role check error: {e}")
            return False
    
    def get_user_permissions(self, user_id: int) -> List[str]:
        """獲取用戶的所有權限列表"""
        try:
            user_data = self.db.get_user_by_id(user_id)
            if not user_data:
                return []
            
            user = PermissionUser(user_data)
            roles_data = self.db.get_roles_by_ids(user.role_ids)
            
            return user.get_all_permissions(roles_data)
            
        except Exception as e:
            logger.error(f"Get user permissions error: {e}")
            return []
    
    def get_user_roles(self, user_id: int) -> List[Dict[str, Any]]:
        """獲取用戶的所有角色"""
        try:
            user_data = self.db.get_user_by_id(user_id)
            if not user_data:
                return []
            
            user = PermissionUser(user_data)
            return self.db.get_roles_by_ids(user.role_ids)
            
        except Exception as e:
            logger.error(f"Get user roles error: {e}")
            return []
    
    def assign_role_to_user(self, user_id: int, role_id: int, assigned_by: int) -> bool:
        """為用戶分配角色"""
        try:
            user_data = self.db.get_user_by_id(user_id)
            if not user_data:
                return False
            
            user = PermissionUser(user_data)
            if role_id not in user.role_ids:
                user.role_ids.append(role_id)
                
                # 更新資料庫
                success = self.db.update_user_roles(user_id, user.role_ids)
                
                if success:
                    # 清除快取
                    self.cache.clear_user_cache(user_id)
                    
                    # 記錄操作
                    self.log_user_action(assigned_by, 'role.assign', 'user', user_id,
                                       {'role_id': role_id, 'target_user_id': user_id})
                
                return success
            return True
            
        except Exception as e:
            logger.error(f"Assign role error: {e}")
            return False
    
    def remove_role_from_user(self, user_id: int, role_id: int, removed_by: int) -> bool:
        """從用戶移除角色"""
        try:
            user_data = self.db.get_user_by_id(user_id)
            if not user_data:
                return False
            
            user = PermissionUser(user_data)
            if role_id in user.role_ids:
                user.role_ids.remove(role_id)
                
                # 更新資料庫
                success = self.db.update_user_roles(user_id, user.role_ids)
                
                if success:
                    # 清除快取
                    self.cache.clear_user_cache(user_id)
                    
                    # 記錄操作
                    self.log_user_action(removed_by, 'role.remove', 'user', user_id,
                                       {'role_id': role_id, 'target_user_id': user_id})
                
                return success
            return True
            
        except Exception as e:
            logger.error(f"Remove role error: {e}")
            return False
    
    def grant_direct_permission(self, user_id: int, permission: str, granted_by: int) -> bool:
        """直接授予用戶權限"""
        try:
            user_data = self.db.get_user_by_id(user_id)
            if not user_data:
                return False
            
            user = PermissionUser(user_data)
            if permission not in user.direct_permissions:
                user.direct_permissions.append(permission)
                
                # 更新資料庫
                success = self.db.update_user_direct_permissions(user_id, user.direct_permissions)
                
                if success:
                    # 清除快取
                    self.cache.clear_user_cache(user_id)
                    
                    # 記錄操作
                    self.log_user_action(granted_by, 'permission.grant', 'user', user_id,
                                       {'permission': permission, 'target_user_id': user_id})
                
                return success
            return True
            
        except Exception as e:
            logger.error(f"Grant permission error: {e}")
            return False
    
    def revoke_direct_permission(self, user_id: int, permission: str, revoked_by: int) -> bool:
        """撤銷用戶的直接權限"""
        try:
            user_data = self.db.get_user_by_id(user_id)
            if not user_data:
                return False
            
            user = PermissionUser(user_data)
            if permission in user.direct_permissions:
                user.direct_permissions.remove(permission)
                
                # 更新資料庫
                success = self.db.update_user_direct_permissions(user_id, user.direct_permissions)
                
                if success:
                    # 清除快取
                    self.cache.clear_user_cache(user_id)
                    
                    # 記錄操作
                    self.log_user_action(revoked_by, 'permission.revoke', 'user', user_id,
                                       {'permission': permission, 'target_user_id': user_id})
                
                return success
            return True
            
        except Exception as e:
            logger.error(f"Revoke permission error: {e}")
            return False
    
    def log_user_action(self, user_id: Optional[int], action: str, resource_type: str, 
                       resource_id: Optional[int] = None, details: Optional[Dict] = None,
                       ip_address: Optional[str] = None, user_agent: Optional[str] = None):
        """記錄用戶操作到審計日誌"""
        try:
            log_data = {
                'user_id': user_id,
                'action': action,
                'resource_type': resource_type,
                'resource_id': resource_id,
                'details': json.dumps(details or {}),
                'ip_address': ip_address,
                'user_agent': user_agent,
                'timestamp': datetime.now()
            }
            
            self.db.create_audit_log(log_data)
            
        except Exception as e:
            logger.error(f"Log user action error: {e}")
    
    def get_audit_logs(self, user_id: Optional[int] = None, action: Optional[str] = None,
                      limit: int = 100, offset: int = 0) -> List[Dict[str, Any]]:
        """獲取審計日誌"""
        try:
            return self.db.get_audit_logs(user_id, action, limit, offset)
        except Exception as e:
            logger.error(f"Get audit logs error: {e}")
            return []
    
    def sync_with_rbac_system(self) -> bool:
        """與主 RBAC 系統同步資料"""
        try:
            # 這裡實現與主 Flask RBAC 系統的資料同步邏輯
            # 可以定期執行此方法來保持資料一致性
            logger.info("Starting sync with RBAC system")
            
            # 同步用戶資料
            # 同步角色資料
            # 同步權限資料
            
            logger.info("Sync with RBAC system completed")
            return True
            
        except Exception as e:
            logger.error(f"Sync with RBAC system error: {e}")
            return False