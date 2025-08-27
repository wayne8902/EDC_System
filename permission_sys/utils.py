"""
權限系統工具類別

提供快取、用戶對應、權限計算等輔助功能。
"""

import json
import time
import logging
from typing import Dict, Any, Optional, List, Union
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)


class PermissionCache:
    """權限快取管理器"""
    
    def __init__(self, cache_ttl: int = 300):  # 預設快取 5 分鐘
        """
        初始化權限快取
        
        Args:
            cache_ttl: 快取存活時間（秒）
        """
        self.cache_ttl = cache_ttl
        self.user_permissions_cache: Dict[int, Dict[str, Any]] = {}
        self.user_roles_cache: Dict[int, Dict[str, Any]] = {}
        
    def _is_cache_valid(self, cache_entry: Dict[str, Any]) -> bool:
        """檢查快取是否仍然有效"""
        if not cache_entry:
            return False
        
        cache_time = cache_entry.get('timestamp', 0)
        return (time.time() - cache_time) < self.cache_ttl
    
    def get_user_permission(self, user_id: int, permission: str) -> Optional[bool]:
        """從快取獲取用戶權限"""
        cache_entry = self.user_permissions_cache.get(user_id)
        
        if self._is_cache_valid(cache_entry):
            permissions = cache_entry.get('permissions', {})
            return permissions.get(permission)
        
        return None
    
    def set_user_permission(self, user_id: int, permission: str, has_permission: bool):
        """設置用戶權限到快取"""
        if user_id not in self.user_permissions_cache:
            self.user_permissions_cache[user_id] = {
                'permissions': {},
                'timestamp': time.time()
            }
        
        cache_entry = self.user_permissions_cache[user_id]
        if not self._is_cache_valid(cache_entry):
            # 快取過期，重新初始化
            cache_entry = {
                'permissions': {},
                'timestamp': time.time()
            }
            self.user_permissions_cache[user_id] = cache_entry
        
        cache_entry['permissions'][permission] = has_permission
    
    def get_user_permissions(self, user_id: int) -> Optional[List[str]]:
        """從快取獲取用戶的所有權限"""
        cache_entry = self.user_permissions_cache.get(user_id)
        
        if self._is_cache_valid(cache_entry):
            return cache_entry.get('all_permissions')
        
        return None
    
    def set_user_permissions(self, user_id: int, permissions: List[str]):
        """設置用戶的所有權限到快取"""
        if user_id not in self.user_permissions_cache:
            self.user_permissions_cache[user_id] = {
                'permissions': {},
                'timestamp': time.time()
            }
        
        cache_entry = self.user_permissions_cache[user_id]
        cache_entry['all_permissions'] = permissions
        cache_entry['timestamp'] = time.time()
    
    def get_user_roles(self, user_id: int) -> Optional[List[Dict[str, Any]]]:
        """從快取獲取用戶角色"""
        cache_entry = self.user_roles_cache.get(user_id)
        
        if self._is_cache_valid(cache_entry):
            return cache_entry.get('roles')
        
        return None
    
    def set_user_roles(self, user_id: int, roles: List[Dict[str, Any]]):
        """設置用戶角色到快取"""
        self.user_roles_cache[user_id] = {
            'roles': roles,
            'timestamp': time.time()
        }
    
    def clear_user_cache(self, user_id: int):
        """清除特定用戶的快取"""
        self.user_permissions_cache.pop(user_id, None)
        self.user_roles_cache.pop(user_id, None)
        logger.debug(f"Cleared cache for user {user_id}")
    
    def clear_all_cache(self):
        """清除所有快取"""
        self.user_permissions_cache.clear()
        self.user_roles_cache.clear()
        logger.info("Cleared all permission cache")
    
    def get_cache_stats(self) -> Dict[str, Any]:
        """獲取快取統計資訊"""
        permission_cache_size = len(self.user_permissions_cache)
        role_cache_size = len(self.user_roles_cache)
        
        # 計算有效快取數量
        valid_permission_cache = sum(
            1 for cache_entry in self.user_permissions_cache.values()
            if self._is_cache_valid(cache_entry)
        )
        
        valid_role_cache = sum(
            1 for cache_entry in self.user_roles_cache.values()
            if self._is_cache_valid(cache_entry)
        )
        
        return {
            'permission_cache_size': permission_cache_size,
            'role_cache_size': role_cache_size,
            'valid_permission_cache': valid_permission_cache,
            'valid_role_cache': valid_role_cache,
            'cache_ttl': self.cache_ttl
        }


class UserMapper:
    """用戶系統對應管理器"""
    
    def __init__(self, database):
        """
        初始化用戶對應器
        
        Args:
            database: 資料庫操作實例
        """
        self.database = database
    
    def map_rbac_to_permission(self, rbac_user_id: int) -> Optional[int]:
        """
        將 RBAC 用戶 ID 對應到權限系統用戶 ID
        
        Args:
            rbac_user_id: RBAC 系統用戶 ID
            
        Returns:
            權限系統用戶 ID，如果沒有對應則返回 None
        """
        # 這裡實現對應邏輯，可能需要查詢對應表
        # 目前先返回相同 ID 作為示例
        return rbac_user_id
    
    def map_permission_to_rbac(self, permission_user_id: int) -> Optional[int]:
        """
        將權限系統用戶 ID 對應到 RBAC 用戶 ID
        
        Args:
            permission_user_id: 權限系統用戶 ID
            
        Returns:
            RBAC 系統用戶 ID，如果沒有對應則返回 None
        """
        return permission_user_id
    
    def map_original_to_permission(self, original_user_id: int) -> Optional[int]:
        """
        將原系統用戶 ID 對應到權限系統用戶 ID
        
        Args:
            original_user_id: 原系統用戶 ID（例如 united_khh.user.ID）
            
        Returns:
            權限系統用戶 ID
        """
        # 查詢對應表
        # 這裡需要實現具體的對應邏輯
        return original_user_id
    
    def sync_user_from_rbac(self, rbac_user_data: Dict[str, Any]) -> Optional[int]:
        """
        從 RBAC 系統同步用戶到權限系統
        
        Args:
            rbac_user_data: RBAC 用戶資料
            
        Returns:
            新創建的權限系統用戶 ID
        """
        try:
            # 檢查是否已存在
            existing_user = self.database.get_user_by_username(rbac_user_data['username'])
            if existing_user:
                return existing_user['id']
            
            # 創建新用戶
            user_id = self.database.create_user(
                username=rbac_user_data['username'],
                email=rbac_user_data['email'],
                password=rbac_user_data['password_hash'],
                first_name=rbac_user_data.get('first_name'),
                last_name=rbac_user_data.get('last_name')
            )
            
            logger.info(f"Synced user from RBAC: {rbac_user_data['username']} -> {user_id}")
            return user_id
            
        except Exception as e:
            logger.error(f"Sync user from RBAC error: {e}")
            return None


class PermissionCalculator:
    """權限計算工具"""
    
    @staticmethod
    def calculate_effective_permissions(user_data: Dict[str, Any], 
                                      roles_data: List[Dict[str, Any]]) -> List[str]:
        """
        計算用戶的有效權限（角色權限 + 直接權限）
        
        Args:
            user_data: 用戶資料
            roles_data: 角色資料列表
            
        Returns:
            有效權限列表
        """
        effective_permissions = set()
        
        try:
            # 解析用戶的角色 ID
            role_ids = json.loads(user_data.get('role_ids', '[]'))
            
            # 從角色獲取權限
            for role_data in roles_data:
                if role_data['id'] in role_ids and role_data.get('is_active', True):
                    role_permissions = json.loads(role_data.get('permission_names', '[]'))
                    effective_permissions.update(role_permissions)
            
            # 加入直接權限
            direct_permissions = json.loads(user_data.get('direct_permissions', '[]'))
            effective_permissions.update(direct_permissions)
            
        except (json.JSONDecodeError, TypeError) as e:
            logger.error(f"Permission calculation error: {e}")
        
        return list(effective_permissions)
    
    @staticmethod
    def check_permission_hierarchy(required_permission: str, 
                                 user_permissions: List[str]) -> bool:
        """
        檢查權限階層（支援萬用字元和階層權限）
        
        Args:
            required_permission: 需要的權限
            user_permissions: 用戶擁有的權限
            
        Returns:
            是否擁有權限
        """
        # 直接匹配
        if required_permission in user_permissions:
            return True
        
        # 檢查萬用字元權限（例如：users.* 包含 users.create）
        required_parts = required_permission.split('.')
        for permission in user_permissions:
            if permission.endswith('.*'):
                permission_prefix = permission[:-2]  # 移除 .*
                if required_permission.startswith(permission_prefix + '.'):
                    return True
        
        # 檢查超級管理員權限
        if 'system.admin' in user_permissions or '*' in user_permissions:
            return True
        
        return False


class PermissionFormatter:
    """權限格式化工具"""
    
    @staticmethod
    def format_permission_name(resource: str, action: str) -> str:
        """格式化權限名稱"""
        return f"{resource}.{action}"
    
    @staticmethod
    def parse_permission_name(permission_name: str) -> Dict[str, str]:
        """解析權限名稱"""
        if '.' in permission_name:
            parts = permission_name.split('.', 1)
            return {
                'resource': parts[0],
                'action': parts[1]
            }
        else:
            return {
                'resource': permission_name,
                'action': 'access'
            }
    
    @staticmethod
    def group_permissions_by_resource(permissions: List[str]) -> Dict[str, List[str]]:
        """按資源分組權限"""
        grouped = {}
        
        for permission in permissions:
            parsed = PermissionFormatter.parse_permission_name(permission)
            resource = parsed['resource']
            action = parsed['action']
            
            if resource not in grouped:
                grouped[resource] = []
            
            grouped[resource].append(action)
        
        return grouped
    
    @staticmethod
    def format_permission_display(permission: str) -> str:
        """格式化權限顯示名稱"""
        permission_names = {
            'users.view': '查看用戶',
            'users.create': '建立用戶',
            'users.edit': '編輯用戶',
            'users.delete': '刪除用戶',
            'roles.view': '查看角色',
            'roles.create': '建立角色',
            'roles.edit': '編輯角色',
            'roles.delete': '刪除角色',
            'permissions.view': '查看權限',
            'audit_logs.view': '查看審計日誌',
            'dashboard.view': '查看控制台',
            'system.admin': '系統管理員',
            'signin.view': '查看簽到記錄',
            'signin.create': '簽到',
            'leave.view': '查看請假記錄',
            'leave.apply': '申請請假',
            'leave.approve': '審核請假'
        }
        
        return permission_names.get(permission, permission)


class SessionHelper:
    """Session 輔助工具"""
    
    @staticmethod
    def get_user_id_from_session(session: Dict[str, Any]) -> Optional[int]:
        """從 session 中獲取用戶 ID"""
        possible_keys = ['user_id', 'rbac_user_id', 'permission_user_id', 'current_user_id']
        
        for key in possible_keys:
            user_id = session.get(key)
            if user_id:
                try:
                    return int(user_id)
                except (ValueError, TypeError):
                    continue
        
        return None
    
    @staticmethod
    def set_user_session(session: Dict[str, Any], user_id: int, username: str):
        """設置用戶 session"""
        session['user_id'] = user_id
        session['username'] = username
        session['login_time'] = datetime.now().isoformat()
    
    @staticmethod
    def clear_user_session(session: Dict[str, Any]):
        """清除用戶 session"""
        keys_to_remove = ['user_id', 'username', 'login_time', 'permissions', 'roles']
        for key in keys_to_remove:
            session.pop(key, None)