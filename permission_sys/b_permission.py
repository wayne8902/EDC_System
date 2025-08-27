"""
Permission System Blueprint - 權限管理系統藍圖

參考 signed/login_sys/b_login.py 和 signed/signin_sys/b_sign.py 的架構
使用相同的 Blueprint 模式和 JSON API 回應格式
"""

from flask import Blueprint, render_template, request, redirect, url_for, flash, jsonify, make_response
from flask_login import login_required, current_user
from .permission_function import permission_db
from datetime import datetime
import json
import logging

logging.basicConfig(level=logging.INFO)

# 創建 permission_db 實例 (仿照 signed/signin_sys/b_sign.py 第12行)
perm_sys = permission_db()

# 創建 Blueprint (仿照 signed 系統格式)
permission_blueprints = Blueprint('permission', __name__, template_folder='templates', static_folder='static')


def get_client_ip(request):
    """獲取客戶端 IP (仿照 signed/signin_sys/b_sign.py)"""
    x_forwarded_for = request.headers.get('X-Forwarded-For')
    if x_forwarded_for:
        client_ip = x_forwarded_for.split(',')[0].strip()
    else:
        client_ip = request.remote_addr
    return client_ip


@permission_blueprints.route('/test', methods=['GET', 'POST'])
def test():
    """測試路由 (仿照所有 signed 系統的 test 路由)"""
    return "this is a permission system test page."


@permission_blueprints.route('/check_permission', methods=['GET', 'POST'])
@login_required  
def check_permission():
    """
    檢查用戶權限 API
    
    GET 方法: 從 query string 獲取權限參數
    POST 方法: 從 JSON body 獲取權限參數
    
    請求格式:
    GET: /check_permission?permission=users.create
    POST: {"permission": "users.create", "resource_id": null}
    
    回應格式:
    {
        "status": "success",
        "has_permission": true,
        "user_id": "KHH001",
        "permission": "users.create",
        "source": "role"
    }
    """
    if request.method == 'GET':
        permission = request.args.get('permission')
        resource_id = request.args.get('resource_id')
    else:
        content = request.json
        if not content or 'permission' not in content:
            return jsonify({
                "status": "error",
                "message": "Missing permission parameter",
                "content": "permission_check"
            })
        permission = content['permission']
        resource_id = content.get('resource_id')
    
    user_id = current_user.UNIQUE_ID
    ip = get_client_ip(request)
    time = datetime.now()
    timestamp = time.strftime("%Y%m%d-%H:%M:%S")
    
    try:
        # 使用 permission_db 檢查權限
        result = perm_sys.check_user_permission(
            user_id=user_id,
            permission=permission,
            resource_id=resource_id,
            verbose=True
        )
        
        # 記錄權限檢查日誌 (暫時註解，因為 permission_db 沒有此方法)
        # perm_sys.log_permission_action(
        #     user_id=user_id,
        #     action="permission.check",
        #     permission=permission,
        #     result=result['has_permission'],
        #     ip=ip,
        #     timestamp=timestamp,
        #     verbose=False
        # )
        
        result['content'] = "permission_check"
        return json.dumps(result)
    except Exception as e:
        logging.error(f"Permission check error: {e}")
        return jsonify({
            "status": "error",
            "message": str(e),
            "content": "permission_check"
        })


@permission_blueprints.route('/get_user_permissions', methods=['GET', 'POST'])
@login_required
def get_user_permissions():
    """
    獲取當前用戶的所有權限
    
    回應格式:
    {
        "status": "success",
        "user_id": "KHH001",
        "permissions": ["users.view", "dashboard.view", ...],
        "roles": ["employee", ...],
        "content": "get_user_permissions"
    }
    """
    user_id = current_user.UNIQUE_ID
    ip = get_client_ip(request)
    
    try:
        # 獲取用戶權限
        result = perm_sys.get_user_all_permissions(user_id=user_id, verbose=True)
        
        result['content'] = "get_user_permissions"
        return json.dumps(result)
        
    except Exception as e:
        logging.error(f"Get user permissions error: {e}")
        return jsonify({
            "status": "error",
            "message": str(e),
            "content": "get_user_permissions"
        })


@permission_blueprints.route('/assign_role', methods=['POST'])
@login_required
def assign_role():
    """
    分配角色給用戶 (需要管理權限)
    
    請求格式:
    {
        "target_user_id": "KHH002",
        "role_name": "admin"
    }
    """
    # 先檢查當前用戶是否有分配角色的權限
    current_user_id = current_user.UNIQUE_ID
    admin_check = perm_sys.check_user_permission(
        user_id=current_user_id,
        permission="users.admin",
        verbose=False
    )
    
    if not admin_check.get('has_permission', False):
        return jsonify({
            "status": "error",
            "message": "Insufficient permissions to assign roles",
            "content": "assign_role"
        })
    
    content = request.json
    target_user_id = content.get('target_user_id')
    role_name = content.get('role_name')
    ip = get_client_ip(request)
    timestamp = datetime.now().strftime("%Y%m%d-%H:%M:%S")
    
    if not target_user_id or not role_name:
        return jsonify({
            "status": "error",
            "message": "Missing target_user_id or role_name",
            "content": "assign_role"
        })
    
    try:
        # 分配角色
        result = perm_sys.assign_user_role(
            user_id=target_user_id,
            role_name=role_name,
            assigned_by=current_user_id,
            verbose=True
        )
        
        # 記錄操作日誌
        perm_sys.log_permission_action(
            user_id=current_user_id,
            action="role.assign",
            permission=f"assign_role:{role_name}",
            result=result.get('success', False),
            details=f"Target: {target_user_id}, Role: {role_name}",
            ip=ip,
            timestamp=timestamp,
            verbose=False
        )
        
        result['content'] = "assign_role"
        return json.dumps(result)
        
    except Exception as e:
        logging.error(f"Assign role error: {e}")
        return jsonify({
            "status": "error",
            "message": str(e),
            "content": "assign_role"
        })


@permission_blueprints.route('/grant_permission', methods=['POST'])
@login_required
def grant_permission():
    """
    直接授予用戶權限 (需要超級管理員權限)
    
    請求格式:
    {
        "target_user_id": "KHH002",
        "permission": "signin.admin"
    }
    """
    # 檢查超級管理員權限
    current_user_id = current_user.UNIQUE_ID
    admin_check = perm_sys.check_user_permission(
        user_id=current_user_id,
        permission="system.admin",
        verbose=False
    )
    
    if not admin_check.get('has_permission', False):
        return jsonify({
            "status": "error",
            "message": "Insufficient permissions to grant direct permissions",
            "content": "grant_permission"
        })
    
    content = request.json
    target_user_id = content.get('target_user_id')
    permission = content.get('permission')
    ip = get_client_ip(request)
    timestamp = datetime.now().strftime("%Y%m%d-%H:%M:%S")
    
    if not target_user_id or not permission:
        return jsonify({
            "status": "error",
            "message": "Missing target_user_id or permission",
            "content": "grant_permission"
        })
    
    try:
        # 授予權限
        result = perm_sys.grant_direct_permission(
            user_id=target_user_id,
            permission=permission,
            granted_by=current_user_id,
            verbose=True
        )
        
        # 記錄操作日誌
        perm_sys.log_permission_action(
            user_id=current_user_id,
            action="permission.grant",
            permission=permission,
            result=result.get('success', False),
            details=f"Target: {target_user_id}, Permission: {permission}",
            ip=ip,
            timestamp=timestamp,
            verbose=False
        )
        
        result['content'] = "grant_permission"
        return json.dumps(result)
        
    except Exception as e:
        logging.error(f"Grant permission error: {e}")
        return jsonify({
            "status": "error",
            "message": str(e),
            "content": "grant_permission"
        })


@permission_blueprints.route('/get_audit_logs', methods=['GET', 'POST'])
@login_required
def get_audit_logs():
    """
    獲取權限審計日誌 (需要審計查看權限)
    
    請求參數:
    - user_id: 可選，篩選特定用戶
    - action: 可選，篩選特定操作
    - limit: 可選，限制結果數量，預設50
    """
    # 檢查審計日誌查看權限
    current_user_id = current_user.UNIQUE_ID
    audit_check = perm_sys.check_user_permission(
        user_id=current_user_id,
        permission="audit_logs.view",
        verbose=False
    )
    
    if not audit_check.get('has_permission', False):
        return jsonify({
            "status": "error",
            "message": "Insufficient permissions to view audit logs",
            "content": "get_audit_logs"
        })
    
    # 獲取查詢參數
    if request.method == 'POST':
        content = request.json or {}
        filter_user_id = content.get('user_id')
        filter_action = content.get('action')
        limit = content.get('limit', 50)
    else:
        filter_user_id = request.args.get('user_id')
        filter_action = request.args.get('action')
        limit = int(request.args.get('limit', 50))
    
    try:
        # 獲取審計日誌
        result = perm_sys.get_audit_logs(
            user_id=filter_user_id,
            action=filter_action,
            limit=limit,
            verbose=True
        )
        
        result['content'] = "get_audit_logs"
        return json.dumps(result)
        
    except Exception as e:
        logging.error(f"Get audit logs error: {e}")
        return jsonify({
            "status": "error",
            "message": str(e),
            "content": "get_audit_logs"
        })


@permission_blueprints.route('/dashboard')
@login_required
def dashboard():
    """權限管理控制台 (仿照 signed 系統可能會有的管理界面)"""
    user_id = current_user.UNIQUE_ID
    
    # 檢查是否有控制台訪問權限
    dashboard_check = perm_sys.check_user_permission(
        user_id=user_id,
        permission="dashboard.view",
        verbose=False
    )
    
    if not dashboard_check.get('has_permission', False):
        flash('您沒有訪問權限管理控制台的權限', 'error')
        return redirect(url_for('login.checklogin'))
    
    # 獲取用戶權限統計
    user_permissions = perm_sys.get_user_all_permissions(user_id=user_id, verbose=False)
    recent_logs = perm_sys.get_audit_logs(limit=10, verbose=False)
    
    return render_template('permission/dashboard.html',
                         user_permissions=user_permissions,
                         recent_logs=recent_logs,
                         current_user=current_user)


# 權限裝飾器 (仿照 Flask-Login 的使用方式)
def require_permission(permission_name):
    """
    權限檢查裝飾器
    
    用法:
    @require_permission('users.create')
    def some_view():
        pass
    """
    def decorator(f):
        def decorated_function(*args, **kwargs):
            if not current_user.is_authenticated:
                return redirect(url_for('login.checklogin'))
            
            user_id = current_user.UNIQUE_ID
            check_result = perm_sys.check_user_permission(
                user_id=user_id,
                permission=permission_name,
                verbose=False
            )
            
            if not check_result.get('has_permission', False):
                if request.is_json:
                    return jsonify({
                        "status": "error",
                        "message": "Insufficient permissions",
                        "required_permission": permission_name
                    }), 403
                else:
                    flash(f'您沒有執行此操作的權限 (需要: {permission_name})', 'error')
                    return redirect(url_for('login.checklogin'))
            
            return f(*args, **kwargs)
        
        # 保持原函數的名稱和屬性
        decorated_function.__name__ = f.__name__
        decorated_function.__doc__ = f.__doc__
        
        return decorated_function
    return decorator


# 工具函數
@permission_blueprints.route('/init_default_permissions', methods=['POST'])
@login_required
def init_default_permissions():
    """初始化預設權限和角色 (僅限超級管理員)"""
    current_user_id = current_user.UNIQUE_ID
    
    # 檢查超級管理員權限
    admin_check = perm_sys.check_user_permission(
        user_id=current_user_id,
        permission="system.admin",
        verbose=False
    )
    
    if not admin_check.get('has_permission', False):
        return jsonify({
            "status": "error",
            "message": "Only super admin can initialize default permissions",
            "content": "init_default_permissions"
        })
    
    try:
        # 初始化預設權限和角色
        result = perm_sys.init_default_permissions_and_roles(verbose=True)
        
        result['content'] = "init_default_permissions"
        return json.dumps(result)
        
    except Exception as e:
        logging.error(f"Init default permissions error: {e}")
        return jsonify({
            "status": "error",
            "message": str(e),
            "content": "init_default_permissions"
        })