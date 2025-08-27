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
     * 初始化資料瀏覽器
     */
    init() {
        this.setupEventListeners();
        this.setupFilters();
        this.loadInitialData();
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
    
    /**
     * 載入初始資料
     */
    async loadInitialData() {
        await this.performSearch();
    },
    

    
    /**
     * 執行搜尋
     */
    async performSearch() {
        console.log('performSearch 被調用');
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
            console.log('result: ', result);
            console.log('result.data: ', result.data);
            console.log('result.pagination: ', result.pagination);
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
            noDataRow.innerHTML = '<td colspan="15" class="text-center">沒有找到符合條件的資料</td>';
            tableBody.appendChild(noDataRow);
            return;
        }
        
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
                <td>${subject.bac === 1 ? '有' : '無'}</td>
                <td>${subject.dm === 1 ? '有' : '無'}</td>
                <td>${subject.gout === 1 ? '有' : '無'}</td>
                <td>${subject.imaging_type || ''}</td>
                <td>${subject.imaging_date || ''}</td>
                <td>${subject.kidney_stone_diagnosis === 1 ? '是' : '否'}</td>
                <td>${subject.created_at || ''}</td>
                <td>
                    <button class="btn-ghost" onclick="DataBrowserManager.viewDetails('${subject.subject_code}')">
                        詳細資料
                    </button>
                    <button class="btn-ghost" onclick="DataBrowserManager.editSubject('${subject.subject_code}')">
                        編輯
                    </button>
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
    
    /**
     * 查看詳細資料
     */
    viewDetails(subjectCode) {
        // 這裡可以實現查看詳細資料的功能
        // 例如：開啟模態視窗顯示完整資料
        alert(`查看受試者 ${subjectCode} 的詳細資料`);
    },
    
    /**
     * 編輯受試者資料
     */
    editSubject(subjectCode) {
        // 這裡可以實現編輯功能
        // 例如：跳轉到編輯頁面或開啟編輯模態視窗
        alert(`編輯受試者 ${subjectCode} 的資料`);
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
                                <th class="sortable-header" data-field="bac">菌尿症</th>
                                <th class="sortable-header" data-field="dm">糖尿病</th>
                                <th class="sortable-header" data-field="gout">痛風</th>
                                <th class="sortable-header" data-field="imaging_type">影像檢查類型</th>
                                <th class="sortable-header" data-field="imaging_date">影像檢查日期</th>
                                <th class="sortable-header" data-field="kidney_stone_diagnosis">腎結石診斷</th>
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
