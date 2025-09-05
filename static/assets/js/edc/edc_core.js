// EDC 系統核心配置檔案
// 包含全域變數、角色配置和快速操作配置

// 角色配置 - 集中管理所有角色的功能定義
const ROLE_CONFIG = {
    system_admin: {
        name: '系統管理員',
        color: '#dc3545',
        icon: 'fas fa-cogs'
    },
    sponsor: {
        name: '試驗委託者',
        color: '#28a745',
        icon: 'fas fa-eye'
    },
    researcher: {
        name: '研究人員',
        color: '#17a2b8',
        icon: 'fas fa-edit'
    },
    investigator: {
        name: '試驗主持人',
        color: '#ffc107',
        icon: 'fas fa-signature'
    },
    monitor: {
        name: '試驗監測者',
        color: '#6f42c1',
        icon: 'fas fa-search-plus'
    }
};

// 快速操作配置
const QUICK_ACTIONS_CONFIG = {
    'edc.system.admin': {
        title: '系統管理',
        icon: 'fas fa-cogs',
        color: 'btn-danger',
        action: 'openSystemManagement'
    },
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
    'edc.data.freeze': {
        title: '資料凍結',
        icon: 'fas fa-snowflake',
        color: 'btn-secondary',
        action: 'openDataFreeze'
    },
    'edc.query.view': {
        title: 'Query 查看',
        icon: 'fas fa-tasks',
        color: 'btn-info',
        action: 'openQueryManagement'
    },
    'edc.query.create': {
        title: 'Query 發起',
        icon: 'fas fa-question-circle',
        color: 'btn-warning',
        action: 'openQueryCreation'
    },
    'edc.query.response': {
        title: 'Query 回應',
        icon: 'fas fa-question-circle',
        color: 'btn-warning',
        action: 'openQueryResponse'
    },
    'edc.crf.sign': {
        title: '電子簽署',
        icon: 'fas fa-signature',
        color: 'btn-success',
        action: 'openDigitalSignature'
    }
};

// 匯出模組
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ROLE_CONFIG,
        QUICK_ACTIONS_CONFIG
    };
}
