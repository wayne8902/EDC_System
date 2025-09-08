// EDC 系統模組載入器
// 負責載入和管理所有 EDC 模組的依賴關係和初始化

// 模組依賴圖
const MODULE_DEPENDENCIES = {
    'edc_core': [],
    'edc_utils': ['edc_core'],
    'edc_calculations': ['edc_core', 'edc_utils'],
    'edc_validation': ['edc_core', 'edc_utils'],
    'edc_data_entry_handler': ['edc_core', 'edc_utils', 'edc_calculations'],
    'edc_data_entry_generator': [],
    'edc_data_entry': ['edc_core', 'edc_utils', 'edc_calculations', 'edc_validation', 'edc_data_entry_handler', 'edc_data_entry_generator'],
    'edc_data_query': ['edc_core', 'edc_utils'],
    'edc_data_browser': ['edc_core', 'edc_utils', 'edc_calculations', 'edc_data_browser_generator', 'edc_data_editor', 'edc_data_query'],
    'edc_data_editor': ['edc_core', 'edc_utils', 'edc_calculations']
};

// 模組載入狀態
const moduleLoadStatus = new Map();

// 模組載入器
class EDCModuleLoader {
    constructor() {
        this.loadedModules = new Set();
        this.loadingModules = new Set();
        this.loadOrder = [];
    }
    
    // 計算載入順序
    calculateLoadOrder() {
        const visited = new Set();
        const temp = new Set();
        const order = [];
        
        const visit = (moduleName) => {
            if (temp.has(moduleName)) {
                throw new Error(`循環依賴檢測到: ${moduleName}`);
            }
            if (visited.has(moduleName)) return;
            
            temp.add(moduleName);
            
            const dependencies = MODULE_DEPENDENCIES[moduleName] || [];
            for (const dep of dependencies) {
                visit(dep);
            }
            
            temp.delete(moduleName);
            visited.add(moduleName);
            order.push(moduleName);
        };
        
        // 遍歷所有模組
        for (const moduleName of Object.keys(MODULE_DEPENDENCIES)) {
            if (!visited.has(moduleName)) {
                visit(moduleName);
            }
        }
        
        this.loadOrder = order;
        return order;
    }
    
    // 載入模組
    async loadModule(moduleName) {
        if (this.loadedModules.has(moduleName)) {
            return true;
        }
        
        if (this.loadingModules.has(moduleName)) {
            // 等待模組載入完成
            while (this.loadingModules.has(moduleName)) {
                await new Promise(resolve => setTimeout(resolve, 10));
            }
            return this.loadedModules.has(moduleName);
        }
        
        this.loadingModules.add(moduleName);
        
        try {
            const script = document.createElement('script');
            script.src = `assets/js/edc/${moduleName}.js`;
            script.async = true;
            
            await new Promise((resolve, reject) => {
                script.onload = resolve;
                script.onerror = () => reject(new Error(`無法載入模組: ${moduleName}`));
                document.head.appendChild(script);
            });
            
            this.loadedModules.add(moduleName);
            this.loadingModules.delete(moduleName);
            

            return true
            
        } catch (error) {
            this.loadingModules.delete(moduleName);
            console.error(`✗ 模組載入失敗: ${moduleName}`, error);
            return false;
        }
    }
    
    // 載入所有模組
    async loadAllModules() {
        const loadOrder = this.calculateLoadOrder();
        
        for (const moduleName of loadOrder) {
            const success = await this.loadModule(moduleName);
            if (!success) {
                console.error(`✗ 模組載入失敗，停止載入: ${moduleName}`);
                return false;
            }
        }
    
        return true;
    }
    
    // 檢查模組是否已載入
    isModuleLoaded(moduleName) {
        return this.loadedModules.has(moduleName);
    }
    
    // 獲取載入狀態
    getLoadStatus() {
        return {
            loaded: Array.from(this.loadedModules),
            loading: Array.from(this.loadingModules),
            total: Object.keys(MODULE_DEPENDENCIES).length
        };
    }
}

// 全域模組載入器實例
const edcModuleLoader = new EDCModuleLoader();

// 顯示 EDC 載入進度
function showEDCLoadingProgress() {
    const progressDiv = document.createElement('div');
    progressDiv.id = 'edc-loading-progress';
    progressDiv.innerHTML = `
        <div class="edc-loading-overlay">
            <div class="edc-loading-content">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">載入中...</span>
                </div>
                <h5 class="mt-3">系統載入中...</h5>
                <div class="progress mt-3" style="width: 300px;">
                    <div class="progress-bar" role="progressbar" style="width: 0%"></div>
                </div>
                <p class="mt-2 text-muted">正在載入系統模組...</p>
            </div>
        </div>
    `;
    
    progressDiv.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
    `;
    
    document.body.appendChild(progressDiv);
    
    // 更新進度條
    const progressBar = progressDiv.querySelector('.progress-bar');
    const progressText = progressDiv.querySelector('p');
    
    const updateProgress = (current, total) => {
        const percentage = Math.round((current / total) * 100);
        progressBar.style.width = `${percentage}%`;
        progressBar.setAttribute('aria-valuenow', percentage);
        progressText.textContent = `已載入 ${current}/${total} 個模組...`;
    };
    
    return { updateProgress, hide: () => progressDiv.remove() };
}

// 檢查 EDC 是否準備就緒
function isEDCReady() {
    return edcModuleLoader.loadedModules.size === Object.keys(MODULE_DEPENDENCIES).length;
}

// 等待 EDC 準備就緒
function waitForEDCReady() {
    return new Promise((resolve) => {
        if (isEDCReady()) {
            resolve();
            return;
        }
        
        const checkInterval = setInterval(() => {
            if (isEDCReady()) {
                clearInterval(checkInterval);
                resolve();
            }
        }, 100);
    });
}

// 初始化儀表板
function initializeDashboard() {
    // console.log('初始化 EDC 儀表板...');
    
    // 載入用戶資訊
    if (typeof loadUserInfo === 'function') {
        loadUserInfo();
    }
    
    // 載入用戶權限
    if (typeof loadUserPermissions === 'function') {
        loadUserPermissions();
    }
    
    // 更新登入時間
    if (typeof updateLoginTime === 'function') {
        updateLoginTime();
    }
    
    // 載入儀表板統計
    if (typeof loadDashboardStats === 'function') {
        loadDashboardStats();
    }
    
    // 初始化資料輸入模組
    if (typeof initDataEntry === 'function') {
        initDataEntry();
    }
    

}

// 功能按鈕點擊處理 - 系統管理員
function openUserManagement() { 
    showSuccessMessage('進入用戶管理功能'); 
}

function openPermissionManagement() { 
    showSuccessMessage('進入權限管理功能'); 
}

function openSystemMonitoring() { 
    showSuccessMessage('進入系統監控功能'); 
}

function openAuditLogs() { 
    showSuccessMessage('進入審計記錄功能'); 
}

function openBackupRestore() { 
    showSuccessMessage('進入備份還原功能'); 
}

function openSystemConfig() { 
    showSuccessMessage('進入系統配置功能'); 
}

// 功能按鈕點擊處理 - 試驗委託者
function openDataBrowser() {

    if (typeof showDataBrowser === 'function') {
        showDataBrowser();
    } else {
        console.error('showDataBrowser 函數未找到');
        showErrorMessage('資料瀏覽功能載入失敗，請重新整理頁面');
    }
}

function openReports() { 
    showSuccessMessage('進入報告查看功能'); 
}

function openDataExport() { 
    showSuccessMessage('進入資料匯出功能'); 
}

// 功能按鈕點擊處理 - 研究人員
function openDataEntry() { 
    if (typeof showResearcherForm === 'function') {
        showResearcherForm();
    } else {
        showSuccessMessage('進入資料新增功能');
    }
}

function openDataEditor() { 
    showSuccessMessage('進入資料編輯功能'); 
}

function openQueryResponse() { 
    showSuccessMessage('進入查詢回應功能'); 
}

function openDataValidation() { 
    showSuccessMessage('進入資料驗證功能'); 
}

// 功能按鈕點擊處理 - 試驗主持人
function openCRFReview() { 
    showSuccessMessage('進入CRF審查功能'); 
}

function openDigitalSignature() { 
    showSuccessMessage('進入電子簽署功能'); 
}

function openPatientConsent() { 
    showSuccessMessage('進入受試者同意功能'); 
}

function openAdverseEvents() { 
    showSuccessMessage('進入不良事件功能'); 
}

// 功能按鈕點擊處理 - 試驗監測者
function openDataAudit() { 
    showSuccessMessage('進入資料審查功能'); 
}

function openDataFreeze() { 
    showSuccessMessage('進入資料凍結功能'); 
}

function openQueryCreation() { 
    showSuccessMessage('進入Query 發起功能'); 
}

function openQueryManagement() { 
    showSuccessMessage('進入Query 查看功能'); 
}

function openSiteVisits() { 
    showSuccessMessage('進入現場訪視功能'); 
}

function openComplianceCheck() { 
    showSuccessMessage('進入合規檢查功能'); 
}

// 通用功能
function openSystemManagement() { 
    showSuccessMessage('進入系統管理功能'); 
}



// 主要初始化函數
async function initializeEDC() {
    try {
        // 顯示載入進度
        const progress = showEDCLoadingProgress();
        
        // 載入所有模組
        const success = await edcModuleLoader.loadAllModules();
        
        if (success) {
            progress.hide(); // 隱藏載入進度
            initializeDashboard(); // 初始化儀表板
            openDataBrowser();
        } else {
            throw new Error('模組載入失敗');
        }
        
    } catch (error) {
        console.error('✗ EDC 系統初始化失敗:', error);
        showErrorMessage('系統初始化失敗，請重新整理頁面');
    }
}

// 頁面載入時執行
document.addEventListener('DOMContentLoaded', function() {
    initializeEDC();
});

// 瀏覽器環境模組匯出
if (typeof window !== 'undefined') {
    window.EDCModuleLoader = EDCModuleLoader;
    window.edcModuleLoader = edcModuleLoader;
    window.showEDCLoadingProgress = showEDCLoadingProgress;
    window.isEDCReady = isEDCReady;
    window.waitForEDCReady = waitForEDCReady;
    window.initializeDashboard = initializeDashboard;
    window.initializeEDC = initializeEDC;
    window.openUserManagement = openUserManagement;
    window.openPermissionManagement = openPermissionManagement;
    window.openSystemMonitoring = openSystemMonitoring;
    window.openAuditLogs = openAuditLogs;
    window.openBackupRestore = openBackupRestore;
    window.openSystemConfig = openSystemConfig;
    window.openDataBrowser = openDataBrowser;
    window.openReports = openReports;
    window.openDataExport = openDataExport;
    window.openDataEntry = openDataEntry;
    window.openDataEditor = openDataEditor;
    window.openQueryResponse = openQueryResponse;
    window.openDataValidation = openDataValidation;
    window.openCRFReview = openCRFReview;
    window.openDigitalSignature = openDigitalSignature;
    window.openPatientConsent = openPatientConsent;
    window.openAdverseEvents = openAdverseEvents;
    window.openDataAudit = openDataAudit;
    window.openDataFreeze = openDataFreeze;
    window.openQueryCreation = openQueryCreation;
    window.openQueryManagement = openQueryManagement;
    window.openSiteVisits = openSiteVisits;
    window.openComplianceCheck = openComplianceCheck;
    window.openSystemManagement = openSystemManagement;
}