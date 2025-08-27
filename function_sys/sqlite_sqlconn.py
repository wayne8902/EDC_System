# -*- coding: utf-8 -*-
"""
SQLite compatible version of sqlconn
Created based on function_sys/sqlconn.py
"""

import sqlite3
import json
import random
from datetime import datetime, timedelta, date
import os


class sqlite_sqlconn:
    db = None
    db_path = None

    def __init__(self, host, port, user, passwd, dbname):
        self.db_path = "databases/" + dbname + ".db"
        print(f"init: path={self.db_path}")
        if self.connect():
            pass
        else:
            print("connect fault.")

    def connect(self):
        try:
            self.db = sqlite3.connect(self.db_path, check_same_thread=False)
            # 設定 row_factory 讓結果更像其他資料庫
            self.db.row_factory = sqlite3.Row
            return True
        except Exception as e:
            print(f"connect fault: {e}")
            return False

    def dc(self):
        if self.db:
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
        List of results or error message.
        """
        if isinstance(informations, list):
            info = ",".join([f'"{col}"' for col in informations])
        elif informations == '*':
            info = informations
        else:
            info = informations

        query = f'SELECT {info} FROM "{sheet}"'

        if criteria is not None:
            query = query + " WHERE " + criteria

        if order != "":
            query = query + f" ORDER BY {order}"

        try:
            if verbose:
                print("Query String(Search): " + query)
            cursor = self.db.cursor()
            cursor.execute(query)
            results = cursor.fetchall()
            # 轉換為 tuple 格式以保持與原始版本的相容性
            return [tuple(row) for row in results]
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

        columns = ",".join([f'"{col}"' for col in informations])
        placeholders = ",".join(["?"] * len(values))
        query = f'INSERT INTO "{sheet}"({columns}) VALUES({placeholders})'

        if verbose:
            print("Query String(Insert): " + query)
            print("Values: ", values)

        try:
            cursor = self.db.cursor()
            cursor.execute(query, values)
            self.db.commit()
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
        searchquery = f'SELECT * FROM "{sheet}" WHERE {criteria}'
        if verbose:
            print("Query String(update-confirm): " + searchquery)

        try:
            cursor = self.db.cursor()
            cursor.execute(searchquery)
            results = cursor.fetchall()
        except Exception as e:
            return f"error occurs when search data: {e}"

        if len(results) == 0:
            return f"no such data {criteria} contain in sheet {sheet}"
        elif len(results) > 1:
            return "multiple data found, the process is stopped."

        query = f'UPDATE "{sheet}" SET {informations} WHERE {criteria}'
        if verbose:
            print("Query String(update): " + query)

        try:
            cursor = self.db.cursor()
            cursor.execute(query)
            self.db.commit()
        except Exception as err:
            self.db.rollback()
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
        searchquery = f'SELECT * FROM "{sheet}" WHERE {criteria}'
        if verbose:
            print("Query String(delete-confirm): " + searchquery)

        try:
            cursor = self.db.cursor()
            cursor.execute(searchquery)
            results = cursor.fetchall()
        except Exception as e:
            return f"error occurs when search data: {e}"

        if len(results) == 0:
            return f"no such data {criteria} contain in sheet {sheet}"
        elif len(results) > 1:
            return "multiple data found, the process is stopped."

        query = f'DELETE FROM "{sheet}" WHERE {criteria}'
        if verbose:
            print("Query String(delete): " + query)

        try:
            cursor = self.db.cursor()
            cursor.execute(query)
            self.db.commit()
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
                return [tuple(row) for row in results]
            else:
                # 對於 INSERT, UPDATE, DELETE 等操作
                self.db.commit()
                return cursor.rowcount

        except Exception as e:
            self.db.rollback()
            print(f"Raw query error: {e}")
            return f"error occurs: {e}"

    def create_tables_from_sql(self, sql_file_path, verbose=0):
        """
        從 SQL 檔案建立資料表
        
        Parameters
        ----------
        sql_file_path : string
            SQL 檔案路徑
        verbose: 
            0 or False: don't display query
            1 or True: display query
        """
        try:
            with open(sql_file_path, 'r', encoding='utf-8') as f:
                sql_content = f.read()

            # 將 MySQL 語法轉換為 SQLite 語法
            sql_content = self._convert_mysql_to_sqlite(sql_content)

            # 分割 SQL 語句
            statements = [
                stmt.strip() for stmt in sql_content.split(';')
                if stmt.strip()
            ]

            cursor = self.db.cursor()
            for statement in statements:
                if statement.upper().startswith(('CREATE', 'INSERT', 'ALTER')):
                    if verbose:
                        print("Executing:", statement)
                    cursor.execute(statement)

            self.db.commit()
            print(f"Successfully created tables from {sql_file_path}")

        except Exception as e:
            self.db.rollback()
            print(f"Error creating tables: {e}")

    def _convert_mysql_to_sqlite(self, sql_content):
        """
        將 MySQL 語法轉換為 SQLite 語法
        """
        # 移除 MySQL 特定的語法
        sql_content = sql_content.replace('AUTO_INCREMENT', 'AUTOINCREMENT')
        sql_content = sql_content.replace('ENGINE=InnoDB', '')
        sql_content = sql_content.replace('DEFAULT CHARSET=utf8mb4', '')
        sql_content = sql_content.replace('COLLATE=utf8mb4_0900_ai_ci', '')

        # 移除 MySQL 的註解語法
        lines = sql_content.split('\n')
        cleaned_lines = []
        for line in lines:
            if not line.strip().startswith(
                    '/*!') and not line.strip().startswith('--'):
                if 'SET SQL_MODE' not in line and 'START TRANSACTION' not in line:
                    cleaned_lines.append(line)

        return '\n'.join(cleaned_lines)
