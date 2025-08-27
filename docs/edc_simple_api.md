# EDC 簡化 API 設計文件

## 概述

本文檔描述如何使用 `edc.data.create` 權限功能操作簡化版的EDC資料庫，只包含三個核心資料表：受試者資料、納入條件和排除條件。

## 資料庫連接配置

```python
# config/database.py
EDC_DATABASE_CONFIG = {
    'host': 'localhost',
    'port': 3306,
    'user': 'edc_user',
    'password': 'your_password',
    'database': 'edc_simple_system',
    'charset': 'utf8mb4',
    'autocommit': False
}
```

## API 端點設計

### 1. 新增受試者

#### 端點：`POST /api/edc/subjects`

**權限要求：** `edc.data.create`

**請求範例：**

```json
{
  "subject_code": "SUB-001",
  "trial_code": "KHH-001-2025",
  "site_code": "KHH-MAIN",
  "name": "張三",
  "date_of_birth": "1980-01-01",
  "gender": "Male",
  "ethnicity": "亞洲人",
  "height_cm": 170.5,
  "weight_kg": 65.2,
  "medical_history": "無特殊病史",
  "current_medications": "無",
  "allergies": "無",
  "smoking_status": "Never",
  "alcohol_consumption": "Occasional"
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
    "age": 45,
    "bmi": 22.5
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
        required_fields = ['subject_code', 'trial_code', 'site_code', 'date_of_birth', 'gender']
        for field in required_fields:
            if field not in data:
                return jsonify({'success': False, 'message': f'缺少必要欄位: {field}'}), 400
        
        # 建立資料庫連接
        connection = create_edc_connection()
        if not connection:
            return jsonify({'success': False, 'message': '資料庫連接失敗'}), 500
        
        cursor = connection.cursor()
        
        try:
            # 插入受試者記錄
            subject_query = """
                INSERT INTO subjects (
                    subject_code, trial_code, site_code, name, date_of_birth, gender,
                    ethnicity, height_cm, weight_kg, medical_history, current_medications,
                    allergies, smoking_status, alcohol_consumption, created_by
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            cursor.execute(subject_query, (
                data['subject_code'], data['trial_code'], data['site_code'],
                data.get('name'), data['date_of_birth'], data['gender'],
                data.get('ethnicity'), data.get('height_cm'), data.get('weight_kg'),
                data.get('medical_history'), data.get('current_medications'),
                data.get('allergies'), data.get('smoking_status'),
                data.get('alcohol_consumption'), g.user_id
            ))
            
            subject_id = cursor.lastrowid
            
            # 提交交易
            connection.commit()
            
            # 獲取計算欄位
            cursor.execute("SELECT age, bmi FROM subjects WHERE subject_id = %s", (subject_id,))
            result = cursor.fetchone()
            age, bmi = result if result else (None, None)
            
            return jsonify({
                'success': True,
                'message': '受試者新增成功',
                'data': {
                    'subject_id': subject_id,
                    'subject_code': data['subject_code'],
                    'age': age,
                    'bmi': bmi
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

### 2. 新增納入條件

#### 端點：`POST /api/edc/inclusion-criteria`

**權限要求：** `edc.data.create`

**請求範例：**

```json
{
  "trial_code": "KHH-001-2025",
  "criterion_number": 5,
  "criterion_description": "血壓正常(收縮壓<140mmHg且舒張壓<90mmHg)",
  "criterion_type": "Lab Values",
  "criterion_category": "Vital Signs",
  "is_mandatory": true
}
```

**實作程式碼：**

```python
@app.route('/api/edc/inclusion-criteria', methods=['POST'])
@require_permission('edc.data.create')
def create_inclusion_criterion():
    """新增納入條件"""
    try:
        data = request.get_json()
        
        # 驗證必要欄位
        required_fields = ['trial_code', 'criterion_number', 'criterion_description', 'criterion_type']
        for field in required_fields:
            if field not in data:
                return jsonify({'success': False, 'message': f'缺少必要欄位: {field}'}), 400
        
        connection = create_edc_connection()
        if not connection:
            return jsonify({'success': False, 'message': '資料庫連接失敗'}), 500
        
        cursor = connection.cursor()
        
        try:
            # 檢查條件編號是否已存在
            cursor.execute("""
                SELECT criterion_id FROM inclusion_criteria 
                WHERE trial_code = %s AND criterion_number = %s
            """, (data['trial_code'], data['criterion_number']))
            
            if cursor.fetchone():
                return jsonify({'success': False, 'message': '條件編號已存在'}), 400
            
            # 插入納入條件
            insert_query = """
                INSERT INTO inclusion_criteria (
                    trial_code, criterion_number, criterion_description, criterion_type,
                    criterion_category, is_mandatory, created_by
                ) VALUES (%s, %s, %s, %s, %s, %s, %s)
            """
            cursor.execute(insert_query, (
                data['trial_code'], data['criterion_number'], data['criterion_description'],
                data['criterion_type'], data.get('criterion_category'),
                data.get('is_mandatory', True), g.user_id
            ))
            
            criterion_id = cursor.lastrowid
            connection.commit()
            
            return jsonify({
                'success': True,
                'message': '納入條件新增成功',
                'data': {'criterion_id': criterion_id}
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

### 3. 新增排除條件

#### 端點：`POST /api/edc/exclusion-criteria`

**權限要求：** `edc.data.create`

**請求範例：**

```json
{
  "trial_code": "KHH-001-2025",
  "criterion_number": 6,
  "criterion_description": "有嚴重心律不整病史",
  "criterion_type": "Medical History",
  "criterion_category": "Cardiovascular",
  "is_mandatory": true
}
```

### 4. 篩選評估

#### 端點：`POST /api/edc/screening/evaluate`

**權限要求：** `edc.data.create`

**請求範例：**

```json
{
  "subject_id": 1,
  "overall_eligibility": "Eligible",
  "eligibility_notes": "受試者符合所有納入條件且不符合排除條件"
}
```

**實作程式碼：**

```python
@app.route('/api/edc/screening/evaluate', methods=['POST'])
@require_permission('edc.data.create')
def evaluate_screening():
    """篩選評估"""
    try:
        data = request.get_json()
        
        # 驗證必要欄位
        required_fields = ['subject_id', 'overall_eligibility']
        for field in required_fields:
            if field not in data:
                return jsonify({'success': False, 'message': f'缺少必要欄位: {field}'}), 400
        
        connection = create_edc_connection()
        if not connection:
            return jsonify({'success': False, 'message': '資料庫連接失敗'}), 500
        
        cursor = connection.cursor()
        
        try:
            # 更新篩選狀態
            update_query = """
                UPDATE subjects 
                SET overall_eligibility = %s, eligibility_notes = %s,
                    screening_status = CASE 
                        WHEN %s = 'Eligible' THEN 'Passed'
                        WHEN %s = 'Not Eligible' THEN 'Failed'
                        ELSE 'Pending Review'
                    END,
                    updated_by = %s, updated_at = CURRENT_TIMESTAMP
                WHERE subject_id = %s
            """
            cursor.execute(update_query, (
                data['overall_eligibility'], data.get('eligibility_notes'),
                data['overall_eligibility'], data['overall_eligibility'],
                g.user_id, data['subject_id']
            ))
            
            if cursor.rowcount == 0:
                return jsonify({'success': False, 'message': '受試者不存在'}), 404
            
            connection.commit()
            
            return jsonify({
                'success': True,
                'message': '篩選評估更新成功'
            })
            
        except Exception as e:
            connection.rollback()
            raise e
            
        finally:
            cursor.close()
            connection.close()
            
    except Exception as e:
        return jsonify({'success': False, 'message': f'更新失敗: {str(e)}'}), 500
```

### 5. 查詢受試者

#### 端點：`GET /api/edc/subjects`

**權限要求：** `edc.data.create`

**查詢參數：**
- `trial_code`: 試驗專案代碼
- `screening_status`: 篩選狀態
- `overall_eligibility`: 整體資格評估

**實作程式碼：**

```python
@app.route('/api/edc/subjects', methods=['GET'])
@require_permission('edc.data.create')
def get_subjects():
    """查詢受試者列表"""
    try:
        # 獲取查詢參數
        trial_code = request.args.get('trial_code')
        screening_status = request.args.get('screening_status')
        overall_eligibility = request.args.get('overall_eligibility')
        
        connection = create_edc_connection()
        if not connection:
            return jsonify({'success': False, 'message': '資料庫連接失敗'}), 500
        
        cursor = connection.cursor(dictionary=True)
        
        try:
            # 建立查詢條件
            where_conditions = ["is_active = 1"]
            params = []
            
            if trial_code:
                where_conditions.append("trial_code = %s")
                params.append(trial_code)
            
            if screening_status:
                where_conditions.append("screening_status = %s")
                params.append(screening_status)
            
            if overall_eligibility:
                where_conditions.append("overall_eligibility = %s")
                params.append(overall_eligibility)
            
            # 執行查詢
            query = f"""
                SELECT * FROM v_subject_screening_status
                WHERE {' AND '.join(where_conditions)}
                ORDER BY created_at DESC
            """
            
            cursor.execute(query, params)
            subjects = cursor.fetchall()
            
            return jsonify({
                'success': True,
                'data': subjects,
                'total': len(subjects)
            })
            
        finally:
            cursor.close()
            connection.close()
            
    except Exception as e:
        return jsonify({'success': False, 'message': f'查詢失敗: {str(e)}'}), 500
```

### 6. 查詢試驗條件

#### 端點：`GET /api/edc/trial-criteria/<trial_code>`

**權限要求：** `edc.data.create`

**實作程式碼：**

```python
@app.route('/api/edc/trial-criteria/<trial_code>', methods=['GET'])
@require_permission('edc.data.create')
def get_trial_criteria(trial_code):
    """查詢試驗專案的納入/排除條件"""
    try:
        connection = create_edc_connection()
        if not connection:
            return jsonify({'success': False, 'message': '資料庫連接失敗'}), 500
        
        cursor = connection.cursor(dictionary=True)
        
        try:
            # 查詢納入條件
            cursor.execute("""
                SELECT * FROM inclusion_criteria 
                WHERE trial_code = %s AND is_active = 1
                ORDER BY criterion_number
            """, (trial_code,))
            inclusion_criteria = cursor.fetchall()
            
            # 查詢排除條件
            cursor.execute("""
                SELECT * FROM exclusion_criteria 
                WHERE trial_code = %s AND is_active = 1
                ORDER BY criterion_number
            """, (trial_code,))
            exclusion_criteria = cursor.fetchall()
            
            return jsonify({
                'success': True,
                'data': {
                    'trial_code': trial_code,
                    'inclusion_criteria': inclusion_criteria,
                    'exclusion_criteria': exclusion_criteria
                }
            })
            
        finally:
            cursor.close()
            connection.close()
            
    except Exception as e:
        return jsonify({'success': False, 'message': f'查詢失敗: {str(e)}'}), 500
```

## 資料驗證

```python
def validate_subject_data(data):
    """驗證受試者資料"""
    errors = []
    
    # 驗證年齡範圍
    if 'date_of_birth' in data:
        try:
            birth_date = datetime.strptime(data['date_of_birth'], '%Y-%m-%d')
            age = (datetime.now() - birth_date).days / 365.25
            if age < 18 or age > 100:
                errors.append("年齡必須在18-100歲之間")
        except ValueError:
            errors.append("出生日期格式錯誤")
    
    # 驗證身高體重
    if data.get('height_cm'):
        height = float(data['height_cm'])
        if height < 100 or height > 250:
            errors.append("身高必須在100-250cm之間")
    
    if data.get('weight_kg'):
        weight = float(data['weight_kg'])
        if weight < 30 or weight > 300:
            errors.append("體重必須在30-300kg之間")
    
    return errors
```

## 使用範例

### 1. 新增受試者

```bash
curl -X POST http://localhost:5000/api/edc/subjects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "subject_code": "SUB-001",
    "trial_code": "KHH-001-2025",
    "site_code": "KHH-MAIN",
    "name": "張三",
    "date_of_birth": "1980-01-01",
    "gender": "Male",
    "height_cm": 170.5,
    "weight_kg": 65.2
  }'
```

### 2. 新增納入條件

```bash
curl -X POST http://localhost:5000/api/edc/inclusion-criteria \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "trial_code": "KHH-001-2025",
    "criterion_number": 5,
    "criterion_description": "血壓正常",
    "criterion_type": "Lab Values",
    "criterion_category": "Vital Signs"
  }'
```

### 3. 篩選評估

```bash
curl -X POST http://localhost:5000/api/edc/screening/evaluate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "subject_id": 1,
    "overall_eligibility": "Eligible",
    "eligibility_notes": "符合所有條件"
  }'
```

## 總結

這個簡化版的EDC系統提供了：

1. **三個核心資料表**：受試者、納入條件、排除條件
2. **完整的CRUD操作**：新增、查詢、更新
3. **自動計算欄位**：年齡、BMI
4. **篩選狀態管理**：追蹤受試者資格評估
5. **權限控制**：所有操作都需要 `edc.data.create` 權限

系統設計簡潔但功能完整，適合快速部署和使用。
