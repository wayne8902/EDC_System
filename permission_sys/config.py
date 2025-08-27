"""
權限系統配置

管理權限系統的配置參數和環境設置。
"""

import os
from typing import Dict, Any


class PermissionConfig:
    """權限系統配置類別"""
    
    # 基本配置
    DEBUG = os.environ.get('PERMISSION_DEBUG', 'False').lower() == 'true'
    
    # 快取配置
    CACHE_TTL = int(os.environ.get('PERMISSION_CACHE_TTL', 300))  # 5 分鐘
    CACHE_ENABLED = os.environ.get('PERMISSION_CACHE_ENABLED', 'True').lower() == 'true'
    
    # 資料庫配置
    DATABASE_TYPE = os.environ.get('PERMISSION_DB_TYPE', 'sqlite')
    DATABASE_PATH = os.environ.get('PERMISSION_DB_PATH', 'permission_system.db')
    
    # MySQL 配置
    MYSQL_HOST = os.environ.get('PERMISSION_MYSQL_HOST', 'localhost')
    MYSQL_PORT = int(os.environ.get('PERMISSION_MYSQL_PORT', 3306))
    MYSQL_USER = os.environ.get('PERMISSION_MYSQL_USER', 'root')
    MYSQL_PASSWORD = os.environ.get('PERMISSION_MYSQL_PASSWORD', '')
    MYSQL_DATABASE = os.environ.get('PERMISSION_MYSQL_DATABASE', 'permission_system')
    
    # PostgreSQL 配置
    POSTGRESQL_HOST = os.environ.get('PERMISSION_PG_HOST', 'localhost')
    POSTGRESQL_PORT = int(os.environ.get('PERMISSION_PG_PORT', 5432))
    POSTGRESQL_USER = os.environ.get('PERMISSION_PG_USER', 'postgres')
    POSTGRESQL_PASSWORD = os.environ.get('PERMISSION_PG_PASSWORD', '')
    POSTGRESQL_DATABASE = os.environ.get('PERMISSION_PG_DATABASE', 'permission_system')
    
    # 審計日誌配置
    AUDIT_LOG_ENABLED = os.environ.get('PERMISSION_AUDIT_ENABLED', 'True').lower() == 'true'
    AUDIT_LOG_RETENTION_DAYS = int(os.environ.get('PERMISSION_AUDIT_RETENTION', 365))
    
    # 安全配置
    PASSWORD_HASH_ALGORITHM = os.environ.get('PERMISSION_PASSWORD_HASH', 'sha256')
    SESSION_TIMEOUT = int(os.environ.get('PERMISSION_SESSION_TIMEOUT', 3600))  # 1 小時
    
    # 同步配置
    SYNC_WITH_RBAC = os.environ.get('PERMISSION_SYNC_RBAC', 'True').lower() == 'true'
    SYNC_INTERVAL = int(os.environ.get('PERMISSION_SYNC_INTERVAL', 3600))  # 1 小時
    
    @classmethod
    def get_database_config(cls) -> Dict[str, Any]:
        """獲取資料庫配置"""
        config = {
            'type': cls.DATABASE_TYPE
        }
        
        if cls.DATABASE_TYPE == 'sqlite':
            config['path'] = cls.DATABASE_PATH
        elif cls.DATABASE_TYPE == 'mysql':
            config.update({
                'host': cls.MYSQL_HOST,
                'port': cls.MYSQL_PORT,
                'user': cls.MYSQL_USER,
                'password': cls.MYSQL_PASSWORD,
                'database': cls.MYSQL_DATABASE
            })
        elif cls.DATABASE_TYPE == 'postgresql':
            config.update({
                'host': cls.POSTGRESQL_HOST,
                'port': cls.POSTGRESQL_PORT,
                'user': cls.POSTGRESQL_USER,
                'password': cls.POSTGRESQL_PASSWORD,
                'database': cls.POSTGRESQL_DATABASE
            })
        
        return config
    
    @classmethod
    def get_cache_config(cls) -> Dict[str, Any]:
        """獲取快取配置"""
        return {
            'enabled': cls.CACHE_ENABLED,
            'ttl': cls.CACHE_TTL
        }
    
    @classmethod
    def get_audit_config(cls) -> Dict[str, Any]:
        """獲取審計配置"""
        return {
            'enabled': cls.AUDIT_LOG_ENABLED,
            'retention_days': cls.AUDIT_LOG_RETENTION_DAYS
        }


# 預設權限定義
DEFAULT_PERMISSIONS = [
    # 用戶管理
    {'name': 'users.view', 'resource': 'users', 'action': 'view', 'description': '查看用戶列表'},
    {'name': 'users.create', 'resource': 'users', 'action': 'create', 'description': '建立新用戶'},
    {'name': 'users.edit', 'resource': 'users', 'action': 'edit', 'description': '編輯用戶資料'},
    {'name': 'users.delete', 'resource': 'users', 'action': 'delete', 'description': '刪除用戶'},
    {'name': 'users.admin', 'resource': 'users', 'action': 'admin', 'description': '用戶管理員權限'},
    
    # 角色管理
    {'name': 'roles.view', 'resource': 'roles', 'action': 'view', 'description': '查看角色列表'},
    {'name': 'roles.create', 'resource': 'roles', 'action': 'create', 'description': '建立新角色'},
    {'name': 'roles.edit', 'resource': 'roles', 'action': 'edit', 'description': '編輯角色'},
    {'name': 'roles.delete', 'resource': 'roles', 'action': 'delete', 'description': '刪除角色'},
    {'name': 'roles.admin', 'resource': 'roles', 'action': 'admin', 'description': '角色管理員權限'},
    
    # 權限管理
    {'name': 'permissions.view', 'resource': 'permissions', 'action': 'view', 'description': '查看權限列表'},
    {'name': 'permissions.admin', 'resource': 'permissions', 'action': 'admin', 'description': '權限管理員權限'},
    
    # 審計日誌
    {'name': 'audit_logs.view', 'resource': 'audit_logs', 'action': 'view', 'description': '查看審計日誌'},
    {'name': 'audit_logs.admin', 'resource': 'audit_logs', 'action': 'admin', 'description': '審計日誌管理權限'},
    
    # 控制台
    {'name': 'dashboard.view', 'resource': 'dashboard', 'action': 'view', 'description': '查看控制台'},
    
    # 簽到系統
    {'name': 'signin.view', 'resource': 'signin', 'action': 'view', 'description': '查看簽到記錄'},
    {'name': 'signin.create', 'resource': 'signin', 'action': 'create', 'description': '簽到'},
    {'name': 'signin.edit', 'resource': 'signin', 'action': 'edit', 'description': '編輯簽到記錄'},
    {'name': 'signin.admin', 'resource': 'signin', 'action': 'admin', 'description': '簽到系統管理權限'},
    
    # 請假系統
    {'name': 'leave.view', 'resource': 'leave', 'action': 'view', 'description': '查看請假記錄'},
    {'name': 'leave.apply', 'resource': 'leave', 'action': 'apply', 'description': '申請請假'},
    {'name': 'leave.approve', 'resource': 'leave', 'action': 'approve', 'description': '審核請假'},
    {'name': 'leave.reject', 'resource': 'leave', 'action': 'reject', 'description': '拒絕請假'},
    {'name': 'leave.admin', 'resource': 'leave', 'action': 'admin', 'description': '請假系統管理權限'},
    
    # 系統管理
    {'name': 'system.admin', 'resource': 'system', 'action': 'admin', 'description': '系統管理員權限'},
    {'name': 'system.config', 'resource': 'system', 'action': 'config', 'description': '系統配置權限'},
    
    # 原系統存取
    {'name': 'original_system.access', 'resource': 'original_system', 'action': 'access', 'description': '存取原企業打卡系統'}
]

# 預設角色定義
DEFAULT_ROLES = [
    {
        'name': 'super_admin',
        'description': '超級管理員 - 擁有所有權限',
        'permissions': [p['name'] for p in DEFAULT_PERMISSIONS]
    },
    {
        'name': 'admin',
        'description': '系統管理員 - 用戶和角色管理權限',
        'permissions': [
            'users.view', 'users.create', 'users.edit', 'users.admin',
            'roles.view', 'roles.create', 'roles.edit', 'roles.admin',
            'permissions.view', 'audit_logs.view', 'dashboard.view',
            'signin.admin', 'leave.admin', 'original_system.access'
        ]
    },
    {
        'name': 'manager',
        'description': '管理者 - 部分管理權限',
        'permissions': [
            'users.view', 'users.edit', 'roles.view',
            'dashboard.view', 'audit_logs.view',
            'signin.view', 'signin.admin',
            'leave.view', 'leave.approve', 'leave.reject',
            'original_system.access'
        ]
    },
    {
        'name': 'employee',
        'description': '員工 - 基本操作權限',
        'permissions': [
            'dashboard.view', 'signin.view', 'signin.create',
            'leave.view', 'leave.apply', 'original_system.access'
        ]
    },
    {
        'name': 'readonly',
        'description': '只讀用戶 - 僅查看權限',
        'permissions': [
            'dashboard.view', 'signin.view', 'leave.view'
        ]
    }
]

# 權限組織結構
PERMISSION_GROUPS = {
    '用戶管理': ['users.view', 'users.create', 'users.edit', 'users.delete', 'users.admin'],
    '角色管理': ['roles.view', 'roles.create', 'roles.edit', 'roles.delete', 'roles.admin'],
    '權限管理': ['permissions.view', 'permissions.admin'],
    '審計日誌': ['audit_logs.view', 'audit_logs.admin'],
    '簽到系統': ['signin.view', 'signin.create', 'signin.edit', 'signin.admin'],
    '請假系統': ['leave.view', 'leave.apply', 'leave.approve', 'leave.reject', 'leave.admin'],
    '系統管理': ['system.admin', 'system.config', 'dashboard.view'],
    '原系統': ['original_system.access']
}