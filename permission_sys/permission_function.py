"""
Permission Function - 權限管理核心功能
"""

import json
import logging
from datetime import datetime, timedelta
import sys
import os
from dotenv import load_dotenv
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'signed'))
from function_sys.sqlconn import sqlconn


class permission_db:
    """
    權限資料庫操作類別
    """
    sql = None
    sessions = dict()
    column_id = {'config': ['KEY', 'VALUE']}
    cookies = dict()
    config = dict()

    def __init__(self):
        print("+++++++ INIT Permission ++++++")
        logging.info("permission_db/config path: " + os.path.join(os.path.dirname(__file__), 'config'))
        try:
            # 載入環境變數
            load_dotenv("permission_sys/.env")
            self.config = {
                'sql_host': os.getenv('PERMISSION_SQL_HOST', 'localhost'),
                'sql_port': int(os.getenv('PERMISSION_SQL_PORT', 3306)),
                'sql_user': os.getenv('PERMISSION_SQL_USER'),
                'sql_passwd': os.getenv('PERMISSION_SQL_PASSWD'),
                'sql_dbname': os.getenv('PERMISSION_SQL_DBNAME')
            }
        except:
            with open(os.path.join(os.path.dirname(__file__), 'config.json'), 'r') as f:
                self.config=json.load(f)
        print(self.config)
        self.sql=sqlconn(self.config['sql_host'],self.config['sql_port'],self.config['sql_user'],self.config['sql_passwd'],self.config['sql_dbname'])
        self.get_col_id()
        self.disconnect()
    
    def connect_sql(self):
        return sqlconn(self.config['sql_host'],self.config['sql_port'],self.config['sql_user'],self.config['sql_passwd'],self.config['sql_dbname'])
    def connect(self):
        self.sql=sqlconn(self.config['sql_host'],self.config['sql_port'],self.config['sql_user'],self.config['sql_passwd'],self.config['sql_dbname'])
    def disconnect(self):
        self.sql.dc()
    def __del__(self):
        pass
    
    def get_col_id(self):        
        try:
            result = self.sql.search('config',['VALUE'], criteria="`ID` = 'column_id_permission'")
            self.column_id['Permissions'] = result[0][0].split(',')
            print("Col ID: ", self.column_id['Permissions'])
        except:
            raise Exception("Error occurs when getting config: 'column_id_permission'")
    
    def _ensure_permission_tables(self):
        """確保權限系統相關表存在"""
        try:
            sql = self.connect_sql()
            # 檢查是否存在權限表，如果不存在則創建
            tables_to_check = [
                'Aaudit_logs',
                'config',
                'Permissions', 
                'Roles',
                'User_permissions',
                'User_roles'
            ]
            
            for table in tables_to_check:
                result = sql.search('information_schema.tables', 
                                        criteria=f"TABLE_NAME='{table}' AND TABLE_SCHEMA='{self.config['sql_dbname']}'",
                                        verbose=0)
                
                if not result['data']:
                    print(f"Table {table} not found, creating...")
                    self._create_permission_table(table)
            
            sql.dc()
                    
        except Exception as e:
            logging.warning(f"Error checking/creating permission tables: {e}")
    
    def _create_permission_table(self, table_name):
        """創建權限系統表"""
        if table_name == 'Roles':
            sql = """
            CREATE TABLE Roles (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL UNIQUE,
                description TEXT,
                permissions TEXT COMMENT 'JSON array of permission names',
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
            """
        elif table_name == 'Permissions':
            sql = """
            CREATE TABLE Permissions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL UNIQUE,
                resource VARCHAR(100) NOT NULL,
                action VARCHAR(50) NOT NULL,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
            """
        elif table_name == 'User_roles':
            sql = """
            CREATE TABLE User_roles (
                id INT AUTO_INCREMENT PRIMARY KEY,
                UNIQUE_ID VARCHAR(50) NOT NULL COMMENT 'Reference to user.UNIQUE_ID',
                role_id INT NOT NULL,
                assigned_by VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (role_id) REFERENCES Roles(id) ON DELETE CASCADE,
                UNIQUE KEY unique_user_role (UNIQUE_ID, role_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
            """
        elif table_name == 'User_permissions':
            sql = """
            CREATE TABLE User_permissions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                UNIQUE_ID VARCHAR(50) NOT NULL COMMENT 'Reference to user.UNIQUE_ID',
                permission_name VARCHAR(100) NOT NULL,
                granted_by VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY unique_user_permission (UNIQUE_ID, permission_name)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
            """
        elif table_name == 'Aaudit_logs':
            sql = """
            CREATE TABLE Aaudit_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                UNIQUE_ID VARCHAR(50) NOT NULL,
                action VARCHAR(100) NOT NULL,
                permission VARCHAR(100),
                result BOOLEAN,
                details TEXT,
                ip_address VARCHAR(45),
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_user (UNIQUE_ID),
                INDEX idx_action (action),
                INDEX idx_timestamp (timestamp)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
            """
        else:
            sql = None
        
        try:
            sql_conn = self.connect_sql()
            cursor = sql_conn.db.cursor()
            cursor.execute(sql)
            sql_conn.db.commit()
            logging.info(f"Created permission table: {table_name}")
            sql_conn.dc()
        except Exception as e:
            logging.error(f"Error creating table {table_name}: {e}")
            # 嘗試回滾事務
            try:
                if 'sql_conn' in locals():
                    sql_conn.db.rollback()
                    sql_conn.dc()
            except:
                pass
    
    def check_user_permission(self, user_id, permission, resource_id=None, verbose=False):
        print("+++++++ check_user_permission ++++++")
        """
        檢查用戶是否擁有特定權限
        
        參數:
            user_id: 用戶 UNIQUE_ID
            permission: 權限名稱 (如: 'users.create')
            resource_id: 可選，資源 ID (用於資源級別權限檢查)
            verbose: 是否詳細輸出
        
        回傳:
            {
                'status': 'success',
                'has_permission': True/False,
                'user_id': user_id,
                'permission': permission,
                'source': 'role' or 'direct' or 'none'
            }
        """
        try:
            sql = self.connect_sql()
            # 首先檢查用戶是否存在且活躍
            user_result = sql.search(
                'LeaveUsers LU LEFT JOIN united_khh.user U ON LU.USER = U.UNIQUE_ID',
                ['LU.USER', 'U.NAME', 'U.DUEDATE'],
                criteria=f"LU.USER='{user_id}' AND (U.DUEDATE IS NULL OR U.DUEDATE >= CURDATE())",
                verbose=0
            )
            
            if not user_result or len(user_result) == 0:
                print("User not found or inactive")
                sql.dc()
                return {
                    'status': 'error',
                    'has_permission': False,
                    'user_id': user_id,
                    'permission': permission,
                    'message': 'User not found or inactive'
                }
            
            # 檢查直接權限
            direct_perm_result = sql.search(
                'User_permissions',
                criteria=f"`UNIQUE_ID`='{user_id}' AND `permission_name`='{permission}'",
                verbose=0
            )
            
            if direct_perm_result:
                if verbose:
                    logging.info(f"User {user_id} has direct permission: {permission}")
                sql.dc()
                return {
                    'status': 'success',
                    'has_permission': True,
                    'user_id': user_id,
                    'permission': permission,
                    'source': 'direct'
                }
            
            # 檢查角色權限
            user_roles = sql.search(
                'Roles r JOIN User_roles ur ON r.id = ur.role_id',
                ['r.name', 'r.permissions'],
                criteria=f"ur.UNIQUE_ID = '{user_id}' AND r.is_active = TRUE",
                verbose=0
            )
            
            for role_name, role_permissions_json in user_roles:
                try:
                    role_permissions = json.loads(role_permissions_json or '[]')
                    if permission in role_permissions:
                        if verbose:
                            logging.info(f"User {user_id} has permission {permission} via role: {role_name}")
                        return {
                            'status': 'success',
                            'has_permission': True,
                            'user_id': user_id,
                            'permission': permission,
                            'source': 'role',
                            'role': role_name
                        }
                except json.JSONDecodeError:
                    continue
            
            # 檢查萬用字元權限 (如 users.* 包含 users.create)
            if '.' in permission:
                resource = permission.split('.')[0]
                wildcard_permission = f"{resource}.*"
                
                # 檢查直接萬用字元權限
                wildcard_direct = sql.search(
                    'User_permissions',
                    criteria=f"UNIQUE_ID='{user_id}' AND permission_name='{wildcard_permission}'",
                    verbose=0
                )
                
                if wildcard_direct and len(wildcard_direct) > 0:
                    if verbose:
                        logging.info(f"User {user_id} has wildcard direct permission: {wildcard_permission}")
                    return {
                        'status': 'success',
                        'has_permission': True,
                        'user_id': user_id,
                        'permission': permission,
                        'source': 'direct_wildcard'
                    }
                
                # 檢查角色萬用字元權限
                for role_name, role_permissions_json in user_roles:
                    try:
                        role_permissions = json.loads(role_permissions_json or '[]')
                        if wildcard_permission in role_permissions:
                            if verbose:
                                logging.info(f"User {user_id} has wildcard permission {wildcard_permission} via role: {role_name}")
                            return {
                                'status': 'success',
                                'has_permission': True,
                                'user_id': user_id,
                                'permission': permission,
                                'source': 'role_wildcard',
                                'role': role_name
                            }
                    except json.JSONDecodeError:
                        continue
            
            # 檢查超級管理員權限
            super_admin_check = sql.search(
                'User_permissions',
                criteria=f"UNIQUE_ID='{user_id}' AND permission_name='system.admin'",
                verbose=0
            )
            
            if super_admin_check and len(super_admin_check) > 0:
                if verbose:
                    logging.info(f"User {user_id} has super admin permission")
                sql.dc()
                return {
                    'status': 'success',
                    'has_permission': True,
                    'user_id': user_id,
                    'permission': permission,
                    'source': 'super_admin'
                }
            
            # 檢查角色中的超級管理員權限
            for role_name, role_permissions_json in user_roles:
                try:
                    role_permissions = json.loads(role_permissions_json or '[]')
                    if 'system.admin' in role_permissions:
                        if verbose:
                            logging.info(f"User {user_id} has super admin permission via role: {role_name}")
                        return {
                            'status': 'success',
                            'has_permission': True,
                            'user_id': user_id,
                            'permission': permission,
                            'source': 'role_super_admin',
                            'role': role_name
                        }
                except json.JSONDecodeError:
                    continue
            
            # 沒有找到權限
            if verbose:
                logging.info(f"User {user_id} does not have permission: {permission}")
            
            sql.dc()
            return {
                'status': 'success',
                'has_permission': False,
                'user_id': user_id,
                'permission': permission,
                'source': 'none'
            }
            
        except Exception as e:
            logging.error(f"Error checking permission for user {user_id}: {e}")
            # 確保在異常情況下也斷開連接
            try:
                if 'sql' in locals():
                    sql.dc()
            except:
                pass
            return {
                'status': 'error',
                'has_permission': False,
                'user_id': user_id,
                'permission': permission,
                'message': str(e)
            }
    
    def get_user_all_permissions(self, user_id, verbose=False):
        """
        獲取用戶的所有權限
        
        回傳:
            {
                'status': 'success',
                'user_id': user_id,
                'permissions': ['users.view', 'signin.create', ...],
                'roles': [{'name': 'employee', 'permissions': [...]}],
                'direct_permissions': ['custom.permission']
            }
        """
        try:
            sql = self.connect_sql()
            all_permissions = set()
            user_roles = []
            direct_permissions = []
            
            # 獲取直接權限
            direct_result = sql.search(
                'User_permissions',
                informations='permission_name',
                criteria=f"`UNIQUE_ID`='{user_id}'",
                verbose=0
            )
            
            for perm_data in direct_result:
                direct_permissions.append(perm_data[0])
                all_permissions.add(perm_data[0])
            
            # 獲取角色權限
            role_data = sql.search(
                'Roles r JOIN User_roles ur ON r.id = ur.role_id',
                ['r.name', 'r.description', 'r.permissions'],
                criteria=f"ur.UNIQUE_ID = '{user_id}' AND r.is_active = TRUE",
                verbose=0
            )
            
            for role_name, role_desc, role_permissions_json in role_data:
                try:
                    role_permissions = json.loads(role_permissions_json or '[]')
                    user_roles.append({
                        'name': role_name,
                        'description': role_desc,
                        'permissions': role_permissions
                    })
                    all_permissions.update(role_permissions)
                except json.JSONDecodeError:
                    continue
            
            result = {
                'status': 'success',
                'user_id': user_id,
                'permissions': list(all_permissions),
                'roles': user_roles,
                'direct_permissions': direct_permissions,
                'total_permissions': len(all_permissions)
            }
            
            if verbose:
                logging.info(f"User {user_id} total permissions: {len(all_permissions)}")
            
            sql.dc()
            return result
            
        except Exception as e:
            logging.error(f"Error getting user permissions for {user_id}: {e}")
            return {
                'status': 'error',
                'user_id': user_id,
                'message': str(e)
            }
    
    def assign_user_role(self, user_id, role_name, assigned_by, verbose=False):
        """分配角色給用戶"""
        try:
            sql = self.connect_sql()
            # 檢查角色是否存在
            role_result = sql.search(
                'Roles',
                informations='id',
                criteria=f"name='{role_name}' AND is_active=TRUE",
                verbose=0
            )
            
            if not role_result or len(role_result) == 0:
                return {
                    'status': 'error',
                    'success': False,
                    'message': f'Role {role_name} not found or inactive'
                }
            
            role_id = role_result[0][0]
            
            # 檢查用戶是否已有此角色
            existing_result = sql.search(
                'User_roles',
                criteria=f"UNIQUE_ID='{user_id}' AND role_id={role_id}",
                verbose=0
            )
            
            if existing_result and len(existing_result) > 0:
                return {
                    'status': 'success',
                    'success': True,
                    'message': f'User already has role {role_name}'
                }
            
            # 分配角色
            cursor = sql.db.cursor()
            insert_sql = """
                INSERT INTO User_roles (UNIQUE_ID, role_id, assigned_by) 
                VALUES (%s, %s, %s)
            """
            cursor.execute(insert_sql, (user_id, role_id, assigned_by))
            sql.db.commit()
            
            if verbose:
                logging.info(f"Assigned role {role_name} to user {user_id} by {assigned_by}")
            
            sql.dc()
            return {
                'status': 'success',
                'success': True,
                'message': f'Role {role_name} assigned successfully'
            }
            
        except Exception as e:
            logging.error(f"Error assigning role {role_name} to user {user_id}: {e}")
            return {
                'status': 'error',
                'success': False,
                'message': str(e)
            }
    
    def grant_direct_permission(self, user_id, permission, granted_by, verbose=False):
        """直接授予用戶權限"""
        try:
            sql = self.connect_sql()
            # 檢查權限是否已存在
            existing_result = sql.search(
                'User_permissions',
                criteria=f"UNIQUE_ID='{user_id}' AND permission_name='{permission}'",
                verbose=0
            )
            
            if existing_result and len(existing_result) > 0:
                return {
                    'status': 'success',
                    'success': True,
                    'message': f'User already has permission {permission}'
                }
            
            # 授予權限
            cursor = sql.db.cursor()
            insert_sql = """
                INSERT INTO User_permissions (UNIQUE_ID, permission_name, granted_by) 
                VALUES (%s, %s, %s)
            """
            cursor.execute(insert_sql, (user_id, permission, granted_by))
            sql.db.commit()
            
            if verbose:
                logging.info(f"Granted permission {permission} to user {user_id} by {granted_by}")
            
            sql.dc()
            return {
                'status': 'success',
                'success': True,
                'message': f'Permission {permission} granted successfully'
            }
            
        except Exception as e:
            logging.error(f"Error granting permission {permission} to user {user_id}: {e}")
            return {
                'status': 'error',
                'success': False,
                'message': str(e)
            }
    
    def log_permission_action(self, user_id, action, permission, result, details="", ip="", timestamp="", verbose=False):
        """記錄權限操作日誌"""
        try:
            if not timestamp:
                timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            
            cursor = self.conn.db.cursor()
            sql = """
                            INSERT INTO Aaudit_logs 
            (UNIQUE_ID, action, permission, result, details, ip_address, timestamp) 
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            """
            cursor.execute(sql, (user_id, action, permission, result, details, ip, timestamp))
            self.conn.db.commit()
            
            if verbose:
                logging.info(f"Logged action: {action} for user {user_id}")
            
        except Exception as e:
            logging.error(f"Error logging permission action: {e}")
    
    def get_audit_logs(self, user_id=None, action=None, limit=50, verbose=False):
        """獲取審計日誌"""
        try:
            criteria_parts = []
            if user_id:
                criteria_parts.append(f"UNIQUE_ID='{user_id}'")
            if action:
                criteria_parts.append(f"action='{action}'")
            
            criteria = " AND ".join(criteria_parts) if criteria_parts else None
            
            result = self.conn.search(
                'Aaudit_logs',
                criteria=criteria,
                verbose=0,
                order="timestamp DESC"
            )
            
            # 限制結果數量
            if result['data'] and len(result['data']) > limit:
                result['data'] = result['data'][:limit]
            
            logs = []
            for log_data in result['data']:
                logs.append({
                    'id': log_data[0],
                    'user_id': log_data[1],
                    'action': log_data[2],
                    'permission': log_data[3],
                    'result': log_data[4],
                    'details': log_data[5],
                    'ip_address': log_data[6],
                    'timestamp': str(log_data[7])
                })
            
            return {
                'status': 'success',
                'logs': logs,
                'total': len(logs)
            }
            
        except Exception as e:
            logging.error(f"Error getting audit logs: {e}")
            return {
                'status': 'error',
                'message': str(e),
                'logs': []
            }
    
    def init_default_permissions_and_roles(self, verbose=False):
        """初始化預設權限和角色"""
        try:
            # 預設權限列表
            default_permissions = [
                ('users.view', 'users', 'view', '查看用戶列表'),
                ('users.create', 'users', 'create', '建立新用戶'),
                ('users.edit', 'users', 'edit', '編輯用戶資料'),
                ('users.delete', 'users', 'delete', '刪除用戶'),
                ('users.admin', 'users', 'admin', '用戶管理員權限'),
                ('roles.view', 'roles', 'view', '查看角色列表'),
                ('roles.create', 'roles', 'create', '建立新角色'),
                ('roles.edit', 'roles', 'edit', '編輯角色'),
                ('roles.delete', 'roles', 'delete', '刪除角色'),
                ('permissions.view', 'permissions', 'view', '查看權限列表'),
                ('audit_logs.view', 'audit_logs', 'view', '查看審計日誌'),
                ('dashboard.view', 'dashboard', 'view', '查看控制台'),
                ('signin.view', 'signin', 'view', '查看簽到記錄'),
                ('signin.create', 'signin', 'create', '簽到'),
                ('signin.admin', 'signin', 'admin', '簽到系統管理'),
                ('leave.view', 'leave', 'view', '查看請假記錄'),
                ('leave.apply', 'leave', 'apply', '申請請假'),
                ('leave.approve', 'leave', 'approve', '審核請假'),
                ('leave.admin', 'leave', 'admin', '請假系統管理'),
                ('system.admin', 'system', 'admin', '系統管理員權限'),
            ]
            
            # 插入權限
            cursor = self.conn.db.cursor()
            for perm_name, resource, action, description in default_permissions:
                try:
                    sql = """
                        INSERT IGNORE INTO Permissions 
                        (name, resource, action, description) 
                        VALUES (%s, %s, %s, %s)
                    """
                    cursor.execute(sql, (perm_name, resource, action, description))
                except Exception as e:
                    logging.warning(f"Error inserting permission {perm_name}: {e}")
            
            # 預設角色
            default_roles = [
                ('super_admin', '超級管理員', [p[0] for p in default_permissions]),
                ('admin', '系統管理員', [
                    'users.view', 'users.create', 'users.edit', 'users.admin',
                    'roles.view', 'roles.create', 'roles.edit',
                    'permissions.view', 'audit_logs.view', 'dashboard.view',
                    'signin.admin', 'leave.admin'
                ]),
                ('manager', '管理者', [
                    'users.view', 'users.edit', 'roles.view',
                    'dashboard.view', 'audit_logs.view',
                    'signin.view', 'signin.admin',
                    'leave.view', 'leave.approve'
                ]),
                ('employee', '員工', [
                    'dashboard.view', 'signin.view', 'signin.create',
                    'leave.view', 'leave.apply'
                ]),
                ('readonly', '只讀用戶', [
                    'dashboard.view', 'signin.view', 'leave.view'
                ])
            ]
            
            # 插入角色
            for role_name, description, permissions in default_roles:
                try:
                    permissions_json = json.dumps(permissions)
                    sql = """
                        INSERT INTO Roles (name, description, permissions) 
                        VALUES (%s, %s, %s)
                        ON DUPLICATE KEY UPDATE 
                        description = VALUES(description),
                        permissions = VALUES(permissions)
                    """
                    cursor.execute(sql, (role_name, description, permissions_json))
                except Exception as e:
                    logging.warning(f"Error inserting role {role_name}: {e}")
            
            self.conn.db.commit()
            
            if verbose:
                logging.info("Default permissions and roles initialized successfully")
            
            return {
                'status': 'success',
                'message': 'Default permissions and roles initialized successfully',
                'permissions_count': len(default_permissions),
                'roles_count': len(default_roles)
            }
            
        except Exception as e:
            logging.error(f"Error initializing default permissions and roles: {e}")
            return {
                'status': 'error',
                'message': str(e)
            }