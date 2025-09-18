# -*- coding: utf-8 -*-
"""
Created on Fri Sep 27 19:29:09 2024

@author: lc123
"""

import pymysql
import json
import random
from datetime import datetime,timedelta,date
# try:
#     with open('.config', 'r') as f:
#         config=json.load(f)
# except:
#     config={'sql_host':'localhost',
#             'sql_port':3306,
#             'sql_user':'test',
#             'sql_passwd':'test@unitedkhh',
#             'sql_dbname':'istone_finance_db'}
class sqlconn:
    db=None
    host=None
    port=3306
    dbname=None
    user='root'
    passwd=''
    def __init__(self,host,port,user,passwd,dbname):
        self.host=host
        self.port=int(port)
        self.user=user
        self.passwd=passwd
        self.dbname=dbname
        if self.connect():
            # print(f"connect server {host} with db {dbname}, user={user}")
            pass
        else:
            print("connect fault.")
        
    def connect(self,charset='utf8'):
        try:
            self.db=pymysql.connect(host=self.host, port=self.port, user=self.user, 
                                    passwd=self.passwd,db=self.dbname, charset=charset)
            # print(f"connect server {self.host} with db {self.dbname}, user={self.user}")
            return True
        except:
            print("connect fault."+f"server {self.host} with db {self.dbname}, user={self.user}")
            return False
    def dc(self):
        # print('disconnect db!')
        if self.db.open:
            self.db.close()
    def search(self,sheet,informations='*',criteria=None,verbose=0,order=""):
        """
        Parameters
        ----------
        sheet : string
            target data sheet.
        informations : list or string, optional
            The items query from db, ex: ['id','name'] or "'id','name'". 
            The default is '*'.
        criteria : string, optional
            The condition for filtering, ex: " 'ID'='1130001' AND 'date'='20240908' ". 
            The default is None.
        verbose: 
            0 or False: don't display query
            1 or True: display query

        Returns
        -------
        None.

        """
        if isinstance(informations,list):
            info=",".join(informations)
        elif informations=='*':
            info=informations            
        else:
            info=informations
            
        if "JOIN" in sheet.upper():
            from_sql = sheet
        else:
            from_sql = f"`{sheet}`"
        query=f"SELECT  {info} FROM {from_sql}"
        if criteria!=None:            
            query=query+" WHERE " + criteria
        if(order!=""):
            query=query+ f" ORDER BY {order}"
        try:
            if verbose:
                print("Query String(Search): "+query)
            cursor = self.db.cursor()
            cursor.execute(query)# 执行SQL语句
            results = cursor.fetchall()   # 获取所有记录列表
            return results
        except:
            return "error occurs!"
    def insert(self,sheet,informations,values,verbose=0,auto_commit=True):
        """      
        Parameters
        ----------
        sheet : string
            target data sheet..
        informations : list
            column names.
        values : list
            value lists.
        verbose: 
            0 or False: don't display query
            1 or True: display query

        Raises
        ------
        Exception
            DESCRIPTION.

        Returns
        -------
        None.

        """
        if len(informations)!=len(values):
            raise Exception("value and index mismatch")
        
        # 處理 None 值，將其轉換為 NULL
        processed_values = []
        for value in values:
            if value is None:
                processed_values.append('NULL')
            else:
                # 轉義單引號以防止 SQL 注入
                escaped_value = str(value).replace("'", "''")
                processed_values.append(f"'{escaped_value}'")
        
        query= f"INSERT INTO {sheet}("+",".join(informations)+") VALUES("+",".join(processed_values)+")"
        if verbose:
            print("Query String(Insert): "+query)
        try:
            cursor = self.db.cursor()
            cursor.execute(query)
            if auto_commit:
                self.db.commit()
            return True
        except Exception as err:
            if auto_commit:
                self.db.rollback()
            print("fault! err=",err)
            return False
    def update(self,sheet,informations,criteria=None,verbose=0):
        """        

        Parameters
        ----------
        sheet : TYPE
            DESCRIPTION.
        informations : string, 
            DESCRIPTION. 
        criteria : TYPE, optional
            DESCRIPTION. The default is None.
        verbose: 
            0 or False: don't display query
            1 or True: display query

        Returns
        -------
        None.

        """
        searchquery= f"SELECT * FROM {sheet} WHERE {criteria}"
        if verbose:
            print("Query String(update-confirm): "+searchquery)
        try:
            
            cursor = self.db.cursor()
            cursor.execute(searchquery)# 执行SQL语句
            results = cursor.fetchall()   # 获取所有记录列表
        except:
            return "error occurs when search data!"
        if len(results)==0:
            return f"no such data {criteria} contain in sheet {sheet}"
        elif len(results)>1:
            return "multiple data found, the process is stopped."
        
        query= f"UPDATE {sheet} SET {informations} WHERE {criteria}"
        if verbose:
            print("Query String(update): "+query)
        try:
            cursor = self.db.cursor()
            cursor.execute(query)
            self.db.commit()
        except Exception as err:
            self.db.rollback()
            print("fault! err=",err)
    def delete(self,sheet,criteria=None,verbose=0):
        """        

        Parameters
        ----------
        sheet : TYPE
            DESCRIPTION.
        criteria : TYPE, optional
            DESCRIPTION. The default is None.
        verbose: 
            0 or False: don't display query
            1 or True: display query

        Returns
        -------
        None.

        """
        searchquery= f"SELECT * FROM {sheet} WHERE {criteria}"
        if verbose:
            print("Query String(delete-confirm): "+searchquery)
        try:
            cursor = self.db.cursor()
            cursor.execute(searchquery)# 执行SQL语句
            results = cursor.fetchall()   # 获取所有记录列表
        except:
            return "error occurs when search data!"
        if len(results)==0:
            return f"no such data {criteria} contain in sheet {sheet}"
        elif len(results)>1:
            return "multiple data found, the process is stopped."
        
        
        query= f"DELETE FROM {sheet} WHERE {criteria}"
        if verbose:
            print("Query String(delete): "+query)
        try:
            cursor = self.db.cursor()
            cursor.execute(query)
            self.db.commit()
        except Exception as err:
            self.db.rollback()
            print("fault! err=",err)
            
        
    def execute(self, query, verbose=0):
        """
        執行自定義 SQL 查詢
        
        Parameters
        ----------
        query : string
            要執行的 SQL 查詢語句
        verbose : int, optional
            0 或 False: 不顯示查詢
            1 或 True: 顯示查詢
            
        Returns
        -------
        bool or list
            成功時返回 True 或查詢結果，失敗時返回 False
        """
        if verbose:
            print("Query String(Execute): " + query)
        
        try:
            cursor = self.db.cursor()
            cursor.execute(query)
            
            # 如果是 SELECT 查詢，返回結果
            if query.strip().upper().startswith('SELECT'):
                results = cursor.fetchall()
                return results
            else:
                # 非 SELECT 查詢，返回成功狀態
                return True
                
        except Exception as err:
            print("Execute fault! err=", err)
            return False


# In[]
# sql=sqlconn('localhost',3306,'pei','harry60073','istone_finance_db')
# sql=sqlconn(config['sql_host'],config['sql_port'],config['sql_user'],config['sql_passwd'],config['sql_dbname'])
# result=sql.search('user')

