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
    initializeQueryForm() {
        // 清空批量 Query 資料
        this.batchQueries = [];
        this.queryCounter = 0;
        
        // 更新 UI
        this.updateBatchQueriesUI();
        
        console.log('批量 Query 表單初始化完成');
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
     * 載入欄位資料值和現有 Query
     */
    async loadFieldAndQueries() {
        await this.loadCurrentValue();
        await this.loadExistingQueries();
    },

    /**
     * 載入當前欄位的資料值
     */
    async loadCurrentValue() {
        const tableSelect = document.getElementById('tableSelect');
        const fieldSelect = document.getElementById('fieldSelect');
        const currentValueInput = document.getElementById('currentValue');
        
        if (!tableSelect || !fieldSelect || !currentValueInput) return;

        const tableName = tableSelect.value;
        const fieldName = fieldSelect.value;
        
        if (!tableName || !fieldName || !this.currentSubjectCode) {
            currentValueInput.value = '';
            return;
        }

        try {
            // 顯示載入狀態
            currentValueInput.value = '載入中...';
            
            // 呼叫 API 獲取當前值
            const response = await fetch(`/edc/query/current-value`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    subject_code: this.currentSubjectCode,
                    table_name: tableName,
                    field_name: fieldName
                })
            });

            const result = await response.json();
            
            if (result.success) {
                currentValueInput.value = result.current_value || '(無資料)';
            } else {
                currentValueInput.value = '無法載入';
                console.error('載入當前值失敗:', result.message);
            }
        } catch (error) {
            currentValueInput.value = '載入失敗';
            console.error('載入當前值時發生錯誤:', error);
        }
    },

    /**
     * 刷新當前值
     */
    async refreshCurrentValue() {
        await this.loadCurrentValue();
    },

    /**
     * 載入該欄位的現有 Query
     */
    async loadExistingQueries() {
        const tableSelect = document.getElementById('tableSelect');
        const fieldSelect = document.getElementById('fieldSelect');
        const existingQueriesSection = document.getElementById('existingQueriesSection');
        const existingQueriesList = document.getElementById('existingQueriesList');
        
        if (!tableSelect || !fieldSelect || !existingQueriesSection || !existingQueriesList) return;

        const tableName = tableSelect.value;
        const fieldName = fieldSelect.value;
        
        if (!tableName || !fieldName || !this.currentSubjectCode) {
            existingQueriesSection.style.display = 'none';
            return;
        }

        try {
            // 先使用模擬資料進行前端展示
            const mockFieldQueries = this.getMockFieldQueries(fieldName);
            
            if (mockFieldQueries.length > 0) {
                // 顯示現有 Query
                existingQueriesList.innerHTML = this.generateFieldQueriesHtml(mockFieldQueries, fieldName);
                existingQueriesSection.style.display = 'block';
            } else {
                // 沒有現有 Query，隱藏區域
                existingQueriesSection.style.display = 'none';
            }

            // TODO: 後續替換為真實 API 調用
            /*
            const response = await fetch(`/edc/query/existing`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    subject_code: this.currentSubjectCode,
                    table_name: tableName,
                    field_name: fieldName
                })
            });

            const result = await response.json();
            
            if (result.success && result.fieldQueries && result.fieldQueries.length > 0) {
                existingQueriesList.innerHTML = this.generateFieldQueriesHtml(result.fieldQueries, fieldName);
                existingQueriesSection.style.display = 'block';
            } else {
                existingQueriesSection.style.display = 'none';
            }
            */
        } catch (error) {
            console.error('載入現有 Query 時發生錯誤:', error);
            existingQueriesSection.style.display = 'none';
        }
    },

    /**
     * 獲取模擬的欄位 Query 資料
     * @param {string} fieldName - 欄位名稱
     * @returns {Array} - 模擬的 Query 陣列
     */
    getMockFieldQueries(fieldName) {
        // 模擬不同欄位的 Query 資料
        const mockData = {
            'age': [
                {
                    query_id: 'Q001',
                    field_name: 'age',
                    issue: '年齡與出生日期不符',
                    status: 'open',
                    created_at: '2025-01-15',
                    response_text: null
                },
                {
                    query_id: 'Q002', 
                    field_name: 'age',
                    issue: '請確認計算方式',
                    status: 'responded',
                    created_at: '2025-01-10',
                    response_text: '已重新計算，年齡正確'
                }
            ],
            'height_cm': [
                {
                    query_id: 'Q003',
                    field_name: 'height_cm',
                    issue: '身高數值異常，請確認',
                    status: 'open',
                    created_at: '2025-01-14',
                    response_text: null
                }
            ],
            'bmi': [
                {
                    query_id: 'Q004',
                    field_name: 'bmi',
                    issue: 'BMI 計算結果與身高體重不符',
                    status: 'closed',
                    created_at: '2025-01-12',
                    response_text: '已修正計算公式'
                },
                {
                    query_id: 'Q005',
                    field_name: 'bmi',
                    issue: '請提供精確到小數點後一位',
                    status: 'responded',
                    created_at: '2025-01-13',
                    response_text: '已更新為 24.3'
                }
            ]
        };

        return mockData[fieldName] || [];
    },

    /**
     * 生成欄位 Query 的 HTML (支援同一欄位多個 Query)
     * @param {Array} fieldQueries - 欄位 Query 列表
     * @param {string} fieldName - 欄位名稱
     * @returns {string} - HTML 字串
     */
    generateFieldQueriesHtml(fieldQueries, fieldName) {
        if (!fieldQueries || fieldQueries.length === 0) {
            return `<p class="text-muted mb-0"><i class="fas fa-info-circle"></i> 此欄位尚無 Query</p>`;
        }

        const fieldDisplayName = this.getFieldDisplayName('subjects', fieldName);
        let html = `
            <div class="field-queries">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h6 class="mb-0">
                        <i class="fas fa-list"></i> 
                        <strong>${fieldDisplayName}</strong> 的 Query 記錄 
                        <span class="badge bg-secondary">${fieldQueries.length}</span>
                    </h6>
                    <button type="button" class="btn btn-sm btn-outline-primary" onclick="QueryManager.addQuickQuery('${fieldName}')">
                        <i class="fas fa-plus"></i> 快速追加
                    </button>
                </div>
        `;
        
        // 按狀態分組顯示
        const groupedQueries = this.groupQueriesByStatus(fieldQueries);
        
        // 顯示開放中的 Query
        if (groupedQueries.open && groupedQueries.open.length > 0) {
            html += this.generateQueryGroup('開放中', groupedQueries.open, 'warning');
        }
        
        // 顯示已回應的 Query
        if (groupedQueries.responded && groupedQueries.responded.length > 0) {
            html += this.generateQueryGroup('已回應', groupedQueries.responded, 'info');
        }
        
        // 顯示已關閉的 Query (摺疊顯示)
        if (groupedQueries.closed && groupedQueries.closed.length > 0) {
            html += `
                <div class="query-group mb-2">
                    <div class="d-flex align-items-center mb-2">
                        <button class="btn btn-sm btn-outline-success me-2" type="button" data-bs-toggle="collapse" data-bs-target="#closedQueries" aria-expanded="false">
                            <i class="fas fa-chevron-right"></i>
                        </button>
                        <span class="text-success">
                            <i class="fas fa-check-circle"></i> 已關閉 
                            <span class="badge bg-success">${groupedQueries.closed.length}</span>
                        </span>
                    </div>
                    <div class="collapse" id="closedQueries">
                        ${this.generateQueryItems(groupedQueries.closed)}
                    </div>
                </div>
            `;
        }
        
        html += '</div>';
        return html;
    },

    /**
     * 按狀態分組 Query
     * @param {Array} queries - Query 列表
     * @returns {Object} - 分組後的 Query
     */
    groupQueriesByStatus(queries) {
        const grouped = {
            open: [],
            responded: [],
            closed: [],
            cancelled: []
        };
        
        queries.forEach(query => {
            if (grouped[query.status]) {
                grouped[query.status].push(query);
            }
        });
        
        return grouped;
    },

    /**
     * 生成 Query 群組 HTML
     * @param {string} title - 群組標題
     * @param {Array} queries - Query 列表
     * @param {string} colorClass - 顏色類別
     * @returns {string} - HTML 字串
     */
    generateQueryGroup(title, queries, colorClass) {
        return `
            <div class="query-group mb-3">
                <div class="d-flex align-items-center mb-2">
                    <span class="text-${colorClass}">
                        <i class="fas fa-${colorClass === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i> 
                        ${title} 
                        <span class="badge bg-${colorClass}">${queries.length}</span>
                    </span>
                </div>
                ${this.generateQueryItems(queries)}
            </div>
        `;
    },

    /**
     * 生成 Query 項目 HTML
     * @param {Array} queries - Query 列表
     * @returns {string} - HTML 字串
     */
    generateQueryItems(queries) {
        let html = '';
        
        queries.forEach((query, index) => {
            const statusClass = this.getStatusClass(query.status);
            const statusText = this.getStatusText(query.status);
            
            html += `
                <div class="query-item border rounded p-3 mb-2 ${query.status === 'open' ? 'border-warning bg-light' : ''}">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <div class="flex-grow-1">
                            <span class="badge ${statusClass} me-2">${statusText}</span>
                            <strong>${query.query_id}</strong>
                            <small class="text-muted ms-2">
                                <i class="fas fa-calendar"></i> ${query.created_at || ''}
                            </small>
                        </div>
                        <div class="btn-group btn-group-sm">
                            <button type="button" class="btn btn-outline-secondary" onclick="QueryManager.viewQueryDetail('${query.query_id}')" title="查看詳情">
                                <i class="fas fa-eye"></i>
                            </button>
                            ${query.status === 'open' ? `
                                <button type="button" class="btn btn-outline-warning" onclick="QueryManager.editQuery('${query.query_id}')" title="編輯">
                                    <i class="fas fa-edit"></i>
                                </button>
                            ` : ''}
                        </div>
                    </div>
                    <div class="query-content">
                        <p class="mb-2">
                            <i class="fas fa-question-circle text-primary"></i> 
                            <strong>問題：</strong>${query.issue}
                        </p>
                        ${query.response_text ? `
                            <p class="mb-0 text-success">
                                <i class="fas fa-reply"></i> 
                                <strong>回應：</strong>${query.response_text}
                            </p>
                        ` : `
                            <p class="mb-0 text-muted">
                                <i class="fas fa-clock"></i> 等待回應中...
                            </p>
                        `}
                    </div>
                </div>
            `;
        });
        
        return html;
    },

    /**
     * 獲取狀態樣式類別
     * @param {string} status - 狀態
     * @returns {string} - CSS 類別
     */
    getStatusClass(status) {
        const statusClasses = {
            'open': 'bg-warning',
            'responded': 'bg-info',
            'closed': 'bg-success',
            'cancelled': 'bg-secondary'
        };
        return statusClasses[status] || 'bg-secondary';
    },

    /**
     * 獲取狀態文字
     * @param {string} status - 狀態
     * @returns {string} - 狀態文字
     */
    getStatusText(status) {
        const statusTexts = {
            'open': '開放中',
            'responded': '已回應',
            'closed': '已關閉',
            'cancelled': '已取消'
        };
        return statusTexts[status] || status;
    },



    /**
     * 提交 Query
     */
    async submitQuery() {
        // 如果有批量 Query，則使用批量提交
        if (this.batchQueries.length > 0) {
            return await this.submitBatchQueries();
        }
        
        // 原有的單個 Query 提交邏輯
        const form = document.getElementById('queryForm');
        if (!form) return;

        // 驗證表單
        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return;
        }

        // 收集表單資料（精簡版）
        const formData = {
            subject_code: this.currentSubjectCode,
            table_name: document.getElementById('tableSelect').value,
            field_name: document.getElementById('fieldSelect').value,
            query_type: document.getElementById('queryType').value,
            question: document.getElementById('queryQuestion').value,
            current_value: document.getElementById('currentValue').value,
            expected_value: document.getElementById('expectedValue').value || null
        };

        try {
            // 顯示載入狀態
            const submitBtn = document.querySelector('#queryModal .btn-warning');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 發起中...';
            submitBtn.disabled = true;

            // 發送請求
            const response = await fetch('/edc/query/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (result.success) {
                // 成功提示
                const fieldDisplayName = this.getFieldDisplayName(formData.table_name, formData.field_name);
                alert(`✅ Query 已成功發起！\n\nQuery ID: ${result.query_id}\n受試者: ${formData.subject_code}\n問題欄位: ${fieldDisplayName}\n類型: ${formData.query_type}`);
                
                // 關閉 modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('queryModal'));
                modal.hide();
                
                console.log('Query 發起成功:', result);
            } else {
                alert(`❌ Query 發起失敗：${result.message}`);
            }
        } catch (error) {
            console.error('提交 Query 時發生錯誤:', error);
            alert('❌ Query 發起失敗，請稍後再試');
        } finally {
            // 恢復按鈕狀態
            const submitBtn = document.querySelector('#queryModal .btn-warning');
            if (submitBtn) {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
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

    /**
     * 重新整理現有 Query 列表
     */
    async refreshExistingQueries() {
        await this.loadExistingQueries();
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
            submitQueryBtn.disabled = this.batchQueries.length === 0 || !this.validateAllQueries();
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
                        <i class="fas fa-trash"></i>
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
                        <input type="text" class="form-control" value="${query.expectedValue}" 
                            onchange="QueryManager.onExpectedValueChange(${query.id}, this.value)"
                            placeholder="修正類型請填寫期望值">
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
     * 驗證所有 Query
     */
    validateAllQueries() {
        return this.batchQueries.every(query => 
            query.table && query.field && query.queryType && query.question.trim()
        );
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
            // TODO: 實作真實 API 調用
            // 暫時使用模擬資料
            const mockValues = {
                'age': '25',
                'height_cm': '175.0',
                'weight_kg': '70.0',
                'bmi': '22.9',
                'gender': '男性'
            };
            
            query.currentValue = mockValues[query.field] || '無資料';
            
        } catch (error) {
            console.error('載入欄位值時發生錯誤:', error);
            query.currentValue = '載入失敗';
        }
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
     * 提交批量 Query
     */
    async submitBatchQueries() {
        if (!this.validateAllQueries()) {
            alert('請完整填寫所有 Query 的必填欄位');
            return;
        }

        const submitBtn = document.getElementById('submitQueryBtn');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 提交中...';
        }

        try {
            // 準備提交資料
            const batchData = {
                subject_code: this.currentSubjectCode,
                queries: this.batchQueries.map(query => ({
                    table_name: query.table,
                    field_name: query.field,
                    query_type: query.queryType,
                    expected_value: query.expectedValue,
                    question: query.question,
                    current_value: query.currentValue
                }))
            };

            console.log('批量 Query 資料:', batchData);

            // 暫時使用模擬成功
            setTimeout(() => {
                alert(`成功發起 ${this.batchQueries.length} 個 Query！\n\n${this.batchQueries.map(q => `• ${q.fieldName}: ${q.question.substring(0, 30)}...`).join('\n')}`);
                
                // 關閉 modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('queryModal'));
                if (modal) modal.hide();
            }, 1000);

        } catch (error) {
            console.error('提交批量 Query 時發生錯誤:', error);
            alert('提交失敗：' + error.message);
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> 發起 Query';
            }
        }
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
