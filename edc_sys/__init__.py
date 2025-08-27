"""
EDC System - 電子資料擷取系統

參考 /permission_sys 系統架構設計，使用 Blueprint 模式整合 EDC 功能。
使用 edc_data 資料庫進行受試者資料、納入條件、排除條件的管理。
"""

from .b_edc import edc_blueprints
from .edc_function import edc_db

__version__ = "1.0.0"
__author__ = "EDC System"

# 導出主要類別和函數 (仿照 permission_sys 格式)
__all__ = [
    'edc_blueprints',
    'edc_db'
]
