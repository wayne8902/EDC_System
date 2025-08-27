"""
EDC 系統資料模型

定義 EDC 系統相關的資料庫模型，包括受試者、納入條件、排除條件等。
"""

import json
from datetime import datetime
from typing import List, Dict, Any, Optional


class Subject:
    """受試者資料模型"""
    
    def __init__(self, subject_data: Dict[str, Any]):
        self.id = subject_data.get('id')
        self.subject_code = subject_data.get('subject_code')
        self.date_of_birth = subject_data.get('date_of_birth')
        self.age = subject_data.get('age')
        self.gender = subject_data.get('gender')
        self.height_cm = subject_data.get('height_cm')
        self.weight_kg = subject_data.get('weight_kg')
        self.bmi = subject_data.get('bmi')
        self.medical_history = subject_data.get('medical_history')
        self.bac = subject_data.get('bac', 0)
        self.dm = subject_data.get('dm', 0)
        self.gout = subject_data.get('gout', 0)
        self.imaging_type = subject_data.get('imaging_type')
        self.imaging_date = subject_data.get('imaging_date')
        self.kidney_stone_diagnosis = subject_data.get('kidney_stone_diagnosis')
        self.imaging_files = self._parse_json_field(subject_data.get('imaging_files', '[]'))
        self.imaging_report_summary = subject_data.get('imaging_report_summary')
        self.created_by = subject_data.get('created_by')
        self.created_at = subject_data.get('created_at')
        self.updated_by = subject_data.get('updated_by')
        self.updated_at = subject_data.get('updated_at')
    
    def _parse_json_field(self, json_str: str) -> List:
        """解析 JSON 字串為 Python 列表"""
        try:
            return json.loads(json_str) if json_str else []
        except (json.JSONDecodeError, TypeError):
            return []
    
    def to_dict(self) -> Dict[str, Any]:
        """轉換為字典格式"""
        return {
            'id': self.id,
            'subject_code': self.subject_code,
            'date_of_birth': self.date_of_birth,
            'age': self.age,
            'gender': self.gender,
            'height_cm': self.height_cm,
            'weight_kg': self.weight_kg,
            'bmi': self.bmi,
            'medical_history': self.medical_history,
            'bac': self.bac,
            'dm': self.dm,
            'gout': self.gout,
            'imaging_type': self.imaging_type,
            'imaging_date': self.imaging_date,
            'kidney_stone_diagnosis': self.kidney_stone_diagnosis,
            'imaging_files': self.imaging_files,
            'imaging_report_summary': self.imaging_report_summary,
            'created_by': self.created_by,
            'created_at': self.created_at,
            'updated_by': self.updated_by,
            'updated_at': self.updated_at
        }


class InclusionCriteria:
    """納入條件評估模型"""
    
    def __init__(self, inclusion_data: Dict[str, Any]):
        self.id = inclusion_data.get('id')
        self.subject_id = inclusion_data.get('subject_id')
        self.age_18_above = inclusion_data.get('age_18_above')
        self.gender_available = inclusion_data.get('gender_available')
        self.age_available = inclusion_data.get('age_available')
        self.bmi_available = inclusion_data.get('bmi_available')
        self.dm_history_available = inclusion_data.get('dm_history_available')
        self.gout_history_available = inclusion_data.get('gout_history_available')
        self.egfr_available = inclusion_data.get('egfr_available')
        self.urine_ph_available = inclusion_data.get('urine_ph_available')
        self.urine_sg_available = inclusion_data.get('urine_sg_available')
        self.urine_rbc_available = inclusion_data.get('urine_rbc_available')
        self.bacteriuria_available = inclusion_data.get('bacteriuria_available')
        self.lab_interval_7days = inclusion_data.get('lab_interval_7days')
        self.imaging_available = inclusion_data.get('imaging_available')
        self.kidney_structure_visible = inclusion_data.get('kidney_structure_visible')
        self.mid_ureter_visible = inclusion_data.get('mid_ureter_visible')
        self.lower_ureter_visible = inclusion_data.get('lower_ureter_visible')
        self.imaging_lab_interval_7days = inclusion_data.get('imaging_lab_interval_7days')
        self.no_treatment_during_exam = inclusion_data.get('no_treatment_during_exam')
        self.created_by = inclusion_data.get('created_by')
        self.created_at = inclusion_data.get('created_at')
        self.updated_by = inclusion_data.get('updated_by')
        self.updated_at = inclusion_data.get('updated_at')
    
    def to_dict(self) -> Dict[str, Any]:
        """轉換為字典格式"""
        return {
            'id': self.id,
            'subject_id': self.subject_id,
            'age_18_above': self.age_18_above,
            'gender_available': self.gender_available,
            'age_available': self.age_available,
            'bmi_available': self.bmi_available,
            'dm_history_available': self.dm_history_available,
            'gout_history_available': self.gout_history_available,
            'egfr_available': self.egfr_available,
            'urine_ph_available': self.urine_ph_available,
            'urine_sg_available': self.urine_sg_available,
            'urine_rbc_available': self.urine_rbc_available,
            'bacteriuria_available': self.bacteriuria_available,
            'lab_interval_7days': self.lab_interval_7days,
            'imaging_available': self.imaging_available,
            'kidney_structure_visible': self.kidney_structure_visible,
            'mid_ureter_visible': self.mid_ureter_visible,
            'lower_ureter_visible': self.lower_ureter_visible,
            'imaging_lab_interval_7days': self.imaging_lab_interval_7days,
            'no_treatment_during_exam': self.no_treatment_during_exam,
            'created_by': self.created_by,
            'created_at': self.created_at,
            'updated_by': self.updated_by,
            'updated_at': self.updated_at
        }


class ExclusionCriteria:
    """排除條件評估模型"""
    
    def __init__(self, exclusion_data: Dict[str, Any]):
        self.id = exclusion_data.get('id')
        self.subject_id = exclusion_data.get('subject_id')
        self.pregnant_female = exclusion_data.get('pregnant_female')
        self.kidney_transplant = exclusion_data.get('kidney_transplant')
        self.urinary_tract_foreign_body = exclusion_data.get('urinary_tract_foreign_body')
        self.foreign_body_type = exclusion_data.get('foreign_body_type')
        self.non_stone_urological_disease = exclusion_data.get('non_stone_urological_disease')
        self.urological_disease_name = exclusion_data.get('urological_disease_name')
        self.renal_replacement_therapy = exclusion_data.get('renal_replacement_therapy')
        self.therapy_name = exclusion_data.get('therapy_name')
        self.medical_record_incomplete = exclusion_data.get('medical_record_incomplete')
        self.major_blood_immune_cancer = exclusion_data.get('major_blood_immune_cancer')
        self.disease_name = exclusion_data.get('disease_name')
        self.rare_metabolic_disease = exclusion_data.get('rare_metabolic_disease')
        self.metabolic_disease_name = exclusion_data.get('metabolic_disease_name')
        self.investigator_judgment = exclusion_data.get('investigator_judgment')
        self.judgment_reason = exclusion_data.get('judgment_reason')
        self.created_by = exclusion_data.get('created_by')
        self.created_at = exclusion_data.get('created_at')
        self.updated_by = exclusion_data.get('updated_by')
        self.updated_at = exclusion_data.get('updated_at')
    
    def to_dict(self) -> Dict[str, Any]:
        """轉換為字典格式"""
        return {
            'id': self.id,
            'subject_id': self.subject_id,
            'pregnant_female': self.pregnant_female,
            'kidney_transplant': self.kidney_transplant,
            'urinary_tract_foreign_body': self.urinary_tract_foreign_body,
            'foreign_body_type': self.foreign_body_type,
            'non_stone_urological_disease': self.non_stone_urological_disease,
            'urological_disease_name': self.urological_disease_name,
            'renal_replacement_therapy': self.renal_replacement_therapy,
            'therapy_name': self.therapy_name,
            'medical_record_incomplete': self.medical_record_incomplete,
            'major_blood_immune_cancer': self.major_blood_immune_cancer,
            'disease_name': self.disease_name,
            'rare_metabolic_disease': self.rare_metabolic_disease,
            'metabolic_disease_name': self.metabolic_disease_name,
            'investigator_judgment': self.investigator_judgment,
            'judgment_reason': self.judgment_reason,
            'created_by': self.created_by,
            'created_at': self.created_at,
            'updated_by': self.updated_by,
            'updated_at': self.updated_at
        }
