from flask import Blueprint,Flask, render_template, request, redirect, url_for, flash, jsonify,make_response
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from .login_function import login_db,send_url_mail
from datetime import datetime
import hashlib
import base64
import json
# from Crypto.Cipher import AES
import logging
import urllib
logging.basicConfig(level=logging.INFO)
VERBOSE=False

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

login_blueprints = Blueprint( 'login', __name__, template_folder= 'templates' , static_folder='static')
#https://flask-login.readthedocs.io/en/latest/
#https://ithelp.ithome.com.tw/articles/10315526?sc=rss.iron
# login_manager = LoginManager()
# login_manager.init_app(login_blueprints)
# login_manager.login_view = 'login'

# @login_manager.unauthorized_handler
# def unauthorized():
#     if request.blueprint == 'api':
#         abort(HTTPStatus.UNAUTHORIZED)
#     return redirect(url_for('site.login'))
def user_loader(user_id):
    # 這裡根據 user_id 查找並回傳 User 實例
    user = User(user_id)
    return user

class User(UserMixin):
    def __init__(self, id):
        self.id = id
        fidb=login_db()
        res=fidb.get_account_info(user_id=id,info=['NAME','UNIQUE_ID','EMAIL','DUEDATE'],verbose=VERBOSE)
        
        self.NAME=res['data'][0]
        self.UNIQUE_ID=res['data'][1]
        self.EMAIL=res['data'][2]
        self.DUEDATE=res['data'][3]
  
  


@login_blueprints.route('/test', methods=['GET','POST'])
def test():
    return "this is a test page."
@login_blueprints.route('/test2', methods=['GET','POST'])
@login_required
def test2():
    # http://127.0.0.1:8000/login/test2
    print(current_user.UNIQUE_ID)
    return "this is a test page after login."
@login_blueprints.route('/getrequirestring', methods=['GET','POST'])
def getrequirestring():
    content = request.json
    now=datetime.now()
    strnow=now.strftime('%Y%m%d-%H')+str(int(now.minute/15))
    return hash_sha256(content['seed']+strnow)

@login_blueprints.route('/checklogin', methods=['GET'])
def checklogin():
    #http://127.0.0.1:8000/login/checklogin
    try:
        fidb=login_db()
        privilege = fidb.verification_sql(request.cookies['session_id'],verbose=VERBOSE)
        # logging.info(privilege)
        if(privilege['state']==False): 

            raise Exception("You haven't login.")
        else:
            # logging.info("帳號已登入")
            resp = make_response(json.dumps(privilege))
            user = User(privilege['id'])
            login_user(user)
            return redirect('/static/sign_sys.html')
    except Exception as err:
        return redirect('/static/login.html')
@login_blueprints.route('/checklogin', methods=['POST'])
def checklogin_post():
    if current_user.is_authenticated:
        return json.dumps({"status":"200","content":"OK"})
    #http://127.0.0.1:8000/login/checklogin
    try:
        fidb=login_db()
        privilege = fidb.verification_sql(request.cookies['session_id'],verbose=VERBOSE)
        # logging.info(privilege)
        if(privilege['state']==False): 

            raise Exception("You haven't login.")
        else:
            # logging.info("帳號已登入")
            resp = make_response(json.dumps(privilege))
            user = User(privilege['id'])
            login_user(user)
            return json.dumps({"status":"200","content":"OK"})
    except Exception as err:
        return json.dumps({"status":"301","content":"redirect","redir":"/static/login.html"})
@login_blueprints.route('/', methods=['GET'])
@login_blueprints.route('/login', methods=['GET'])
def api_login_get():
    return redirect('/static/login.html')
@login_blueprints.route('/login', methods=['POST'])
def api_login():
    logging.info("收到登入請求")
    now=datetime.now()
    strnow=now.strftime('%Y%m%d-%H')+str(int(now.minute/15))
    data = request.get_json()
    key = hash_sha256(data['seed']+strnow)

    

    username = data["id"]
    password = data["ciphertext"]


    resp="fault!"
    fidb=login_db()
    fidb.connect()
    content = request.json
    start_time=datetime.now().strftime('%Y%m%d %H:%M:%S')
    log=request.remote_addr+","+start_time
    result=fidb.login_sql(username,password,key,log=log,verbose=VERBOSE)
    # Returns
    # -------
    # dict
    #     state:bool failed=0 or success=1.
    #     cookies: user_otp
    #     due: due time
    fidb.disconnect()
    if(result["state"]):
        resp = make_response(json.dumps({"content":"登入成功","success":True,"redirect":"/static/sign_sys.html"}))
        user = User(username)
        login_user(user)
    else:
        resp = make_response(json.dumps({"content":"登入失敗","success":False}))
        return resp
    
    
    # sessionkey=hash_md5(host_name+request.remote_addr+start_time,"auth key")
    # sessionkey=hash_md5("123","auth key")
    resp.set_cookie(key='session_id', value=result["cookies"], expires=result["due"], httponly = True,secure=True,samesite="Lax")
    resp.set_cookie(key='user_id', value=urllib.parse.quote_plus(user.NAME), expires=result["due"])
    return resp
@login_blueprints.route('/logout',methods=['GET','POST'])
def del_cookie():
    url="/login"
    res = make_response(f'<!DOCTYPE html><html><head><title>Old Page</title><meta charset="UTF-8" /><meta http-equiv="refresh" content="3; URL="{url}" /></head><body><p>Redirecting. If you are not redirected within 3 seconds, click <a href="{url}">{url}</a> to go to the HubSpot homepage.</p></body></html>')
    res = make_response(f'<!DOCTYPE html><html><head><title>Old Page</title><meta charset="UTF-8" /></head><body><p>Redirecting. If you are not redirected within 3 seconds, click <a href="{url}">{url}</a> to go to the HubSpot homepage.</p></body></html>')
    # res= redirect(url_for('hello', username=request.form.get('username')))
    res.set_cookie(key='session_id', value='', expires=0)
    res.set_cookie(key='user_id', value='', expires=0)
    
    return res
@login_blueprints.route('/gen_passwd_reset_key', methods=['POST'])
def gen_passwd_reset_key():

    now=datetime.now()
    strnow=now.strftime('%Y%m%d-%H')+str(int(now.minute/15))
    data = request.get_json()
    username = data["id"]
    email = data["email"]

    ACCESSCODE = hash_sha256( username+strnow) + hash_sha256( strnow+email)
    fidb=login_db() 
    result=fidb.check_account_exist(username,email,verbose=VERBOSE)
    if result['status']!=200:
        result['msg']="查無對應帳號及e-mail之帳戶。"
        return json.dumps(result)
    fidb.gen_reset_password(username,email,ACCESSCODE,verbose=VERBOSE)
    if result['status']==200:
        result['msg']="密碼重設連結已寄發至您的信箱，連結於30分鐘內有效。"
        result['redir']="/static/login.html"
        sendmail_res=send_url_mail(email,ACCESSCODE)
        #print(sendmail_res.text)
        if sendmail_res.status_code==202:
            #print(sendmail_res)
            return json.dumps(result)
        else:
            result['msg']="發生未預期的錯誤導致信件無法寄出。"
            return json.dumps(result)
    else:
        result['msg']="發生未預期的錯誤。"
        return json.dumps(result)

@login_blueprints.route('/reset_password', methods=['POST'])
def reset_password():

    now=datetime.now()
    strnow=now.strftime('%Y%m%d-%H')+str(int(now.minute/15))
    data = request.get_json()
    PASSWORD = data["KEY"]
    ACCESSCODE = data["ACCESSCODE"]
    fidb=login_db() 

    result=fidb.reset_password(ACCESSCODE,PASSWORD,verbose=VERBOSE)
    return json.dumps(result)

@login_blueprints.route('/localapi/get_user_list', methods=['POST'])
def get_user_list_local():
    # 限制只能從 localhost 存取
    data = request.get_json()
    if request.remote_addr not in ['127.0.0.1', '::1', 'localhost']:
        return json.dumps({
            'status': 403,
            'content': 'Access denied',
            'msg': '僅允許本地存取'
        }), 403

    try:
        fidb = login_db()
        user_list = fidb.get_user_list(search_info_list=data["info_list"],verbose=VERBOSE)
        return json.dumps({
            'status': 200,
            'content': 'get user list successfully',
            'data': user_list
        })
    except Exception as e:
        return json.dumps({
            'status': 500,
            'content': 'error occurs in get_user_list',
            'err_msg': str(e)
        }), 500