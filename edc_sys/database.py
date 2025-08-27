"""
EDC 系統資料庫操作

提供 EDC 系統的資料庫存取功能，支援 MySQL 資料庫後端。
"""

import json
import logging
import pymysql
from typing import List, Dict, Any, Optional
from datetime import datetime
import os

logger = logging.getLogger(__name__)


class EDCDatabase:
    """EDC 系統資料庫操作類別 (仿照 permission_sys/database.py 格式)"""
    
    def __init__(self, db_config: Optional[Dict] = None):
        """
        初始化資料庫連接
        
        Args:
            db_config: 資料庫配置字典
        """
        self.db_config = db_config or {}
        self.db_type = self.db_config.get('type', 'mysql')
        self.connection = None
        
        if self.db_type == 'mysql':
            self._init_mysql()
        else:
            raise ValueError(f"Unsupported database type: {self.db_type}")
    
    def _init_mysql(self):
        """初始化 MySQL 資料庫連接"""
        try:
            self.connection = pymysql.connect(
                host=self.db_config.get('host', 'localhost'),
                port=self.db_config.get('port', 3306),
                user=self.db_config.get('username', 'root'),
                password=self.db_config.get('password', ''),
                database=self.db_config.get('database', 'edc_data'),
                charset='utf8mb4',
                cursorclass=pymysql.cursors.DictCursor
            )
            logger.info("MySQL 資料庫連接成功")
        except Exception as e:
            logger.error(f"MySQL 資料庫連接失敗: {e}")
            raise
    
    def _get_cursor(self):
        """獲取資料庫游標"""
        if not self.connection or not self.connection.open:
            self._init_mysql()
        return self.connection.cursor()
    
    def close(self):
        """關閉資料庫連接"""
        if self.connection and self.connection.open:
            self.connection.close()
    
    def execute_query(self, query: str, params: tuple = None) -> List[Dict]:
        """執行查詢語句"""
        try:
            with self._get_cursor() as cursor:
                cursor.execute(query, params)
                return cursor.fetchall()
        except Exception as e:
            logger.error(f"查詢執行失敗: {e}")
            raise
    
    def execute_update(self, query: str, params: tuple = None) -> int:
        """執行更新語句，返回影響的行數"""
        try:
            with self._get_cursor() as cursor:
                rows = cursor.execute(query, params)
                self.connection.commit()
                return rows
        except Exception as e:
            self.connection.rollback()
            logger.error(f"更新執行失敗: {e}")
            raise
    
    def execute_insert(self, query: str, params: tuple = None) -> int:
        """執行插入語句，返回新插入的 ID"""
        try:
            with self._get_cursor() as cursor:
                cursor.execute(query, params)
                self.connection.commit()
                return cursor.lastrowid
        except Exception as e:
            self.connection.rollback()
            logger.error(f"插入執行失敗: {e}")
            raise
    
    # ==================== 受試者資料操作 ====================
    
    def insert_subject(self, subject_data: Dict[str, Any]) -> int:
        """插入新受試者資料"""
        query = """
        INSERT INTO subjects (
            subject_code, date_of_birth, age, gender, height_cm, weight_kg,
            bmi, medical_history, bac, dm, gout, imaging_type, imaging_date,
            kidney_stone_diagnosis, imaging_files, imaging_report_summary, created_by
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        params = (
            subject_data['subject_code'],
            subject_data['date_of_birth'],
            subject_data.get('age'),
            subject_data['gender'],
            subject_data.get('height_cm'),
            subject_data.get('weight_kg'),
            subject_data.get('bmi'),
            subject_data.get('medical_history'),
            subject_data.get('bac', 0),
            subject_data.get('dm', 0),
            subject_data.get('gout', 0),
            subject_data.get('imaging_type'),
            subject_data.get('imaging_date'),
            subject_data.get('kidney_stone_diagnosis'),
            json.dumps(subject_data.get('imaging_files', [])),
            subject_data.get('imaging_report_summary'),
            subject_data.get('created_by', 'system')
        )
        
        return self.execute_insert(query, params)
    
    def get_subject_by_id(self, subject_id: int) -> Optional[Dict]:
        """根據 ID 獲取受試者資料"""
        query = "SELECT * FROM subjects WHERE id = %s"
        results = self.execute_query(query, (subject_id,))
        return results[0] if results else None
    
    def get_subject_by_code(self, subject_code: str) -> Optional[Dict]:
        """根據受試者編號獲取資料"""
        query = "SELECT * FROM subjects WHERE subject_code = %s"
        results = self.execute_query(query, (subject_code,))
        return results[0] if results else None
    
    def update_subject(self, subject_id: int, subject_data: Dict[str, Any]) -> bool:
        """更新受試者資料"""
        query = """
        UPDATE subjects SET
            date_of_birth = %s, age = %s, gender = %s, height_cm = %s,
            weight_kg = %s, bmi = %s, medical_history = %s, bac = %s,
            dm = %s, gout = %s, imaging_type = %s, imaging_date = %s,
            kidney_stone_diagnosis = %s, imaging_files = %s,
            imaging_report_summary = %s, updated_by = %s, updated_at = NOW()
        WHERE id = %s
        """
        
        params = (
            subject_data['date_of_birth'],
            subject_data.get('age'),
            subject_data['gender'],
            subject_data.get('height_cm'),
            subject_data.get('weight_kg'),
            subject_data.get('bmi'),
            subject_data.get('medical_history'),
            subject_data.get('bac', 0),
            subject_data.get('dm', 0),
            subject_data.get('gout', 0),
            subject_data.get('imaging_type'),
            subject_data.get('imaging_date'),
            subject_data.get('kidney_stone_diagnosis'),
            json.dumps(subject_data.get('imaging_files', [])),
            subject_data.get('imaging_report_summary'),
            subject_data.get('updated_by', 'system'),
            subject_id
        )
        
        return self.execute_update(query, params) > 0
    
    def get_all_subjects(self, limit: int = 100, offset: int = 0) -> List[Dict]:
        """獲取所有受試者資料（分頁）"""
        query = "SELECT * FROM subjects ORDER BY created_at DESC LIMIT %s OFFSET %s"
        return self.execute_query(query, (limit, offset))
    
    # ==================== 納入條件操作 ====================
    
    def insert_inclusion_criteria(self, inclusion_data: Dict[str, Any]) -> int:
        """插入納入條件評估資料"""
        query = """
        INSERT INTO inclusion_criteria (
            subject_id, age_18_above, gender_available, age_available, bmi_available,
            dm_history_available, gout_history_available, egfr_available, urine_ph_available,
            urine_sg_available, urine_rbc_available, bacteriuria_available, lab_interval_7days,
            imaging_available, kidney_structure_visible, mid_ureter_visible, lower_ureter_visible,
            imaging_lab_interval_7days, no_treatment_during_exam, created_by
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        params = (
            inclusion_data['subject_id'],
            inclusion_data.get('age_18_above'),
            inclusion_data.get('gender_available'),
            inclusion_data.get('age_available'),
            inclusion_data.get('bmi_available'),
            inclusion_data.get('dm_history_available'),
            inclusion_data.get('gout_history_available'),
            inclusion_data.get('egfr_available'),
            inclusion_data.get('urine_ph_available'),
            inclusion_data.get('urine_sg_available'),
            inclusion_data.get('urine_rbc_available'),
            inclusion_data.get('bacteriuria_available'),
            inclusion_data.get('lab_interval_7days'),
            inclusion_data.get('imaging_available'),
            inclusion_data.get('kidney_structure_visible'),
            inclusion_data.get('mid_ureter_visible'),
            inclusion_data.get('lower_ureter_visible'),
            inclusion_data.get('imaging_lab_interval_7days'),
            inclusion_data.get('no_treatment_during_exam'),
            inclusion_data.get('created_by', 'system')
        )
        
        return self.execute_insert(query, params)
    
    def get_inclusion_criteria(self, subject_id: int) -> Optional[Dict]:
        """獲取受試者的納入條件評估"""
        query = "SELECT * FROM inclusion_criteria WHERE subject_id = %s"
        results = self.execute_query(query, (subject_id,))
        return results[0] if results else None
    
    # ==================== 排除條件操作 ====================
    
    def insert_exclusion_criteria(self, exclusion_data: Dict[str, Any]) -> int:
        """插入排除條件評估資料"""
        query = """
        INSERT INTO exclusion_criteria (
            subject_id, pregnant_female, kidney_transplant, urinary_tract_foreign_body,
            foreign_body_type, non_stone_urological_disease, urological_disease_name,
            renal_replacement_therapy, therapy_name, medical_record_incomplete,
            major_blood_immune_cancer, disease_name, rare_metabolic_disease,
            metabolic_disease_name, investigator_judgment, judgment_reason, created_by
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        params = (
            exclusion_data['subject_id'],
            exclusion_data.get('pregnant_female'),
            exclusion_data.get('kidney_transplant'),
            exclusion_data.get('urinary_tract_foreign_body'),
            exclusion_data.get('foreign_body_type'),
            exclusion_data.get('non_stone_urological_disease'),
            exclusion_data.get('urological_disease_name'),
            exclusion_data.get('renal_replacement_therapy'),
            exclusion_data.get('therapy_name'),
            exclusion_data.get('medical_record_incomplete'),
            exclusion_data.get('major_blood_immune_cancer'),
            exclusion_data.get('disease_name'),
            exclusion_data.get('rare_metabolic_disease'),
            exclusion_data.get('metabolic_disease_name'),
            exclusion_data.get('investigator_judgment'),
            exclusion_data.get('judgment_reason'),
            exclusion_data.get('created_by', 'system')
        )
        
        return self.execute_insert(query, params)
    
    def get_exclusion_criteria(self, subject_id: int) -> Optional[Dict]:
        """獲取受試者的排除條件評估"""
        query = "SELECT * FROM exclusion_criteria WHERE subject_id = %s"
        results = self.execute_query(query, (subject_id,))
        return results[0] if results else None
    
    # ==================== 綜合查詢操作 ====================
    
    def get_subject_complete_data(self, subject_id: int) -> Dict[str, Any]:
        """獲取受試者的完整資料（包括納入和排除條件）"""
        subject = self.get_subject_by_id(subject_id)
        if not subject:
            return {}
        
        inclusion = self.get_inclusion_criteria(subject_id)
        exclusion = self.get_exclusion_criteria(subject_id)
        
        return {
            'subject': subject,
            'inclusion_criteria': inclusion,
            'exclusion_criteria': exclusion
        }
    
    def search_subjects(self, search_term: str, limit: int = 50) -> List[Dict]:
        """搜尋受試者"""
        query = """
        SELECT * FROM subjects 
        WHERE subject_code LIKE %s OR medical_history LIKE %s
        ORDER BY created_at DESC LIMIT %s
        """
        search_pattern = f"%{search_term}%"
        return self.execute_query(query, (search_pattern, search_pattern, limit))
