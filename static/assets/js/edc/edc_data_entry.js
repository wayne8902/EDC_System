// EDC 系統資料輸入功能檔案
// 包含新增資料的表單處理、驗證和資料提交功能

// 研究人員表單管理器
const DataEntryManager = {
    currentForm: null,
    formData: {},
    autoSaveTimer: null,
    autoSaveInterval: 30000,
    
    init() {
        this.setupEventListeners();
        this.loadUserPreferences();
        console.log('資料輸入模組已初始化');
    },
    
    setupEventListeners() {
        // 監聽表單提交
        document.addEventListener('submit', (e) => {
            if (e.target.classList.contains('researcher-form')) {
                e.preventDefault();
                this.handleFormSubmit(e.target);
            }
        });
        
        // 監聽欄位變更
        document.addEventListener('change', (e) => {
            if (e.target.closest('.researcher-form')) {
                this.handleFieldChange(e.target);
            }
        });
        
        // 監聽欄位輸入
        document.addEventListener('input', (e) => {
            if (e.target.closest('.researcher-form')) {
                this.handleFieldInput(e.target);
            }
        });
    },
    
    loadUserPreferences() {
        const savedInterval = localStorage.getItem('edc_auto_save_interval');
        if (savedInterval) {
            this.autoSaveInterval = parseInt(savedInterval);
        }
    },
    
    async handleFormSubmit(form) {
        if (this.validateForm(form)) {
            const formData = this.collectFormData(form);
            await this.submitData(formData);
        }
    },
    
    validateForm(form) {
        const errors = [];
        
        // 檢查必填欄位
        const requiredFields = ['enrollDate', 'subjectCode', 'birthDate', 'height', 'weight', 'biochemDate', 'egfr'];
        requiredFields.forEach(fieldId => {
            const field = form.querySelector(`#${fieldId}`);
            if (field && !field.value.trim()) {
                errors.push(`${this.getFieldDisplayName(fieldId)} 為必填欄位`);
            }
        });
        
        // 檢查受試者代碼格式
        const subjectCodeField = form.querySelector('#subjectCode');
        if (subjectCodeField && subjectCodeField.value.trim()) {
            const subjectCodePattern = /^P[A-Za-z0-9]{2}-?[A-Za-z0-9]{4}$/;
            if (!subjectCodePattern.test(subjectCodeField.value.trim())) {
                errors.push('受試者代碼格式不正確，應為 P(1碼)+機構代碼(2碼)+流水號(4碼)，例：P01-0001');
            }
        }
        
        // 檢查性別選擇
        const genderCheckboxes = form.querySelectorAll('input[name="gender"]:checked');
        if (genderCheckboxes.length === 0) {
            errors.push('請選擇性別');
        }
        
        // 檢查病史選擇
        if (!this.validateHistorySelection('dm')) {
            errors.push('請完成糖尿病病史選擇');
        }
        if (!this.validateHistorySelection('gout')) {
            errors.push('請完成痛風病史選擇');
        }
        
        // 檢查影像檢查類型
        const selectedImgType = form.querySelector('input[name="imgType"]:checked');
        if (!selectedImgType) {
            errors.push('請選擇影像檢查類型');
        }
        
        // 檢查納入條件
        const inclusionCriteria = [
            'age18', 'hasGender', 'hasAge', 'hasBMI', 'hasDMHistory', 'hasGoutHistory',
            'hasEGFR', 'hasUrinePH', 'hasUrineSG', 'hasUrineRBC', 'hasBacteriuria',
            'labTimeWithin7', 'hasImagingData', 'imgLabWithin7'
        ];
        
        inclusionCriteria.forEach(criteriaId => {
            const checkbox = form.querySelector(`#${criteriaId}`);
            if (checkbox && !checkbox.checked) {
                errors.push(`${this.getFieldDisplayName(criteriaId)} 檢核未完成`);
            }
        });
        
        // 檢查藥物和手術資料
        const noTreatment = form.querySelector('input[name="noTx"]:checked')?.value === 'yes';
        if (!noTreatment) {
            const medications = this.collectMedications();
            const surgeries = this.collectSurgeries();
            
            if (medications.length === 0 && surgeries.length === 0) {
                errors.push('選擇有治療處置紀錄時，必須填寫至少一項藥物或手術資料');
            }
        }
        
        if (errors.length > 0) {
            showErrorMessage(`請完成以下必填檢核項目：\n\n${errors.join('\n')}`);
            return false;
        }
        
        return true;
    },
    
    getFieldDisplayName(fieldId) {
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
    },
    
    collectFormData(form) {
        const formData = {
            subject_data: {
                subject_code: form.querySelector('#subjectCode')?.value,
                date_of_birth: form.querySelector('#birthDate')?.value,
                age: form.querySelector('#age')?.value,
                gender: form.querySelector('input[name="gender"]:checked')?.value,
                height_cm: form.querySelector('#height')?.value,
                weight_kg: form.querySelector('#weight')?.value,
                bmi: form.querySelector('#bmi')?.getAttribute('data-precise-value') || form.querySelector('#bmi')?.value,
                bac: form.querySelector('input[name="bacteriuria"]:checked')?.value,
                dm: form.querySelector('input[name="dm"]:checked')?.value,
                gout: form.querySelector('input[name="gout"]:checked')?.value,
                imaging_type: form.querySelector('input[name="imgType"]:checked')?.value || '',
                imaging_date: form.querySelector('#imgDate')?.value || '',
                kidney_stone_diagnosis: form.querySelector('input[name="stone"]:checked')?.value,
                imaging_files: [],
                imaging_report_summary: form.querySelector('#imgReadingReport')?.value || ''
            },
            inclusion_data: {
                age_18_above: form.querySelector('#age18')?.checked ? 1 : 0,
                gender_available: form.querySelector('#hasGender')?.checked ? 1 : 0,
                age_available: form.querySelector('#hasAge')?.checked ? 1 : 0,
                bmi_available: form.querySelector('#hasBMI')?.checked ? 1 : 0,
                dm_history_available: form.querySelector('#hasDMHistory')?.checked ? 1 : 0,
                gout_history_available: form.querySelector('#hasGoutHistory')?.checked ? 1 : 0,
                egfr_available: form.querySelector('#hasEGFR')?.checked ? 1 : 0,
                urine_ph_available: form.querySelector('#hasUrinePH')?.checked ? 1 : 0,
                urine_sg_available: form.querySelector('#hasUrineSG')?.checked ? 1 : 0,
                urine_rbc_available: form.querySelector('#hasUrineRBC')?.checked ? 1 : 0,
                bacteriuria_available: form.querySelector('#hasBacteriuria')?.checked ? 1 : 0,
                lab_interval_7days: form.querySelector('#labTimeWithin7')?.checked ? 1 : 0,
                imaging_available: form.querySelector('#hasImagingData')?.checked ? 1 : 0,
                kidney_structure_visible: form.querySelector('input[name="visKidney"]:checked')?.value === 'yes' ? 1 : 0,
                mid_ureter_visible: form.querySelector('input[name="visMidUreter"]:checked')?.value === 'yes' ? 1 : 0,
                lower_ureter_visible: form.querySelector('input[name="visLowerUreter"]:checked')?.value === 'yes' ? 1 : 0,
                imaging_lab_interval_7days: form.querySelector('#imgLabWithin7')?.checked ? 1 : 0,
                no_treatment_during_exam: form.querySelector('input[name="noTx"]:checked')?.value === 'yes' ? 1 : 0,
                medications: this.collectMedications(),
                surgeries: this.collectSurgeries()
            },
            exclusion_data: {
                pregnant_female: form.querySelector('input[name="pregnantFemale"]:checked')?.value === 'yes' ? 1 : 0,
                kidney_transplant: form.querySelector('input[name="kidneyTransplant"]:checked')?.value === 'yes' ? 1 : 0,
                urinary_tract_foreign_body: form.querySelector('input[name="urinaryForeignBody"]:checked')?.value === 'yes' ? 1 : 0,
                non_stone_urological_disease: form.querySelector('input[name="urinarySystemLesion"]:checked')?.value === 'yes' ? 1 : 0,
                renal_replacement_therapy: form.querySelector('input[name="renalReplacementTherapy"]:checked')?.value === 'yes' ? 1 : 0,
                medical_record_incomplete: form.querySelector('input[name="missingData"]:checked')?.value === 'yes' ? 1 : 0,
                major_blood_immune_cancer: form.querySelector('input[name="hematologicalDisease"]:checked')?.value === 'yes' ? 1 : 0,
                rare_metabolic_disease: form.querySelector('input[name="rareMetabolicDisease"]:checked')?.value === 'yes' ? 1 : 0,
                investigator_judgment: form.querySelector('input[name="piJudgment"]:checked')?.value === 'yes' ? 1 : 0,
                judgment_reason: form.querySelector('#piJudgmentReason')?.value || ''
            }
        };
        
        return formData;
    },
    
    collectMedications() {
        const noTreatment = document.querySelector('input[name="noTx"]:checked')?.value === 'yes';
        
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
    },
    
    collectSurgeries() {
        const noTreatment = document.querySelector('input[name="noTx"]:checked')?.value === 'yes';
        
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
    },
    
    async submitData(data) {
        try {
            LoadingManager.show('正在提交資料...');
            
            const response = await fetch('/edc/submit-ecrf', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (result.success) {
                showSuccessMessage('eCRF 已成功提交！');
                this.clearForm();
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
    
    handleFieldChange(field) {
        this.updateFormData(field);
        this.scheduleAutoSave();
        
        // 觸發欄位變更事件
        const event = new CustomEvent('fieldChanged', {
            detail: {
                fieldName: field.name || field.id,
                fieldValue: field.value,
                timestamp: new Date()
            }
        });
        field.dispatchEvent(event);
    },
    
    handleFieldInput(field) {
        this.updateFormData(field);
        this.scheduleAutoSave();
        
        // 觸發欄位輸入事件
        const event = new CustomEvent('fieldInput', {
            detail: {
                fieldName: field.name || field.id,
                fieldValue: field.value,
                timestamp: new Date()
            }
        });
        field.dispatchEvent(event);
    },
    
    updateFormData(field) {
        const fieldName = field.name || field.id;
        if (fieldName) {
            this.formData[fieldName] = field.value;
        }
    },
    
    scheduleAutoSave() {
        if (this.autoSaveTimer) {
            clearTimeout(this.autoSaveTimer);
        }
        
        this.autoSaveTimer = setTimeout(() => {
            this.saveDraft();
        }, this.autoSaveInterval);
    },
    
    async saveDraft() {
        try {
            const draftData = {
                formData: this.formData,
                timestamp: new Date().toISOString(),
                formType: 'researcher_form'
            };
            
            localStorage.setItem('edc_draft_data', JSON.stringify(draftData));
            console.log('草稿已自動儲存');
        } catch (error) {
            console.warn('自動儲存失敗:', error);
        }
    },
    
    loadDraft() {
        try {
            const savedDraft = localStorage.getItem('edc_draft_data');
            if (savedDraft) {
                const draftData = JSON.parse(savedDraft);
                this.formData = draftData.formData || {};
                this.populateForm(this.formData);
                console.log('草稿已載入');
                return true;
            }
        } catch (error) {
            console.warn('載入草稿失敗:', error);
        }
        return false;
    },
    
    clearForm() {
        this.formData = {};
        if (this.autoSaveTimer) {
            clearTimeout(this.autoSaveTimer);
        }
        
        // 清除本地儲存的草稿
        localStorage.removeItem('edc_draft_data');
    },
    
    populateForm(data) {
        Object.entries(data).forEach(([key, value]) => {
            const field = document.getElementById(key);
            if (field) {
                field.value = value;
                field.dispatchEvent(new Event('change', { bubbles: true }));
            }
        });
    }
};

// 研究人員表單初始化
function initializeResearcherForm() {
    setupFormValidation();
    setupDynamicAdditions();
    setupInclusionCriteriaMonitoring();
    setupTabNavigation();
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

// 設置動態新增功能
function setupDynamicAdditions() {
    // 藥物列表
    const drugList = document.getElementById('drugList');
    if (drugList) {
        addDrug();
    }
    
    // 手術列表
    const surgList = document.getElementById('surgList');
    if (surgList) {
        addSurg();
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

// 儲存草稿
function saveDraft() {
    DataEntryManager.saveDraft();
    showSuccessMessage('草稿已儲存！');
}

// 測試表單
function testForm() {
    console.log('=== 表單測試 ===');
    
    const form = document.querySelector('.researcher-form');
    if (form && DataEntryManager.validateForm(form)) {
        showSuccessMessage('表單驗證通過！');
    }
}

// 電子簽章
function eSign() {
    showSuccessMessage('PI 電子簽章功能');
}

// 顯示研究人員表單
function showResearcherForm() {
    const mainContent = document.getElementById('mainContent');
    if (mainContent) {
        mainContent.innerHTML = generateResearcherFormHTML();
        initializeResearcherForm();
    }
}

// 隱藏研究人員表單
function hideResearcherForm() {
    const mainContent = document.getElementById('mainContent');
    if (mainContent) {
        mainContent.innerHTML = '';
    }
}

// 初始化函數
function initDataEntry() {
    DataEntryManager.init();
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
        }
    });
    
    // 排除條件全部選擇"否"
    const exclusionRadios = [
        'pregnantFemale', 'kidneyTransplant', 'urinaryForeignBody', 
        'urinarySystemLesion', 'renalReplacementTherapy', 'hematologicalDisease',
        'rareMetabolicDisease', 'piJudgment'
    ];
    
    exclusionRadios.forEach(name => {
        const radio = document.querySelector(`input[name="${name}"][value="no"]`);
        if (radio) {
            radio.checked = true;
        }
    });
    
    console.log('🐛 DEBUG 模式預設值填入完成！');
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
        } else if (hasUserStartedFillingForm()) {
            // 只有在用戶開始填寫資料後才顯示"請完成所有必填檢核項目"的訊息
            alert('請完成所有必填檢核項目！');
        } else {
            // 用戶還沒有開始填寫，顯示引導訊息
            alert('請開始填寫表單資料！');
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
    
    // 只有在用戶開始填寫資料後才檢查納入條件
    if (hasUserStartedFillingForm()) {
        // 檢查納入條件
        const inclusionCriteria = [
            'age18', 'hasGender', 'hasAge', 'hasBMI', 'hasDMHistory', 'hasGoutHistory',
            'hasEGFR', 'hasUrinePH', 'hasUrineSG', 'hasUrineRBC', 'hasBacteriuria',
            'labTimeWithin7', 'hasImagingData', 'imgLabWithin7'
        ];
        
        inclusionCriteria.forEach(criteriaId => {
            const checkbox = document.getElementById(criteriaId);
            if (!checkbox || !checkbox.checked) {
                errorMessages.push(`• ${getFieldDisplayName(criteriaId)} 檢核未完成`);
            }
        });
    }
    
    return errorMessages;
}

// 獲取欄位顯示名稱
function getFieldDisplayName(fieldId) {
    const fieldNames = {
        'enrollDate': '個案納入日期',
        'subjectCode': '受試者代碼',
        'birthDate': '出生日期',
        'height': '身高',
        'weight': '體重',
        'biochemDate': '生化檢驗採檢日期',
        'egfr': 'eGFR',
        'age18': '年齡18歲以上',
        'hasGender': '性別',
        'hasAge': '年齡',
        'hasBMI': 'BMI',
        'hasDMHistory': '糖尿病病史',
        'hasGoutHistory': '痛風病史',
        'hasEGFR': 'eGFR檢驗資料',
        'hasUrinePH': '尿液pH',
        'hasUrineSG': '尿液比重',
        'hasUrineRBC': '尿液紅血球',
        'hasBacteriuria': '菌尿症',
        'labTimeWithin7': '檢驗時間間隔',
        'hasImagingData': '影像資料',
        'imgLabWithin7': '影像檢驗時間間隔'
    };
    
    return fieldNames[fieldId] || fieldId;
}

// 驗證所有欄位
function validateAllFields() {
    // 基本驗證
    if (!validateBasicFields()) return false;
    
    // 納入條件驗證 - 只有在用戶開始填寫資料後才檢查
    if (!validateInclusionCriteria()) {
        // 如果納入條件未完成，檢查是否是因為用戶還沒有開始填寫資料
        if (!hasUserStartedFillingForm()) {
            // 用戶還沒有開始填寫，不顯示錯誤
            return true;
        }
        return false;
    }
    
    // 排除條件驗證 - 只有在用戶開始填寫資料後才檢查
    if (!validateExclusionCriteria()) {
        // 如果排除條件未完成，檢查是否是因為用戶還沒有開始填寫資料
        if (!hasUserStartedFillingForm()) {
            // 用戶還沒有開始填寫，不顯示錯誤
            return true;
        }
        return false;
    }
    
    return true;
}

// 檢查用戶是否已經開始填寫表單
function hasUserStartedFillingForm() {
    const basicFields = ['enrollDate', 'subjectCode', 'birthDate', 'height', 'weight', 'biochemDate', 'egfr'];
    const hasBasicData = basicFields.some(fieldId => {
        const field = document.getElementById(fieldId);
        return field && field.value && field.value.trim() !== '';
    });
    
    const hasGender = document.querySelector('input[name="gender"]:checked');
    const hasDM = document.querySelector('input[name="dm"]:checked');
    const hasGout = document.querySelector('input[name="gout"]:checked');
    const hasImgType = document.querySelector('input[name="imgType"]:checked');
    
    return hasBasicData || hasGender || hasDM || hasGout || hasImgType;
}

// 驗證基本欄位
function validateBasicFields() {
    const requiredFields = ['enrollDate', 'subjectCode', 'birthDate', 'height', 'weight', 'biochemDate', 'egfr'];
    
    for (const fieldId of requiredFields) {
        const field = document.getElementById(fieldId);
        if (!field || !field.value.trim()) {
            return false;
        }
    }
    
    // 檢查性別選擇
    const genderSelected = document.querySelector('input[name="gender"]:checked');
    if (!genderSelected) return false;
    
    // 檢查病史選擇
    if (!validateHistorySelection('dm') || !validateHistorySelection('gout')) {
        return false;
    }
    
    // 檢查影像檢查類型
    const imgTypeSelected = document.querySelector('input[name="imgType"]:checked');
    if (!imgTypeSelected) return false;
    
    return true;
}

// 驗證納入條件
function validateInclusionCriteria() {
    const inclusionCriteria = [
        'age18', 'hasGender', 'hasAge', 'hasBMI', 'hasDMHistory', 'hasGoutHistory',
        'hasEGFR', 'hasUrinePH', 'hasUrineSG', 'hasUrineRBC', 'hasBacteriuria',
        'labTimeWithin7', 'hasImagingData', 'imgLabWithin7'
    ];
    
    for (const criteriaId of inclusionCriteria) {
        const checkbox = document.getElementById(criteriaId);
        if (!checkbox || !checkbox.checked) {
            return false;
        }
    }
    
    return true;
}

// 驗證排除條件
function validateExclusionCriteria() {
    const exclusionFields = [
        'pregnantFemale', 'kidneyTransplant', 'urinaryForeignBody', 
        'urinarySystemLesion', 'renalReplacementTherapy', 'hematologicalDisease',
        'rareMetabolicDisease', 'piJudgment'
    ];
    
    for (const fieldName of exclusionFields) {
        const selected = document.querySelector(`input[name="${fieldName}"]:checked`);
        if (!selected) return false;
    }
    
    return true;
}

// 顯示載入狀態
function showLoadingState(show) {
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
        submitBtn.disabled = show;
        submitBtn.textContent = show ? '提交中...' : '提交 eCRF';
    }
}

// 匯出模組
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        DataEntryManager,
        initializeResearcherForm,
        setupFormValidation,
        validateSubjectCode,
        setupHistoryValidation,
        toggleHistoryDateSection,
        clearHistoryDate,
        validateHistorySelection,
        getHistoryDate,
        setupDynamicAdditions,
        addDrug,
        addSurg,
        removeItem,
        saveDraft,
        testForm,
        eSign,
        showResearcherForm,
        hideResearcherForm,
        initDataEntry,
        generateResearcherFormHTML,
        toggleDebugMode,
        fillDebugValues,
        submitForm,
        collectValidationErrors,
        getFieldDisplayName,
        validateAllFields,
        validateBasicFields,
        validateInclusionCriteria,
        validateExclusionCriteria,
        showLoadingState,
        hasUserStartedFillingForm
    };
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
                                <label for="lesionType">5.1 腎臟替代治療名稱</label>
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
                                <label class="inline"><input type="radio" id="piJudgment" name="piJudgment" value="no"> 否</label>
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

// 收集表單資料
function collectFormData() {
    const formData = {
        subject_data: {
            subject_code: document.getElementById('subjectCode')?.value || '',
            date_of_birth: document.getElementById('birthDate')?.value || '',
            age: document.getElementById('age')?.value || '',
            gender: document.querySelector('input[name="gender"]:checked')?.value || '',
            height_cm: document.getElementById('height')?.value || '',
            weight_kg: document.getElementById('weight')?.value || '',
            bmi: document.getElementById('bmi')?.getAttribute('data-precise-value') || document.getElementById('bmi')?.value || '',
            bac: document.querySelector('input[name="bacteriuria"]:checked')?.value || '',
            dm: document.querySelector('input[name="dm"]:checked')?.value || '',
            gout: document.querySelector('input[name="gout"]:checked')?.value || '',
            imaging_type: document.querySelector('input[name="imgType"]:checked')?.value || '',
            imaging_date: document.getElementById('imgDate')?.value || '',
            kidney_stone_diagnosis: document.querySelector('input[name="stone"]:checked')?.value || '',
            imaging_files: [],
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
    const noTreatment = document.querySelector('input[name="noTx"]:checked')?.value === 'yes';
    
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
    const noTreatment = document.querySelector('input[name="noTx"]:checked')?.value === 'yes';
    
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
