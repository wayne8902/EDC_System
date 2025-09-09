// EDC 系統工具函數檔案
// 包含各種通用工具函數和輔助功能

// ========================================
// EDC 系統常數定義
// ========================================
const EDCConstants = {
    // 基本欄位定義
    RADIO_FIELDS: [
        'gender', 'bacteriuria', 'dm', 'gout', 'imgType', 'stone',
        'visKidney', 'visMidUreter', 'visLowerUreter', 'noTx',
        'pregnantFemale', 'kidneyTransplant', 'urinaryForeignBody', 
        'urinarySystemLesion', 'renalReplacementTherapy', 'hematologicalDisease',
        'rareMetabolicDisease', 'piJudgment'
    ],
    
    INPUT_FIELDS: [
        'enrollDate', 'subjectCode', 'birthDate', 'age', 
        'measureDate', 'height', 'weight', 'bmi', 'biochemDate', 
        'scr', 'egfr', 'ph', 'sg', 'rbc', 
        'urineDate', 'urinalysisDate', 'imgDate'
    ],
    
    // 條件欄位
    INCLUSION_CRITERIA: [
        'age18', 'hasGender', 'hasAge', 'hasBMI', 'hasDMHistory', 'hasGoutHistory',
        'hasEGFR', 'hasUrinePH', 'hasUrineSG', 'hasUrineRBC', 'hasBacteriuria',
        'labTimeWithin7', 'hasImagingData', 'imgLabWithin7'
    ],
    
    EXCLUSION_FIELDS: [
        'pregnantFemale', 'kidneyTransplant', 'urinaryForeignBody', 
        'urinarySystemLesion', 'renalReplacementTherapy',
        'hematologicalDisease', 'rareMetabolicDisease', 'piJudgment'
    ],
    
    // 系統自動判斷欄位（永遠不可編輯）
    SYSTEM_AUTO_FIELDS: [
        // 基本資料自動計算欄位
        'age', 'bmi',
        // 納入條件自動判斷欄位
        'age18', 'hasGender', 'hasAge', 'hasBMI', 'hasDMHistory', 'hasGoutHistory',
        'hasEGFR', 'hasUrinePH', 'hasUrineSG', 'hasUrineRBC', 'hasBacteriuria', 'labTimeWithin7',
        'hasImagingData', 'imgLabWithin7',
        // 排除條件自動判斷欄位
        'pregnantFemale', 'missingData'
    ],
    
    // 組合欄位（自動生成）
    get FIELDS_TO_MONITOR() {
        return [...this.RADIO_FIELDS, ...this.INPUT_FIELDS];
    },
    
    get ALL_FIELDS() {
        return [...this.INPUT_FIELDS, ...this.RADIO_FIELDS];
    },
    
    get REQUIRED_FIELDS() {
        return ['enrollDate', 'subjectCode', 'birthDate', 'height', 'weight', 'biochemDate', 'egfr'];
    },
    
    // 欄位名稱對應
    FIELD_NAMES: {
        'enrollDate': '個案納入日期',
        'subjectCode': '受試者代碼',
        'birthDate': '出生日期',
        'gender': '性別',
        'height': '身高',
        'weight': '體重',
        'biochemDate': '生化檢驗採檢日期',
        'egfr': 'eGFR',
        'age18': '年齡18歲以上',
        'hasGender': '性別',
        'hasAge': '年齡',
        'hasBMI': 'BMI',
        'hasDMHistory': '糖尿病病史',
        'hasGoutHistory': '痛風病史',
        'hasEGFR': 'eGFR檢驗資料',
        'hasUrinePH': '尿液pH',
        'hasUrineSG': '尿液比重',
        'hasUrineRBC': '尿液紅血球',
        'hasBacteriuria': '菌尿症',
        'labTimeWithin7': '檢驗時間間隔',
        'hasImagingData': '影像資料',
        'imgLabWithin7': '影像檢驗時間間隔'
    },
    
    // 系統自動判斷欄位相關工具函數
    /**
     * 檢查欄位是否為系統自動判斷欄位
     * @param {HTMLElement} input - 輸入元素
     * @returns {boolean} 是否為系統自動判斷欄位
     */
    isSystemAutoField(input) {
        return this.SYSTEM_AUTO_FIELDS.includes(input.id) || 
               this.SYSTEM_AUTO_FIELDS.includes(input.name) ||
               input.placeholder?.includes('受試者編號') || 
               input.previousElementSibling?.textContent?.includes('受試者編號') ||
               input.placeholder?.includes('年齡') || 
               input.placeholder?.includes('BMI') ||
               input.previousElementSibling?.textContent?.includes('年齡') ||
               input.previousElementSibling?.textContent?.includes('BMI');
    },

    /**
     * 將欄位設為系統自動判斷樣式（灰色且不可編輯）
     * @param {HTMLElement} input - 輸入元素
     */
    setSystemAutoFieldStyle(input) {
        input.readOnly = true;
        input.disabled = true;
        input.style.backgroundColor = '#f8f9fa';
        input.style.borderColor = '#dee2e6';
        input.style.opacity = '0.6';
        input.style.cursor = 'not-allowed';
    }
};

// Cookie 管理
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

function setCookie(name, value, days = 7) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

function deleteCookie(name) {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
}

// 日期時間格式化
function formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('zh-TW');
}

function formatDateTime(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleString('zh-TW');
}

function getDaysDifference(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2 - d1);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function isFutureDate(date) {
    return new Date(date) > new Date();
}

// 通用工具函數
function generateUniqueId() {
    return crypto.randomUUID().slice(0, 8);
}

function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => deepClone(item));
    if (typeof obj === 'object') {
        const cloned = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                cloned[key] = deepClone(obj[key]);
            }
        }
        return cloned;
    }
}

// 防抖和節流
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// 驗證函數
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidTaiwanPhone(phone) {
    return /^09\d{8}$/.test(phone);
}

function formatNumber(num, decimals = 2) {
    if (isNaN(num)) return '';
    return parseFloat(num).toFixed(decimals);
}

// 訊息顯示
function showSuccessMessage(message) {
    showMessage(message, 'success');
}

function showErrorMessage(message) {
    showMessage(message, 'error');
}

function showWarningMessage(message) {
    showMessage(message, 'warning');
}

function showMessage(message, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show`;
    messageDiv.innerHTML = `
        <span class="message-text">${message}</span>
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // 使用 flex 布局避免重疊
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        max-width: 400px;
        min-width: 300px;
        font-size: 16px;
        padding: 12px 18px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        animation: slideInRight 0.3s ease-out;
        display: flex !important;              /* 使用 flex 布局 */
        justify-content: space-between !important;  /* 左右間距拉開 */
        align-items: center !important;       /* 上下置中 */
        width: auto !important;               /* 讓寬度自適應內容 */
        white-space: nowrap;                  /* 防止文字換行 */
    `;
    
    // 調整文字部分
    const messageText = messageDiv.querySelector('.message-text');
    if (messageText) {
        messageText.style.cssText = `
            flex: 1;                          /* 佔用剩餘空間 */
            margin-right: 12px;               /* 與按鈕保持間距 */
            white-space: normal;              /* 允許文字正常換行 */
        `;
    }
    
    // 調小關閉按鈕
    const btnClose = messageDiv.querySelector('.btn-close');
    if (btnClose) {
        btnClose.style.cssText = `
            width: 0.75rem !important;
            height: 0.75rem !important;
            font-size: 0.6rem !important;
            opacity: 0.7 !important;
            flex-shrink: 0;                   /* 按鈕不縮小 */
            margin: 0 !important;             /* 清除預設 margin */
        `;
    }
    
    // 其他代碼保持不變...
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.remove();
                }
            }, 300);
        }
    }, 3000);
    
    const slideOutStyle = document.createElement('style');
    slideOutStyle.textContent = `
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(slideOutStyle);
}


// 確認對話框
function confirmDialog(message, callback) {
    if (confirm(message)) {
        callback();
    }
}

// 載入管理
class LoadingManager {
    static show(message = '載入中...') {
        let loadingDiv = document.getElementById('loading-overlay');
        if (!loadingDiv) {
            loadingDiv = document.createElement('div');
            loadingDiv.id = 'loading-overlay';
            loadingDiv.innerHTML = `
                <div class="loading-content">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">載入中...</span>
                    </div>
                    <div class="loading-message mt-2">${message}</div>
                </div>
            `;
            loadingDiv.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 9999;
            `;
            document.body.appendChild(loadingDiv);
        } else {
            loadingDiv.style.display = 'flex';
            const messageDiv = loadingDiv.querySelector('.loading-message');
            if (messageDiv) messageDiv.textContent = message;
        }
    }
    
    static hide() {
        const loadingDiv = document.getElementById('loading-overlay');
        if (loadingDiv) {
            loadingDiv.style.display = 'none';
        }
    }
}

// 用戶資訊管理
function loadUserInfo() {
    const userName = getCookie('user_id') || '未知用戶';
    const uniqueId = getCookie('unique_id') || '未知ID';
    
    const userNameElement = document.getElementById('userName');
    const userIdElement = document.getElementById('userId');
    
    if (userNameElement) userNameElement.textContent = decodeURIComponent(userName);
    if (userIdElement) userIdElement.textContent = uniqueId;
}

function updateLoginTime() {
    const now = new Date();
    const loginTimeElement = document.getElementById('loginTime');
    if (loginTimeElement) {
        loginTimeElement.textContent = now.toLocaleString('zh-TW');
    }
}

function loadUserPermissions() {
    fetch('/permission/get_user_permissions')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                userPermissions = data.permissions || [];
                determineUserRole(data.roles || []);
                setupQuickActions();
            } else {
                console.error('載入權限失敗:', data.message);
                showDefaultRole();
            }
        })
        .catch(error => {
            console.error('載入權限時出錯:', error);
            showDefaultRole();
        });
}

function determineUserRole(roles) {
    if (roles && roles.length > 0) {
        const primaryRole = roles[0];
        const roleName = primaryRole.name;
        
        const roleMapping = {
            'system_admin': 'system_admin',
            'sponsor': 'sponsor', 
            'researcher': 'researcher',
            'investigator': 'investigator',
            'monitor': 'monitor'
        };
        
        userRole = roleMapping[roleName] || 'sponsor';
        console.log(`使用後端角色資訊: ${roleName} -> ${userRole}`);
    } else {
        if (userPermissions.includes('edc.system.admin')) {
            userRole = 'system_admin';
        } else if (userPermissions.includes('edc.crf.sign') && !userPermissions.includes('edc.data.freeze')) {
            userRole = 'investigator';
        } else if (userPermissions.includes('edc.data.create') && !userPermissions.includes('edc.data.freeze')) {
            userRole = 'researcher';
        } else if (userPermissions.includes('edc.data.freeze')) {
            userRole = 'monitor';
        } else {
            userRole = 'sponsor';
        }
        console.log(`使用權限判斷: ${userRole}`);
    }
    
    const userRoleElement = document.getElementById('userRole');
    if (userRoleElement) {
        userRoleElement.textContent = ROLE_CONFIG[userRole]?.name || '未知角色';
    }
    
    console.log(`最終判斷角色: ${userRole} (${ROLE_CONFIG[userRole]?.name})`);
}

function showDefaultRole() {
    userRole = 'sponsor';
    const userRoleElement = document.getElementById('userRole');
    if (userRoleElement) {
        userRoleElement.textContent = ROLE_CONFIG[userRole].name;
    }
}

// 快速操作設置
function setupQuickActions() {
    const quickActions = document.getElementById('quickActions');
    if (!quickActions) return;
    
    let html = '';
    
    Object.entries(QUICK_ACTIONS_CONFIG).forEach(([permission, config]) => {
        if (userPermissions.includes(permission)) {
            html += `
                <button class="btn ${config.color} quick-action-btn" onclick="${config.action}()">
                    <i class="${config.icon}"></i> ${config.title}
                </button>
            `;
        }
    });
    
    quickActions.innerHTML = html || '<p class="text-muted">無快速操作</p>';
}

// 頁面刷新相關函數
async function reloadPageData() {
    try {
        const subjectCode = getCurrentSubjectCode();
        if (!subjectCode) {
            console.warn('無法獲取受試者編號，無法刷新資料');
            return;
        }

        console.log('正在刷新頁面資料...', subjectCode);
        
        // 保存當前分頁狀態
        const currentPagination = typeof DataBrowserManager !== 'undefined' ? 
            DataBrowserManager.pagination : null;
        
        // 顯示載入狀態（如果 LoadingManager 可用）
        if (typeof LoadingManager !== 'undefined') {
            LoadingManager.show('正在更新資料...');
        }

        // 重新獲取最新的受試者資料
        const response = await fetch(`/edc/subject-detail-code/${subjectCode}`);
        const result = await response.json();

        if (result.success) {
            // 重新生成並更新頁面內容
            await refreshPageContent(result.data);
            
            console.log('頁面資料刷新完成');
            if (typeof LoadingManager !== 'undefined') {
                LoadingManager.hide();
            }
        } else {
            console.error('獲取最新資料失敗:', result.message);
            if (typeof LoadingManager !== 'undefined') {
                LoadingManager.hide();
            }
            if (typeof showErrorMessage === 'function') {
                showErrorMessage('刷新資料失敗: ' + result.message);
            }
        }
    } catch (error) {
        console.error('刷新頁面資料失敗:', error);
        if (typeof LoadingManager !== 'undefined') {
            LoadingManager.hide();
        }
        if (typeof showErrorMessage === 'function') {
            showErrorMessage('刷新資料失敗，請檢查網路連線');
        }
    }
}

// 刷新頁面內容函數
async function refreshPageContent(data) {
    try {
        // 檢查是否有 DataBrowserGenerator 可用
        if (typeof DataBrowserGenerator !== 'undefined') {
            const generator = new DataBrowserGenerator();
            const newPageContent = await generator.generateSubjectDetailPage(data);
            
            // 更新主要內容區域
            const mainContent = document.getElementById('mainContent');
            if (mainContent) {
                mainContent.innerHTML = newPageContent;
                
                // 重新初始化事件監聽器
                setupPageEvents();
                
                console.log('使用 DataBrowserGenerator 刷新頁面內容');
            }
        } else {
            // 備用方案：手動更新關鍵資訊
            updateKeyElements(data);
            console.log('使用備用方案刷新頁面內容');
        }
    } catch (error) {
        console.error('刷新頁面內容失敗:', error);
        // 如果生成器失敗，使用備用方案
        updateKeyElements(data);
    }
}

// 更新關鍵頁面元素函數
function updateKeyElements(data) {
    try {
        // 更新受試者編號
        const subjectCodeElements = document.querySelectorAll('[data-field="subject_code"]');
        subjectCodeElements.forEach(el => {
            if (el) el.textContent = data.subject_code || '';
        });

        // 更新狀態
        const statusElements = document.querySelectorAll('[data-field="status"]');
        statusElements.forEach(el => {
            if (el) el.textContent = data.status || '';
        });

        // 更新簽署資訊
        const signedByElements = document.querySelectorAll('[data-field="signed_by"]');
        signedByElements.forEach(el => {
            if (el) el.textContent = data.signed_by || '';
        });

        const signedAtElements = document.querySelectorAll('[data-field="signed_at"]');
        signedAtElements.forEach(el => {
            if (el) el.textContent = data.signed_at || '';
        });

        // 更新按鈕狀態
        updateButtonStates(data);
        
        console.log('關鍵元素更新完成');
    } catch (error) {
        console.error('更新關鍵元素失敗:', error);
    }
}

// 更新按鈕狀態函數
function updateButtonStates(data) {
    const status = data.status;
    const isSigned = status === 'signed';
    
    // 更新提交審核按鈕
    const submitBtn = document.getElementById('submitAndSignBtn');
    if (submitBtn) {
        if (isSigned) {
            submitBtn.style.display = 'none';
        } else {
            submitBtn.style.display = 'inline-block';
        }
    }
    
    // 更新簽署按鈕
    const signBtn = document.getElementById('signBtn');
    if (signBtn) {
        if (isSigned) {
            signBtn.style.display = 'none';
        } else {
            signBtn.style.display = 'inline-block';
        }
    }
}

// 設置頁面事件函數
function setupPageEvents() {
    // 如果 DataEditorManager 存在，重新初始化它的事件
    if (typeof DataEditorManager !== 'undefined' && 
        typeof DataEditorManager.setupPageEvents === 'function') {
        DataEditorManager.setupPageEvents();
    }
}

// 獲取當前受試者編號函數
function getCurrentSubjectCode() {
    // 嘗試多種方式獲取受試者編號
    
    // 方法1: 從 URL 參數
    const urlParams = new URLSearchParams(window.location.search);
    let subjectCode = urlParams.get('subjectCode') || urlParams.get('subject_code');
    if (subjectCode) {
        console.log('從 URL 參數獲取 subjectCode:', subjectCode);
        return subjectCode;
    }
    
    // 方法2: 從表單中的受試者編號欄位（多種選擇器）
    const subjectCodeSelectors = [
        '#subjectCode',
        'input[name="subjectCode"]',
        'input[name="subject_code"]',
        '[data-field="subjectCode"]',
        '[data-field="subject_code"]'
    ];
    
    for (const selector of subjectCodeSelectors) {
        const element = document.querySelector(selector);
        if (element) {
            subjectCode = element.value || element.textContent || element.getAttribute('value');
            if (subjectCode && subjectCode.trim()) {
                console.log(`從選擇器 ${selector} 獲取 subjectCode:`, subjectCode.trim());
                return subjectCode.trim();
            }
        }
    }
    
    // 方法3: 從全域變數（如果 DataEditorManager 有設定）
    if (typeof DataEditorManager !== 'undefined' && 
        typeof DataEditorManager.getCurrentSubjectCode === 'function') {
        const managerSubjectCode = DataEditorManager.getCurrentSubjectCode();
        if (managerSubjectCode) {
            console.log('從 DataEditorManager 獲取 subjectCode:', managerSubjectCode);
            return managerSubjectCode;
        }
    }
    
    // 方法4: 從 window.currentSubjectCode
    if (window.currentSubjectCode) {
        console.log('從 window.currentSubjectCode 獲取:', window.currentSubjectCode);
        return window.currentSubjectCode;
    }
    
    // 方法5: 從頁面標題或內容中提取
    const pageTitle = document.title;
    const subjectCodeMatch = pageTitle.match(/P[A-Za-z0-9]{2}-?[A-Za-z0-9]{4}/);
    if (subjectCodeMatch) {
        console.log('從頁面標題獲取 subjectCode:', subjectCodeMatch[0]);
        return subjectCodeMatch[0];
    }
    
    // 方法6: 從頁面內容中搜尋受試者編號模式
    const pageContent = document.body.textContent || document.body.innerText;
    const contentMatch = pageContent.match(/P[A-Za-z0-9]{2}-?[A-Za-z0-9]{4}/);
    if (contentMatch) {
        console.log('從頁面內容獲取 subjectCode:', contentMatch[0]);
        return contentMatch[0];
    }
    
    // 調試信息：顯示當前頁面狀態
    console.warn('getCurrentSubjectCode 調試信息:', {
        'URL': window.location.href,
        'URL 參數': Object.fromEntries(urlParams.entries()),
        '頁面標題': pageTitle,
        'DataEditorManager': typeof DataEditorManager,
        'window.currentSubjectCode': window.currentSubjectCode,
        '找到的元素': subjectCodeSelectors.map(selector => {
            const el = document.querySelector(selector);
            return `${selector}: ${el ? (el.value || el.textContent || '存在但無值') : '不存在'}`;
        })
    });
    
    return null;
}

// 匯出模組
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getCookie,
        setCookie,
        deleteCookie,
        formatDate,
        formatDateTime,
        getDaysDifference,
        isFutureDate,
        generateUniqueId,
        deepClone,
        debounce,
        throttle,
        isValidEmail,
        isValidTaiwanPhone,
        formatNumber,
        showSuccessMessage,
        showErrorMessage,
        showWarningMessage,
        showMessage,
        confirmDialog,
        LoadingManager,
        loadUserInfo,
        updateLoginTime,
        loadUserPermissions,
        determineUserRole,
        showDefaultRole,
        setupQuickActions,
        loadDashboardStats,
        logout,
        reloadPageData,
        refreshPageContent,
        updateKeyElements,
        updateButtonStates,
        setupPageEvents,
        getCurrentSubjectCode
    };
}

// 儀表板統計資料載入
async function loadDashboardStats() {
    try {
        // 使用統一的統計 API
        const response = await fetch('/edc/get-dashboard-stats');
        const data = await response.json();
        
        if (data.success) {
            const stats = data.data;
            
            // 1. 總 CRF 數量
            const totalCRFsElement = document.getElementById('totalCRFs');
            if (totalCRFsElement) {
                totalCRFsElement.textContent = stats.total_subjects || '0';
            }

            // 2. 待處理 Query 數量
            const pendingQueriesElement = document.getElementById('pendingQueries');
            if (pendingQueriesElement) {
                pendingQueriesElement.textContent = stats.pending_queries || '0';
            }

            // 3. 已簽署 CRF 數量
            const signedCRFsElement = document.getElementById('signedCRFs');
            if (signedCRFsElement) {
                signedCRFsElement.textContent = stats.signed_crfs || '0';
            }

            // 4. 活躍使用者數量
            const activeUsersElement = document.getElementById('activeUsers');
            if (activeUsersElement) {
                activeUsersElement.textContent = stats.active_users || '0';
            }
        } else {
            console.error('載入統計資料失敗:', data.message);
            // 顯示預設值
            const elements = ['totalCRFs', 'pendingQueries', 'signedCRFs', 'activeUsers'];
            elements.forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    element.textContent = '0';
                }
            });
        }

    } catch (error) {
        console.error('載入儀表板統計資料失敗:', error);
        // 如果 API 失敗，顯示預設值
        const totalCRFsElement = document.getElementById('totalCRFs');
        const pendingQueriesElement = document.getElementById('pendingQueries');
        const signedCRFsElement = document.getElementById('signedCRFs');
        const activeUsersElement = document.getElementById('activeUsers');
        
        if (totalCRFsElement) totalCRFsElement.textContent = '0';
        if (pendingQueriesElement) pendingQueriesElement.textContent = '0';
        if (signedCRFsElement) signedCRFsElement.textContent = '0';
        if (activeUsersElement) activeUsersElement.textContent = '0';
    }
}

// 登出功能
function logout() {
    if (confirm('確定要登出嗎？')) {
        window.location.href = '/login/logout';
    }
}

// 瀏覽器環境全域匯出
if (typeof window !== 'undefined') {
    // 匯出所有工具函數到全域
    window.getCookie = getCookie;
    window.setCookie = setCookie;
    window.deleteCookie = deleteCookie;
    window.formatDate = formatDate;
    window.formatDateTime = formatDateTime;
    window.getDaysDifference = getDaysDifference;
    window.isFutureDate = isFutureDate;
    window.generateUniqueId = generateUniqueId;
    window.deepClone = deepClone;
    window.debounce = debounce;
    window.throttle = throttle;
    window.isValidEmail = isValidEmail;
    window.isValidTaiwanPhone = isValidTaiwanPhone;
    window.formatNumber = formatNumber;
    window.showSuccessMessage = showSuccessMessage;
    window.showErrorMessage = showErrorMessage;
    window.showWarningMessage = showWarningMessage;
    window.showMessage = showMessage;
    window.confirmDialog = confirmDialog;
    window.LoadingManager = LoadingManager;
    window.loadUserInfo = loadUserInfo;
    window.updateLoginTime = updateLoginTime;
    window.loadUserPermissions = loadUserPermissions;
    window.determineUserRole = determineUserRole;
    window.showDefaultRole = showDefaultRole;
    window.setupQuickActions = setupQuickActions;
    window.loadDashboardStats = loadDashboardStats;
    window.logout = logout;
    
    // 匯出頁面刷新相關函數到全域
    window.reloadPageData = reloadPageData;
    window.refreshPageContent = refreshPageContent;
    window.updateKeyElements = updateKeyElements;
    window.updateButtonStates = updateButtonStates;
    window.setupPageEvents = setupPageEvents;
    window.getCurrentSubjectCode = getCurrentSubjectCode;
    
    // 匯出 EDC 常數到全域
    window.EDCConstants = EDCConstants;
}
