"""
權限系統資料庫操作

提供權限系統的資料庫存取功能，支援多種資料庫後端。
"""

import json
import logging
import hashlib
from typing import List, Dict, Any, Optional
from datetime import datetime
import sqlite3
import os

logger = logging.getLogger(__name__)


class PermissionDatabase:
    """權限系統資料庫操作類別"""
    
    def __init__(self, db_config: Optional[Dict] = None):
        """
        初始化資料庫連接
        
        Args:
            db_config: 資料庫配置字典
        """
        self.db_config = db_config or {}
        self.db_type = self.db_config.get('type', 'sqlite')
        
        if self.db_type == 'sqlite':
            self.db_path = self.db_config.get('path', 'permission_system.db')
            self._init_sqlite()
        elif self.db_type == 'mysql':
            self._init_mysql()
        elif self.db_type == 'postgresql':
            self._init_postgresql()
        else:
            raise ValueError(f"Unsupported database type: {self.db_type}")
    
    def _init_sqlite(self):
        """初始化 SQLite 資料庫"""
        if not os.path.exists(self.db_path):
            self._create_sqlite_tables()
    
    def _create_sqlite_tables(self):
        """創建 SQLite 表結構"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # 用戶表
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS permission_users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username VARCHAR(100) NOT NULL UNIQUE,
                    email VARCHAR(255) NOT NULL UNIQUE,
                    password_hash VARCHAR(256) NOT NULL,
                    first_name VARCHAR(100),
                    last_name VARCHAR(100),
                    is_active BOOLEAN NOT NULL DEFAULT 1,
                    role_ids TEXT DEFAULT '[]',
                    direct_permissions TEXT DEFAULT '[]',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_login TIMESTAMP
                )
            ''')
            
            # 角色表
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS permission_roles (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name VARCHAR(100) NOT NULL UNIQUE,
                    description TEXT,
                    is_active BOOLEAN NOT NULL DEFAULT 1,
                    permission_names TEXT DEFAULT '[]',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # 權限表
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS permission_permissions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name VARCHAR(100) NOT NULL UNIQUE,
                    resource VARCHAR(100) NOT NULL,
                    action VARCHAR(50) NOT NULL,
                    description TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # 審計日誌表
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS permission_audit_logs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER,
                    action VARCHAR(100) NOT NULL,
                    resource_type VARCHAR(100),
                    resource_id INTEGER,
                    details TEXT,
                    ip_address VARCHAR(45),
                    user_agent TEXT,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # 用戶對應表
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS permission_user_mapping (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    permission_user_id INTEGER NOT NULL,
                    rbac_user_id INTEGER,
                    original_user_id INTEGER,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (permission_user_id) REFERENCES permission_users (id)
                )
            ''')
            
            conn.commit()
            logger.info("SQLite tables created successfully")
    
    def _init_mysql(self):
        """初始化 MySQL 連接"""
        try:
            import pymysql
            self.mysql_config = {
                'host': self.db_config.get('host', 'localhost'),
                'port': self.db_config.get('port', 3306),
                'user': self.db_config.get('user', 'root'),
                'password': self.db_config.get('password', ''),
                'database': self.db_config.get('database', 'permission_system'),
                'charset': 'utf8mb4'
            }
        except ImportError:
            raise ImportError("pymysql is required for MySQL support")
    
    def _init_postgresql(self):
        """初始化 PostgreSQL 連接"""
        try:
            import psycopg2
            self.pg_config = {
                'host': self.db_config.get('host', 'localhost'),
                'port': self.db_config.get('port', 5432),
                'user': self.db_config.get('user', 'postgres'),
                'password': self.db_config.get('password', ''),
                'database': self.db_config.get('database', 'permission_system')
            }
        except ImportError:
            raise ImportError("psycopg2 is required for PostgreSQL support")
    
    def authenticate_user(self, username: str, password: str) -> Optional[Dict[str, Any]]:
        """用戶身份驗證"""
        password_hash = self._hash_password(password)
        
        if self.db_type == 'sqlite':
            with sqlite3.connect(self.db_path) as conn:
                conn.row_factory = sqlite3.Row
                cursor = conn.cursor()
                cursor.execute('''
                    SELECT * FROM permission_users 
                    WHERE username = ? AND password_hash = ? AND is_active = 1
                ''', (username, password_hash))
                
                row = cursor.fetchone()
                if row:
                    # 更新最後登入時間
                    cursor.execute('''
                        UPDATE permission_users 
                        SET last_login = CURRENT_TIMESTAMP 
                        WHERE id = ?
                    ''', (row['id'],))
                    conn.commit()
                    
                    return dict(row)
        
        return None
    
    def get_user_by_id(self, user_id: int) -> Optional[Dict[str, Any]]:
        """根據 ID 獲取用戶"""
        if self.db_type == 'sqlite':
            with sqlite3.connect(self.db_path) as conn:
                conn.row_factory = sqlite3.Row
                cursor = conn.cursor()
                cursor.execute('SELECT * FROM permission_users WHERE id = ?', (user_id,))
                
                row = cursor.fetchone()
                return dict(row) if row else None
        
        return None
    
    def get_user_by_username(self, username: str) -> Optional[Dict[str, Any]]:
        """根據用戶名獲取用戶"""
        if self.db_type == 'sqlite':
            with sqlite3.connect(self.db_path) as conn:
                conn.row_factory = sqlite3.Row
                cursor = conn.cursor()
                cursor.execute('SELECT * FROM permission_users WHERE username = ?', (username,))
                
                row = cursor.fetchone()
                return dict(row) if row else None
        
        return None
    
    def get_roles_by_ids(self, role_ids: List[int]) -> List[Dict[str, Any]]:
        """根據 ID 列表獲取角色"""
        if not role_ids:
            return []
        
        if self.db_type == 'sqlite':
            with sqlite3.connect(self.db_path) as conn:
                conn.row_factory = sqlite3.Row
                cursor = conn.cursor()
                
                placeholders = ','.join(['?'] * len(role_ids))
                cursor.execute(f'''
                    SELECT * FROM permission_roles 
                    WHERE id IN ({placeholders}) AND is_active = 1
                ''', role_ids)
                
                return [dict(row) for row in cursor.fetchall()]
        
        return []
    
    def update_user_roles(self, user_id: int, role_ids: List[int]) -> bool:
        """更新用戶角色"""
        try:
            role_ids_json = json.dumps(role_ids)
            
            if self.db_type == 'sqlite':
                with sqlite3.connect(self.db_path) as conn:
                    cursor = conn.cursor()
                    cursor.execute('''
                        UPDATE permission_users 
                        SET role_ids = ?, updated_at = CURRENT_TIMESTAMP 
                        WHERE id = ?
                    ''', (role_ids_json, user_id))
                    conn.commit()
                    return cursor.rowcount > 0
            
            return False
        except Exception as e:
            logger.error(f"Update user roles error: {e}")
            return False
    
    def update_user_direct_permissions(self, user_id: int, permissions: List[str]) -> bool:
        """更新用戶直接權限"""
        try:
            permissions_json = json.dumps(permissions)
            
            if self.db_type == 'sqlite':
                with sqlite3.connect(self.db_path) as conn:
                    cursor = conn.cursor()
                    cursor.execute('''
                        UPDATE permission_users 
                        SET direct_permissions = ?, updated_at = CURRENT_TIMESTAMP 
                        WHERE id = ?
                    ''', (permissions_json, user_id))
                    conn.commit()
                    return cursor.rowcount > 0
            
            return False
        except Exception as e:
            logger.error(f"Update user direct permissions error: {e}")
            return False
    
    def create_audit_log(self, log_data: Dict[str, Any]) -> bool:
        """創建審計日誌記錄"""
        try:
            if self.db_type == 'sqlite':
                with sqlite3.connect(self.db_path) as conn:
                    cursor = conn.cursor()
                    cursor.execute('''
                        INSERT INTO permission_audit_logs 
                        (user_id, action, resource_type, resource_id, details, ip_address, user_agent)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                    ''', (
                        log_data.get('user_id'),
                        log_data.get('action'),
                        log_data.get('resource_type'),
                        log_data.get('resource_id'),
                        log_data.get('details'),
                        log_data.get('ip_address'),
                        log_data.get('user_agent')
                    ))
                    conn.commit()
                    return True
            
            return False
        except Exception as e:
            logger.error(f"Create audit log error: {e}")
            return False
    
    def get_audit_logs(self, user_id: Optional[int] = None, action: Optional[str] = None,
                      limit: int = 100, offset: int = 0) -> List[Dict[str, Any]]:
        """獲取審計日誌"""
        try:
            if self.db_type == 'sqlite':
                with sqlite3.connect(self.db_path) as conn:
                    conn.row_factory = sqlite3.Row
                    cursor = conn.cursor()
                    
                    query = 'SELECT * FROM permission_audit_logs WHERE 1=1'
                    params = []
                    
                    if user_id:
                        query += ' AND user_id = ?'
                        params.append(user_id)
                    
                    if action:
                        query += ' AND action = ?'
                        params.append(action)
                    
                    query += ' ORDER BY timestamp DESC LIMIT ? OFFSET ?'
                    params.extend([limit, offset])
                    
                    cursor.execute(query, params)
                    return [dict(row) for row in cursor.fetchall()]
            
            return []
        except Exception as e:
            logger.error(f"Get audit logs error: {e}")
            return []
    
    def _hash_password(self, password: str) -> str:
        """密碼雜湊"""
        return hashlib.sha256(password.encode()).hexdigest()
    
    def create_user(self, username: str, email: str, password: str, 
                   first_name: str = None, last_name: str = None) -> Optional[int]:
        """創建新用戶"""
        try:
            password_hash = self._hash_password(password)
            
            if self.db_type == 'sqlite':
                with sqlite3.connect(self.db_path) as conn:
                    cursor = conn.cursor()
                    cursor.execute('''
                        INSERT INTO permission_users 
                        (username, email, password_hash, first_name, last_name)
                        VALUES (?, ?, ?, ?, ?)
                    ''', (username, email, password_hash, first_name, last_name))
                    conn.commit()
                    return cursor.lastrowid
            
            return None
        except Exception as e:
            logger.error(f"Create user error: {e}")
            return None