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
        currentPage: 1,
        pageSize: 20,
        totalRecords: 0,
        totalPages: 0
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
        return status !== 'submitted' && status !== 'signed';
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

    /**
     * 檢查是否為試驗主持人
     * @returns {boolean} - 是否為試驗主持人
     */
    isInvestigator() {
        return typeof userRole !== 'undefined' && userRole === 'investigator';
    },

    /**
     * 獲取當前使用者 ID
     * @returns {string} - 當前使用者 ID
     */
    getCurrentUserId() {
        return getCookie('unique_id') || '未知ID';
    },

    /**
     * 初始化資料瀏覽器
     */
    init() {
        this.setupEventListeners();
        this.setupFilters();
        this.loadInitialData();

        // 初始化資料編輯器
        if (typeof DataEditorManager !== 'undefined') {
            DataEditorManager.init();
        }
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
                if (page && page !== this.pagination.currentPage) {
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
        const genderSelect = document.getElementById('genderFilter');
        const imagingTypeSelect = document.getElementById('imagingTypeFilter');
        const stoneDiagnosisSelect = document.getElementById('stoneDiagnosisFilter');
        const dmSelect = document.getElementById('dmFilter');
        const goutSelect = document.getElementById('goutFilter');
        const bacSelect = document.getElementById('bacFilter');

        if (genderSelect) genderSelect.addEventListener('change', () => this.updateFilters());
        if (imagingTypeSelect) imagingTypeSelect.addEventListener('change', () => this.updateFilters());
        if (stoneDiagnosisSelect) stoneDiagnosisSelect.addEventListener('change', () => this.updateFilters());
        if (dmSelect) dmSelect.addEventListener('change', () => this.updateFilters());
        if (goutSelect) goutSelect.addEventListener('change', () => this.updateFilters());
        if (bacSelect) bacSelect.addEventListener('change', () => this.updateFilters());
    },

    /**
     * 設置篩選器
     */
    setupFilters() {
        // 設置日期範圍篩選器的預設值
        const today = new Date();
        const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());

        const dateFromInput = document.getElementById('dateFrom');
        const dateToInput = document.getElementById('dateTo');

        if (dateFromInput) {
            dateFromInput.value = oneYearAgo.toISOString().split('T')[0];
        }
        if (dateToInput) {
            dateToInput.value = today.toISOString().split('T')[0];
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

        // 性別
        const genderSelect = document.getElementById('genderFilter');
        if (genderSelect && genderSelect.value !== '') {
            this.currentFilters.gender = parseInt(genderSelect.value);
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
                    page: this.pagination.currentPage,
                    page_size: this.pagination.pageSize,
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
                this.showError(result.message || '搜尋失敗');
            }
        } catch (error) {
            console.error('搜尋失敗:', error);
            this.showError('搜尋失敗: ' + error.message);
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
            noDataRow.innerHTML = '<td colspan="20" class="text-center">沒有找到符合條件的資料</td>';
            tableBody.appendChild(noDataRow);
            return;
        }
        console.log(this.currentData);
        this.currentData.forEach(subject => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${subject.subject_code || ''}</td>
                <td>${subject.date_of_birth || ''}</td>
                <td>${subject.age || ''}</td>
                <td>${subject.gender === 1 ? '男' : '女'}</td>
                <td>${subject.height_cm || ''}</td>
                <td>${subject.weight_kg || ''}</td>
                <td>${subject.bmi || ''}</td>
                <td>${subject.scr || ''}</td>
                <td>${subject.egfr || ''}</td>
                <td>${subject.ph || ''}</td>
                <td>${subject.sg || ''}</td>
                <td>${subject.rbc || ''}</td>
                <td>${subject.bac === 1 ? '有' : '無'}</td>
                <td>${subject.dm === 1 ? '有' : '無'}</td>
                <td>${subject.gout === 1 ? '有' : '無'}</td>
                <td>${subject.imaging_type || ''}</td>
                <td>${subject.imaging_date || ''}</td>
                <td>${subject.kidney_stone_diagnosis === 1 ? '是' : '否'}</td>
                <td>${subject.status || ''}</td>
                <td>${subject.created_at || ''}</td>
                <td>
                    <button class="btn-ghost" onclick="DataBrowserManager.viewDetails('${subject.subject_code}')">
                        詳細資料
                    </button>
                    ${this.canShowEditButton(subject) ? `
                        <button class="btn-ghost" onclick="DataBrowserManager.editSubject('${subject.subject_code}')">
                            編輯
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

        if (this.pagination.totalPages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }

        let paginationHTML = '';

        // 上一頁
        if (this.pagination.currentPage > 1) {
            paginationHTML += `
                <button class="page-btn" data-page="${this.pagination.currentPage - 1}">上一頁</button>
            `;
        }

        // 頁碼
        const startPage = Math.max(1, this.pagination.currentPage - 2);
        const endPage = Math.min(this.pagination.totalPages, this.pagination.currentPage + 2);

        for (let i = startPage; i <= endPage; i++) {
            const activeClass = i === this.pagination.currentPage ? 'active' : '';
            paginationHTML += `
                <button class="page-btn ${activeClass}" data-page="${i}">${i}</button>
            `;
        }

        // 下一頁
        if (this.pagination.currentPage < this.pagination.totalPages) {
            paginationHTML += `
                <button class="page-btn" data-page="${this.pagination.currentPage + 1}">下一頁</button>
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
                if (page && page !== this.pagination.currentPage) {
                    this.goToPage(page);
                }
            });
        });
    },

    /**
     * 前往指定頁面
     */
    goToPage(page) {
        this.pagination.currentPage = page;
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
        const inputs = document.querySelectorAll('#dataBrowserFilters input, #dataBrowserFilters select');
        inputs.forEach(input => {
            if (input.type === 'text' || input.type === 'number') {
                input.value = '';
            } else if (input.type === 'select-one') {
                input.selectedIndex = 0;
            }
        });

        // 重置日期範圍為預設值
        const today = new Date();
        const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());

        const dateFromInput = document.getElementById('dateFrom');
        const dateToInput = document.getElementById('dateTo');

        if (dateFromInput) dateFromInput.value = oneYearAgo.toISOString().split('T')[0];
        if (dateToInput) dateToInput.value = today.toISOString().split('T')[0];

        // 重置分頁和排序
        this.pagination.currentPage = 1;
        this.sorting.field = 'id';
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

                this.showSuccess('資料匯出成功！');
            } else {
                const result = await response.json();
                this.showError(result.message || '匯出失敗');
            }
        } catch (error) {
            console.error('匯出失敗:', error);
            this.showError('匯出失敗: ' + error.message);
        }
    },

    // 查看詳細資料
    viewDetails(subjectCode) {
        // 調用後台API獲取詳細資料
        this.fetchSubjectDetails(subjectCode);
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


                // 顯示成功訊息
                this.showSuccess(`成功獲取受試者 ${subjectCode} 的詳細資料`);
                this.showSubjectDetailBlock(result.data); // 顯示詳細資料區塊
            } else {
                // 顯示錯誤訊息
                this.showError(result.message || '獲取詳細資料失敗');
            }

        } catch (error) {
            console.error('獲取詳細資料時發生錯誤:', error);
            this.showError('獲取詳細資料失敗: ' + error.message);
        }
    },

    /**
     * 編輯受試者資料
     */
    editSubject(subjectCode) {
        // 檢查編輯權限
        if (!this.hasEditPermission()) {
            alert('您沒有編輯權限');
            return;
        }

        // 這裡可以實現編輯功能
        // 例如：跳轉到編輯頁面或開啟編輯模態視窗
        alert(`編輯受試者 ${subjectCode} 的資料`);
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

            // 設置返回按鈕事件
            this.setupDetailPageEvents();

            // 載入歷程記錄
            this.loadSubjectHistory(data.subject?.subject_code);
        } catch (error) {
            console.error('創建詳細資料頁面失敗:', error);
            // 使用預設方法作為備用
            const detailPage = this.createDefaultSubjectDetailPage(data);
            mainContent.innerHTML = detailPage;
            this.setupDetailPageEvents();

            // 載入歷程記錄
            this.loadSubjectHistory(data.subject?.subject_code);
        }
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
     * 顯示成功訊息
     */
    showSuccess(message) {
        if (typeof showSuccessMessage === 'function') {
            showSuccessMessage(message);
        } else {
            alert(message);
        }
    },

    /**
     * 顯示錯誤訊息
     */
    showError(message) {
        if (typeof showErrorMessage === 'function') {
            showErrorMessage(message);
        } else {
            alert('錯誤: ' + message);
        }
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
                this.displaySubjectHistory(result.data);
            } else {
                this.displaySubjectHistory([]);
            }

        } catch (error) {
            console.error('載入歷程記錄失敗:', error);
            this.displaySubjectHistory([]);
        }
    },

    /**
     * 顯示受試者歷程記錄
     */
    displaySubjectHistory(historyData) {
        const historyContainer = document.getElementById('historyRecordContent');
        if (!historyContainer) return;

        if (!historyData || historyData.length === 0) {
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

        Object.keys(groupedHistory).sort().reverse().forEach(logId => {
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
                <h2><i class="fas fa-search"></i> 資料瀏覽</h2>
                <div class="grid" id="dataBrowserFilters">
                    <div class="col-3">
                        <label>受試者編號</label>
                        <input type="text" id="subjectCodeFilter" placeholder="輸入受試者編號">
                    </div>
                    <div class="col-3">
                        <label>性別</label>
                        <select id="genderFilter">
                            <option value="">全部</option>
                            <option value="1">男</option>
                            <option value="0">女</option>
                        </select>
                    </div>
                    <div class="col-3">
                        <label>年齡範圍</label>
                        <div class="row">
                            <input type="number" id="ageMin" placeholder="最小年齡">
                            <input type="number" id="ageMax" placeholder="最大年齡">
                        </div>
                    </div>
                    <div class="col-3">
                        <label>BMI 範圍</label>
                        <div class="row">
                            <input type="number" id="bmiMin" placeholder="最小 BMI" step="0.1">
                            <input type="number" id="bmiMax" placeholder="最大 BMI" step="0.1">
                        </div>
                    </div>
                    <div class="col-3">
                        <label>血清肌酸酐範圍</label>
                        <div class="row">
                            <input type="number" id="scrMin" placeholder="最小值" step="0.01">
                            <input type="number" id="scrMax" placeholder="最大值" step="0.01">
                        </div>
                    </div>
                    <div class="col-3">
                        <label>eGFR 範圍</label>
                        <div class="row">
                            <input type="number" id="egfrMin" placeholder="最小值" step="0.1">
                            <input type="number" id="egfrMax" placeholder="最大值" step="0.1">
                        </div>
                    </div>
                    <div class="col-3">
                        <label>影像檢查類型</label>
                        <select id="imagingTypeFilter">
                            <option value="">全部</option>
                            <option value="CT">CT</option>
                            <option value="PET-CT">PET-CT</option>
                        </select>
                    </div>
                    <div class="col-3">
                        <label>腎結石診斷</label>
                        <select id="stoneDiagnosisFilter">
                            <option value="">全部</option>
                            <option value="1">是</option>
                            <option value="0">否</option>
                        </select>
                    </div>
                    <div class="col-3">
                        <label>糖尿病</label>
                        <select id="dmFilter">
                            <option value="">全部</option>
                            <option value="1">有</option>
                            <option value="0">無</option>
                        </select>
                    </div>
                    <div class="col-3">
                        <label>痛風</label>
                        <select id="goutFilter">
                            <option value="">全部</option>
                            <option value="1">有</option>
                            <option value="0">無</option>
                        </select>
                    </div>
                    <div class="col-3">
                        <label>菌尿症</label>
                        <select id="bacFilter">
                            <option value="">全部</option>
                            <option value="1">有</option>
                            <option value="0">無</option>
                        </select>
                    </div>
                    <div class="col-3">
                        <label>建立日期範圍</label>
                        <div class="row">
                            <input type="date" id="dateFrom">
                            <input type="date" id="dateTo">
                        </div>
                    </div>
                    <div class="col-12">
                        <div class="actions">
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
                    </div>
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
                                <th class="sortable-header" data-field="date_of_birth">出生日期</th>
                                <th class="sortable-header" data-field="age">年齡</th>
                                <th class="sortable-header" data-field="gender">性別</th>
                                <th class="sortable-header" data-field="height_cm">身高(cm)</th>
                                <th class="sortable-header" data-field="weight_kg">體重(kg)</th>
                                <th class="sortable-header" data-field="bmi">BMI</th>
                                <th class="sortable-header" data-field="scr">血清肌酸酐</th>
                                <th class="sortable-header" data-field="egfr">eGFR</th>
                                <th class="sortable-header" data-field="ph">尿液pH</th>
                                <th class="sortable-header" data-field="sg">尿液比重</th>
                                <th class="sortable-header" data-field="rbc">尿液RBC</th>
                                <th class="sortable-header" data-field="bac">菌尿症</th>
                                <th class="sortable-header" data-field="dm">糖尿病</th>
                                <th class="sortable-header" data-field="gout">痛風</th>
                                <th class="sortable-header" data-field="imaging_type">影像檢查類型</th>
                                <th class="sortable-header" data-field="imaging_date">影像檢查日期</th>
                                <th class="sortable-header" data-field="kidney_stone_diagnosis">腎結石診斷</th>
                                <th class="sortable-header" data-field="status">狀態</th>
                                <th class="sortable-header" data-field="created_at">建立時間</th>
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
