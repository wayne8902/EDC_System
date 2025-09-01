# EDC System - 電子資料擷取系統

## 系統概述

EDC (Electronic Data Capture) 系統是一個專為臨床試驗設計的電子資料擷取系統，用於管理受試者資料、納入條件評估和排除條件評估。

## 系統架構

本系統遵循與專案中其他 `XXX_sys` 一致的架構模式：

```
edc_sys/
├── __init__.py              # 系統初始化，導出主要組件
├── b_edc.py                # 主要 Blueprint 路由
├── edc_function.py         # 核心業務邏輯
├── config.json             # 配置檔案
└── README.md               # 系統說明
```

## 主要功能

### 1. 受試者管理
- 創建新受試者
- 更新受試者資料
- 查詢受試者資訊
- 搜尋受試者

### 2. 納入條件評估
- 年齡條件檢查
- 基本資料完整性評估
- 病史記錄評估
- 檢驗資料完整性評估
- 影像資料完整性評估

### 3. 排除條件評估
- 懷孕狀態檢查
- 腎臟移植史
- 泌尿道異物檢查
- 重大疾病評估
- 專業判斷記錄

### 4. 資格評估
- 自動計算納入條件分數
- 自動計算排除條件分數
- 總體資格判定

### 5. 電子簽核流程
- 研究人員提交審核功能
- 必填欄位驗證
- 狀態管理 (draft → submitted → signed)
- PI 簽署流程
- 編輯權限控制

## API 端點

### 主要 API

| 端點 | 方法 | 描述 |
|------|------|------|
| `/test` | GET/POST | 系統測試頁面 |
| `/submit-ecrf` | POST | 提交 eCRF 表單 |
| `/get-subject/<id>` | GET | 獲取受試者資料 |
| `/search-subjects` | GET/POST | 搜尋受試者 |
| `/evaluate-eligibility/<id>` | GET | 評估受試者資格 |
| `/update-subject/<id>` | PUT | 更新受試者資料 |
| `/dashboard` | GET | 系統儀表板 |
| `/submit-for-review/<subject_code>` | POST | 提交審核 |
| `/validate-required-fields/<subject_code>` | GET | 驗證必填欄位 |
| `/subject-detail-id/<subject_code>` | GET | 獲取受試者詳細資料 |
| `/search-subjects-advanced` | POST | 進階搜尋受試者 |

### API 使用範例

#### 提交 eCRF 表單
```javascript
fetch('/edc/submit-ecrf', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        subject_data: {
            subject_code: 'S001',
            date_of_birth: '1985-03-15',
            gender: 1,
            height_cm: 175.5,
            weight_kg: 72.3,
            // ... 其他欄位
        },
        inclusion_data: {
            age_18_above: 1,
            gender_available: 1,
            // ... 其他納入條件
        },
        exclusion_data: {
            pregnant_female: 0,
            kidney_transplant: 0,
            // ... 其他排除條件
        }
    })
})
.then(response => response.json())
.then(data => console.log(data));
```

#### 獲取受試者資料
```javascript
fetch('/edc/get-subject/123')
.then(response => response.json())
.then(data => console.log(data));
```

#### 搜尋受試者
```javascript
fetch('/edc/search-subjects?term=S001&limit=10')
.then(response => response.json())
.then(data => console.log(data));
```

#### 提交審核
```javascript
fetch('/edc/submit-for-review/P010002', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    }
})
.then(response => response.json())
.then(data => {
    if (data.success) {
        console.log('提交成功:', data.message);
    } else {
        console.error('提交失敗:', data.message);
    }
});
```

#### 驗證必填欄位
```javascript
fetch('/edc/validate-required-fields/P010002')
.then(response => response.json())
.then(data => {
    if (data.success) {
        console.log('驗證通過');
    } else {
        console.log('缺少欄位:', data.missing_fields);
    }
});
```

## 資料庫結構

### 主要資料表

1. **subjects** - 受試者基本資料
   - 包含狀態欄位 (status: 'draft', 'submitted', 'signed')
   - 創建者和更新者追蹤 (created_by, updated_by)
   - 時間戳記 (created_at, updated_at)
2. **inclusion_criteria** - 納入條件評估
   - 與 subjects 表同步的狀態管理
3. **exclusion_criteria** - 排除條件評估
   - 與 subjects 表同步的狀態管理
4. **edit_log** - 編輯歷程記錄
   - 記錄所有資料變更和提交審核動作

### 資料庫配置

系統使用 `edc_data` 資料庫，配置在 `config.json` 中：

```json
{
  "sql_host": "localhost",
  "sql_port": 3306,
  "sql_user": "root",
  "sql_passwd": "",
  "sql_dbname": "edc_data"
}
```

## 安裝與配置

### 1. 安裝依賴
```bash
pip install pymysql flask flask-login
```

### 2. 建立資料庫
使用 `sql/edc_simple_system.sql` 建立資料庫結構。

### 3. 配置資料庫連接
修改 `config.json` 中的資料庫連接參數。

### 4. 註冊 Blueprint
在 `main.py` 中註冊 EDC 系統：

```python
from edc_sys import edc_blueprints

app.register_blueprint(edc_blueprints, url_prefix='/edc')
```

## 使用方式

### 1. 前端整合
前端可以透過 JavaScript 調用 EDC 系統的 API 進行資料操作。

### 2. 權限控制
- 所有 API 都需要使用者登入，使用 `@login_required` 裝飾器保護
- 編輯權限基於用戶角色 (`edc.data.edit`)
- 狀態控制：submitted 和 signed 狀態的資料無法編輯

### 3. 錯誤處理
系統提供統一的錯誤回應格式，便於前端處理。

## 開發指南

### 1. 新增功能
在 `edc_function.py` 中添加新的業務邏輯方法。

### 2. 新增 API
在 `b_edc.py` 中添加新的路由和處理函數。

### 3. 資料庫操作
在 `database.py` 中添加新的資料庫操作方法。

### 4. 資料驗證
在 `edc_function.py` 中添加新的驗證邏輯。

## 測試

### 1. 單元測試
測試各個模組的功能。

### 2. 整合測試
測試完整的 API 流程。

### 3. 端到端測試
測試從前端到後端的完整流程。

## 維護與支援

### 1. 日誌記錄
系統使用 Python logging 模組記錄操作日誌。

### 2. 錯誤追蹤
所有錯誤都會記錄詳細的錯誤資訊和堆疊追蹤。

### 3. 效能監控
可以添加效能監控和統計功能。

## 版本歷史

- **v1.0.0** - 初始版本，基本功能實現
- **v1.1.0** - 新增電子簽核流程
  - 提交審核功能 (`submit_for_review`)
  - 必填欄位驗證 (`validate_required_fields`)
  - 狀態管理和權限控制
  - 編輯歷程記錄

## 授權

本系統遵循專案的授權條款。

## 聯絡資訊

如有問題或建議，請聯絡開發團隊。
