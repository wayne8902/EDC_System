# Corrected the criteria processing in the delete method to handle numeric values correctly.
# -*- coding: utf-8 -*-
"""
PostgreSQL compatible version of sqlconn
Created based on function_sys/sqlconn.py
"""

import psycopg2
import psycopg2.extras
import json
import random
from datetime import datetime, timedelta, date
import os


class pg_sqlconn:
    db = None
    host = None
    port = 5432
    dbname = None
    user = 'postgres'
    passwd = ''

    def __init__(self, host, port, user, passwd, dbname):
        self.host = host
        self.port = int(port)
        self.user = user
        self.passwd = passwd
        self.dbname = dbname
        if self.connect():
            pass
        else:
            print("connect fault.")

    def connect(self):
        try:
            # 使用環境變數 DATABASE_URL 如果可用，否則使用傳入的參數
            database_url = os.environ.get('DATABASE_URL')
            if database_url:
                self.db = psycopg2.connect(database_url)
            else:
                self.db = psycopg2.connect(host=self.host,
                                           port=self.port,
                                           user=self.user,
                                           password=self.passwd,
                                           database="neondb")
            return True
        except Exception as e:
            print(f"connect fault: {e}")
            print(
                f"server {self.host} with db {self.dbname}, user={self.user}")
            return False

    def dc(self):
        if self.db and not self.db.closed:
            self.db.close()

    def search(self,
               sheet,
               informations='*',
               criteria=None,
               verbose=0,
               order=""):
        """
        Parameters
        ----------
        sheet : string
            target data table.
        informations : list or string, optional
            The items query from db, ex: ['id','name'] or "'id','name'". 
            The default is '*'.
        criteria : string, optional
            The condition for filtering, ex: " 'ID'='1130001' AND 'date'='20240908' ". 
            The default is None.
        verbose: 
            0 or False: don't display query
            1 or True: display query
        order: string, optional
            ORDER BY clause

        Returns
        -------
        Tuple of results or error message.
        """
        if isinstance(informations, list):
            # PostgreSQL 使用雙引號包圍欄位名稱
            info = ",".join([
                f'"{col}"' if not col.startswith('"') else col
                for col in informations
            ])
        elif informations == '*':
            info = informations
        else:
            info = informations

        # PostgreSQL 使用雙引號包圍表名
        query = f'SELECT {info} FROM "{self.dbname}_{sheet}"'

        if criteria is not None:
            # 轉換 MySQL 的反引號為 PostgreSQL 的雙引號
            # 同時處理沒有引號的欄位名稱
            criteria_pg = criteria.replace('`', '"')
            # 處理像 ID='value' 這樣的條件，轉換為 "ID"='value'
            import re
            criteria_pg = re.sub(r'\b([A-Z_][A-Z0-9_]*)\s*=', r'"\1"=',
                                 criteria_pg)
            query = query + " WHERE " + criteria_pg

        if order != "":
            # 轉換 MySQL 的反引號為 PostgreSQL 的雙引號
            order_pg = order.replace('`', '"')
            query = query + f" ORDER BY {order_pg}"

        try:
            if verbose:
                print("Query String(Search): " + query)
            cursor = self.db.cursor()
            cursor.execute(query)
            results = cursor.fetchall()
            cursor.close()
            return results
        except Exception as e:
            print(f"Search error: {e}")
            return "error occurs!"

    def insert(self, sheet, informations, values, verbose=0):
        """      
        Parameters
        ----------
        sheet : string
            target data table.
        informations : list
            column names.
        values : list
            value lists.
        verbose: 
            0 or False: don't display query
            1 or True: display query

        Returns
        -------
        Boolean indicating success.
        """
        if len(informations) != len(values):
            raise Exception("value and index mismatch")

        # PostgreSQL 使用 %s 作為參數佔位符
        columns = ",".join([f'"{col}"' for col in informations])
        placeholders = ",".join(["%s"] * len(values))
        query = f'INSERT INTO "{self.dbname}_{sheet}"({columns}) VALUES({placeholders})'

        if verbose:
            print("Query String(Insert): " + query)
            print("Values: ", values)

        try:
            cursor = self.db.cursor()
            cursor.execute(query, values)
            self.db.commit()
            cursor.close()
            return True
        except Exception as err:
            self.db.rollback()
            print("fault! err=", err)
            return False

    def update(self, sheet, informations, criteria=None, verbose=0):
        """        
        Parameters
        ----------
        sheet : string
            table name
        informations : string 
            SET clause content
        criteria : string, optional
            WHERE clause content
        verbose: 
            0 or False: don't display query
            1 or True: display query

        Returns
        -------
        Result message or None.
        """
        # 先檢查是否存在符合條件的資料
        import re
        criteria_pg = criteria.replace('`', '"')
        # 處理欄位名稱加雙引號，但保持數字值不加引號
        criteria_pg = re.sub(r'\b([A-Z_][A-Z0-9_]*)\s*=\s*"([^"]*)"',
                             r'"\1"=\2', criteria_pg)
        criteria_pg = re.sub(r'\b([A-Z_][A-Z0-9_]*)\s*=(?!=)', r'"\1"=',
                             criteria_pg)
        searchquery = f'SELECT * FROM "{self.dbname}_{sheet}" WHERE {criteria_pg}'
        print("update check #1")
        if verbose:
            print("Query String(update-confirm): " + searchquery)

        try:
            cursor = self.db.cursor()
            cursor.execute(searchquery)
            results = cursor.fetchall()
            cursor.close()
        except Exception as e:
            print("update check #1-1")
            return f"error occurs when search data: {e}"
        #print(results)
        print("update check #2")
        if len(results) == 0:
            return f"no such data {criteria} contain in sheet {self.dbname}_{sheet}"
        elif len(results) > 1:
            return "multiple data found, the process is stopped."

        # 轉換 informations 中的反引號為雙引號
        informations_pg = informations.replace('`', '"')
        # 處理 WHERE 條件中的數字值
        criteria_pg = criteria.replace('`', '"')
        criteria_pg = re.sub(r'\b([A-Z_][A-Z0-9_]*)\s*=\s*"([^"]*)"',
                             r'"\1"=\2', criteria_pg)
        criteria_pg = re.sub(r'\b([A-Z_][A-Z0-9_]*)\s*=(?!=)', r'"\1"=',
                             criteria_pg)
        print("update check #3")
        query = f'UPDATE "{self.dbname}_{sheet}" SET {informations_pg} WHERE {criteria_pg}'
        if verbose:
            print("update check #3-1")
            print("Query String(update): " + query)

        try:
            cursor = self.db.cursor()
            cursor.execute(query)
            self.db.commit()
            cursor.close()
            print("update check #3-2")
        except Exception as err:
            self.db.rollback()
            print("update check #3-3")
            print("fault! err=", err)

    def delete(self, sheet, criteria=None, verbose=0):
        """        
        Parameters
        ----------
        sheet : string
            table name
        criteria : string, optional
            WHERE clause content
        verbose: 
            0 or False: don't display query
            1 or True: display query

        Returns
        -------
        Result message or None.
        """
        # 先檢查是否存在符合條件的資料
        import re
        criteria_pg = criteria.replace('`', '"')
        # 處理欄位名稱加雙引號，但保持數字值不加引號
        criteria_pg = re.sub(r'\b([A-Z_][A-Z0-9_]*)\s*=\s*"([^"]*)"',
                             r'"\1"=\2', criteria_pg)
        criteria_pg = re.sub(r'\b([A-Z_][A-Z0-9_]*)\s*=(?!=)', r'"\1"=',
                             criteria_pg)
        searchquery = f'SELECT * FROM "{self.dbname}_{sheet}" WHERE {criteria_pg}'
        if verbose:
            print("Query String(delete-confirm): " + searchquery)

        try:
            cursor = self.db.cursor()
            cursor.execute(searchquery)
            results = cursor.fetchall()
            cursor.close()
        except Exception as e:
            return f"error occurs when search data: {e}"

        if len(results) == 0:
            return f"no such data {criteria} contain in sheet {self.dbname}_{sheet}"
        elif len(results) > 1:
            return "multiple data found, the process is stopped."

        criteria_pg = criteria.replace('`', '"')
        query = f'DELETE FROM "{self.dbname}_{sheet}" WHERE {criteria_pg}'
        if verbose:
            print("Query String(delete): " + query)

        try:
            cursor = self.db.cursor()
            cursor.execute(query)
            self.db.commit()
            cursor.close()
        except Exception as err:
            self.db.rollback()
            print("fault! err=", err)

    def execute_raw(self, query, params=None, verbose=0):
        """
        執行原始 SQL 查詢

        Parameters
        ----------
        query : string
            SQL 查詢語句
        params : tuple or list, optional
            查詢參數
        verbose: 
            0 or False: don't display query
            1 or True: display query

        Returns
        -------
        查詢結果或錯誤訊息
        """
        if verbose:
            print("Query String(Raw): " + query)
            if params:
                print("Parameters: ", params)

        try:
            cursor = self.db.cursor()
            if params:
                cursor.execute(query, params)
            else:
                cursor.execute(query)

            # 如果是 SELECT 查詢，返回結果
            if query.strip().upper().startswith('SELECT'):
                results = cursor.fetchall()
                cursor.close()
                return results
            else:
                # 對於 INSERT, UPDATE, DELETE 等操作
                self.db.commit()
                affected_rows = cursor.rowcount
                cursor.close()
                return affected_rows

        except Exception as e:
            self.db.rollback()
            print(f"Raw query error: {e}")
            return f"error occurs: {e}"

    def get_columns(self, sheet, verbose=0):
        """
        取得資料表的欄位資訊

        Parameters
        ----------
        sheet : string
            table name
        verbose: 
            0 or False: don't display query
            1 or True: display query

        Returns
        -------
        欄位資訊列表
        """
        query = """
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = %s
        ORDER BY ordinal_position
        """

        if verbose:
            print("Query String(Get Columns): " + query)

        try:
            cursor = self.db.cursor()
            cursor.execute(query, (sheet, ))
            results = cursor.fetchall()
            cursor.close()
            return results
        except Exception as e:
            print(f"Get columns error: {e}")
            return f"error occurs: {e}"
