// EDC 系統資料瀏覽功能檔案
// 包含資料查詢、篩選、顯示和匯出功能

/**
 * 資料瀏覽管理器
 */
const DataBrowserManager = {
    // 當前查詢條件
    currentFilters: {},

    // 當前頁面資料
    currentData: [],

    // 分頁設定
    pagination: {
        current_page: 1,
        page_size: 10,
        total_records: 0,
        total_pages: 0
    },

    // 排序設定
    sorting: {
        field: 'id',
        direction: 'DESC' // 'ASC' 或 'DESC'
    },



    /**
     * 檢查使用者是否有特定權限
     */
    hasPermission(permission) {
        // 檢查全域權限變數
        if (typeof userPermissions !== 'undefined' && Array.isArray(userPermissions)) {
            return userPermissions.includes(permission);
        }
        return false;
    },

    /**
     * 檢查使用者是否有編輯權限
     */
    hasEditPermission() {
        return this.hasPermission('edc.data.edit');
    },

    hasSignPermission() {
        return this.hasPermission('edc.crf.sign');
    },

    /**
     * 檢查受試者狀態是否允許編輯
     * @param {Object} subject - 受試者資料對象
     * @returns {boolean} - 是否允許編輯
     */
    canEditByStatus(subject) {
        if (!subject || !subject.status) {
            return true; // 如果沒有狀態資訊，預設允許編輯
        }

        const status = subject.status.toLowerCase();
        // 'submitted'、'signed' 和 'frozen' 狀態不能編輯，其他狀態（包括 'query'）都可以編輯
        return status !== 'submitted' && status !== 'signed' && status !== 'frozen';
    },

    /**
     * 檢查是否可以顯示編輯按鈕（結合權限、狀態和建立者檢查）
     * @param {Object} subject - 受試者資料對象
     * @returns {boolean} - 是否可以顯示編輯按鈕
     */
    canShowEditButton(subject) {
        // 基本權限和狀態檢查
        if (!this.hasEditPermission() || !this.canEditByStatus(subject)) {
            return false;
        }

        // 檢查使用者角色
        if (this.isInvestigator()) {
            // 試驗主持人可以編輯所有資料
            return true;
        } else {
            // 非試驗主持人只能編輯自己建立的資料
            const currentUserId = this.getCurrentUserId();
            return subject.created_by === currentUserId;
        }
    },

    canUnsign(subject) {
        // 基本權限和狀態檢查
        if (!this.hasSignPermission() || subject.status !== 'signed') {
            return false;
        }
    
        // 檢查使用者角色
        if (this.isInvestigator()) {
            // 試驗主持人可以取消所有已簽署的資料
            return true;
        } else {
            // 非試驗主持人只能取消自己簽署的資料
            const currentUserId = this.getCurrentUserId();
            return subject.signed_by === currentUserId;
        }
    },

    /**
     * 檢查是否為試驗主持人
     * @returns {boolean} - 是否為試驗主持人
     */
    isInvestigator() {
        return typeof userRole !== 'undefined' && userRole === 'investigator';
    },

    /**
     * 檢查是否為試驗監測者
     * @returns {boolean} - 是否為試驗監測者
     */
    isMonitor() {
        return typeof userRole !== 'undefined' && userRole === 'monitor';
    },

    /**
     * 檢查是否可以發起 Query
     * @returns {boolean} - 是否可以發起 Query
     */
    canCreateQuery(subject = null) {
        // 基本權限檢查
        if (!this.isMonitor() || !this.hasPermission('edc.query.create')) {
            return false;
        }
        
        // 如果提供了受試者資料，檢查狀態
        if (subject && subject.status === 'frozen') {
            return false;
        }
        
        return true;
    },

    /**
     * 檢查是否可以查看 Query
     * @returns {boolean} - 是否可以查看 Query
     */
    canViewQuery() {
        return this.hasPermission('edc.query.view');
    },

    /**
     * 檢查是否可以回應 Query
     * @param {Object} subject - 受試者資料對象
     * @returns {boolean} - 是否可以回應 Query
     */
    canRespondToQuery(subject = null) {
        if (!this.hasPermission('edc.query.response')) {
            return false;
        }
        if (subject) {
            const currentUserId = this.getCurrentUserId();
            return subject.created_by === currentUserId;
        }
        
        return true;
    },

    /**
     * 檢查是否可以凍結資料
     * @returns {boolean} - 是否可以凍結資料
     */
    canFreezeData() {
        return this.hasPermission('edc.data.freeze');
    },

    /**
     * 檢查是否可以完成 Query
     * @param {Object} subject - 受試者資料對象
     * @returns {boolean} - 是否可以完成 Query
     */
    canCompleteQuery(query = null) {
        if (!this.hasPermission('edc.query.create')) {
            return false;
        }
        if (query) {
            const currentUserId = this.getCurrentUserId();
            return query.created_by === currentUserId;
        }
        
        return true;
    },

    /**
     * 取得回應類型的中文文字
     * @param {string} responseType - 回應類型
     * @returns {string} - 中文文字
     */
    getResponseTypeText(responseType) {
        const typeMap = {
            'clarification': '說明',
            'correction': '修正',
            'no_action': '接受',
            'escalation': '拒絕'
        };
        return typeMap[responseType] || responseType;
    },

    /**
     * 取得回應類型的顏色
     * @param {string} responseType - 回應類型
     * @returns {string} - 顏色代碼
     */
    getResponseTypeColor(responseType) {
        const colorMap = {
            'clarification': '#17a2b8', // 藍色
            'correction': '#ffc107',    // 黃色
            'no_action': '#28a745',     // 綠色
            'escalation': '#dc3545'     // 紅色
        };
        return colorMap[responseType] || '#6c757d';
    },

    /**
     * 取得回應狀態的中文文字
     * @param {string} status - 狀態
     * @returns {string} - 中文文字
     */
    getResponseStatusText(status) {
        const statusMap = {
            'open': '開啟',
            'responded': '已回應',
            'resolved': '已解決',
            'closed': '已關閉'
        };
        return statusMap[status] || status;
    },

    /**
     * 載入 Query 的回應資料
     * @param {string} batchId - 批次ID
     * @returns {Promise<Array>} - 回應資料陣列
     */
    async loadQueryResponses(batchId) {
        try {
            const response = await fetch(`/edc/query/${batchId}/responses`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            if (result.success) {
                return result.data || [];
            } else {
                console.error('載入回應資料失敗:', result.message);
                return [];
            }
        } catch (error) {
            console.error('載入回應資料時發生錯誤:', error);
            return [];
        }
    },

    /**
     * 驗證詳細資料表單
     * @param {HTMLElement} form - 表單元素
     * @returns {boolean} - 驗證是否通過
     */
    validateDetailForm(form) {
        // 直接重用新增資料的驗證邏輯
        if (typeof DataEntryManager !== 'undefined' && DataEntryManager.validateForm) {
            const isValid = DataEntryManager.validateForm(form);
            if (!isValid) {
                return false;  // 驗證失敗，直接返回 false
            }
        }
        return true;
    },

    /**
     * 顯示驗證錯誤
     * @param {Array} errors - 錯誤訊息陣列
     */
    showValidationErrors(errors) {
        const errorMessage = errors.join('\n');
        alert('表單驗證失敗：\n' + errorMessage);
    },

    /**
     * 驗證單一欄位
     * @param {HTMLElement} field - 欄位元素
     */
    validateField(field) {
        // 移除之前的錯誤樣式
        field.classList.remove('is-invalid');
        
        // 基本驗證
        if (field.hasAttribute('required') && !field.value.trim()) {
            field.classList.add('is-invalid');
            return false;
        }
        
        // 格式驗證
        if (field.hasAttribute('pattern')) {
            const pattern = new RegExp(field.getAttribute('pattern'));
            if (field.value && !pattern.test(field.value)) {
                field.classList.add('is-invalid');
                return false;
            }
        }
        
        // 數值範圍驗證
        if (field.type === 'number') {
            const min = field.getAttribute('min');
            const max = field.getAttribute('max');
            const value = parseFloat(field.value);
            
            if (field.value && !isNaN(value)) {
                if (min && value < parseFloat(min)) {
                    field.classList.add('is-invalid');
                    return false;
                }
                if (max && value > parseFloat(max)) {
                    field.classList.add('is-invalid');
                    return false;
                }
            }
        }
        
        return true;
    },

    /**
     * 獲取當前使用者 ID
     * @returns {string} - 當前使用者 ID
     */
    getCurrentUserId() {
        return getCookie('unique_id');
    },

    /**
     * 載入受試者的 Query 資料
     * @param {string} subjectCode - 受試者編號
     * @returns {Promise<Array>} - Query 列表
     */
    async loadQueries(subjectCode) {
        try {
            const response = await fetch(`/edc/query/list/${subjectCode}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const result = await response.json();
            
            if (result.success) {
                return result.data || [];
            } else {
                console.error('載入 Query 失敗:', result.message);
                throw new Error(result.message || '載入 Query 失敗');
            }
        } catch (error) {
            console.error('載入 Query 時發生錯誤:', error);
            throw error;
        }
    },


    /**
     * 獲取 Query 狀態樣式類別
     * @param {string} status - Query 狀態
     * @returns {string} - CSS 類別
     */
    getQueryStatusClass(status) {
        switch (status) {
            case 'pending':
                return 'badge-warning';
            case 'accept':
                return 'badge-success';
            case 'reject':
                return 'badge-danger';
            case 'correct':
                return 'badge-warning';
            case 'explain':
                return 'badge-info';
            case 'completed':
                return 'badge-primary';
            default:
                return 'badge-light';
        }
    },

    /**
     * 獲取 Query 狀態文字
     * @param {string} status - Query 狀態
     * @returns {string} - 狀態文字
     */
    getQueryStatusText(status) {
        switch (status) {
            case 'pending':
                return '待回應';
            case 'accept':
                return '已接受';
            case 'reject':
                return '已拒絕';
            case 'correct':
                return '已修正';
            case 'explain':
                return '已說明';
            case 'completed':
                return '已完成';
            default:
                return '未知';
        }
    },

    /**
     * 獲取 Query 類型文字
     * @param {string} type - Query 類型
     * @returns {string} - 類型文字
     */
    getQueryTypeText(type) {
        switch (type) {
            case 'clarification':
                return '澄清';
            case 'verification':
                return '驗證';
            case 'correction':
                return '修正';
            default:
                return type || '未知';
        }
    },

    /**
     * 獲取表格名稱文字
     * @param {string} tableName - 表格名稱
     * @returns {string} - 表格中文名稱
     */
    getTableNameText(tableName) {
        const tableNameMap = {
            'subjects': '基本資料',
            'inclusion_criteria': '納入條件',
            'exclusion_criteria': '排除條件'
        };
        return tableNameMap[tableName] || tableName;
    },

    /**
     * 初始化資料瀏覽器
     */
    async init() {
        if (this.isInitialized) {
            this.setupFilters();
            this.setupFilterControls();
            this.loadInitialData();
            return;
        }
        this.setupEventListeners();
        this.setupFilters();
        this.setupFilterControls();
        this.loadInitialData();

        // 初始化資料編輯器
        if (typeof DataEditorManager !== 'undefined') {
            DataEditorManager.init();
        }

        this.isInitialized = true;
    },

    /**
     * 設置事件監聽器
     */
    setupEventListeners() {
        // 搜尋按鈕
        const searchBtn = document.getElementById('dataSearchBtn');
        if (searchBtn) {
            searchBtn.addEventListener('click', () => this.performSearch());
        }

        // 重置按鈕
        const resetBtn = document.getElementById('dataResetBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetFilters());
        }

        // 匯出按鈕
        const exportBtn = document.getElementById('dataExportBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportData());
        }

        // 分頁事件
        this.setupPaginationEvents();

        // 排序事件
        this.setupSortingEvents();

        // 篩選器事件
        this.setupFilterEvents();
    },

    /**
     * 設置分頁事件
     */
    setupPaginationEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('page-link')) {
                e.preventDefault();
                const page = parseInt(e.target.dataset.page);
                if (page && page !== this.pagination.current_page) {
                    this.goToPage(page);
                }
            }
        });
    },

    /**
     * 設置排序事件
     */
    setupSortingEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('sortable-header')) {
                const field = e.target.dataset.field;
                if (field) {
                    this.toggleSort(field);
                }
            }
        });
    },

    /**
     * 設置篩選器事件
     */
    setupFilterEvents() {
        // 日期範圍篩選器
        const dateFromInput = document.getElementById('dateFrom');
        const dateToInput = document.getElementById('dateTo');

        if (dateFromInput) {
            dateFromInput.addEventListener('change', () => this.updateFilters());
        }
        if (dateToInput) {
            dateToInput.addEventListener('change', () => this.updateFilters());
        }

        // 數值範圍篩選器
        const ageMinInput = document.getElementById('ageMin');
        const ageMaxInput = document.getElementById('ageMax');
        const bmiMinInput = document.getElementById('bmiMin');
        const bmiMaxInput = document.getElementById('bmiMax');

        if (ageMinInput) ageMinInput.addEventListener('change', () => this.updateFilters());
        if (ageMaxInput) ageMaxInput.addEventListener('change', () => this.updateFilters());
        if (bmiMinInput) bmiMinInput.addEventListener('change', () => this.updateFilters());
        if (bmiMaxInput) bmiMaxInput.addEventListener('change', () => this.updateFilters());

        // 下拉選單篩選器
        const riskScoreSelect = document.getElementById('riskScoreFilter');
        const genderSelect = document.getElementById('genderFilter');
        const statusSelect = document.getElementById('statusFilter');
        const imagingTypeSelect = document.getElementById('imagingTypeFilter');
        const stoneDiagnosisSelect = document.getElementById('stoneDiagnosisFilter');
        const dmSelect = document.getElementById('dmFilter');
        const goutSelect = document.getElementById('goutFilter');
        const bacSelect = document.getElementById('bacFilter');

        if (riskScoreSelect) riskScoreSelect.addEventListener('change', () => this.updateFilters());
        if (genderSelect) genderSelect.addEventListener('change', () => this.updateFilters());
        if (statusSelect) statusSelect.addEventListener('change', () => this.updateFilters());
        if (imagingTypeSelect) imagingTypeSelect.addEventListener('change', () => this.updateFilters());
        if (stoneDiagnosisSelect) stoneDiagnosisSelect.addEventListener('change', () => this.updateFilters());
        if (dmSelect) dmSelect.addEventListener('change', () => this.updateFilters());
        if (goutSelect) goutSelect.addEventListener('change', () => this.updateFilters());
        if (bacSelect) bacSelect.addEventListener('change', () => this.updateFilters());

        // 文字輸入篩選器
        const subjectCodeInput = document.getElementById('subjectCodeFilter');
        const createdByInput = document.getElementById('createdByFilter');

        if (subjectCodeInput) subjectCodeInput.addEventListener('input', () => this.updateFilters());
        if (createdByInput) createdByInput.addEventListener('input', () => this.updateFilters());
    },

    /**
     * 設置篩選器控制功能
     */
    setupFilterControls() {
        // 進階篩選器摺疊功能
        const toggleBtn = document.getElementById('toggleAdvancedFilters');
        const advancedFilters = document.getElementById('advancedFilters');
        
        if (toggleBtn && advancedFilters) {
            toggleBtn.addEventListener('click', () => {
                const isHidden = advancedFilters.style.display === 'none' || advancedFilters.style.display === '';
                advancedFilters.style.display = isHidden ? 'block' : 'none';
                
                const icon = toggleBtn.querySelector('i');
                if (icon) {
                    icon.className = isHidden ? 'fas fa-chevron-up' : 'fas fa-chevron-down';
                }
                
                toggleBtn.textContent = isHidden ? ' 隱藏進階篩選' : ' 進階篩選';
            });
        }

        // 即時搜尋功能
        const filterInputs = document.querySelectorAll('.filter-input, .filter-select');
        filterInputs.forEach(input => {
            input.addEventListener('input', () => {
                // 延遲搜尋，避免頻繁請求
                clearTimeout(this.searchTimeout);
                this.searchTimeout = setTimeout(() => {
                    this.performSearch();
                }, 500);
            });
        });
    },

    /**
     * 設置篩選器
     */
    setupFilters() {
        // 設置日期範圍篩選器的預設值
        const EndDay = new Date();
        const StartDay = new Date(EndDay.getTime() - (30 * 24 * 60 * 60 * 1000));

        // 使用本地時區格式化日期
        const formatDate = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        const dateFromInput = document.getElementById('dateFrom');
        const dateToInput = document.getElementById('dateTo');

        if (dateFromInput) {
            dateFromInput.value = '';
        }
        if (dateToInput) {
            dateToInput.value = formatDate(EndDay);
        }

        // 初始化篩選條件
        this.updateFilters();
    },

    /**
     * 更新篩選條件
     */
    updateFilters() {
        this.currentFilters = {};

        // 受試者編號
        const subjectCodeInput = document.getElementById('subjectCodeFilter');
        if (subjectCodeInput && subjectCodeInput.value.trim()) {
            this.currentFilters.subject_code = subjectCodeInput.value.trim();
        }

        // iStone 結果
        const riskScoreSelect = document.getElementById('riskScoreFilter');
        if (riskScoreSelect && riskScoreSelect.value !== '') {
            this.currentFilters.risk_score = parseInt(riskScoreSelect.value);
        }

        // 性別
        const genderSelect = document.getElementById('genderFilter');
        if (genderSelect && genderSelect.value !== '') {
            this.currentFilters.gender = parseInt(genderSelect.value);
        }

        // 狀態
        const statusSelect = document.getElementById('statusFilter');
        if (statusSelect && statusSelect.value !== '') {
            this.currentFilters.status = statusSelect.value;
        }

        // 建立者
        const createdByInput = document.getElementById('createdByFilter');
        if (createdByInput && createdByInput.value.trim()) {
            this.currentFilters.created_by = createdByInput.value.trim();
        }

        // 年齡範圍
        const ageMinInput = document.getElementById('ageMin');
        const ageMaxInput = document.getElementById('ageMax');
        if (ageMinInput && ageMinInput.value.trim()) {
            this.currentFilters.age_min = parseInt(ageMinInput.value);
        }
        if (ageMaxInput && ageMaxInput.value.trim()) {
            this.currentFilters.age_max = parseInt(ageMaxInput.value);
        }

        // BMI 範圍
        const bmiMinInput = document.getElementById('bmiMin');
        const bmiMaxInput = document.getElementById('bmiMax');
        if (bmiMinInput && bmiMinInput.value.trim()) {
            this.currentFilters.bmi_min = parseFloat(bmiMinInput.value);
        }
        if (bmiMaxInput && bmiMaxInput.value.trim()) {
            this.currentFilters.bmi_max = parseFloat(bmiMaxInput.value);
        }

        // 血清肌酸酐範圍
        const scrMinInput = document.getElementById('scrMin');
        const scrMaxInput = document.getElementById('scrMax');
        if (scrMinInput && scrMinInput.value.trim()) {
            this.currentFilters.scr_min = parseFloat(scrMinInput.value);
        }
        if (scrMaxInput && scrMaxInput.value.trim()) {
            this.currentFilters.scr_max = parseFloat(scrMaxInput.value);
        }

        // eGFR 範圍
        const egfrMinInput = document.getElementById('egfrMin');
        const egfrMaxInput = document.getElementById('egfrMax');
        if (egfrMinInput && egfrMinInput.value.trim()) {
            this.currentFilters.egfr_min = parseFloat(egfrMinInput.value);
        }
        if (egfrMaxInput && egfrMaxInput.value.trim()) {
            this.currentFilters.egfr_max = parseFloat(egfrMaxInput.value);
        }

        // 影像檢查類型
        const imagingTypeSelect = document.getElementById('imagingTypeFilter');
        if (imagingTypeSelect && imagingTypeSelect.value !== '') {
            this.currentFilters.imaging_type = imagingTypeSelect.value;
        }

        // 腎結石診斷
        const stoneDiagnosisSelect = document.getElementById('stoneDiagnosisFilter');
        if (stoneDiagnosisSelect && stoneDiagnosisSelect.value !== '') {
            this.currentFilters.kidney_stone_diagnosis = parseInt(stoneDiagnosisSelect.value);
        }

        // 日期範圍
        const dateFromInput = document.getElementById('dateFrom');
        const dateToInput = document.getElementById('dateTo');
        if (dateFromInput && dateFromInput.value) {
            this.currentFilters.date_from = dateFromInput.value;
        }
        if (dateToInput && dateToInput.value) {
            this.currentFilters.date_to = dateToInput.value;
        }

        // 病史
        const dmSelect = document.getElementById('dmFilter');
        const goutSelect = document.getElementById('goutFilter');
        const bacSelect = document.getElementById('bacFilter');

        if (dmSelect && dmSelect.value !== '') {
            this.currentFilters.dm = parseInt(dmSelect.value);
        }
        if (goutSelect && goutSelect.value !== '') {
            this.currentFilters.gout = parseInt(goutSelect.value);
        }
        if (bacSelect && bacSelect.value !== '') {
            this.currentFilters.bac = parseInt(bacSelect.value);
        }
    },

    // 載入初始資料
    async loadInitialData() {
        await this.performSearch();
    },

    // 執行進階搜尋
    async performSearch() {

        this.updateFilters();

        try {
            const response = await fetch('/edc/search-subjects-advanced', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    filters: this.currentFilters,
                    page: this.pagination.current_page,
                    page_size: this.pagination.page_size,
                    sort_field: this.sorting.field,
                    sort_direction: this.sorting.direction
                })
            });

            const result = await response.json();

            if (result.success) {
                this.currentData = result.data;
                this.pagination = result.pagination;
                this.displayData();
                this.displayPagination();
            } else {
                showErrorMessage('錯誤: ' + (result.message || '搜尋失敗'));
            }
        } catch (error) {
            console.error('搜尋失敗:', error);
            showErrorMessage('錯誤: 搜尋失敗: ' + error.message);
        }
    },

    /**
     * 顯示資料
     */
    displayData() {
        const tableBody = document.getElementById('dataTableBody');
        if (!tableBody) return;

        tableBody.innerHTML = '';

        if (this.currentData.length === 0) {
            const noDataRow = document.createElement('tr');
            noDataRow.innerHTML = '<td colspan="6" class="text-center">沒有找到符合條件的資料</td>';
            tableBody.appendChild(noDataRow);
            return;
        }
        // console.log(this.currentData);
        this.currentData.forEach(subject => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${subject.subject_code || ''}</td>
                <td>${subject.risk_score === 1 ? '<span style="color: #DC3545 ;">陽性</span>' : subject.risk_score === 0 ? '<span style="color: #28A745;">陰性</span>' : ''}</td>
                <td>${subject.age || ''}</td>
                <td>${subject.gender === 1 ? '男' : '女'}</td>
                <td>${subject.created_at || ''}</td>
                <td>${subject.created_by || ''}</td>
                <td>
                    <span class="status-badge status-${subject.status || 'draft'}">
                        ${subject.status || 'draft'}
                    </span>
                </td>
                <td>
                    <button class="btn-ghost" onclick="DataBrowserManager.viewDetails('${subject.subject_code}')">
                        詳細資料
                    </button>
                    ${this.canShowEditButton(subject) ? `
                        <button class="btn-ghost" onclick="DataBrowserManager.editSubject('${subject.subject_code}')">
                            編輯
                        </button>
                    ` : ''}
                    ${this.canUnsign(subject) ? `
                        <button class="btn-ghost" onclick="DataBrowserManager.unsignSubject('${subject.subject_code}')">
                            取消簽署
                        </button>
                    ` : ''}
                </td>
            `;
            tableBody.appendChild(row);
        });
    },

    /**
     * 顯示分頁
     */
    displayPagination() {
        const paginationContainer = document.getElementById('paginationContainer');
        if (!paginationContainer) return;
        
        if (this.pagination.total_pages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }

        let paginationHTML = '';

        // 上一頁
        if (this.pagination.current_page > 1) {
            paginationHTML += `
                <button class="page-btn" data-page="${this.pagination.current_page - 1}">上一頁</button>
            `;
        }

        // 頁碼
        const startPage = Math.max(1, this.pagination.current_page - 2);
        const endPage = Math.min(this.pagination.total_pages, this.pagination.current_page + 2);

        for (let i = startPage; i <= endPage; i++) {
            const activeClass = i === this.pagination.current_page ? 'active' : '';
            paginationHTML += `
                <button class="page-btn ${activeClass}" data-page="${i}">${i}</button>
            `;
        }

        // 下一頁
        if (this.pagination.current_page < this.pagination.total_pages) {
            paginationHTML += `
                <button class="page-btn" data-page="${this.pagination.current_page + 1}">下一頁</button>
            `;
        }

        // 顯示分頁資訊
        paginationHTML += `
            <div class="pagination-info">
                <small class="hint">
                    第 ${this.pagination.current_page} 頁，共 ${this.pagination.total_pages} 頁，
                    總計 ${this.pagination.total_records} 筆記錄
                </small>
            </div>
        `;

        paginationContainer.innerHTML = paginationHTML;

        // 添加分頁按鈕事件
        const pageButtons = paginationContainer.querySelectorAll('.page-btn');
        pageButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const page = parseInt(e.target.dataset.page);
                if (page && page !== this.pagination.current_page) {
                    this.goToPage(page);
                }
            });
        });
    },

    /**
     * 前往指定頁面
     */
    goToPage(page) {
        this.pagination.current_page = page;
        this.performSearch();
    },

    /**
     * 切換排序
     */
    toggleSort(field) {
        if (this.sorting.field === field) {
            this.sorting.direction = this.sorting.direction === 'ASC' ? 'DESC' : 'ASC';
        } else {
            this.sorting.field = field;
            this.sorting.direction = 'ASC';
        }

        this.performSearch();
    },

    /**
     * 重置篩選器
     */
    resetFilters() {
        // 重置所有篩選器輸入
        const inputs = document.querySelectorAll('#basicFilters input, #basicFilters select, #advancedFilters input, #advancedFilters select');
        inputs.forEach(input => {
            if (input.type === 'text' || input.type === 'number') {
                input.value = '';
            } else if (input.type === 'select-one') {
                input.selectedIndex = 0;
            }
        });

        // 重置日期範圍為預設值
        const EndDay = new Date();
        const StartDay = new Date(EndDay.getTime() - (30 * 24 * 60 * 60 * 1000));

        // 使用本地時區格式化日期
        const formatDate = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        const dateFromInput = document.getElementById('dateFrom');
        const dateToInput = document.getElementById('dateTo');

        if (dateFromInput) {
            dateFromInput.value = '';
        }
        if (dateToInput) {
            dateToInput.value = formatDate(EndDay);
        }

        // 重置分頁和排序
        this.pagination.currentPage = 1;
        this.sorting.field = 'subject_code';
        this.sorting.direction = 'DESC';

        // 清空篩選條件並重新搜尋
        this.currentFilters = {};
        this.performSearch();
    },

    /**
     * 匯出資料
     */
    async exportData() {
        try {
            const response = await fetch('/edc/export-subjects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    filters: this.currentFilters,
                    format: 'csv'
                })
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `subjects_export_${new Date().toISOString().slice(0, 10)}.csv`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);

                showSuccessMessage('資料匯出成功！');
            } else {
                const result = await response.json();
                showErrorMessage('錯誤: ' + (result.message || '匯出失敗'));
            }
        } catch (error) {
            console.error('匯出失敗:', error);
            showErrorMessage('錯誤: 匯出失敗: ' + error.message);
        }
    },

    // 查看詳細資料
    viewDetails(subjectCode) {
        setTimeout(() => {
            this.fetchSubjectDetails(subjectCode);
        }, 200);
        
        
        // 同時更新 URL（如果路由器可用）
        if (typeof frontendRouter !== 'undefined') {
            // 只更新 URL，不觸發路由處理
            const newPath = `/edc/browser/${subjectCode}`;
            if (window.location.pathname !== newPath) {
                window.history.pushState({}, '', newPath);
            }
        }
    },

    // 獲取受試者詳細資料
    async fetchSubjectDetails(subjectCode) {
        try {
            // 顯示載入狀態


            // 調用後台API
            const response = await fetch(`/edc/subject-detail-id/${subjectCode}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'same-origin' // 包含cookies
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                this.showSubjectDetailBlock(result.data); // 顯示詳細資料區塊
                showSuccessMessage(`成功獲取受試者 ${subjectCode} 的詳細資料`);
            } else {
                // 顯示錯誤訊息
                showErrorMessage('錯誤: ' + (result.message || '獲取詳細資料失敗'));
            }

        } catch (error) {
            console.error('獲取詳細資料時發生錯誤:', error);
            showErrorMessage('錯誤: 獲取詳細資料失敗: ' + error.message);
        }
    },

    /**
     * 編輯受試者資料
     */
    editSubject(subjectCode) {
        // 檢查編輯權限
        if (!this.hasEditPermission()) {
            showErrorMessage('您沒有編輯權限');
            return;
        }

        // 檢查受試者狀態是否允許編輯
        const subject = this.currentData.find(s => s.subject_code === subjectCode);
        if (!subject) {
            showErrorMessage('找不到指定的受試者資料');
            return;
        }

        if (!this.canShowEditButton(subject)) {
            showErrorMessage('此受試者資料已提交或簽署，無法編輯');
            return;
        }
        setTimeout(() => {}, 500);
        // 先載入詳細資料，然後切換到編輯模式
        this.viewDetails(subjectCode);
        
        // 等待頁面載入完成後切換到編輯模式
        setTimeout(() => {
            if (typeof DataEditorManager !== 'undefined') {
                DataEditorManager.switchToEditMode();
                showSuccessMessage(`已進入編輯模式 - 受試者 ${subjectCode}`);
            } else {
                showErrorMessage('資料編輯器未載入，請重新整理頁面');
            }
        }, 1000);
    },

    /**
     * 添加取消簽署功能
     */
    async unsignSubject(subjectCode) {
        if (!confirm(`確定要取消受試者 ${subjectCode} 的電子簽署嗎？`)) {
            return;
        }
        
        try {
            const response = await fetch('/edc/unsign-subject', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    subject_code: subjectCode,
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                showSuccessMessage('取消簽署成功');
                this.performSearch(); // 重新載入資料
                
                // 執行 openDataBrowser
                if (typeof openDataBrowser === 'function') {
                    openDataBrowser();
                }
            } else {
                showErrorMessage('取消簽署失敗: ' + result.message);
            }
        } catch (error) {
            console.error('取消簽署失敗:', error);
            showErrorMessage('取消簽署失敗: ' + error.message);
        }
    },

    /**
     * 返回資料瀏覽器
     */
    returnToBrowser() {
        // 重新載入資料瀏覽器
        this.loadInitialData();
    },

    /**
     * 發起 Query
     * @param {string} subjectCode - 受試者編號
     */
    createQuery(subjectCode) {
        // 檢查發起 Query 的權限
        if (!this.canCreateQuery()) {
            alert('您沒有發起 Query 的權限');
            return;
        }

        // 檢查受試者編號
        if (!subjectCode) {
            alert('無效的受試者編號');
            return;
        }

        // 使用 QueryManager 顯示 Query 發起彈出視窗
        if (typeof QueryManager !== 'undefined' && typeof QueryManager.showQueryModal === 'function') {
            QueryManager.showQueryModal(subjectCode);
        } else {
            // 備用方案：顯示提示訊息
            alert(`準備為受試者 ${subjectCode} 發起 Query\n\nQueryManager 尚未載入，請確認 edc_data_query.js 已正確載入`);
        }
    },

    /**
     * 凍結資料
     * @param {string} subjectCode - 受試者編號
     */
    freezeData(subjectCode) {
        // 檢查凍結資料的權限
        if (!this.canFreezeData()) {
            alert('您沒有凍結資料的權限');
            return;
        }

        // 檢查受試者編號
        if (!subjectCode) {
            alert('無效的受試者編號');
            return;
        }

        // 確認凍結操作
        if (!confirm(`確定要凍結受試者 ${subjectCode} 的資料嗎？\n\n凍結後資料將變為唯讀，無法再進行修改。`)) {
            return;
        }

        // 調用後端 API 凍結資料
        this.callFreezeDataAPI(subjectCode);
    },

    /**
     * 調用後端 API 凍結資料
     * @param {string} subjectCode - 受試者編號
     */
    callFreezeDataAPI(subjectCode) {
        fetch(`/edc/freeze/${subjectCode}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                subject_code: subjectCode,
                frozen_by: this.getCurrentUserId()
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showSuccessMessage(`成功凍結受試者 ${subjectCode} 的資料！`);
                // 重新載入資料瀏覽器
                if (typeof openDataBrowser === 'function') {
                    openDataBrowser();
                }
            } else {
                showErrorMessage('凍結失敗：' + data.message);
            }
        })
        .catch(error => {
            console.error('凍結資料 API 調用失敗:', error);
            showErrorMessage('凍結失敗，請稍後再試');
        });
    },

    /**
     * 顯示受試者詳細資料區塊
     */
    async showSubjectDetailBlock(data) {
        const mainContent = document.getElementById('mainContent');
        if (!mainContent) return;

        try {
            // 創建詳細資料頁面
            const detailPage = await this.createSubjectDetailPage(data);

            // 替換主內容區域
            mainContent.innerHTML = detailPage;
            setTimeout(() => {}, 1000);
            // 初始化頁籤切換功能
            this.initializeTabSwitching();
            setTimeout(() => {}, 1000);
            // 載入歷程記錄
            this.loadSubjectHistory(data.subject?.subject_code);
            setTimeout(() => {}, 1000);
            // 載入 Query 紀錄
            this.loadQuerySection(data.subject?.subject_code, data.subject);
        } catch (error) {
            console.error('創建詳細資料頁面失敗:', error);
        }
    },

    /**
     * 初始化頁籤切換功能
     */
    initializeTabSwitching() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.getAttribute('data-tab');
                
                // 移除所有 active 狀態
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                // 添加 active 狀態到選中的頁籤
                button.classList.add('active');
                document.getElementById(`${targetTab}-tab`).classList.add('active');
            });
        });
    },

    /**
     * 創建受試者詳細資料頁面
     */
    async createSubjectDetailPage(data) {
        // 使用動態生成器創建頁面
        if (typeof dataBrowserGenerator !== 'undefined') {
            try {
                const result = await dataBrowserGenerator.generateSubjectDetailPage(data);
                return result;
            } catch (error) {
                console.error('動態生成器執行失敗:', error);
                return this.createDefaultSubjectDetailPage(data);
            }
        } else {
            // 如果生成器未載入，使用預設方法
            return this.createDefaultSubjectDetailPage(data);
        }
    },

    /**
     * 創建預設的受試者詳細資料頁面（備用方法）
     */
    createDefaultSubjectDetailPage(data) {
        const subject = data.subject;
        const inclusion = data.inclusion_criteria;
        const exclusion = data.exclusion_criteria;

        return `
            <div class="wrap">
                <section class="card col-12 fade-in">
                    <h2><i class="fas fa-user"></i> 受試者詳細資料</h2>
                    <p class="text-muted">受試者編號: ${subject?.subject_code || 'N/A'}</p>
                    <div style="display: flex; gap: 10px;">
                        <button class="btn btn-secondary" onclick="DataBrowserManager.backToDataBrowser()">
                            <i class="fas fa-arrow-left"></i> 返回資料瀏覽
                        </button>
                        ${this.canShowEditButton(subject) ? `
                        <button class="btn btn-primary" onclick="DataEditorManager.switchToEditMode()">
                            <i class="fas fa-edit"></i> 編輯模式
                        </button>
                        ` : ''}
                        ${this.canCreateQuery(subject) ? `
                        <button class="btn btn-warning" onclick="DataBrowserManager.createQuery('${subject?.subject_code || ''}')">
                            <i class="fas fa-question-circle"></i> 發起 Query
                        </button>
                        ` : ''}
                    </div>
                </section>
                <div class="card fade-in">
                    <h3>基本資料</h3>
                    <p>受試者編號: ${subject?.subject_code || 'N/A'}</p>
                    <p>年齡: ${subject?.age || 'N/A'}</p>
                    <p>性別: ${subject?.gender === 1 ? '男' : subject?.gender === 0 ? '女' : 'N/A'}</p>
                </div>
            </div>
        `;
    },

    /**
     * 設置詳細資料頁面的事件
     */
    setupDetailPageEvents() {
        // 這裡可以添加詳細資料頁面的特定事件處理

    },

    /**
     * 切換到編輯模式
     */
    switchToEditMode() {
        // 調用 DataEditorManager 的編輯模式功能
        if (typeof DataEditorManager !== 'undefined') {
            DataEditorManager.switchToEditMode();
        } else {
            console.error('DataEditorManager 未載入');
        }
    },

    /**
     * 切換回瀏覽模式
     */
    switchToViewMode() {
        // 調用 DataEditorManager 的瀏覽模式功能
        if (typeof DataEditorManager !== 'undefined') {
            DataEditorManager.switchToViewMode();
        } else {
            console.error('DataEditorManager 未載入');
        }
    },
    
    /**
     * 返回資料瀏覽器
     */
    backToDataBrowser() {
        // 重新顯示資料瀏覽器
        showDataBrowser();
    },


    /**
     * 載入 Query 紀錄區塊
     * @param {string} subjectCode - 受試者編號
     * @param {Object} subject - 受試者資料
     */
    async loadQuerySection(subjectCode, subject) {
        if (!this.canViewQuery()) {
            return;
        }

        try {
            const queries = await this.loadQueries(subjectCode);
            this.displayQuerySection(queries, false, subject);
        } catch (error) {
            console.error('載入 Query 區塊時發生錯誤:', error);
            // 顯示錯誤訊息給用戶
            showErrorMessage('載入 Query 失敗: ' + error.message);
            this.displayQuerySection([], true, subject);
        }
    },


    /**
     * 顯示 Query 紀錄區塊
     * @param {Array} queries - Query 列表
     * @param {boolean} hasError - 是否有載入錯誤
     * @param {Object} subject - 受試者資料對象
     */
    async displayQuerySection(queries, hasError = false, subject = null) {
        const queryContainer = document.getElementById('queryRecordContent');
        if (!queryContainer) return;

        if (hasError) {
            queryContainer.innerHTML = `
                <div class="text-center" style="padding: 3rem;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 4rem; color: #dc3545; margin-bottom: 1rem;"></i>
                    <p class="text-danger" style="font-size: 1.1rem; margin-bottom: 0.5rem;">載入 Query 失敗</p>
                    <p class="text-muted">無法載入 Query 記錄，請重新整理</p>
                </div>
            `;
            return;
        }

        if (!queries || queries.length === 0) {
            queryContainer.innerHTML = `
                <div class="text-center" style="padding: 3rem;">
                    <i class="fas fa-question-circle" style="font-size: 4rem; color: #ccc; margin-bottom: 1rem;"></i>
                    <p class="text-muted" style="font-size: 1.1rem; margin-bottom: 0.5rem;">尚無 Query 紀錄</p>
                    <p class="text-muted">此受試者尚未有任何 Query 記錄</p>
                </div>
            `;
            return;
        }

        // 生成 Query 記錄 HTML
        let queryHTML = '<div class="query-timeline">';

        // 使用 Promise.all 來並行載入所有 Query 的回應資料
        const queryPromises = queries.map(async (query, index) => {
            const statusClass = this.getQueryStatusClass(query.status);
            const batchData = query.batch_data || {};
            const queryList = batchData.queries || [];
            console.log(query);
            
            // 載入回應資料
            const responses = await this.loadQueryResponses(query.batch_id);
            
            let queryItemHTML = `
                <div class="query-item" style="border-left: 3px solid #ffc107; padding-left: 1rem; margin-bottom: 2rem;">
                    <div class="query-header" style="margin-bottom: 1rem;">
                        <h5 style="color: #ffc107; margin-bottom: 0.5rem;">
                            <i class="fas fa-question-circle"></i> Query 批次 ${query.batch_id}
                        </h5>
                        <small class="text-muted">
                            <i class="fas fa-user"></i> ${query.created_by || 'N/A'} | 
                            <i class="fas fa-clock"></i> ${query.created_at || 'N/A'} |
                            <span class="badge ${statusClass}" style="padding: 2px 6px; border-radius: 3px; font-size: 11px; margin-left: 0.5rem;">
                                ${this.getQueryStatusText(query.status)}
                            </span>
                        </small>
                    </div>
                    <div class="query-changes">
            `;

            queryList.forEach((q, qIndex) => {
                // 過濾出該欄位的回應資料
                const fieldResponses = responses.filter(response => 
                    response.field_name === q.field_name && response.table_name === q.table_name
                );
                
                queryItemHTML += `
                    <div class="change-item" style="background: #f8f9fa; padding: 0.75rem; margin-bottom: 0.5rem; border-radius: 4px;">
                        <div style="font-weight: 600; color: #495057; margin-bottom: 0.25rem;">
                            ${this.getTableNameText(q.table_name)} - ${q.field_name}
                        </div>
                        <div style="font-size: 0.9rem; color: #6c757d; margin-bottom: 0.25rem;">
                            <strong>類型:</strong> ${this.getQueryTypeText(q.query_type)}
                        </div>
                        <div style="font-size: 0.9rem; color: #6c757d; margin-bottom: 0.25rem;">
                            <strong>問題:</strong> ${q.question || 'N/A'}
                        </div>
                        <div style="font-size: 0.9rem; color: #6c757d;">
                            <span style="color: #dc3545;">當前值: ${q.current_value || 'N/A'}</span>
                            ${q.expected_value ? `
                                <i class="fas fa-arrow-right" style="margin: 0 0.5rem; color: #6c757d;"></i>
                                <span style="color: #28a745;">期望值: ${q.expected_value}</span>
                            ` : ''}
                        </div>
                        ${fieldResponses && fieldResponses.length > 0 ? `
                            <div style="margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid #dee2e6;">
                                <div style="font-weight: 600; color: #495057; margin-bottom: 0.5rem;">
                                    <i class="fas fa-reply"></i> 回應記錄
                                </div>
                                ${fieldResponses.map(response => `
                                    <div style="background: #ffffff; padding: 0.5rem; margin-bottom: 0.5rem; border-radius: 4px; border-left: 3px solid ${this.getResponseTypeColor(response.response_type)};">
                                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem;">
                                            <span style="font-weight: 600; color: #495057;">
                                                ${this.getResponseTypeText(response.response_type)}
                                            </span>
                                            <span style="font-size: 0.8rem; color: #6c757d;">
                                                ${response.responded_at ? new Date(response.responded_at).toLocaleString('zh-TW') : 'N/A'}
                                            </span>
                                        </div>
                                        <div style="font-size: 0.9rem; color: #495057; margin-bottom: 0.25rem;">
                                            <strong>回應者:</strong> ${response.responded_by || 'N/A'}
                                        </div>
                                        <div style="font-size: 0.9rem; color: #495057; margin-bottom: 0.25rem;">
                                            <strong>回應內容:</strong> ${response.response_text || 'N/A'}
                                        </div>
                                        ${response.original_value ? `
                                            <div style="font-size: 0.9rem; color: #6c757d; margin-bottom: 0.25rem;">
                                                <strong>原始值:</strong> ${response.original_value}
                                            </div>
                                        ` : ''}
                                        ${response.corrected_value ? `
                                            <div style="font-size: 0.9rem; color: #28a745; margin-bottom: 0.25rem;">
                                                <strong>修正值:</strong> ${response.corrected_value}
                                            </div>
                                        ` : ''}
                                        <div style="font-size: 0.8rem; color: #6c757d;">
                                            <strong>狀態:</strong> ${this.getResponseStatusText(response.status)}
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                `;
            });

            // 添加回應按鈕區域
            queryItemHTML += `
                    </div>
                    <div class="query-actions" style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #e9ecef;">
                        <div style="display: flex; gap: 0.5rem; align-items: center;">
                            ${this.canCompleteQuery(query) && (query.status === 'accept' || query.status === 'reject' || query.status === 'correct' || query.status === 'explain') ? `
                                <button class="btn btn-sm btn-primary" onclick="QueryManager.respondToQuery('${query.batch_id}', 'completed')" title="試驗監測者完成 Query">
                                    <i class="fas fa-check"></i> 接受回應
                                </button>
                            ` : this.canRespondToQuery(subject) ? `
                                ${query.status === 'pending' ? `
                                    <button class="btn btn-sm btn-success" onclick="QueryManager.respondToQuery('${query.batch_id}', 'accept')" title="接受 Query">
                                        <i class="fas fa-check"></i> 接受
                                    </button>
                                    <button class="btn btn-sm btn-danger" onclick="QueryManager.respondToQuery('${query.batch_id}', 'reject')" title="拒絕 Query">
                                        <i class="fas fa-times"></i> 拒絕
                                    </button>
                                    <button class="btn btn-sm btn-warning" onclick="QueryManager.respondToQuery('${query.batch_id}', 'correct')" title="修正 Query">
                                        <i class="fas fa-edit"></i> 修正
                                    </button>
                                    <button class="btn btn-sm btn-info" onclick="QueryManager.respondToQuery('${query.batch_id}', 'explain')" title="說明 Query">
                                        <i class="fas fa-comment"></i> 說明
                                    </button>
                                ` : query.status === 'completed' ? `
                                    <span class="text-success">
                                        <i class="fas fa-check-circle"></i> 已完成
                                    </span>
                                ` : (query.status === 'accept' || query.status === 'reject' || query.status === 'correct' || query.status === 'explain') ? `
                                    <span class="text-warning">
                                        <i class="fas fa-hourglass-half"></i> 等待試驗監測者的回應
                                    </span>
                                ` : `
                                    <span class="text-muted">
                                        <i class="fas fa-info-circle"></i> 未知狀態
                                    </span>
                                `}
                            ` : `
                                <span class="text-muted">
                                    <i class="fas fa-lock"></i> 
                                    ${!this.hasPermission('edc.query.response') ? '無權限回應 Query' : 
                                      '只有該筆資料的建立者可以回應 Query'}
                                </span>
                            `}
                        </div>
                    </div>
                </div>
            `;
            
            return queryItemHTML;
        });

        // 等待所有 Promise 完成
        const queryItems = await Promise.all(queryPromises);
        queryHTML += queryItems.join('');
        queryHTML += '</div>';
        queryContainer.innerHTML = queryHTML;
    },


    /**
     * 載入受試者歷程記錄
     */
    async loadSubjectHistory(subjectCode) {
        if (!subjectCode) return;

        try {
            const response = await fetch(`/edc/subject-history/${subjectCode}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'same-origin'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                // 確保 result.data 是陣列
                const historyData = Array.isArray(result.data) ? result.data : [];
                this.displaySubjectHistory(historyData);
            } else {
                showErrorMessage(result.message || '載入歷程記錄失敗');
                this.displaySubjectHistory([]);
            }

        } catch (error) {
            console.error('載入歷程記錄失敗:', error);
            showErrorMessage('載入歷程記錄失敗: ' + error.message);
            this.displaySubjectHistory([]);
        }
    },

    /**
     * 顯示受試者歷程記錄
     */
    displaySubjectHistory(historyData) {
        const historyContainer = document.getElementById('historyRecordContent');
        if (!historyContainer) return;

        // 檢查 historyData 是否為有效陣列
        if (!Array.isArray(historyData)) {
            console.error('historyData 不是陣列:', historyData);
            showErrorMessage('歷程記錄資料格式錯誤');
            historyContainer.innerHTML = `
                <div class="text-center" style="padding: 3rem;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 4rem; color: #dc3545; margin-bottom: 1rem;"></i>
                    <p class="text-danger" style="font-size: 1.1rem; margin-bottom: 0.5rem;">資料載入錯誤</p>
                    <p class="text-muted">歷程記錄資料格式不正確，請重新載入頁面</p>
                </div>
            `;
            return;
        }

        if (historyData.length === 0) {
            historyContainer.innerHTML = `
                <div class="text-center" style="padding: 3rem;">
                    <i class="fas fa-clock" style="font-size: 4rem; color: #ccc; margin-bottom: 1rem;"></i>
                    <p class="text-muted" style="font-size: 1.1rem; margin-bottom: 0.5rem;">尚無歷程記錄</p>
                    <p class="text-muted">此受試者尚未有任何資料變更記錄</p>
                </div>
            `;
            return;
        }

        // 按 log_id 分組
        const groupedHistory = {};
        historyData.forEach(record => {
            if (!groupedHistory[record.log_id]) {
                groupedHistory[record.log_id] = [];
            }
            groupedHistory[record.log_id].push(record);
        });

        // 生成歷程記錄 HTML
        let historyHTML = '<div class="history-timeline">';

        // 按照時間排序 log_id（最新的在前）
        const sortedLogIds = Object.keys(groupedHistory).sort((a, b) => {
            const timeA = groupedHistory[a][0]?.created_at || '';
            const timeB = groupedHistory[b][0]?.created_at || '';
            return timeB.localeCompare(timeA); // 降序排序，最新的在前
        });

        sortedLogIds.forEach(logId => {
            const records = groupedHistory[logId];
            const firstRecord = records[0];

            historyHTML += `
                <div class="history-item" style="border-left: 3px solid #007bff; padding-left: 1rem; margin-bottom: 2rem;">
                    <div class="history-header" style="margin-bottom: 1rem;">
                        <h5 style="color: #007bff; margin-bottom: 0.5rem;">
                            <i class="fas fa-edit"></i> 資料變更批次 ${logId}
                        </h5>
                        <small class="text-muted">
                            <i class="fas fa-user"></i> ${firstRecord.user_id} | 
                            <i class="fas fa-clock"></i> ${firstRecord.created_at}
                        </small>
                    </div>
                    <div class="history-changes">
            `;

            records.forEach(record => {
                const tableNameMap = {
                    'subjects': '基本資料',
                    'inclusion_criteria': '納入條件',
                    'exclusion_criteria': '排除條件'
                };

                historyHTML += `
                    <div class="change-item" style="background: #f8f9fa; padding: 0.75rem; margin-bottom: 0.5rem; border-radius: 4px;">
                        <div style="font-weight: 600; color: #495057; margin-bottom: 0.25rem;">
                            ${tableNameMap[record.table_name] || record.table_name} - ${record.field_name}
                        </div>
                        <div style="font-size: 0.9rem; color: #6c757d;">
                            <span style="color: #dc3545;">${record.old_value || '空值'}</span>
                            <i class="fas fa-arrow-right" style="margin: 0 0.5rem; color: #6c757d;"></i>
                            <span style="color: #28a745;">${record.new_value || '空值'}</span>
                        </div>
                    </div>
                `;
            });

            historyHTML += `
                    </div>
                </div>
            `;
        });

        historyHTML += '</div>';

        historyContainer.innerHTML = historyHTML;
    }
};

/**
 * 顯示資料瀏覽器
 */
function showDataBrowser() {
    const mainContent = document.getElementById('mainContent');
    if (!mainContent) return;

    mainContent.innerHTML = `
        <div class="wrap">
            <!-- 篩選器 -->
            <section class="card col-12 fade-in">
                <div class="filter-header">
                    <h2><i class="fas fa-search"></i> 資料瀏覽</h2>
                    <div class="filter-controls">
                        <button class="btn-ghost btn-sm" id="toggleAdvancedFilters">
                            <i class="fas fa-chevron-down"></i> 進階篩選
                        </button>
                    </div>
                </div>
                
                <!-- 基本篩選器 -->
                <div class="filter-section" id="basicFilters">
                    <div class="grid">
                        <div class="col-8">
                            <label>受試者編號</label>
                            <input type="text" id="subjectCodeFilter" placeholder="輸入受試者編號" class="filter-input">
                        </div>
                        <div class="col-6">
                            <label>iStone 結果</label>
                            <select id="riskScoreFilter" class="filter-select">
                                <option value="">全部</option>
                                <option value="1">陽性</option>
                                <option value="0">陰性</option>
                            </select>
                        </div>
                        <div class="col-10">
                            <label>年齡範圍</label>
                            <div class="range-inputs">
                                <input type="number" id="ageMin" placeholder="最小年齡" class="filter-input">
                                <span class="range-separator">-</span>
                                <input type="number" id="ageMax" placeholder="最大年齡" class="filter-input">
                            </div>
                        </div>
                        <div class="col-6">
                            <label>性別</label>
                            <select id="genderFilter" class="filter-select">
                                <option value="">全部</option>
                                <option value="1">男</option>
                                <option value="0">女</option>
                            </select>
                        </div>
                        <div class="col-6">
                            <label>狀態</label>
                            <select id="statusFilter" class="filter-select">
                                <option value="">全部</option>
                                <option value="draft">草稿</option>
                                <option value="query">查詢中</option>
                                <option value="submitted">已提交</option>
                                <option value="signed">已簽署</option>
                            </select>
                        </div>
                        <div class="col-6">
                            <label>建立者</label>
                            <input type="text" id="createdByFilter" placeholder="輸入建立者" class="filter-input">
                        </div>
                        <div class="col-8">
                            <label>建立日期範圍</label>
                            <div class="date-range">
                                <input type="date" id="dateFrom" class="filter-input">
                                <span class="date-separator">至</span>
                                <input type="date" id="dateTo" class="filter-input">
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 進階篩選器 -->
                <div class="filter-section advanced-filters" id="advancedFilters" style="display: none;">
                    <div class="filter-group">
                        <h4><i class="fas fa-user"></i> 基本資料</h4>
                        <div class="grid">
                            <div class="col-8">
                                <label>BMI 範圍</label>
                                <div class="range-inputs">
                                    <input type="number" id="bmiMin" placeholder="最小 BMI" step="0.1" class="filter-input">
                                    <span class="range-separator">-</span>
                                    <input type="number" id="bmiMax" placeholder="最大 BMI" step="0.1" class="filter-input">
                                </div>
                            </div>
                            <div class="col-8">
                                <label>血清肌酸酐範圍</label>
                                <div class="range-inputs">
                                    <input type="number" id="scrMin" placeholder="最小值" step="0.01" class="filter-input">
                                    <span class="range-separator">-</span>
                                    <input type="number" id="scrMax" placeholder="最大值" step="0.01" class="filter-input">
                                </div>
                            </div>
                            <div class="col-8">
                                <label>eGFR 範圍</label>
                                <div class="range-inputs">
                                    <input type="number" id="egfrMin" placeholder="最小值" step="0.1" class="filter-input">
                                    <span class="range-separator">-</span>
                                    <input type="number" id="egfrMax" placeholder="最大值" step="0.1" class="filter-input">
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="filter-group">
                        <h4><i class="fas fa-stethoscope"></i> 疾病診斷</h4>
                        <div class="grid">
                            <div class="col-6">
                                <label>糖尿病</label>
                                <select id="dmFilter" class="filter-select">
                                    <option value="">全部</option>
                                    <option value="1">有</option>
                                    <option value="0">無</option>
                                </select>
                            </div>
                            <div class="col-6">
                                <label>痛風</label>
                                <select id="goutFilter" class="filter-select">
                                    <option value="">全部</option>
                                    <option value="1">有</option>
                                    <option value="0">無</option>
                                </select>
                            </div>
                            <div class="col-6">
                                <label>菌尿症</label>
                                <select id="bacFilter" class="filter-select">
                                    <option value="">全部</option>
                                    <option value="1">有</option>
                                    <option value="0">無</option>
                                </select>
                            </div>
                            <div class="col-6">
                                <label>腎結石診斷</label>
                                <select id="stoneDiagnosisFilter" class="filter-select">
                                    <option value="">全部</option>
                                    <option value="1">是</option>
                                    <option value="0">否</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div class="filter-group">
                        <h4><i class="fas fa-x-ray"></i> 影像檢查</h4>
                        <div class="grid">
                            <div class="col-12">
                                <label>影像檢查類型</label>
                                <select id="imagingTypeFilter" class="filter-select">
                                    <option value="">全部</option>
                                    <option value="CT">CT</option>
                                    <option value="PET-CT">PET-CT</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 操作按鈕 -->
                <div class="filter-actions">
                    <button class="btn-primary" id="dataSearchBtn">
                        <i class="fas fa-search"></i> 搜尋
                    </button>
                    <button class="btn-ghost" id="dataResetBtn">
                        <i class="fas fa-undo"></i> 重置
                    </button>
                    <button class="btn-ghost" id="dataExportBtn">
                        <i class="fas fa-download"></i> 匯出
                    </button>
                </div>
            </section>
            
            <!-- 資料表格 -->
            <section class="card col-12 fade-in">
                <h2>資料列表</h2>
                <div class="table-responsive">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th class="sortable-header" data-field="subject_code">受試者編號</th>
                                <th class="sortable-header" data-field="risk_score">iStone 結果</th>
                                <th class="sortable-header" data-field="age">年齡</th>
                                <th class="sortable-header" data-field="gender">性別</th>
                                <th class="sortable-header" data-field="created_at">建立時間</th>
                                <th class="sortable-header" data-field="created_by">建立者</th>
                                <th class="sortable-header" data-field="status">狀態</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody id="dataTableBody">
                            <!-- 資料行將在這裡動態生成 -->
                        </tbody>
                    </table>
                </div>
                
                <!-- 分頁 -->
                <div id="paginationContainer" class="pagination-container">
                    <!-- 分頁控制項將在這裡動態生成 -->
                </div>
            </section>
        </div>
    `;

    // 初始化資料瀏覽器
    DataBrowserManager.init();
}

/**
 * 隱藏資料瀏覽器
 */
function hideDataBrowser() {
    const mainContent = document.getElementById('mainContent');
    if (mainContent) {
        mainContent.innerHTML = '';
    }
}

// 匯出模組
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        DataBrowserManager,
        showDataBrowser,
        hideDataBrowser
    };
}

// 確保函數在全域範圍內可用（瀏覽器環境）
if (typeof window !== 'undefined') {
    window.showDataBrowser = showDataBrowser;
    window.hideDataBrowser = hideDataBrowser;
    window.DataBrowserManager = DataBrowserManager;
}
