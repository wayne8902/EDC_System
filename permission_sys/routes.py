"""
權限系統路由

提供權限管理的 API 端點和管理界面路由。
"""

import json
import logging
from flask import Blueprint, request, jsonify, render_template, redirect, url_for, flash, session
from typing import Dict, Any, List
from .service import PermissionService
from .decorators import require_permission, require_role
from .utils import SessionHelper

logger = logging.getLogger(__name__)

# 創建 Blueprint
permission_bp = Blueprint('permission', __name__, url_prefix='/permission')

# 權限服務實例（需要在應用初始化時設置）
permission_service: PermissionService = None


def init_permission_routes(service: PermissionService):
    """初始化權限路由的服務實例"""
    global permission_service
    permission_service = service


@permission_bp.route('/api/check', methods=['POST'])
def api_check_permission():
    """API: 檢查權限"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        permission = data.get('permission')
        
        if not user_id or not permission:
            return jsonify({'error': 'Missing user_id or permission'}), 400
        
        has_permission = permission_service.check_permission(user_id, permission)
        
        return jsonify({
            'has_permission': has_permission,
            'user_id': user_id,
            'permission': permission
        })
        
    except Exception as e:
        logger.error(f"API check permission error: {e}")
        return jsonify({'error': 'Internal server error'}), 500


@permission_bp.route('/api/user/<int:user_id>/permissions')
def api_get_user_permissions(user_id: int):
    """API: 獲取用戶權限列表"""
    try:
        permissions = permission_service.get_user_permissions(user_id)
        roles = permission_service.get_user_roles(user_id)
        
        return jsonify({
            'user_id': user_id,
            'permissions': permissions,
            'roles': roles
        })
        
    except Exception as e:
        logger.error(f"API get user permissions error: {e}")
        return jsonify({'error': 'Internal server error'}), 500


@permission_bp.route('/api/user/<int:user_id>/assign-role', methods=['POST'])
@require_permission('users.edit', api_mode=True)
def api_assign_role(user_id: int):
    """API: 分配角色給用戶"""
    try:
        data = request.get_json()
        role_id = data.get('role_id')
        
        if not role_id:
            return jsonify({'error': 'Missing role_id'}), 400
        
        current_user_id = SessionHelper.get_user_id_from_session(session)
        success = permission_service.assign_role_to_user(user_id, role_id, current_user_id)
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Role assigned successfully'
            })
        else:
            return jsonify({'error': 'Failed to assign role'}), 500
            
    except Exception as e:
        logger.error(f"API assign role error: {e}")
        return jsonify({'error': 'Internal server error'}), 500


@permission_bp.route('/api/user/<int:user_id>/remove-role', methods=['POST'])
@require_permission('users.edit', api_mode=True)
def api_remove_role(user_id: int):
    """API: 從用戶移除角色"""
    try:
        data = request.get_json()
        role_id = data.get('role_id')
        
        if not role_id:
            return jsonify({'error': 'Missing role_id'}), 400
        
        current_user_id = SessionHelper.get_user_id_from_session(session)
        success = permission_service.remove_role_from_user(user_id, role_id, current_user_id)
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Role removed successfully'
            })
        else:
            return jsonify({'error': 'Failed to remove role'}), 500
            
    except Exception as e:
        logger.error(f"API remove role error: {e}")
        return jsonify({'error': 'Internal server error'}), 500


@permission_bp.route('/api/user/<int:user_id>/grant-permission', methods=['POST'])
@require_permission('users.admin', api_mode=True)
def api_grant_permission(user_id: int):
    """API: 直接授予用戶權限"""
    try:
        data = request.get_json()
        permission = data.get('permission')
        
        if not permission:
            return jsonify({'error': 'Missing permission'}), 400
        
        current_user_id = SessionHelper.get_user_id_from_session(session)
        success = permission_service.grant_direct_permission(user_id, permission, current_user_id)
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Permission granted successfully'
            })
        else:
            return jsonify({'error': 'Failed to grant permission'}), 500
            
    except Exception as e:
        logger.error(f"API grant permission error: {e}")
        return jsonify({'error': 'Internal server error'}), 500


@permission_bp.route('/api/user/<int:user_id>/revoke-permission', methods=['POST'])
@require_permission('users.admin', api_mode=True)
def api_revoke_permission(user_id: int):
    """API: 撤銷用戶的直接權限"""
    try:
        data = request.get_json()
        permission = data.get('permission')
        
        if not permission:
            return jsonify({'error': 'Missing permission'}), 400
        
        current_user_id = SessionHelper.get_user_id_from_session(session)
        success = permission_service.revoke_direct_permission(user_id, permission, current_user_id)
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Permission revoked successfully'
            })
        else:
            return jsonify({'error': 'Failed to revoke permission'}), 500
            
    except Exception as e:
        logger.error(f"API revoke permission error: {e}")
        return jsonify({'error': 'Internal server error'}), 500


@permission_bp.route('/api/audit-logs')
@require_permission('audit_logs.view', api_mode=True)
def api_get_audit_logs():
    """API: 獲取審計日誌"""
    try:
        user_id = request.args.get('user_id', type=int)
        action = request.args.get('action')
        limit = request.args.get('limit', 100, type=int)
        offset = request.args.get('offset', 0, type=int)
        
        logs = permission_service.get_audit_logs(user_id, action, limit, offset)
        
        return jsonify({
            'logs': logs,
            'total': len(logs),
            'limit': limit,
            'offset': offset
        })
        
    except Exception as e:
        logger.error(f"API get audit logs error: {e}")
        return jsonify({'error': 'Internal server error'}), 500


# Web 界面路由

@permission_bp.route('/dashboard')
@require_permission('dashboard.view')
def dashboard():
    """權限系統控制台"""
    try:
        current_user_id = SessionHelper.get_user_id_from_session(session)
        user_permissions = permission_service.get_user_permissions(current_user_id)
        user_roles = permission_service.get_user_roles(current_user_id)
        
        # 獲取系統統計
        recent_logs = permission_service.get_audit_logs(limit=10)
        
        return render_template('permission/dashboard.html', 
                             user_permissions=user_permissions,
                             user_roles=user_roles,
                             recent_logs=recent_logs)
        
    except Exception as e:
        logger.error(f"Dashboard error: {e}")
        flash('載入控制台時發生錯誤', 'error')
        return redirect(url_for('dashboard.index'))


@permission_bp.route('/users')
@require_permission('users.view')
def list_users():
    """用戶列表頁面"""
    try:
        # 這裡需要實現用戶列表獲取邏輯
        # 目前先返回空列表
        users = []
        
        return render_template('permission/users.html', users=users)
        
    except Exception as e:
        logger.error(f"List users error: {e}")
        flash('載入用戶列表時發生錯誤', 'error')
        return redirect(url_for('permission.dashboard'))


@permission_bp.route('/roles')
@require_permission('roles.view')
def list_roles():
    """角色列表頁面"""
    try:
        # 這裡需要實現角色列表獲取邏輯
        roles = []
        
        return render_template('permission/roles.html', roles=roles)
        
    except Exception as e:
        logger.error(f"List roles error: {e}")
        flash('載入角色列表時發生錯誤', 'error')
        return redirect(url_for('permission.dashboard'))


@permission_bp.route('/audit-logs')
@require_permission('audit_logs.view')
def view_audit_logs():
    """審計日誌頁面"""
    try:
        page = request.args.get('page', 1, type=int)
        limit = 50
        offset = (page - 1) * limit
        
        logs = permission_service.get_audit_logs(limit=limit, offset=offset)
        
        return render_template('permission/audit_logs.html', 
                             logs=logs, 
                             page=page,
                             has_next=len(logs) == limit)
        
    except Exception as e:
        logger.error(f"View audit logs error: {e}")
        flash('載入審計日誌時發生錯誤', 'error')
        return redirect(url_for('permission.dashboard'))


@permission_bp.route('/user/<int:user_id>/edit')
@require_permission('users.edit')
def edit_user(user_id: int):
    """編輯用戶頁面"""
    try:
        user = permission_service.get_user_by_id(user_id)
        if not user:
            flash('用戶不存在', 'error')
            return redirect(url_for('permission.list_users'))
        
        user_permissions = permission_service.get_user_permissions(user_id)
        user_roles = permission_service.get_user_roles(user_id)
        
        return render_template('permission/edit_user.html',
                             user=user,
                             user_permissions=user_permissions,
                             user_roles=user_roles)
        
    except Exception as e:
        logger.error(f"Edit user error: {e}")
        flash('載入用戶編輯頁面時發生錯誤', 'error')
        return redirect(url_for('permission.list_users'))


# 錯誤處理

@permission_bp.errorhandler(403)
def permission_denied(error):
    """權限拒絕錯誤處理"""
    if request.is_json:
        return jsonify({'error': 'Permission denied'}), 403
    
    flash('您沒有執行此操作的權限', 'error')
    return redirect(url_for('dashboard.index'))


@permission_bp.errorhandler(401)
def authentication_required(error):
    """身份驗證錯誤處理"""
    if request.is_json:
        return jsonify({'error': 'Authentication required'}), 401
    
    flash('請先登入', 'warning')
    return redirect(url_for('auth.login'))


# 初始化函數，需要在主應用中調用
def register_permission_routes(app, service: PermissionService):
    """註冊權限路由到 Flask 應用"""
    init_permission_routes(service)
    app.register_blueprint(permission_bp)
    logger.info("Permission routes registered successfully")