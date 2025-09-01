// EDC 系統編輯資料功能檔案
// 包含資料編輯、變更追蹤和更新提交功能

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
        console.log('資料編輯器初始化完成');
    },
    
    /**
     * 檢查用戶權限
     */
    hasPermission(permission) {
        if (typeof userPermissions === 'undefined') {
            console.warn('userPermissions 未定義');
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
        console.log('切換到編輯模式');
        
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
        console.log('切換回瀏覽模式');
        
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
        const textInputs = document.querySelectorAll('input[type="text"], textarea');
        textInputs.forEach(input => {
            input.readOnly = false;
            input.disabled = false;
            input.style.backgroundColor = '#ffffff';
            input.style.borderColor = '#155eef';
            input.style.opacity = '1';
            input.style.cursor = 'text';
        });

        // 轉換單選和複選欄位
        const radioCheckboxes = document.querySelectorAll('input[type="radio"], input[type="checkbox"]');
        radioCheckboxes.forEach(input => {
            input.disabled = false;
            // 移除唯讀樣式
            input.style.opacity = '1';
            input.style.cursor = 'pointer';
        });

        // 轉換選擇欄位
        const selects = document.querySelectorAll('select');
        selects.forEach(select => {
            select.disabled = false;
        });

        console.log('欄位已轉換為可編輯狀態');
    },
    
    /**
     * 將欄位轉換回唯讀狀態
     */
    convertFieldsToReadOnly() {
        // 轉換所有文字欄位（包括不在 .options-container 內的）
        const textInputs = document.querySelectorAll('input[type="text"], textarea');
        textInputs.forEach(input => {
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

        console.log('欄位已轉換回唯讀狀態');
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
            
            editControls.innerHTML = `
                <button class="btn btn-success" onclick="DataEditorManager.saveChanges()">
                    <i class="fas fa-save"></i> 儲存變更
                </button>
                <button class="btn btn-warning" onclick="DataEditorManager.cancelEdit()">
                    <i class="fas fa-times"></i> 取消編輯
                </button>
                <button class="btn btn-info" onclick="DataEditorManager.submitChanges()">
                    <i class="fas fa-paper-plane"></i> 提交審核
                </button>
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
            console.log('開始儲存變更...');
            
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
            
            console.log('準備發送更新請求:', updateData);
            
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
                // this.reloadPageData();
                
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
                'subject_code','date_of_birth', 'age', 'gender', 'height_cm', 'weight_kg', 'bmi',
                'scr', 'egfr', 'ph', 'sg', 'rbc', 'bac', 'dm', 'gout', 'imaging_type', 'imaging_date', 
                'kidney_stone_diagnosis', 'imaging_report_summary'
            ];
            
            basicFields.forEach(field => {
                const element = document.querySelector(`[name="${field}"], [id="${field}"]`);
                if (element) {
                    if (element.type === 'radio') {
                        const checkedRadio = document.querySelector(`[name="${field}"]:checked`);
                        formData.subject_data[field] = checkedRadio ? checkedRadio.value : '';
                    } else if (element.type === 'checkbox') {
                        formData.subject_data[field] = element.checked ? '1' : '0';
                    } else {
                        formData.subject_data[field] = element.value || '';
                    }
                }
            });
            
            // 收集納入條件欄位
            const inclusionFields = [
                'age_18_above', 'gender_available', 'age_available', 'bmi_available',
                'dm_history_available', 'gout_history_available', 'egfr_available',
                'urine_ph_available', 'urine_sg_available', 'urine_rbc_available',
                'bacteriuria_available', 'lab_interval_7days', 'imaging_available',
                'kidney_structure_visible', 'mid_ureter_visible', 'lower_ureter_visible',
                'imaging_lab_interval_7days', 'no_treatment_during_exam'
            ];
            
            inclusionFields.forEach(field => {
                const element = document.querySelector(`[name="${field}"], [id="${field}"]`);
                if (element) {
                    if (element.type === 'checkbox') {
                        formData.inclusion_data[field] = element.checked ? '1' : '0';
                    } else if (element.type === 'radio') {
                        const checkedRadio = document.querySelector(`[name="${field}"]:checked`);
                        formData.inclusion_data[field] = checkedRadio ? checkedRadio.value : '0';
                    } else {
                        formData.inclusion_data[field] = element.value || '0';
                    }
                }
            });
            
            // 收集排除條件欄位
            const exclusionFields = [
                'subject_code', 'pregnant_female', 'kidney_transplant', 'urinary_tract_foreign_body',
                'non_stone_urological_disease', 'renal_replacement_therapy',
                'medical_record_incomplete', 'major_blood_immune_cancer',
                'rare_metabolic_disease', 'investigator_judgment'
            ];
            
            exclusionFields.forEach(field => {
                const element = document.querySelector(`[name="${field}"], [id="${field}"]`);
                if (element) {
                    if (element.type === 'radio') {
                        const checkedRadio = document.querySelector(`[name="${field}"]:checked`);
                        formData.exclusion_data[field] = checkedRadio ? checkedRadio.value : '0';
                    } else {
                        formData.exclusion_data[field] = element.value || '0';
                    }
                }
            });
            
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
        const subjectCodeElement = document.querySelector('[name="subject_code"], [id="subject_code"]');
        if (subjectCodeElement) {
            return subjectCodeElement.value;
        }
        
        // 如果沒有找到，嘗試從 URL 或其他地方獲取
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('subject_code') || urlParams.get('code');
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
    reloadPageData() {
        // 這裡可以重新載入頁面資料，或者觸發頁面刷新
        // 暫時使用簡單的頁面刷新
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    },

    /**
     * 取消編輯
     */
    cancelEdit() {
        alert('取消編輯功能開發中...');
    },

    /**
     * 提交變更
     */
    submitChanges() {
        alert('提交變更功能開發中...');
    }
};

// 匯出功能供其他模組使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        DataEditorManager
    };
}
