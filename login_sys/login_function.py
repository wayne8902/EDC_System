# In[]
from function_sys import sqlconn
from function_sys.onedrive_api import sendMail
import hashlib
import os
import json
import logging
from datetime import datetime,timedelta
from dotenv import load_dotenv
from numpy import random
from dotenv import load_dotenv,dotenv_values
logging.basicConfig(level=logging.INFO)


def hash_md5(s,cout_var_name=""):
    if type(s)==bytes:
        h=hashlib.md5(s).hexdigest() 
    elif type(s)==str:
        h=hashlib.md5(s.encode()).hexdigest()
    else:
        raise RuntimeError("hash_md5: input is neigher str nor bytes")
    if cout_var_name!="":
        print(f"md5 {cout_var_name}: {h}")
    return h
def hash_sha256(s,cout_var_name=""):
    if type(s)==bytes:
        h=hashlib.sha256(s).hexdigest() 
    elif type(s)==str:
        h=hashlib.sha256(s.encode()).hexdigest()
    else:
        raise RuntimeError("hash_sha256: input is neigher str nor bytes")
    if cout_var_name!="":
        print(f"md5 {cout_var_name}: {h}")
    return h
class login_db:
    sql=None
    sessions=dict()
    column_id={'config':['KEY','VALUE']}
    cookies=dict()
    config=dict()
    
    def __init__(self):
        logging.info("login_db/config path: "+os.path.join(os.path.dirname(__file__), 'config'));
        try:
            # 載入環境變數
            load_dotenv("login_sys/.env")
            self.config = {
                'sql_host': os.getenv('LOGIN_SQL_HOST', 'localhost'),
                'sql_port': int(os.getenv('LOGIN_SQL_PORT', 3306)),
                'sql_user': os.getenv('LOGIN_SQL_USER'),
                'sql_passwd': os.getenv('LOGIN_SQL_PASSWD'),
                'sql_dbname': os.getenv('LOGIN_SQL_DBNAME')
            }
        except:
            with open(os.path.join(os.path.dirname(__file__), 'config.json'), 'r') as f:
                self.config=json.load(f)
        print(self.config)
        self.sql=sqlconn(self.config['sql_host'],3306,self.config['sql_user'],self.config['sql_passwd'],self.config['sql_dbname'])
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
            result=self.sql.search('config',['VALUE'],criteria="`ID`='column_id_user'")
            self.column_id['user']=result[0][0].split(',')
            #'INDEXNUMBER','USER','EMAIL','ACCESSCODE','VALIDTIME'
            result=self.sql.search('config',['VALUE'],criteria="`ID`='column_id_reset_password'")
            self.column_id['reset_password']=result[0][0].split(',')
        except:
            raise Exception("Error occurs when getting config: 'column_id_user'")
        

    def login_sql(self,user_id,user_otp,rand_text,log="no record",account_type='local',verbose=0):

        """
        

        Parameters
        ----------
        user_id : string
            account name.
        user_otp : string
            One time password: md5(rand_text+md5(password)).
        rand_text : string
            DESCRIPTION.

        Returns
        -------
        dict
            state:bool failed=0 or success=1.
            cookies: user_otp
            due: due time
            

        """
        
        status=500
        sql=self.connect_sql()
        status=400


        if account_type == 'local':
            dbcolumn = 'USER'
            
        elif account_type == 'ms':
            dbcolumn = 'EMAIL'

        result=sql.search('user',self.column_id['user'],criteria=f"`{dbcolumn}`='{user_id}'",verbose=verbose)

        status=204
        index_pwd=self.column_id['user'].index('PASSWORD')
        user=None
        due_time=None
        if verbose:
            logging.info(result)
            # print(result,flush=True)
        for item in result:          
            
            cook=hash_sha256(item[index_pwd]+rand_text)
            
            if user_otp==cook or account_type == 'ms':
                user=item[self.column_id['user'].index('USER')]
                name=item[self.column_id['user'].index('NAME')]

                
                due_time=datetime.now()+ timedelta(minutes = 30)
                due_str=due_time.strftime("%y%m%d%H%M%S")
                cookie=hash_sha256(cook+due_str+str(int(random.random()*1000)))
                
                try:
                    sessionkey=item[self.column_id['user'].index('SESSION_KEY')].split(";")
                    for i in range(len(sessionkey)):
                        if (int(sessionkey[-i-1].split(",")[1])+3000)<int(due_str):
                            if i==0:
                                sessionkey=[]
                            else:
                                sessionkey=sessionkey[-i-1:]
                            break;
                        elif i>4:
                            sessionkey=sessionkey[-4:]
                            break;
                except:
                    sessionkey=[]
                    pass
                try:
                    LOG=item[self.column_id['user'].index('LOGIN_LOG')].split(";")
                    LOG=LOG[-9:]
                except:
                    LOG=[]
                    pass
                LOG.append(log+f",{account_type} login success")
                LOG=";".join(LOG)
                sessionkey.append(cookie+","+due_str)
                sessionkey=";".join(sessionkey)
                res=sql.update('user',f"`SESSION_KEY`='{sessionkey}', `LOGIN_LOG`='{LOG}'" ,f"`{dbcolumn}`='{user_id}'",verbose=verbose)

                if verbose:
                    print(res)
                
                break
            else:
                try:
                    LOG=item[self.column_id['user'].index('LOGIN_FAILED')].split(";")
                    LOG=LOG[-9:]
                except:
                    LOG=[]
                    pass
                LOG.append(log+",failed")
                LOG=";".join(LOG)
                res=sql.update('user',f"LOGIN_FAILED='{LOG}'" ,f"`USER`='{user_id}'",verbose=verbose)
        sql.dc()
        if user==None:
            return {"state":False,"cookies":None,"due":datetime.now()}
        else:
            return{"state":True,"cookies":cookie,"name":name,'user':user,"due":due_time}
    def verification_sql(self,cookie_session,verbose=0):
        now_time=datetime.now()
        now_int=int(now_time.strftime("%y%m%d%H%M%S"))
        
        if cookie_session not in self.sessions:            
            sql=self.connect_sql()            
            result=sql.search('user',informations=self.column_id['user'],criteria=f"`SESSION_KEY` LIKE '%{cookie_session}%'",verbose=verbose)
            sql.dc()
            
            if(len(result)!=1): 
                return {'state':False,"content":"session conflict!"}  
            
            sessionkey=result[0][self.column_id['user'].index('SESSION_KEY')].split(";")
            valid=False
            due_int=0
            for key in sessionkey:
                
                k=key.split(",")
                if(k[0]==cookie_session):
                    # logging.info(f"cookie_session:{cookie_session}")
                    # logging.info(int(k[1]))
                    # logging.info(now_int)
                    if(int(k[1])<now_int):
                        # logging.info("expired")
                        return {'state':False,"content":"session expired!"}
                    valid=True
                    due_int=int(k[1])
                    break;
                elif verbose:
                    print(k[0],", mismatched!")
            if(valid==False):
                return {'state':False,"content":"There is no matched session!"}
            else:
                return {'state':True,"content":"you have been logged in!","id":result[0][self.column_id['user'].index("USER")]}
    def get_account_info(self,user_id,info,verbose=0):
        
        try:
            status=500
            sql=self.connect_sql()
            status=400
            result=sql.search('user',info,criteria=f"`USER`='{user_id}'",verbose=verbose)
            status=204
            sql.dc()
            if len(result)==1:
                return {'status':200,'content':"get account info(s) successfully",'data':result[0]}
        except Exception as e:
            return {'status':status,'content':"error occurs in get_account_info","err_msg":repr(e)}

    def check_account_exist(self,user_id,email,verbose=0):
        #   INDEXNUMBER,USER,EMAIL,ACCESSCODE,VALIDTIME
        try:            
            sql=self.connect_sql()
            status=400
            result=sql.search('user',['ID'],criteria=f"`USER`='{user_id}' AND `EMAIL`='{email}'",verbose=verbose)
            status=204
            sql.dc()
            
            if len(result)==1:
                return {'status':200,'content':"account exist",'result':"OK"}
            else:
                return {'status':204,'content':"account doesn't exist",'result':"failed"}
        except Exception as e:
            return {'status':status,'content':"error occurs in check_account_exist","err_msg":repr(e)}
    def gen_reset_password(self,user_id,email,ACCESSCODE,verbose=0):
        #   INDEXNUMBER,USER,EMAIL,ACCESSCODE,VALIDTIME
        try:
            due_time=datetime.now()+ timedelta(minutes = 30)
            due_str=due_time.strftime("%y%m%d%H%M%S")
            status=500
            sql=self.connect_sql()
            status=400
            result=sql.search('reset_password',['INDEXNUMBER'],criteria=f"`USER`='{user_id}' AND `EMAIL`='{email}'",verbose=verbose)
            if len(result)!=0:
                for i in result:
                    res=sql.delete('reset_password',criteria=f"`INDEXNUMBER`={i[0]} ",verbose=verbose)
            result=sql.insert(sheet='reset_password',informations=['USER','EMAIL','ACCESSCODE','VALIDTIME'],values=[user_id,email,ACCESSCODE,due_str],verbose=verbose)
            status=204
            sql.dc()
            if len(result)==1:
                return {'status':200,'content':"gen_reset_password_key successfully",'result':result}
        except Exception as e:
            return {'status':status,'content':"error occurs in gen_reset_password","err_msg":repr(e)}
    def reset_password(self,ACCESSCODE,PASSWORD,verbose=0):
        if True:
            time=datetime.now()
            status=500
            sql=self.connect_sql()
            status=400
            result=sql.search('reset_password',['INDEXNUMBER','USER','EMAIL','VALIDTIME'],criteria=f"`ACCESSCODE`='{ACCESSCODE}'",verbose=verbose)
            if len(result)==0:
                return {'status':204,'content':"No matched record",'msg':"失敗，無對應資料。"}
            if len(result)==1:
                due_time=result[0][3]
                due_time=datetime.strptime(due_time, "%y%m%d%H%M%S")

                if time>due_time:
                    res=sql.delete('reset_password',criteria=f"`INDEXNUMBER`={result[0][0]} ",verbose=verbose)
                    sql.dc()
                    return {'status':403,'content':"The url is expired",'msg':"此連結已失效。"}
                user_id=result[0][1]
                email=result[0][2]
                res=sql.search('user',['ID'],criteria=f"`USER`='{user_id}' AND `EMAIL`='{email}'",verbose=verbose)
                # res=sql.delete('reset_password',criteria=f"INDEXNUMBER={result[0][0]} ",verbose=verbose)
                if len(res)==1:
                    res=sql.update('user',f"`PASSWORD`='{PASSWORD}'" ,f'`ID`={res[0][0]}',verbose=verbose)
                    sql.dc()
                    return {'status':200,'content':"password changed successfully",'msg':"已完成密碼變更，請重新登入。"}
                else:
                    sql.dc()
                    return {'status':204,'content':"No matched record",'msg':"失敗，無對應資料。"}

        # except Exception as e:
        #     return {'status':status,'content':"error occurs in reset_password","err_msg":repr(e)}

    def get_user_list(self , search_info_list=['USER', 'NAME','UNIQUE_ID'] , verbose=False):
        '''
        取得用戶列表
        '''
        try:
            
            sql = self.connect_sql()
            # 從 user 表中取得用戶資料
            result = sql.search('user',search_info_list,verbose=verbose)
            sql.dc()

            if result:
                user_list = {"column_id": search_info_list,"len":len(result)}
                for i in range(len(result)):
                    user_list[f"d{i}"]=result[i]
                return user_list
            else:
                return []
        except Exception as e:
            logging.error(f"Error in get_user_list: {e}")
            return []
# In[]
def send_url_mail(email,ACCESSCODE):
    try:
        #load_dotenv(dotenv_path=".env")
        domain=os.getenv("webservice_domain") +":"+str(os.getenv("webservice_port"))

    except:
        print("loading domain name failed")
        domain="127.0.0.1:8000"
    url=f"https://{domain}/static/reset_password.html?ACCESSCODE={ACCESSCODE}"
    data = {
              "message": {"subject": "雄聯智能生醫管理系統-密碼重設函",
                "body": {
                  "contentType": "HTML",
                  "content": f"<h2>密碼重設連結:<a href='{url}'>{url}<a></h2><p>這是一封系統自動寄送的郵件，請勿回覆。</p>"
                },
                "toRecipients": [
                  {"emailAddress": {"address": email}}
                ],
                "attachments": [
                  {
                    "@odata.type": "#microsoft.graph.fileAttachment",
                    "name": "hello.txt",
                    "contentType": "text/plain",
                    "contentBytes": "aGVsbG8gd29ybGQh" 
                  }
                ]
              },
              "saveToSentItems": True
            }
    result=sendMail.send(data,"no-reply@united-khh.com.tw")
    # print(result)
    return result