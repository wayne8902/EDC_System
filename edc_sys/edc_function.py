"""
EDC 系統核心業務邏輯

提供 EDC 系統的主要功能，包括受試者管理、資格評估、資料驗證等。
"""

import json
import logging
import sys
import os
from datetime import datetime, timedelta, date
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from function_sys.sqlconn import sqlconn

logger = logging.getLogger(__name__)


class edc_db:
    """EDC 系統核心業務邏輯類別 (仿照 permission_function.py 格式)"""
    
    sql = None
    column_id = {'config': ['KEY', 'VALUE']}
    config = dict()
    
    def __init__(self):
        """初始化 EDC 系統，載入配置並建立資料庫連接"""
        print("+++++++ INIT EDC ++++++")
        logging.info("edc_db/config path: " + os.path.join(os.path.dirname(__file__), 'config'))
        # try:
        #     # 載入環境變數
        #     load_dotenv("edc_sys/.env")
        #     self.config = {
        #         'sql_host': os.getenv('EDC_SQL_HOST', 'localhost'),
        #         'sql_port': int(os.getenv('EDC_SQL_PORT', 3306)),
        #         'sql_user': os.getenv('EDC_SQL_USER'),
        #         'sql_passwd': os.getenv('EDC_SQL_PASSWD'),
        #         'sql_dbname': os.getenv('EDC_SQL_DBNAME')
        #     }
        # except:
        with open(os.path.join(os.path.dirname(__file__), 'config.json'), 'r') as f:
            self.config=json.load(f)
        print(self.config)
        self.sql=sqlconn(self.config['sql_host'],self.config['sql_port'],self.config['sql_user'],self.config['sql_passwd'],self.config['sql_dbname'])
        self.get_col_id()
        self.disconnect()
    
    def get_col_id(self):
        """獲取資料庫欄位 ID 配置"""
        try:
            # 重新連接資料庫
            self.connect()
            result = self.sql.search('config',['VALUE'], criteria="`ID` = 'column_id_subjects'")
            self.column_id['EDC'] = result[0][0].split(',')
            print("Col ID: ", self.column_id['EDC'])
        except:
            raise Exception("Error occurs when getting config: 'column_id_subjects'")
    
    def connect_sql(self):
        """建立新的資料庫連接"""
        return sqlconn(self.config['sql_host'],self.config['sql_port'],self.config['sql_user'],self.config['sql_passwd'],self.config['sql_dbname'])
    
    def connect(self):
        """建立資料庫連接"""
        self.sql=sqlconn(self.config['sql_host'],self.config['sql_port'],self.config['sql_user'],self.config['sql_passwd'],self.config['sql_dbname'])
    
    def disconnect(self):
        """關閉資料庫連接"""
        if hasattr(self, 'sql'):
            self.sql.dc()
    
    def __del__(self):
        """析構函數"""
        pass
    
    # ==================== 上傳/插入受試者功能 ====================
    def insert_subject(self, subject_data, user_id, verbose=0, auto_commit=True):
        """插入新受試者資料
        
        Args:
            subject_data: 受試者資料字典
            user_id: 插入者ID
            verbose: 詳細模式 (0/1)
            auto_commit: 是否自動提交
            
        Returns:
            插入結果字典
        """
        try:
            # 重新連接資料庫
            self.connect()
            
            print(subject_data)
            # 1. 驗證受試者編號唯一性
            result = self.sql.search('subjects', ['id'], criteria=f"`subject_code`='{subject_data['subject_code']}'", verbose=verbose)
            if result:
                return {
                    'success': False,
                    'message': '受試者編號已存在',
                    'error_code': 'DUPLICATE_SUBJECT_CODE'
                }
            print(1)
            # 2. 驗證資料完整性
            validation_result = self._validate_subject_data(subject_data)
            if not validation_result['valid']:
                return {
                    'success': False,
                    'message': validation_result['message'],
                    'error_code': 'VALIDATION_ERROR'
                }
            
            # 3. 設定插入者
            subject_data['created_by'] = user_id
            
            # 4. 插入資料庫
            # 準備插入資料
            columns = ['subject_code', 'date_of_birth', 'age', 'gender', 'height_cm', 'weight_kg',
                      'bmi', 'scr', 'egfr', 'ph', 'sg', 'rbc', 'bac', 'dm', 'gout', 'imaging_type', 'imaging_date',
                      'kidney_stone_diagnosis', 'imaging_files', 'imaging_report_summary', 'created_by', 'created_at']
            values = [
                subject_data['subject_code'],
                subject_data['date_of_birth'],
                subject_data.get('age'),
                subject_data.get('gender'),
                subject_data.get('height_cm'),
                subject_data.get('weight_kg'),
                subject_data.get('bmi'),
                subject_data.get('scr'),
                subject_data.get('egfr'),
                subject_data.get('ph'),
                subject_data.get('sg'),
                subject_data.get('rbc'),
                subject_data.get('bac', 0),
                subject_data.get('dm', 0),
                subject_data.get('gout', 0),
                subject_data.get('imaging_type', ''),
                subject_data.get('imaging_date', ''),
                subject_data.get('kidney_stone_diagnosis'),
                json.dumps(subject_data.get('imaging_files', [])),
                subject_data.get('imaging_report_summary', ''),
                subject_data.get('created_by', 'system'),
                datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            ]
            print(2)
            if self.sql.insert('subjects', columns, values, verbose=verbose):
                # 獲取新插入的 ID
                result = self.sql.search('subjects', ['id'], criteria=f"`subject_code`='{subject_data['subject_code']}'", verbose=verbose)
                subject_id = result[0][0] if result else 0
            else:
                raise Exception("插入資料庫失敗")
            
            return {
                'success': True,
                'message': '受試者資料插入成功',
                'subject_id': subject_id,
                'subject_code': subject_data['subject_code']
            }
            
        except Exception as e:
            logger.error(f"插入受試者資料失敗: {e}")
            return {
                'success': False,
                'message': f'插入失敗: {str(e)}',
                'error_code': 'DATABASE_ERROR'
            }
    
    def insert_inclusion_criteria(self, subject_result, inclusion_data, user_id, verbose=0, auto_commit=True):
        """插入納入條件評估資料
        
        Args:
            subject_result: 受試者插入結果
            inclusion_data: 納入條件資料字典
            user_id: 插入者ID
            verbose: 詳細模式 (0/1)
            auto_commit: 是否自動提交
            
        Returns:
            插入結果字典
        """
        try:
            self.connect()
            
            # 1. 檢查受試者是否存在
            if not subject_result or not subject_result.get('success'):
                return {
                    'success': False,
                    'message': '受試者資料不存在',
                    'error_code': 'SUBJECT_NOT_FOUND'
                }
            
            # 2. 設定關聯和插入者
            inclusion_data['subject_code'] = subject_result['subject_code']
            inclusion_data['created_by'] = user_id
            
            # 3. 插入資料庫
            # 準備插入資料
            columns = ['subject_code', 'age_18_above', 'gender_available', 'age_available', 'bmi_available',
                      'dm_history_available', 'gout_history_available', 'egfr_available', 'urine_ph_available',
                      'urine_sg_available', 'urine_rbc_available', 'bacteriuria_available', 'lab_interval_7days',
                      'imaging_available', 'kidney_structure_visible', 'mid_ureter_visible', 'lower_ureter_visible',
                      'imaging_lab_interval_7days', 'no_treatment_during_exam', 'medications', 'surgeries', 'created_by', 'created_at']
            values = [
                str(inclusion_data['subject_code']),
                str(inclusion_data.get('age_18_above', 0)),
                str(inclusion_data.get('gender_available', 0)),
                str(inclusion_data.get('age_available', 0)),
                str(inclusion_data.get('bmi_available', 0)),
                str(inclusion_data.get('dm_history_available', 0)),
                str(inclusion_data.get('gout_history_available', 0)),
                str(inclusion_data.get('egfr_available', 0)),
                str(inclusion_data.get('urine_ph_available', 0)),
                str(inclusion_data.get('urine_sg_available', 0)),
                str(inclusion_data.get('urine_rbc_available', 0)),
                str(inclusion_data.get('bacteriuria_available', 0)),
                str(inclusion_data.get('lab_interval_7days', 0)),
                str(inclusion_data.get('imaging_available', 0)),
                str(inclusion_data.get('kidney_structure_visible', 0)),
                str(inclusion_data.get('mid_ureter_visible', 0)),
                str(inclusion_data.get('lower_ureter_visible', 0)),
                str(inclusion_data.get('imaging_lab_interval_7days', 0)),
                str(inclusion_data.get('no_treatment_during_exam', 0)),
                json.dumps(inclusion_data.get('medications', [])),
                json.dumps(inclusion_data.get('surgeries', [])),
                str(inclusion_data['created_by']),
                datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            ]
            
            if self.sql.insert('inclusion_criteria', columns, values, verbose=verbose):
                # 獲取新插入的 ID
                result = self.sql.search('inclusion_criteria', ['id'], criteria=f"`subject_code`='{inclusion_data['subject_code']}'", verbose=verbose)
                inclusion_id = result[0][0] if result else 0
            else:
                raise Exception("插入納入條件失敗")
            
            return {
                'success': True,
                'message': '納入條件評估資料插入成功',
                'inclusion_id': inclusion_id,
                'subject_code': inclusion_data['subject_code']
            }
            
        except Exception as e:
            logger.error(f"插入納入條件資料失敗: {e}")
            return {
                'success': False,
                'message': f'插入失敗: {str(e)}',
                'error_code': 'DATABASE_ERROR'
            }
    
    def insert_exclusion_criteria(self, subject_code, exclusion_data, user_id, verbose=0, auto_commit=True):
        """插入排除條件評估資料
        
        Args:
            subject_code: 受試者編號
            exclusion_data: 排除條件資料字典
            user_id: 插入者ID
            verbose: 詳細模式 (0/1)
            auto_commit: 是否自動提交
            
        Returns:
            插入結果字典
        """
        try:
            # 重新連接資料庫
            self.connect()
            
            # 1. 檢查受試者是否存在
            if not self.sql.search('subjects', ['id'], criteria=f"`subject_code`='{subject_code}'", verbose=verbose):
                return {
                    'success': False,
                    'message': '受試者不存在',
                    'error_code': 'SUBJECT_NOT_FOUND'
                }
            
            # 2. 設定關聯和插入者
            exclusion_data['subject_code'] = subject_code
            exclusion_data['created_by'] = user_id
            
            # 3. 插入資料庫
            # 準備插入資料
            columns = ['subject_code', 'pregnant_female', 'kidney_transplant', 'urinary_tract_foreign_body',
                      'non_stone_urological_disease', 'renal_replacement_therapy', 'medical_record_incomplete',
                      'major_blood_immune_cancer', 'rare_metabolic_disease', 'investigator_judgment', 
                      'judgment_reason', 'created_by', 'created_at']
            values = [
                str(exclusion_data['subject_code']),
                str(exclusion_data.get('pregnant_female', 0)),
                str(exclusion_data.get('kidney_transplant', 0)),
                str(exclusion_data.get('urinary_tract_foreign_body', 0)),
                str(exclusion_data.get('non_stone_urological_disease', 0)),
                str(exclusion_data.get('renal_replacement_therapy', 0)),
                str(exclusion_data.get('medical_record_incomplete', 0)),
                str(exclusion_data.get('major_blood_immune_cancer', 0)),
                str(exclusion_data.get('rare_metabolic_disease', 0)),
                str(exclusion_data.get('investigator_judgment', 0)),
                str(exclusion_data.get('judgment_reason', '')),
                str(exclusion_data['created_by']),
                datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            ]
            
            if self.sql.insert('exclusion_criteria', columns, values, verbose=verbose):
                # 獲取新插入的 ID
                result = self.sql.search('exclusion_criteria', ['id'], criteria=f"`subject_code`='{exclusion_data['subject_code']}'", verbose=verbose)
                exclusion_id = result[0][0] if result else 0
            else:
                raise Exception("插入排除條件失敗")
            
            return {
                'success': True,
                'message': '排除條件評估資料插入成功',
                'exclusion_id': exclusion_id,
                'subject_code': exclusion_data['subject_code']
            }
            
        except Exception as e:
            logger.error(f"插入排除條件資料失敗: {e}")
            return {
                'success': False,
                'message': f'插入失敗: {str(e)}',
                'error_code': 'DATABASE_ERROR'
            }
    
    def update_subject(self, subject_id, subject_data, user_id, verbose=0):
        """更新受試者資料
        
        Args:
            subject_id: 受試者ID
            subject_data: 受試者資料字典
            user_id: 更新者ID
            
        Returns:
            更新結果字典
        """
        try:
            # 重新連接資料庫
            self.connect()
            
            # 1. 檢查受試者是否存在
            existing_subject = self.sql.search('subjects', ['*'], criteria=f"`id`={subject_id}")
            if not existing_subject:
                return {
                    'success': False,
                    'message': '受試者不存在',
                    'error_code': 'SUBJECT_NOT_FOUND'
                }
            
            # 2. 驗證資料
            validation_result = self._validate_subject_data(subject_data)
            if not validation_result['valid']:
                return {
                    'success': False,
                    'message': validation_result['message'],
                    'error_code': 'VALIDATION_ERROR'
                }
            
            # 3. 設定更新者
            subject_data['updated_by'] = user_id
            
            # 5. 更新資料庫
            # 準備更新資料
            update_info = f"`date_of_birth`='{subject_data.get('date_of_birth', '')}', " \
                         f"`age`='{subject_data.get('age', '')}', " \
                         f"`gender`='{subject_data.get('gender', '')}', " \
                         f"`height_cm`='{subject_data.get('height_cm', '')}', " \
                         f"`weight_kg`='{subject_data.get('weight_kg', '')}', " \
                         f"`bmi`='{subject_data.get('bmi', '')}', " \
                         f"`scr`='{subject_data.get('scr', '')}', " \
                         f"`egfr`='{subject_data.get('egfr', '')}', " \
                         f"`ph`='{subject_data.get('ph', '')}', " \
                         f"`sg`='{subject_data.get('sg', '')}', " \
                         f"`rbc`='{subject_data.get('rbc', '')}', " \
                         f"`bac`='{subject_data.get('bac', 0)}', " \
                         f"`dm`='{subject_data.get('dm', 0)}', " \
                         f"`gout`='{subject_data.get('gout', 0)}', " \
                         f"`imaging_type`='{subject_data.get('imaging_type', '')}', " \
                         f"`imaging_date`='{subject_data.get('imaging_date', '')}', " \
                         f"`kidney_stone_diagnosis`='{subject_data.get('kidney_stone_diagnosis', '')}', " \
                         f"`imaging_files`='{json.dumps(subject_data.get('imaging_files', []))}', " \
                         f"`imaging_report_summary`='{subject_data.get('imaging_report_summary', '')}', " \
                         f"`updated_by`='{subject_data.get('updated_by', 'system')}', " \
                         f"`updated_at`=NOW()"
            
            result = self.sql.update('subjects', update_info, criteria=f"`id`={subject_id}", verbose=verbose)
            
            # 檢查更新結果
            if isinstance(result, str):
                # 返回的是錯誤訊息
                return {
                    'success': False,
                    'message': f'更新失敗: {result}',
                    'error_code': 'UPDATE_FAILED'
                }
            else:
                # 沒有返回值表示更新成功
                return {
                    'success': True,
                    'message': '受試者資料更新成功',
                    'subject_id': subject_id
                }
                
        except Exception as e:
            logger.error(f"更新受試者失敗: {e}")
            return {
                'success': False,
                'message': f'更新失敗: {str(e)}',
                'error_code': 'DATABASE_ERROR'
            }
    
    def update_inclusion_criteria(self, subject_code, inclusion_data, user_id, verbose=0):
        """更新納入條件評估資料
        
        Args:
            subject_code: 受試者編號
            inclusion_data: 納入條件資料字典
            user_id: 更新者ID
            verbose: 詳細模式 (0/1)
            
        Returns:
            更新結果字典
        """
        try:
            self.connect()
            
            # 1. 檢查受試者是否存在
            existing_subject = self.sql.search('subjects', ['id'], criteria=f"`subject_code`='{subject_code}'")
            if not existing_subject:
                return {
                    'success': False,
                    'message': '受試者不存在',
                    'error_code': 'SUBJECT_NOT_FOUND'
                }
            
            # 2. 檢查納入條件記錄是否存在
            existing_inclusion = self.sql.search('inclusion_criteria', ['id'], criteria=f"`subject_code`='{subject_code}'")
            if not existing_inclusion:
                return {
                    'success': False,
                    'message': '納入條件記錄不存在',
                    'error_code': 'INCLUSION_NOT_FOUND'
                }
            
            # 3. 設定更新者
            inclusion_data['updated_by'] = user_id
            
            # 4. 更新資料庫
            # 準備更新資料
            update_info = f"`age_18_above`='{inclusion_data.get('age_18_above', 0)}', " \
                         f"`gender_available`='{inclusion_data.get('gender_available', 0)}', " \
                         f"`age_available`='{inclusion_data.get('age_available', 0)}', " \
                         f"`bmi_available`='{inclusion_data.get('bmi_available', 0)}', " \
                         f"`dm_history_available`='{inclusion_data.get('dm_history_available', 0)}', " \
                         f"`gout_history_available`='{inclusion_data.get('gout_history_available', 0)}', " \
                         f"`egfr_available`='{inclusion_data.get('egfr_available', 0)}', " \
                         f"`urine_ph_available`='{inclusion_data.get('urine_ph_available', 0)}', " \
                         f"`urine_sg_available`='{inclusion_data.get('urine_sg_available', 0)}', " \
                         f"`urine_rbc_available`='{inclusion_data.get('urine_rbc_available', 0)}', " \
                         f"`bacteriuria_available`='{inclusion_data.get('bacteriuria_available', 0)}', " \
                         f"`lab_interval_7days`='{inclusion_data.get('lab_interval_7days', 0)}', " \
                         f"`imaging_available`='{inclusion_data.get('imaging_available', 0)}', " \
                         f"`kidney_structure_visible`='{inclusion_data.get('kidney_structure_visible', 0)}', " \
                         f"`mid_ureter_visible`='{inclusion_data.get('mid_ureter_visible', 0)}', " \
                         f"`lower_ureter_visible`='{inclusion_data.get('lower_ureter_visible', 0)}', " \
                         f"`imaging_lab_interval_7days`='{inclusion_data.get('imaging_lab_interval_7days', 0)}', " \
                         f"`no_treatment_during_exam`='{inclusion_data.get('no_treatment_during_exam', 0)}', " \
                         f"`medications`='{json.dumps(inclusion_data.get('medications', []))}', " \
                         f"`surgeries`='{json.dumps(inclusion_data.get('surgeries', []))}', " \
                         f"`updated_by`='{inclusion_data.get('updated_by', 'system')}', " \
                         f"`updated_at`=NOW()"
            
            result = self.sql.update('inclusion_criteria', update_info, criteria=f"`subject_code`='{subject_code}'", verbose=verbose)
            
            # 檢查更新結果
            if isinstance(result, str):
                # 返回的是錯誤訊息
                return {
                    'success': False,
                    'message': f'更新失敗: {result}',
                    'error_code': 'UPDATE_FAILED'
                }
            else:
                # 沒有返回值表示更新成功
                return {
                    'success': True,
                    'message': '納入條件評估資料更新成功',
                    'subject_code': subject_code
                }
                
        except Exception as e:
            logger.error(f"更新納入條件資料失敗: {e}")
            return {
                'success': False,
                'message': f'更新失敗: {str(e)}',
                'error_code': 'DATABASE_ERROR'
            }
    
    def update_exclusion_criteria(self, subject_code, exclusion_data, user_id, verbose=0):
        """更新排除條件評估資料
        
        Args:
            subject_code: 受試者編號
            exclusion_data: 排除條件資料字典
            user_id: 更新者ID
            verbose: 詳細模式 (0/1)
            
        Returns:
            更新結果字典
        """
        try:
            self.connect()
            
            # 1. 檢查受試者是否存在
            existing_subject = self.sql.search('subjects', ['id'], criteria=f"`subject_code`='{subject_code}'")
            if not existing_subject:
                return {
                    'success': False,
                    'message': '受試者不存在',
                    'error_code': 'SUBJECT_NOT_FOUND'
                }
            
            # 2. 檢查排除條件記錄是否存在
            existing_exclusion = self.sql.search('exclusion_criteria', ['id'], criteria=f"`subject_code`='{subject_code}'")
            if not existing_exclusion:
                return {
                    'success': False,
                    'message': '排除條件記錄不存在',
                    'error_code': 'EXCLUSION_NOT_FOUND'
                }
            
            # 3. 設定更新者
            exclusion_data['updated_by'] = user_id
            
            # 4. 更新資料庫
            # 準備更新資料
            update_info = f"`pregnant_female`='{exclusion_data.get('pregnant_female', 0)}', " \
                         f"`kidney_transplant`='{exclusion_data.get('kidney_transplant', 0)}', " \
                         f"`urinary_tract_foreign_body`='{exclusion_data.get('urinary_tract_foreign_body', 0)}', " \
                         f"`non_stone_urological_disease`='{exclusion_data.get('non_stone_urological_disease', 0)}', " \
                         f"`renal_replacement_therapy`='{exclusion_data.get('renal_replacement_therapy', 0)}', " \
                         f"`medical_record_incomplete`='{exclusion_data.get('medical_record_incomplete', 0)}', " \
                         f"`major_blood_immune_cancer`='{exclusion_data.get('major_blood_immune_cancer', 0)}', " \
                         f"`rare_metabolic_disease`='{exclusion_data.get('rare_metabolic_disease', 0)}', " \
                         f"`investigator_judgment`='{exclusion_data.get('investigator_judgment', 0)}', " \
                         f"`updated_by`='{exclusion_data.get('updated_by', 'system')}', " \
                         f"`updated_at`=NOW()"
            
            result = self.sql.update('exclusion_criteria', update_info, criteria=f"`subject_code`='{subject_code}'", verbose=verbose)
            
            # 檢查更新結果
            if isinstance(result, str):
                # 返回的是錯誤訊息
                return {
                    'success': False,
                    'message': f'更新失敗: {result}',
                    'error_code': 'UPDATE_FAILED'
                }
            else:
                # 沒有返回值表示更新成功
                return {
                    'success': True,
                    'message': '排除條件評估資料更新成功',
                    'subject_code': subject_code
                }
                
        except Exception as e:
            logger.error(f"更新排除條件資料失敗: {e}")
            return {
                'success': False,
                'message': f'更新失敗: {str(e)}',
                'error_code': 'DATABASE_ERROR'
            }
    
    def get_subject(self, subject_id):
        """獲取受試者完整資料
        
        Args:
            subject_id: 受試者ID
            
        Returns:
            受試者資料字典
        """
        try:
            # 重新連接資料庫
            self.connect()
            
            # 獲取受試者基本資料
            subject = self.sql.search('subjects', ['*'], criteria=f"`id`={subject_id}")
            if not subject:
                return {}
            
            # 獲取納入條件
            inclusion = self.sql.search('inclusion_criteria', ['*'], criteria=f"`subject_id`={subject_id}")
            
            # 獲取排除條件
            exclusion = self.sql.search('exclusion_criteria', ['*'], criteria=f"`subject_id`={subject_id}")
            
            return {
                'subject': subject[0] if subject else {},
                'inclusion_criteria': inclusion[0] if inclusion else {},
                'exclusion_criteria': exclusion[0] if exclusion else {}
            }
        except Exception as e:
            logger.error(f"獲取受試者資料失敗: {e}")
            return {}
    
    # ==================== 資格評估功能 ====================
    
    def evaluate_eligibility(self, subject_id):
        """評估受試者資格
        
        Args:
            subject_id: 受試者ID
            
        Returns:
            資格評估結果字典
        """
        try:
            # 1. 獲取完整資料
            complete_data = self.get_subject(subject_id)
            if not complete_data:
                return {
                    'success': False,
                    'message': '受試者資料不存在',
                    'error_code': 'SUBJECT_NOT_FOUND'
                }
            
            # 2. 評估納入條件
            inclusion_score = self._evaluate_inclusion_criteria(complete_data.get('inclusion_criteria', {}))
            
            # 3. 評估排除條件
            exclusion_score = self._evaluate_exclusion_criteria(complete_data.get('exclusion_criteria', {}))
            
            # 4. 計算總體資格
            overall_eligibility = self._calculate_overall_eligibility(inclusion_score, exclusion_score)
            
            return {
                'success': True,
                'subject_id': subject_id,
                'inclusion_score': inclusion_score,
                'exclusion_score': exclusion_score,
                'overall_eligibility': overall_eligibility,
                'details': {
                    'inclusion_criteria': complete_data.get('inclusion_criteria'),
                    'exclusion_criteria': complete_data.get('exclusion_criteria')
                }
            }
            
        except Exception as e:
            logger.error(f"資格評估失敗: {e}")
            return {
                'success': False,
                'message': f'評估失敗: {str(e)}',
                'error_code': 'EVALUATION_ERROR'
            }
    
    # ==================== 工具函數 ====================
    
    def _validate_subject_data(self, data):
        """驗證受試者資料完整性
        
        Args:
            data: 受試者資料字典
            
        Returns:
            驗證結果字典
        """
        errors = []
        
        # 必填欄位檢查
        required_fields = ['subject_code', 'date_of_birth', 'gender']
        for field in required_fields:
            if not data.get(field):
                errors.append(f'缺少必填欄位: {field}')
        
        # 日期格式驗證
        try:
            if data.get('date_of_birth'):
                datetime.strptime(data['date_of_birth'], '%Y-%m-%d')
        except ValueError:
            errors.append('出生日期格式錯誤')
        
        # 數值範圍驗證
        try:
            if data.get('height_cm'):
                height = float(data['height_cm'])
                if height < 50 or height > 300:
                    errors.append('身高數值異常 (應在 50-300 cm 之間)')
        except (ValueError, TypeError):
            errors.append('身高數值格式錯誤')
        
        try:
            if data.get('weight_kg'):
                weight = float(data['weight_kg'])
                if weight < 20 or weight > 500:
                    errors.append('體重數值異常 (應在 20-500 kg 之間)')
        except (ValueError, TypeError):
            errors.append('體重數值格式錯誤')
        
        # 年齡驗證
        try:
            if data.get('age'):
                age = int(data['age'])
                if age < 0 or age > 150:
                    errors.append('年齡數值異常 (應在 0-150 歲之間)')
        except (ValueError, TypeError):
            errors.append('年齡數值格式錯誤')
        
        # BMI 驗證
        try:
            if data.get('bmi'):
                bmi = float(data['bmi'])
                if bmi < 10 or bmi > 100:
                    errors.append('BMI 數值異常 (應在 10-100 之間)')
        except (ValueError, TypeError):
            errors.append('BMI 數值格式錯誤')
        
        # 性別驗證
        try:
            if data.get('gender') is not None:
                gender = int(data['gender'])
                if gender not in [0, 1]:
                    errors.append('性別數值異常 (應為 0 或 1)')
        except (ValueError, TypeError):
            errors.append('性別數值格式錯誤')
        
        # 病史相關欄位驗證 (bac, dm, gout)
        for field_name, field_label in [('bac', '菌尿症'), ('dm', '糖尿病'), ('gout', '痛風')]:
            try:
                if data.get(field_name) is not None:
                    value = int(data[field_name])
                    if value not in [0, 1]:
                        errors.append(f'{field_label}數值異常 (應為 0 或 1)')
            except (ValueError, TypeError):
                errors.append(f'{field_label}數值格式錯誤')
        
        # 檢驗數值欄位驗證
        try:
            if data.get('scr') is not None:
                scr = float(data['scr'])
                if scr < 0 or scr > 50:
                    errors.append('血清肌酸酐數值異常 (應在 0-50 mg/dL 之間)')
        except (ValueError, TypeError):
            if data.get('scr'):  # 只有當有值時才報錯
                errors.append('血清肌酸酐數值格式錯誤')
        
        try:
            if data.get('egfr') is not None:
                egfr = float(data['egfr'])
                if egfr < 0 or egfr > 200:
                    errors.append('估算腎絲球過濾率數值異常 (應在 0-200 mL/min/1.73m² 之間)')
        except (ValueError, TypeError):
            if data.get('egfr'):  # 只有當有值時才報錯
                errors.append('估算腎絲球過濾率數值格式錯誤')
        
        try:
            if data.get('ph') is not None:
                ph = float(data['ph'])
                if ph < 4.0 or ph > 10.0:
                    errors.append('尿液酸鹼值異常 (應在 4.0-10.0 之間)')
        except (ValueError, TypeError):
            if data.get('ph'):  # 只有當有值時才報錯
                errors.append('尿液酸鹼值格式錯誤')
        
        try:
            if data.get('sg') is not None:
                sg = float(data['sg'])
                if sg < 1.000 or sg > 1.050:
                    errors.append('尿液比重異常 (應在 1.000-1.050 之間)')
        except (ValueError, TypeError):
            if data.get('sg'):  # 只有當有值時才報錯
                errors.append('尿液比重格式錯誤')
        
        try:
            if data.get('rbc') is not None:
                rbc = int(data['rbc'])
                if rbc < 0 or rbc > 1000:
                    errors.append('尿液紅血球計數異常 (應在 0-1000 /HPF 之間)')
        except (ValueError, TypeError):
            if data.get('rbc'):  # 只有當有值時才報錯
                errors.append('尿液紅血球計數格式錯誤')
        
        # 受試者編號格式驗證
        if data.get('subject_code'):
            import re
            if not re.match(r'^P[A-Za-z0-9]{2}-?[A-Za-z0-9]{4}$', data['subject_code']):
                errors.append('受試者編號格式錯誤 (應為 P+2碼機構代碼+4碼流水號，例：P01-0001)')
        
        print({
            'valid': len(errors) == 0,
            'message': '; '.join(errors) if errors else '驗證通過'
        })
        return {
            'valid': len(errors) == 0,
            'message': '; '.join(errors) if errors else '驗證通過'
        }
    
    def _evaluate_inclusion_criteria(self, inclusion_data):
        """評估納入條件分數
        
        Args:
            inclusion_data: 納入條件資料字典
            
        Returns:
            評估分數字典
        """
        if not inclusion_data:
            return {'score': 0, 'total': 0, 'percentage': 0, 'eligible': False}
        
        criteria_fields = [
            'age_18_above', 'gender_available', 'age_available', 'bmi_available',
            'egfr_available', 'urine_ph_available', 'urine_sg_available',
            'urine_rbc_available', 'bacteriuria_available', 'lab_interval_7days',
            'imaging_available', 'kidney_structure_visible', 'mid_ureter_visible',
            'lower_ureter_visible', 'imaging_lab_interval_7days', 'no_treatment_during_exam'
        ]
        
        score = 0
        total = len(criteria_fields)
        
        for field in criteria_fields:
            if inclusion_data.get(field) == 1:
                score += 1
        
        percentage = (score / total) * 100 if total > 0 else 0
        eligible = percentage >= 80  # 80% 以上為合格
        
        return {
            'score': score,
            'total': total,
            'percentage': round(percentage, 2),
            'eligible': eligible
        }
    
    def _evaluate_exclusion_criteria(self, exclusion_data):
        """評估排除條件分數
        
        Args:
            exclusion_data: 排除條件資料字典
            
        Returns:
            評估分數字典
        """
        if not exclusion_data:
            return {'score': 0, 'total': 0, 'percentage': 0, 'eligible': True}
        
        criteria_fields = [
            'pregnant_female', 'kidney_transplant', 'urinary_tract_foreign_body',
            'non_stone_urological_disease', 'renal_replacement_therapy',
            'medical_record_incomplete', 'major_blood_immune_cancer',
            'rare_metabolic_disease', 'investigator_judgment'
        ]
        
        score = 0
        total = len(criteria_fields)
        
        for field in criteria_fields:
            if exclusion_data.get(field) == 0:  # 0 表示無排除條件
                score += 1
        
        percentage = (score / total) * 100 if total > 0 else 0
        eligible = percentage >= 90  # 90% 以上為合格
        
        return {
            'score': score,
            'total': total,
            'percentage': round(percentage, 2),
            'eligible': eligible
        }
    
    def _calculate_overall_eligibility(self, inclusion_score, exclusion_score):
        """計算總體資格評估結果
        
        Args:
            inclusion_score: 納入條件分數字典
            exclusion_score: 排除條件分數字典
            
        Returns:
            總體資格結果字串
        """
        if inclusion_score['eligible'] and exclusion_score['eligible']:
            return 'Eligible'
        elif inclusion_score['eligible'] and not exclusion_score['eligible']:
            return 'Exclusion Criteria Failed'
        elif not inclusion_score['eligible'] and exclusion_score['eligible']:
            return 'Inclusion Criteria Failed'
        else:
            return 'Not Eligible'
    
    # ==================== 事務性插入功能 ====================
    
    def insert_subject_with_criteria(self, subject_data, inclusion_data, exclusion_data, user_id, verbose=0):
        """事務性插入受試者資料、納入條件和排除條件
        
        Args:
            subject_data: 受試者資料字典
            inclusion_data: 納入條件資料字典
            exclusion_data: 排除條件資料字典
            user_id: 插入者ID
            verbose: 詳細模式 (0/1)
            
        Returns:
            插入結果字典
        """
        try:
            # 重新連接資料庫
            self.connect()
            
            # 開始事務
            self.sql.execute("START TRANSACTION")
            
            # 1. 插入受試者資料（事務模式，不自動提交）
            subject_result = self.insert_subject(subject_data, user_id, verbose, auto_commit=False)
            if not subject_result['success']:
                # 回滾事務
                self.sql.execute("ROLLBACK")
                return subject_result
            
            # 2. 插入納入條件（事務模式，不自動提交）
            inclusion_result = self.insert_inclusion_criteria(subject_result, inclusion_data, user_id, verbose, auto_commit=False)
            if not inclusion_result['success']:
                # 回滾事務
                self.sql.execute("ROLLBACK")
                return inclusion_result
            
            # 3. 插入排除條件（事務模式，不自動提交）
            exclusion_result = self.insert_exclusion_criteria(subject_result['subject_code'], exclusion_data, user_id, verbose, auto_commit=False)
            if not exclusion_result['success']:
                # 回滾事務
                self.sql.execute("ROLLBACK")
                return exclusion_result
            
            # 所有插入都成功，提交事務
            self.sql.execute("COMMIT")
            
            return {
                'success': True,
                'message': '受試者資料、納入條件和排除條件全部插入成功',
                'subject_code': subject_result['subject_code'],
                'subject_id': subject_result['subject_id'],
                'inclusion_id': inclusion_result['inclusion_id'],
                'exclusion_id': exclusion_result['exclusion_id']
            }
            
        except Exception as e:
            # 發生異常，回滾事務
            try:
                self.sql.execute("ROLLBACK")
            except:
                pass  # 忽略回滾失敗的錯誤
            
            logger.error(f"事務性插入失敗: {e}")
            return {
                'success': False,
                'message': f'事務性插入失敗: {str(e)}',
                'error_code': 'TRANSACTION_ERROR'
            }

    def update_subject_with_criteria(self, subject_code, subject_data, inclusion_data, exclusion_data, user_id, edit_log_data=None, verbose=0):
        """事務性更新受試者資料、納入條件和排除條件
        
        Args:
            subject_code: 受試者編號
            subject_data: 受試者資料字典
            inclusion_data: 納入條件資料字典
            exclusion_data: 排除條件資料字典
            user_id: 更新者ID
            verbose: 詳細模式 (0/1)
            edit_log_data: 編輯日誌資料
            
        Returns:
            更新結果字典
        """
        try:
            # 重新連接資料庫
            self.connect()
            
            # 開始事務
            self.sql.execute("START TRANSACTION")
            
            # 1. 獲取受試者ID
            subject_result = self.sql.search('subjects', ['id'], criteria=f"`subject_code`='{subject_code}'")
            if not subject_result:
                self.sql.execute("ROLLBACK")
                return {
                    'success': False,
                    'message': '受試者不存在',
                    'error_code': 'SUBJECT_NOT_FOUND'
                }
            subject_id = subject_result[0][0]
            
            # 2. 更新受試者資料（事務模式，不自動提交）
            subject_update_result = self.update_subject(subject_id, subject_data, user_id, verbose)
            if not subject_update_result['success']:
                # 回滾事務
                self.sql.execute("ROLLBACK")
                return subject_update_result
            
            # 3. 更新納入條件（事務模式，不自動提交）
            inclusion_update_result = self.update_inclusion_criteria(subject_code, inclusion_data, user_id, verbose)
            if not inclusion_update_result['success']:
                # 回滾事務
                self.sql.execute("ROLLBACK")
                return inclusion_update_result
            
            # 4. 更新排除條件（事務模式，不自動提交）
            exclusion_update_result = self.update_exclusion_criteria(subject_code, exclusion_data, user_id, verbose)
            if not exclusion_update_result['success']:
                # 回滾事務
                self.sql.execute("ROLLBACK")
                return exclusion_update_result
            
            # 5. 處理編輯日誌（如果有變更記錄）
            print("edit_log_data received: ", edit_log_data)
            if edit_log_data and edit_log_data.get('changes'):
                log_id = edit_log_data.get('log_id')
                changes = edit_log_data.get('changes', [])
                print("log_id: ", log_id)
                # print("changes: ", changes)
                # print("changes length: ", len(changes))
                
                # 插入 edit_log 記錄
                for change in changes:
                    columns = ['log_id', 'subject_code', 'table_name', 'field_name', 'old_value', 'new_value', 'action', 'user_id', 'created_at']
                    values = [
                        change['log_id'],
                        change['subject_code'],
                        change['table_name'],
                        change['field_name'],
                        change['old_value'],
                        change['new_value'],
                        change['action'],
                        change['user_id'],
                        'NOW()'
                    ]
                    
                    # 手動構建 INSERT 語句以避免 NOW() 被當作字串
                    columns_str = ','.join(columns)
                    values_str = "'" + "','".join(values[:-1]) + "',NOW()"  # 最後一個值使用 NOW() 函數
                    query = f"INSERT INTO edit_log({columns_str}) VALUES({values_str})"
                    
                    if verbose:
                        print("Query String(Insert): " + query)
                    
                    try:
                        cursor = self.sql.db.cursor()
                        cursor.execute(query)
                        self.sql.db.commit()
                        insert_result = None  # 成功時返回 None
                    except Exception as err:
                        self.sql.db.rollback()
                        print("fault! err=", err)
                        insert_result = str(err)
                    if isinstance(insert_result, str):
                        # 插入失敗，回滾事務
                        self.sql.execute("ROLLBACK")
                        return {
                            'success': False,
                            'message': f'插入編輯日誌失敗: {insert_result}',
                            'error_code': 'INSERT_LOG_FAILED'
                        }
                
                # 更新三個主資料表的 log 欄位（累積格式）
                if log_id:
                    # 獲取現有的 log 值並累積新的 log_id
                    def get_updated_log(table_name):
                        current_log_result = self.sql.search(table_name, ['log'], criteria=f"`subject_code`='{subject_code}'", verbose=verbose)
                        if current_log_result and current_log_result[0][0]:
                            current_log = current_log_result[0][0]
                            return f"{current_log};{log_id}"
                        else:
                            return log_id
                    
                    # 更新 subjects 表
                    subjects_log = get_updated_log('subjects')
                    subjects_update = f"`log`='{subjects_log}'"
                    subjects_result = self.sql.update('subjects', subjects_update, criteria=f"`subject_code`='{subject_code}'", verbose=verbose)
                    if isinstance(subjects_result, str):
                        self.sql.execute("ROLLBACK")
                        return {
                            'success': False,
                            'message': f'更新 subjects log 欄位失敗: {subjects_result}',
                            'error_code': 'UPDATE_LOG_FAILED'
                        }
                    
                    # 更新 inclusion_criteria 表
                    inclusion_log = get_updated_log('inclusion_criteria')
                    inclusion_update = f"`log`='{inclusion_log}'"
                    inclusion_result = self.sql.update('inclusion_criteria', inclusion_update, criteria=f"`subject_code`='{subject_code}'", verbose=verbose)
                    if isinstance(inclusion_result, str):
                        self.sql.execute("ROLLBACK")
                        return {
                            'success': False,
                            'message': f'更新 inclusion_criteria log 欄位失敗: {inclusion_result}',
                            'error_code': 'UPDATE_LOG_FAILED'
                        }
                    
                    # 更新 exclusion_criteria 表
                    exclusion_log = get_updated_log('exclusion_criteria')
                    exclusion_update = f"`log`='{exclusion_log}'"
                    exclusion_result = self.sql.update('exclusion_criteria', exclusion_update, criteria=f"`subject_code`='{subject_code}'", verbose=verbose)
                    if isinstance(exclusion_result, str):
                        self.sql.execute("ROLLBACK")
                        return {
                            'success': False,
                            'message': f'更新 exclusion_criteria log 欄位失敗: {exclusion_result}',
                            'error_code': 'UPDATE_LOG_FAILED'
                        }
            else:
                print("No edit_log_data or no changes found")
                print("edit_log_data type: ", type(edit_log_data))
                if edit_log_data:
                    print("edit_log_data keys: ", edit_log_data.keys())
            
            # 所有更新都成功，提交事務
            self.sql.execute("COMMIT")
            
            return {
                'success': True,
                'message': '受試者資料、納入條件和排除條件全部更新成功',
                'subject_code': subject_code,
                'subject_id': subject_id
            }
            
        except Exception as e:
            # 發生異常，回滾事務
            try:
                self.sql.execute("ROLLBACK")
            except:
                pass  # 忽略回滾失敗的錯誤
            
            logger.error(f"事務性更新失敗: {e}")
            return {
                'success': False,
                'message': f'事務性更新失敗: {str(e)}',
                'error_code': 'TRANSACTION_ERROR'
            }

    def _format_subject_data(self, row):
        """格式化受試者資料
        
        Args:
            row: 從資料庫查詢出來的原始資料行
            
        Returns:
            格式化後的受試者資料字典
        """
        try:
            # 將資料庫查詢結果轉換為字典格式
            if isinstance(row, (list, tuple)):
                # 如果是元組或列表，需要根據欄位順序轉換
                # 根據 subjects 表的欄位順序
                columns = [
                    'id', 'subject_code', 'date_of_birth', 'age', 'gender', 
                    'height_cm', 'weight_kg', 'bmi', 'scr', 'egfr', 'ph', 'sg', 'rbc', 'bac', 'dm', 'gout', 
                    'imaging_type', 'imaging_date', 'kidney_stone_diagnosis', 
                    'imaging_files', 'imaging_report_summary', 'log', 'status', 'created_by', 
                    'created_at', 'updated_by', 'updated_at'
                ]
                
                subject_data = {}
                for i, col in enumerate(columns):
                    if i < len(row):
                        subject_data[col] = row[i]
                    else:
                        subject_data[col] = None
            else:
                # 如果已經是字典格式，直接使用
                subject_data = dict(row) if hasattr(row, '__iter__') else row
            
            # 格式化性別顯示
            if 'gender' in subject_data:
                subject_data['gender_display'] = '男' if subject_data['gender'] == 1 else '女'
            
            # 格式化布林值欄位
            boolean_fields = ['bac', 'dm', 'gout', 'kidney_stone_diagnosis']
            for field in boolean_fields:
                if field in subject_data:
                    subject_data[f'{field}_display'] = '是' if subject_data[field] == 1 else '否'
            
            # 格式化新增的檢驗數值欄位
            lab_fields = ['scr', 'egfr', 'ph', 'sg', 'rbc']
            for field in lab_fields:
                if field in subject_data and subject_data[field] is not None:
                    if field in ['scr', 'egfr']:
                        subject_data[f'{field}_formatted'] = f"{subject_data[field]:.2f}"
                    elif field in ['ph', 'sg']:
                        subject_data[f'{field}_formatted'] = f"{subject_data[field]:.1f}"
                    else:
                        subject_data[f'{field}_formatted'] = str(subject_data[field])
            
            # 格式化影像檢查類型
            if 'imaging_type' in subject_data:
                subject_data['imaging_type_display'] = subject_data['imaging_type'] or '未指定'
            
            # 格式化日期欄位
            date_fields = ['date_of_birth', 'imaging_date', 'created_at', 'updated_at']
            for field in date_fields:
                if field in subject_data and subject_data[field]:
                    # 如果日期是字串格式，嘗試格式化
                    if isinstance(subject_data[field], str):
                        try:
                            # 嘗試解析日期並格式化
                            from datetime import datetime
                            date_obj = datetime.strptime(subject_data[field], '%Y-%m-%d %H:%M:%S')
                            subject_data[f'{field}_formatted'] = date_obj.strftime('%Y-%m-%d %H:%M:%S')
                        except:
                            subject_data[f'{field}_formatted'] = subject_data[field]
                    else:
                        subject_data[f'{field}_formatted'] = str(subject_data[field])
            
            # 格式化數值欄位
            numeric_fields = ['age', 'height_cm', 'weight_kg', 'bmi']
            for field in numeric_fields:
                if field in subject_data and subject_data[field] is not None:
                    if field == 'bmi':
                        subject_data[f'{field}_formatted'] = f"{subject_data[field]:.2f}"
                    elif field in ['height_cm', 'weight_kg']:
                        subject_data[f'{field}_formatted'] = f"{subject_data[field]:.1f}"
                    else:
                        subject_data[f'{field}_formatted'] = str(subject_data[field])
            
            return subject_data
            
        except Exception as e:
            logger.error(f"格式化受試者資料失敗: {e}")
            # 如果格式化失敗，返回原始資料
            return row if hasattr(row, '__iter__') else {'error': '格式化失敗', 'raw_data': str(row)}

    def get_subject_by_id(self, subject_id, verbose=0):
        """根據 ID 獲取受試者資料
        
        Args:
            subject_id: 受試者ID
            verbose: 詳細模式 (0/1)
            
        Returns:
            受試者資料字典或 None
        """
        try:
            self.connect()
            result = self.sql.search('subjects', ['*'], criteria=f"`id`={subject_id}", verbose=verbose)
            if result:
                return self._format_subject_data(result[0])
            return None
        except Exception as e:
            logger.error(f"Error getting subject by ID: {e}")
            return None
        finally:
            self.disconnect()
    
    def get_subject_by_code(self, subject_code, verbose=0):
        """根據受試者編號獲取受試者資料
        
        Args:
            subject_code: 受試者編號
            verbose: 詳細模式 (0/1)
            
        Returns:
            受試者資料字典或 None
        """
        try:
            self.connect()
            result = self.sql.search('subjects', ['*'], criteria=f"`subject_code`='{subject_code}'", verbose=verbose)
            if result:
                return self._format_subject_data(result[0])
            return None
        except Exception as e:
            logger.error(f"Error getting subject by code: {e}")
            return None
        finally:
            self.disconnect()
    
    def get_subject_detail_by_code(self, subject_code, verbose=0):
        """根據受試者編號獲取受試者完整詳細資料（包含納入和排除條件）
        
        Args:
            subject_code: 受試者編號 (字串)
            verbose: 詳細模式 (0/1)
            
        Returns:
            包含完整資料的字典或 None
        """
        try:
            self.connect()
            
            # 1. 獲取基本受試者資料
            subject_result = self.sql.search('subjects', ['*'], criteria=f"`subject_code`='{subject_code}'", verbose=verbose)
            if not subject_result:
                return None
            
            subject_data = self._format_subject_data(subject_result[0])
            
            # 2. 獲取納入條件資料
            inclusion_result = self.sql.search('inclusion_criteria', ['*'], criteria=f"`subject_code`='{subject_code}'", verbose=verbose)
            inclusion_data = None
            if inclusion_result:
                inclusion_data = self._format_inclusion_criteria_data(inclusion_result[0])
            
            # 3. 獲取排除條件資料
            exclusion_result = self.sql.search('exclusion_criteria', ['*'], criteria=f"`subject_code`='{subject_code}'", verbose=verbose)
            exclusion_data = None
            if exclusion_result:
                exclusion_data = self._format_exclusion_criteria_data(exclusion_result[0])
            
            # 4. 組合完整資料
            complete_data = {
                'subject': subject_data,
                'inclusion_criteria': inclusion_data,
                'exclusion_criteria': exclusion_data
            }
            
            return complete_data
            
        except Exception as e:
            logger.error(f"Error getting subject detail by code: {e}")
            return None
        finally:
            self.disconnect()
    
    def search_subjects(self, user_id, filters=None, page=1, page_size=20, sort_field='id', sort_direction='DESC', verbose=0):
        """搜尋受試者資料（支援分頁和排序）
        
        Args:
            user_id: 當前使用者ID
            filters: 篩選條件字典
            page: 頁碼 (從1開始)
            page_size: 每頁記錄數
            sort_field: 排序欄位
            sort_direction: 排序方向 ('ASC' 或 'DESC')
            verbose: 詳細模式 (0/1)
            
        Returns:
            搜尋結果字典，包含資料和分頁資訊
        """
        try:
            self.connect()
            
            # 構建查詢條件
            criteria = f"`created_by` = '{user_id}'"
            if filters:
                if filters.get('subject_code'):
                    criteria += f" AND `subject_code` LIKE '%{filters['subject_code']}%'"
                if filters.get('gender') is not None:
                    criteria += f" AND `gender` = {filters['gender']}"
                if filters.get('age_min') is not None:
                    criteria += f" AND `age` >= {filters['age_min']}"
                if filters.get('age_max') is not None:
                    criteria += f" AND `age` <= {filters['age_max']}"
                if filters.get('bmi_min') is not None:
                    criteria += f" AND `bmi` >= {filters['bmi_min']}"
                if filters.get('bmi_max') is not None:
                    criteria += f" AND `bmi` <= {filters['bmi_max']}"
                if filters.get('scr_min') is not None:
                    criteria += f" AND `scr` >= {filters['scr_min']}"
                if filters.get('scr_max') is not None:
                    criteria += f" AND `scr` <= {filters['scr_max']}"
                if filters.get('egfr_min') is not None:
                    criteria += f" AND `egfr` >= {filters['egfr_min']}"
                if filters.get('egfr_max') is not None:
                    criteria += f" AND `egfr` <= {filters['egfr_max']}"
                if filters.get('imaging_type'):
                    criteria += f" AND `imaging_type` = '{filters['imaging_type']}'"
                if filters.get('kidney_stone_diagnosis') is not None:
                    criteria += f" AND `kidney_stone_diagnosis` = {filters['kidney_stone_diagnosis']}"
                if filters.get('date_from'):
                    criteria += f" AND `created_at` >= '{filters['date_from']}'"
                if filters.get('date_to'):
                    criteria += f" AND `created_at` <= '{filters['date_to']} 23:59:59'"
                if filters.get('dm') is not None:
                    criteria += f" AND `dm` = {filters['dm']}"
                if filters.get('gout') is not None:
                    criteria += f" AND `gout` = {filters['gout']}"
                if filters.get('bac') is not None:
                    criteria += f" AND `bac` = {filters['bac']}"
            
            print("criteria: ", criteria)
            # 計算總記錄數
            total_result = self.sql.search('subjects', ['COUNT(*) as total'], criteria=criteria, verbose=verbose)
            total_records = total_result[0][0] if total_result else 0
            
            # 計算分頁
            total_pages = (total_records + page_size - 1) // page_size
            offset = (page - 1) * page_size
            
            # 執行分頁查詢
            order_clause = f"{sort_field} {sort_direction}"
            result = self.sql.search('subjects', ['*'], criteria=criteria, order=order_clause, verbose=verbose)
            
            if result:
                start_idx = offset
                end_idx = offset + page_size
                result = result[start_idx:end_idx]
            
            # 格式化資料
            subjects = []
            for row in result:
                subject_data = self._format_subject_data(row)
                # 獲取納入條件和排除條件
                subject_data['inclusion_criteria'] = self._get_inclusion_criteria(subject_data['subject_code'])
                subject_data['exclusion_criteria'] = self._get_exclusion_criteria(subject_data['subject_code'])
                subjects.append(subject_data)
            
            return {
                'success': True,
                'data': subjects,
                'pagination': {
                    'current_page': page,
                    'page_size': page_size,
                    'total_records': total_records,
                    'total_pages': total_pages
                }
            }
            
        except Exception as e:
            logger.error(f"Error searching subjects: {e}")
            return {
                'success': False,
                'message': f'搜尋失敗: {str(e)}',
                'data': [],
                'pagination': {
                    'current_page': page,
                    'page_size': page_size,
                    'total_records': 0,
                    'total_pages': 0
                }
            }
        finally:
            self.disconnect()
    
    def get_subject_statistics(self, verbose=0):
        """獲取受試者統計資料
        
        Args:
            verbose: 詳細模式 (0/1)
            
        Returns:
            統計資料字典
        """
        try:
            self.connect()
            
            # 總受試者數
            total_result = self.sql.search('subjects', ['COUNT(*) as total'], verbose=verbose)
            total_subjects = total_result[0][0] if total_result else 0
            
            # 性別統計
            male_result = self.sql.search('subjects', ['*'], criteria='gender=1', verbose=verbose)
            female_result = self.sql.search('subjects', ['*'], criteria='gender=0', verbose=verbose)
            gender_stats = {
                '男': len(male_result) if male_result else 0,
                '女': len(female_result) if female_result else 0
            }
            
            # 年齡統計 - 按年齡範圍分組
            age_ranges = {
                '0-20歲': 'age >= 0 AND age <= 20',
                '21-40歲': 'age >= 21 AND age <= 40',
                '41-60歲': 'age >= 41 AND age <= 60',
                '61-80歲': 'age >= 61 AND age <= 80',
                '80歲以上': 'age > 80'
            }
            age_stats = {}
            for range_name, criteria in age_ranges.items():
                result = self.sql.search('subjects', ['*'], criteria=criteria, verbose=verbose)
                age_stats[range_name] = len(result) if result else 0
            
            # BMI 統計 - 按 BMI 範圍分組
            bmi_ranges = {
                '偏瘦(<18.5)': 'bmi < 18.5',
                '正常(18.5-24.9)': 'bmi >= 18.5 AND bmi <= 24.9',
                '過重(25-29.9)': 'bmi >= 25 AND bmi <= 29.9',
                '肥胖(≥30)': 'bmi >= 30'
            }
            bmi_stats = {}
            for range_name, criteria in bmi_ranges.items():
                result = self.sql.search('subjects', ['*'], criteria=criteria, verbose=verbose)
                bmi_stats[range_name] = len(result) if result else 0
            
            # 影像檢查類型統計
            ct_result = self.sql.search('subjects', ['*'], criteria="imaging_type='CT'", verbose=verbose)
            pet_ct_result = self.sql.search('subjects', ['*'], criteria="imaging_type='PET-CT'", verbose=verbose)
            no_imaging_result = self.sql.search('subjects', ['*'], criteria="imaging_type IS NULL OR imaging_type=''", verbose=verbose)
            
            imaging_stats = {
                'CT': len(ct_result) if ct_result else 0,
                'PET-CT': len(pet_ct_result) if pet_ct_result else 0,
                '未指定': len(no_imaging_result) if no_imaging_result else 0
            }
            
            # 腎結石診斷統計
            stone_yes_result = self.sql.search('subjects', ['*'], criteria='kidney_stone_diagnosis=1', verbose=verbose)
            stone_no_result = self.sql.search('subjects', ['*'], criteria='kidney_stone_diagnosis=0', verbose=verbose)
            stone_unknown_result = self.sql.search('subjects', ['*'], criteria='kidney_stone_diagnosis IS NULL', verbose=verbose)
            
            stone_stats = {
                '是': len(stone_yes_result) if stone_yes_result else 0,
                '否': len(stone_no_result) if stone_no_result else 0,
                '未知': len(stone_unknown_result) if stone_unknown_result else 0
            }
            
            return {
                'success': True,
                'total_subjects': total_subjects,
                'gender_distribution': gender_stats,
                'age_distribution': age_stats,
                'bmi_distribution': bmi_stats,
                'imaging_type_distribution': imaging_stats,
                'kidney_stone_diagnosis_distribution': stone_stats
            }
            
        except Exception as e:
            logger.error(f"Error getting statistics: {e}")
            return {
                'success': False,
                'message': f'獲取統計資料失敗: {str(e)}'
            }
        finally:
            self.disconnect()
    
    def export_subjects_data(self, filters=None, format='csv', verbose=0):
        """匯出受試者資料
        
        Args:
            filters: 篩選條件字典
            format: 匯出格式 ('csv', 'json', 'excel')
            verbose: 詳細模式 (0/1)
            
        Returns:
            匯出結果字典
        """
        try:
            self.connect()
            
            # 構建查詢條件
            criteria = "1=1"
            if filters:
                if filters.get('subject_code'):
                    criteria += f" AND `subject_code` LIKE '%{filters['subject_code']}%'"
                if filters.get('gender') is not None:
                    criteria += f" AND `gender` = {filters['gender']}"
                if filters.get('age_min') is not None:
                    criteria += f" AND `age` >= {filters['age_min']}"
                if filters.get('age_max') is not None:
                    criteria += f" AND `age` <= {filters['age_max']}"
                if filters.get('imaging_type'):
                    criteria += f" AND `imaging_type` = '{filters['imaging_type']}'"
                if filters.get('date_from'):
                    criteria += f" AND `created_at` >= '{filters['date_from']}'"
                if filters.get('date_to'):
                    criteria += f" AND `created_at` <= '{filters['date_to']}'"
            
            # 查詢所有符合條件的資料
            result = self.sql.search('subjects', ['*'], criteria=criteria, verbose=verbose)
            
            if not result:
                return {
                    'success': False,
                    'message': '沒有找到符合條件的資料'
                }
            
            # 格式化資料
            subjects = []
            for row in result:
                subject_data = self._format_subject_data(row)
                # 獲取納入條件和排除條件
                subject_data['inclusion_criteria'] = self._get_inclusion_criteria(subject_data['subject_code'])
                subject_data['exclusion_criteria'] = self._get_exclusion_criteria(subject_data['subject_code'])
                subjects.append(subject_data)
            
            # 根據格式處理資料
            if format == 'json':
                export_data = json.dumps(subjects, ensure_ascii=False, indent=2)
                content_type = 'application/json'
                filename = f'subjects_export_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'
            elif format == 'csv':
                export_data = self._convert_to_csv(subjects)
                content_type = 'text/csv'
                filename = f'subjects_export_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv'
            else:
                return {
                    'success': False,
                    'message': f'不支援的匯出格式: {format}'
                }
            
            return {
                'success': True,
                'data': export_data,
                'content_type': content_type,
                'filename': filename,
                'record_count': len(subjects)
            }
            
        except Exception as e:
            logger.error(f"Error exporting data: {e}")
            return {
                'success': False,
                'message': f'匯出失敗: {str(e)}'
            }
        finally:
            self.disconnect()
    
    def _get_inclusion_criteria(self, subject_code):
        """獲取納入條件資料
        
        Args:
            subject_code: 受試者編號
            
        Returns:
            納入條件資料字典或 None
        """
        try:
            result = self.sql.search('inclusion_criteria', ['*'], 
                                   criteria=f"`subject_code`='{subject_code}'", verbose=0)
            if result:
                return self._format_inclusion_criteria_data(result[0])
            return None
        except:
            return None
    
    def _get_exclusion_criteria(self, subject_code):
        """獲取排除條件資料
        
        Args:
            subject_code: 受試者編號
            
        Returns:
            排除條件資料字典或 None
        """
        try:
            result = self.sql.search('exclusion_criteria', ['*'], 
                                   criteria=f"`subject_code`='{subject_code}'", verbose=0)
            if result:
                return self._format_exclusion_criteria_data(result[0])
            return None
        except:
            return None
    
    def _convert_to_csv(self, data):
        """將資料轉換為 CSV 格式
        
        Args:
            data: 資料列表
            
        Returns:
            CSV 字串
        """
        if not data:
            return ""
        
        # 獲取所有欄位
        fields = set()
        for item in data:
            fields.update(item.keys())
        
        # 排序欄位
        field_order = [
            'subject_code', 'date_of_birth', 'age', 'gender', 'height_cm', 'weight_kg', 'bmi',
            'bac', 'dm', 'gout', 'imaging_type', 'imaging_date', 'kidney_stone_diagnosis',
            'created_at', 'created_by'
        ]
        
        # 添加其他欄位
        for field in sorted(fields):
            if field not in field_order:
                field_order.append(field)
        
        # 生成 CSV
        csv_lines = []
        csv_lines.append(','.join(field_order))
        
        for item in data:
            row = []
            for field in field_order:
                value = item.get(field, '')
                if isinstance(value, (dict, list)):
                    value = json.dumps(value, ensure_ascii=False)
                row.append(str(value))
            csv_lines.append(','.join(row))
        
        return '\n'.join(csv_lines)

    def _format_inclusion_criteria_data(self, row):
        """格式化納入條件資料
        
        Args:
            row: 資料庫查詢結果行
            
        Returns:
            格式化後的納入條件資料字典
        """
        try:
            # 根據資料庫欄位順序映射
            field_names = [
                'id', 'subject_code', 'age_18_above', 'gender_available', 'age_available',
                'bmi_available', 'dm_history_available', 'gout_history_available',
                'egfr_available', 'urine_ph_available', 'urine_sg_available',
                'urine_rbc_available', 'bacteriuria_available', 'lab_interval_7days',
                'imaging_available', 'kidney_structure_visible', 'mid_ureter_visible',
                'lower_ureter_visible', 'imaging_lab_interval_7days', 'no_treatment_during_exam',
                'medications', 'surgeries', 'created_by', 'created_at', 'updated_by', 'updated_at'
            ]
            
            formatted_data = {}
            for i, field_name in enumerate(field_names):
                if i < len(row):
                    value = row[i]
                    # 處理特殊欄位
                    if field_name in ['medications', 'surgeries'] and value:
                        try:
                            formatted_data[field_name] = json.loads(value) if value != '[]' else []
                        except:
                            formatted_data[field_name] = []
                    else:
                        formatted_data[field_name] = value
                else:
                    formatted_data[field_name] = None
            
            return formatted_data
            
        except Exception as e:
            logger.error(f"Error formatting inclusion criteria data: {e}")
            return {}
    
    def _format_exclusion_criteria_data(self, row):
        """格式化排除條件資料
        
        Args:
            row: 資料庫查詢結果行
            
        Returns:
            格式化後的排除條件資料字典
        """
        try:
            # 根據資料庫欄位順序映射
            field_names = [
                'id', 'subject_code', 'pregnant_female', 'kidney_transplant',
                'urinary_tract_foreign_body', 'urinary_tract_foreign_body_type',
                'non_stone_urological_disease', 'non_stone_urological_disease_type',
                'renal_replacement_therapy', 'renal_replacement_therapy_type',
                'medical_record_incomplete', 'major_blood_immune_cancer',
                'major_blood_immune_cancer_type', 'rare_metabolic_disease',
                'rare_metabolic_disease_type', 'investigator_judgment', 'judgment_reason',
                'created_by', 'created_at', 'updated_by', 'updated_at'
            ]
            
            formatted_data = {}
            for i, field_name in enumerate(field_names):
                if i < len(row):
                    value = row[i]
                    formatted_data[field_name] = value
                else:
                    formatted_data[field_name] = None
            
            return formatted_data
            
        except Exception as e:
            logger.error(f"Error formatting exclusion criteria data: {e}")
            return {}

    def get_subject_history(self, subject_code, verbose=0):
        """獲取受試者的歷程記錄
        
        Args:
            subject_code: 受試者編號
            verbose: 詳細模式
            
        Returns:
            歷程記錄列表
        """
        try:
            self.connect()
            
            # 查詢該受試者的所有 edit_log 記錄
            columns = ['log_id', 'table_name', 'field_name', 'old_value', 'new_value', 'action', 'user_id', 'created_at']
            criteria = f"`subject_code`='{subject_code}'"
            
            results = self.sql.search('edit_log', columns, criteria=criteria, verbose=verbose)
            
            if not results:
                return []
            
            # 格式化結果
            history = []
            for row in results:
                history.append({
                    'log_id': row[0],
                    'table_name': row[1],
                    'field_name': row[2],
                    'old_value': row[3],
                    'new_value': row[4],
                    'action': row[5],
                    'user_id': row[6],
                    'created_at': row[7].strftime('%Y-%m-%d %H:%M:%S') if row[7] else ''
                })
            
            # 按時間和 log_id 排序（最新的在前）
            history.sort(key=lambda x: (x['created_at'], x['log_id']), reverse=True)
            
            return history
            
        except Exception as e:
            logger.error(f"Error getting subject history: {e}")
            return []
        finally:
            self.disconnect()

