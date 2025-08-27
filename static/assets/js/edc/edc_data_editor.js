// EDC 系統編輯資料功能檔案
// 包含資料載入、編輯、變更追蹤和更新提交功能

/**
 * 資料編輯管理器
 */
const DataEditorManager = {
    // 當前編輯的記錄
    currentRecord: null,
    
    // 原始資料（用於比較變更）
    originalData: null,
    
    // 變更追蹤
    changes: {},
    
    // 編輯模式
    editMode: false,
    
    /**
     * 初始化資料編輯器
     */
    init() {
        this.setupEventListeners();
        this.setupFormValidation();
        this.setupAutoSave();
    },
    
    /**
     * 設置事件監聽器
     */
    setupEventListeners() {
        // 儲存按鈕
        const saveBtn = document.getElementById('saveChangesBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveChanges());
        }
        
        // 取消按鈕
        const cancelBtn = document.getElementById('cancelChangesBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.cancelChanges());
        }
        
        // 提交按鈕
        const submitBtn = document.getElementById('submitChangesBtn');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => this.submitChanges());
        }
        
        // 表單欄位變更監聽
        this.setupFieldChangeListeners();
    },
    
    /**
     * 設置表單驗證
     */
    setupFormValidation() {
        // 受試者代碼格式驗證
        const subjectCodeInput = document.getElementById('subjectCode');
        if (subjectCodeInput) {
            subjectCodeInput.addEventListener('input', () => this.validateSubjectCode());
        }
        
        // 出生日期變化時自動計算年齡
        const birthDateInput = document.getElementById('birthDate');
        if (birthDateInput) {
            birthDateInput.addEventListener('change', () => this.calculateAge());
        }
        
        // 身高體重輸入時自動計算BMI
        const heightInput = document.getElementById('height');
        const weightInput = document.getElementById('weight');
        if (heightInput && weightInput) {
            heightInput.addEventListener('input', () => this.calculateBMI());
            weightInput.addEventListener('input', () => this.calculateBMI());
        }
        
        // 肌酸酐輸入時自動計算eGFR
        const creatinineInput = document.getElementById('creatinine');
        if (creatinineInput) {
            creatinineInput.addEventListener('input', () => this.calculateEGFR());
        }
        
        // 病史選擇事件監聽器
        this.setupHistoryValidation();
        
        // 影像檢查類型驗證
        const imgTypeRadios = document.querySelectorAll('input[name="imgType"]');
        imgTypeRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                this.validateImageType();
                this.updateInclusionCriteria();
            });
        });
        
        // 影像日期驗證
        const imgDateInput = document.getElementById('imgDate');
        if (imgDateInput) {
            imgDateInput.addEventListener('change', () => this.validateImageDate());
        }
    },
    
    /**
     * 設置欄位變更監聽器
     */
    setupFieldChangeListeners() {
        const formFields = document.querySelectorAll('input, select, textarea');
        formFields.forEach(field => {
            field.addEventListener('change', () => this.trackFieldChange(field));
            field.addEventListener('input', () => this.trackFieldChange(field));
        });
    },
    
    /**
     * 設置自動儲存
     */
    setupAutoSave() {
        // 每30秒自動儲存草稿
        setInterval(() => {
            if (this.editMode && Object.keys(this.changes).length > 0) {
                this.autoSaveDraft();
            }
        }, 30000);
    },
    
    /**
     * 載入記錄進行編輯
     */
    async loadRecordForEdit(recordId) {
        try {
            LoadingManager.show();
            
            const response = await fetch(`/edc/get-record/${recordId}`);
            const result = await response.json();
            
            if (result.success) {
                this.currentRecord = result.data;
                this.originalData = deepClone(result.data);
                this.changes = {};
                this.editMode = true;
                
                this.populateForm();
                this.enableEditing();
                this.showEditMode();
                
                showSuccessMessage('記錄載入成功，可以開始編輯');
            } else {
                showErrorMessage(`載入記錄失敗：${result.message}`);
            }
            
        } catch (error) {
            console.error('載入記錄失敗:', error);
            showErrorMessage('載入記錄失敗，請稍後再試');
        } finally {
            LoadingManager.hide();
        }
    },
    
    /**
     * 填充表單資料
     */
    populateForm() {
        if (!this.currentRecord) return;
        
        const record = this.currentRecord;
        
        // 基本資料
        this.setFieldValue('enrollDate', record.enroll_date);
        this.setFieldValue('subjectCode', record.subject_code);
        this.setFieldValue('birthDate', record.date_of_birth);
        this.setFieldValue('age', record.age);
        this.setFieldValue('height', record.height_cm);
        this.setFieldValue('weight', record.weight_kg);
        this.setFieldValue('bmi', record.bmi);
        
        // 性別
        this.setRadioValue('gender', record.gender);
        
        // 檢驗資料
        this.setFieldValue('biochemDate', record.biochem_date);
        this.setFieldValue('creatinine', record.creatinine);
        this.setFieldValue('egfr', record.egfr);
        this.setFieldValue('urineDate', record.urine_date);
        this.setFieldValue('ph', record.urine_ph);
        this.setFieldValue('sg', record.urine_sg);
        this.setFieldValue('urinalysisDate', record.urinalysis_date);
        this.setFieldValue('rbc', record.urine_rbc);
        this.setRadioValue('bacteriuria', record.bacteriuria);
        
        // 病史
        this.setRadioValue('dm', record.dm);
        this.setRadioValue('gout', record.gout);
        this.setFieldValue('dmDate', record.dm_date);
        this.setFieldValue('goutDate', record.gout_date);
        
        // 影像資料
        this.setRadioValue('imgType', record.imaging_type);
        this.setFieldValue('imgDate', record.imaging_date);
        this.setRadioValue('stone', record.kidney_stone_diagnosis);
        this.setFieldValue('imgReadingReport', record.imaging_report_summary);
        
        // 納入條件
        this.populateInclusionCriteria(record.inclusion_data);
        
        // 排除條件
        this.populateExclusionCriteria(record.exclusion_data);
        
        // 藥物和手術資料
        this.populateTreatmentData(record.inclusion_data);
    },
    
    /**
     * 設置欄位值
     */
    setFieldValue(fieldId, value) {
        const field = document.getElementById(fieldId);
        if (field && value !== undefined && value !== null) {
            field.value = value;
        }
    },
    
    /**
     * 設置單選按鈕值
     */
    setRadioValue(name, value) {
        const radio = document.querySelector(`input[name="${name}"][value="${value}"]`);
        if (radio) {
            radio.checked = true;
        }
    },
    
    /**
     * 填充納入條件
     */
    populateInclusionCriteria(inclusionData) {
        if (!inclusionData) return;
        
        const criteriaMapping = {
            'age_18_above': 'age18',
            'gender_available': 'hasGender',
            'age_available': 'hasAge',
            'bmi_available': 'hasBMI',
            'dm_history_available': 'hasDMHistory',
            'gout_history_available': 'hasGoutHistory',
            'egfr_available': 'hasEGFR',
            'urine_ph_available': 'hasUrinePH',
            'urine_sg_available': 'hasUrineSG',
            'urine_rbc_available': 'hasUrineRBC',
            'bacteriuria_available': 'hasBacteriuria',
            'lab_interval_7days': 'labTimeWithin7',
            'imaging_available': 'hasImagingData',
            'imaging_lab_interval_7days': 'imgLabWithin7'
        };
        
        Object.entries(criteriaMapping).forEach(([sourceKey, targetId]) => {
            const checkbox = document.getElementById(targetId);
            if (checkbox && inclusionData[sourceKey] !== undefined) {
                checkbox.checked = inclusionData[sourceKey] === 1;
            }
        });
    },
    
    /**
     * 填充排除條件
     */
    populateExclusionCriteria(exclusionData) {
        if (!exclusionData) return;
        
        const criteriaMapping = {
            'pregnant_female': 'pregnantFemale',
            'kidney_transplant': 'kidneyTransplant',
            'urinary_tract_foreign_body': 'urinaryForeignBody',
            'non_stone_urological_disease': 'urinarySystemLesion',
            'renal_replacement_therapy': 'renalReplacementTherapy',
            'medical_record_incomplete': 'missingData',
            'major_blood_immune_cancer': 'hematologicalDisease',
            'rare_metabolic_disease': 'rareMetabolicDisease',
            'investigator_judgment': 'piJudgment'
        };
        
        Object.entries(criteriaMapping).forEach(([sourceKey, targetId]) => {
            const radio = document.querySelector(`input[name="${targetId}"][value="yes"]`);
            if (radio && exclusionData[sourceKey] !== undefined) {
                radio.checked = exclusionData[sourceKey] === 1;
            }
        });
    },
    
    /**
     * 填充治療資料
     */
    populateTreatmentData(inclusionData) {
        if (!inclusionData) return;
        
        // 藥物資料
        if (inclusionData.medications && inclusionData.medications.length > 0) {
            this.populateMedications(inclusionData.medications);
        }
        
        // 手術資料
        if (inclusionData.surgeries && inclusionData.surgeries.length > 0) {
            this.populateSurgeries(inclusionData.surgeries);
        }
    },
    
    /**
     * 填充藥物資料
     */
    populateMedications(medications) {
        const drugList = document.getElementById('drugList');
        if (!drugList) return;
        
        drugList.innerHTML = '';
        medications.forEach(med => {
            this.addDrug(med.date, med.name);
        });
    },
    
    /**
     * 填充手術資料
     */
    populateSurgeries(surgeries) {
        const surgList = document.getElementById('surgList');
        if (!surgList) return;
        
        surgList.innerHTML = '';
        surgeries.forEach(surg => {
            this.addSurg(surg.date, surg.name);
        });
    },
    
    /**
     * 新增藥物項目
     */
    addDrug(date = '', name = '') {
        const id = generateUniqueId();
        const wrap = document.createElement('div');
        wrap.className = 'row block fade-in';
        wrap.innerHTML = `
            <input type="date" aria-label="藥物開立日期" value="${date}" />
            <input type="text" placeholder="藥物名稱" value="${name}" />
            <button class="btn-ghost" type="button" onclick="DataEditorManager.removeItem(this)">刪除</button>
        `;
        document.getElementById('drugList').appendChild(wrap);
    },
    
    /**
     * 新增手術項目
     */
    addSurg(date = '', name = '') {
        const wrap = document.createElement('div');
        wrap.className = 'row block fade-in';
        wrap.innerHTML = `
            <input type="date" aria-label="手術日期" value="${date}" />
            <input type="text" placeholder="手術名稱" value="${name}" />
            <button class="btn-ghost" type="button" onclick="DataEditorManager.removeItem(this)">刪除</button>
        `;
        document.getElementById('surgList').appendChild(wrap);
    },
    
    /**
     * 移除項目
     */
    removeItem(button) {
        button.parentElement.remove();
    },
    
    /**
     * 啟用編輯模式
     */
    enableEditing() {
        const formFields = document.querySelectorAll('input, select, textarea');
        formFields.forEach(field => {
            if (!field.hasAttribute('readonly')) {
                field.removeAttribute('disabled');
            }
        });
    },
    
    /**
     * 顯示編輯模式
     */
    showEditMode() {
        const editButtons = document.getElementById('editActionButtons');
        if (editButtons) {
            editButtons.style.display = 'block';
        }
        
        // 顯示變更追蹤
        this.showChangeTracker();
    },
    
    /**
     * 顯示變更追蹤
     */
    showChangeTracker() {
        const changeTracker = document.getElementById('changeTracker');
        if (changeTracker) {
            changeTracker.style.display = 'block';
            this.updateChangeTracker();
        }
    },
    
    /**
     * 追蹤欄位變更
     */
    trackFieldChange(field) {
        const fieldName = field.name || field.id;
        if (!fieldName) return;
        
        const currentValue = this.getFieldValue(field);
        const originalValue = this.getOriginalValue(fieldName);
        
        if (currentValue !== originalValue) {
            this.changes[fieldName] = {
                original: originalValue,
                current: currentValue,
                timestamp: new Date().toISOString()
            };
        } else {
            delete this.changes[fieldName];
        }
        
        this.updateChangeTracker();
        this.updateSaveButton();
    },
    
    /**
     * 獲取欄位值
     */
    getFieldValue(field) {
        if (field.type === 'checkbox' || field.type === 'radio') {
            return field.checked ? field.value : '';
        }
        return field.value;
    },
    
    /**
     * 獲取原始值
     */
    getOriginalValue(fieldName) {
        if (!this.originalData) return '';
        
        // 根據欄位名稱映射到原始資料的鍵
        const fieldMapping = {
            'enrollDate': 'enroll_date',
            'subjectCode': 'subject_code',
            'birthDate': 'date_of_birth',
            'age': 'age',
            'height': 'height_cm',
            'weight': 'weight_kg',
            'bmi': 'bmi',
            'gender': 'gender',
            'biochemDate': 'biochem_date',
            'creatinine': 'creatinine',
            'egfr': 'egfr',
            'urineDate': 'urine_date',
            'ph': 'urine_ph',
            'sg': 'urine_sg',
            'urinalysisDate': 'urinalysis_date',
            'rbc': 'urine_rbc',
            'bacteriuria': 'bacteriuria',
            'dm': 'dm',
            'gout': 'gout',
            'dmDate': 'dm_date',
            'goutDate': 'gout_date',
            'imgType': 'imaging_type',
            'imgDate': 'imaging_date',
            'stone': 'kidney_stone_diagnosis',
            'imgReadingReport': 'imaging_report_summary'
        };
        
        const originalKey = fieldMapping[fieldName] || fieldName;
        return this.originalData[originalKey] || '';
    },
    
    /**
     * 更新變更追蹤器
     */
    updateChangeTracker() {
        const changeList = document.getElementById('changeList');
        if (!changeList) return;
        
        if (Object.keys(this.changes).length === 0) {
            changeList.innerHTML = '<p class="text-muted">無變更</p>';
            return;
        }
        
        let html = '';
        Object.entries(this.changes).forEach(([fieldName, change]) => {
            html += `
                <div class="change-item">
                    <strong>${this.getFieldDisplayName(fieldName)}</strong>
                    <div class="change-details">
                        <span class="original-value">原值: ${change.original || '空'}</span>
                        <span class="arrow">→</span>
                        <span class="current-value">新值: ${change.current || '空'}</span>
                    </div>
                    <small class="change-time">${formatDateTime(change.timestamp)}</small>
                </div>
            `;
        });
        
        changeList.innerHTML = html;
    },
    
    /**
     * 更新儲存按鈕狀態
     */
    updateSaveButton() {
        const saveBtn = document.getElementById('saveChangesBtn');
        if (saveBtn) {
            saveBtn.disabled = Object.keys(this.changes).length === 0;
        }
    },
    
    /**
     * 取得欄位顯示名稱
     */
    getFieldDisplayName(fieldName) {
        const fieldNames = {
            'enrollDate': '收案日期',
            'subjectCode': '受試者代碼',
            'birthDate': '出生日期',
            'age': '年齡',
            'height': '身高',
            'weight': '體重',
            'bmi': 'BMI',
            'gender': '性別',
            'biochemDate': '生化檢驗日期',
            'creatinine': '肌酸酐',
            'egfr': 'eGFR',
            'urineDate': '尿液檢驗日期',
            'ph': '尿液pH',
            'sg': '尿液比重',
            'urinalysisDate': '尿液鏡檢日期',
            'rbc': '尿液RBC',
            'bacteriuria': '菌尿症',
            'dm': '糖尿病病史',
            'gout': '痛風病史',
            'dmDate': '糖尿病診斷日期',
            'goutDate': '痛風診斷日期',
            'imgType': '影像檢查類型',
            'imgDate': '影像檢查日期',
            'stone': '腎結石診斷',
            'imgReadingReport': '影像報告摘要'
        };
        return fieldNames[fieldName] || fieldName;
    },
    
    /**
     * 儲存變更
     */
    async saveChanges() {
        if (Object.keys(this.changes).length === 0) {
            showWarningMessage('沒有變更需要儲存');
            return;
        }
        
        try {
            LoadingManager.show();
            
            const response = await fetch('/edc/save-changes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    recordId: this.currentRecord.id,
                    changes: this.changes,
                    timestamp: new Date().toISOString()
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                showSuccessMessage('變更已儲存');
                
                // 更新原始資料
                this.originalData = deepClone(this.currentRecord);
                this.changes = {};
                this.updateChangeTracker();
                this.updateSaveButton();
                
                // 記錄變更歷史
                this.recordChangeHistory();
            } else {
                showErrorMessage(`儲存失敗：${result.message}`);
            }
            
        } catch (error) {
            console.error('儲存失敗:', error);
            showErrorMessage('儲存失敗，請稍後再試');
        } finally {
            LoadingManager.hide();
        }
    },
    
    /**
     * 取消變更
     */
    cancelChanges() {
        if (Object.keys(this.changes).length > 0) {
            if (confirm('確定要取消所有變更嗎？')) {
                this.resetForm();
                this.changes = {};
                this.updateChangeTracker();
                this.updateSaveButton();
                showWarningMessage('已取消所有變更');
            }
        }
    },
    
    /**
     * 重置表單
     */
    resetForm() {
        if (this.originalData) {
            this.currentRecord = deepClone(this.originalData);
            this.populateForm();
        }
    },
    
    /**
     * 提交變更
     */
    async submitChanges() {
        if (Object.keys(this.changes).length === 0) {
            showWarningMessage('沒有變更需要提交');
            return;
        }
        
        if (!this.validateAllFields()) {
            showErrorMessage('請完成所有必填檢核項目');
            return;
        }
        
        try {
            LoadingManager.show();
            
            const response = await fetch('/edc/submit-changes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    recordId: this.currentRecord.id,
                    changes: this.changes,
                    timestamp: new Date().toISOString()
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                showSuccessMessage('變更已提交成功');
                
                // 更新記錄狀態
                this.currentRecord.status = 'submitted';
                this.originalData = deepClone(this.currentRecord);
                this.changes = {};
                
                // 退出編輯模式
                this.exitEditMode();
                
            } else {
                showErrorMessage(`提交失敗：${result.message}`);
            }
            
        } catch (error) {
            console.error('提交失敗:', error);
            showErrorMessage('提交失敗，請稍後再試');
        } finally {
            LoadingManager.hide();
        }
    },
    
    /**
     * 退出編輯模式
     */
    exitEditMode() {
        this.editMode = false;
        this.currentRecord = null;
        this.originalData = null;
        this.changes = {};
        
        // 隱藏編輯按鈕
        const editButtons = document.getElementById('editActionButtons');
        if (editButtons) {
            editButtons.style.display = 'none';
        }
        
        // 隱藏變更追蹤
        const changeTracker = document.getElementById('changeTracker');
        if (changeTracker) {
            changeTracker.style.display = 'none';
        }
        
        // 禁用表單
        this.disableForm();
    },
    
    /**
     * 禁用表單
     */
    disableForm() {
        const formFields = document.querySelectorAll('input, select, textarea');
        formFields.forEach(field => {
            if (!field.hasAttribute('readonly')) {
                field.setAttribute('disabled', 'disabled');
            }
        });
    },
    
    /**
     * 記錄變更歷史
     */
    recordChangeHistory() {
        // 實現變更歷史記錄邏輯
        console.log('記錄變更歷史:', this.changes);
    },
    
    /**
     * 自動儲存草稿
     */
    async autoSaveDraft() {
        try {
            const response = await fetch('/edc/auto-save-draft', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    recordId: this.currentRecord.id,
                    changes: this.changes,
                    timestamp: new Date().toISOString()
                })
            });
            
            if (response.ok) {
                console.log('草稿自動儲存成功');
            }
            
        } catch (error) {
            console.error('自動儲存草稿失敗:', error);
        }
    },
    
    // 驗證和計算函數（重用現有邏輯）
    validateSubjectCode() {
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
    },
    
    calculateAge() {
        const birthDateInput = document.getElementById('birthDate');
        const ageInput = document.getElementById('age');
        
        if (birthDateInput && ageInput && birthDateInput.value) {
            const age = calculateAge(birthDateInput.value);
            if (age !== null) {
                ageInput.value = age;
                this.trackFieldChange(ageInput);
            }
        }
    },
    
    calculateBMI() {
        const heightInput = document.getElementById('height');
        const weightInput = document.getElementById('weight');
        const bmiInput = document.getElementById('bmi');
        
        if (heightInput && weightInput && bmiInput) {
            const height = parseFloat(heightInput.value);
            const weight = parseFloat(weightInput.value);
            
            if (height > 0 && weight > 0) {
                const bmiResult = calculateBMI(height, weight);
                if (bmiResult.isValid) {
                    bmiInput.value = bmiResult.bmi;
                    bmiInput.setAttribute('data-precise-value', bmiResult.preciseBMI);
                    this.trackFieldChange(bmiInput);
                }
            }
        }
    },
    
    calculateEGFR() {
        const creatinineInput = document.getElementById('creatinine');
        const egfrInput = document.getElementById('egfr');
        const ageInput = document.getElementById('age');
        const genderInputs = document.querySelectorAll('input[name="gender"]:checked');
        
        if (creatinineInput && egfrInput && ageInput && genderInputs.length > 0) {
            const creatinine = parseFloat(creatinineInput.value);
            const age = parseFloat(ageInput.value);
            const gender = genderInputs[0].value === '1' ? 'male' : 'female';
            
            if (creatinine > 0 && age > 0) {
                const egfrResult = calculateEGFR(creatinine, age, gender);
                if (egfrResult.isValid) {
                    egfrInput.value = egfrResult.egfr;
                    egfrInput.setAttribute('data-precise-value', egfrResult.preciseEGFR);
                    this.trackFieldChange(egfrInput);
                }
            }
        }
    },
    
    setupHistoryValidation() {
        // 糖尿病病史選擇事件
        const dmRadios = document.querySelectorAll('input[name="dm"]');
        dmRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                DataEditorManager.toggleHistoryDateSection('dm', this.value);
                DataEditorManager.validateHistorySelection('dm');
            });
        });
        
        // 痛風病史選擇事件
        const goutRadios = document.querySelectorAll('input[name="gout"]');
        goutRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                DataEditorManager.toggleHistoryDateSection('gout', this.value);
                DataEditorManager.validateHistorySelection('gout');
            });
        });
    },
    
    toggleHistoryDateSection(type, value) {
        const dateSection = document.getElementById(`${type}DateSection`);
        if (dateSection) {
            dateSection.style.display = value === 'yes' ? 'block' : 'none';
        }
    },
    
    validateHistorySelection(type) {
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
    },
    
    validateImageType() {
        const selectedRadio = document.querySelector('input[name="imgType"]:checked');
        const error = document.getElementById('imgTypeErr');
        
        if (!selectedRadio) {
            error.hidden = false;
        } else {
            error.hidden = true;
        }
    },
    
    validateImageDate() {
        const imgDate = document.getElementById('imgDate');
        const biochemDate = document.getElementById('biochemDate');
        const error = document.getElementById('imgDateErr');
        
        if (imgDate.value && biochemDate.value) {
            const imgDateObj = new Date(imgDate.value);
            const biochemDateObj = new Date(biochemDate.value);
            const today = new Date();
            
            if (imgDateObj > today) {
                error.hidden = false;
                error.textContent = '影像日期不可為未來日期';
                imgDate.style.borderColor = 'var(--danger)';
                return;
            }
            
            const diffDays = getDaysDifference(imgDateObj, biochemDateObj);
            
            if (diffDays > 7) {
                error.hidden = false;
                error.textContent = '影像與檢驗資料之時間間隔不可超過7日';
                imgDate.style.borderColor = 'var(--danger)';
            } else {
                error.hidden = true;
                imgDate.style.borderColor = 'var(--line)';
            }
        }
    },
    
    updateInclusionCriteria() {
        // 實現納入條件更新邏輯
        console.log('更新納入條件');
    },
    
    validateAllFields() {
        // 實現完整表單驗證邏輯
        return true;
    }
};

/**
 * 初始化資料編輯器
 */
function initDataEditor() {
    DataEditorManager.init();
}

/**
 * 打開資料編輯功能
 */
function openDataEditor() {
    // 顯示資料編輯介面
    const mainContent = document.getElementById('mainContent');
    if (mainContent) {
        mainContent.innerHTML = generateDataEditorHTML();
        initDataEditor();
    }
}

/**
 * 生成資料編輯 HTML
 */
function generateDataEditorHTML() {
    return `
        <div class="edc-data-editor">
            <div class="card">
                <div class="card-header">
                    <h3><i class="fas fa-edit"></i> 編輯資料</h3>
                    <p class="text-muted">修改和更新試驗資料</p>
                </div>
                <div class="card-body">
                    <!-- 變更追蹤器 -->
                    <div id="changeTracker" class="change-tracker mb-4" style="display: none;">
                        <h5><i class="fas fa-history"></i> 變更追蹤</h5>
                        <div id="changeList" class="change-list">
                            <p class="text-muted">無變更</p>
                        </div>
                    </div>
                    
                    <!-- 編輯表單 -->
                    <form id="editForm">
                        <!-- 表單內容將由 populateForm 填充 -->
                        <div class="text-center py-5">
                            <i class="fas fa-spinner fa-spin fa-2x text-muted"></i>
                            <p class="text-muted mt-2">載入中...</p>
                        </div>
                    </form>
                    
                    <!-- 編輯操作按鈕 -->
                    <div id="editActionButtons" class="edit-actions mt-4" style="display: none;">
                        <div class="btn-group" role="group">
                            <button type="button" id="saveChangesBtn" class="btn btn-primary" disabled>
                                <i class="fas fa-save"></i> 儲存變更
                            </button>
                            <button type="button" id="cancelChangesBtn" class="btn btn-secondary">
                                <i class="fas fa-undo"></i> 取消變更
                            </button>
                            <button type="button" id="submitChangesBtn" class="btn btn-success">
                                <i class="fas fa-paper-plane"></i> 提交變更
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// 匯出功能供其他模組使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        DataEditorManager,
        initDataEditor,
        openDataEditor,
        generateDataEditorHTML
    };
}
