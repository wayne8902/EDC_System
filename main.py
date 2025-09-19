#https://medium.com/seaniap/python-web-flask-blueprints-%E8%A7%A3%E6%B1%BA%E5%A4%A7%E6%9E%B6%E6%A7%8B%E7%9A%84%E7%B6%B2%E7%AB%99-1f9878312526
from flask import Flask,Blueprint,render_template,redirect,url_for, send_from_directory

from flask_login import LoginManager, login_required
from login_sys import login_blueprints, user_loader
from permission_sys import permission_blueprints
from edc_sys import edc_blueprints
import setproctitle

import os
import json
import logging
from dotenv import load_dotenv
logging.basicConfig(level=logging.INFO)
logging.info("這是 Blueprint 的訊息")

#load_dotenv(dotenv_path="/path/to/.env")
load_dotenv()
crt_path=os.getenv("webservice_crt_path")
key_path=os.getenv("webservice_key_path")
port_str=os.getenv("webservice_port")
domain=os.getenv("webservice_domain") +":"+port_str
configuration=True

app = Flask(__name__)
app.secret_key =  os.urandom(16).hex()

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.user_loader(user_loader)
# login_manager.login_view = '/static/login.html'  # 指定登入頁面endpoint
# @login_manager.user_loader
# def load_user(user_id):
#     if user_id == USER_DATA["username"]:
#         return User(user_id)
#     return None

@login_manager.unauthorized_handler
def unauthorized():    
    print("unauthorized!",flush=True)
    return redirect('/login/checklogin')

@app.route('/')
def index():
    return redirect('/edc/')

@app.route('/edc/')
@app.route('/edc/<path:subpath>')
@login_required
def edc_frontend(subpath=None):
    return send_from_directory('static', 'edc_dashboard.html')

@app.route('/protected/<path:filename>')
@login_required
def protected_files(filename):
    return send_from_directory('protected_files', filename)

print("start!",flush=True)
app.register_blueprint(login_blueprints, url_prefix='/login')
app.register_blueprint(permission_blueprints, url_prefix='/permission')
app.register_blueprint(edc_blueprints, url_prefix='/edc')

crt_path = "cert.pem" # 或 "server.crt" 
key_path = "key.pem" # 或 "server.key"
setproctitle.setproctitle("EDC_sys")
if __name__ == '__main__':  
    app.run(host="0.0.0.0", port=5000, ssl_context=(crt_path, key_path))
    # app.debug = True  
    # #app.run(host="0.0.0.0", port=8002,ssl_context=(crt_path, key_path))
    # app.run(port=5000)
    # print([configuration,domain,crt_path,key_path])
    # if configuration:
    #     try:
    #         # app.run(  host="0.0.0.0",  port=int(port_str),ssl_context=(crt_path, key_path))
    #         app.run(host="0.0.0.0", port=int(port_str))
    #     except:
    #         app.run(port=5000)
    # else:
    #     app.run(port=5000)