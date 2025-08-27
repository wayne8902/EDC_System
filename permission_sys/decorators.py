"""
權限裝飾器

提供方便的權限檢查裝飾器，可以直接應用於 Flask 路由函數。
"""

import functools
import logging
from flask import session, request, jsonify, redirect, url_for, flash
from typing import Union, List, Callable, Any
from .service import PermissionService

logger = logging.getLogger(__name__)

# 全域權限服務實例
_permission_service = None


def init_permission_decorators(permission_service: PermissionService):
    """初始化權限裝飾器的全域服務實例"""
    global _permission_service
    _permission_service = permission_service


def get_current_user_id() -> Union[int, None]:
    """從 session 中獲取當前用戶 ID"""
    # 支援多種 session 鍵名
    possible_keys = ['user_id', 'rbac_user_id', 'permission_user_id', 'current_user_id']
    
    for key in possible_keys:
        user_id = session.get(key)
        if user_id:
            try:
                return int(user_id)
            except (ValueError, TypeError):
                continue
    
    return None


def require_permission(permission: str, redirect_to: str = None, api_mode: bool = False):
    """
    權限檢查裝飾器
    
    Args:
        permission: 需要的權限名稱（例如：'users.create'）
        redirect_to: 權限不足時重定向的頁面（預設為登入頁面）
        api_mode: 是否為 API 模式（返回 JSON 而不是重定向）
    
    Usage:
        @require_permission('users.create')
        def create_user():
            pass
            
        @require_permission('signin.view', api_mode=True)
        def get_signin_data():
            pass
    """
    def decorator(f: Callable) -> Callable:
        @functools.wraps(f)
        def decorated_function(*args, **kwargs):
            if not _permission_service:
                logger.error("Permission service not initialized")
                if api_mode:
                    return jsonify({'error': 'Permission service not available'}), 500
                flash('系統錯誤，請稍後再試', 'error')
                return redirect(url_for('auth.login'))
            
            user_id = get_current_user_id()
            if not user_id:
                logger.warning(f"No user session found for permission check: {permission}")
                if api_mode:
                    return jsonify({'error': 'Authentication required'}), 401
                flash('請先登入', 'warning')
                return redirect(redirect_to or url_for('auth.login'))
            
            # 檢查權限
            has_permission = _permission_service.check_permission(user_id, permission)
            
            if not has_permission:
                logger.warning(f"User {user_id} denied access to {permission}")
                
                # 記錄權限拒絕
                _permission_service.log_user_action(
                    user_id, 
                    'permission.denied', 
                    'access_control',
                    details={
                        'required_permission': permission,
                        'endpoint': request.endpoint,
                        'url': request.url
                    },
                    ip_address=request.remote_addr,
                    user_agent=request.user_agent.string
                )
                
                if api_mode:
                    return jsonify({'error': 'Insufficient permissions'}), 403
                
                flash('您沒有執行此操作的權限', 'error')
                return redirect(redirect_to or url_for('dashboard.index'))
            
            # 記錄權限使用
            _permission_service.log_user_action(
                user_id,
                'permission.used',
                'access_control', 
                details={
                    'permission': permission,
                    'endpoint': request.endpoint,
                    'url': request.url
                },
                ip_address=request.remote_addr,
                user_agent=request.user_agent.string
            )
            
            return f(*args, **kwargs)
        
        return decorated_function
    return decorator


def require_role(role: str, redirect_to: str = None, api_mode: bool = False):
    """
    角色檢查裝飾器
    
    Args:
        role: 需要的角色名稱（例如：'admin'）
        redirect_to: 權限不足時重定向的頁面
        api_mode: 是否為 API 模式
    
    Usage:
        @require_role('admin')
        def admin_only_view():
            pass
    """
    def decorator(f: Callable) -> Callable:
        @functools.wraps(f)
        def decorated_function(*args, **kwargs):
            if not _permission_service:
                logger.error("Permission service not initialized")
                if api_mode:
                    return jsonify({'error': 'Permission service not available'}), 500
                flash('系統錯誤，請稍後再試', 'error')
                return redirect(url_for('auth.login'))
            
            user_id = get_current_user_id()
            if not user_id:
                if api_mode:
                    return jsonify({'error': 'Authentication required'}), 401
                flash('請先登入', 'warning')
                return redirect(redirect_to or url_for('auth.login'))
            
            # 檢查角色
            has_role = _permission_service.check_role(user_id, role)
            
            if not has_role:
                logger.warning(f"User {user_id} denied access, requires role: {role}")
                
                # 記錄角色檢查失敗
                _permission_service.log_user_action(
                    user_id,
                    'role.denied',
                    'access_control',
                    details={
                        'required_role': role,
                        'endpoint': request.endpoint,
                        'url': request.url
                    },
                    ip_address=request.remote_addr,
                    user_agent=request.user_agent.string
                )
                
                if api_mode:
                    return jsonify({'error': 'Insufficient role privileges'}), 403
                
                flash('您的權限等級不足以執行此操作', 'error')
                return redirect(redirect_to or url_for('dashboard.index'))
            
            return f(*args, **kwargs)
        
        return decorated_function
    return decorator


def require_any_permission(permissions: List[str], redirect_to: str = None, api_mode: bool = False):
    """
    多權限檢查裝飾器（只需要其中一個權限）
    
    Args:
        permissions: 權限列表，只需要擁有其中一個
        redirect_to: 權限不足時重定向的頁面
        api_mode: 是否為 API 模式
    
    Usage:
        @require_any_permission(['users.edit', 'users.admin'])
        def edit_user():
            pass
    """
    def decorator(f: Callable) -> Callable:
        @functools.wraps(f)
        def decorated_function(*args, **kwargs):
            if not _permission_service:
                if api_mode:
                    return jsonify({'error': 'Permission service not available'}), 500
                return redirect(url_for('auth.login'))
            
            user_id = get_current_user_id()
            if not user_id:
                if api_mode:
                    return jsonify({'error': 'Authentication required'}), 401
                return redirect(redirect_to or url_for('auth.login'))
            
            # 檢查是否擁有任何一個權限
            has_any_permission = any(
                _permission_service.check_permission(user_id, perm) 
                for perm in permissions
            )
            
            if not has_any_permission:
                logger.warning(f"User {user_id} denied access, needs any of: {permissions}")
                
                if api_mode:
                    return jsonify({'error': 'Insufficient permissions'}), 403
                
                flash('您沒有執行此操作的權限', 'error')
                return redirect(redirect_to or url_for('dashboard.index'))
            
            return f(*args, **kwargs)
        
        return decorated_function
    return decorator


def require_all_permissions(permissions: List[str], redirect_to: str = None, api_mode: bool = False):
    """
    多權限檢查裝飾器（需要所有權限）
    
    Args:
        permissions: 權限列表，需要擁有所有權限
        redirect_to: 權限不足時重定向的頁面
        api_mode: 是否為 API 模式
    
    Usage:
        @require_all_permissions(['users.edit', 'audit.view'])
        def advanced_user_edit():
            pass
    """
    def decorator(f: Callable) -> Callable:
        @functools.wraps(f)
        def decorated_function(*args, **kwargs):
            if not _permission_service:
                if api_mode:
                    return jsonify({'error': 'Permission service not available'}), 500
                return redirect(url_for('auth.login'))
            
            user_id = get_current_user_id()
            if not user_id:
                if api_mode:
                    return jsonify({'error': 'Authentication required'}), 401
                return redirect(redirect_to or url_for('auth.login'))
            
            # 檢查是否擁有所有權限
            has_all_permissions = all(
                _permission_service.check_permission(user_id, perm)
                for perm in permissions
            )
            
            if not has_all_permissions:
                logger.warning(f"User {user_id} denied access, needs all of: {permissions}")
                
                if api_mode:
                    return jsonify({'error': 'Insufficient permissions'}), 403
                
                flash('您沒有足夠的權限執行此操作', 'error')  
                return redirect(redirect_to or url_for('dashboard.index'))
            
            return f(*args, **kwargs)
        
        return decorated_function
    return decorator


def optional_permission(permission: str):
    """
    可選權限裝飾器 - 不阻止存取，但會在 g 中設置權限狀態
    
    Args:
        permission: 權限名稱
    
    Usage:
        @optional_permission('users.admin')
        def user_list():
            # 可以透過 g.has_admin_permission 檢查是否有管理權限
            pass
    """
    def decorator(f: Callable) -> Callable:
        @functools.wraps(f)
        def decorated_function(*args, **kwargs):
            from flask import g
            
            user_id = get_current_user_id()
            has_permission = False
            
            if user_id and _permission_service:
                has_permission = _permission_service.check_permission(user_id, permission)
            
            # 設置權限狀態到 Flask g 對象
            permission_key = f"has_{permission.replace('.', '_')}_permission"
            setattr(g, permission_key, has_permission)
            
            return f(*args, **kwargs)
        
        return decorated_function
    return decorator