
# -*- coding: utf-8 -*-
"""
Database Factory - 根據配置自動選擇適當的資料庫連接
"""

import os
import json
from .sqlconn import sqlconn
from .pg_sqlconn import pg_sqlconn
from .sqlite_sqlconn import sqlite_sqlconn

class DatabaseFactory:
    """
    資料庫工廠類別，根據環境變數或配置檔案自動選擇適當的資料庫連接
    """
    
    @staticmethod
    def create_connection(config_path=None, db_type=None):
        """
        建立資料庫連接
        
        Parameters
        ----------
        config_path : string, optional
            配置檔案路徑
        db_type : string, optional
            強制指定資料庫類型 ('mysql', 'postgresql', 'sqlite')
            
        Returns
        -------
        資料庫連接物件
        """
        
        # 1. 檢查環境變數 DATABASE_URL (Replit PostgreSQL)
        if os.environ.get('DATABASE_URL') and not db_type:
            print("使用 Replit PostgreSQL 連接")
            return pg_sqlconn('', 5432, '', '', '')
        
        # 2. 根據 db_type 參數選擇
        if db_type == 'sqlite':
            db_path = os.environ.get('SQLITE_DB_PATH', 'database.db')
            print(f"使用 SQLite 連接: {db_path}")
            return sqlite_sqlconn(db_path)
            
        elif db_type == 'postgresql':
            # 從環境變數讀取 PostgreSQL 配置
            host = os.environ.get('PG_HOST', 'localhost')
            port = int(os.environ.get('PG_PORT', 5432))
            user = os.environ.get('PG_USER', 'postgres')
            passwd = os.environ.get('PG_PASSWORD', '')
            dbname = os.environ.get('PG_DATABASE', 'postgres')
            print(f"使用 PostgreSQL 連接: {host}:{port}")
            return pg_sqlconn(host, port, user, passwd, dbname)
            
        elif db_type == 'mysql':
            # 從配置檔案或環境變數讀取 MySQL 配置
            if config_path and os.path.exists(config_path):
                with open(config_path, 'r') as f:
                    config = json.load(f)
                print(f"使用 MySQL 連接 (配置檔案): {config['sql_host']}")
                return sqlconn(
                    config['sql_host'],
                    config['sql_port'],
                    config['sql_user'],
                    config['sql_passwd'],
                    config['sql_dbname']
                )
            else:
                # 從環境變數讀取
                host = os.environ.get('MYSQL_HOST', 'localhost')
                port = int(os.environ.get('MYSQL_PORT', 3306))
                user = os.environ.get('MYSQL_USER', 'root')
                passwd = os.environ.get('MYSQL_PASSWORD', '')
                dbname = os.environ.get('MYSQL_DATABASE', 'test')
                print(f"使用 MySQL 連接 (環境變數): {host}:{port}")
                return sqlconn(host, port, user, passwd, dbname)
        
        # 3. 自動偵測 (根據配置檔案)
        if config_path and os.path.exists(config_path):
            with open(config_path, 'r') as f:
                config = json.load(f)
            print(f"使用 MySQL 連接 (自動偵測): {config['sql_host']}")
            return sqlconn(
                config['sql_host'],
                config['sql_port'],
                config['sql_user'],
                config['sql_passwd'],
                config['sql_dbname']
            )
        
        # 4. 預設使用 SQLite
        print("使用預設 SQLite 連接")
        return sqlite_sqlconn('database.db')

    @staticmethod
    def create_from_config(config_path):
        """
        從配置檔案建立連接 (向後相容)
        """
        return DatabaseFactory.create_connection(config_path=config_path)

    @staticmethod
    def setup_sqlite_from_mysql_sql(sql_file_path, db_path='database.db'):
        """
        從 MySQL SQL 檔案建立 SQLite 資料庫
        
        Parameters
        ----------
        sql_file_path : string
            MySQL SQL 檔案路徑
        db_path : string
            SQLite 資料庫檔案路徑
            
        Returns
        -------
        SQLite 連接物件
        """
        # 如果資料庫檔案已存在，詢問是否覆蓋
        if os.path.exists(db_path):
            print(f"警告: 資料庫檔案 {db_path} 已存在")
            response = input("是否要覆蓋現有資料庫? (y/N): ")
            if response.lower() != 'y':
                print("取消建立資料庫")
                return None
            os.remove(db_path)
        
        # 建立新的 SQLite 連接
        conn = sqlite_sqlconn(db_path)
        
        # 從 SQL 檔案建立資料表
        conn.create_tables_from_sql(sql_file_path, verbose=True)
        
        print(f"成功建立 SQLite 資料庫: {db_path}")
        return conn
