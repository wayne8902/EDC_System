// EDC 系統工具函數檔案
// 包含各種通用工具函數和輔助功能

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
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    const container = document.querySelector('.container') || document.body;
    container.insertBefore(messageDiv, container.firstChild);
    
    // 自動隱藏
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 5000);
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
        setupQuickActions
    };
}
