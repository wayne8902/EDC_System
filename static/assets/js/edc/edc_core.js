// EDC 系統核心配置檔案
// 包含全域變數、角色配置和快速操作配置

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
        action: 'openDataBrowser'
    },
    'edc.data.edit': {
        title: '編輯資料',
        icon: 'fas fa-edit',
        color: 'btn-warning',
        action: 'openDataEditor'
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

// EDC 系統常數
const EDC_CONSTANTS = {
    // 驗證規則
    VALIDATION_RULES: {
        required: { required: true, message: '此欄位為必填' },
        number: { type: 'number', message: '請輸入有效數字' },
        integer: { type: 'integer', message: '請輸入整數' },
        positive: { min: 0, message: '請輸入正數' },
        nonNegative: { min: 0, message: '請輸入非負數' },
        range: (min, max) => ({ min, max, message: `請輸入 ${min} 到 ${max} 之間的數值` }),
        minLength: (min) => ({ minLength: min, message: `最少需要 ${min} 個字元` }),
        maxLength: (max) => ({ maxLength: max, message: `最多只能 ${max} 個字元` }),
        date: { type: 'date', message: '請輸入有效日期' },
        futureDate: { type: 'futureDate', message: '日期不能是未來日期' },
        pastDate: { type: 'pastDate', message: '日期不能是過去日期' }
    },
    
    // 預設值
    DEFAULTS: {
        pageSize: 20,
        autoSaveInterval: 30000,
        maxFileSize: 10 * 1024 * 1024, // 10MB
        maxRetryAttempts: 3
    },
    
    // 角色類型
    ROLE_TYPES: {
        SYSTEM_ADMIN: 'system_admin',
        SPONSOR: 'sponsor',
        RESEARCHER: 'researcher',
        INVESTIGATOR: 'investigator',
        MONITOR: 'monitor'
    },
    
    // 狀態
    STATUS: {
        ACTIVE: 'active',
        INACTIVE: 'inactive',
        PENDING: 'pending',
        APPROVED: 'approved',
        REJECTED: 'rejected'
    }
};

// 全域變數
let userRole = '';
let userPermissions = [];

// 匯出模組
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ROLE_CONFIG,
        QUICK_ACTIONS_CONFIG,
        EDC_CONSTANTS,
        userRole,
        userPermissions
    };
}
