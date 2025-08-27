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
                title: '回應查詢',
                description: '回應試驗監測者提出的查詢',
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
                title: '發起查詢',
                description: '向研究人員發起資料查詢',
                icon: 'fas fa-question-circle',
                action: 'openQueryCreation'
            },
            {
                id: 'query_management',
                title: '查詢管理',
                description: '管理所有查詢的狀態和回應',
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
        title: '發起查詢',
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
                if (typeof showResearcherForm === 'function') {
                    showResearcherForm();
                }
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
            // 顯示研究人員資料輸入表單
            if (typeof showResearcherForm === 'function') {
                showResearcherForm();
            } else {
                alert('進入資料新增功能');
            }
        }
        function openDataEditor() { alert('進入資料編輯功能'); }
        function openQueryResponse() { alert('進入查詢回應功能'); }
        function openDataValidation() { alert('進入資料驗證功能'); }

// 功能按鈕點擊處理 - 試驗主持人
function openCRFReview() { alert('進入CRF審查功能'); }
function openDigitalSignature() { alert('進入電子簽署功能'); }
function openPatientConsent() { alert('進入受試者同意功能'); }
function openAdverseEvents() { alert('進入不良事件功能'); }

// 功能按鈕點擊處理 - 試驗監測者
function openDataAudit() { alert('進入資料審查功能'); }
function openDataFreeze() { alert('進入資料凍結功能'); }
function openQueryCreation() { alert('進入查詢發起功能'); }
function openQueryManagement() { alert('進入查詢管理功能'); }
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

// 研究人員表單專用 JavaScript 功能 - 與 index.html 完全一致

// 初始化研究人員表單
function initializeResearcherForm() {
    // 設置表單驗證事件
    setupFormValidation();
    
    // 設置動態新增功能
    setupDynamicAdditions();
}

// 設置表單驗證
function setupFormValidation() {
    // 受試者代碼格式驗證
    const subjectCodeInput = document.getElementById('subjectCode');
    if (subjectCodeInput) {
        subjectCodeInput.addEventListener('input', validateSubjectCode);
    }
    
    // 出生日期變化時自動計算年齡
    const birthDateInput = document.getElementById('birthDate');
    if (birthDateInput) {
        birthDateInput.addEventListener('change', calculateAge);
    }
    
    // 身高體重輸入時自動計算BMI
    const heightInput = document.getElementById('height');
    const weightInput = document.getElementById('weight');
    if (heightInput && weightInput) {
        heightInput.addEventListener('input', calculateBMI);
        weightInput.addEventListener('input', calculateBMI);
    }
    
    // 肌酸酐輸入時自動計算eGFR
    const creatinineInput = document.getElementById('creatinine');
    if (creatinineInput) {
        creatinineInput.addEventListener('input', calculateEGFR);
    }
    
    // 病史選擇事件監聽器
    setupHistoryValidation();
    
    // 影像檢查類型驗證
    const imgTypeRadios = document.querySelectorAll('input[name="imgType"]');
    imgTypeRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            validateImageType();
            updateInclusionCriteria();
        });
    });
    
    // 影像日期驗證
    const imgDateInput = document.getElementById('imgDate');
    if (imgDateInput) {
        imgDateInput.addEventListener('change', validateImageDate);
    }
    
    // 設置納入條件自動判讀
    setupInclusionCriteriaMonitoring();
    
    // 設置索引頁切換功能
    setupTabNavigation();
}

// 設置納入條件自動判讀監控
function setupInclusionCriteriaMonitoring() {
    // 監控出生日期變化（影響年齡計算）
    const birthDateInput = document.getElementById('birthDate');
    if (birthDateInput) {
        birthDateInput.addEventListener('change', () => {
            updateInclusionCriteria();
            updateExclusionCriteria(); // 當出生日期改變時，更新排除條件
        });
    }
    
    // 監控性別選擇
    const genderRadios = document.querySelectorAll('input[name="gender"]');
    genderRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            updateInclusionCriteria();
            updateExclusionCriteria(); // 當性別改變時，更新排除條件
        });
    });
    
    // 監控身高體重變化（影響BMI）
    const heightInput = document.getElementById('height');
    const weightInput = document.getElementById('weight');
    if (heightInput) {
        heightInput.addEventListener('input', updateInclusionCriteria);
    }
    if (weightInput) {
        weightInput.addEventListener('input', updateInclusionCriteria);
    }
    
    // 監控病史選擇
    const dmRadios = document.querySelectorAll('input[name="dm"]');
    const goutRadios = document.querySelectorAll('input[name="gout"]');
    dmRadios.forEach(radio => {
        radio.addEventListener('change', updateInclusionCriteria);
    });
    goutRadios.forEach(radio => {
        radio.addEventListener('change', updateInclusionCriteria);
    });
    
    // 監控檢驗資料變化
    const egfrInput = document.getElementById('egfr');
    const phInput = document.getElementById('ph');
    const sgInput = document.getElementById('sg');
    const rbcInput = document.getElementById('rbc');
    const bacteriuriaRadios = document.querySelectorAll('input[name="bacteriuria"]');
    
    if (egfrInput) {
        egfrInput.addEventListener('input', updateInclusionCriteria);
    }
    if (phInput) {
        phInput.addEventListener('input', updateInclusionCriteria);
    }
    if (sgInput) {
        sgInput.addEventListener('input', updateInclusionCriteria);
    }
    if (rbcInput) {
        rbcInput.addEventListener('input', updateInclusionCriteria);
    }
    bacteriuriaRadios.forEach(radio => {
        radio.addEventListener('change', updateInclusionCriteria);
    });
    
    // 監控檢驗日期變化（影響時間間隔檢查）
    const biochemDateInput = document.getElementById('biochemDate');
    const urineDateInput = document.getElementById('urineDate');
    const urinalysisDateInput = document.getElementById('urinalysisDate');
    if (biochemDateInput) {
        biochemDateInput.addEventListener('change', updateInclusionCriteria);
    }
    if (urineDateInput) {
        urineDateInput.addEventListener('change', updateInclusionCriteria);
    }
    if (urinalysisDateInput) {
        urinalysisDateInput.addEventListener('change', updateInclusionCriteria);
    }
    
    // 監控影像資料變化
    const imgDateInput = document.getElementById('imgDate');
    if (imgDateInput) {
        imgDateInput.addEventListener('change', updateInclusionCriteria);
    }
    
    // 監控影像可視性檢核變化
    const visKidneyInputs = document.querySelectorAll('input[name="visKidney"]');
    const visMidUreterInputs = document.querySelectorAll('input[name="visMidUreter"]');
    const visLowerUreterInputs = document.querySelectorAll('input[name="visLowerUreter"]');
    const noTxInputs = document.querySelectorAll('input[name="noTx"]');
    
    visKidneyInputs.forEach(input => {
        input.addEventListener('change', updateInclusionCriteria);
    });
    visMidUreterInputs.forEach(input => {
        input.addEventListener('change', updateInclusionCriteria);
    });
    visLowerUreterInputs.forEach(input => {
        input.addEventListener('change', updateInclusionCriteria);
    });
    noTxInputs.forEach(input => {
        input.addEventListener('change', () => {
            updateInclusionCriteria();
            toggleTreatmentSection();
        });
    });
    
    // 監控排除條件選擇變化
    const exclusionRadios = document.querySelectorAll('input[name="pregnantFemale"], input[name="kidneyTransplant"], input[name="urinaryForeignBody"], input[name="urinarySystemLesion"], input[name="renalReplacementTherapy"], input[name="missingData"], input[name="hematologicalDisease"], input[name="rareMetabolicDisease"], input[name="piJudgment"]');
    
    exclusionRadios.forEach(input => {
        input.addEventListener('change', () => {
            toggleExclusionDetails();
        });
    });
    
    // 只為病歷資料缺失檢查相關的欄位添加事件監聽器
    const missingDataRelatedFields = [
        'enrollDate', 'subjectCode', 'gender', 'birthDate', 'age', 
        'measureDate', 'height', 'weight', 'bmi', 'biochemDate', 
        'creatinine', 'egfr', 'ph', 'sg', 'rbc', 'bacteriuria', 
        'urineDate', 'urinalysisDate', 'dm', 'gout', 'dmDate', 'goutDate', 'imgType', 
        'imgDate', 'stone'
    ];
    
    missingDataRelatedFields.forEach(fieldId => {
        if (['gender', 'bacteriuria', 'dm', 'gout', 'imgType', 'stone'].includes(fieldId)) {
            // 對於radio button欄位，使用name屬性查找
            const radioGroup = document.querySelectorAll(`input[name="${fieldId}"]`);
            radioGroup.forEach(radio => {
                radio.addEventListener('change', () => {
                    setTimeout(() => {
                        updateExclusionCriteria();
                    }, 50);
                });
            });
        } else {
            // 對於其他欄位，使用id查找
            const field = document.getElementById(fieldId);
            if (field) {
                if (field.type === 'checkbox') {
                    field.addEventListener('change', () => {
                        setTimeout(() => {
                            updateExclusionCriteria();
                        }, 50);
                    });
                } else {
                    field.addEventListener('input', () => {
                        setTimeout(() => {
                            updateExclusionCriteria();
                        }, 50);
                    });
                }
            }
        }
    });
    
    // 初始化時執行一次檢查
    setTimeout(() => {
        updateInclusionCriteria();
        // 如果出生日期已有值，計算年齡
        const birthDateInput = document.getElementById('birthDate');
        if (birthDateInput && birthDateInput.value) {
            calculateAge();
        }
        // 初始化時執行一次排除條件檢查
        updateExclusionCriteria();
    }, 100);
}

// 設置動態新增功能
function setupDynamicAdditions() {
    // 藥物列表
    const drugList = document.getElementById('drugList');
    if (drugList) {
        // 初始化時添加一個藥物項目
        addDrug();
    }
    
    // 手術列表
    const surgList = document.getElementById('surgList');
    if (surgList) {
        // 初始化時添加一個手術項目
        addSurg();
    }
}

// 驗證受試者代碼
function validateSubjectCode() {
    const input = document.getElementById('subjectCode');
    const error = document.getElementById('subjectCodeErr');
    const pattern = /^P[A-Za-z0-9]{2}?[A-Za-z0-9]{4}$/;
    
    if (input.value && !pattern.test(input.value)) {
        error.hidden = false;
        input.style.borderColor = 'var(--danger)';
    } else {
        error.hidden = true;
        input.style.borderColor = 'var(--line)';
    }
}



// 自動計算年齡
function calculateAge() {
    const birthDateInput = document.getElementById('birthDate');
    const ageInput = document.getElementById('age');
    const error = document.getElementById('ageErr');
    
    if (birthDateInput && ageInput) {
        if (birthDateInput.value) {
            const birthDate = new Date(birthDateInput.value);
            const today = new Date();
            
            // 計算年齡
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            
            // 如果今年的生日還沒到，年齡減1
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            
            // 驗證年齡範圍
            if (age >= 0 && age <= 120) {
                ageInput.value = age;
                ageInput.style.borderColor = 'var(--line)';
                if (error) {
                    error.hidden = true;
                }
                
                // 觸發納入條件更新
                updateInclusionCriteria();
            } else {
                ageInput.value = '';
                ageInput.style.borderColor = 'var(--danger)';
                if (error) {
                    error.hidden = false;
                    error.textContent = '年齡超出有效範圍（0-120歲）';
                }
            }
        } else {
            ageInput.value = '';
            ageInput.style.borderColor = 'var(--line)';
            if (error) {
                error.hidden = true;
            }
        }
    }
}

// 自動計算 BMI
function calculateBMI() {
    const heightInput = document.getElementById('height');
    const weightInput = document.getElementById('weight');
    const bmiInput = document.getElementById('bmi');
    const error = document.getElementById('bmiErr');
    
    if (heightInput && weightInput && bmiInput) {
        const height = parseFloat(heightInput.value);
        const weight = parseFloat(weightInput.value);
        
        // 檢查身高體重是否有效
        if (height > 0 && weight > 0) {
            // BMI = 體重(kg) / 身高(m)²
            const heightInMeters = height / 100; // 轉換cm為m
            const bmi = weight / (heightInMeters * heightInMeters);
            
            // 保存精確值到小數點後第三位，但顯示到小數點後一位
            const preciseBMI = bmi.toFixed(3); // 保存精確值
            bmiInput.value = bmi.toFixed(1);   // 顯示一位小數
            bmiInput.setAttribute('data-precise-value', preciseBMI); // 儲存精確值
            
            // 驗證BMI範圍
            if (bmi < 10 || bmi > 60) {
                error.hidden = false;
                error.textContent = '計算出的BMI值異常，請檢查身高體重';
                bmiInput.style.borderColor = 'var(--warn)';
            } else {
                error.hidden = true;
                bmiInput.style.borderColor = 'var(--line)';
            }
        } else {
            // 清空BMI值
            bmiInput.value = '';
            bmiInput.removeAttribute('data-precise-value');
            error.hidden = true;
            bmiInput.style.borderColor = 'var(--line)';
        }
    }
}

// 獲取精確的BMI值（小數點後第三位）
function getPreciseBMI() {
    const bmiInput = document.getElementById('bmi');
    if (bmiInput) {
        return bmiInput.getAttribute('data-precise-value') || bmiInput.value;
    }
    return null;
}

// 獲取顯示的BMI值（小數點後一位）
function getDisplayBMI() {
    const bmiInput = document.getElementById('bmi');
    if (bmiInput) {
        return bmiInput.value;
    }
    return null;
}

// 自動計算 eGFR（使用IDMS-MDRD公式）
function calculateEGFR() {
    const creatinineInput = document.getElementById('creatinine');
    const egfrInput = document.getElementById('egfr');
    const ageInput = document.getElementById('age');
    const genderInputs = document.querySelectorAll('input[name="gender"]:checked');
    
    if (creatinineInput && egfrInput && ageInput && genderInputs.length > 0) {
        const creatinine = parseFloat(creatinineInput.value);
        const age = parseFloat(ageInput.value);
        const gender = genderInputs[0].value;
        
        // 檢查必要參數是否有效
        if (creatinine > 0 && age > 0) {
            // IDMS-MDRD公式：eGFR = 175 × (肌酸酐)^-1.154 × (年齡)^-0.203 × 性別係數 × 種族係數
            // 這裡假設為亞洲人種，種族係數為0.742
            // 性別係數：男性=1.0，女性=0.742
            
            let genderCoefficient = 1.0;
            if (gender === 'female') {
                genderCoefficient = 0.742;
            }
            
            const raceCoefficient = 0.742; // 亞洲人種係數
            
            // 計算eGFR
            const egfr = 175 * Math.pow(creatinine, -1.154) * Math.pow(age, -0.203) * genderCoefficient * raceCoefficient;
            
            // 保存精確值到小數點後第三位，但顯示到小數點後一位
            const preciseEGFR = egfr.toFixed(3);
            egfrInput.value = egfr.toFixed(1);
            egfrInput.setAttribute('data-precise-value', preciseEGFR);
            
            // 驗證eGFR範圍
            if (egfr < 0 || egfr > 200) {
                egfrInput.style.borderColor = 'var(--warn)';
            } else {
                egfrInput.style.borderColor = 'var(--line)';
            }
            
            // 隱藏錯誤訊息
            const error = document.getElementById('egfrErr');
            if (error) {
                error.hidden = true;
            }
        }
    }
}

// 獲取精確的eGFR值（小數點後第三位）
function getPreciseEGFR() {
    const egfrInput = document.getElementById('egfr');
    if (egfrInput) {
        return egfrInput.getAttribute('data-precise-value') || egfrInput.value;
    }
    return null;
}

// 設置病史驗證
function setupHistoryValidation() {
    // 糖尿病病史選擇事件
    const dmRadios = document.querySelectorAll('input[name="dm"]');
    dmRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            toggleHistoryDateSection('dm', this.value);
            validateHistorySelection('dm');
        });
    });
    
    // 痛風病史選擇事件
    const goutRadios = document.querySelectorAll('input[name="gout"]');
    goutRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            toggleHistoryDateSection('gout', this.value);
            validateHistorySelection('gout');
        });
    });
}



// 切換病史日期區塊的顯示/隱藏
function toggleHistoryDateSection(type, value) {
    const dateSection = document.getElementById(`${type}DateSection`);
    if (dateSection) {
        if (value === 'yes') {
            dateSection.style.display = 'block';
        } else {
            dateSection.style.display = 'none';
            // 清空日期選擇
            clearHistoryDate(type);
        }
    }
}

// 清空病史日期選擇
function clearHistoryDate(type) {
    const dateInput = document.getElementById(`${type}Date`);
    if (dateInput) dateInput.value = '';
}

// 驗證病史選擇
function validateHistorySelection(type) {
    const radios = document.querySelectorAll(`input[name="${type}"]:checked`);
    const error = document.getElementById(`${type}Err`);
    
    if (radios.length === 0) {
        if (error) {
            error.hidden = false;
            error.textContent = `請選擇${type === 'dm' ? '糖尿病' : '痛風'}病史`;
        }
        return false;
    } else {
        if (error) {
            error.hidden = true;
        }
        return true;
    }
}

// 獲取病史日期
function getHistoryDate(type) {
    const dateInput = document.getElementById(`${type}Date`);
    if (dateInput) {
        return dateInput.value;
    }
    return null;
}

// 檢查檢驗時間間隔
function checkLabTimeInterval() {
    const labTimeWithin7Checkbox = document.getElementById('labTimeWithin7');
    if (!labTimeWithin7Checkbox) return;
    
    // 獲取各種檢驗日期
    const biochemDate = document.getElementById('biochemDate')?.value;
    const urineDate = document.getElementById('urineDate')?.value;
    const urinalysisDate = document.getElementById('urinalysisDate')?.value;
    
    // 檢查是否有足夠的日期資料來進行比較
    if (biochemDate && urineDate && urinalysisDate) {
        const biochemDateObj = new Date(biochemDate);
        const urineDateObj = new Date(urineDate);
        const urinalysisDateObj = new Date(urinalysisDate);
        
        // 計算所有日期之間的最大間隔
        const dates = [biochemDateObj, urineDateObj, urinalysisDateObj].sort((a, b) => a - b);
        const maxDiffTime = dates[dates.length - 1] - dates[0];
        const maxDiffDays = Math.ceil(maxDiffTime / (1000 * 60 * 60 * 24));
        
        // 如果最大間隔≤7天，勾選為"是"
        labTimeWithin7Checkbox.checked = maxDiffDays <= 7;
        
        // 調試用：在控制台顯示計算結果
        // console.log('檢驗時間間隔檢查:', {
        //     biochemDate: biochemDate,
        //     urineDate: urineDate,
        //     urinalysisDate: urinalysisDate,
        //     maxDiffDays: maxDiffDays,
        //     isWithin7Days: maxDiffDays <= 7
        // });
    } else {
        // 如果沒有完整的日期資料，設為未勾選
        // labTimeWithin7Checkbox.checked = false;
        // console.log('檢驗時間間隔檢查: 缺少日期資料', {
        //     biochemDate: biochemDate,
        //     urineDate: urineDate,
        //     urinalysisDate: urinalysisDate
        // });
    }
}

// 檢查影像與檢驗資料時間間隔
function checkImageLabTimeInterval() {
    const imgLabWithin7Checkbox = document.getElementById('imgLabWithin7');
    if (!imgLabWithin7Checkbox) return;
    
    // 獲取影像檢查日期和各種檢驗日期
    const imgDate = document.getElementById('imgDate')?.value;
    const biochemDate = document.getElementById('biochemDate')?.value;
    const urineDate = document.getElementById('urineDate')?.value;
    const urinalysisDate = document.getElementById('urinalysisDate')?.value;
    
    // 檢查是否有足夠的日期資料來進行比較
    if (imgDate && (biochemDate || urineDate || urinalysisDate)) {
        const imgDateObj = new Date(imgDate);
        const labDates = [];
        
        // 收集所有有效的檢驗日期
        if (biochemDate) labDates.push(new Date(biochemDate));
        if (urineDate) labDates.push(new Date(urineDate));
        if (urinalysisDate) labDates.push(new Date(urinalysisDate));
        
        // 計算影像日期與各檢驗日期的最大間隔
        let maxDiffDays = 0;
        labDates.forEach(labDate => {
            const diffTime = Math.abs(imgDateObj - labDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays > maxDiffDays) {
                maxDiffDays = diffDays;
            }
        });
        
        // 如果最大間隔≤7天，勾選為"是"
        imgLabWithin7Checkbox.checked = maxDiffDays <= 7;
        
        // 調試用：在控制台顯示計算結果
        // console.log('影像與檢驗資料時間間隔檢查:', {
        //     imgDate: imgDate,
        //     labDates: labDates.map(d => d.toISOString().split('T')[0]),
        //     maxDiffDays: maxDiffDays,
        //     isWithin7Days: maxDiffDays <= 7
        // });
    } else {
        // 如果沒有完整的日期資料，設為未勾選
        imgLabWithin7Checkbox.checked = false;
        // console.log('影像與檢驗資料時間間隔檢查: 缺少日期資料', {
        //     imgDate: imgDate,
        //     biochemDate: biochemDate,
        //     urineDate: urineDate,
        //     urinalysisDate: urinalysisDate
        // });
    }
}

// 自動判讀納入條件
function updateInclusionCriteria() {
    // 1. 患者年齡是否18歲(含)以上?
    const ageInput = document.getElementById('age');
    const age18Checkbox = document.getElementById('age18');
    if (ageInput && age18Checkbox) {
        const age = parseInt(ageInput.value);
        age18Checkbox.checked = !isNaN(age) && age >= 18;
    }
    
    // 2. 基本資料與病史檢查
    // 性別
    const genderRadios = document.querySelectorAll('input[name="gender"]:checked');
    const hasGenderCheckbox = document.getElementById('hasGender');
    if (hasGenderCheckbox) {
        hasGenderCheckbox.checked = genderRadios.length > 0;
    }
    
    // 年齡（檢查出生日期）
    const birthDateInput = document.getElementById('birthDate');
    const hasAgeCheckbox = document.getElementById('hasAge');
    if (hasAgeCheckbox) {
        hasAgeCheckbox.checked = birthDateInput && birthDateInput.value.trim() !== '';
    }
    
    // BMI
    const bmiInput = document.getElementById('bmi');
    const hasBMICheckbox = document.getElementById('hasBMI');
    if (hasBMICheckbox) {
        hasBMICheckbox.checked = bmiInput && bmiInput.value.trim() !== '';
    }
    
    // 病史(糖尿病)
    const dmRadios = document.querySelectorAll('input[name="dm"]:checked');
    const hasDMHistoryCheckbox = document.getElementById('hasDMHistory');
    if (hasDMHistoryCheckbox) {
        hasDMHistoryCheckbox.checked = dmRadios.length > 0;
    }
    
    // 病史(痛風)
    const goutRadios = document.querySelectorAll('input[name="gout"]:checked');
    const hasGoutHistoryCheckbox = document.getElementById('hasGoutHistory');
    if (hasGoutHistoryCheckbox) {
        hasGoutHistoryCheckbox.checked = goutRadios.length > 0;
    }
    
    // 3. 檢驗資料檢查
    // eGFR
    const egfrInput = document.getElementById('egfr');
    const hasEGFRCheckbox = document.getElementById('hasEGFR');
    if (hasEGFRCheckbox) {
        hasEGFRCheckbox.checked = egfrInput && egfrInput.value.trim() !== '';
    }
    
    // 尿液pH
    const urinePHInput = document.getElementById('ph');
    const hasUrinePHCheckbox = document.getElementById('hasUrinePH');
    if (hasUrinePHCheckbox) {
        hasUrinePHCheckbox.checked = urinePHInput && urinePHInput.value.trim() !== '';
    }
    
    // 尿液SG
    const urineSGInput = document.getElementById('sg');
    const hasUrineSGCheckbox = document.getElementById('hasUrineSG');
    if (hasUrineSGCheckbox) {
        hasUrineSGCheckbox.checked = urineSGInput && urineSGInput.value.trim() !== '';
    }
    
    // 尿液RBC counts
    const urineRBCInput = document.getElementById('rbc');
    const hasUrineRBCCheckbox = document.getElementById('hasUrineRBC');
    if (hasUrineRBCCheckbox) {
        hasUrineRBCCheckbox.checked = urineRBCInput && urineRBCInput.value.trim() !== '';
    }
    
    // 菌尿症
    const bacteriuriaRadios = document.querySelectorAll('input[name="bacteriuria"]:checked');
    const hasBacteriuriaCheckbox = document.getElementById('hasBacteriuria');
    if (hasBacteriuriaCheckbox) {
        hasBacteriuriaCheckbox.checked = bacteriuriaRadios.length > 0;
    }
    
    // 檢驗時間間隔檢查
    checkLabTimeInterval();
    
    // 4. 影像資料檢查
    // 影像檢查類型
    const selectedImgType = document.querySelector('input[name="imgType"]:checked');
    const hasImagingDataCheckbox = document.getElementById('hasImagingData');
    if (hasImagingDataCheckbox) {
        hasImagingDataCheckbox.checked = !!selectedImgType;
    }
    
    // 影像與檢驗資料時間間隔檢查
    checkImageLabTimeInterval();
    
    // 更新納入條件檢核狀態
    updateEligibilityStatus();
}

// 更新納入條件檢核狀態
function updateEligibilityStatus() {
    let isValid = true;
    
    // 檢查影像檢查類型
    const selectedImgType = document.querySelector('input[name="imgType"]:checked');
    if (!selectedImgType) {
        isValid = false;
    }
    
    // 檢查影像伴讀報告摘要（選填，不影響驗證）
    // 註：此欄位為人工核對用，非邏輯判斷依據
    
    // 檢查納入條件
    const inclusionCriteria = [
        'age18',      // 患者年齡是否18歲(含)以上
        'hasGender',  // 是否有性別資料
        'hasAge',     // 是否有年齡資料
        'hasBMI',     // 是否有BMI資料
        'hasDMHistory', // 是否有糖尿病病史
        'hasGoutHistory', // 是否有痛風病史
        'hasEGFR',    // 是否有eGFR資料
        'hasUrinePH', // 是否有尿液pH資料
        'hasUrineSG', // 是否有尿液SG資料
        'hasUrineRBC', // 是否有尿液RBC counts資料
        'hasBacteriuria', // 是否有菌尿症資料
        'labTimeWithin7', // 檢驗時間間隔是否≤7天
        'hasImagingData', // 是否有影像資料
        'imgLabWithin7'  // 影像與檢驗資料時間間隔是否≤7天
    ];
    
    inclusionCriteria.forEach(criteriaId => {
        const checkbox = document.getElementById(criteriaId);
        if (checkbox && !checkbox.checked) {
            isValid = false;
        }
    });
    
    // 更新提示訊息
    const eligHint = document.getElementById('eligHint');
    if (eligHint) {
        if (isValid) {
            eligHint.textContent = '已完成所有必填檢核';
            eligHint.className = 'pill tag-ok';
        } else {
            eligHint.textContent = '尚未完成所有必填檢核';
            eligHint.className = 'pill tag-warn';
        }
    }
    
    return isValid;
}

// 驗證影像檢查類型
function validateImageType() {
    const selectedRadio = document.querySelector('input[name="imgType"]:checked');
    const error = document.getElementById('imgTypeErr');
    
    if (!selectedRadio) {
        error.hidden = false;
    } else {
        error.hidden = true;
    }
}

// 驗證影像日期
function validateImageDate() {
    const imgDate = document.getElementById('imgDate');
    const biochemDate = document.getElementById('biochemDate');
    const error = document.getElementById('imgDateErr');
    
    if (imgDate.value && biochemDate.value) {
        const imgDateObj = new Date(imgDate.value);
        const biochemDateObj = new Date(biochemDate.value);
        const today = new Date();
        
        // 檢查是否為未來日期
        if (imgDateObj > today) {
            error.hidden = false;
            error.textContent = '影像日期不可為未來日期';
            imgDate.style.borderColor = 'var(--danger)';
            return;
        }
        
        // 檢查與生化檢驗日期的間隔
        const diffTime = Math.abs(imgDateObj - biochemDateObj);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays > 7) {
            error.hidden = false;
            error.textContent = '影像與檢驗資料之時間間隔不可超過7日';
            imgDate.style.borderColor = 'var(--danger)';
        } else {
            error.hidden = true;
            imgDate.style.borderColor = 'var(--line)';
        }
    }
}

// 動態新增藥物
function addDrug() {
    const id = `drug-${crypto.randomUUID().slice(0,8)}`;
    const wrap = document.createElement('div');
    wrap.className = 'row block fade-in';
    wrap.innerHTML = `
        <input type="date" aria-label="藥物開立日期" />
        <input type="text" placeholder="藥物名稱" />
        <button class="btn-ghost" type="button" onclick="removeItem(this)">刪除</button>
    `;
    document.getElementById('drugList').appendChild(wrap);
}

// 動態新增手術
function addSurg() {
    const wrap = document.createElement('div');
    wrap.className = 'row block fade-in';
    wrap.innerHTML = `
        <input type="date" aria-label="手術日期" />
        <input type="text" placeholder="手術名稱" />
        <button class="btn-ghost" type="button" onclick="removeItem(this)">刪除</button>
    `;
    document.getElementById('surgList').appendChild(wrap);
}

// 移除項目
function removeItem(button) {
    button.parentElement.remove();
}

// 測試表單
function testForm() {
    console.log('=== 表單測試 ===');
    
    // 測試必填欄位
    const requiredFields = ['enrollDate', 'subjectCode', 'sex', 'age', 'bmi'];
    let isValid = true;
    
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field && !field.value.trim()) {
            field.style.borderColor = 'var(--danger)';
            isValid = false;
        } else if (field) {
            field.style.borderColor = 'var(--line)';
        }
    });
    
    // 測試影像檢查類型
    const selectedImgType = document.querySelector('input[name="imgType"]:checked');
    if (!selectedImgType) {
        document.getElementById('imgTypeErr').hidden = false;
        isValid = false;
    }
    
    if (isValid) {
        alert('表單驗證通過！');
    } else {
        alert('請檢查必填欄位和影像檢查類型！');
    }
}

// 儲存草稿
function saveDraft() {
    const formData = collectFormData();
    localStorage.setItem('trialDataDraft', JSON.stringify(formData));
    alert('草稿已儲存！');
}

// 提交表單
async function submitForm() {
    if (validateAllFields()) {
        const formData = collectFormData();
        console.log('提交的資料：', formData);
        
        try {
            // 顯示載入狀態
            showLoadingState(true);
            
            // 發送到後端
            const response = await fetch('/edc/submit-ecrf', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                alert('eCRF 已成功提交！');
                // 可以重導向到成功頁面或清空表單
            } else {
                alert(`提交失敗：${result.message}`);
            }
            
        } catch (error) {
            console.error('提交失敗:', error);
            alert('提交失敗，請稍後再試');
        } finally {
            // 恢復按鈕狀態
            showLoadingState(false);
        }
    } else {
        // 收集所有驗證錯誤訊息
        const errorMessages = collectValidationErrors();
        if (errorMessages.length > 0) {
            alert(`請完成以下必填檢核項目：\n\n${errorMessages.join('\n')}`);
        } else {
            alert('請完成所有必填檢核項目！');
        }
    }
}

// 收集驗證錯誤訊息
function collectValidationErrors() {
    const errorMessages = [];
    
    // 檢查必填欄位
    const requiredFields = ['enrollDate', 'subjectCode', 'birthDate', 'height', 'weight', 'biochemDate', 'egfr'];
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field && !field.value.trim()) {
            errorMessages.push(`• ${getFieldDisplayName(fieldId)} 為必填欄位`);
        }
    });
    
    // 檢查受試者代碼格式
    const subjectCodeField = document.getElementById('subjectCode');
    if (subjectCodeField && subjectCodeField.value.trim()) {
        const subjectCodePattern = /^P[A-Za-z0-9]{2}-?[A-Za-z0-9]{4}$/;
        if (!subjectCodePattern.test(subjectCodeField.value.trim())) {
            errorMessages.push('• 受試者代碼格式不正確，應為 P(1碼)+機構代碼(2碼)+流水號(4碼)，例：P01-0001');
        }
    }
    
    // 檢查性別選擇
    const genderCheckboxes = document.querySelectorAll('input[name="gender"]:checked');
    if (genderCheckboxes.length === 0) {
        errorMessages.push('• 請選擇性別');
    }
    
    // 檢查病史選擇
    if (!validateHistorySelection('dm')) {
        errorMessages.push('• 請完成糖尿病病史選擇');
    }
    if (!validateHistorySelection('gout')) {
        errorMessages.push('• 請完成痛風病史選擇');
    }
    
    // 檢查影像檢查類型
    const selectedImgType = document.querySelector('input[name="imgType"]:checked');
    if (!selectedImgType) {
        errorMessages.push('• 請選擇影像檢查類型');
    }
    
    // 檢查納入條件
    const inclusionCriteria = [
        'age18', 'hasGender', 'hasAge', 'hasBMI', 'hasDMHistory', 'hasGoutHistory',
        'hasEGFR', 'hasUrinePH', 'hasUrineSG', 'hasUrineRBC', 'hasBacteriuria',
        'labTimeWithin7', 'hasImagingData', 'imgLabWithin7'
    ];
    
    inclusionCriteria.forEach(criteriaId => {
        const checkbox = document.getElementById(criteriaId);
        if (checkbox && !checkbox.checked) {
            errorMessages.push(`• ${getFieldDisplayName(criteriaId)} 檢核未完成`);
        }
    });
    
    // 檢查藥物和手術資料（如果選擇有治療處置紀錄）
    const noTreatment = document.querySelector('input[name="noTx"]:checked')?.value === 'yes';
    if (!noTreatment) {
        // 如果選擇「否」（有治療），則必須填寫藥物或手術資料
        const medications = collectMedications();
        const surgeries = collectSurgeries();
        
        if (medications.length === 0 && surgeries.length === 0) {
            errorMessages.push('• 選擇有治療處置紀錄時，必須填寫至少一項藥物或手術資料');
        }
    }
    
    return errorMessages;
}

// 顯示載入狀態
function showLoadingState(show) {
    const submitBtn = document.querySelector('button[onclick="submitForm()"]');
    if (submitBtn) {
        if (show) {
            submitBtn.disabled = true;
            submitBtn.textContent = '提交中...';
        } else {
            submitBtn.disabled = false;
            submitBtn.textContent = '提交表單';
        }
    }
}

// 電子簽章
function eSign() {
    alert('PI 電子簽章功能');
}

// 驗證所有欄位
function validateAllFields() {
    let isValid = true;
    let errorMessages = [];
    
    // 檢查必填欄位
    const requiredFields = ['enrollDate', 'subjectCode', 'birthDate', 'height', 'weight', 'biochemDate', 'egfr'];
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field && !field.value.trim()) {
            isValid = false;
            errorMessages.push(`${getFieldDisplayName(fieldId)} 為必填欄位`);
        }
    });
    
    // 檢查受試者代碼格式
    const subjectCodeField = document.getElementById('subjectCode');
    if (subjectCodeField && subjectCodeField.value.trim()) {
        const subjectCodePattern = /^P[A-Za-z0-9]{2}-?[A-Za-z0-9]{4}$/;
        if (!subjectCodePattern.test(subjectCodeField.value.trim())) {
            isValid = false;
            errorMessages.push('受試者代碼格式不正確，應為 P(1碼)+機構代碼(2碼)+流水號(4碼)，例：P01-0001');
        }
    }
    
    // 檢查性別選擇
    const genderCheckboxes = document.querySelectorAll('input[name="gender"]:checked');
    if (genderCheckboxes.length === 0) {
        isValid = false;
        errorMessages.push('請選擇性別');
    }
    
    // 檢查病史選擇
    if (!validateHistorySelection('dm') || !validateHistorySelection('gout')) {
        isValid = false;
        errorMessages.push('請完成病史選擇');
    }
    
    // 檢查影像檢查類型
    const selectedImgType = document.querySelector('input[name="imgType"]:checked');
    if (!selectedImgType) {
        isValid = false;
        errorMessages.push('請選擇影像檢查類型');
    }
    
    // 檢查納入條件
    const inclusionCriteria = [
        'age18',      // 患者年齡是否18歲(含)以上
        'hasGender',  // 是否有性別資料
        'hasAge',     // 是否有年齡資料
        'hasBMI',     // 是否有BMI資料
        'hasDMHistory', // 是否有糖尿病病史
        'hasGoutHistory', // 是否有痛風病史
        'hasEGFR',    // 是否有eGFR資料
        'hasUrinePH', // 是否有尿液pH資料
        'hasUrineSG', // 是否有尿液SG資料
        'hasUrineRBC', // 是否有尿液RBC counts資料
        'hasBacteriuria', // 是否有菌尿症資料
        'labTimeWithin7', // 檢驗時間間隔是否≤7天
        'hasImagingData', // 是否有影像資料
        'imgLabWithin7'  // 影像與檢驗資料時間間隔是否≤7天
    ];
    
    inclusionCriteria.forEach(criteriaId => {
        const checkbox = document.getElementById(criteriaId);
        if (checkbox && !checkbox.checked) {
            isValid = false;
            errorMessages.push(`${getFieldDisplayName(criteriaId)} 檢核未完成`);
        }
    });
    
    // 檢查藥物和手術資料（如果選擇有治療處置紀錄）
    const noTreatment = document.querySelector('input[name="noTx"]:checked')?.value === 'yes';
    if (!noTreatment) {
        // 如果選擇「否」（有治療），則必須填寫藥物或手術資料
        const medications = collectMedications();
        const surgeries = collectSurgeries();
        
        if (medications.length === 0 && surgeries.length === 0) {
            isValid = false;
            errorMessages.push('選擇有治療處置紀錄時，必須填寫至少一項藥物或手術資料');
        }
    }
    
    // 更新提示訊息
    const eligHint = document.getElementById('eligHint');
    if (eligHint) {
        if (isValid) {
            eligHint.textContent = '已完成所有必填檢核';
            eligHint.className = 'pill tag-ok';
        } else {
            eligHint.textContent = '尚未完成所有必填檢核';
            eligHint.className = 'pill tag-warn';
        }
    }
    
    // 如果有錯誤，顯示詳細錯誤訊息
    if (!isValid && errorMessages.length > 0) {
        console.log('表單驗證失敗:', errorMessages);
    }
    
    return isValid;
}

// 取得欄位顯示名稱
function getFieldDisplayName(fieldId) {
    const fieldNames = {
        'enrollDate': '收案日期',
        'subjectCode': '受試者代碼',
        'birthDate': '出生日期',
        'height': '身高',
        'weight': '體重',
        'biochemDate': '生化檢驗日期',
        'egfr': 'eGFR',
        'age18': '年齡18歲以上',
        'hasGender': '性別資料',
        'hasAge': '年齡資料',
        'hasBMI': 'BMI資料',
        'hasDMHistory': '糖尿病病史',
        'hasGoutHistory': '痛風病史',
        'hasEGFR': 'eGFR資料',
        'hasUrinePH': '尿液pH資料',
        'hasUrineSG': '尿液SG資料',
        'hasUrineRBC': '尿液RBC counts資料',
        'hasBacteriuria': '菌尿症資料',
        'labTimeWithin7': '檢驗時間間隔≤7天',
        'hasImagingData': '影像資料',
        'imgLabWithin7': '影像與檢驗資料時間間隔≤7天'
    };
    return fieldNames[fieldId] || fieldId;
}

// 收集表單資料
function collectFormData() {
    // 轉換為後端期望的格式
    const formData = {
        subject_data: {
            subject_code: document.getElementById('subjectCode')?.value,
            date_of_birth: document.getElementById('birthDate')?.value,
            age: document.getElementById('age')?.value,
            gender: document.getElementsByName('gender')?.[0]?.value,
            height_cm: document.getElementById('height')?.value,
            weight_kg: document.getElementById('weight')?.value,
            bmi: document.getElementById('bmi')?.getAttribute('data-precise-value') || document.getElementById('bmi')?.value,
            bac: document.getElementsByName('bacteriuria')?.[0]?.value,
            dm: document.getElementsByName('dm')?.[0]?.value,
            gout: document.getElementsByName('gout')?.[0]?.value,
            imaging_type: document.querySelector('input[name="imgType"]:checked')?.value || '',
            imaging_date: document.getElementById('imgDate')?.value || '',
            kidney_stone_diagnosis: document.getElementsByName('stone')?.[0]?.value,
            imaging_files: [], // 檔案上傳功能待實現
            imaging_report_summary: document.getElementById('imgReadingReport')?.value || ''
        },
        inclusion_data: {
            age_18_above: document.getElementById('age18')?.checked ? 1 : 0,
            gender_available: document.getElementById('hasGender')?.checked ? 1 : 0,
            age_available: document.getElementById('hasAge')?.checked ? 1 : 0,
            bmi_available: document.getElementById('hasBMI')?.checked ? 1 : 0,
            dm_history_available: document.getElementById('hasDMHistory')?.checked ? 1 : 0,
            gout_history_available: document.getElementById('hasGoutHistory')?.checked ? 1 : 0,
            egfr_available: document.getElementById('hasEGFR')?.checked ? 1 : 0,
            urine_ph_available: document.getElementById('hasUrinePH')?.checked ? 1 : 0,
            urine_sg_available: document.getElementById('hasUrineSG')?.checked ? 1 : 0,
            urine_rbc_available: document.getElementById('hasUrineRBC')?.checked ? 1 : 0,
            bacteriuria_available: document.getElementById('hasBacteriuria')?.checked ? 1 : 0,
            lab_interval_7days: document.getElementById('labTimeWithin7')?.checked ? 1 : 0,
            imaging_available: document.getElementById('hasImagingData')?.checked ? 1 : 0,
            kidney_structure_visible: document.querySelector('input[name="visKidney"]:checked')?.value === 'yes' ? 1 : 0,
            mid_ureter_visible: document.querySelector('input[name="visMidUreter"]:checked')?.value === 'yes' ? 1 : 0,
            lower_ureter_visible: document.querySelector('input[name="visLowerUreter"]:checked')?.value === 'yes' ? 1 : 0,
            imaging_lab_interval_7days: document.getElementById('imgLabWithin7')?.checked ? 1 : 0,
            no_treatment_during_exam: document.querySelector('input[name="noTx"]:checked')?.value === 'yes' ? 1 : 0,
            medications: collectMedications(),
            surgeries: collectSurgeries()
        },
        exclusion_data: {
            pregnant_female: document.querySelector('input[name="pregnantFemale"]:checked')?.value === 'yes' ? 1 : 0,
            kidney_transplant: document.querySelector('input[name="kidneyTransplant"]:checked')?.value === 'yes' ? 1 : 0,
            urinary_tract_foreign_body: document.querySelector('input[name="urinaryForeignBody"]:checked')?.value === 'yes' ? 1 : 0,
            non_stone_urological_disease: document.querySelector('input[name="urinarySystemLesion"]:checked')?.value === 'yes' ? 1 : 0,
            renal_replacement_therapy: document.querySelector('input[name="renalReplacementTherapy"]:checked')?.value === 'yes' ? 1 : 0,
            medical_record_incomplete: document.querySelector('input[name="missingData"]:checked')?.value === 'yes' ? 1 : 0,
            major_blood_immune_cancer: document.querySelector('input[name="hematologicalDisease"]:checked')?.value === 'yes' ? 1 : 0,
            rare_metabolic_disease: document.querySelector('input[name="rareMetabolicDisease"]:checked')?.value === 'yes' ? 1 : 0,
            investigator_judgment: document.querySelector('input[name="piJudgment"]:checked')?.value === 'yes' ? 1 : 0,
            judgment_reason: document.getElementById('piJudgmentReason')?.value || ''
        }
    };
    
    return formData;
}

// 收集藥物資料
function collectMedications() {
    // 檢查是否勾選「無任何治療處置紀錄」
    const noTreatment = document.querySelector('input[name="noTx"]:checked')?.value === 'yes';
    
    // 如果勾選「是」（無治療），則不收集藥物資料
    if (noTreatment) {
        return [];
    }
    
    const medications = [];
    const drugItems = document.querySelectorAll('#drugList .row');
    
    drugItems.forEach(item => {
        const inputs = item.querySelectorAll('input');
        if (inputs.length >= 2) {
            const date = inputs[0].value;
            const name = inputs[1].value;
            if (date && name) {
                medications.push({
                    date: date,
                    name: name
                });
            }
        }
    });
    
    return medications;
}

// 收集手術資料
function collectSurgeries() {
    // 檢查是否勾選「無任何治療處置紀錄」
    const noTreatment = document.querySelector('input[name="noTx"]:checked')?.value === 'yes';
    
    // 如果勾選「是」（無治療），則不收集手術資料
    if (noTreatment) {
        return [];
    }
    
    const surgeries = [];
    const surgItems = document.querySelectorAll('#surgList .row');
    
    surgItems.forEach(item => {
        const inputs = item.querySelectorAll('input');
        if (inputs.length >= 2) {
            const date = inputs[0].value;
            const name = inputs[1].value;
            if (date && name) {
                surgeries.push({
                    date: date,
                    name: name
                });
            }
        }
    });
    
    return surgeries;
}

// 生成研究人員表單 HTML
function generateResearcherFormHTML() {
    return `
        <div class="wrap">
            <!-- DEBUG 模式開關 -->
            <section class="card col-12 fade-in" style="background-color: #fff3cd; border: 1px solid #ffeaa7;">
                <h2 style="color: #856404;">🐛 DEBUG 模式</h2>
                <div class="grid">
                    <div class="col-12">
                        <label class="inline">
                            <input type="checkbox" id="debugMode" onchange="toggleDebugMode()"> 
                            啟用 DEBUG 模式（自動填入預設值）
                        </label>
                        <div class="hint" style="color: #856404;">
                            開啟後會自動填入：納入條件全部為1，排除條件全部為0，以及一些基本預設值
                        </div>
                    </div>
                </div>
            </section>

            <!-- 受試者識別 -->
            <section class="card col-12 fade-in">
                <h2>受試者識別與納入</h2>
                <div class="grid">
                    <div class="col-9">
                        <label for="enrollDate">個案納入日期 <span style="color: var(--danger);">*</span></label>
                        <input id="enrollDate" type="date" required />
                        <div class="hint">格式：yyyy/mm/dd</div>
                        <div class="error" id="enrollDateErr" hidden>請選擇納入日期</div>
                    </div>
                    <div class="col-9">
                        <label for="subjectCode">受試者代碼 <span style="color: var(--danger);">*</span></label>
                        <input id="subjectCode" type="text" placeholder="P(1碼)+機構代碼(2碼)+流水號(4碼)，例：P01-0001" pattern="^P[A-Za-z0-9]{2}?[A-Za-z0-9]{4}$" />
                        <div class="hint">P(一碼)+試驗機構代碼(兩碼)+試驗者流水號(四碼)</div>
                        <div class="error" id="subjectCodeErr" hidden>請輸入正確格式的受試者代碼</div>
                    </div>
                </div>
            </section>

            <!-- 索引頁導航 -->
            <div class="tab-navigation col-12">
                <button class="tab-btn active" data-tab="subject">受試者特性資料</button>
                <button class="tab-btn" data-tab="criteria">納入條件</button>
                <button class="tab-btn" data-tab="exclusion">排除條件</button>
            </div>

            <!-- 受試者特性資料頁 -->
            <div id="subject-tab" class="tab-content active">
                <!-- 基本資料 -->
                <section class="card col-12 fade-in">
                    <h2>受試者基本資料</h2>
                    <div class="grid">
                        <div class="col-9">
                            <label>性別 <span style="color: var(--danger);">*</span></label>
                            <div class="row">
                                <label class="inline"><input type="radio" name="gender" value="1"> 男</label>
                                <label class="inline"><input type="radio" name="gender" value="0"> 女</label>
                            </div>
                        </div>
                        <div class="col-9">
                            <label for="birthDate">出生日期 <span style="color: var(--danger);">*</span></label>
                            <input id="birthDate" type="date" value="1990-01-01" required />
                            <div class="hint">格式：yyyy/mm/dd</div>
                            <div class="error" id="birthDateErr" hidden>請選擇出生日期</div>
                        </div>
                        <div class="col-9">
                            <label for="age">年齡（yrs） <span style="color: var(--danger);">*</span></label>
                            <input id="age" type="number" min="0" max="120" step="1" placeholder="自動計算" readonly required />
                            <div class="hint">系統根據出生日期自動計算</div>
                            <div class="error" id="ageErr" hidden>請選擇出生日期以計算年齡</div>
                        </div>
                        <div class="col-9">
                            <label for="measureDate">身高體重測量日期 <span style="color: var(--danger);">*</span></label>
                            <input id="measureDate" type="date" required />
                            <div class="hint">格式：yyyy/mm/dd</div>
                            <div class="error" id="measureDateErr" hidden>請選擇測量日期</div>
                        </div>
                        <div class="col-9">
                            <label for="height">身高（cm） <span style="color: var(--danger);">*</span></label>
                            <input id="height" type="number" step="0.1" min="0" required />
                            <div class="error" id="heightErr" hidden>請輸入有效身高</div>
                        </div>
                        <div class="col-9">
                            <label for="weight">體重（kg） <span style="color: var(--danger);">*</span></label>
                            <input id="weight" type="number" step="0.1" min="0" required />
                            <div class="error" id="weightErr" hidden>請輸入有效體重</div>
                        </div>
                        <div class="col-9">
                            <label for="bmi">BMI（kg/m²） <span style="color: var(--danger);">*</span></label>
                            <input id="bmi" type="number" step="0.1" placeholder="自動計算" readonly />
                            <div class="hint">由身高體重自動計算，單位：kg/m²（顯示一位小數，實際保存三位小數）</div>
                            <div class="error" id="bmiErr" hidden>請輸入有效的身高和體重</div>
                        </div>
                    </div>
                </section>

                <!-- 檢驗資料 -->
                <section class="card col-12 fade-in">
                    <h2>檢驗資料</h2>
                    <h3>生化檢驗</h3>
                    <div class="grid">
                        <div class="col-9">
                            <label for="biochemDate">生化檢驗-採檢日期 <span style="color: var(--danger);">*</span></label>
                            <input id="biochemDate" type="date" required />
                            <div class="hint">格式：yyyy/mm/dd</div>
                            <div class="error" id="biochemDateErr" hidden>請選擇採檢日期</div>
                        </div>
                        <div class="col-9">
                            <label for="creatinine">血清肌酸酐濃度（mg/dL）</label>
                            <input id="creatinine" type="number" step="0.01" min="0" step="0.01" />
                            <div class="hint">正常值：0.6-1.2 mg/dL</div>
                        </div>
                        <div class="col-9">
                            <label for="egfr">eGFR（mL/min/1.73m²） <span style="color: var(--danger);">*</span></label>
                            <input id="egfr" type="number" step="0.1" min="0" required />
                            <div class="hint">正常值：≥90 mL/min/1.73m²（可手動輸入或由肌酸酐自動計算，使用IDMS-MDRD公式）</div>
                            <div class="error" id="egfrErr" hidden>請輸入eGFR值</div>
                        </div>
                    </div>
                    <h3>尿液檢驗</h3>
                    <div class="grid">
                        <div class="col-9">
                            <label for="urineDate">尿液檢驗-採檢日期 <span style="color: var(--danger);">*</span></label>
                            <input id="urineDate" type="date" required />
                            <div class="hint">格式：yyyy/mm/dd</div>
                            <div class="error" id="urineDateErr" hidden>請選擇採檢日期</div>
                        </div>
                        <div class="col-9">
                            <label for="ph">尿液 pH <span style="color: var(--danger);">*</span></label>
                            <input id="ph" type="number" step="0.1" min="0" max="14" required />
                            <div class="hint">正常值：4.5-8.0</div>
                        </div>
                        <div class="col-9">
                            <label for="sg">尿液比重（SG） <span style="color: var(--danger);">*</span></label>
                            <input id="sg" type="number" step="0.001" min="1.000" max="1.050" required />
                            <div class="hint">正常值：1.005-1.030</div>
                        </div>
                    </div>
                    <h3>尿液鏡檢</h3>
                    <div class="grid">
                        <div class="col-9">
                            <label for="urinalysisDate">尿液鏡檢-採檢日期 <span style="color: var(--danger);">*</span></label>
                            <input id="urinalysisDate" type="date" required />
                            <div class="hint">格式：yyyy/mm/dd</div>
                            <div class="error" id="urinalysisDateErr" hidden>請選擇採檢日期</div>
                        </div>
                        <div class="col-9">
                            <label for="rbc">尿液紅血球（RBC/HPF） <span style="color: var(--danger);">*</span></label>
                            <input id="rbc" type="number" step="1" min="0" required />
                            <div class="hint">正常值：≤3</div>
                        </div>
                        <div class="col-9">
                            <label>是否有菌尿症 <span style="color: var(--danger);">*</span></label>
                            <div class="row">
                                <label class="inline"><input type="radio" name="bacteriuria" value="1"> 是</label>
                                <label class="inline"><input type="radio" name="bacteriuria" value="0"> 否</label>
                            </div>
                        </div>
                    </div>
                </section>
                <!-- 病史 -->
                <section class="card col-12 fade-in">
                    <h2>病史</h2>
                    <div class="grid">
                        <div class="col-9">
                            <label>是否有糖尿病病史 <span style="color: var(--danger);">*</span></label>
                            <div class="row">
                                <label class="inline"><input type="radio" name="dm" value="1" required> 有</label>
                                <label class="inline"><input type="radio" name="dm" value="0" required> 無</label>
                            </div>
                            <div id="dmDateSection" style="display: none;">
                                <label for="dmDate">糖尿病診斷日期</label>
                                <input id="dmDate" type="date" />
                                <div class="hint">若有：請選擇診斷日期（選填）</div>
                            </div>
                            <div class="error" id="dmErr" hidden>請選擇糖尿病病史</div>
                        </div>
                        <div class="col-9">
                            <label>是否有痛風病史 <span style="color: var(--danger);">*</span></label>
                            <div class="row">
                                <label class="inline"><input type="radio" name="gout" value="1" required> 有</label>
                                <label class="inline"><input type="radio" name="gout" value="0" required> 無</label>
                            </div>
                            <div id="goutDateSection" style="display: none;">
                                <label for="goutDate">痛風診斷日期</label>
                                <input id="goutDate" type="date" />
                                <div class="hint">若有：請選擇診斷日期（選填）</div>
                            </div>
                            <div class="error" id="goutErr" hidden>請選擇痛風病史</div>
                        </div>
                    </div>
                </section>

                <!-- 影像資料 -->
                <section class="card col-12 fade-in">
                    <h2>影像資料</h2>
                    <div class="grid">
                        <div class="col-9">
                            <label>影像檢查類型 <span style="color: var(--danger);">*</span></label>
                            <label class="inline"><input type="radio" name="imgType" value="CT"> CT</label>
                            <label class="inline"><input type="radio" name="imgType" value="PET-CT"> PET-CT</label>
                            <div class="error" id="imgTypeErr" hidden>請選擇影像檢查類型</div>
                        </div>
                        <div class="col-9">
                            <label for="imgDate">影像檢查日期 <span style="color: var(--danger);">*</span></label>
                            <input id="imgDate" type="date" required />
                            <div class="hint">不得為未來日期；與檢驗日期需在7日內</div>
                            <div class="error" id="imgDateErr" hidden>影像日期不可為未來，且需在檢驗日期±7日內</div>
                        </div>
                        <div class="col-9">
                            <label>腎結石診斷結果 <span style="color: var(--danger);">*</span></label>
                            <div class="row">
                                <label class="inline"><input type="radio" name="stone" value="1" required> 是</label>
                                <label class="inline"><input type="radio" name="stone" value="0" required> 否</label>
                                <label class="inline"><input type="radio" name="stone" value="2" required> 未知</label>
                            </div>
                        </div>
                        <div class="col-9">
                            <label for="imgReport">影像報告上傳（可多檔）</label>
                            <input id="imgReport" type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.dcm" />
                            <div class="hint">至少上傳影像或報告其中之一；實務建議兩者皆留存</div>
                            <div class="success" id="fileUploadStatus" hidden></div>
                        </div>
                        <div class="col-12">
                            <label for="imgReadingReport">影像伴讀報告摘要</label>
                            <textarea id="imgReadingReport" rows="6" placeholder="請輸入影像伴讀報告摘要內容..."></textarea>
                            <div class="hint">人工核對用，非邏輯判斷依據。無固定格式，請依實際情況填寫。</div>
                        </div>
                    </div>
                </section>

            </div>

            <!-- 納入條件頁 -->
            <div id="criteria-tab" class="tab-content">
                <section class="card col-12 fade-in">
                    <h2>納入條件檢核</h2>
                    <div class="grid">
                        <div class="col-12">
                            <h3>1. 患者年齡是否18歲(含)以上?</h3>
                            <div class="col-9"><label class="inline"><input type="checkbox" id="age18" disabled> 是</label></div>
                            <div class="hint">系統自動判讀輸入變項中的年齡資訊是否≥18</div>
                        </div>
                        
                        <div class="col-12">
                            <h3>2. 病歷中是否記載以下基本資料與病史:</h3>
                            
                            <div class="sub-section">
                                <h4>基本資料</h4>
                                <div class="col-9"><label class="inline"><input type="checkbox" id="hasGender" disabled> 性別</label></div>
                                <div class="hint">系統自動判讀輸入變項中的性別資訊</div>
                                
                                <div class="col-9"><label class="inline"><input type="checkbox" id="hasAge" disabled> 年齡</label></div>
                                <div class="hint">系統自動判讀輸入變項中的年齡資訊</div>
                                
                                <div class="col-9"><label class="inline"><input type="checkbox" id="hasBMI" disabled> 身體質量指數(BMI)</label></div>
                                <div class="hint">系統自動判讀輸入變項中的身體質量指數(BMI)資訊</div>
                            </div>
                            
                            <div class="sub-section">
                                <h4>病史</h4>
                                <div class="col-9"><label class="inline"><input type="checkbox" id="hasDMHistory" disabled> 病史(糖尿病)</label></div>
                                <div class="hint">系統自動判讀輸入變項中的病史(糖尿病)資訊</div>
                                
                                <div class="col-9"><label class="inline"><input type="checkbox" id="hasGoutHistory" disabled> 病史(痛風)</label></div>
                                <div class="hint">系統自動判讀輸入變項中的病史(痛風)資訊</div>
                            </div>
                        </div>
                        
                        <div class="col-12">
                            <h3>3. 病歷中具備以下完整之檢驗資料:</h3>
                            
                            <div class="sub-section">
                                <h4>檢驗資料</h4>
                                <div class="col-9"><label class="inline"><input type="checkbox" id="hasEGFR" disabled> 腎絲球過濾率估計值(eGFR)</label></div>
                                <div class="hint">系統自動判讀輸入變項中的eGFR資訊</div>
                                
                                <div class="col-9"><label class="inline"><input type="checkbox" id="hasUrinePH" disabled> 尿液酸鹼值(urine pH)</label></div>
                                <div class="hint">系統自動判讀輸入變項中的尿液pH資訊</div>
                                
                                <div class="col-9"><label class="inline"><input type="checkbox" id="hasUrineSG" disabled> 尿液比重(urine SG)</label></div>
                                <div class="hint">系統自動判讀輸入變項中的尿液SG資訊</div>
                                
                                <div class="col-9"><label class="inline"><input type="checkbox" id="hasUrineRBC" disabled> 尿液紅血球數量(urine RBC counts)</label></div>
                                <div class="hint">系統自動判讀輸入變項中的尿液RBC counts資訊</div>
                                
                                <div class="col-9"><label class="inline"><input type="checkbox" id="hasBacteriuria" disabled> 菌尿症(bacteriuria)</label></div>
                                <div class="hint">系統自動判讀輸入變項中的菌尿症資訊</div>
                            </div>
                            
                            <div class="sub-section">
                                <h4>時間間隔檢查</h4>
                                <div class="col-9"><label class="inline"><input type="checkbox" id="labTimeWithin7" disabled> 以上各檢驗項目採檢時間之間隔是否皆未超過7天?</label></div>
                                <div class="hint">系統自動計算生化檢驗、尿液檢驗、尿液鏡檢採檢日期間隔是否≤7天</div>
                            </div>
                        </div>
                        
                        <div class="col-12">
                            <h3>4. 病歷中曾記錄任一項影像資料 (腹部電腦斷層掃描(CT)或正子斷層造影檢查(PET-CT))?</h3>
                            <div class="col-9"><label class="inline"><input type="checkbox" id="hasImagingData" disabled> 是</label></div>
                            <div class="hint">系統自動判讀影像檢查類型資訊</div>
                        </div>
                        
                        <div class="col-12">
                            <h3>4.1 影像資料是否可完整顯現腎臟結構?</h3>
                            <div class="col-9">
                                <label class="inline"><input type="radio" id="visKidney" name="visKidney" value="yes"> 是</label>
                                <label class="inline"><input type="radio" id="visKidneyNo" name="visKidney" value="no"> 否</label>
                            </div>
                            <div class="hint">人工判斷，請勾選"是"或"否"</div>
                        </div>
                        
                        <div class="col-12">
                            <h3>4.2 影像資料是否可完整顯現中段輸尿管結構?</h3>
                            <div class="col-9">
                                <label class="inline"><input type="radio" id="visMidUreter" name="visMidUreter" value="yes"> 是</label>
                                <label class="inline"><input type="radio" id="visMidUreterNo" name="visMidUreter" value="no"> 否</label>
                            </div>
                            <div class="hint">人工判斷，請勾選"是"或"否"</div>
                        </div>
                        
                        <div class="col-12">
                            <h3>4.3 影像資料是否可完整顯現下段輸尿管結構?</h3>
                            <div class="col-9">
                                <label class="inline"><input type="radio" id="visLowerUreter" name="visLowerUreter" value="yes"> 是</label>
                                <label class="inline"><input type="radio" id="visLowerUreterNo" name="visLowerUreter" value="no"> 否</label>
                            </div>
                            <div class="hint">人工判斷，請勾選"是"或"否"</div>
                        </div>
                        
                        <div class="col-12">
                            <h3>4.4 影像資料與檢驗資料之時間間隔是否皆未超過7天?</h3>
                            <div class="col-9"><label class="inline"><input type="checkbox" id="imgLabWithin7" disabled> 是</label></div>
                            <div class="hint">系統自動計算影像檢查日期與各項檢驗採檢日期間隔是否≤7天</div>
                        </div>
                        
                        <div class="col-12">
                            <h3>4.5 檢查期間未有任何治療處置紀錄(包括但不限於因症狀而開立之藥物、手術等)?</h3>
                            <div class="col-12">
                                <label class="inline"><input type="radio" id="noTx" name="noTx" value="yes"> 是</label>
                                <label class="inline"><input type="radio" id="noTxNo" name="noTx" value="no"> 否</label>
                            </div>
                            <div class="hint">人工判斷，請勾選"是"或"否"。若勾選"否"，請繼續選擇並填寫下列藥物及手術資訊</div>
                        </div>
                        
                        <!-- 治療紀錄（當4.5選擇"否"時顯示） -->
                        <div class="col-12" id="treatmentSection" style="display: none;">
                            <h3>治療紀錄詳情</h3>
                            <div class="grid">
                                <div class="col-12">
                                    <h4>藥物</h4>
                                    <div id="drugList"></div>
                                    <button class="btn-ghost" type="button" onclick="addDrug()">+ 新增藥物</button>
                                </div>
                                <div class="col-12">
                                    <h4>手術</h4>
                                    <div id="surgList"></div>
                                    <button class="btn-ghost" type="button" onclick="addSurg()">+ 新增手術</button>
                                </div>
                            </div>
                        </div>
                    </div>

                </section>
            </div>

            <!-- 排除條件頁 -->
            <div id="exclusion-tab" class="tab-content">
                <section class="card col-12 fade-in">
                    <h2>排除條件檢核</h2>
                    <div class="grid">
                        <div class="col-12">
                            <h3>1. 患者是否為懷孕女性?</h3>
                            <div class="col-9">
                                <label class="inline"><input type="radio" id="pregnantFemale" name="pregnantFemale" value="yes"> 是</label>
                                <label class="inline"><input type="radio" id="pregnantFemaleNo" name="pregnantFemale" value="no"> 否</label>
                            </div>
                            <div class="hint">系統會根據輸入變數自動判斷性別。若為男性，系統自動勾選"否"；若為女性，此欄位留空供人員人工檢核勾選</div>
                        </div>
                        
                        <div class="col-12">
                            <h3>2. 患者是否接受過腎臟移植?</h3>
                            <div class="col-9">
                                <label class="inline"><input type="radio" id="kidneyTransplant" name="kidneyTransplant" value="yes"> 是</label>
                                <label class="inline"><input type="radio" id="kidneyTransplantNo" name="kidneyTransplant" value="no"> 否</label>
                            </div>
                            <div class="hint">人工勾選"是"或"否"</div>
                        </div>
                        
                        <div class="col-12">
                            <h3>3. 患者是否為合併泌尿道異物者?</h3>
                            <div class="hint">（包含但不限於：經影像檢查發現有輸尿管支架、經皮腎造廔管、中段或下段輸尿管異物等非腎結石之異物）</div>
                            <div class="col-9">
                                <label class="inline"><input type="radio" id="urinaryForeignBody" name="urinaryForeignBody" value="yes"> 是</label>
                                <label class="inline"><input type="radio" id="urinaryForeignBodyNo" name="urinaryForeignBody" value="no"> 否</label>
                            </div>
                            <div class="hint">人工勾選"是"或"否"。若勾選"是"，請填寫泌尿道異物種類名稱</div>
                            
                            <div class="col-12" id="foreignBodyTypeSection" style="display: none;">
                                <label for="foreignBodyType">3.1 泌尿道異物種類名稱</label>
                                <input type="text" id="foreignBodyType" placeholder="請填寫泌尿道異物種類名稱">
                                <div class="hint">若"患者是否為合併泌尿道異物者"勾選"是"，請填寫此欄位</div>
                            </div>
                        </div>
                        
                        <div class="col-12">
                            <h3>4. 患者是否患有合併非腎結石相關之泌尿系統重大病變?</h3>
                            <div class="hint">（例如膀胱腫瘤、尿道狹窄等）</div>
                            <div class="col-9">
                                <label class="inline"><input type="radio" id="urinarySystemLesion" name="urinarySystemLesion" value="yes"> 是</label>
                                <label class="inline"><input type="radio" id="urinarySystemLesionNo" name="urinarySystemLesion" value="no"> 否</label>
                            </div>
                            <div class="hint">人工勾選"是"或"否"。若勾選"是"，請填寫非腎結石相關之泌尿道重大病變名稱</div>
                            
                            <div class="col-12" id="lesionTypeSection" style="display: none;">
                                <label for="lesionType">4.1 非腎結石相關之泌尿道重大病變名稱</label>
                                <input type="text" id="lesionType" placeholder="請填寫泌尿道重大病變名稱">
                                <div class="hint">若"患者是否患有合併非腎結石相關之泌尿系統重大病變"勾選"是"，請填寫此欄位</div>
                            </div>
                        </div>
                        
                        <div class="col-12">
                            <h3>5. 患者是否正在接受腎臟替代治療?</h3>
                            <div class="hint">（例如血液透析、腹膜透析等）</div>
                            <div class="col-9">
                                <label class="inline"><input type="radio" id="renalReplacementTherapy" name="renalReplacementTherapy" value="yes"> 是</label>
                                <label class="inline"><input type="radio" id="renalReplacementTherapyNo" name="renalReplacementTherapy" value="no"> 否</label>
                            </div>
                            <div class="hint">人工勾選"是"或"否"。若勾選"是"，請填寫腎臟替代治療名稱</div>
                            
                            <div class="col-12" id="therapyTypeSection" style="display: none;">
                                <label for="therapyType">5.1 腎臟替代治療名稱</label>
                                <input type="text" id="therapyType" placeholder="請填寫腎臟替代治療名稱">
                                <div class="hint">若"患者是否正在接受腎臟替代治療"勾選"是"，請填寫此欄位</div>
                            </div>
                        </div>
                        
                        <div class="col-12">
                            <h3>6. 患者是否有病歷資料缺失或無腎結石診斷依據?</h3>
                            <div class="col-9">
                                <label class="inline"><input type="radio" id="missingData" name="missingData" value="yes" disabled> 是</label>
                                <label class="inline"><input type="radio" id="missingDataNo" name="missingData" value="no" disabled> 否</label>
                            </div>
                            <div class="hint">系統自動判斷，此欄位為唯讀</div>
                            <div class="hint">系統會根據輸入變數自動判斷受試者基本資料、生化檢驗、尿液檢驗、尿液鏡檢、影像資料腎結石診斷結果等欄位是否完整填寫。若完整填寫，系統自動勾選"否"；若未完整填寫，系統自動勾選"是"</div>
                        </div>
                        
                        <div class="col-12">
                            <h3>7. 患者是否患有合併重大血液、免疫或惡性腫瘤疾病?</h3>
                            <div class="col-9">
                                <label class="inline"><input type="radio" id="hematologicalDisease" name="hematologicalDisease" value="yes"> 是</label>
                                <label class="inline"><input type="radio" id="hematologicalDiseaseNo" name="hematologicalDisease" value="no"> 否</label>
                            </div>
                            <div class="hint">人工勾選"是"或"否"。若勾選"是"，請填寫重大血液、免疫或惡性腫瘤疾病名稱</div>
                            
                            <div class="col-12" id="hematologicalDiseaseTypeSection" style="display: none;">
                                <label for="hematologicalDiseaseType">7.1 重大血液、免疫或惡性腫瘤疾病名稱</label>
                                <input type="text" id="hematologicalDiseaseType" placeholder="請填寫疾病名稱">
                                <div class="hint">若"患者是否患有合併重大血液、免疫或惡性腫瘤疾病"勾選"是"，請填寫此欄位</div>
                            </div>
                        </div>
                        
                        <div class="col-12">
                            <h3>8. 患者是否患有合併罕見代謝性疾病，可能顯著影響腎功能評估者?</h3>
                            <div class="hint">（不含糖尿病與痛風）</div>
                            <div class="col-9">
                                <label class="inline"><input type="radio" id="rareMetabolicDisease" name="rareMetabolicDisease" value="yes"> 是</label>
                                <label class="inline"><input type="radio" id="rareMetabolicDiseaseNo" name="rareMetabolicDisease" value="no"> 否</label>
                            </div>
                            <div class="hint">人工勾選"是"或"否"。若勾選"是"，請填寫罕見代謝性疾病名稱</div>
                            
                            <div class="col-12" id="metabolicDiseaseTypeSection" style="display: none;">
                                <label for="metabolicDiseaseType">8.1 罕見代謝性疾病名稱</label>
                                <input type="text" id="metabolicDiseaseType" placeholder="請填寫疾病名稱">
                                <div class="hint">若"患者是否患有合併罕見代謝性疾病，可能顯著影響腎功能評估者"勾選"是"，請填寫此欄位</div>
                            </div>
                        </div>
                        
                        <div class="col-12">
                            <h3>9. 患者是否經試驗主持人專業判斷，認定不適合納入本研究?</h3>
                            <div class="col-9">
                                <label class="inline"><input type="radio" id="piJudgment" name="piJudgment" value="yes"> 是</label>
                                <label class="inline"><input type="radio" id="piJudgmentNo" name="piJudgment" value="no"> 否</label>
                            </div>
                            <div class="hint">經專業判斷後人工勾選"是"或"否"。若勾選"是"，請說明試驗主持人認定不適合納入本研究之原因</div>
                            
                            <div class="col-12" id="piJudgmentReasonSection" style="display: none;">
                                <label for="piJudgmentReason">9.1 試驗主持人認定不適合納入本研究之原因</label>
                                <textarea id="piJudgmentReason" rows="4" placeholder="請說明試驗主持人認定不適合納入本研究之原因"></textarea>
                                <div class="hint">若"患者是否經試驗主持人專業判斷，認定不適合納入本研究"勾選"是"，請填寫此欄位</div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <!-- 動作 -->
            <section class="card col-12 fade-in" id="actionBar">
                <div class="actions">
                    <button class="btn-ghost" type="button" onclick="testForm()" id="testBtn">測試表單</button>
                    <button class="btn-ghost" type="button" onclick="saveDraft()" id="saveBtn">儲存草稿</button>
                    <button class="btn-primary" type="button" onclick="submitForm()" id="submitBtn">提交 eCRF</button>
                    <button class="btn-danger" type="button" id="signBtn" onclick="eSign()" hidden>PI 電子簽章</button>
                </div>
            </section>
        </div>
    `;
}

// 當用戶角色為研究人員時顯示表單
function showResearcherForm() {
    const researcherForm = document.getElementById('researcherDataForm');
    if (researcherForm) {
        researcherForm.style.display = 'block';
        // 動態生成表單內容
        researcherForm.innerHTML = generateResearcherFormHTML();
        // 初始化表單
        initializeResearcherForm();
    }
}

// 隱藏研究人員表單
function hideResearcherForm() {
    const researcherForm = document.getElementById('researcherDataForm');
    if (researcherForm) {
        researcherForm.style.display = 'none';
        researcherForm.innerHTML = '';
    }
}

// 設置索引頁切換功能
function setupTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            
            // 移除所有活動狀態
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // 設置當前索引頁為活動狀態
            button.classList.add('active');
            const targetContent = document.getElementById(`${targetTab}-tab`);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
}

// 控制治療紀錄區塊的顯示/隱藏
function toggleTreatmentSection() {
    const noTxNoRadio = document.querySelector('input[name="noTx"]:checked');
    const treatmentSection = document.getElementById('treatmentSection');
    
    if (treatmentSection) {
        if (noTxNoRadio && noTxNoRadio.value === 'no') {
            treatmentSection.style.display = 'block';
        } else {
            treatmentSection.style.display = 'none';
        }
    }
}

// 更新排除條件
function updateExclusionCriteria() {
    // 1. 懷孕女性自動判斷
    const genderRadios = document.querySelectorAll('input[name="gender"]:checked');
    const pregnantFemaleNoRadio = document.getElementById('pregnantFemaleNo');
    
    if (genderRadios.length > 0 && pregnantFemaleNoRadio) {
        const selectedGender = genderRadios[0].value;
        if (selectedGender === 'male') {
            // 如果是男性，自動勾選"否"
            pregnantFemaleNoRadio.checked = true;
            // 觸發change事件以更新詳細欄位顯示
            pregnantFemaleNoRadio.dispatchEvent(new Event('change'));
        }
    }
    
    // 6. 病歷資料缺失自動判斷
    const missingDataRadio = document.getElementById('missingData');
    const missingDataNoRadio = document.getElementById('missingDataNo');
    
    if (missingDataRadio && missingDataNoRadio) {
        // 檢查必填欄位是否完整
        const requiredFields = [
            'enrollDate', 'subjectCode', 'gender', 'birthDate', 'age', 
            'measureDate', 'height', 'weight', 'bmi', 'biochemDate', 
            'creatinine', 'egfr', 'ph', 'sg', 'rbc', 'bacteriuria', 
            'urineDate', 'urinalysisDate', 'dm', 'gout', 'imgType', 
            'imgDate', 'stone'
        ];
        
        let isComplete = true;
        let missingFields = [];
        
        requiredFields.forEach(fieldId => {
            // 對於radio button欄位，使用name屬性查找
            if (['gender', 'bacteriuria', 'dm', 'gout', 'imgType', 'stone'].includes(fieldId)) {
                const radioGroup = document.querySelectorAll(`input[name="${fieldId}"]:checked`);
                if (radioGroup.length === 0) {
                    isComplete = false;
                    missingFields.push(`${fieldId} (radio not selected)`);
                    // console.log(`Radio field ${fieldId} not selected`);
                } else {
                    // console.log(`Radio field ${fieldId} is selected: ${radioGroup[0].value}`);
                    
                    // 特殊處理：如果選擇"有"病史，檢查對應的日期欄位
                    if (fieldId === 'dm' && radioGroup[0].value === 'yes') {
                        const dmDateField = document.getElementById('dmDate');
                        if (dmDateField && (!dmDateField.value || dmDateField.value.trim() === '')) {
                            isComplete = false;
                            missingFields.push(`dmDate (diabetes date required when dm=yes)`);
                            // console.log(`dmDate is empty but required when dm=yes`);
                        } else if (dmDateField && dmDateField.value) {
                            // console.log(`dmDate has value: ${dmDateField.value}`);
                        }
                    }
                    
                    if (fieldId === 'gout' && radioGroup[0].value === 'yes') {
                        const goutDateField = document.getElementById('goutDate');
                        if (goutDateField && (!goutDateField.value || goutDateField.value.trim() === '')) {
                            isComplete = false;
                            missingFields.push(`goutDate (gout date required when gout=yes)`);
                            // console.log(`goutDate is empty but required when gout=yes`);
                        } else if (goutDateField && goutDateField.value) {
                            // console.log(`goutDate has value: ${goutDateField.value}`);
                        }
                    }
                }
            } else {
                // 對於其他欄位，使用id查找
                const field = document.getElementById(fieldId);
                if (field) {
                    if (field.type === 'checkbox') {
                        // 對於checkbox，檢查是否已勾選
                        if (!field.checked) {
                            isComplete = false;
                            missingFields.push(`${fieldId} (checkbox not checked)`);
                            // console.log(`Checkbox field ${fieldId} not checked`);
                        } else {
                            // console.log(`Checkbox field ${fieldId} is checked`);
                        }
                    } else {
                        // 對於其他輸入欄位，檢查是否有值
                        if (!field.value || field.value.trim() === '') {
                            isComplete = false;
                            missingFields.push(`${fieldId} (empty value: "${field.value}")`);
                            // console.log(`Input field ${fieldId} is empty: "${field.value}"`);
                        } else {
                            // console.log(`Input field ${fieldId} has value: "${field.value}"`);
                        }
                        
                        // 特殊處理：檢查受試者代碼格式
                        if (fieldId === 'subjectCode' && field.value.trim() !== '') {
                            const subjectCodePattern = /^P[A-Za-z0-9]{2}-?[A-Za-z0-9]{4}$/;
                            if (!subjectCodePattern.test(field.value.trim())) {
                                isComplete = false;
                                missingFields.push(`subjectCode (invalid format: "${field.value}")`);
                                // console.log(`Subject code format invalid: "${field.value}"`);
                            } else {
                                // console.log(`Subject code format valid: "${field.value}"`);
                            }
                        }
                    }
                } else {
                    // console.log(`Field ${fieldId} not found in DOM`);
                    missingFields.push(`${fieldId} (field not found)`);
                    isComplete = false;
                }
            }
        });
        
        // console.log(`Data completeness check result: ${isComplete}`);
        if (!isComplete) {
            console.log('Missing or incomplete fields:', missingFields);
        } else {
            console.log('All required fields are complete!');
        }
        
        // 根據完整性自動勾選
        if (isComplete) {
            missingDataNoRadio.checked = true;
            console.log('Auto-selecting "否" for missing data');
        } else {
            missingDataRadio.checked = true;
            console.log('Auto-selecting "是" for missing data');
        }
        
        // 觸發change事件以更新詳細欄位顯示
        if (missingDataRadio.checked) {
            missingDataRadio.dispatchEvent(new Event('change'));
        } else if (missingDataNoRadio.checked) {
            missingDataNoRadio.dispatchEvent(new Event('change'));
        }
    }
}

// 控制排除條件詳細欄位的顯示/隱藏
function toggleExclusionDetails() {
    // 泌尿道異物種類名稱
    const urinaryForeignBodyRadio = document.querySelector('input[name="urinaryForeignBody"]:checked');
    const foreignBodyTypeSection = document.getElementById('foreignBodyTypeSection');
    
    if (foreignBodyTypeSection) {
        if (urinaryForeignBodyRadio && urinaryForeignBodyRadio.value === 'yes') {
            foreignBodyTypeSection.style.display = 'block';
        } else {
            foreignBodyTypeSection.style.display = 'none';
        }
    }
    
    // 非腎結石相關之泌尿道重大病變名稱
    const urinarySystemLesionRadio = document.querySelector('input[name="urinarySystemLesion"]:checked');
    const lesionTypeSection = document.getElementById('lesionTypeSection');
    
    if (lesionTypeSection) {
        if (urinarySystemLesionRadio && urinarySystemLesionRadio.value === 'yes') {
            lesionTypeSection.style.display = 'block';
        } else {
            lesionTypeSection.style.display = 'none';
        }
    }
    
    // 腎臟替代治療名稱
    const renalReplacementTherapyRadio = document.querySelector('input[name="renalReplacementTherapy"]:checked');
    const therapyTypeSection = document.getElementById('therapyTypeSection');
    
    if (therapyTypeSection) {
        if (renalReplacementTherapyRadio && renalReplacementTherapyRadio.value === 'yes') {
            therapyTypeSection.style.display = 'block';
        } else {
            therapyTypeSection.style.display = 'none';
        }
    }
    
    // 重大血液、免疫或惡性腫瘤疾病名稱
    const hematologicalDiseaseRadio = document.querySelector('input[name="hematologicalDisease"]:checked');
    const hematologicalDiseaseTypeSection = document.getElementById('hematologicalDiseaseTypeSection');
    
    if (hematologicalDiseaseTypeSection) {
        if (hematologicalDiseaseRadio && hematologicalDiseaseRadio.value === 'yes') {
            hematologicalDiseaseTypeSection.style.display = 'block';
        } else {
            hematologicalDiseaseTypeSection.style.display = 'none';
        }
    }
    
    // 罕見代謝性疾病名稱
    const rareMetabolicDiseaseRadio = document.querySelector('input[name="rareMetabolicDisease"]:checked');
    const metabolicDiseaseTypeSection = document.getElementById('metabolicDiseaseTypeSection');
    
    if (metabolicDiseaseTypeSection) {
        if (rareMetabolicDiseaseRadio && rareMetabolicDiseaseRadio.value === 'yes') {
            metabolicDiseaseTypeSection.style.display = 'block';
        } else {
            metabolicDiseaseTypeSection.style.display = 'none';
        }
    }
    
    // 試驗主持人認定不適合納入本研究之原因
    const piJudgmentRadio = document.querySelector('input[name="piJudgment"]:checked');
    const piJudgmentReasonSection = document.getElementById('piJudgmentReasonSection');
    
    if (piJudgmentReasonSection) {
        if (piJudgmentRadio && piJudgmentRadio.value === 'yes') {
            piJudgmentReasonSection.style.display = 'block';
        } else {
            piJudgmentReasonSection.style.display = 'none';
        }
    }
}

// DEBUG 模式開關
function toggleDebugMode() {
    const debugMode = document.getElementById('debugMode');
    if (debugMode && debugMode.checked) {
        fillDebugValues();
    }
}

// 填入 DEBUG 預設值
function fillDebugValues() {
    console.log('🐛 DEBUG 模式已啟用，正在填入預設值...');
    
    // 基本資料預設值
    const today = new Date().toISOString().split('T')[0];
    const debugValues = {
        'enrollDate': today,
        'subjectCode': 'P010002',
        'birthDate': '1990-01-01',
        'measureDate': today,
        'height': '170',
        'weight': '70',
        'biochemDate': today,
        'creatinine': '1.0',
        'egfr': '90.0',
        'bac': '0',
        'imgDate': today,
        'imgReadingReport': 'DEBUG: 影像檢查報告摘要',
        // 尿液檢驗資料
        'ph': '6.5',
        'sg': '1.020',
        'rbc': '2',
        'urineDate': today,
        'urinalysisDate': today
    };
    
    // 填入基本資料
    Object.keys(debugValues).forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.value = debugValues[id];
            // 觸發 change 事件以觸發相關計算
            element.dispatchEvent(new Event('change'));
        }
    });
    
    // 選擇性別（男性）
    const maleRadio = document.querySelector('input[name="gender"][value="1"]');
    if (maleRadio) {
        maleRadio.checked = true;
        maleRadio.dispatchEvent(new Event('change'));
    }
    
    // 選擇病史（無）
    const dmNoRadio = document.querySelector('input[name="dm"][value="0"]');
    const goutNoRadio = document.querySelector('input[name="gout"][value="0"]');
    if (dmNoRadio) {
        dmNoRadio.checked = true;
        dmNoRadio.dispatchEvent(new Event('change'));
    }
    if (goutNoRadio) {
        goutNoRadio.checked = true;
        goutNoRadio.dispatchEvent(new Event('change'));
    }
    
    // 選擇影像檢查類型（CT）
    const ctRadio = document.querySelector('input[name="imgType"][value="CT"]');
    if (ctRadio) {
        ctRadio.checked = true;
        ctRadio.dispatchEvent(new Event('change'));
    }
    
    // 選擇腎結石診斷（有）
    const stoneYesRadio = document.querySelector('input[name="stone"][value="1"]');
    if (stoneYesRadio) {
        stoneYesRadio.checked = true;
        stoneYesRadio.dispatchEvent(new Event('change'));
    }
    
    // 選擇菌尿症（否）
    const bacteriuriaNoRadio = document.querySelector('input[name="bacteriuria"][value="0"]');
    if (bacteriuriaNoRadio) {
        bacteriuriaNoRadio.checked = true;
        bacteriuriaNoRadio.dispatchEvent(new Event('change'));
    }
    
    // 選擇影像可見性（是）
    const visKidneyYesRadio = document.querySelector('input[name="visKidney"][value="yes"]');
    const visMidUreterYesRadio = document.querySelector('input[name="visMidUreter"][value="yes"]');
    const visLowerUreterYesRadio = document.querySelector('input[name="visLowerUreter"][value="yes"]');
    const noTxYesRadio = document.querySelector('input[name="noTx"][value="yes"]');
    
    if (visKidneyYesRadio) visKidneyYesRadio.checked = true;
    if (visMidUreterYesRadio) visMidUreterYesRadio.checked = true;
    if (visLowerUreterYesRadio) visLowerUreterYesRadio.checked = true;
    if (noTxYesRadio) noTxYesRadio.checked = true;
    
    // 納入條件全部勾選（全部為1）
    const inclusionCheckboxes = [
        'age18', 'hasGender', 'hasAge', 'hasBMI', 'hasDMHistory', 'hasGoutHistory',
        'hasEGFR', 'hasUrinePH', 'hasUrineSG', 'hasUrineRBC', 'hasBacteriuria',
        'labTimeWithin7', 'hasImagingData', 'imgLabWithin7'
    ];
    
    inclusionCheckboxes.forEach(id => {
        const checkbox = document.getElementById(id);
        if (checkbox) {
            checkbox.checked = true;
            checkbox.dispatchEvent(new Event('change'));
        }
    });
    
    // 排除條件全部選擇「否」（全部為0）
    const exclusionRadios = [
        'pregnantFemale', 'kidneyTransplant', 'urinaryForeignBody', 'urinarySystemLesion',
        'renalReplacementTherapy', 'missingData', 'hematologicalDisease', 'rareMetabolicDisease', 'piJudgment'
    ];
    
    exclusionRadios.forEach(name => {
        const noRadio = document.querySelector(`input[name="${name}"][value="no"]`);
        if (noRadio) {
            noRadio.checked = true;
            noRadio.dispatchEvent(new Event('change'));
        }
    });
    
    // 填入藥物和手術預設值
    fillDebugMedicationsAndSurgeries();
    
    console.log('✅ DEBUG 預設值填入完成！');
    console.log('📋 納入條件：全部為 1');
    console.log('❌ 排除條件：全部為 0');
    console.log('💊 藥物和手術：已填入預設值');
}

// 驗證藥物和手術資料完整性
function validateTreatmentData() {
    const noTreatment = document.querySelector('input[name="noTx"]:checked')?.value === 'yes';
    const drugList = document.getElementById('drugList');
    const surgList = document.getElementById('surgList');
    
    if (!noTreatment) {
        // 如果選擇「否」（有治療），檢查是否有藥物或手術資料
        const medications = collectMedications();
        const surgeries = collectSurgeries();
        
        if (medications.length === 0 && surgeries.length === 0) {
            // 顯示警告提示
            if (drugList) drugList.style.border = '2px solid #ff6b6b';
            if (surgList) surgList.style.border = '2px solid #ff6b6b';
            
            // 添加提示文字
            let warningMsg = drugList.querySelector('.warning-msg');
            if (!warningMsg) {
                warningMsg = document.createElement('div');
                warningMsg.className = 'warning-msg';
                warningMsg.style.color = '#ff6b6b';
                warningMsg.style.fontSize = '0.9em';
                warningMsg.style.marginTop = '5px';
                drugList.appendChild(warningMsg);
            }
            warningMsg.textContent = '⚠️ 請填寫至少一項藥物或手術資料';
            
            return false;
        } else {
            // 清除警告樣式
            if (drugList) drugList.style.border = '';
            if (surgList) surgList.style.border = '';
            
            // 移除警告文字
            const warningMsg = drugList.querySelector('.warning-msg');
            if (warningMsg) warningMsg.remove();
            
            return true;
        }
    } else {
        // 如果選擇「是」（無治療），清除警告樣式
        if (drugList) drugList.style.border = '';
        if (surgList) surgList.style.border = '';
        
        // 移除警告文字
        const warningMsg = drugList.querySelector('.warning-msg');
        if (warningMsg) warningMsg.remove();
        
        return true;
    }
}

// 填入藥物和手術的 DEBUG 預設值
function fillDebugMedicationsAndSurgeries() {
    // 檢查是否勾選「無任何治療處置紀錄」
    const noTreatment = document.querySelector('input[name="noTx"]:checked')?.value === 'yes';
    
    // 清空現有的藥物和手術列表
    const drugList = document.getElementById('drugList');
    const surgList = document.getElementById('surgList');
    
    if (drugList) drugList.innerHTML = '';
    if (surgList) surgList.innerHTML = '';
    
    // 如果勾選「是」（無治療），則不填入藥物和手術資料
    if (noTreatment) {
        console.log('🐛 DEBUG: 無治療處置紀錄，跳過藥物和手術預設值');
        return;
    }
    
    // 添加預設藥物
    const debugMedications = [
        { date: '2025-08-20', name: 'DEBUG藥物A' },
        { date: '2025-08-22', name: 'DEBUG藥物B' }
    ];
    
    debugMedications.forEach(med => {
        const wrap = document.createElement('div');
        wrap.className = 'row block fade-in';
        wrap.innerHTML = `
            <input type="date" aria-label="藥物開立日期" value="${med.date}" />
            <input type="text" placeholder="藥物名稱" value="${med.name}" />
            <button class="btn-ghost" type="button" onclick="removeItem(this)">刪除</button>
        `;
        drugList.appendChild(wrap);
    });
    
    // 添加預設手術
    const debugSurgeries = [
        { date: '2025-08-21', name: 'DEBUG手術A' }
    ];
    
    debugSurgeries.forEach(surg => {
        const wrap = document.createElement('div');
        wrap.className = 'row block fade-in';
        wrap.innerHTML = `
            <input type="date" aria-label="手術日期" value="${surg.date}" />
            <input type="text" placeholder="手術名稱" value="${surg.name}" />
            <button class="btn-ghost" type="button" onclick="removeItem(this)">刪除</button>
        `;
        surgList.appendChild(wrap);
    });
}
