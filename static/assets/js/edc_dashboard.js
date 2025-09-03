// 角色配置 - 集中管理所有角色的功能定義
const ROLE_CONFIG = {
    system_admin: {
        name: '系統管理員',
        color: '#dc3545',
        icon: 'fas fa-cogs',
        features: [
            {
                id: 'user_management',
                title: '用戶管理',
                description: '管理系統用戶帳號、權限和角色分配',
                icon: 'fas fa-users-cog',
                action: 'openUserManagement'
            },
            {
                id: 'permission_management',
                title: '權限管理',
                description: '配置系統權限、角色和存取控制',
                icon: 'fas fa-shield-alt',
                action: 'openPermissionManagement'
            },
            {
                id: 'system_monitoring',
                title: '系統監控',
                description: '監控系統效能、日誌和審計記錄',
                icon: 'fas fa-chart-line',
                action: 'openSystemMonitoring'
            },
            {
                id: 'audit_logs',
                title: '審計日誌',
                description: '查看系統操作記錄和安全審計',
                icon: 'fas fa-history',
                action: 'openAuditLogs'
            },
            {
                id: 'backup_restore',
                title: '備份還原',
                description: '系統資料備份和災難復原管理',
                icon: 'fas fa-database',
                action: 'openBackupRestore'
            },
            {
                id: 'system_config',
                title: '系統配置',
                description: '配置系統參數和環境設定',
                icon: 'fas fa-cog',
                action: 'openSystemConfig'
            }
        ]
    },
    sponsor: {
        name: '試驗委託者',
        color: '#28a745',
        icon: 'fas fa-eye',
        features: [
            {
                id: 'data_browser',
                title: '資料瀏覽',
                description: '瀏覽和審查試驗資料（唯讀模式）',
                icon: 'fas fa-search',
                action: 'openDataBrowser'
            },
            {
                id: 'reports_view',
                title: '報告查看',
                description: '查看試驗進度和統計報告',
                icon: 'fas fa-chart-bar',
                action: 'openReports'
            },
            {
                id: 'audit_logs',
                title: '審計記錄',
                description: '查看資料變更和操作歷史',
                icon: 'fas fa-history',
                action: 'openAuditLogs'
            },
            {
                id: 'data_export',
                title: '資料匯出',
                description: '匯出試驗資料用於分析',
                icon: 'fas fa-download',
                action: 'openDataExport'
            }
        ]
    },
    researcher: {
        name: '研究人員',
        color: '#17a2b8',
        icon: 'fas fa-edit',
        features: [
            {
                id: 'data_entry',
                title: '新增資料',
                description: '新增試驗資料和病例記錄',
                icon: 'fas fa-plus-circle',
                action: 'openDataEntry'
            },
            {
                id: 'data_editor',
                title: '編輯資料',
                description: '修改和更新現有試驗資料',
                icon: 'fas fa-edit',
                action: 'openDataEditor'
            },
            {
                id: 'query_response',
                title: 'Query 回應',
                description: '回應試驗監測者提出的 Query 查詢',
                icon: 'fas fa-reply',
                action: 'openQueryResponse'
            },
            {
                id: 'data_validation',
                title: '資料驗證',
                description: '驗證資料的完整性和準確性',
                icon: 'fas fa-check-double',
                action: 'openDataValidation'
            }
        ]
    },
    investigator: {
        name: '試驗主持人',
        color: '#ffc107',
        icon: 'fas fa-signature',
        features: [
            {
                id: 'data_entry',
                title: '新增資料',
                description: '新增試驗資料和病例記錄',
                icon: 'fas fa-plus-circle',
                action: 'openDataEntry'
            },
            {
                id: 'data_editor',
                title: '編輯資料',
                description: '修改和更新現有試驗資料',
                icon: 'fas fa-edit',
                action: 'openDataEditor'
            },
            {
                id: 'crf_review',
                title: '審查CRF',
                description: '審查病例報告表內容',
                icon: 'fas fa-check-circle',
                action: 'openCRFReview'
            },
            {
                id: 'digital_signature',
                title: '電子簽署',
                description: '簽署已審查的eCRF',
                icon: 'fas fa-signature',
                action: 'openDigitalSignature'
            },
            {
                id: 'patient_consent',
                title: '受試者同意',
                description: '管理受試者同意書和授權',
                icon: 'fas fa-user-check',
                action: 'openPatientConsent'
            },
            {
                id: 'adverse_events',
                title: '不良事件',
                description: '記錄和追蹤不良事件',
                icon: 'fas fa-exclamation-triangle',
                action: 'openAdverseEvents'
            }
        ]
    },
    monitor: {
        name: '試驗監測者',
        color: '#6f42c1',
        icon: 'fas fa-search-plus',
        features: [
            {
                id: 'data_audit',
                title: '資料審查',
                description: '審查試驗資料的完整性和準確性',
                icon: 'fas fa-search',
                action: 'openDataAudit'
            },
            {
                id: 'data_freeze',
                title: '資料凍結',
                description: '凍結已審查的試驗資料',
                icon: 'fas fa-snowflake',
                action: 'openDataFreeze'
            },
            {
                id: 'query_creation',
                title: 'Query 發起',
                description: '向研究人員發起 Query 資料查詢',
                icon: 'fas fa-question-circle',
                action: 'openQueryCreation'
            },
            {
                id: 'query_management',
                title: 'Query 管理',
                description: '管理所有 Query 的狀態和回應',
                icon: 'fas fa-tasks',
                action: 'openQueryManagement'
            },
            {
                id: 'site_visits',
                title: '現場訪視',
                description: '安排和管理試驗現場訪視',
                icon: 'fas fa-map-marker-alt',
                action: 'openSiteVisits'
            },
            {
                id: 'compliance_check',
                title: '合規檢查',
                description: '檢查試驗合規性和法規要求',
                icon: 'fas fa-clipboard-check',
                action: 'openComplianceCheck'
            }
        ]
    }
};

// 快速操作配置
const QUICK_ACTIONS_CONFIG = {
    'edc.data.view': {
        title: '資料瀏覽',
        icon: 'fas fa-eye',
        color: 'btn-info',
        action: 'openDataView'
    },
    'edc.data.edit': {
        title: '編輯資料',
        icon: 'fas fa-edit',
        color: 'btn-warning',
        action: 'openDataEdit'
    },
    'edc.data.create': {
        title: '新增資料',
        icon: 'fas fa-plus',
        color: 'btn-primary',
        action: 'openDataEntry'
    },
    'edc.query.create': {
        title: 'Query 發起',
        icon: 'fas fa-question-circle',
        color: 'btn-warning',
        action: 'openQueryCreation'
    },
    'edc.crf.sign': {
        title: '電子簽署',
        icon: 'fas fa-signature',
        color: 'btn-success',
        action: 'openDigitalSignature'
    },
    'edc.reports.view': {
        title: '查看報告',
        icon: 'fas fa-chart-bar',
        color: 'btn-info',
        action: 'openReports'
    },
    'edc.data.freeze': {
        title: '資料凍結',
        icon: 'fas fa-snowflake',
        color: 'btn-secondary',
        action: 'openDataFreeze'
    },
    'edc.system.admin': {
        title: '系統管理',
        icon: 'fas fa-cogs',
        color: 'btn-danger',
        action: 'openSystemManagement'
    }
};

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

// 更新登入時間
function updateLoginTime() {
    const now = new Date();
    document.getElementById('loginTime').textContent = now.toLocaleString('zh-TW');
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
                // generateRoleDashboard();
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
                    userRole = 'system_admin';
                } else if (userPermissions.includes('edc.crf.sign') && !userPermissions.includes('edc.data.freeze')) {
                    userRole = 'investigator';  // 試驗主持人
                } else if (userPermissions.includes('edc.data.create') && !userPermissions.includes('edc.data.freeze')) {
                    userRole = 'researcher';    // 研究人員
                } else if (userPermissions.includes('edc.data.freeze')) {
                    userRole = 'monitor';       // 試驗監測者
                } else {
                    userRole = 'sponsor';       // 試驗委託者（預設）
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
        if (userRole === 'researcher') {
            // 研究人員表單現在由 edc_data_entry.js 處理
            console.log('研究人員表單由 edc_data_entry.js 處理');
        }
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

// 生成角色專屬儀表板
function generateRoleDashboard() {
    const roleContent = document.getElementById('roleBasedContent');
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
                            <td>負責資料審查、Query 管理、現場訪視和合規檢查</td>
                            <td>
                                <ul class="list-unstyled mb-0">
                                    <li><i class="fas fa-search text-primary"></i> 資料審查</li>
                                    <li><i class="fas fa-snowflake text-success"></i> 資料凍結</li>
                                    <li><i class="fas fa-question-circle text-info"></i> Query 管理</li>
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

// 顯示預設角色（當權限載入失敗時）
function showDefaultRole() {
    userRole = 'sponsor';
    document.getElementById('userRole').textContent = ROLE_CONFIG[userRole].name;
    // generateRoleDashboard();
}

// 載入儀表板統計
function loadDashboardStats() {
    // 這裡可以從後端 API 獲取實際統計資料
    document.getElementById('totalCRFs').textContent = '156';
    document.getElementById('pendingQueries').textContent = '23';
    document.getElementById('signedCRFs').textContent = '89';
    document.getElementById('activeUsers').textContent = '12';
}

// 功能按鈕點擊處理 - 系統管理員
function openUserManagement() { alert('進入用戶管理功能'); }
function openPermissionManagement() { alert('進入權限管理功能'); }
function openSystemMonitoring() { alert('進入系統監控功能'); }
function openAuditLogs() { alert('進入審計記錄功能'); }
function openBackupRestore() { alert('進入備份還原功能'); }
function openSystemConfig() { alert('進入系統配置功能'); }

// 功能按鈕點擊處理 - 試驗委託者
function openDataBrowser() { alert('進入資料瀏覽功能'); }
function openReports() { alert('進入報告查看功能'); }
function openDataExport() { alert('進入資料匯出功能'); }

// 功能按鈕點擊處理 - 研究人員
function openDataEntry() { 
    // 研究人員資料輸入表單現在由 edc_data_entry.js 處理
    console.log('研究人員資料輸入表單由 edc_data_entry.js 處理');
}
function openDataEditor() { alert('進入資料編輯功能'); }
function openQueryResponse() { alert('進入 Query 回應功能'); }
function openDataValidation() { alert('進入資料驗證功能'); }

// 功能按鈕點擊處理 - 試驗主持人
function openCRFReview() { alert('進入CRF審查功能'); }
function openDigitalSignature() { alert('進入電子簽署功能'); }
function openPatientConsent() { alert('進入受試者同意功能'); }
function openAdverseEvents() { alert('進入不良事件功能'); }

// 功能按鈕點擊處理 - 試驗監測者
function openDataAudit() { alert('進入資料審查功能'); }
function openDataFreeze() { alert('進入資料凍結功能'); }
function openQueryCreation() { alert('進入 Query 發起功能'); }
function openQueryManagement() { alert('進入 Query 管理功能'); }
function openSiteVisits() { alert('進入現場訪視功能'); }
function openComplianceCheck() { alert('進入合規檢查功能'); }

// 通用功能
function openSystemManagement() { alert('進入系統管理功能'); }

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