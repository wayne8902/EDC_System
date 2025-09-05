let userRole = '';
let userPermissions = [];

// 頁面載入時執行
document.addEventListener('DOMContentLoaded', function() {
    loadUserInfo();
    loadUserPermissions();
    updateLoginTime();
    loadDashboardStats();
});

// 載入用戶資訊
function loadUserInfo() {
    const userName = getCookie('user_id') || '未知用戶';
    const uniqueId = getCookie('unique_id') || '未知ID';
    
    document.getElementById('userName').textContent = decodeURIComponent(userName);
    document.getElementById('userId').textContent = uniqueId;
}

// 載入用戶權限
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
            }
        })
        .catch(error => {
            console.error('載入權限時出錯:', error);
        });
}

// 更新登入時間
function updateLoginTime() {
    const now = new Date();
    document.getElementById('loginTime').textContent = now.toLocaleString('zh-TW');
}

// 判斷用戶角色 - 優先使用後端回傳的角色資訊
function determineUserRole(roles) {
    // 優先使用後端回傳的角色資訊
    if (roles && roles.length > 0) {
        // 取第一個角色作為主要角色
        const primaryRole = roles[0];
        const roleName = primaryRole.name;
        
        // 角色名稱映射
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
        // 備用方案：基於權限判斷（調整優先順序）
        if (userPermissions.includes('edc.system.admin')) {
            userRole = 'system_admin';  // 系統管理者
        } else if (userPermissions.includes('edc.crf.sign') && !userPermissions.includes('edc.data.freeze')) {
            userRole = 'investigator';  // 試驗主持人
        } else if (userPermissions.includes('edc.data.create') && !userPermissions.includes('edc.data.freeze')) {
            userRole = 'researcher';    // 研究人員
        } else if (userPermissions.includes('edc.data.freeze')) {
            userRole = 'monitor';       // 試驗監測者
        } else {
            userRole = 'sponsor';       // 試驗委託者
        }
        console.log(`使用權限判斷: ${userRole}`);
    }
    
    document.getElementById('userRole').textContent = ROLE_CONFIG[userRole]?.name || '未知角色';
    console.log(`最終判斷角色: ${userRole} (${ROLE_CONFIG[userRole]?.name})`);
    
    // 根據角色顯示/隱藏對應的表單
    manageRoleForms();
}

// 管理角色表單的顯示/隱藏
function manageRoleForms() {
    // 隱藏所有角色表單
    if (typeof hideResearcherForm === 'function') {
        hideResearcherForm();
    }
    // 根據角色顯示對應表單
    // 未來可以添加其他角色的表單控制
}

// 設置快速操作
function setupQuickActions() {
    const quickActions = document.getElementById('quickActions');
    let html = '';
    
    // 根據權限動態生成快速操作按鈕
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

// 載入儀表板統計
function loadDashboardStats() {
    // 這裡可以從後端 API 獲取實際統計資料
    document.getElementById('totalCRFs').textContent = '156';
    document.getElementById('pendingQueries').textContent = '23';
    document.getElementById('signedCRFs').textContent = '89';
    document.getElementById('activeUsers').textContent = '12';
}

// 登出
function logout() {
    if (confirm('確定要登出嗎？')) {
        window.location.href = '/login/logout';
    }
}

// 獲取 cookie 值
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}