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
    
    'edc_data_browser': ['edc_core', 'edc_utils', 'edc_data_browser_generator', 'edc_data_editor'],
    'edc_data_editor': ['edc_core', 'edc_utils']
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
            
            console.log(`✓ 模組載入成功: ${moduleName}`);
            return true
            
        } catch (error) {
            this.loadingModules.delete(moduleName);
            console.error(`✗ 模組載入失敗: ${moduleName}`, error);
            return false;
        }
    }
    
    // 載入所有模組
    async loadAllModules() {
        console.log('▼ 開始載入 EDC 模組...');
        
        const loadOrder = this.calculateLoadOrder();
        console.log('模組載入順序:', loadOrder);
        
        for (const moduleName of loadOrder) {
            const success = await this.loadModule(moduleName);
            if (!success) {
                console.error(`✗ 模組載入失敗，停止載入: ${moduleName}`);
                return false;
            }
        }
        
        console.log('✓ 所有模組載入完成');
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
                <h5 class="mt-3">EDC 系統載入中...</h5>
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
    
    console.log('✓ EDC 儀表板初始化完成');
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
        console.log('✓ 調用 showDataBrowser 函數');
        showDataBrowser();
    } else {
        console.error('✗ showDataBrowser 函數未找到');
        console.error('✗ 可用的全域函數:', Object.keys(window).filter(key => key.includes('Data')));
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
    showSuccessMessage('進入查詢發起功能'); 
}

function openQueryManagement() { 
    showSuccessMessage('進入查詢管理功能'); 
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

// 登出
function logout() {
    if (confirm('確定要登出嗎？')) {
        window.location.href = '/login/logout';
    }
}

// 生成角色專屬儀表板
function generateRoleDashboard() {
    const roleContent = document.getElementById('roleBasedContent');
    if (!roleContent) return;
    
    const roleConfig = ROLE_CONFIG[userRole];
    
    if (!roleConfig) {
        roleContent.innerHTML = '<div class="alert alert-warning">無法識別用戶角色</div>';
        return;
    }

    let html = `
        <div class="role-dashboard">
            <div class="role-header ${userRole}" style="border-left-color: ${roleConfig.color}">
                <h3>
                    <i class="${roleConfig.icon}" style="color: ${roleConfig.color}"></i>
                    ${roleConfig.name}專屬功能
                </h3>
            </div>
            <div class="feature-grid">
    `;

    // 動態生成功能卡片
    roleConfig.features.forEach(feature => {
        html += `
            <div class="feature-card ${userRole}">
                <div class="feature-icon">
                    <i class="${feature.icon}"></i>
                </div>
                <div class="feature-title">${feature.title}</div>
                <div class="feature-description">${feature.description}</div>
                <button class="btn feature-button" onclick="${feature.action}()">
                    進入功能
                </button>
            </div>
        `;
    });

    html += `
            </div>
        </div>
        
        <!-- 系統角色權限說明表格 -->
        <div class="role-permissions-table">
            <div class="table-header">
                <h4><i class="fas fa-info-circle"></i> 系統角色權限說明</h4>
                <p class="text-muted">以下是系統中所有角色的權限說明，幫助您了解不同角色的功能範圍</p>
            </div>
            <div class="table-responsive">
                <table class="table table-striped table-hover">
                    <thead class="table-dark">
                        <tr>
                            <th>角色</th>
                            <th>權限說明</th>
                            <th>主要功能</th>
                            <th>適用場景</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                <span class="badge bg-danger">系統管理員</span>
                            </td>
                            <td>擁有系統所有權限，可以管理用戶、權限、系統配置等</td>
                            <td>
                                <ul class="list-unstyled mb-0">
                                    <li><i class="fas fa-users text-primary"></i> 用戶管理</li>
                                    <li><i class="fas fa-shield-alt text-success"></i> 權限管理</li>
                                    <li><i class="fas fa-chart-line text-info"></i> 系統監控</li>
                                    <li><i class="fas fa-history text-warning"></i> 審計記錄</li>
                                </ul>
                            </td>
                            <td>IT管理員、系統維護人員</td>
                        </tr>
                        <tr>
                            <td>
                                <span class="badge bg-success">試驗委託者</span>
                            </td>
                            <td>可以查看試驗資料、報告，進行資料匯出等操作</td>
                            <td>
                                <ul class="list-unstyled mb-0">
                                    <li><i class="fas fa-database text-primary"></i> 資料瀏覽</li>
                                    <li><i class="fas fa-chart-bar text-success"></i> 報告查看</li>
                                    <li><i class="fas fa-download text-info"></i> 資料匯出</li>
                                </ul>
                            </td>
                            <td>藥廠代表、試驗委託方</td>
                        </tr>
                        <tr>
                            <td>
                                <span class="badge bg-info">研究人員</span>
                            </td>
                            <td>負責試驗資料的新增、編輯、驗證和查詢回應</td>
                            <td>
                                <ul class="list-unstyled mb-0">
                                    <li><i class="fas fa-plus-circle text-primary"></i> 新增資料</li>
                                    <li><i class="fas fa-edit text-success"></i> 編輯資料</li>
                                    <li><i class="fas fa-reply text-info"></i> 回應查詢</li>
                                    <li><i class="fas fa-check-double text-warning"></i> 資料驗證</li>
                                </ul>
                            </td>
                            <td>護理師、研究助理、資料輸入員</td>
                        </tr>
                        <tr>
                            <td>
                                <span class="badge bg-warning text-dark">試驗主持人</span>
                            </td>
                            <td>負責CRF審查、電子簽署、受試者同意和不良事件管理</td>
                            <td>
                                <ul class="list-unstyled mb-0">
                                    <li><i class="fas fa-check-circle text-primary"></i> CRF審查</li>
                                    <li><i class="fas fa-signature text-success"></i> 電子簽署</li>
                                    <li><i class="fas fa-user-check text-info"></i> 受試者同意</li>
                                    <li><i class="fas fa-exclamation-triangle text-warning"></i> 不良事件</li>
                                </ul>
                            </td>
                            <td>醫師、試驗主持人、主要研究者</td>
                        </tr>
                        <tr>
                            <td>
                                <span class="badge bg-secondary">試驗監測者</span>
                            </td>
                            <td>負責資料審查、查詢管理、現場訪視和合規檢查</td>
                            <td>
                                <ul class="list-unstyled mb-0">
                                    <li><i class="fas fa-search text-primary"></i> 資料審查</li>
                                    <li><i class="fas fa-snowflake text-success"></i> 資料凍結</li>
                                    <li><i class="fas fa-question-circle text-info"></i> 查詢管理</li>
                                    <li><i class="fas fa-map-marker-alt text-warning"></i> 現場訪視</li>
                                </ul>
                            </td>
                            <td>CRA、試驗監測員、品質保證人員</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    roleContent.innerHTML = html;
}

// 載入儀表板統計
function loadDashboardStats() {
    // 這裡可以從後端 API 獲取實際統計資料
    const totalCRFsElement = document.getElementById('totalCRFs');
    const pendingQueriesElement = document.getElementById('pendingQueries');
    const signedCRFsElement = document.getElementById('signedCRFs');
    const activeUsersElement = document.getElementById('activeUsers');
    
    if (totalCRFsElement) totalCRFsElement.textContent = '156';
    if (pendingQueriesElement) pendingQueriesElement.textContent = '23';
    if (signedCRFsElement) signedCRFsElement.textContent = '89';
    if (activeUsersElement) activeUsersElement.textContent = '12';
}

// 管理角色表單的顯示/隱藏
function manageRoleForms() {
    // 隱藏所有角色表單
    if (typeof hideResearcherForm === 'function') {
        hideResearcherForm();
    }
    
    // 根據角色顯示對應表單
    if (userRole === 'researcher') {
        if (typeof showResearcherForm === 'function') {
            showResearcherForm();
        }
    }
    // 未來可以添加其他角色的表單控制
}

// 主要初始化函數
async function initializeEDC() {
    console.log('EDC 系統初始化開始...');
    
    try {
        // 顯示載入進度
        const progress = showEDCLoadingProgress();
        
        // 載入所有模組
        const success = await edcModuleLoader.loadAllModules();
        
        if (success) {
            progress.hide(); // 隱藏載入進度
            initializeDashboard(); // 初始化儀表板
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
    console.log('頁面載入完成，開始初始化 EDC 系統...');
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
    window.logout = logout;
    window.generateRoleDashboard = generateRoleDashboard;
    window.loadDashboardStats = loadDashboardStats;
    window.manageRoleForms = manageRoleForms;
}