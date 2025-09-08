// EDC 系統編輯資料功能檔案
// 包含資料編輯、變更追蹤和更新提交功能

/**
 * 生成 SHA-256 雜湊值
 * @param {string} subjectCode - 受試者編號
 * @param {string} userId - 使用者ID
 * @param {string} timestamp - 時間戳
 * @param {object} recordData - 記錄資料
 * @returns {Promise<string>} SHA-256 雜湊值
 */
async function generateSignatureHash(subjectCode, userId, timestamp, recordData) {
    try {
        // 組合簽章字串
        const signatureString = `${subjectCode}|${userId}|${timestamp}|${JSON.stringify(recordData)}`;
        
        console.log('簽章字串:', signatureString);
        
        // 使用 Web Crypto API 生成 SHA-256
        const encoder = new TextEncoder();
        const data = encoder.encode(signatureString);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        
        // 轉換為 hex 字串
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        console.log('生成的 SHA-256 雜湊:', hashHex);
        return hashHex;
    } catch (error) {
        console.error('生成 SHA-256 雜湊失敗:', error);
        throw error;
    }
}

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
    
    // 當前模式
    currentMode: 'view',
    
    /**
     * 初始化資料編輯器
     */
    init() {

    },
    
    /**
     * 檢查用戶權限
     */
    hasPermission(permission) {
        if (typeof userPermissions === 'undefined') {

            return false;
        }
        return userPermissions.includes(permission);
    },
    
    /**
     * 檢查編輯權限
     */
    hasEditPermission() {
        return this.hasPermission('edc.data.edit');
    },
    
    /**
     * 切換到編輯模式
     */
    switchToEditMode() {

        
        this.currentMode = 'edit';
        
        // 將所有欄位轉換為可編輯狀態
        this.convertFieldsToEditable();
        
        // 顯示編輯控制按鈕
        this.showEditControls();
        
        // 更新編輯模式按鈕
        this.updateEditModeButton();
    },
    
    /**
     * 切換回瀏覽模式
     */
    switchToViewMode() {

        
        this.currentMode = 'view';
        
        // 將所有欄位轉換回唯讀狀態
        this.convertFieldsToReadOnly();
        
        // 隱藏編輯控制按鈕
        this.hideEditControls();
        
        // 更新瀏覽模式按鈕
        this.updateViewModeButton();
    },
    

    /**
     * 將欄位轉換為可編輯狀態
     */
    convertFieldsToEditable() {
        // 轉換所有文字欄位（包括不在 .options-container 內的）
        const textInputs = document.querySelectorAll('input[type="text"], input[type="number"], input[type="date"], textarea');
        textInputs.forEach(input => {
            // 檢查是否為系統自動判斷欄位
            if (EDCConstants.isSystemAutoField(input)) {
                EDCConstants.setSystemAutoFieldStyle(input);
                return;
            }
            
            input.readOnly = false;
            input.disabled = false;
            input.style.backgroundColor = '#ffffff';
            input.style.borderColor = '#155eef';
            input.style.opacity = '1';
            input.style.cursor = 'text';
            
            // 添加即時驗證事件監聽器
            input.addEventListener('change', () => {
                if (typeof DataBrowserManager !== 'undefined' && DataBrowserManager.validateField) {
                    DataBrowserManager.validateField(input);
                }
            });
            
            // 添加自動計算功能
            if (input.id === 'birthDate' || input.name === 'birthDate') {
                // 出生日期變化時自動計算年齡
                input.addEventListener('change', () => {
                    if (typeof calculateAge === 'function') {
                        calculateAge();
                    }
                });
            }
            
            if (input.id === 'height' || input.name === 'height' || 
                input.id === 'weight' || input.name === 'weight') {
                // 身高體重變化時自動計算BMI
                input.addEventListener('input', () => {
                    if (typeof calculateBMI === 'function') {
                        calculateBMI();
                    }
                });
            }
            
            // 肌酸酐輸入時自動計算eGFR
            if (input.id === 'scr' || input.name === 'scr') {
                input.addEventListener('input', () => {
                    if (typeof calculateEGFR === 'function') {
                        calculateEGFR();
                    }
                });
            }
            
            // 影像檢查類型變化時觸發納入條件更新
            if (input.id === 'imgType' || input.name === 'imgType') {
                input.addEventListener('change', () => {
                    if (typeof updateInclusionCriteria === 'function') {
                        updateInclusionCriteria();
                    }
                });
            }
            
            // 病史選擇時觸發納入條件更新
            if (input.id === 'dm' || input.name === 'dm' || 
                input.id === 'gout' || input.name === 'gout') {
                input.addEventListener('change', () => {
                    if (typeof updateInclusionCriteria === 'function') {
                        updateInclusionCriteria();
                    }
                });
            }
        });

        // 轉換單選和複選欄位
        const radioCheckboxes = document.querySelectorAll('input[type="radio"], input[type="checkbox"]');
        radioCheckboxes.forEach(input => {
            // 特殊處理：missingData 欄位保持 disabled 狀態
            if (input.id === 'missingData') {
                input.disabled = true;
                input.style.opacity = '0.6';
                input.style.cursor = 'not-allowed';
            } else {
                input.disabled = false;
                // 移除唯讀樣式
                input.style.opacity = '1';
                input.style.cursor = 'pointer';
            }
            
            // 添加事件監聽器
            input.addEventListener('change', () => {
                // 即時驗證
                if (typeof DataBrowserManager !== 'undefined' && DataBrowserManager.validateField) {
                    DataBrowserManager.validateField(input);
                }
                
                // 觸發納入條件更新
                if (typeof updateInclusionCriteria === 'function') {
                    updateInclusionCriteria();
                }
                
                // 觸發排除條件更新
                if (typeof updateExclusionCriteria === 'function') {
                    updateExclusionCriteria();
                }
                
                // 性別變化時重新計算eGFR
                if (input.name === 'gender' && typeof calculateEGFR === 'function') {
                    calculateEGFR();
                }
            });
        });

        // 轉換選擇欄位
        const selects = document.querySelectorAll('select');
        selects.forEach(select => {
            select.disabled = false;
        });


    },
    
    /**
     * 將欄位轉換回唯讀狀態
     */
    convertFieldsToReadOnly() {
        // 轉換所有輸入欄位（包括 text, number, date, textarea）
        const allInputs = document.querySelectorAll('input[type="text"], input[type="number"], input[type="date"], textarea');
        allInputs.forEach(input => {
            input.readOnly = true;
            input.disabled = true;
            input.style.backgroundColor = '#f8f9fa';
            input.style.borderColor = '#ddd';
            input.style.opacity = '0.6';
            input.style.cursor = 'not-allowed';
        });

        // 轉換單選和複選欄位
        const radioCheckboxes = document.querySelectorAll('input[type="radio"], input[type="checkbox"]');
        radioCheckboxes.forEach(input => {
            input.disabled = true;
            // 添加唯讀樣式
            input.style.opacity = '0.6';
            input.style.cursor = 'not-allowed';
        });

        // 轉換選擇欄位
        const selects = document.querySelectorAll('select');
        selects.forEach(select => {
            select.disabled = true;
        });


    },
    
    /**
     * 顯示編輯控制按鈕
     */
    showEditControls() {
        // 檢查是否已經有編輯控制按鈕
        let editControls = document.getElementById('editControls');
        
        if (!editControls) {
            // 創建編輯控制按鈕
            editControls = document.createElement('div');
            editControls.id = 'editControls';
            editControls.className = 'edit-controls';
            editControls.style.cssText = 'display: flex; gap: 10px; margin-top: 20px; justify-content: center;';
            
            // 根據用戶角色決定顯示的按鈕
            let submitButtonHtml = '';
            if (this.isInvestigator()) {
                // 試驗主持人顯示「提交並簽署」按鈕
                submitButtonHtml = `
                    <button class="btn btn-info" onclick="DataEditorManager.submitAndSign()">
                        <i class="fas fa-paper-plane"></i> 提交並簽署
                    </button>
                `;
            } else {
                // 研究人員顯示「提交審核」按鈕
                submitButtonHtml = `
                    <button class="btn btn-info" onclick="DataEditorManager.submitChanges()">
                        <i class="fas fa-paper-plane"></i> 提交審核
                    </button>
                `;
            }
            
            editControls.innerHTML = `
                <button class="btn btn-success" onclick="DataEditorManager.saveChanges()">
                    <i class="fas fa-save"></i> 儲存變更
                </button>
                <button class="btn btn-warning" onclick="DataEditorManager.cancelEdit()">
                    <i class="fas fa-times"></i> 取消編輯
                </button>
                ${submitButtonHtml}
            `;
            
            // 插入到頁面中
            const wrap = document.querySelector('.wrap');
            if (wrap) {
                wrap.appendChild(editControls);
            }
        }
        
        editControls.style.display = 'flex';
    },
    
    /**
     * 隱藏編輯控制按鈕
     */
    hideEditControls() {
        const editControls = document.getElementById('editControls');
        if (editControls) {
            editControls.style.display = 'none';
        }
    },
    
    /**
     * 顯示簽署控制按鈕（當數據狀態為 submitted 且用戶為試驗主持人時）
     */
    showSignControls() {
        // 只有試驗主持人才能看到簽署按鈕
        if (!this.isInvestigator()) {
            return;
        }
        
        // 檢查是否已經有簽署控制按鈕
        let signControls = document.getElementById('signControls');
        
        if (!signControls) {
            // 創建簽署控制按鈕
            signControls = document.createElement('div');
            signControls.id = 'signControls';
            signControls.className = 'sign-controls';
            signControls.style.cssText = 'display: flex; gap: 10px; margin-top: 20px; justify-content: center;';
            
            signControls.innerHTML = `
                <button class="btn btn-primary" onclick="DataEditorManager.sign()">
                    <i class="fas fa-signature"></i> 簽署
                </button>
            `;
            
            // 插入到頁面中
            const wrap = document.querySelector('.wrap');
            if (wrap) {
                wrap.appendChild(signControls);
            }
        }
        
        signControls.style.display = 'flex';
    },
    
    /**
     * 隱藏簽署控制按鈕
     */
    hideSignControls() {
        const signControls = document.getElementById('signControls');
        if (signControls) {
            signControls.style.display = 'none';
        }
    },
    
    /**
     * 更新編輯模式按鈕
     */
    updateEditModeButton() {
        const editModeBtn = document.querySelector('button[onclick="DataEditorManager.switchToEditMode()"]');
        if (editModeBtn) {
            editModeBtn.innerHTML = '<i class="fas fa-eye"></i> 瀏覽模式';
            editModeBtn.setAttribute('onclick', 'DataEditorManager.switchToViewMode()');
            editModeBtn.className = 'btn btn-outline-primary';
        }
    },
    
    /**
     * 更新瀏覽模式按鈕
     */
    updateViewModeButton() {
        const viewModeBtn = document.querySelector('button[onclick="DataEditorManager.switchToViewMode()"]');
        if (viewModeBtn) {
            viewModeBtn.innerHTML = '<i class="fas fa-edit"></i> 編輯模式';
            viewModeBtn.setAttribute('onclick', 'DataEditorManager.switchToEditMode()');
            viewModeBtn.className = 'btn btn-primary';
        }
    },
    
    /**
     * 儲存變更
     */
    async saveChanges() {
        try {
            // 先進行表單驗證
            const form = document.querySelector('.wrap');
            if (typeof DataBrowserManager !== 'undefined' && DataBrowserManager.validateDetailForm) {
                if (!DataBrowserManager.validateDetailForm(form)) {
                    return; // 驗證失敗，停止儲存
                }
            }
            
            // 顯示載入狀態
            this.showLoadingState();
            
            // 收集頁面中的所有欄位資料
            const formData = this.collectFormData();
            
            if (!formData) {
                this.hideLoadingState();
                alert('無法收集表單資料，請檢查頁面狀態');
            return;
        }
        
            // 獲取受試者編號
            const subjectCode = this.getSubjectCode();
            if (!subjectCode) {
                this.hideLoadingState();
                alert('無法獲取受試者編號');
            return;
        }
        
            // 獲取原始資料用於比較
            const originalData = await this.getOriginalData(subjectCode);
            
            // 比較變更並產生 edit_log 資料
            const editLogData = this.generateEditLogData(formData, originalData, subjectCode);
            
            // 準備更新資料
            const updateData = {
                subject_data: formData.subject_data,
                inclusion_data: formData.inclusion_data,
                exclusion_data: formData.exclusion_data,
                edit_log_data: editLogData
            };
            

            
            // 發送更新請求
            const response = await fetch(`/edc/update-subject/${subjectCode}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                console.log('更新成功:', result);
                showSuccessMessage(`更新成功！${result.message}`);
                
                // 更新成功後切換回瀏覽模式
                this.switchToViewMode();
                
                // 重新載入頁面資料（可選）
                await this.reloadPageData();
                
                // 重新初始化頁籤切換功能
                if (typeof DataBrowserManager !== 'undefined' && typeof DataBrowserManager.initializeTabSwitching === 'function') {
                    DataBrowserManager.initializeTabSwitching();
                }
                
            } else {
                console.error('更新失敗:', result);
                showErrorMessage(`更新失敗：${result.message}`);
            }
            
        } catch (error) {
            console.error('儲存變更時發生錯誤:', error);
            showErrorMessage(`儲存變更時發生錯誤：${error.message}`);
        } finally {
            this.hideLoadingState();
        }
    },
    
    /**
     * 收集表單資料
     */
    collectFormData() {
        try {
            const formData = {
                subject_data: {},
                inclusion_data: {},
                exclusion_data: {}
            };
            
            // 收集基本資料欄位
            const basicFields = [
                'enrollDate', 'subjectCode', 'birthDate', 'age', 'gender', 'height', 'weight', 'bmi',
                'biochemDate', 'scr', 'egfr', 'urineDate', 'ph', 'sg', 'urinalysisDate', 'rbc', 'bacteriuria', 'dm', 'gout', 'imgType', 'imgDate', 
                'stone', 'imgReport', 'imgReadingReport'
            ];
            
            // 基本資料欄位名稱對應 (前端 -> 後端)
            const basicFieldMapping = {
                'enrollDate': 'enroll_date',
                'subjectCode': 'subject_code',
                'birthDate': 'date_of_birth',
                'height': 'height_cm',
                'weight': 'weight_kg',
                'biochemDate': 'biochem_date',
                'urineDate': 'urine_date',
                'urinalysisDate': 'urinalysis_date',
                'bacteriuria': 'bac',
                'imgType': 'imaging_type',
                'imgDate': 'imaging_date',
                'stone': 'kidney_stone_diagnosis',
                'imgReport': 'imaging_files',
                'imgReadingReport': 'imaging_report_summary'
            };
            
            basicFields.forEach(field => {
                const element = document.querySelector(`[name="${field}"], [id="${field}"]`);
                if (element) {
                    const backendField = basicFieldMapping[field] || field;
                    if (element.type === 'radio') {
                        const checkedRadio = document.querySelector(`[name="${field}"]:checked`);
                        formData.subject_data[backendField] = checkedRadio ? checkedRadio.value : '';
                    } else if (element.type === 'checkbox') {
                        formData.subject_data[backendField] = element.checked ? '1' : '0';
                    } else {
                        formData.subject_data[backendField] = element.value || '';
                    }
                } else {
                    console.warn(`找不到欄位: ${field}`);
                }
            });
            
            // 收集納入條件欄位
            const inclusionFields = [
                'age18', 'hasGender', 'hasAge', 'hasBMI',
                'hasDMHistory', 'hasGoutHistory', 'hasEGFR',
                'hasUrinePH', 'hasUrineSG', 'hasUrineRBC',
                'hasBacteriuria', 'labTimeWithin7', 'hasImagingData',
                'visKidney', 'visMidUreter', 'visLowerUreter',
                'imgLabWithin7', 'noTx'
            ];

            // 納入條件欄位名稱對應 (前端 -> 後端)
            const inclusionFieldMapping = {
                'age18': 'age_18_above',
                'hasGender': 'gender_available',
                'hasAge': 'age_available',
                'hasBMI': 'bmi_available',
                'hasDMHistory': 'dm_history_available',
                'hasGoutHistory': 'gout_history_available',
                'hasEGFR': 'egfr_available',
                'hasUrinePH': 'urine_ph_available',
                'hasUrineSG': 'urine_sg_available',
                'hasUrineRBC': 'urine_rbc_available',
                'hasBacteriuria': 'bacteriuria_available',
                'labTimeWithin7': 'lab_interval_7days',
                'hasImagingData': 'imaging_available',
                'visKidney': 'kidney_structure_visible',
                'visMidUreter': 'mid_ureter_visible',
                'visLowerUreter': 'lower_ureter_visible',
                'imgLabWithin7': 'imaging_lab_interval_7days',
                'noTx': 'no_treatment_during_exam'
            };

            inclusionFields.forEach(field => {
                const element = document.querySelector(`[name="${field}"], [id="${field}"]`);
                if (element) {
                    const backendField = inclusionFieldMapping[field] || field;
                    if (element.type === 'checkbox') {
                        formData.inclusion_data[backendField] = element.checked ? '1' : '0';
                    } else if (element.type === 'radio') {
                        const checkedRadio = document.querySelector(`[name="${field}"]:checked`);
                        formData.inclusion_data[backendField] = checkedRadio ? checkedRadio.value : '';
                    } else {
                        formData.inclusion_data[backendField] = element.value || '';
                    }
                } else {
                    console.warn(`找不到納入條件欄位: ${field}`);
                }
            });
            
            // 收集排除條件欄位
            const exclusionFields = EDCConstants.EXCLUSION_FIELDS;
            
            // 排除條件欄位名稱對應 (前端 -> 後端)
            const exclusionFieldMapping = {
                'pregnantFemale': 'pregnant_female',
                'kidneyTransplant': 'kidney_transplant',
                'urinaryForeignBody': 'urinary_tract_foreign_body',
                'urinarySystemLesion': 'non_stone_urological_disease',
                'renalReplacementTherapy': 'renal_replacement_therapy',
                'missingData': 'medical_record_incomplete',
                'hematologicalDisease': 'major_blood_immune_cancer',
                'rareMetabolicDisease': 'rare_metabolic_disease',
                'piJudgment': 'investigator_judgment'
            };

            exclusionFields.forEach(field => {
                const element = document.querySelector(`[name="${field}"], [id="${field}"]`);
                if (element) {
                    const backendField = exclusionFieldMapping[field] || field;
                    if (element.type === 'radio') {
                        const checkedRadio = document.querySelector(`[name="${field}"]:checked`);
                        formData.exclusion_data[backendField] = checkedRadio ? checkedRadio.value : '';
                    } else if (element.type === 'checkbox') {
                        formData.exclusion_data[backendField] = element.checked ? '1' : '0';
                    } else {
                        formData.exclusion_data[backendField] = element.value || '';
                    }
                } else {
                    console.warn(`找不到排除條件欄位: ${field}`);
                }
            });
            
            // 特別處理 missingData 欄位（系統自動判斷，但需要收集值）
            const missingDataElement = document.querySelector('#missingData');
            if (missingDataElement) {
                formData.exclusion_data.medical_record_incomplete = missingDataElement.checked ? '1' : '0';
            } else {
                console.warn('找不到 missingData 欄位');
            }
            
            // 處理藥物和手術資料（如果有）
            const medications = this.collectMedicationsData();
            const surgeries = this.collectSurgeriesData();
            
            if (medications.length > 0) {
                formData.inclusion_data.medications = medications;
            }
            if (surgeries.length > 0) {
                formData.inclusion_data.surgeries = surgeries;
            }
            
            console.log('收集到的表單資料:', formData);
            return formData;
            
        } catch (error) {
            console.error('收集表單資料時發生錯誤:', error);
            return null;
        }
    },
    
    /**
     * 收集藥物資料
     */
    collectMedicationsData() {
        const medications = [];
        const medicationRows = document.querySelectorAll('#drugList .row');
        
        medicationRows.forEach(row => {
            const inputs = row.querySelectorAll('input');
            if (inputs.length >= 2) {
                medications.push({
                    date: inputs[0].value || '',
                    name: inputs[1].value || ''
                });
            }
        });
        
        return medications;
    },
    
    /**
     * 收集手術資料
     */
    collectSurgeriesData() {
        const surgeries = [];
        const surgeryRows = document.querySelectorAll('#surgList .row');
        
        surgeryRows.forEach(row => {
            const inputs = row.querySelectorAll('input');
            if (inputs.length >= 2) {
                surgeries.push({
                    date: inputs[0].value || '',
                    name: inputs[1].value || ''
                });
            }
        });
        
        return surgeries;
    },
    
    /**
     * 獲取受試者編號
     */
    getSubjectCode() {
        // 嘗試從頁面中獲取受試者編號
        const subjectCodeElement = document.querySelector('[name="subjectCode"], [id="subjectCode"]');
        if (subjectCodeElement) {
            return subjectCodeElement.value;
        }
        
        // 如果沒有找到，嘗試從 URL 或其他地方獲取
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('subjectCode') || urlParams.get('code');
    },
    
    /**
     * 顯示載入狀態
     */
    showLoadingState() {
        const saveBtn = document.querySelector('button[onclick="DataEditorManager.saveChanges()"]');
        if (saveBtn) {
            saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 儲存中...';
            saveBtn.disabled = true;
        }
    },
    
    /**
     * 隱藏載入狀態
     */
    hideLoadingState() {
        const saveBtn = document.querySelector('button[onclick="DataEditorManager.saveChanges()"]');
        if (saveBtn) {
            saveBtn.innerHTML = '<i class="fas fa-save"></i> 儲存變更';
            saveBtn.disabled = false;
        }
    },
    
    /**
     * 獲取原始資料
     */
    async getOriginalData(subjectCode) {
        try {
            const response = await fetch(`/edc/subject-detail-code/${subjectCode}`);
            const result = await response.json();
            
            if (result.success) {
                return result.data;
            } else {
                console.error('獲取原始資料失敗:', result.message);
                return null;
            }
        } catch (error) {
            console.error('獲取原始資料時發生錯誤:', error);
            return null;
        }
    },
    
    /**
     * 產生 edit_log 資料
     */
    generateEditLogData(formData, originalData, subjectCode) {
        if (!originalData) {
            console.warn('無法獲取原始資料，跳過 edit_log 產生');
            return null;
        }
        
        const changes = [];
        const logId = this.generateLogId();

        function safeToString(value) {
            if (value === null || value === undefined) {
                return '';
            }
            return String(value);
        }
        
        // 比較 subjects 資料
        if (originalData.subject) {
            Object.keys(formData.subject_data).forEach(field => {
                const oldValue = safeToString(originalData.subject[field]);
                const newValue = safeToString(formData.subject_data[field]);

                // 只記錄真正有變更的欄位（排除空值到空值的變更和相同值的變更）
                if (oldValue !== newValue && !(oldValue === '' && newValue === '')) {
                    changes.push({
                        log_id: logId,
                        subject_code: subjectCode,
                        table_name: 'subjects',
                        field_name: field,
                        old_value: oldValue.toString(),
                        new_value: newValue.toString(),
                        action: 'UPDATE',
                        user_id: this.getCurrentUserId()
                    });
                }
            });
        }
        
        // 比較 inclusion_criteria 資料
        if (originalData.inclusion_criteria) {
            Object.keys(formData.inclusion_data).forEach(field => {
                const oldValue = safeToString(originalData.inclusion_criteria[field]);
                const newValue = safeToString(formData.inclusion_data[field]);
                
                // 只記錄真正有變更的欄位（排除相同值的變更）
                if (oldValue !== newValue && !(oldValue === '' && newValue === '')) {
                    changes.push({
                        log_id: logId,
                        subject_code: subjectCode,
                        table_name: 'inclusion_criteria',
                        field_name: field,
                        old_value: oldValue.toString(),
                        new_value: newValue.toString(),
                        action: 'UPDATE',
                        user_id: this.getCurrentUserId()
                    });
                }
            });
        }
        
        // 比較 exclusion_criteria 資料
        if (originalData.exclusion_criteria) {
            Object.keys(formData.exclusion_data).forEach(field => {
                const oldValue = safeToString(originalData.exclusion_criteria[field]);
                const newValue = safeToString(formData.exclusion_data[field]);
                
                // 只記錄真正有變更的欄位（排除空值到空值的變更和相同值的變更）
                if (oldValue !== newValue && !(oldValue === '' && newValue === '')) {
                    changes.push({
                        log_id: logId,
                        subject_code: subjectCode,
                        table_name: 'exclusion_criteria',
                        field_name: field,
                        old_value: oldValue.toString(),
                        new_value: newValue.toString(),
                        action: 'UPDATE',
                        user_id: this.getCurrentUserId()
                    });
                }
            });
        }
        
        console.log('產生的變更記錄:', changes);
        
        return {
            log_id: logId,
            changes: changes
        };
    },
    
    /**
     * 產生 log_id (YYYYMMDDHHMMSS 用 hash 轉 7 碼)
     */
    generateLogId() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hour = String(now.getHours()).padStart(2, '0');
        const minute = String(now.getMinutes()).padStart(2, '0');
        const second = String(now.getSeconds()).padStart(2, '0');
        
        // 先生成完整的 YYYYMMDDHHMMSS 格式
        const fullTimestamp = `${year}${month}${day}${hour}${minute}${second}`;
        
        // 使用簡單的 hash 函數將 14 位數轉換為 7 位數
        let hash = 0;
        for (let i = 0; i < fullTimestamp.length; i++) {
            const char = fullTimestamp.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // 轉換為 32 位整數
        }
        
        // 取絕對值並轉換為 7 位數字字串
        const hashStr = Math.abs(hash).toString();
        return hashStr.slice(-7).padStart(7, '0');
    },
    
    /**
     * 獲取當前用戶 ID
     */
    getCurrentUserId() {
        // 從 cookie 獲取 UNIQUE_ID
        return getCookie('unique_id') || '未知ID';
    },
    
    /**
     * 重新載入頁面資料
     */
    async reloadPageData() {
        // 呼叫全域的 reloadPageData 函數
        if (typeof window.reloadPageData === 'function') {
            await window.reloadPageData();
        } else {
            console.warn('全域 reloadPageData 函數不可用');
        }
    },

    /**
     * 設置頁面事件（在刷新後重新綁定）
     */
    setupPageEvents() {
        // 這裡可以重新綁定需要的事件監聽器
        // 例如：按鈕點擊事件、表單驗證等
        console.log('重新設置頁面事件');
    },

    /**
     * 取消編輯
     */
    cancelEdit() {
        alert('取消編輯功能開發中...');
    },

    /**
     * 提交審核 - 完整實現
     */
    async submitChanges() {
        try {
            // 獲取當前受試者代碼
            const subjectCode = this.getSubjectCode();
            if (!subjectCode) {
                showErrorMessage('無法獲取受試者代碼');
                return;
            }
            
            // 步驟一：前置檢查 - 驗證必填欄位
            console.log('正在驗證必填欄位...');
            const validationResult = await this.validateRequiredFields(subjectCode);
            
            if (!validationResult.success) {
                let message = '請完成以下必填欄位：\n';
                if (validationResult.missing_fields && validationResult.missing_fields.length > 0) {
                    message += validationResult.missing_fields.join('\n');
                } else {
                    message += validationResult.message;
                }
                alert(message);
                return;
            }
            
            // 步驟二：確認使用者意圖
            const confirmed = confirm(
                `確認要提交受試者 ${subjectCode} 的資料供審核？\n\n` +
                '提交後將無法再編輯，需等待試驗主持人簽署。'
            );
            
            if (!confirmed) {
                return;
            }
            
            // 步驟三：執行提交流程
            console.log('正在提交審核...');
            await this.processSubmission(subjectCode);
            
        } catch (error) {
            console.error('提交審核失敗:', error);
            alert(`提交審核失敗：${error.message}`);
        }
    },

    /**
     * 提交審核並簽署
     */
    async submitAndSign() {
        const subjectCode = this.getCurrentSubjectCode();
        if (!subjectCode) {
            showErrorMessage('無法獲取受試者編號');
            return;
        }

        if (!confirm('確定要提交審核並簽署此受試者資料嗎？')) {
            return;
        }

        LoadingManager.show('正在提交審核並簽署...');

        try {
            // 1. 先生成前端 SHA-256 雜湊
            const currentData = this.currentRecord || {};
            const userId = this.getCurrentUserId(); // 實際應該從登入狀態獲取
            const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
            
            console.log('=== 提交並簽署 - 生成前端雜湊 ===');
            const frontendHash = await generateSignatureHash(subjectCode, userId, timestamp, currentData);
            console.log('前端生成的雜湊:', frontendHash);

            // 2. 呼叫後端 API，傳送前端雜湊
            const response = await fetch(`/edc/submit-and-sign/${subjectCode}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    frontend_hash: frontendHash,
                    timestamp: timestamp,
                    user_id: userId,
                    record_data: currentData
                })
            });

            const result = await response.json();

            LoadingManager.hide();
            
            if (result.success) {
                // 顯示包含雜湊資訊的成功訊息
                const hashInfo = result.signature_hash ? 
                    `\n後端雜湊: ${result.signature_hash.substring(0, 16)}...\n雜湊驗證: ${result.hash_verified ? '通過' : '未驗證'}` : '';
                
                const message = 
                `已成功提交審核並簽署受試者 ${subjectCode} 的資料\n\n` + 
                `簽署時間: ${result.signed_at}\n` + 
                `前端雜湊: ${frontendHash.substring(0, 16)}...${hashInfo}`;

                showSuccessMessage(message);
                
                // 記錄完整簽章資訊
                console.log('=== 提交並簽署完成 ===');
                console.log('受試者編號:', subjectCode);
                console.log('前端完整雜湊:', frontendHash);
                console.log('後端完整雜湊:', result.signature_hash);
                console.log('雜湊驗證結果:', result.hash_verified);
                console.log('後端回應:', result);
                
                this.updateUIAfterSigning(result);
            } else {
                showErrorMessage(`提交審核並簽署失敗: ${result.message}`);
            }
        } catch (error) {
            LoadingManager.hide();
            console.error('提交審核並簽署失敗:', error);
            showErrorMessage('提交審核並簽署失敗，請檢查網路連線');
        }
    },
    
    /**
     * 簽署受試者資料
     */
    async sign() {
        const subjectCode = this.getCurrentSubjectCode();
        if (!subjectCode) {
            showErrorMessage('無法獲取受試者編號');
            return;
        }

        if (!confirm('確定要簽署此受試者資料嗎？')) {
            return;
        }

        LoadingManager.show('正在簽署...');

        try {
            // 1. 先生成前端 SHA-256 雜湊（用於預覽和記錄）
            const currentData = this.currentRecord || {};
            const userId = this.getCurrentUserId();
            const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
            
            console.log('=== 簽署 - 生成前端雜湊 ===');
            const frontendHash = await generateSignatureHash(subjectCode, userId, timestamp, currentData);
            console.log('前端生成的雜湊:', frontendHash);

            // 2. 呼叫後端 API，傳送前端雜湊
            const response = await fetch(`/edc/sign/${subjectCode}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    frontend_hash: frontendHash,
                    timestamp: timestamp,
                    user_id: userId,
                    record_data: currentData
                })
            });

            const result = await response.json();

            LoadingManager.hide();
            
            if (result.success) {
                // 顯示包含雜湊資訊的成功訊息
                const hashInfo = result.signature_hash ? 
                    `\n後端雜湊: ${result.signature_hash.substring(0, 16)}...\n雜湊驗證: ${result.hash_verified ? '通過' : '未驗證'}` : '';
                
                const message = `已成功簽署受試者 ${subjectCode} 的資料\n\n` +
                                `簽署時間: ${result.signed_at}\n` +
                                `前端雜湊: ${frontendHash.substring(0, 16)}...${hashInfo}`;
                                
                showSuccessMessage(message);
                
                // 記錄完整簽章資訊
                console.log('=== 簽署完成 ===');
                console.log('受試者編號:', subjectCode);
                console.log('前端完整雜湊:', frontendHash);
                console.log('後端完整雜湊:', result.signature_hash);
                console.log('雜湊驗證結果:', result.hash_verified);
                console.log('後端回應:', result);
                
                this.updateUIAfterSigning(result);
            } else {
                showErrorMessage(`簽署失敗: ${result.message}`);
            }
        } catch (error) {
            LoadingManager.hide();
            console.error('簽署失敗:', error);
            showErrorMessage('簽署失敗，請檢查網路連線');
        }
    },
    
    /**
     * 簽署後更新UI
     */
    updateUIAfterSigning(result) {
        // 隱藏編輯和簽署控制按鈕
        this.hideEditControls();
        this.hideSignControls();
        
        // 更新頁面狀態
        this.updatePageStatus('signed');
        
        // 禁用所有輸入欄位
        this.disableAllInputs();
        
        // 顯示簽署資訊
        const signInfo = document.createElement('div');
        signInfo.className = 'alert alert-success';
        signInfo.innerHTML = `
            <h5><i class="fas fa-check-circle"></i> 資料已簽署</h5>
            <p><strong>簽署者：</strong>${result.signed_by}</p>
            <p><strong>簽署時間：</strong>${result.signed_at}</p>
        `;
        
        const wrap = document.querySelector('.wrap');
        if (wrap) {
            wrap.insertBefore(signInfo, wrap.firstChild);
        }
    },
    
    /**
     * 驗證必填欄位
     */
    async validateRequiredFields(subjectCode) {
        try {
            const response = await fetch(`/edc/validate-required-fields/${subjectCode}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const result = await response.json();
            return result;
            
        } catch (error) {
            console.error('驗證必填欄位失敗:', error);
            return {
                success: false,
                message: `驗證失敗：${error.message}`
            };
        }
    },
    
    /**
     * 執行提交流程
     */
    async processSubmission(subjectCode) {
        try {
            // 顯示載入狀態
            this.showLoadingState('正在提交審核...');
            
            const response = await fetch(`/edc/submit-for-review/${subjectCode}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const result = await response.json();
            
            if (result.success) {
                // 步驟四：更新 UI 狀態
                this.updateUIAfterSubmission(result);
                
                // 步驟五：通知 PI（使用 alert 作為臨時方案）
                this.notifyPI(subjectCode);
                
                // 顯示成功訊息
                alert(`✅ ${result.message}\n\n受試者：${subjectCode}\n提交時間：${result.submitted_at}`);
                
                // 重新載入頁面資料以反映新狀態
                this.reloadPageData();
                
            } else {
                // 處理提交失敗
                let errorMessage = result.message || '提交失敗';
                if (result.missing_fields && result.missing_fields.length > 0) {
                    errorMessage += '\n\n缺少的必填欄位：\n' + result.missing_fields.join('\n');
                }
                alert(`❌ ${errorMessage}`);
            }
            
        } catch (error) {
            console.error('提交流程失敗:', error);
            alert(`❌ 提交失敗：${error.message}`);
        } finally {
            this.hideLoadingState();
        }
    },
    
    /**
     * 更新提交後的 UI 狀態
     */
    updateUIAfterSubmission(result) {
        // 隱藏編輯相關按鈕
        const editBtn = document.getElementById('editBtn');
        const submitBtn = document.getElementById('submitBtn');
        const cancelBtn = document.getElementById('cancelBtn');
        
        if (editBtn) editBtn.style.display = 'none';
        if (submitBtn) submitBtn.style.display = 'none';
        if (cancelBtn) cancelBtn.style.display = 'none';
        
        // 顯示狀態訊息
        showSuccessMessage('已提交審核，等待試驗主持人簽署');
        
        // 禁用所有表單輸入
        this.disableAllInputs();
        
        // 更新頁面標題或狀態指示器
        this.updatePageStatus('submitted');
    },
    
    /**
     * 獲取狀態樣式類別
     */
    getStatusClass(status) {
        const statusClasses = {
            'draft': 'alert-secondary',
            'submitted': 'alert-warning',
            'signed': 'alert-success'
        };
        return statusClasses[status] || 'alert-info';
    },
    
    /**
     * 獲取狀態圖示
     */
    getStatusIcon(status) {
        const statusIcons = {
            'draft': 'fas fa-edit',
            'submitted': 'fas fa-clock',
            'signed': 'fas fa-check-circle'
        };
        return statusIcons[status] || 'fas fa-info-circle';
    },
    
    /**
     * 禁用所有輸入欄位
     */
    disableAllInputs() {
        const inputs = document.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.disabled = true;
            input.style.backgroundColor = '#f8f9fa';
        });
    },
    
    /**
     * 更新頁面狀態
     */
    updatePageStatus(status) {
        // 更新頁面標題
        const pageTitle = document.querySelector('h1, .page-title');
        if (pageTitle) {
            const statusText = {
                'draft': '草稿',
                'submitted': '已提交審核',
                'signed': '已簽署'
            };
            pageTitle.innerHTML += ` <span class="badge ${this.getStatusClass(status)}">${statusText[status]}</span>`;
        }
        
        // 更新頁面資料狀態
        if (this.currentRecord) {
            this.currentRecord.status = status;
        }
    },
    
    /**
     * 通知 PI（臨時使用 alert）
     */
    notifyPI(subjectCode) {
        // 這裡使用 alert 作為臨時的通知方案
        setTimeout(() => {
            alert(`📢 系統通知：\n\n受試者 ${subjectCode} 已提交審核\n\n請試驗主持人登入系統進行審查並簽署。`);
        }, 1000);
        
        // 記錄到控制台，供後續開發參考
        console.log(`[PI 通知] 受試者 ${subjectCode} 已提交審核，等待簽署`);
    },
    
    /**
     * 檢查當前用戶是否為試驗主持人
     */
    isInvestigator() {
        return typeof userRole !== 'undefined' && userRole === 'investigator';
    },
    
    /**
     * 獲取當前受試者編號
     */
    getCurrentSubjectCode() {
        // 從 URL 參數獲取
        const urlParams = new URLSearchParams(window.location.search);
        let subjectCode = urlParams.get('subject_code');
        
        if (!subjectCode) {
            // 從數據屬性獲取
            const subjectElement = document.querySelector('[data-subject-code]');
            if (subjectElement) {
                subjectCode = subjectElement.getAttribute('data-subject-code');
            }
        }
        
        if (!subjectCode) {
            // 從表單輸入獲取
            const subjectInput = document.querySelector('input[name="subject_code"], #subject_code');
            if (subjectInput) {
                subjectCode = subjectInput.value;
            }
        }
        
        return subjectCode;
    },
    
    /**
     * 顯示載入狀態
     */
    showLoadingState(message) {
        // 創建或顯示載入指示器
        let loadingIndicator = document.getElementById('loadingIndicator');
        if (!loadingIndicator) {
            loadingIndicator = document.createElement('div');
            loadingIndicator.id = 'loadingIndicator';
            loadingIndicator.className = 'loading-overlay';
            loadingIndicator.innerHTML = `
                <div class="loading-content">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <div class="mt-2">${message}</div>
                </div>
            `;
            document.body.appendChild(loadingIndicator);
        }
        
        loadingIndicator.style.display = 'flex';
        loadingIndicator.querySelector('.loading-content div:last-child').textContent = message;
    },
    
    /**
     * 隱藏載入狀態
     */
    hideLoadingState() {
        const loadingIndicator = document.getElementById('loadingIndicator');
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }
    }
};

// 匯出功能供其他模組使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        DataEditorManager
    };
}
