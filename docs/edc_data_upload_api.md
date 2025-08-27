# EDC 資料上傳 API 設計文件

## 概述

本文檔描述如何使用 `edc.data.create` 權限功能上傳受試者資料到 MySQL 資料庫。系統支援上傳受試者特性資料、納入條件評估、排除條件評估等。

## 資料庫連接配置

### 1. 資料庫連接參數

```python
# config/database.py
EDC_DATABASE_CONFIG = {
    'host': 'localhost',
    'port': 3306,
    'user': 'edc_user',
    'password': 'your_password',
    'database': 'edc_data_system',
    'charset': 'utf8mb4',
    'autocommit': False
}
```

### 2. 建立資料庫連接

```python
import mysql.connector
from mysql.connector import Error

def create_edc_connection():
    """建立 EDC 資料庫連接"""
    try:
        connection = mysql.connector.connect(
            host=EDC_DATABASE_CONFIG['host'],
            port=EDC_DATABASE_CONFIG['port'],
            user=EDC_DATABASE_CONFIG['user'],
            password=EDC_DATABASE_CONFIG['password'],
            database=EDC_DATABASE_CONFIG['database'],
            charset=EDC_DATABASE_CONFIG['charset'],
            autocommit=EDC_DATABASE_CONFIG['autocommit']
        )
        return connection
    except Error as e:
        print(f"資料庫連接錯誤: {e}")
        return None
```

## API 端點設計

### 1. 新增受試者

#### 端點：`POST /api/edc/subjects`

**權限要求：** `edc.data.create`

**請求範例：**

```json
{
  "trial_id": 1,
  "site_id": 1,
  "subject_code": "SUB-001",
  "screening_number": "SCR-001",
  "demographics": {
    "date_of_birth": "1980-01-01",
    "gender": "Male",
    "ethnicity": "亞洲人",
    "race": "黃種人",
    "height_cm": 170.5,
    "weight_kg": 65.2,
    "medical_history": "無特殊病史",
    "current_medications": "無",
    "allergies": "無",
    "smoking_status": "Never",
    "alcohol_consumption": "Occasional",
    "education_level": "大學",
    "occupation": "工程師",
    "marital_status": "Married"
  }
}
```

**回應範例：**

```json
{
  "success": true,
  "message": "受試者新增成功",
  "data": {
    "subject_id": 1,
    "subject_code": "SUB-001",
    "screening_id": 1,
    "demographic_id": 1
  }
}
```

**實作程式碼：**

```python
@app.route('/api/edc/subjects', methods=['POST'])
@require_permission('edc.data.create')
def create_subject():
    """新增受試者"""
    try:
        data = request.get_json()
        
        # 驗證必要欄位
        required_fields = ['trial_id', 'site_id', 'subject_code', 'demographics']
        for field in required_fields:
            if field not in data:
                return jsonify({'success': False, 'message': f'缺少必要欄位: {field}'}), 400
        
        # 建立資料庫連接
        connection = create_edc_connection()
        if not connection:
            return jsonify({'success': False, 'message': '資料庫連接失敗'}), 500
        
        cursor = connection.cursor()
        
        try:
            # 開始交易
            connection.start_transaction()
            
            # 1. 新增受試者主記錄
            subject_query = """
                INSERT INTO subjects (trial_id, site_id, subject_code, screening_number, 
                                   subject_status, created_by)
                VALUES (%s, %s, %s, %s, 'Screened', %s)
            """
            cursor.execute(subject_query, (
                data['trial_id'], data['site_id'], data['subject_code'], 
                data.get('screening_number'), g.user_id
            ))
            subject_id = cursor.lastrowid
            
            # 2. 建立篩選評估記錄
            screening_query = """
                INSERT INTO subject_screening (subject_id, screening_date, screening_status, 
                                            assessed_by, created_by)
                VALUES (%s, CURDATE(), 'Pending', %s, %s)
            """
            cursor.execute(screening_query, (subject_id, g.user_id, g.user_id))
            screening_id = cursor.lastrowid
            
            # 3. 新增人口學資料
            demographics = data['demographics']
            demo_query = """
                INSERT INTO subject_demographics (
                    subject_id, visit_number, visit_date, date_of_birth, gender,
                    ethnicity, race, height_cm, weight_kg, medical_history,
                    current_medications, allergies, smoking_status, alcohol_consumption,
                    education_level, occupation, marital_status, created_by
                ) VALUES (%s, 1, CURDATE(), %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            cursor.execute(demo_query, (
                subject_id, demographics['date_of_birth'], demographics['gender'],
                demographics.get('ethnicity'), demographics.get('race'),
                demographics.get('height_cm'), demographics.get('weight_kg'),
                demographics.get('medical_history'), demographics.get('current_medications'),
                demographics.get('allergies'), demographics.get('smoking_status'),
                demographics.get('alcohol_consumption'), demographics.get('education_level'),
                demographics.get('occupation'), demographics.get('marital_status'),
                g.user_id
            ))
            demographic_id = cursor.lastrowid
            
            # 提交交易
            connection.commit()
            
            # 記錄審計日誌
            log_permission_action(g.user_id, 'CREATE', 'subjects', subject_id, 'edc.data.create', True)
            
            return jsonify({
                'success': True,
                'message': '受試者新增成功',
                'data': {
                    'subject_id': subject_id,
                    'subject_code': data['subject_code'],
                    'screening_id': screening_id,
                    'demographic_id': demographic_id
                }
            })
            
        except Exception as e:
            connection.rollback()
            raise e
            
        finally:
            cursor.close()
            connection.close()
            
    except Exception as e:
        return jsonify({'success': False, 'message': f'新增失敗: {str(e)}'}), 500
```

### 2. 上傳實驗室檢驗值

#### 端點：`POST /api/edc/laboratory`

**權限要求：** `edc.data.create`

**請求範例：**

```json
{
  "subject_id": 1,
  "visit_number": 1,
  "lab_date": "2025-01-15",
  "lab_values": [
    {
      "lab_type": "血液常規",
      "lab_parameter": "血紅素",
      "lab_value": "14.2",
      "lab_unit": "g/dL",
      "reference_range_low": "12.0",
      "reference_range_high": "16.0"
    },
    {
      "lab_type": "血液常規",
      "lab_parameter": "白血球",
      "lab_value": "6500",
      "lab_unit": "cells/μL",
      "reference_range_low": "4000",
      "reference_range_high": "11000"
    }
  ]
}
```

**實作程式碼：**

```python
@app.route('/api/edc/laboratory', methods=['POST'])
@require_permission('edc.data.create')
def upload_laboratory_values():
    """上傳實驗室檢驗值"""
    try:
        data = request.get_json()
        
        # 驗證必要欄位
        required_fields = ['subject_id', 'visit_number', 'lab_date', 'lab_values']
        for field in required_fields:
            if field not in data:
                return jsonify({'success': False, 'message': f'缺少必要欄位: {field}'}), 400
        
        connection = create_edc_connection()
        if not connection:
            return jsonify({'success': False, 'message': '資料庫連接失敗'}), 500
        
        cursor = connection.cursor()
        
        try:
            connection.start_transaction()
            
            uploaded_labs = []
            
            for lab_data in data['lab_values']:
                # 判斷是否異常
                is_abnormal = 'Normal'
                if lab_data.get('reference_range_low') and lab_data.get('reference_range_high'):
                    try:
                        value = float(lab_data['lab_value'])
                        low = float(lab_data['reference_range_low'])
                        high = float(lab_data['reference_range_high'])
                        
                        if value < low:
                            is_abnormal = 'Low'
                        elif value > high:
                            is_abnormal = 'High'
                    except ValueError:
                        pass
                
                # 插入檢驗值
                lab_query = """
                    INSERT INTO laboratory_values (
                        subject_id, visit_number, lab_date, lab_type, lab_parameter,
                        lab_value, lab_unit, reference_range_low, reference_range_high,
                        is_abnormal, created_by
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """
                cursor.execute(lab_query, (
                    data['subject_id'], data['visit_number'], data['lab_date'],
                    lab_data['lab_type'], lab_data['lab_parameter'], lab_data['lab_value'],
                    lab_data.get('lab_unit'), lab_data.get('reference_range_low'),
                    lab_data.get('reference_range_high'), is_abnormal, g.user_id
                ))
                
                uploaded_labs.append({
                    'lab_id': cursor.lastrowid,
                    'parameter': lab_data['lab_parameter'],
                    'value': lab_data['lab_value'],
                    'is_abnormal': is_abnormal
                })
            
            connection.commit()
            
            # 記錄審計日誌
            log_permission_action(g.user_id, 'CREATE', 'laboratory_values', None, 'edc.data.create', True)
            
            return jsonify({
                'success': True,
                'message': f'成功上傳 {len(uploaded_labs)} 筆檢驗值',
                'data': {'uploaded_labs': uploaded_labs}
            })
            
        except Exception as e:
            connection.rollback()
            raise e
            
        finally:
            cursor.close()
            connection.close()
            
    except Exception as e:
        return jsonify({'success': False, 'message': f'上傳失敗: {str(e)}'}), 500
```

### 3. 上傳生命徵象

#### 端點：`POST /api/edc/vital-signs`

**權限要求：** `edc.data.create`

**請求範例：**

```json
{
  "subject_id": 1,
  "visit_number": 1,
  "vital_date": "2025-01-15",
  "vital_time": "09:30:00",
  "systolic_bp": 120,
  "diastolic_bp": 80,
  "heart_rate": 72,
  "respiratory_rate": 16,
  "temperature": 36.8,
  "weight_kg": 65.5,
  "height_cm": 170.5
}
```

### 4. 篩選條件評估

#### 端點：`POST /api/edc/screening/evaluate`

**權限要求：** `edc.data.create`

**請求範例：**

```json
{
  "subject_id": 1,
  "inclusion_criteria_met": true,
  "exclusion_criteria_met": false,
  "overall_eligibility": "Eligible",
  "eligibility_notes": "受試者符合所有納入條件且不符合排除條件",
  "criteria_evaluations": [
    {
      "criterion_type": "Inclusion",
      "criterion_id": 1,
      "criterion_description": "年齡18-75歲",
      "is_met": true,
      "evaluation_notes": "受試者年齡45歲，符合條件",
      "supporting_data": "出生日期: 1980-01-01"
    },
    {
      "criterion_type": "Exclusion",
      "criterion_id": 1,
      "criterion_description": "懷孕或哺乳期婦女",
      "is_met": false,
      "evaluation_notes": "受試者為男性，不適用此條件",
      "supporting_data": "性別: Male"
    }
  ]
}
```

## 資料驗證規則

### 1. 基本驗證

```python
def validate_subject_data(data):
    """驗證受試者資料"""
    errors = []
    
    # 驗證年齡範圍
    if 'demographics' in data and 'date_of_birth' in data['demographics']:
        try:
            birth_date = datetime.strptime(data['demographics']['date_of_birth'], '%Y-%m-%d')
            age = (datetime.now() - birth_date).days / 365.25
            if age < 18 or age > 100:
                errors.append("年齡必須在18-100歲之間")
        except ValueError:
            errors.append("出生日期格式錯誤")
    
    # 驗證身高體重
    if 'demographics' in data:
        demographics = data['demographics']
        if demographics.get('height_cm'):
            height = float(demographics['height_cm'])
            if height < 100 or height > 250:
                errors.append("身高必須在100-250cm之間")
        
        if demographics.get('weight_kg'):
            weight = float(demographics['weight_kg'])
            if weight < 30 or weight > 300:
                errors.append("體重必須在30-300kg之間")
    
    return errors
```

### 2. 業務邏輯驗證

```python
def validate_screening_criteria(subject_id, trial_id):
    """驗證篩選條件"""
    connection = create_edc_connection()
    if not connection:
        return False, "資料庫連接失敗"
    
    cursor = connection.cursor(dictionary=True)
    
    try:
        # 檢查是否已存在篩選評估
        cursor.execute("""
            SELECT screening_id FROM subject_screening 
            WHERE subject_id = %s
        """, (subject_id,))
        
        if cursor.fetchone():
            return False, "該受試者已有篩選評估記錄"
        
        # 檢查試驗專案是否存在
        cursor.execute("""
            SELECT trial_id FROM clinical_trials 
            WHERE trial_id = %s AND is_active = 1
        """, (trial_id,))
        
        if not cursor.fetchone():
            return False, "試驗專案不存在或已停用"
        
        return True, "驗證通過"
        
    finally:
        cursor.close()
        connection.close()
```

## 錯誤處理

### 1. 統一錯誤回應格式

```python
class EDCError(Exception):
    """EDC 系統錯誤"""
    def __init__(self, message, error_code=None, details=None):
        self.message = message
        self.error_code = error_code
        self.details = details
        super().__init__(self.message)

def handle_edc_error(error):
    """處理 EDC 錯誤"""
    if isinstance(error, EDCError):
        return jsonify({
            'success': False,
            'error_code': error.error_code,
            'message': error.message,
            'details': error.details
        }), 400
    else:
        return jsonify({
            'success': False,
            'message': '系統內部錯誤',
            'details': str(error)
        }), 500
```

### 2. 交易回滾處理

```python
def execute_with_transaction(func):
    """交易裝飾器"""
    def wrapper(*args, **kwargs):
        connection = create_edc_connection()
        if not connection:
            raise EDCError("資料庫連接失敗")
        
        try:
            connection.start_transaction()
            result = func(connection, *args, **kwargs)
            connection.commit()
            return result
        except Exception as e:
            connection.rollback()
            raise e
        finally:
            connection.close()
    
    return wrapper
```

## 效能優化

### 1. 批次插入

```python
def batch_insert_lab_values(connection, subject_id, visit_number, lab_date, lab_values):
    """批次插入檢驗值"""
    cursor = connection.cursor()
    
    # 準備批次插入資料
    batch_data = []
    for lab in lab_values:
        batch_data.append((
            subject_id, visit_number, lab_date, lab['lab_type'],
            lab['lab_parameter'], lab['lab_value'], lab.get('lab_unit'),
            lab.get('reference_range_low'), lab.get('reference_range_high'),
            'Normal', g.user_id
        ))
    
    # 批次插入
    insert_query = """
        INSERT INTO laboratory_values (
            subject_id, visit_number, lab_date, lab_type, lab_parameter,
            lab_value, lab_unit, reference_range_low, reference_range_high,
            is_abnormal, created_by
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """
    
    cursor.executemany(insert_query, batch_data)
    return cursor.rowcount
```

### 2. 查詢優化

```python
def get_subject_summary(subject_id):
    """獲取受試者摘要資訊（使用檢視）"""
    connection = create_edc_connection()
    cursor = connection.cursor(dictionary=True)
    
    try:
        cursor.execute("""
            SELECT * FROM v_subject_complete_info 
            WHERE subject_id = %s
        """, (subject_id,))
        
        return cursor.fetchone()
    finally:
        cursor.close()
        connection.close()
```

## 安全性考量

### 1. 權限驗證

```python
def verify_edc_permission(user_id, permission, resource_id=None):
    """驗證 EDC 權限"""
    # 檢查基本權限
    if not has_permission(user_id, permission):
        return False, "權限不足"
    
    # 檢查資源存取權限
    if resource_id:
        if not can_access_resource(user_id, resource_id):
            return False, "無權存取該資源"
    
    return True, "權限驗證通過"
```

### 2. 資料加密

```python
from cryptography.fernet import Fernet

def encrypt_sensitive_data(data):
    """加密敏感資料"""
    key = Fernet.generate_key()
    cipher = Fernet(key)
    encrypted_data = cipher.encrypt(data.encode())
    return encrypted_data, key

def decrypt_sensitive_data(encrypted_data, key):
    """解密敏感資料"""
    cipher = Fernet(key)
    decrypted_data = cipher.decrypt(encrypted_data)
    return decrypted_data.decode()
```

## 測試範例

### 1. 單元測試

```python
import unittest
from unittest.mock import patch, MagicMock

class TestEDCDataUpload(unittest.TestCase):
    
    @patch('mysql.connector.connect')
    def test_create_subject_success(self, mock_connect):
        """測試成功新增受試者"""
        # 模擬資料庫連接
        mock_connection = MagicMock()
        mock_cursor = MagicMock()
        mock_connection.cursor.return_value = mock_cursor
        mock_cursor.lastrowid = 1
        mock_connect.return_value = mock_connection
        
        # 測試資料
        test_data = {
            'trial_id': 1,
            'site_id': 1,
            'subject_code': 'TEST-001',
            'demographics': {
                'date_of_birth': '1990-01-01',
                'gender': 'Female'
            }
        }
        
        # 執行測試
        response = self.client.post('/api/edc/subjects', json=test_data)
        
        # 驗證結果
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json['success'])
```

### 2. 整合測試

```python
def test_end_to_end_subject_creation():
    """端到端受試者建立測試"""
    # 1. 建立受試者
    subject_data = {
        'trial_id': 1,
        'site_id': 1,
        'subject_code': 'E2E-001',
        'demographics': {
            'date_of_birth': '1985-01-01',
            'gender': 'Male',
            'height_cm': 175.0,
            'weight_kg': 70.0
        }
    }
    
    response = create_subject_api(subject_data)
    assert response['success'] == True
    subject_id = response['data']['subject_id']
    
    # 2. 上傳檢驗值
    lab_data = {
        'subject_id': subject_id,
        'visit_number': 1,
        'lab_date': '2025-01-15',
        'lab_values': [
            {
                'lab_type': '血液常規',
                'lab_parameter': '血紅素',
                'lab_value': '15.0',
                'lab_unit': 'g/dL'
            }
        ]
    }
    
    response = upload_lab_api(lab_data)
    assert response['success'] == True
    
    # 3. 驗證資料完整性
    subject_info = get_subject_info(subject_id)
    assert subject_info['subject_code'] == 'E2E-001'
    assert subject_info['demographics']['gender'] == 'Male'
```

## 部署注意事項

### 1. 環境配置

```bash
# 建立資料庫用戶
CREATE USER 'edc_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON edc_data_system.* TO 'edc_user'@'localhost';

# 設定環境變數
export EDC_DB_HOST=localhost
export EDC_DB_PORT=3306
export EDC_DB_USER=edc_user
export EDC_DB_PASSWORD=secure_password
export EDC_DB_NAME=edc_data_system
```

### 2. 監控和日誌

```python
import logging

# 設定 EDC 專用日誌
edc_logger = logging.getLogger('edc_system')
edc_logger.setLevel(logging.INFO)

# 檔案處理器
file_handler = logging.FileHandler('logs/edc_system.log')
file_handler.setLevel(logging.INFO)

# 格式化器
formatter = logging.Formatter(
    '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
file_handler.setFormatter(formatter)
edc_logger.addHandler(file_handler)

# 記錄操作日誌
def log_edc_operation(operation, user_id, details):
    """記錄 EDC 操作日誌"""
    edc_logger.info(f"Operation: {operation}, User: {user_id}, Details: {details}")
```

這份文件提供了完整的 EDC 資料上傳 API 設計，包含資料庫操作、權限驗證、錯誤處理、效能優化等各個方面。您可以根據實際需求調整和擴展這些功能。
