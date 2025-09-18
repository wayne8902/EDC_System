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

class FrontendRouter {
    constructor() {
        this.isHandlingRoute = false;
        this.routes = {
            '/edc/': () => this.showDashboard(),
            '/edc/browser': () => this.checkRoutePermission('edc.data.view', () => this.showDataBrowser()),
            '/edc/browser/:subjectCode': (subjectCode) => this.checkRoutePermission('edc.data.view', () => this.showSubjectDetail(subjectCode)),
            '/edc/entry': () => this.checkRoutePermission('edc.data.create', () => this.showDataEntry())
        };
        this.setupEventListeners();
    }

    setupEventListeners() {
        // 監聽瀏覽器的前進/後退按鈕
        window.addEventListener('popstate', (event) => {
            this.handleRoute(window.location.pathname, false);
        });
    }

    // 導航到指定路徑
    navigateTo(path, addToHistory = true) {
        // 確保路徑以 / 開頭
        if (!path.startsWith('/')) {
            path = '/' + path;
        }
        
        if (addToHistory && window.location.pathname !== path) {
            window.history.pushState({}, '', path);
        }
        this.handleRoute(path, false);
    }

    // 處理路由
    handleRoute(path, addToHistory = true) {
        // 防止無限循環
        if (this.isHandlingRoute) {
            return;
        }
        
        this.isHandlingRoute = true;
        
        try {
            // 匹配路由
            for (const [pattern, handler] of Object.entries(this.routes)) {
                const match = this.matchRoute(pattern, path);
                if (match) {
                    if (match.params) {
                        handler(...Object.values(match.params));
                    } else {
                        handler();
                    }
                    return;
                }
            }

            // 如果沒有匹配到路由，導航到首頁
            if (path !== '/edc/') {
                window.history.replaceState({}, '', '/edc/');
                this.showDashboard();
            }
        } finally {
            this.isHandlingRoute = false;
        }
    }

    /**
     * 檢查權限並顯示頁面
     * @param {string} permission - 需要的權限
     * @param {Function} showFunction - 顯示頁面的函數
     */
    checkRoutePermission(permission, showFunction) {
        // console.log('權限檢查:', {
        //     permission: permission,
        //     userPermissions: userPermissions,
        //     hasPermission: typeof userPermissions !== 'undefined' && userPermissions.includes(permission)
        // });
        
        // 檢查用戶權限
        if (typeof userPermissions !== 'undefined' && userPermissions.includes(permission)) {
            showFunction();
        } else {
            // 沒有權限，顯示錯誤訊息並導航到首頁
            const errorMsg = typeof userPermissions === 'undefined' 
                ? '權限資訊尚未載入，請稍後再試' 
                : `您沒有 ${this.getPermissionName(permission)} 權限，無法訪問此頁面`;
            showErrorMessage(errorMsg);
            this.navigateTo('/edc/');
        }
    }

    /**
     * 獲取權限的中文名稱
     * @param {string} permission - 權限代碼
     * @returns {string} 權限中文名稱
     */
    getPermissionName(permission) {
        const permissionNames = {
            'edc.data.view': '資料查看',
            'edc.data.create': '資料建立',
            'edc.data.edit': '資料編輯',
            'edc.data.freeze': '資料凍結',
            'edc.query.create': 'Query 發起',
            'edc.query.view': 'Query 查看',
            'edc.query.response': 'Query 回應',
            'edc.crf.sign': '電子簽署',
            'edc.system.admin': '系統管理'
        };
        return permissionNames[permission] || permission;
    }

    // 路由匹配
    matchRoute(pattern, path) {
        // 移除空字串元素
        const patternParts = pattern.split('/').filter(part => part !== '');
        const pathParts = path.split('/').filter(part => part !== '');

        if (patternParts.length !== pathParts.length) {
            return null;
        }

        const params = {};
        for (let i = 0; i < patternParts.length; i++) {
            const patternPart = patternParts[i];
            const pathPart = pathParts[i];

            if (patternPart.startsWith(':')) {
                // 動態參數
                const paramName = patternPart.substring(1);
                params[paramName] = pathPart;
            } else if (patternPart !== pathPart) {
                // 靜態路徑不匹配
                return null;
            }
        }

        return { params: Object.keys(params).length > 0 ? params : null };
    }

    showDashboard() {
        // 顯示儀表板首頁
        const mainContent = document.getElementById('mainContent');
        if (mainContent) {
            mainContent.innerHTML = '<div class="text-center"><h3>EDC 系統首頁</h3></div>';
        }
    }

    showDataBrowser() {
        // 顯示資料瀏覽器，避免無限循環
        if (typeof showDataBrowser === 'function') {
            showDataBrowser();
        } else {
            console.error('showDataBrowser 函數未找到');
            showErrorMessage('資料瀏覽功能載入失敗，請重新整理頁面');
        }
    }

    showDataEntry() {
        // 顯示資料輸入頁面
        if (typeof showResearcherForm === 'function') {
            showResearcherForm();
        } else {
            console.error('showResearcherForm 函數未找到');
            showErrorMessage('資料輸入功能載入失敗，請重新整理頁面');
        }
    }

    showSubjectDetail(subjectCode) {
        // 顯示受試者詳細資料
        if (typeof DataBrowserManager !== 'undefined' && DataBrowserManager.fetchSubjectDetails) {
            DataBrowserManager.fetchSubjectDetails(subjectCode);
        } else {
            console.error('DataBrowserManager.fetchSubjectDetails 函數未找到');
            showErrorMessage('資料詳細功能載入失敗，請重新整理頁面');
        }
    }
}

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
            script.src = `/static/assets/js/edc/${moduleName}.js`;
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
async function initializeDashboard() {
    // console.log('初始化 EDC 儀表板...');

    // 初始化前端路由
    window.frontendRouter = new FrontendRouter();
    
    // 先載入用戶資訊和權限
    if (typeof loadUserInfo === 'function') {
        loadUserInfo();
    }
    
    // 等待權限載入完成
    if (typeof loadUserPermissions === 'function') {
        await new Promise((resolve) => {
            const originalLoadUserPermissions = loadUserPermissions;
            loadUserPermissions = function() {
                originalLoadUserPermissions();
                // 等待權限載入完成
                const checkPermissions = () => {
                    if (typeof userPermissions !== 'undefined') {
                        resolve();
                    } else {
                        setTimeout(checkPermissions, 50);
                    }
                };
                checkPermissions();
            };
            loadUserPermissions();
        });
    }

    // 處理當前 URL，如果是根路徑則導航到 EDC 首頁
    const currentPath = window.location.pathname;
    if (currentPath === '/' || currentPath === '/static/edc_dashboard.html') {
        // 直接設置 URL 而不觸發路由處理
        window.history.replaceState({}, '', '/edc/');
        frontendRouter.showDashboard();
    } else {
        frontendRouter.handleRoute(currentPath, false);
    }
    
    // 更新登入時間
    if (typeof updateLoginTime === 'function') {
        updateLoginTime();
    }
    
    // 初始化資料輸入模組
    if (typeof initDataEntry === 'function') {
        initDataEntry();
    }
    

    // 載入儀表板統計
    if (typeof loadDashboardStats === 'function') {
        loadDashboardStats();
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
    if (!frontendRouter.isHandlingRoute) {
        frontendRouter.navigateTo('/edc/browser');
    } else {
        if (typeof showDataBrowser === 'function') {
            showDataBrowser();
        } else {
            console.error('showDataBrowser 函數未找到');
            showErrorMessage('資料瀏覽功能載入失敗，請重新整理頁面');
        }
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
    // 避免在路由處理中再次調用路由
    if (!frontendRouter.isHandlingRoute) {
        frontendRouter.navigateTo('/edc/entry');
    } else {
        // 直接顯示資料輸入
        if (typeof showResearcherForm === 'function') {
            showResearcherForm();
        } else {
            console.error('showResearcherForm 函數未找到');
            showErrorMessage('資料輸入功能載入失敗，請重新整理頁面');
        }
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
            await initializeDashboard(); // 初始化儀表板
            // openDataBrowser();
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