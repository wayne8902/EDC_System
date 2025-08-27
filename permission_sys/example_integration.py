"""
Permission System 整合範例

展示如何將 permission_sys 整合到現有的 Flask 應用程式中。
"""

from flask import Flask, session, request, jsonify, render_template
from permission_sys import PermissionService, require_permission, require_role
from permission_sys.decorators import init_permission_decorators
from permission_sys.routes import register_permission_routes
from permission_sys.config import PermissionConfig

# 初始化 Flask 應用
app = Flask(__name__)
app.secret_key = 'your-secret-key-here'

# 初始化權限系統
print("🚀 初始化權限系統...")

# 1. 獲取配置
db_config = PermissionConfig.get_database_config()
print(f"📊 資料庫配置: {db_config['type']}")

# 2. 創建權限服務
permission_service = PermissionService(db_config)
print("✅ 權限服務已創建")

# 3. 初始化裝飾器
init_permission_decorators(permission_service)
print("✅ 權限裝飾器已初始化")

# 4. 註冊權限路由
register_permission_routes(app, permission_service)
print("✅ 權限路由已註冊")


# ===============================================
# 基本路由範例
# ===============================================

@app.route('/')
def index():
    """首頁"""
    user_id = session.get('user_id')
    if user_id:
        user = permission_service.get_user_by_id(user_id)
        permissions = permission_service.get_user_permissions(user_id)
        return f"""
        <h1>歡迎，{user.username if user else 'Unknown'}！</h1>
        <p>您的權限：{', '.join(permissions)}</p>
        <a href="/dashboard">控制台</a> |
        <a href="/users">用戶管理</a> |
        <a href="/signin">簽到系統</a> |
        <a href="/leave">請假系統</a> |
        <a href="/logout">登出</a>
        """
    else:
        return '<a href="/login">請登入</a>'


@app.route('/login', methods=['GET', 'POST'])
def login():
    """登入頁面"""
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        user = permission_service.authenticate_user(username, password)
        if user:
            session['user_id'] = user.id
            session['username'] = user.username
            return redirect('/')
        else:
            return "登入失敗"
    
    return """
    <form method="post">
        用戶名: <input type="text" name="username" required><br>
        密碼: <input type="password" name="password" required><br>
        <input type="submit" value="登入">
    </form>
    """


@app.route('/logout')
def logout():
    """登出"""
    session.clear()
    return redirect('/')


# ===============================================
# 權限保護的路由範例
# ===============================================

@app.route('/dashboard')
@require_permission('dashboard.view')
def dashboard():
    """控制台 - 需要 dashboard.view 權限"""
    user_id = session.get('user_id')
    user = permission_service.get_user_by_id(user_id)
    permissions = permission_service.get_user_permissions(user_id)
    roles = permission_service.get_user_roles(user_id)
    
    return f"""
    <h1>控制台</h1>
    <p>用戶：{user.username}</p>
    <p>角色：{', '.join([r['name'] for r in roles])}</p>
    <p>權限數量：{len(permissions)}</p>
    <hr>
    <a href="/permission/dashboard">權限管理控制台</a>
    """


@app.route('/users')
@require_permission('users.view')
def list_users():
    """用戶列表 - 需要 users.view 權限"""
    return """
    <h1>用戶管理</h1>
    <p>這裡是用戶列表頁面</p>
    <a href="/users/create">建立用戶</a> (需要 users.create 權限)
    """


@app.route('/users/create')
@require_permission('users.create')
def create_user():
    """建立用戶 - 需要 users.create 權限"""
    return """
    <h1>建立用戶</h1>
    <p>這裡是建立用戶頁面</p>
    """


@app.route('/admin')
@require_role('admin')
def admin_area():
    """管理員區域 - 需要 admin 角色"""
    return """
    <h1>管理員區域</h1>
    <p>只有管理員可以存取這個頁面</p>
    """


# ===============================================
# 企業打卡系統整合範例
# ===============================================

@app.route('/signin')
@require_permission('signin.view')
def signin_dashboard():
    """簽到系統控制台"""
    return """
    <h1>簽到系統</h1>
    <a href="/signin/create">簽到</a> |
    <a href="/signin/records">簽到記錄</a>
    """


@app.route('/signin/create')
@require_permission('signin.create')
def signin_create():
    """簽到功能 - 需要 signin.create 權限"""
    user_id = session.get('user_id')
    
    # 記錄簽到操作
    permission_service.log_user_action(
        user_id, 
        'signin.submit', 
        'signin',
        details={'action': 'check_in'},
        ip_address=request.remote_addr,
        user_agent=request.user_agent.string
    )
    
    return """
    <h1>簽到成功！</h1>
    <p>您已完成今日簽到</p>
    <a href="/signin">返回簽到系統</a>
    """


@app.route('/signin/records')
@require_permission('signin.view')
def signin_records():
    """簽到記錄 - 需要 signin.view 權限"""
    return """
    <h1>簽到記錄</h1>
    <p>這裡顯示簽到記錄列表</p>
    """


@app.route('/leave')
@require_permission('leave.view')
def leave_dashboard():
    """請假系統控制台"""
    return """
    <h1>請假系統</h1>
    <a href="/leave/apply">申請請假</a> |
    <a href="/leave/records">請假記錄</a> |
    <a href="/leave/approve">審核請假</a> (需要管理權限)
    """


@app.route('/leave/apply')
@require_permission('leave.apply')
def leave_apply():
    """申請請假 - 需要 leave.apply 權限"""
    return """
    <h1>申請請假</h1>
    <p>這裡是請假申請表單</p>
    """


@app.route('/leave/approve')
@require_permission('leave.approve')
def leave_approve():
    """審核請假 - 需要 leave.approve 權限"""
    return """
    <h1>審核請假</h1>
    <p>這裡是請假審核頁面，只有主管可以存取</p>
    """


# ===============================================
# API 路由範例
# ===============================================

@app.route('/api/signin/submit', methods=['POST'])
@require_permission('signin.create', api_mode=True)
def api_signin_submit():
    """API: 簽到提交"""
    user_id = session.get('user_id')
    
    # 簽到邏輯
    signin_data = {
        'user_id': user_id,
        'timestamp': '2025-08-22 10:00:00',
        'location': '辦公室'
    }
    
    # 記錄操作
    permission_service.log_user_action(
        user_id,
        'api.signin.submit',
        'signin',
        details=signin_data,
        ip_address=request.remote_addr,
        user_agent=request.user_agent.string
    )
    
    return jsonify({
        'success': True,
        'message': '簽到成功',
        'data': signin_data
    })


@app.route('/api/leave/submit', methods=['POST'])
@require_permission('leave.apply', api_mode=True)
def api_leave_submit():
    """API: 請假申請提交"""
    user_id = session.get('user_id')
    data = request.get_json()
    
    leave_data = {
        'user_id': user_id,
        'leave_type': data.get('leave_type'),
        'start_date': data.get('start_date'),
        'end_date': data.get('end_date'),
        'reason': data.get('reason')
    }
    
    # 記錄操作
    permission_service.log_user_action(
        user_id,
        'api.leave.submit',
        'leave',
        details=leave_data,
        ip_address=request.remote_addr,
        user_agent=request.user_agent.string
    )
    
    return jsonify({
        'success': True,
        'message': '請假申請已提交',
        'data': leave_data
    })


# ===============================================
# 管理功能範例
# ===============================================

@app.route('/admin/users/<int:user_id>/assign-role/<int:role_id>')
@require_permission('users.edit')
def assign_role(user_id: int, role_id: int):
    """分配角色給用戶"""
    current_user_id = session.get('user_id')
    success = permission_service.assign_role_to_user(user_id, role_id, current_user_id)
    
    if success:
        return f"成功為用戶 {user_id} 分配角色 {role_id}"
    else:
        return "分配角色失敗"


@app.route('/admin/users/<int:user_id>/grant-permission/<permission>')
@require_permission('users.admin')
def grant_permission(user_id: int, permission: str):
    """直接授予用戶權限"""
    current_user_id = session.get('user_id')
    success = permission_service.grant_direct_permission(user_id, permission, current_user_id)
    
    if success:
        return f"成功為用戶 {user_id} 授予權限 {permission}"
    else:
        return "授予權限失敗"


# ===============================================
# 錯誤處理
# ===============================================

@app.errorhandler(403)
def permission_denied(error):
    """權限拒絕錯誤處理"""
    if request.is_json:
        return jsonify({'error': '權限不足'}), 403
    
    return """
    <h1>權限不足</h1>
    <p>您沒有執行此操作的權限</p>
    <a href="/">返回首頁</a>
    """, 403


@app.errorhandler(401)
def authentication_required(error):
    """身份驗證錯誤處理"""
    if request.is_json:
        return jsonify({'error': '需要登入'}), 401
    
    return """
    <h1>需要登入</h1>
    <p>請先登入才能存取此頁面</p>
    <a href="/login">登入</a>
    """, 401


# ===============================================
# 初始化資料 (僅在開發環境)
# ===============================================

def init_demo_data():
    """初始化示例資料"""
    try:
        # 創建測試用戶
        user_id = permission_service.database.create_user(
            username='demo_user',
            email='demo@example.com',
            password='password123',
            first_name='示例',
            last_name='用戶'
        )
        
        if user_id:
            # 分配角色
            permission_service.assign_role_to_user(user_id, 1, user_id)  # admin 角色
            print(f"✅ 創建示例用戶: demo_user (ID: {user_id})")
            print("🔑 登入資訊: demo_user / password123")
        
    except Exception as e:
        print(f"⚠️ 初始化示例資料失敗: {e}")


if __name__ == '__main__':
    print("\n" + "="*50)
    print("🎯 Permission System 整合範例")
    print("="*50)
    
    # 初始化示例資料
    init_demo_data()
    
    print(f"\n🌐 可用路由:")
    print(f"   - 首頁: http://localhost:5000/")
    print(f"   - 登入: http://localhost:5000/login")
    print(f"   - 控制台: http://localhost:5000/dashboard")
    print(f"   - 權限管理: http://localhost:5000/permission/dashboard")
    print(f"   - 簽到系統: http://localhost:5000/signin")
    print(f"   - 請假系統: http://localhost:5000/leave")
    
    print(f"\n🔑 測試帳號:")
    print(f"   用戶名: demo_user")
    print(f"   密碼: password123")
    
    print(f"\n🚀 啟動服務器...")
    app.run(host='0.0.0.0', port=5001, debug=True)