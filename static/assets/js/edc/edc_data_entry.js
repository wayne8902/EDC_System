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
        const requiredFields = EDCConstants.REQUIRED_FIELDS;
        requiredFields.forEach(fieldId => {
            const field = form.querySelector(`#${fieldId}`);
            if (field && !field.value.trim()) {
                errors.push(`${this.getFieldDisplayName(fieldId)} 為必填欄位`);
            }
        });
        
        // 受試者代碼由系統自動生成，無需驗證格式
        
        // 檢查性別選擇
        const genderCheckboxes = form.querySelectorAll('input[name="gender"]:checked');
        if (genderCheckboxes.length === 0) {
            errors.push('請選擇性別');
        }
        
        // 檢查病史選擇
        if (!validateHistorySelection('dm')) {
            errors.push('請完成糖尿病病史選擇');
        }
        if (!validateHistorySelection('gout')) {
            errors.push('請完成痛風病史選擇');
        }
        
        // 檢查影像檢查類型
        const selectedImgType = form.querySelector('input[name="imgType"]:checked');
        if (!selectedImgType) {
            errors.push('請選擇影像檢查類型');
        }
        
        // 檢查納入條件
        const inclusionCriteria = EDCConstants.INCLUSION_CRITERIA;
        
        inclusionCriteria.forEach(criteriaId => {
            const checkbox = form.querySelector(`#${criteriaId}`);
            if (checkbox && !checkbox.checked) {
                errors.push(`${this.getFieldDisplayName(criteriaId)} 檢核未完成`);
            }
        });
        
        // 檢查藥物和手術資料
        const noTreatment = form.querySelector('input[name="noTx"]:checked')?.value === "1";
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
        return EDCConstants.FIELD_NAMES[fieldId] || fieldId;
    },
    
    collectFormData(form) {
        const formData = {
            subject_data: {
                enroll_date: form.querySelector('#enrollDate')?.value,
                subject_code: form.querySelector('#subjectCode')?.value,
                date_of_birth: form.querySelector('#birthDate')?.value,
                age: form.querySelector('#age')?.value,
                gender: form.querySelector('input[name="gender"]:checked')?.value,
                height_cm: form.querySelector('#height')?.value,
                weight_kg: form.querySelector('#weight')?.value,
                bmi: form.querySelector('#bmi')?.getAttribute('data-precise-value') || form.querySelector('#bmi')?.value,
                biochem_date: form.querySelector('#biochemDate')?.value,
                scr: form.querySelector('#scr')?.value,
                egfr: form.querySelector('#egfr')?.value,
                urine_date: form.querySelector('#urineDate')?.value,
                ph: form.querySelector('#ph')?.value,
                sg: form.querySelector('#sg')?.value,
                urinalysis_date: form.querySelector('#urinalysisDate')?.value,
                rbc: form.querySelector('#rbc')?.value,
                bac: form.querySelector('input[name="bacteriuria"]:checked')?.value,
                dm: form.querySelector('input[name="dm"]:checked')?.value,
                dm_date: form.querySelector('#dmDate')?.value || '',
                gout: form.querySelector('input[name="gout"]:checked')?.value,
                gout_date: form.querySelector('#goutDate')?.value || '',
                imaging_type: form.querySelector('input[name="imgType"]:checked')?.value,
                imaging_date: form.querySelector('#imgDate')?.value,
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
                kidney_structure_visible: form.querySelector('input[name="visKidney"]:checked')?.value === '1' ? 1 : 0,
                mid_ureter_visible: form.querySelector('input[name="visMidUreter"]:checked')?.value === '1' ? 1 : 0,
                lower_ureter_visible: form.querySelector('input[name="visLowerUreter"]:checked')?.value === '1' ? 1 : 0,
                imaging_lab_interval_7days: form.querySelector('#imgLabWithin7')?.checked ? 1 : 0,
                no_treatment_during_exam: form.querySelector('input[name="noTx"]:checked')?.value === '1' ? 1 : 0,
                medications: this.collectMedications(),
                surgeries: this.collectSurgeries()
            },
            exclusion_data: {
                pregnant_female: form.querySelector('input[name="pregnantFemale"]:checked')?.value === '1' ? 1 : 0,
                kidney_transplant: form.querySelector('input[name="kidneyTransplant"]:checked')?.value === '1' ? 1 : 0,
                urinary_tract_foreign_body: form.querySelector('input[name="urinaryForeignBody"]:checked')?.value === '1' ? 1 : 0,
                urinary_tract_foreign_body_type: form.querySelector('#foreignBodyType')?.value || '',
                non_stone_urological_disease: form.querySelector('input[name="urinarySystemLesion"]:checked')?.value === '1' ? 1 : 0,
                non_stone_urological_disease_type: form.querySelector('#lesionType')?.value || '',
                renal_replacement_therapy: form.querySelector('input[name="renalReplacementTherapy"]:checked')?.value === '1' ? 1 : 0,
                renal_replacement_therapy_type: form.querySelector('#therapyType')?.value || '',
                medical_record_incomplete: form.querySelector('#missingData')?.checked ? 1 : 0,
                major_blood_immune_cancer: form.querySelector('input[name="hematologicalDisease"]:checked')?.value === '1' ? 1 : 0,
                major_blood_immune_cancer_type: form.querySelector('#hematologicalDiseaseType')?.value || '',
                rare_metabolic_disease: form.querySelector('input[name="rareMetabolicDisease"]:checked')?.value === '1' ? 1 : 0,
                rare_metabolic_disease_type: form.querySelector('#metabolicDiseaseType')?.value || '',
                investigator_judgment: form.querySelector('input[name="piJudgment"]:checked')?.value === '1' ? 1 : 0,
                judgment_reason: form.querySelector('#piJudgmentReason')?.value || ''
            }
        };
        // console.log(formData);
        return formData;
    },
    
    collectMedications() {
        const noTreatment = document.querySelector('input[name="noTx"]:checked')?.value === '1';
        
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
        const noTreatment = document.querySelector('input[name="noTx"]:checked')?.value === '1';
        
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
                const subjectCode = result.subject_code || '未知';
                showSuccessMessage(`eCRF 已成功提交！受試者代碼：${subjectCode}`);
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
    setupHistoryValidation();
    setupTabNavigation();
}

// 設置表單驗證
function setupFormValidation() {
    // 受試者代碼由系統自動生成，無需驗證
    
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
    const scrInput = document.getElementById('scr');
    if (scrInput) {
        scrInput.addEventListener('input', calculateEGFR);
    }
    
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

// 受試者代碼由系統自動生成，無需驗證函數

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
        if (value === "1") {
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



// 電子簽章
function eSign() {
    showSuccessMessage('PI 電子簽章功能');
}

// 顯示研究人員表單
async function showResearcherForm() {
    const mainContent = document.getElementById('mainContent');
    if (mainContent) {
        mainContent.innerHTML = await generateResearcherFormHTML();
        initializeResearcherForm();
    }
    fillSubjectCode();
}

// 填入受試者代碼
async function fillSubjectCode() {
    try {
        // 從後端獲取生成的受試者代碼
        const response = await fetch('/edc/generate-subject-code', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        const result = await response.json();
        
        if (result.success && result.subject_code) {
            // 找到受試者代碼輸入欄位並填入
            const subjectCodeInput = document.getElementById('subjectCode');
            if (subjectCodeInput) {
                subjectCodeInput.value = result.subject_code;
                showSuccessMessage('受試者代碼已填入');
            } else {
                showErrorMessage('找不到受試者代碼輸入欄位');
            }
        } else {
            showErrorMessage('獲取受試者代碼失敗:', result.message);
        }
    } catch (error) {
        showErrorMessage('填入受試者代碼時發生錯誤:', error);
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
    
    // 基本資料預設值
    const today = new Date().toISOString().split('T')[0];
    const debugValues = {
        'enrollDate': today,
        'birthDate': '1990-01-01',
        'measureDate': today,
        'height': '170',
        'weight': '70',
        'biochemDate': today,
        'scr': '1.0',
        'egfr': '90.0',
        'ph': '6.5',
        'sg': '1.020',
        'rbc': '2',
        'bac': '0',
        'dm': '0',
        'gout': '0',
        'imaging_type': 'CT',
        'imaging_date': today,
        'kidney_stone_diagnosis': '0',
        'imaging_report_summary': 'DEBUG: 影像檢查報告摘要',
        'imgDate': today,
        'imgReadingReport': 'DEBUG: 影像檢查報告摘要',
        // 尿液檢驗資料

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
    const visKidneyYesRadio = document.querySelector('input[name="visKidney"][value="1"]');
    const visMidUreterYesRadio = document.querySelector('input[name="visMidUreter"][value="1"]');
    const visLowerUreterYesRadio = document.querySelector('input[name="visLowerUreter"][value="1"]');
    const noTxYesRadio = document.querySelector('input[name="noTx"][value="1"]');
    
    if (visKidneyYesRadio) visKidneyYesRadio.checked = true;
    if (visMidUreterYesRadio) visMidUreterYesRadio.checked = true;
    if (visLowerUreterYesRadio) visLowerUreterYesRadio.checked = true;
    if (noTxYesRadio) noTxYesRadio.checked = true;
    
    // 納入條件全部勾選（全部為1）
    const inclusionCheckboxes = EDCConstants.INCLUSION_CRITERIA;
    
    inclusionCheckboxes.forEach(id => {
        const checkbox = document.getElementById(id);
        if (checkbox) {
            checkbox.checked = true;
        }
    });
    
    // 排除條件全部選擇"否"
    const exclusionRadios = EDCConstants.EXCLUSION_FIELDS;
    
    exclusionRadios.forEach(name => {
        const radio = document.querySelector(`input[name="${name}"][value="0"]`);
        if (radio) {
            radio.checked = true;
        }
    });
    

}

// 提交表單
async function submitForm() {
    if (validateAllFields()) {
        const form = document.querySelector('form') || document;
        const formData = DataEntryManager.collectFormData(form);
        console.log(formData);
        try {
            // 顯示載入狀態
            showLoadingState(true);
            
            // 在提交之前進行 AI/ML 計算
            try {
                const mlResult = await performMLCalculation(formData);
                console.log(mlResult);
                
                // 檢查 ML 計算是否成功
                if (!mlResult || mlResult.status !== 'success') {
                    const errorMessage = mlResult?.error_message || 'AI/ML 計算失敗，請檢查資料完整性';
                    showErrorMessage(`無法提交：${errorMessage}`);
                    return; // 停止後續流程
                }
            } catch (mlError) {
                // 處理 ML 計算過程中的錯誤（如資料準備錯誤）
                console.error('ML 計算過程失敗:', mlError);
                showErrorMessage(`無法提交：${mlError.message}`);
                return; // 停止後續流程
            }
            
            // 將 ML 計算結果添加到表單資料中
            // formData.ml_result = mlResult;
            
            // 發送到後端
            // const response = await fetch('/edc/submit-ecrf', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //     },
            //     body: JSON.stringify(formData)
            // });
            
            // const result = await response.json();
            
            // if (result.success) {
            //     const subjectCode = result.subject_code || '未知';
                
            //     // 顯示提交成功訊息，包含 ML 計算結果
            //     let successMessage = `eCRF 已成功提交！受試者代碼：${subjectCode}`;
            //     if (mlResult && mlResult.status === 'success') {
            //         successMessage += `\n\nAI 分析結果：\n${formatMLResults(mlResult)}`;
            //     }
            //     showSuccessMessage(successMessage);
                
            //     // 跳轉到資料瀏覽頁面
            //     if (typeof openDataBrowser === 'function') {
            //         openDataBrowser();
            //     } else {
            //         // 備用方案：直接跳轉到主頁面
            //         window.location.href = '/';
            //     }
            // } else {
            //     showErrorMessage(`提交失敗：${result.message}`);
            // }
            
        } catch (error) {
            console.error('提交失敗:', error);
            showErrorMessage(`提交失敗：${error.message}`);
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
            showErrorMessage('請完成所有必填檢核項目！');
        } else {
            // 用戶還沒有開始填寫，顯示引導訊息
            showErrorMessage('請開始填寫表單資料！');
        }
    }
}

// 收集驗證錯誤訊息
function collectValidationErrors() {
    const errorMessages = [];
    
    // 檢查必填欄位
    const requiredFields = EDCConstants.REQUIRED_FIELDS;
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
        const inclusionCriteria = EDCConstants.INCLUSION_CRITERIA;
        
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
    const fieldNames = EDCConstants.FIELD_NAMES;
    
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
    const basicFields = EDCConstants.REQUIRED_FIELDS;
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
    const requiredFields = EDCConstants.REQUIRED_FIELDS;
    
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
    const inclusionCriteria = EDCConstants.INCLUSION_CRITERIA;
    
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
    const exclusionFields = EDCConstants.EXCLUSION_FIELDS;
    
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
        fillSubjectCode,
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
async function generateResearcherFormHTML() {
    try {
        const response = await fetch('/static/assets/js/edc/edc_data_entry_config.json');
        const config = await response.json(); 
        // 建立生成器並生成表單
        const generator = new FormGenerator(config); 
        return generator.generateForm(); 
    } catch (error) { 
        console.error('生成表單失敗:', error);
        return ` 
        <div class="alert alert-warning"> 
            <h4>表單載入中...</h4> <p>無法載入表單配置，請檢查網路連線或重新整理頁面。</p> 
            <button class="btn btn-primary" onclick="showResearcherForm()">重試</button> 
        </div> `; 
    }
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

// ==================== AI/ML 計算功能 ====================

/**
 * 準備 AI/ML 計算所需的輸入資料
 * @param {Object} formData - 表單資料
 * @returns {Object} 包含特定標籤的字典變數
 */
function prepareMLInputData(formData) {
    try {
        // 建立 ML 輸入資料字典，包含特定的醫療標籤
        const mlInputData = {
            // 受試者基本資訊
            subject_code: formData.subject_data?.subject_code ?? '',
            age: formData.subject_data?.age ?? '',
            gender: formData.subject_data?.gender ?? '',
            egfr: formData.subject_data?.egfr ?? '',
            bmi: formData.subject_data?.bmi ?? '',
            dm: formData.subject_data?.dm ?? '',
            gout: formData.subject_data?.gout ?? '',
            bac: formData.subject_data?.bac ?? '',
            ph: formData.subject_data?.ph ?? '',
            sg: formData.subject_data?.sg ?? '',
            rbc: formData.subject_data?.rbc ?? '',
            // 時間戳記
            timestamp: new Date().toISOString(),
            data_source: 'edc_frontend'
        };

        // 檢查是否有任何必要欄位為空字串
        const missingFields = [];
        for (const [key, value] of Object.entries(mlInputData)) {
            if (value === '' && key !== 'data_source' && key !== 'timestamp') {
                missingFields.push(key);
            }
        }
        
        if (missingFields.length > 0) {
            throw new Error(`缺少必要欄位：${missingFields.join(', ')}。請完成所有必填項目後再提交。`);
        }

        console.log('已準備 ML 輸入資料:', mlInputData);
        return mlInputData;

    } catch (error) {
        console.error('準備 ML 輸入資料失敗:', error);
        throw error;
    }
}

/**
 * 執行 AI/ML 計算的入口函數
 * @param {Object} formData - 表單資料
 * @returns {Promise<Object>} ML 計算結果
 */
async function performMLCalculation(formData) {
    try {
        console.log('開始執行 AI/ML 計算...');
        
        // 準備 ML 輸入資料
        const mlInputData = prepareMLInputData(formData);
        
        // 發送到 AI/ML API
        const response = await fetch('/api/ml-calculate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(mlInputData)
        });
        
        if (!response.ok) {
            // 嘗試獲取詳細的錯誤訊息
            let errorMessage = `ML API 回應錯誤: ${response.status}`;
            try {
                const errorData = await response.json();
                if (errorData.message) {
                    errorMessage = errorData.message;
                }
            } catch (e) {
                // 如果無法解析錯誤回應，使用預設訊息
            }
            throw new Error(errorMessage);
        }
        
        const mlResult = await response.json();
        console.log('AI/ML 計算完成:', mlResult);
        return mlResult;
        
    } catch (error) {
        console.error('ML 計算執行失敗:', error);
        return {
            status: 'error',
            subject_code: formData.subject_data?.subject_code || 'Unknown',
            error_message: `ML 計算失敗: ${error.message}`,
            calculation_timestamp: new Date().toISOString()
        };
    }
}

/**
 * 格式化 ML 計算結果用於顯示
 * @param {Object} mlResult - ML 計算結果
 * @returns {string} 格式化的結果字串
 */
function formatMLResults(mlResult) {
    if (!mlResult || mlResult.status !== 'success') {
        return 'AI 分析暫時無法使用';
    }
    
    // 假設 API 回傳的是 0.5 這樣的小數
    const riskScore = mlResult.risk_score || mlResult.risk || 0;
    const riskPercentage = (riskScore * 100).toFixed(1);
    
    return `風險評分: ${riskPercentage}%`;
}