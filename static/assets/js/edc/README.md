# EDC 系統架構說明

## 📁 檔案結構概覽

```
edc/
├── README.md                           # 本檔案 - 系統架構說明
├── edc_loader.js                      # 模組載入器 - 管理依賴關係
├── edc_core.js                        # 核心功能模組 - 基礎工具和常數
├── edc_utils.js                       # 工具函數模組 - 通用輔助功能
├── edc_data_browser_config.json       # 資料瀏覽配置 - 詳細資料頁面結構定義
├── edc_data_browser_generator.js      # 頁面生成器 - 根據配置生成 HTML
├── edc_data_browser.js                # 資料瀏覽器 - 主要資料顯示和互動邏輯
├── edc_data_entry_config.json         # 資料輸入配置 - 新增資料頁面結構定義
├── edc_data_entry_generator.js        # 輸入頁面生成器 - 根據配置生成輸入表單
├── edc_data_entry_handler.js          # 資料輸入處理器 - 處理表單提交和驗證
├── edc_data_entry.js                  # 資料輸入主模組 - 管理新增資料流程
├── edc_calculations.js                # 計算模組 - 處理 BMI 等計算邏輯
├── edc_validation.js                  # 驗證模組 - 資料驗證規則和檢查
└── edc_dashboard.js                   # 儀表板模組 - 主要頁面初始化和路由
```

## 🔄 模組依賴關係

### 依賴層級圖
```
edc_dashboard.js (L4 - 最高層)
├── edc_data_browser (L3)
│   ├── edc_data_browser_generator (L2)
│   │   ├── edc_core (L1)
│   │   └── edc_utils (L1)
│   └── edc_data_editor (L2)
│       ├── edc_core (L1)
│       └── edc_utils (L1)
├── edc_data_entry (L3)
│   ├── edc_data_entry_generator (L2)
│   │   ├── edc_core (L1)
│   │   └── edc_utils (L1)
│   ├── edc_data_entry_handler (L2)
│   │   ├── edc_core (L1)
│   │   └── edc_utils (L1)
│   └── edc_validation (L2)
│       └── edc_core (L1)
└── edc_calculations (L2)
    └── edc_core (L1)
```

### 詳細依賴說明

#### **L1 基礎層 (Foundation Layer)**
- **`edc_core.js`**: 提供核心常數、基礎函數和通用邏輯
- **`edc_utils.js`**: 提供工具函數，如日期格式化、數值處理等

#### **L2 功能層 (Feature Layer)**
- **`edc_data_browser_generator.js`**: 依賴 `edc_core`, `edc_utils`
- **`edc_data_editor.js`**: 依賴 `edc_core`, `edc_utils`
- **`edc_data_entry_generator.js`**: 依賴 `edc_core`, `edc_utils`
- **`edc_data_entry_handler.js`**: 依賴 `edc_core`, `edc_utils`
- **`edc_validation.js`**: 依賴 `edc_core`
- **`edc_calculations.js`**: 依賴 `edc_core`

#### **L3 業務層 (Business Layer)**
- **`edc_data_browser.js`**: 依賴 `edc_core`, `edc_utils`, `edc_data_browser_generator`, `edc_data_editor`
- **`edc_data_entry.js`**: 依賴 `edc_core`, `edc_utils`, `edc_data_entry_generator`, `edc_data_entry_handler`, `edc_validation`

#### **L4 應用層 (Application Layer)**
- **`edc_dashboard.js`**: 依賴所有其他模組，作為系統入口點

## 📊 資料流架構

### 1. 資料瀏覽流程 (Data Browsing Flow)
```
用戶點擊"詳細資料" 
    ↓
edc_data_browser.js.displayData()
    ↓
edc_data_browser_generator.js.generateSubjectDetailPage()
    ↓
讀取 edc_data_browser_config.json
    ↓
生成 HTML 結構
    ↓
渲染到頁面
    ↓
用戶可切換編輯模式
    ↓
edc_data_editor.js 接管編輯功能
```

### 2. 資料編輯流程 (Data Editing Flow)
```
用戶點擊"編輯模式"
    ↓
edc_data_editor.js.switchToEditMode()
    ↓
convertFieldsToEditable() - 啟用所有輸入欄位
    ↓
用戶修改資料
    ↓
用戶點擊"儲存變更"
    ↓
edc_data_editor.js.saveChanges()
    ↓
collectFormData() - 收集表單資料
    ↓
發送 POST 請求到 /edc/update-subject/{subject_code}
    ↓
後端處理更新
    ↓
返回結果並切換回瀏覽模式
```

### 3. 資料輸入流程 (Data Entry Flow)
```
用戶點擊"新增資料"
    ↓
edc_data_entry.js.init()
    ↓
edc_data_entry_generator.js.generateForm()
    ↓
讀取 edc_data_entry_config.json
    ↓
生成輸入表單
    ↓
用戶填寫表單
    ↓
edc_data_entry_handler.js.handleSubmit()
    ↓
edc_validation.js.validateForm()
    ↓
發送 POST 請求到後端
    ↓
處理回應並顯示結果
```

## 🔌 模組載入機制

### 載入器配置 (`edc_loader.js`)
```javascript
const moduleDependencies = {
    'edc_core': [],
    'edc_utils': ['edc_core'],
    'edc_data_browser_generator': ['edc_core', 'edc_utils'],
    'edc_data_editor': ['edc_core', 'edc_utils'],
    'edc_data_browser': ['edc_core', 'edc_utils', 'edc_data_browser_generator', 'edc_data_editor'],
    'edc_data_entry_generator': ['edc_core', 'edc_utils'],
    'edc_data_entry_handler': ['edc_core', 'edc_utils'],
    'edc_validation': ['edc_core'],
    'edc_data_entry': ['edc_core', 'edc_utils', 'edc_data_entry_generator', 'edc_data_entry_handler', 'edc_validation'],
    'edc_calculations': ['edc_core'],
    'edc_dashboard': ['edc_core', 'edc_utils', 'edc_data_browser', 'edc_data_entry', 'edc_calculations']
};
```

### 載入順序
1. **基礎模組**: `edc_core` → `edc_utils`
2. **功能模組**: 各生成器和處理器模組
3. **業務模組**: `edc_data_browser`, `edc_data_entry`
4. **應用模組**: `edc_dashboard`

## 🎯 核心模組功能

### **`edc_core.js`** - 系統核心
- 定義系統常數 (`FIELD_TYPES`, `VALIDATION_RULES`)
- 提供基礎函數 (`formatDate`, `parseValue`)
- 管理全域狀態和配置

### **`edc_utils.js`** - 工具函數庫
- 日期處理 (`formatDate`, `parseDate`)
- 數值處理 (`parseFloat`, `formatNumber`)
- 字串處理 (`capitalize`, `truncate`)
- DOM 操作輔助 (`createElement`, `addEvent`)

### **`edc_data_browser_generator.js`** - 頁面生成器
- 根據 JSON 配置生成 HTML 結構
- 處理不同欄位類型 (`text`, `radio`, `checkbox`, `select`)
- 支援子區段 (`subsections`) 和條件顯示
- 生成唯讀和可編輯的欄位

### **`edc_data_editor.js`** - 編輯管理器
- 管理編輯模式切換
- 處理欄位狀態轉換 (唯讀 ↔ 可編輯)
- 收集和驗證表單資料
- 與後端 API 通訊

## 🔧 配置驅動架構

### JSON 配置檔案
- **`edc_data_browser_config.json`**: 定義詳細資料頁面的結構和欄位
- **`edc_data_entry_config.json`**: 定義新增資料表單的結構和驗證規則

### 配置結構範例
```json
{
  "sections": [
    {
      "title": "基本資料",
      "fields": [
        {
          "id": "age",
          "label": "年齡",
          "type": "text",
          "required": true,
          "validation": "number"
        }
      ]
    }
  ]
}
```

## 🌐 前後端通訊

### API 端點
- **GET** `/edc/subjects` - 獲取受試者列表
- **GET** `/edc/subject/{subject_code}` - 獲取特定受試者資料
- **POST** `/edc/subject` - 新增受試者資料
- **PUT** `/edc/update-subject/{subject_code}` - 更新受試者資料

### 資料格式
```javascript
// 更新請求格式
{
  "subject_data": { /* 基本資料 */ },
  "inclusion_data": { /* 納入條件 */ },
  "exclusion_data": { /* 排除條件 */ }
}
```

## 🚀 使用方式

### 1. 基本使用
```html
<!-- 在 HTML 中引入 -->
<script src="assets/js/edc/edc_loader.js"></script>
<script>
    // 載入所有模組
    EDCLoader.loadAll().then(() => {
        // 初始化儀表板
        EDC.init();
    });
</script>
```

### 2. 模組化使用
```javascript
// 載入特定模組
EDCLoader.loadModule('edc_data_browser').then(() => {
    // 使用資料瀏覽功能
    DataBrowser.displayData(subjectCode);
});
```

## 🔍 除錯和開發

### 開發者工具
- 所有模組都有詳細的 Console 日誌
- 使用 `console.log()` 追蹤資料流
- 檢查瀏覽器 Network 標籤查看 API 請求

### 常見問題
1. **模組載入失敗**: 檢查 `edc_loader.js` 中的依賴配置
2. **欄位不顯示**: 檢查 JSON 配置檔案格式
3. **編輯模式無效**: 確認用戶權限設定
4. **API 錯誤**: 檢查後端端點和資料格式

## 📈 擴展性設計

### 新增欄位類型
1. 在 `edc_core.js` 中定義新類型
2. 在生成器中實現渲染邏輯
3. 在配置檔案中使用新類型

### 新增驗證規則
1. 在 `edc_validation.js` 中定義規則
2. 在配置檔案中引用規則
3. 在處理器中應用驗證

### 新增模組
1. 在 `edc_loader.js` 中定義依賴關係
2. 實現模組功能
3. 在需要的地方引入使用

---

*本文件描述了 EDC 系統的完整架構，包括模組關係、資料流、載入機制和擴展方式。如需更詳細的實作說明，請參考各模組的程式碼註解。*
