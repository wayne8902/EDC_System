// EDC Query 管理系統
// 負責處理 Query 的發起、管理和相關功能

/**
 * Query 管理器
 */
const QueryManager = {
    
    // 當前選中的受試者編號
    currentSubjectCode: null,
    
    // 批量 Query 相關屬性
    batchQueries: [], // 儲存批量 Query 資料
    queryCounter: 0, // Query 項目計數器
    
    // 動態載入的欄位配置
    booleanFields: [], // 從後端動態獲取的布林欄位列表
    fieldConfigLoaded: false, // 欄位配置是否已載入
    
    // 可查詢的資料表配置
    tableConfig: {
        'subjects': {
            name: '受試者基本資料',
            fields: [
                { id: 'date_of_birth', name: '出生日期' },
                { id: 'age', name: '年齡' },
                { id: 'gender', name: '性別' },
                { id: 'height_cm', name: '身高(cm)' },
                { id: 'weight_kg', name: '體重(kg)' },
                { id: 'bmi', name: 'BMI' },
                { id: 'scr', name: '血清肌酸酐' },
                { id: 'egfr', name: 'eGFR' },
                { id: 'ph', name: '尿液pH' },
                { id: 'sg', name: '尿液比重' },
                { id: 'rbc', name: '尿液紅血球' },
                { id: 'bac', name: '菌尿症' },
                { id: 'dm', name: '糖尿病' },
                { id: 'gout', name: '痛風' },
                { id: 'imaging_type', name: '影像檢查類型' },
                { id: 'imaging_date', name: '影像檢查日期' },
                { id: 'kidney_stone_diagnosis', name: '腎結石診斷結果' }
            ]
        },
        'inclusion_criteria': {
            name: '納入條件',
            fields: [
                { id: 'age_18_above', name: '年齡18歲以上' },
                { id: 'gender_available', name: '性別記載' },
                { id: 'age_available', name: '年齡記載' },
                { id: 'bmi_available', name: 'BMI記載' },
                { id: 'dm_history_available', name: '糖尿病病史記載' },
                { id: 'gout_history_available', name: '痛風病史記載' },
                { id: 'egfr_available', name: 'eGFR檢驗資料' },
                { id: 'urine_ph_available', name: '尿液pH檢驗資料' },
                { id: 'urine_sg_available', name: '尿液SG檢驗資料' },
                { id: 'urine_rbc_available', name: '尿液RBC檢驗資料' },
                { id: 'bacteriuria_available', name: '菌尿症檢驗資料' },
                { id: 'imaging_available', name: '影像資料記錄' },
                { id: 'no_treatment_during_exam', name: '檢查期間無治療處置' }
            ]
        },
        'exclusion_criteria': {
            name: '排除條件',
            fields: [
                { id: 'pregnant_female', name: '懷孕女性' },
                { id: 'kidney_transplant', name: '腎臟移植' },
                { id: 'urinary_tract_foreign_body', name: '泌尿道異物' },
                { id: 'non_stone_urological_disease', name: '非腎結石泌尿病變' },
                { id: 'renal_replacement_therapy', name: '腎臟替代治療' },
                { id: 'medical_record_incomplete', name: '病歷資料缺失' },
                { id: 'major_blood_immune_cancer', name: '重大血液免疫惡性腫瘤' },
                { id: 'rare_metabolic_disease', name: '罕見代謝性疾病' },
                { id: 'investigator_judgment', name: '試驗主持人專業判斷' }
            ]
        }
    },

    /**
     * 顯示 Query 發起彈出視窗
     * @param {string} subjectCode - 受試者編號
     */
    showQueryModal(subjectCode) {
        if (!subjectCode) {
            alert('無效的受試者編號');
            return;
        }

        this.currentSubjectCode = subjectCode;

        // 移除已存在的 modal
        const existingModal = document.getElementById('queryModal');
        if (existingModal) {
            existingModal.remove();
        }

        const modalHtml = `
            <div class="modal fade" id="queryModal" tabindex="-1" aria-labelledby="queryModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="queryModalLabel">
                                <i class="fas fa-question-circle text-warning"></i> 發起 Query
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            ${this.generateQueryForm(subjectCode)}
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                <i class="fas fa-times"></i> 取消
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // 添加到頁面
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        // 顯示 modal
        const modal = new bootstrap.Modal(document.getElementById('queryModal'));
        modal.show();

        // 初始化表單
        this.initializeQueryForm();

        // 清理 modal 當關閉時
        document.getElementById('queryModal').addEventListener('hidden.bs.modal', function () {
            this.remove();
        });
    },

        /**
     * 生成 Query 表單 HTML
     * @param {string} subjectCode - 受試者編號
     * @returns {string} - 表單 HTML
     */
    generateQueryForm(subjectCode) {
        return `
            <form id="queryForm" class="needs-validation" novalidate>
                <!-- 受試者資訊 -->
                <div class="row mb-4">
                    <div class="col-md-12">
                        <div class="form-group">
                            <label for="subjectCodeInput" class="form-label">
                                <i class="fas fa-user"></i> 受試者編號
                            </label>
                            <input type="text" id="subjectCodeInput" class="form-control" 
                                value="${subjectCode}" readonly>
                        </div>
                    </div>
                </div>

                <!-- 批量 Query 區域 -->
                <div class="card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h6 class="mb-0">
                            <i class="fas fa-list-ul"></i> 批量 Query 列表
                        </h6>
                        <button type="button" class="btn btn-sm btn-success" onclick="QueryManager.addNewFieldQuery()">
                            <i class="fas fa-plus"></i> 新增欄位 Query
                        </button>
                    </div>
                    <div class="card-body">
                        <div id="fieldQueriesList">
                            <!-- 動態生成的欄位 Query 項目 -->
                        </div>
                        
                        <!-- 空狀態提示 -->
                        <div id="emptyQueriesHint" class="text-center text-muted py-4">
                            <i class="fas fa-inbox fa-3x mb-3"></i>
                            <p class="mb-0">尚未新增任何欄位 Query</p>
                            <p class="small">點擊上方「新增欄位 Query」按鈕開始</p>
                        </div>
                    </div>
                </div>

                <!-- 提交區域 -->
                <div class="mt-4">
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="text-muted">
                            <i class="fas fa-info-circle"></i> 
                            總計 <span id="totalQueriesCount">0</span> 個 Query
                        </div>
                        <div>
                            <button type="button" class="btn btn-secondary me-2" onclick="QueryManager.clearAllQueries()">
                                <i class="fas fa-trash"></i> 清空全部
                            </button>
                            <button type="submit" class="btn btn-primary" onclick="QueryManager.submitQuery()" disabled id="submitQueryBtn">
                                <i class="fas fa-paper-plane"></i> 發起 Query
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        `;
    },

    /**
     * 初始化 Query 表單
     */
    async initializeQueryForm() {
        // 清空批量 Query 資料
        this.batchQueries = [];
        this.queryCounter = 0;
        
        // 載入欄位配置
        await this.loadFieldConfig();
        
        // 更新 UI
        this.updateBatchQueriesUI();
        
        console.log('批量 Query 表單初始化完成');
    },

    /**
     * 載入欄位配置
     */
    async loadFieldConfig() {
        if (this.fieldConfigLoaded) {
            return; // 已經載入過，不需要重複載入
        }

        try {
            const response = await fetch('/edc/field-config', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const result = await response.json();
            
            if (result.success && result.data) {
                // 直接使用後端返回的配置結構
                this.booleanFields = result.data;
                
                this.fieldConfigLoaded = true;
                console.log('欄位配置載入成功:', this.booleanFields);
            } else {
                console.error('載入欄位配置失敗:', result.message);
                // 使用預設配置作為備用
                this.loadDefaultBooleanFields();
            }
            
        } catch (error) {
            console.error('載入欄位配置時發生錯誤:', error);
            // 使用預設配置作為備用
            this.loadDefaultBooleanFields();
        }
    },

    /**
     * 載入預設的布林欄位配置（備用方案）
     */
    loadDefaultBooleanFields() {
        this.booleanFields = {
            'subjects': [
                'bac', 'dm', 'gout', 'kidney_stone_diagnosis'
            ],
            'inclusion_criteria': [
                'age_18_above', 'gender_available', 'age_available', 'bmi_available',
                'dm_history_available', 'gout_history_available', 'egfr_available',
                'urine_ph_available', 'urine_sg_available', 'urine_rbc_available',
                'bacteriuria_available', 'lab_interval_7days', 'imaging_available',
                'kidney_structure_visible', 'mid_ureter_visible', 'lower_ureter_visible',
                'imaging_lab_interval_7days', 'no_treatment_during_exam'
            ],
            'exclusion_criteria': [
                'pregnant_female', 'kidney_transplant', 'urinary_tract_foreign_body',
                'non_stone_urological_disease', 'renal_replacement_therapy',
                'medical_record_incomplete', 'major_blood_immune_cancer',
                'rare_metabolic_disease', 'investigator_judgment'
            ]
        };
        this.fieldConfigLoaded = true;
        console.log('使用預設欄位配置:', this.booleanFields);
    },

    /**
     * 根據選擇的資料表載入對應的欄位
     */
    loadFieldsForTable() {
        const tableSelect = document.getElementById('tableSelect');
        const fieldSelect = document.getElementById('fieldSelect');
        const currentValueInput = document.getElementById('currentValue');
        const existingQueriesSection = document.getElementById('existingQueriesSection');
        
        if (!tableSelect || !fieldSelect) return;

        const selectedTable = tableSelect.value;
        
        // 清空欄位選擇和當前值，隱藏現有 Query 區域
        fieldSelect.innerHTML = '<option value="">請選擇欄位</option>';
        if (currentValueInput) currentValueInput.value = '';
        if (existingQueriesSection) existingQueriesSection.style.display = 'none';

        if (selectedTable && this.tableConfig[selectedTable]) {
            const fields = this.tableConfig[selectedTable].fields;
            fields.forEach(field => {
                const option = document.createElement('option');
                option.value = field.id;
                option.textContent = field.name;
                fieldSelect.appendChild(option);
            });
        }
    },





    /**
     * 收集所有 Query 資料
     */
    collectAllQueries() {
        const queries = [];
        
        // 如果有批量 Query，收集批量資料
        if (this.batchQueries && this.batchQueries.length > 0) {
            this.batchQueries.forEach(query => {
                queries.push({
                    table_name: query.table,
                    field_name: query.field,
                    query_type: query.queryType,
                    question: query.question,
                    current_value: this.convertBooleanValueForDB(query.currentValue, query.field, query.table),
                    expected_value: this.convertBooleanValueForDB(query.expectedValue || '', query.field, query.table)
                });
            });
        } else {
            // 單個 Query 格式
            const form = document.getElementById('queryForm');
            if (!form) return queries;

            const tableName = document.getElementById('tableSelect').value;
            const fieldName = document.getElementById('fieldSelect').value;
            
            queries.push({
                table_name: tableName,
                field_name: fieldName,
                query_type: document.getElementById('queryType').value,
                question: document.getElementById('queryQuestion').value,
                current_value: this.convertBooleanValueForDB(document.getElementById('currentValue').value, fieldName, tableName),
                expected_value: this.convertBooleanValueForDB(document.getElementById('expectedValue').value || '', fieldName, tableName)
            });
        }
        
        return queries;
    },

    /**
     * 驗證所有 Query
     */
    validateAllQueries(queries) {
        if (!queries || queries.length === 0) return false;
        
        // 檢查每個 Query 的必填欄位
        return queries.every(query => 
            query.table_name && 
            query.field_name && 
            query.query_type && 
            query.question
        );
    },

    /**
     * 提交 Query
     */
    async submitQuery() {
        // 1. 收集所有 Query 資料
        const queries = this.collectAllQueries();
        
        if (queries.length === 0) {
            showErrorMessage('沒有可提交的 Query');
            return;
        }
        
        // 2. 驗證所有 Query
        if (!this.validateAllQueries(queries)) {
            showErrorMessage('請完整填寫所有 Query 的必填欄位');
            return;
        }
        
        // 3. 統一格式
        const submitData = {
            subject_code: this.currentSubjectCode,
            queries: queries
        };

        try {
            // 顯示載入狀態
            const submitBtn = document.getElementById('submitQueryBtn') || document.querySelector('#queryModal .btn-warning');
            if (submitBtn) {
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 發起中...';
                submitBtn.disabled = true;
            }

            console.log('提交 Query 資料:', submitData);

            // 發送請求
            const response = await fetch('/edc/query/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(submitData)
            });

            const result = await response.json();

            if (result.success) {
                // 成功提示
                const queryCount = submitData.queries.length;
                const queryList = submitData.queries.map(q => 
                    `• ${this.getFieldDisplayName(q.table_name, q.field_name)}: ${q.question.substring(0, 30)}...`
                ).join('\n');
                
                if (typeof openDataBrowser === 'function') {
                    openDataBrowser();
                } else {
                    // 備用方案：直接跳轉到主頁面
                    window.location.href = '/';
                }
                showSuccessMessage(`成功發起 ${queryCount} 個 Query！\n\n${queryList}`);
                
                // 關閉 modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('queryModal'));
                if (modal) modal.hide();
            } else {
                throw new Error(result.message || '提交失敗');
            }

        } catch (error) {
            console.error('提交 Query 時發生錯誤:', error);
            showErrorMessage('提交失敗：' + error.message);
        } 
        // finally {
        //     // 恢復按鈕狀態
        //     const submitBtn = document.getElementById('submitQueryBtn') || document.querySelector('#queryModal .btn-warning');
        //     if (submitBtn) {
        //         submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> 發起 Query';
        //         submitBtn.disabled = false;
        //     }
        // }
    },

    /**
     * 轉換布林值為資料庫格式
     * @param {string} value - 前端顯示的值 ("是"/"否")
     * @param {string} fieldName - 欄位名稱
     * @param {string} tableName - 資料表名稱
     * @returns {string} 資料庫格式的值 ("1"/"0")
     */
    convertBooleanValueForDB(value, fieldName, tableName) {
        if (!value) return value;
        
        // 檢查是否為二擇一欄位
        const isBinaryField = this.isBinaryField(fieldName, tableName);
        if (!isBinaryField) return value;
        
        // 性別欄位轉換
        if (fieldName === 'gender') {
            if (value === '男性') return '1';
            if (value === '女性') return '0';
            if (value === '1' || value === '0') return value;
            return value;
        }
        
        // 布林欄位轉換 "是/否" 為 "1/0"
        if (value === '是') return '1';
        if (value === '否') return '0';
        
        // 如果已經是 "1/0"，直接返回
        if (value === '1' || value === '0') return value;
        
        // 其他情況保持原值
        return value;
    },

    /**
     * 檢查是否為布林欄位
     * @param {string} fieldName - 欄位名稱
     * @param {string} tableName - 資料表名稱
     * @returns {boolean} 是否為布林欄位
     */
    isBooleanField(fieldName, tableName) {
        if (!this.booleanFields || !this.booleanFields[tableName]) return false;
        return this.booleanFields[tableName].includes(fieldName);
    },

    /**
     * 檢查是否為二擇一欄位（包含性別）
     * @param {string} fieldName - 欄位名稱
     * @param {string} tableName - 資料表名稱
     * @returns {boolean} 是否為二擇一欄位
     */
    isBinaryField(fieldName, tableName) {
        // 性別欄位
        if (fieldName === 'gender') return true;
        
        // 布林欄位
        return this.isBooleanField(fieldName, tableName);
    },

    /**
     * 生成二擇一欄位的下拉選單選項
     * @param {string} fieldName - 欄位名稱
     * @param {string} currentValue - 當前值
     * @returns {string} 下拉選單選項 HTML
     */
    generateBinaryFieldOptions(fieldName, currentValue) {
        if (fieldName === 'gender') {
            return `
                <option value="">請選擇性別</option>
                <option value="男性" ${currentValue === '男性' ? 'selected' : ''}>男性</option>
                <option value="女性" ${currentValue === '女性' ? 'selected' : ''}>女性</option>
            `;
        } else {
            return `
                <option value="">請選擇</option>
                <option value="是" ${currentValue === '是' ? 'selected' : ''}>是</option>
                <option value="否" ${currentValue === '否' ? 'selected' : ''}>否</option>
            `;
        }
    },

    /**
     * 獲取欄位顯示名稱
     * @param {string} tableName - 資料表名稱
     * @param {string} fieldName - 欄位名稱
     * @returns {string} - 顯示名稱
     */
    getFieldDisplayName(tableName, fieldName) {
        if (this.tableConfig[tableName]) {
            const field = this.tableConfig[tableName].fields.find(f => f.id === fieldName);
            return field ? field.name : fieldName;
        }
        return fieldName;
    },

    /**
     * 快速追加 Query
     * @param {string} fieldName - 欄位名稱
     */
    addQuickQuery(fieldName) {
        // 清空當前表單的問題和類型，保留其他資訊
        const queryQuestionTextarea = document.getElementById('queryQuestion');
        const queryTypeSelect = document.getElementById('queryType');
        const expectedValueInput = document.getElementById('expectedValue');
        
        if (queryQuestionTextarea) queryQuestionTextarea.value = '';
        if (queryTypeSelect) queryTypeSelect.value = '';
        if (expectedValueInput) expectedValueInput.value = '';
        
        // 聚焦到問題輸入框
        if (queryQuestionTextarea) {
            queryQuestionTextarea.focus();
            queryQuestionTextarea.placeholder = `針對 ${this.getFieldDisplayName('subjects', fieldName)} 追加新的問題...`;
        }
        
        // 顯示提示
        this.showQuickAddHint(fieldName);
    },

    /**
     * 顯示快速追加提示
     * @param {string} fieldName - 欄位名稱
     */
    showQuickAddHint(fieldName) {
        const fieldDisplayName = this.getFieldDisplayName('subjects', fieldName);
        
        // 創建提示元素
        const hintElement = document.createElement('div');
        hintElement.className = 'alert alert-info alert-dismissible fade show';
        hintElement.innerHTML = `
            <i class="fas fa-lightbulb"></i> 
            <strong>快速追加模式</strong> - 正在為 <strong>${fieldDisplayName}</strong> 追加新的 Query
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        // 插入到表單頂部
        const form = document.getElementById('queryForm');
        if (form) {
            form.insertBefore(hintElement, form.firstChild);
            
            // 3秒後自動消失
            setTimeout(() => {
                if (hintElement.parentNode) {
                    hintElement.remove();
                }
            }, 3000);
        }
    },

    /**
     * 查看 Query 詳情
     * @param {string} queryId - Query ID
     */
    viewQueryDetail(queryId) {
        // 這裡可以實作查看詳情的邏輯
        alert(`查看 Query ${queryId} 的詳細資訊\n\n功能開發中...`);
    },

    /**
     * 編輯 Query
     * @param {string} queryId - Query ID
     */
    editQuery(queryId) {
        // 這裡可以實作編輯 Query 的邏輯
        alert(`編輯 Query ${queryId}\n\n功能開發中...`);
    },


    // ==================== 批量 Query 功能 ====================

    /**
     * 新增欄位 Query
     */
    addNewFieldQuery() {
        const queryId = ++this.queryCounter;
        const newQuery = {
            id: queryId,
            table: '',
            field: '',
            fieldName: '',
            currentValue: '',
            queryType: '',
            expectedValue: '',
            question: ''
        };
        
        this.batchQueries.push(newQuery);
        this.updateBatchQueriesUI();
    },

    /**
     * 移除欄位 Query
     * @param {number} queryId - Query ID
     */
    removeFieldQuery(queryId) {
        this.batchQueries = this.batchQueries.filter(query => query.id !== queryId);
        this.updateBatchQueriesUI();
    },

    /**
     * 更新批量 Query UI
     */
    updateBatchQueriesUI() {
        const fieldQueriesList = document.getElementById('fieldQueriesList');
        const emptyQueriesHint = document.getElementById('emptyQueriesHint');
        const totalQueriesCount = document.getElementById('totalQueriesCount');
        const submitQueryBtn = document.getElementById('submitQueryBtn');

        if (!fieldQueriesList) return;

        // 更新計數
        if (totalQueriesCount) {
            totalQueriesCount.textContent = this.batchQueries.length;
        }

        // 顯示/隱藏空狀態提示
        if (emptyQueriesHint) {
            emptyQueriesHint.style.display = this.batchQueries.length === 0 ? 'block' : 'none';
        }

        // 更新提交按鈕狀態
        if (submitQueryBtn) {
            const queries = this.collectAllQueries();
            submitQueryBtn.disabled = queries.length === 0 || !this.validateAllQueries(queries);
        }

        // 生成 Query 項目 HTML
        if (this.batchQueries.length > 0) {
            fieldQueriesList.innerHTML = this.batchQueries.map(query => this.generateFieldQueryItem(query)).join('');
        } else {
            fieldQueriesList.innerHTML = '';
        }
    },

    /**
     * 生成單個欄位 Query 項目 HTML
     * @param {Object} query - Query 物件
     * @returns {string} - HTML 字串
     */
    generateFieldQueryItem(query) {
        const tableOptions = Object.keys(this.tableConfig).map(key => 
            `<option value="${key}" ${query.table === key ? 'selected' : ''}>${this.tableConfig[key].name}</option>`
        ).join('');

        const fieldOptions = query.table ? 
            this.tableConfig[query.table].fields.map(field => 
                `<option value="${field.id}" ${query.field === field.id ? 'selected' : ''}>${field.name}</option>`
            ).join('') : '';

        return `
            <div class="query-item border rounded p-3 mb-3" data-query-id="${query.id}">
                <div class="d-flex justify-content-between align-items-start mb-3">
                    <h6 class="mb-0">
                        <i class="fas fa-question-circle text-primary"></i> 
                        Query #${query.id}
                    </h6>
                    <button type="button" class="btn btn-sm btn-outline-danger" onclick="QueryManager.removeFieldQuery(${query.id})">
                        移除欄位<i class="fas fa-trash"></i>
                    </button>
                </div>

                <div class="row">
                    <!-- 資料表選擇 -->
                    <div class="col-md-4 mb-3">
                        <label class="form-label">資料表 *</label>
                        <select class="form-control" onchange="QueryManager.onTableChange(${query.id}, this.value)" required>
                            <option value="">請選擇資料表</option>
                            ${tableOptions}
                        </select>
                    </div>

                    <!-- 欄位選擇 -->
                    <div class="col-md-4 mb-3">
                        <label class="form-label">欄位 *</label>
                        <select class="form-control" onchange="QueryManager.onFieldChange(${query.id}, this.value)" required ${!query.table ? 'disabled' : ''}>
                            <option value="">請選擇欄位</option>
                            ${fieldOptions}
                        </select>
                    </div>

                    <!-- 當前值 -->
                    <div class="col-md-4 mb-3">
                        <label class="form-label">當前值</label>
                        <div class="input-group">
                            <input type="text" class="form-control" value="${query.currentValue}" readonly placeholder="選擇欄位後載入">
                            <button type="button" class="btn btn-outline-secondary" onclick="QueryManager.refreshFieldValue(${query.id})" ${!query.field ? 'disabled' : ''}>
                                重新整理<i class="fas fa-sync-alt"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <div class="row">
                    <!-- Query 類型 -->
                    <div class="col-md-6 mb-3">
                        <label class="form-label">Query 類型 *</label>
                        <select class="form-control" onchange="QueryManager.onQueryTypeChange(${query.id}, this.value)" required>
                            <option value="">請選擇類型</option>
                            <option value="clarification" ${query.queryType === 'clarification' ? 'selected' : ''}>澄清說明</option>
                            <option value="correction" ${query.queryType === 'correction' ? 'selected' : ''}>資料修正</option>
                            <option value="verification" ${query.queryType === 'verification' ? 'selected' : ''}>資料驗證</option>
                            <option value="missing" ${query.queryType === 'missing' ? 'selected' : ''}>缺失資料</option>
                        </select>
                    </div>

                    <!-- 期望值 -->
                    <div class="col-md-6 mb-3">
                        <label class="form-label">期望值 (可選)</label>
                        ${this.isBinaryField(query.field, query.table) ? 
                            `<select class="form-control" onchange="QueryManager.onExpectedValueChange(${query.id}, this.value)">
                                ${this.generateBinaryFieldOptions(query.field, query.expectedValue)}
                            </select>` :
                            `<input type="text" class="form-control" value="${query.expectedValue}" 
                                onchange="QueryManager.onExpectedValueChange(${query.id}, this.value)"
                                placeholder="修正類型請填寫期望值">`
                        }
                    </div>
                </div>

                <!-- Query 問題 -->
                <div class="mb-3">
                    <label class="form-label">Query 問題 *</label>
                    <textarea class="form-control" rows="2" 
                        onchange="QueryManager.onQuestionChange(${query.id}, this.value)"
                        placeholder="請描述問題或需要澄清的內容..." required>${query.question}</textarea>
                </div>

                ${query.field ? `<small class="text-muted"><i class="fas fa-info-circle"></i> 欄位：${query.fieldName}</small>` : ''}
            </div>
        `;
    },
    
    /**
     * 資料表變更事件處理
     */
    onTableChange(queryId, tableValue) {
        const query = this.batchQueries.find(q => q.id === queryId);
        if (query) {
            query.table = tableValue;
            query.field = '';
            query.fieldName = '';
            query.currentValue = '';
            this.updateBatchQueriesUI();
        }
    },

    /**
     * 欄位變更事件處理
     */
    async onFieldChange(queryId, fieldValue) {
        const query = this.batchQueries.find(q => q.id === queryId);
        if (query && query.table) {
            query.field = fieldValue;
            const field = this.tableConfig[query.table].fields.find(f => f.id === fieldValue);
            query.fieldName = field ? field.name : '';
            
            // 清空期望值
            query.expectedValue = '';
            
            // 載入當前值
            if (fieldValue) {
                await this.loadFieldValue(queryId);
            } else {
                query.currentValue = '';
            }
            
            this.updateBatchQueriesUI();
        }
    },

    /**
     * Query 類型變更事件處理
     */
    onQueryTypeChange(queryId, typeValue) {
        const query = this.batchQueries.find(q => q.id === queryId);
        if (query) {
            query.queryType = typeValue;
            this.updateBatchQueriesUI();
        }
    },

    /**
     * 期望值變更事件處理
     */
    onExpectedValueChange(queryId, expectedValue) {
        const query = this.batchQueries.find(q => q.id === queryId);
        if (query) {
            query.expectedValue = expectedValue;
        }
    },

    /**
     * 問題變更事件處理
     */
    onQuestionChange(queryId, question) {
        const query = this.batchQueries.find(q => q.id === queryId);
        if (query) {
            query.question = question;
            this.updateBatchQueriesUI();
        }
    },

    /**
     * 載入欄位值
     */
    async loadFieldValue(queryId) {
        const query = this.batchQueries.find(q => q.id === queryId);
        if (!query || !query.table || !query.field) return;

        try {
            // 顯示載入中狀態
            query.currentValue = '載入中...';
            this.updateBatchQueriesUI();

            // 調用後端 API 獲取受試者完整資料
            const response = await fetch(`/edc/subject-detail-code/${this.currentSubjectCode}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const result = await response.json();
            
            if (result.success && result.data) {
                // 根據 table 選擇對應的資料源
                let sourceData = null;
                switch (query.table) {
                    case 'subjects':
                        sourceData = result.data.subject;
                        break;
                    case 'inclusion_criteria':
                        sourceData = result.data.inclusion_criteria;
                        break;
                    case 'exclusion_criteria':
                        sourceData = result.data.exclusion_criteria;
                        break;
                    default:
                        console.warn(`未知的資料表: ${query.table}`);
                        sourceData = null;
                }

                if (sourceData && sourceData.hasOwnProperty(query.field)) {
                    let fieldValue = sourceData[query.field];
                    
                    // 格式化特殊欄位值
                    fieldValue = this.formatFieldValue(query.field, fieldValue, query.table);
                    
                    query.currentValue = fieldValue !== null && fieldValue !== undefined ? String(fieldValue) : '無資料';
                } else {
                    query.currentValue = '無資料';
                }
            } else {
                console.error('獲取受試者資料失敗:', result.message || '未知錯誤');
                query.currentValue = '載入失敗';
            }
            
        } catch (error) {
            console.error('載入欄位值時發生錯誤:', error);
            query.currentValue = '載入失敗';
        }
    },

    /**
     * 格式化欄位值顯示
     * @param {string} fieldName - 欄位名稱
     * @param {any} fieldValue - 原始欄位值
     * @param {string} tableName - 資料表名稱
     * @returns {string} - 格式化後的顯示值
     */
    formatFieldValue(fieldName, fieldValue, tableName) {
        // 處理 null 或 undefined
        if (fieldValue === null || fieldValue === undefined) {
            return '無資料';
        }

        // 檢查是否為二擇一欄位
        if (this.isBinaryField(fieldName, tableName)) {
            // 性別欄位特殊處理
            if (fieldName === 'gender') {
                return fieldValue === 1 ? '男性' : fieldValue === 0 ? '女性' : String(fieldValue);
            }
            
            // 布林欄位處理
            return fieldValue === 1 ? '是' : fieldValue === 0 ? '否' : String(fieldValue);
        }

        // 數值欄位保留小數點
        if (typeof fieldValue === 'number') {
            // 如果是整數，不顯示小數點
            return fieldValue % 1 === 0 ? String(fieldValue) : fieldValue.toFixed(1);
        }

        // 其他欄位直接轉字串
        return String(fieldValue);
    },

    /**
     * 重新整理欄位值
     */
    async refreshFieldValue(queryId) {
        await this.loadFieldValue(queryId);
        this.updateBatchQueriesUI();
    },

    /**
     * 清空全部 Query
     */
    clearAllQueries() {
        if (this.batchQueries.length > 0) {
            if (confirm('確定要清空所有 Query 嗎？')) {
                this.batchQueries = [];
                this.updateBatchQueriesUI();
            }
        }
    },

    /**
     * 回應 Query
     * @param {string} batchId - Query 批次 ID
     * @param {string} responseType - 回應類型 (accept, reject, correct, explain)
     */
    respondToQuery: function(batchId, responseType) {
        console.log(`回應 Query: ${batchId}, 類型: ${responseType}`);
        
        // 根據回應類型顯示不同的對話框
        switch(responseType) {
            case 'accept':
                this.showAcceptQueryModal(batchId);
                break;
            case 'reject':
                this.showRejectQueryModal(batchId);
                break;
            case 'correct':
                this.showCorrectQueryModal(batchId);
                break;
            case 'explain':
                this.showExplainQueryModal(batchId);
                break;
            case 'completed':
                this.showCompleteQueryModal(batchId);
                break;
            default:
                console.error('未知的回應類型:', responseType);
        }
    },

    /**
     * 顯示接受 Query 的確認對話框
     * 用於確認當前數據值正確，不需要修改
     */
    showAcceptQueryModal: function(batchId) {
        const modal = `
            <div class="modal fade" id="acceptQueryModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="fas fa-check text-success"></i> 接受 Query
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="alert alert-info">
                                <i class="fas fa-info-circle"></i>
                                <strong>接受 Query：</strong>確認當前數據值正確，不需要修改
                            </div>
                            <p>您確定要接受這個 Query 嗎？</p>
                            <div class="mb-3">
                                <label for="acceptReason" class="form-label">接受原因（可選）:</label>
                                <textarea class="form-control" id="acceptReason" rows="3" placeholder="請說明接受的原因..."></textarea>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                            <button type="button" class="btn btn-success" onclick="QueryManager.submitQueryResponse('${batchId}', 'accept')">
                                <i class="fas fa-check"></i> 確認接受
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // 移除舊的 modal 並添加新的
        const oldModal = document.getElementById('acceptQueryModal');
        if (oldModal) oldModal.remove();
        
        document.body.insertAdjacentHTML('beforeend', modal);
        const modalElement = new bootstrap.Modal(document.getElementById('acceptQueryModal'));
        modalElement.show();
    },

    /**
     * 顯示拒絕 Query 的對話框
     */
    showRejectQueryModal: function(batchId) {
        const modal = `
            <div class="modal fade" id="rejectQueryModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="fas fa-times text-danger"></i> 拒絕 Query
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="alert alert-warning">
                                <i class="fas fa-exclamation-triangle"></i>
                                <strong>拒絕 Query：</strong>不同意 試驗監測者 的質疑，認為 Query 本身有問題
                            </div>
                            <p>請說明拒絕這個 Query 的原因：</p>
                            <div class="mb-3">
                                <label for="rejectReason" class="form-label">拒絕原因 <span class="text-danger">*</span>:</label>
                                <textarea class="form-control" id="rejectReason" rows="3" placeholder="請詳細說明拒絕的原因..." required></textarea>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                            <button type="button" class="btn btn-danger" onclick="QueryManager.submitQueryResponse('${batchId}', 'reject')">
                                <i class="fas fa-times"></i> 確認拒絕
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        const oldModal = document.getElementById('rejectQueryModal');
        if (oldModal) oldModal.remove();
        
        document.body.insertAdjacentHTML('beforeend', modal);
        const modalElement = new bootstrap.Modal(document.getElementById('rejectQueryModal'));
        modalElement.show();
    },

    /**
     * 顯示修正 Query 的對話框
     */
    showCorrectQueryModal: function(batchId) {
        const modal = `
            <div class="modal fade" id="correctQueryModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="fas fa-edit text-warning"></i> 修正 Query
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="alert alert-warning">
                                <i class="fas fa-edit"></i>
                                <strong>修正 Query：</strong>承認數據錯誤，需要修改為期望值
                            </div>
                            <p>請提供修正後的值：</p>
                            <div class="mb-3">
                                <label for="correctedValue" class="form-label">修正後的值 <span class="text-danger">*</span>:</label>
                                <input type="text" class="form-control" id="correctedValue" placeholder="請輸入修正後的值..." required>
                            </div>
                            <div class="mb-3">
                                <label for="correctReason" class="form-label">修正說明:</label>
                                <textarea class="form-control" id="correctReason" rows="3" placeholder="請說明修正的原因..."></textarea>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                            <button type="button" class="btn btn-warning" onclick="QueryManager.submitQueryResponse('${batchId}', 'correct')">
                                <i class="fas fa-edit"></i> 確認修正
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        const oldModal = document.getElementById('correctQueryModal');
        if (oldModal) oldModal.remove();
        
        document.body.insertAdjacentHTML('beforeend', modal);
        const modalElement = new bootstrap.Modal(document.getElementById('correctQueryModal'));
        modalElement.show();
    },

    /**
     * 顯示說明 Query 的對話框
     */
    showExplainQueryModal: function(batchId) {
        const modal = `
            <div class="modal fade" id="explainQueryModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="fas fa-comment text-info"></i> 說明 Query
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="alert alert-info">
                                <i class="fas fa-comment"></i>
                                <strong>說明 Query：</strong>提供額外的文字解釋
                            </div>
                            <p>請提供額外的說明：</p>
                            <div class="mb-3">
                                <label for="explainText" class="form-label">說明內容 <span class="text-danger">*</span>:</label>
                                <textarea class="form-control" id="explainText" rows="4" placeholder="請提供詳細的說明..." required></textarea>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                            <button type="button" class="btn btn-info" onclick="QueryManager.submitQueryResponse('${batchId}', 'explain')">
                                <i class="fas fa-comment"></i> 確認說明
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        const oldModal = document.getElementById('explainQueryModal');
        if (oldModal) oldModal.remove();
        
        document.body.insertAdjacentHTML('beforeend', modal);
        const modalElement = new bootstrap.Modal(document.getElementById('explainQueryModal'));
        modalElement.show();
    },

    /**
     * 顯示完成 Query 的確認對話框
     * 用於試驗監測者完成 Query
     */
    showCompleteQueryModal: function(batchId) {
        const modal = `
            <div class="modal fade" id="completeQueryModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="fas fa-check-circle text-success"></i> 完成 Query
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="alert alert-success">
                                <i class="fas fa-check-circle"></i>
                                <strong>完成 Query：</strong>確認 Query 已處理完成
                            </div>
                            <p>您確定要完成這個 Query 嗎？</p>
                            <div class="mb-3">
                                <label for="completeReason" class="form-label">完成說明（可選）:</label>
                                <textarea class="form-control" id="completeReason" rows="3" placeholder="請說明完成的原因..."></textarea>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                            <button type="button" class="btn btn-success" onclick="QueryManager.submitQueryResponse('${batchId}', 'completed')">
                                <i class="fas fa-check-circle"></i> 確認完成
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // 移除舊的 modal 並添加新的
        const oldModal = document.getElementById('completeQueryModal');
        if (oldModal) oldModal.remove();
        
        document.body.insertAdjacentHTML('beforeend', modal);
        const modalElement = new bootstrap.Modal(document.getElementById('completeQueryModal'));
        modalElement.show();
    },

    /**
     * 提交 Query 回應
     */
    submitQueryResponse: function(batchId, responseType) {
        console.log(`提交 Query 回應: ${batchId}, 類型: ${responseType}`);
        
        // 收集表單資料
        let responseData = {
            batch_id: batchId,
            response_type: responseType,
            response_text: '',
            corrected_value: null
        };
        
        // 映射前端按鈕類型到資料庫類型
        const typeMapping = {
            'accept': 'no_action',
            'reject': 'escalation', 
            'correct': 'correction',
            'explain': 'clarification',
            'completed': 'completed'
        };
        
        // 根據回應類型收集不同的資料
        switch(responseType) {
            case 'accept':
                responseData.response_text = document.getElementById('acceptReason').value || '已接受';
                break;
            case 'reject':
                responseData.response_text = document.getElementById('rejectReason').value;
                if (!responseData.response_text.trim()) {
                    alert('請填寫拒絕原因');
                    return;
                }
                break;
            case 'correct':
                responseData.corrected_value = document.getElementById('correctedValue').value;
                responseData.response_text = document.getElementById('correctReason').value || '已修正';
                if (!responseData.corrected_value.trim()) {
                    alert('請填寫修正後的值');
                    return;
                }
                break;
            case 'explain':
                responseData.response_text = document.getElementById('explainText').value;
                if (!responseData.response_text.trim()) {
                    alert('請填寫說明內容');
                    return;
                }
                break;
            case 'completed':
                responseData.response_text = document.getElementById('completeReason').value || '已完成';
                break;
        }
        
        // 添加資料庫映射類型
        responseData.db_response_type = typeMapping[responseType];
        
        // 調用後端 API
        this.callRespondToQueryAPI(responseData);
        
        // 關閉 modal
        const modal = document.querySelector('.modal.show');
        if (modal) {
            const modalInstance = bootstrap.Modal.getInstance(modal);
            if (modalInstance) modalInstance.hide();
        }
    },

    /**
     * 調用後端 API 回應 Query
     */
    callRespondToQueryAPI: function(responseData) {
        console.log('回應資料:', responseData);
        
        // 調用後端 API
        fetch(`/edc/query/${responseData.batch_id}/respond`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                batch_id: responseData.batch_id,
                response_text: responseData.response_text,
                response_type: responseData.db_response_type, // 使用資料庫映射類型
                corrected_value: responseData.corrected_value,
                responded_by: window.userId || 'system'
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Query 回應已提交！');
                // 重新載入 Query 列表
                if (typeof DataBrowserManager !== 'undefined' && DataBrowserManager.loadQueryList) {
                    DataBrowserManager.loadQueryList();
                }
                // 執行 openDataBrowser
                if (typeof openDataBrowser === 'function') {
                    openDataBrowser();
                }
            } else {
                alert('回應失敗：' + data.message);
            }
        })
        .catch(error => {
            console.error('API 調用失敗:', error);
            alert('回應失敗，請稍後再試');
        });
    }

};

// 全域匯出
if (typeof window !== 'undefined') {
    window.QueryManager = QueryManager;
}

// 模組匯出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = QueryManager;
}
