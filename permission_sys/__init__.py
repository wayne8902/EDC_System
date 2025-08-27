"""
Permission System - 統一權限管理系統 (RBAC)

參考 /signed 系統架構設計，使用 Blueprint 模式整合權限管理功能。
使用現有的 united_khh 用戶資料和相同的資料庫連接方式。
"""

from .b_permission import permission_blueprints
from .permission_function import permission_db

__version__ = "1.0.0"
__author__ = "RBAC System"

# 導出主要類別和函數 (仿照 signed 系統格式)
__all__ = [
    'permission_blueprints',
    'permission_db'
]