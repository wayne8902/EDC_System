from flask import Blueprint,Flask, render_template, request, redirect, url_for, flash, jsonify,make_response
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from .login_function import login_db,send_url_mail
from datetime import datetime, timedelta
import hashlib
import base64
import json
# from Crypto.Cipher import AES
import logging
import urllib
# ====== msal ======
import os
from flask import Flask, session, redirect, url_for, request, render_template_string
from msal import ConfidentialClientApplication
from dotenv import load_dotenv
import requests
# ====== msal ======

logging.basicConfig(level=logging.INFO)
VERBOSE=True

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

load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")
CLIENT_ID = os.getenv("CLIENT_ID")
CLIENT_SECRET = os.getenv("CLIENT_SECRET")
TENANT_ID = os.getenv("TENANT_ID")
REDIRECT_URI = os.getenv("REDIRECT_URI")
SCOPE = ["User.Read"]

AUTHORITY = f"https://login.microsoftonline.com/{TENANT_ID}"

def _build_msal_app(cache=None):
    return ConfidentialClientApplication(
        CLIENT_ID,
        authority=AUTHORITY,
        client_credential=CLIENT_SECRET,
        token_cache=cache
    )

def _build_auth_url():
    return _build_msal_app().get_authorization_request_url(
        SCOPE,
        redirect_uri=REDIRECT_URI
    )

def get_client_ip():
    # 取得 X-Forwarded-For 標頭
    x_forwarded_for = request.headers.get('X-Forwarded-For')
 
    if x_forwarded_for:
        # X-Forwarded-For 可能包含多個 IP，第一個通常是真實客戶端 IP
        client_ip = x_forwarded_for.split(',')[0].strip()
    else:
        # 如果沒有 X-Forwarded-For，使用 remote_addr
        client_ip = request.remote_addr
 
    return client_ip

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
    print("user_id: ", user_id)
    return User(user_id)

class User(UserMixin):
    def __init__(self, id):
        self.id = id
        fidb = login_db()
        
        res = fidb.get_account_info(user_id=id, info=['NAME','UNIQUE_ID','EMAIL','DUEDATE'], verbose=VERBOSE)
        if res.get('status') == 200:
            self.NAME = res['data'][0]
            self.UNIQUE_ID = res['data'][1]
            self.EMAIL = res['data'][2]
            self.DUEDATE = res['data'][3]
        else:
            self.NAME = ''
            self.UNIQUE_ID = ''
            self.EMAIL = ''
            self.DUEDATE = None
  
  


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
            resp.set_cookie(key='unique_id', value=user.UNIQUE_ID, expires=datetime.now() + timedelta(days=1))
            return redirect('/static/edc_dashboard.html')
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
    login_type = request.args.get('type', '')
    if login_type == 'ms':
        auth_url = _build_auth_url()
        return redirect(auth_url)
    else:
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
    log=get_client_ip()+","+start_time
    result=fidb.login_sql(username,password,key,log=log,verbose=VERBOSE)
    # Returns
    # -------
    # dict
    #     state:bool failed=0 or success=1.
    #     cookies: user_otp
    #     due: due time
    fidb.disconnect()
    if(result["state"]):
        resp = make_response(json.dumps({"content":"登入成功","success":True,"redirect":"/static/edc_dashboard.html"}))
        user = User(username)
        login_user(user)
    else:
        resp = make_response(json.dumps({"content":"登入失敗","success":False}))
        return resp
    
    
    # sessionkey=hash_md5(host_name+request.remote_addr+start_time,"auth key")
    # sessionkey=hash_md5("123","auth key")
    resp.set_cookie(key='session_id', value=result["cookies"], expires=result["due"], httponly = True,secure=True,samesite="Lax")
    resp.set_cookie(key='user_id', value=urllib.parse.quote_plus(user.NAME), expires=result["due"])
    resp.set_cookie(key='unique_id', value=user.UNIQUE_ID, expires=result["due"])
    return resp

@login_blueprints.route('/getAToken')
def authorized():
    code = request.args.get('code')
    if not code:
        return "授權失敗", 400
    result = _build_msal_app().acquire_token_by_authorization_code(
        code,
        scopes=SCOPE,
        redirect_uri=REDIRECT_URI
    )

    if "access_token" in result:
        access_token = result["access_token"]
        import requests
        headers = {'Authorization': f'Bearer {access_token}'}
        resp = requests.get("https://graph.microsoft.com/v1.0/me", headers=headers)
        user_info = resp.json()
        print("ms api res: ", user_info)
        print("ms email: ", user_info['userPrincipalName'])
        # user = User(id=user_info['id'], user_info=user_info)
        # login_user(user)
        try:
            fidb = login_db()
            time = datetime.now()
            start_time = datetime.now().strftime('%Y%m%d %H:%M:%S')
            log = get_client_ip() + "," + start_time
            print(log)
            username = user_info['userPrincipalName']
            result = fidb.login_sql(username, "", "", account_type='ms', log=log, verbose=VERBOSE)
            fidb.disconnect()
            if(result["state"]):
                user = User(result['user'])
                login_user(user)
                resp = make_response(redirect('/static/edc_dashboard.html'))
                resp.set_cookie('user_id', urllib.parse.quote_plus(user.NAME), expires=result["due"])
                resp.set_cookie('unique_id', value=user.UNIQUE_ID, expires=result["due"])
                return resp
            else:
                return redirect('/static/login.html')

            # if result != 1:
            #     return render_template_string("""
            #         <script>
            #             var user_info = {{ user_info | tojson }};
            #             if (confirm('尚未註冊，是否要前往登記使用者？')) {
            #                 localStorage.setItem('register_user_info', JSON.stringify(user_info));
            #                 window.location.href = '/static/register_ms.html';
            #             } else {
            #                 window.location.href = '/static/login.html';
            #             }
            #         </script>
            #     """, user_info=user_info)
        except Exception as err:
            return redirect('/static/login.html')
    else:
        return "登入失敗：" + str(result), 400

@login_blueprints.route('/logout',methods=['GET','POST'])
def del_cookie():
    url="/login"
    res = make_response(f'<!DOCTYPE html><html><head><title>Old Page</title><meta charset="UTF-8" /><meta http-equiv="refresh" content="3; URL="{url}" /></head><body><p>Redirecting. If you are not redirected within 3 seconds, click <a href="{url}">{url}</a> to go to the HubSpot homepage.</p></body></html>')
    res = make_response(f'<!DOCTYPE html><html><head><title>Old Page</title><meta charset="UTF-8" /></head><body><p>Redirecting. If you are not redirected within 3 seconds, click <a href="{url}">{url}</a> to go to the HubSpot homepage.</p></body></html>')
    # res= redirect(url_for('hello', username=request.form.get('username')))
    res.set_cookie(key='session_id', value='', expires=0)
    res.set_cookie(key='session', value='', expires=0)
    res.set_cookie(key='user_id', value='', expires=0)
    res.set_cookie(key='unique_id', value='', expires=0)
    
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