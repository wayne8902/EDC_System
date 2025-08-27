# EDC 系統模組化架構說明

## 概述

本文件說明 EDC 系統的模組化架構，將原本的 `edc_dashboard.js`（2881 行）分解為多個功能明確的模組。

## 模組結構

### 核心模組

#### 1. `edc_core.js` - 核心配置
- **功能**：全域變數、角色配置、快速操作配置、系統常數
- **包含**：
  - `ROLE_CONFIG` - 角色權限配置
  - `QUICK_ACTIONS_CONFIG` - 快速操作配置
  - `EDC_CONSTANTS` - 系統常數
  - 全域變數 `userRole`、`userPermissions`
- **依賴**：無
- **大小**：約 200 行

#### 2. `edc_utils.js` - 工具函數
- **功能**：通用工具函數和輔助功能
- **包含**：
  - Cookie 管理（`getCookie`, `setCookie`, `deleteCookie`）
  - 日期時間格式化（`formatDate`, `formatDateTime`）
  - 通用工具（`generateUniqueId`, `deepClone`, `debounce`, `throttle`）
  - 驗證函數（`isValidEmail`, `isValidTaiwanPhone`）
  - 訊息顯示（`showSuccessMessage`, `showErrorMessage`）
  - 載入管理（`LoadingManager`）
  - 用戶資訊管理（`loadUserInfo`, `loadUserPermissions`）
- **依賴**：`edc_core.js`
- **大小**：約 300 行

#### 3. `edc_calculations.js` - 計算功能
- **功能**：醫學計算和驗證功能
- **包含**：
  - 年齡計算（`calculateAge`）
  - BMI 計算（`calculateBMI`, `getPreciseBMI`, `getDisplayBMI`）
  - eGFR 計算（`calculateEGFR`, `getPreciseEGFR`）
  - 時間間隔檢查（`checkLabTimeInterval`, `checkImageLabTimeInterval`）
  - 其他醫學計算（`calculateBodySurfaceArea`, `calculateIdealBodyWeight`）
- **依賴**：`edc_core.js`, `edc_utils.js`
- **大小**：約 250 行

#### 4. `edc_validation.js` - 驗證功能
- **功能**：表單驗證規則和驗證器
- **包含**：
  - 驗證規則配置（`VALIDATION_RULES`）
  - 驗證器類別（`EDCValidator`）
  - 通用驗證模式（`COMMON_VALIDATIONS`）
  - 驗證輔助函數
- **依賴**：`edc_core.js`, `edc_utils.js`
- **大小**：約 200 行

#### 5. `edc_form_handlers.js` - 表單處理
- **功能**：表單驗證、納入條件監控、排除條件處理
- **包含**：
  - 納入條件監控（`setupInclusionCriteriaMonitoring`）
  - 條件更新（`updateInclusionCriteria`, `updateExclusionCriteria`）
  - 表單控制（`toggleTreatmentSection`, `toggleExclusionDetails`）
  - 索引頁切換（`setupTabNavigation`）
  - 治療資料驗證（`validateTreatmentData`）
- **依賴**：`edc_core.js`, `edc_utils.js`, `edc_calculations.js`
- **大小**：約 400 行

### 功能模組

#### 6. `edc_data_entry.js` - 資料輸入
- **功能**：新增資料的表單處理、驗證和提交
- **包含**：
  - 資料輸入管理器（`DataEntryManager`）
  - 表單初始化（`initializeResearcherForm`）
  - 表單驗證設置（`setupFormValidation`）
  - 動態新增功能（`addDrug`, `addSurg`）
  - 草稿管理（`saveDraft`, `loadDraft`）
- **依賴**：`edc_core.js`, `edc_utils.js`, `edc_calculations.js`, `edc_validation.js`, `edc_form_handlers.js`
- **大小**：約 500 行

#### 7. `edc_data_browser.js` - 資料瀏覽
- **功能**：資料查詢、篩選、分頁、排序、匯出
- **包含**：
  - 資料瀏覽管理器（`DataBrowserManager`）
  - 搜尋和篩選功能
  - 分頁和排序
  - 資料匯出
- **依賴**：`edc_core.js`, `edc_utils.js`
- **大小**：約 300 行

#### 8. `edc_data_editor.js` - 資料編輯
- **功能**：編輯現有資料、變更追蹤、自動儲存
- **包含**：
  - 資料編輯管理器（`DataEditorManager`）
  - 表單載入和填充
  - 變更追蹤
  - 自動儲存草稿
- **依賴**：`edc_core.js`, `edc_utils.js`, `edc_calculations.js`, `edc_validation.js`
- **大小**：約 350 行

### 模組載入器

#### 9. `edc_loader.js` - 模組載入器
- **功能**：管理所有模組的載入順序和依賴關係
- **包含**：
  - 模組載入器類別（`EDCModuleLoader`）
  - 依賴關係管理
  - 載入進度顯示
  - 儀表板初始化
  - 功能按鈕處理
- **依賴**：所有其他模組
- **大小**：約 600 行

### 額外模組（可選）

#### 10. `edc_modules/role_management.js` - 角色權限管理
- **功能**：角色定義、權限檢查、動態功能控制
- **依賴**：`edc_core.js`, `edc_utils.js`

#### 11. `edc_modules/form_generation.js` - 動態表單生成
- **功能**：表單配置、動態欄位生成、表單驗證
- **依賴**：`edc_core.js`, `edc_utils.js`, `edc_validation.js`

#### 12. `edc_modules/data_collection.js` - 資料收集和提交
- **功能**：資料收集、驗證、提交、狀態管理
- **依賴**：`edc_core.js`, `edc_utils.js`, `edc_validation.js`

#### 13. `edc_modules/ui_controls.js` - UI控制元件
- **功能**：可重用的UI元件、互動控制
- **依賴**：`edc_core.js`, `edc_utils.js`

## 依賴關係圖

```
edc_core.js (基礎)
    ↓
edc_utils.js
    ↓
edc_calculations.js
    ↓
edc_validation.js
    ↓
edc_form_handlers.js
    ↓
edc_data_entry.js
    ↓
edc_data_browser.js
edc_data_editor.js
    ↓
edc_loader.js (整合所有模組)
```

## 模組載入順序

1. `edc_core.js` - 核心配置
2. `edc_utils.js` - 工具函數
3. `edc_calculations.js` - 計算功能
4. `edc_validation.js` - 驗證功能
5. `edc_form_handlers.js` - 表單處理
6. `edc_data_entry.js` - 資料輸入
7. `edc_data_browser.js` - 資料瀏覽
8. `edc_data_editor.js` - 資料編輯
9. `edc_loader.js` - 模組載入器

## 優點

### 1. 可維護性
- 每個模組功能明確，易於理解和修改
- 單一職責原則，降低耦合度
- 程式碼結構清晰，便於除錯

### 2. 可重用性
- 模組可以獨立使用
- 其他專案可以引用特定模組
- 便於單元測試

### 3. 團隊協作
- 不同開發者可以並行開發不同模組
- 減少程式碼衝突
- 便於程式碼審查

### 4. 效能優化
- 按需載入模組
- 減少初始載入時間
- 便於程式碼分割和懶載入

## 使用方式

### 1. 基本使用
```html
<!-- 只需要載入載入器 -->
<script src="assets/js/edc/edc_loader.js"></script>
```

### 2. 手動載入特定模組
```javascript
// 等待 EDC 系統就緒
await waitForEDCReady();

// 使用特定功能
if (typeof calculateBMI === 'function') {
    calculateBMI();
}
```

### 3. 檢查模組狀態
```javascript
const status = edcModuleLoader.getLoadStatus();
console.log('已載入模組:', status.loaded);
console.log('載入中模組:', status.loading);
```

## 注意事項

1. **依賴關係**：確保模組載入順序正確
2. **全域變數**：避免在模組中污染全域命名空間
3. **錯誤處理**：模組載入失敗時要有適當的錯誤處理
4. **向後相容**：保持與現有程式碼的相容性

## 未來擴展

1. **新功能模組**：可以輕鬆添加新的功能模組
2. **外掛系統**：支援第三方外掛和擴展
3. **模組熱重載**：開發時支援模組熱重載
4. **效能監控**：添加模組載入效能監控
