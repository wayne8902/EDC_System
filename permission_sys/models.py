"""
權限系統資料模型

定義權限系統相關的資料庫模型，與現有 Flask RBAC 系統整合。
"""

import json
from datetime import datetime
from typing import List, Dict, Any, Optional


class PermissionUser:
    """權限系統用戶模型"""
    
    def __init__(self, user_data: Dict[str, Any]):
        self.id = user_data.get('id')
        self.username = user_data.get('username')
        self.email = user_data.get('email')
        self.first_name = user_data.get('first_name')
        self.last_name = user_data.get('last_name')
        self.is_active = user_data.get('is_active', True)
        self.role_ids = self._parse_json_field(user_data.get('role_ids', '[]'))
        self.direct_permissions = self._parse_json_field(user_data.get('direct_permissions', '[]'))
        self.created_at = user_data.get('created_at')
        self.last_login = user_data.get('last_login')
        
    def _parse_json_field(self, json_str: str) -> List:
        """解析 JSON 字串為 Python 列表"""
        try:
            return json.loads(json_str) if json_str else []
        except (json.JSONDecodeError, TypeError):
            return []
    
    def get_all_permissions(self, roles_data: List[Dict]) -> List[str]:
        """獲取用戶的所有權限（角色權限 + 直接權限）"""
        all_permissions = set(self.direct_permissions)
        
        # 從角色獲取權限
        for role_data in roles_data:
            if role_data['id'] in self.role_ids:
                role_permissions = self._parse_json_field(role_data.get('permission_names', '[]'))
                all_permissions.update(role_permissions)
        
        return list(all_permissions)
    
    def has_permission(self, permission: str, roles_data: List[Dict]) -> bool:
        """檢查用戶是否擁有特定權限"""
        if not self.is_active:
            return False
            
        all_permissions = self.get_all_permissions(roles_data)
        return permission in all_permissions
    
    def has_role(self, role_name: str, roles_data: List[Dict]) -> bool:
        """檢查用戶是否擁有特定角色"""
        for role_data in roles_data:
            if role_data['id'] in self.role_ids and role_data['name'] == role_name:
                return True
        return False
    
    def to_dict(self) -> Dict[str, Any]:
        """轉換為字典格式"""
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'is_active': self.is_active,
            'role_ids': self.role_ids,
            'direct_permissions': self.direct_permissions,
            'created_at': self.created_at,
            'last_login': self.last_login
        }


class PermissionRole:
    """權限角色模型"""
    
    def __init__(self, role_data: Dict[str, Any]):
        self.id = role_data.get('id')
        self.name = role_data.get('name')
        self.description = role_data.get('description')
        self.is_active = role_data.get('is_active', True)
        self.permission_names = self._parse_json_field(role_data.get('permission_names', '[]'))
        self.created_at = role_data.get('created_at')
        
    def _parse_json_field(self, json_str: str) -> List:
        """解析 JSON 字串為 Python 列表"""
        try:
            return json.loads(json_str) if json_str else []
        except (json.JSONDecodeError, TypeError):
            return []
    
    def has_permission(self, permission: str) -> bool:
        """檢查角色是否擁有特定權限"""
        return permission in self.permission_names
    
    def add_permission(self, permission: str):
        """新增權限到角色"""
        if permission not in self.permission_names:
            self.permission_names.append(permission)
    
    def remove_permission(self, permission: str):
        """從角色移除權限"""
        if permission in self.permission_names:
            self.permission_names.remove(permission)
    
    def to_dict(self) -> Dict[str, Any]:
        """轉換為字典格式"""
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'is_active': self.is_active,
            'permission_names': self.permission_names,
            'created_at': self.created_at
        }


class PermissionPermission:
    """權限定義模型"""
    
    def __init__(self, permission_data: Dict[str, Any]):
        self.id = permission_data.get('id')
        self.name = permission_data.get('name')
        self.resource = permission_data.get('resource')
        self.action = permission_data.get('action')
        self.description = permission_data.get('description')
        self.created_at = permission_data.get('created_at')
    
    def to_dict(self) -> Dict[str, Any]:
        """轉換為字典格式"""
        return {
            'id': self.id,
            'name': self.name,
            'resource': self.resource,
            'action': self.action,
            'description': self.description,
            'created_at': self.created_at
        }
    
    @classmethod
    def create_permission_name(cls, resource: str, action: str) -> str:
        """根據資源和動作創建權限名稱"""
        return f"{resource}.{action}"


class PermissionAuditLog:
    """權限審計日誌模型"""
    
    def __init__(self, log_data: Dict[str, Any]):
        self.id = log_data.get('id')
        self.user_id = log_data.get('user_id')
        self.action = log_data.get('action')
        self.resource_type = log_data.get('resource_type')
        self.resource_id = log_data.get('resource_id')
        self.details = self._parse_json_field(log_data.get('details', '{}'))
        self.ip_address = log_data.get('ip_address')
        self.user_agent = log_data.get('user_agent')
        self.timestamp = log_data.get('timestamp')
    
    def _parse_json_field(self, json_str: str) -> Dict:
        """解析 JSON 字串為 Python 字典"""
        try:
            return json.loads(json_str) if json_str else {}
        except (json.JSONDecodeError, TypeError):
            return {}
    
    def to_dict(self) -> Dict[str, Any]:
        """轉換為字典格式"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'action': self.action,
            'resource_type': self.resource_type,
            'resource_id': self.resource_id,
            'details': self.details,
            'ip_address': self.ip_address,
            'user_agent': self.user_agent,
            'timestamp': self.timestamp
        }


class PermissionUserMapping:
    """用戶系統對應模型"""
    
    def __init__(self, mapping_data: Dict[str, Any]):
        self.id = mapping_data.get('id')
        self.rbac_user_id = mapping_data.get('rbac_user_id')
        self.permission_user_id = mapping_data.get('permission_user_id')
        self.original_user_id = mapping_data.get('original_user_id')
        self.created_at = mapping_data.get('created_at')
    
    def to_dict(self) -> Dict[str, Any]:
        """轉換為字典格式"""
        return {
            'id': self.id,
            'rbac_user_id': self.rbac_user_id,
            'permission_user_id': self.permission_user_id,
            'original_user_id': self.original_user_id,
            'created_at': self.created_at
        }