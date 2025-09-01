// EDC 系統表單處理功能檔案
// 包含表單驗證、納入條件監控、排除條件處理等功能

// 設置納入條件自動判讀
function setupInclusionCriteriaMonitoring() {
    // 防抖函數，避免頻繁觸發
    let updateTimeout;
    const debouncedUpdate = () => {
        clearTimeout(updateTimeout);
        updateTimeout = setTimeout(() => {
            // 只有在用戶開始填寫資料後才更新條件
            if (typeof hasUserStartedFillingForm === 'function' && hasUserStartedFillingForm()) {
                updateInclusionCriteria();
            }
        }, 300); // 300ms 延遲
    };
    
    // 監聽相關欄位變化（只監聽 change 事件，移除 input 事件）
    const fieldsToMonitor = [
        'enrollDate', 'subjectCode', 'gender', 'birthDate', 'age', 
        'measureDate', 'height', 'weight', 'bmi', 'biochemDate', 
        'creatinine', 'egfr', 'ph', 'sg', 'rbc', 'bacteriuria', 
        'urineDate', 'urinalysisDate', 'dm', 'gout', 'imgType', 
        'imgDate', 'stone'
    ];
    
    fieldsToMonitor.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('change', debouncedUpdate);
        }
    });
    
    // 監聽性別選擇
    const genderRadios = document.querySelectorAll('input[name="gender"]');
    genderRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            if (typeof hasUserStartedFillingForm === 'function' && hasUserStartedFillingForm()) {
                updateInclusionCriteria();
            }
            // 自動處理懷孕女性選項
            updatePregnantFemaleSelection();
        });
    });
    
    // 監聽病史選擇
    const dmRadios = document.querySelectorAll('input[name="dm"]');
    const goutRadios = document.querySelectorAll('input[name="gout"]');
    dmRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            debouncedUpdate();
            toggleHistoryDateSection('dm', 'dmDateSection');
        });
    });
    goutRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            debouncedUpdate();
            toggleHistoryDateSection('gout', 'goutDateSection');
        });
    });
    
    // 監聽影像檢查類型
    const imgTypeRadios = document.querySelectorAll('input[name="imgType"]');
    imgTypeRadios.forEach(radio => radio.addEventListener('change', debouncedUpdate));
    
    // 監聽腎結石診斷
    const stoneRadios = document.querySelectorAll('input[name="stone"]');
    stoneRadios.forEach(radio => radio.addEventListener('change', debouncedUpdate));
    
    // 監聽菌尿症
    const bacteriuriaRadios = document.querySelectorAll('input[name="bacteriuria"]');
    bacteriuriaRadios.forEach(radio => radio.addEventListener('change', debouncedUpdate));
    
    // 監聽治療紀錄選擇
    const noTxRadios = document.querySelectorAll('input[name="noTx"]');
    noTxRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            debouncedUpdate();
            toggleTreatmentSection();
        });
    });
    
    // 監聽排除條件選擇
    const exclusionFields = [
        'pregnantFemale', 'kidneyTransplant', 'urinaryForeignBody', 
        'urinarySystemLesion', 'renalReplacementTherapy', 'missingData', 
        'hematologicalDisease', 'rareMetabolicDisease', 'piJudgment'
    ];
    
    exclusionFields.forEach(fieldName => {
        const radios = document.querySelectorAll(`input[name="${fieldName}"]`);
        radios.forEach(radio => {
            radio.addEventListener('change', () => {
                // 排除條件變化時，只更新 UI 顯示，不觸發驗證
                toggleExclusionDetails();
            });
        });
    });
    
    // 不在初始化時自動檢查條件，等待用戶開始填寫資料
    // updateInclusionCriteria();
    // updateExclusionCriteria();
}

// 更新納入條件
function updateInclusionCriteria() {
    // 1. 年齡18歲以上
    const ageInput = document.getElementById('age');
    const age18Checkbox = document.getElementById('age18');
    if (ageInput && age18Checkbox) {
        const age = parseInt(ageInput.value);
        age18Checkbox.checked = !isNaN(age) && age >= 18;
    }
    
    // 2. 基本資料完整性
    const genderRadios = document.querySelectorAll('input[name="gender"]:checked');
    const hasGenderCheckbox = document.getElementById('hasGender');
    if (hasGenderCheckbox) {
        hasGenderCheckbox.checked = genderRadios.length > 0;
    }
    
    const ageCheckbox = document.getElementById('hasAge');
    if (ageCheckbox && ageInput) {
        ageCheckbox.checked = ageInput.value && ageInput.value.trim() !== '';
    }
    
    const bmiInput = document.getElementById('bmi');
    const hasBMICheckbox = document.getElementById('hasBMI');
    if (hasBMICheckbox && bmiInput) {
        hasBMICheckbox.checked = bmiInput.value && bmiInput.value.trim() !== '';
    }
    
    // 3. 病史完整性
    const dmRadios = document.querySelectorAll('input[name="dm"]:checked');
    const hasDMHistoryCheckbox = document.getElementById('hasDMHistory');
    if (hasDMHistoryCheckbox) {
        hasDMHistoryCheckbox.checked = dmRadios.length > 0;
    }
    
    const goutRadios = document.querySelectorAll('input[name="gout"]:checked');
    const hasGoutHistoryCheckbox = document.getElementById('hasGoutHistory');
    if (hasGoutHistoryCheckbox) {
        hasGoutHistoryCheckbox.checked = goutRadios.length > 0;
    }
    
    // 4. 檢驗資料完整性
    const egfrInput = document.getElementById('egfr');
    const hasEGFRCheckbox = document.getElementById('hasEGFR');
    if (hasEGFRCheckbox && egfrInput) {
        hasEGFRCheckbox.checked = egfrInput.value && egfrInput.value.trim() !== '';
    }
    
    const phInput = document.getElementById('ph');
    const hasUrinePHCheckbox = document.getElementById('hasUrinePH');
    if (hasUrinePHCheckbox && phInput) {
        hasUrinePHCheckbox.checked = phInput.value && phInput.value.trim() !== '';
    }
    
    const sgInput = document.getElementById('sg');
    const hasUrineSGCheckbox = document.getElementById('hasUrineSG');
    if (hasUrineSGCheckbox && sgInput) {
        hasUrineSGCheckbox.checked = sgInput.value && sgInput.value.trim() !== '';
    }
    
    const rbcInput = document.getElementById('rbc');
    const hasUrineRBCCheckbox = document.getElementById('hasUrineRBC');
    if (hasUrineRBCCheckbox && rbcInput) {
        hasUrineRBCCheckbox.checked = rbcInput.value && rbcInput.value.trim() !== '';
    }
    
    const bacteriuriaRadios = document.querySelectorAll('input[name="bacteriuria"]:checked');
    const hasBacteriuriaCheckbox = document.getElementById('hasBacteriuria');
    if (hasBacteriuriaCheckbox) {
        hasBacteriuriaCheckbox.checked = bacteriuriaRadios.length > 0;
    }
    
    // 5. 檢驗時間間隔檢查
    if (typeof checkLabTimeInterval === 'function') {
        checkLabTimeInterval();
    }
    
    // 6. 影像資料完整性
    const imgTypeRadios = document.querySelectorAll('input[name="imgType"]:checked');
    const hasImagingDataCheckbox = document.getElementById('hasImagingData');
    if (hasImagingDataCheckbox) {
        hasImagingDataCheckbox.checked = imgTypeRadios.length > 0;
    }
    
    // 7. 影像與檢驗資料時間間隔檢查
    if (typeof checkImageLabTimeInterval === 'function') {
        checkImageLabTimeInterval();
    }
}

// 更新排除條件
function updateExclusionCriteria() {
    // 病歷資料缺失自動判斷
    const missingDataRadio = document.getElementById('missingData');
    const missingDataNoRadio = document.getElementById('missingDataNo');
    
    if (missingDataRadio && missingDataNoRadio) {
        // 檢查必填欄位是否完整
        const requiredFields = [
            'enrollDate', 'subjectCode', 'gender', 'birthDate', 'age', 
            'measureDate', 'height', 'weight', 'bmi', 'biochemDate', 
            'creatinine', 'egfr', 'ph', 'sg', 'rbc', 'bacteriuria', 
            'urineDate', 'urinalysisDate', 'dm', 'gout', 'imgType', 
            'imgDate', 'stone'
        ];
        
        let isComplete = true;
        let missingFields = [];
        
        requiredFields.forEach(fieldId => {
            // 對於radio button欄位，使用name屬性查找
            if (['gender', 'bacteriuria', 'dm', 'gout', 'imgType', 'stone'].includes(fieldId)) {
                const radioGroup = document.querySelectorAll(`input[name="${fieldId}"]:checked`);
                if (radioGroup.length === 0) {
                    isComplete = false;
                    missingFields.push(`${fieldId} (radio not selected)`);
                } else {
                    // 特殊處理：如果選擇"有"病史，檢查對應的日期欄位
                    if (fieldId === 'dm' && radioGroup[0].value === '1') {
                        const dmDateField = document.getElementById('dmDate');
                        if (dmDateField && (!dmDateField.value || dmDateField.value.trim() === '')) {
                            isComplete = false;
                            missingFields.push(`dmDate (diabetes date required when dm=1)`);
                        }
                    }
                    
                    if (fieldId === 'gout' && radioGroup[0].value === '1') {
                        const goutDateField = document.getElementById('goutDate');
                        if (goutDateField && (!goutDateField.value || goutDateField.value.trim() === '')) {
                            isComplete = false;
                            missingFields.push(`goutDate (gout date required when gout=1)`);
                        }
                    }
                }
            } else {
                // 對於其他欄位，使用id查找
                const field = document.getElementById(fieldId);
                if (field) {
                    if (field.type === 'checkbox') {
                        // 對於checkbox，檢查是否已勾選
                        if (!field.checked) {
                            isComplete = false;
                            missingFields.push(`${fieldId} (checkbox not checked)`);
                        }
                    } else {
                        // 對於其他輸入欄位，檢查是否有值
                        if (!field.value || field.value.trim() === '') {
                            isComplete = false;
                            missingFields.push(`${fieldId} (empty value: "${field.value}")`);
                        }
                        
                        // 特殊處理：檢查受試者代碼格式
                        if (fieldId === 'subjectCode' && field.value.trim() !== '') {
                            const subjectCodePattern = /^P[A-Za-z0-9]{2}-?[A-Za-z0-9]{4}$/;
                            if (!subjectCodePattern.test(field.value.trim())) {
                                isComplete = false;
                                missingFields.push(`subjectCode (invalid format: "${field.value}")`);
                            }
                        }
                    }
                } else {
                    missingFields.push(`${fieldId} (field not found)`);
                    isComplete = false;
                }
            }
        });
        
        if (!isComplete) {
            console.log('Missing or incomplete fields:', missingFields);
        } else {
            console.log('All required fields are complete!');
        }
        
        // 根據完整性自動勾選
        if (isComplete) {
            missingDataNoRadio.checked = true;
            console.log('Auto-selecting "否" for missing data');
        } else {
            missingDataRadio.checked = true;
            console.log('Auto-selecting "是" for missing data');
        }
        
        // 直接調用 toggleExclusionDetails 而不觸發 change 事件
        toggleExclusionDetails();
    }
}

// 控制治療紀錄區塊的顯示/隱藏
function toggleTreatmentSection() {
    const noTxNoRadio = document.querySelector('input[name="noTx"]:checked');
    const treatmentSection = document.getElementById('treatmentSection');
    
    if (treatmentSection) {
        if (noTxNoRadio && noTxNoRadio.value === 'no') {
            treatmentSection.style.display = 'block';
        } else {
            treatmentSection.style.display = 'none';
        }
    }
}

// 控制排除條件詳細欄位的顯示/隱藏
function toggleExclusionDetails() {
    // 泌尿道異物種類名稱
    const urinaryForeignBodyRadio = document.querySelector('input[name="urinaryForeignBody"]:checked');
    const foreignBodyTypeSection = document.getElementById('foreignBodyTypeSection');
    
    if (foreignBodyTypeSection) {
        if (urinaryForeignBodyRadio && urinaryForeignBodyRadio.value === 'yes') {
            foreignBodyTypeSection.style.display = 'block';
        } else {
            foreignBodyTypeSection.style.display = 'none';
        }
    }
    
    // 非腎結石相關之泌尿道重大病變名稱
    const urinarySystemLesionRadio = document.querySelector('input[name="urinarySystemLesion"]:checked');
    const lesionTypeSection = document.getElementById('lesionTypeSection');
    
    if (lesionTypeSection) {
        if (urinarySystemLesionRadio && urinarySystemLesionRadio.value === 'yes') {
            lesionTypeSection.style.display = 'block';
        } else {
            lesionTypeSection.style.display = 'none';
        }
    }
    
    // 腎臟替代治療名稱
    const renalReplacementTherapyRadio = document.querySelector('input[name="renalReplacementTherapy"]:checked');
    const therapyTypeSection = document.getElementById('therapyTypeSection');
    
    if (therapyTypeSection) {
        if (renalReplacementTherapyRadio && renalReplacementTherapyRadio.value === 'yes') {
            therapyTypeSection.style.display = 'block';
        } else {
            therapyTypeSection.style.display = 'none';
        }
    }
    
    // 重大血液、免疫或惡性腫瘤疾病名稱
    const hematologicalDiseaseRadio = document.querySelector('input[name="hematologicalDisease"]:checked');
    const hematologicalDiseaseTypeSection = document.getElementById('hematologicalDiseaseTypeSection');
    
    if (hematologicalDiseaseTypeSection) {
        if (hematologicalDiseaseRadio && hematologicalDiseaseRadio.value === 'yes') {
            hematologicalDiseaseTypeSection.style.display = 'block';
        } else {
            hematologicalDiseaseTypeSection.style.display = 'none';
        }
    }
    
    // 罕見代謝性疾病名稱
    const rareMetabolicDiseaseRadio = document.querySelector('input[name="rareMetabolicDisease"]:checked');
    const metabolicDiseaseTypeSection = document.getElementById('metabolicDiseaseTypeSection');
    
    if (metabolicDiseaseTypeSection) {
        if (rareMetabolicDiseaseRadio && rareMetabolicDiseaseRadio.value === 'yes') {
            metabolicDiseaseTypeSection.style.display = 'block';
        } else {
            metabolicDiseaseTypeSection.style.display = 'none';
        }
    }
    
    // 試驗主持人認定不適合納入本研究之原因
    const piJudgmentRadio = document.querySelector('input[name="piJudgment"]:checked');
    const piJudgmentReasonSection = document.getElementById('piJudgmentReasonSection');
    
    if (piJudgmentReasonSection) {
        if (piJudgmentRadio && piJudgmentRadio.value === 'yes') {
            piJudgmentReasonSection.style.display = 'block';
        } else {
            piJudgmentReasonSection.style.display = 'none';
        }
    }
}

// 設置索引頁切換功能
function setupTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            
            // 移除所有活動狀態
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // 設置當前索引頁為活動狀態
            button.classList.add('active');
            const targetContent = document.getElementById(`${targetTab}-tab`);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
}

// 驗證藥物和手術資料完整性
function validateTreatmentData() {
    const noTreatment = document.querySelector('input[name="noTx"]:checked')?.value === 'yes';
    const drugList = document.getElementById('drugList');
    const surgList = document.getElementById('surgList');
    
    if (!noTreatment) {
        // 如果選擇「否」（有治療），檢查是否有藥物或手術資料
        // 使用 edc_data_entry.js 中的函數
        if (typeof collectMedications === 'function' && typeof collectSurgeries === 'function') {
            const medications = collectMedications();
            const surgeries = collectSurgeries();
            
            if (medications.length === 0 && surgeries.length === 0) {
                // 顯示警告提示
                if (drugList) drugList.style.border = '2px solid #ff6b6b';
                if (surgList) surgList.style.border = '2px solid #ff6b6b';
                
                // 添加提示文字
                let warningMsg = drugList.querySelector('.warning-msg');
                if (!warningMsg) {
                    warningMsg = document.createElement('div');
                    warningMsg.className = 'warning-msg';
                    warningMsg.style.color = '#ff6b6b';
                    warningMsg.style.fontSize = '0.9em';
                    warningMsg.style.marginTop = '5px';
                    drugList.appendChild(warningMsg);
                }
                warningMsg.textContent = '⚠️ 請填寫至少一項藥物或手術資料';
                
                return false;
            } else {
                // 清除警告樣式
                if (drugList) drugList.style.border = '';
                if (surgList) surgList.style.border = '';
                
                // 移除警告文字
                const warningMsg = drugList.querySelector('.warning-msg');
                if (warningMsg) warningMsg.remove();
                
                return true;
            }
        } else {
            console.warn('collectMedications 或 collectSurgeries 函數未找到');
            return true; // 如果函數不存在，暫時返回 true
        }
    } else {
        // 如果選擇「是」（無治療），清除警告樣式
        if (drugList) drugList.style.border = '';
        if (surgList) surgList.style.border = '';
        
        // 移除警告文字
        const warningMsg = drugList.querySelector('.warning-msg');
        if (warningMsg) warningMsg.remove();
        
        return true;
    }
}

// 控制病史日期區段的顯示/隱藏
function toggleHistoryDateSection(historyType, sectionId) {
    console.log(`切換 ${historyType} 日期區段顯示狀態`);
    
    // 檢查病史選擇
    const historyRadios = document.querySelectorAll(`input[name="${historyType}"]:checked`);
    const dateSection = document.getElementById(sectionId);
    
    if (historyRadios.length > 0 && dateSection) {
        const selectedValue = historyRadios[0].value;
        console.log(`${historyType} 選擇值:`, selectedValue);
        
        if (selectedValue === '1') { // 有病史
            // 顯示日期區段
            dateSection.style.display = 'block';
            console.log(`${sectionId} 顯示`);
            
            // 可選：啟用日期輸入欄位
            const dateInput = dateSection.querySelector('input[type="date"]');
            if (dateInput) {
                dateInput.disabled = false;
                dateInput.required = true;
            }
        } else if (selectedValue === '0') { // 無病史
            // 隱藏日期區段
            dateSection.style.display = 'none';
            console.log(`${sectionId} 隱藏`);
            
            // 可選：禁用並清空日期輸入欄位
            const dateInput = dateSection.querySelector('input[type="date"]');
            if (dateInput) {
                dateInput.disabled = true;
                dateInput.required = false;
                dateInput.value = '';
            }
        }
    } else {
        console.log(`未找到 ${historyType} 選擇或 ${sectionId} 區段`);
    }
}

// 自動處理懷孕女性選項
function updatePregnantFemaleSelection() {
    
    // 檢查性別選擇
    const genderRadios = document.querySelectorAll('input[name="gender"]:checked');
    const pregnantFemaleRadios = document.querySelectorAll('input[name="pregnantFemale"]');
    
    if (genderRadios.length > 0 && pregnantFemaleRadios.length > 0) {
        const selectedGender = genderRadios[0].value;
        
        if (selectedGender === '1') { // 男性
            // 如果是男性，自動勾選懷孕女性為"否"
            const pregnantFemaleNoRadio = document.querySelector('input[name="pregnantFemale"][value="no"]');
            if (pregnantFemaleNoRadio) {
                pregnantFemaleNoRadio.checked = true;
                // 觸發 change 事件以更新相關顯示
                pregnantFemaleNoRadio.dispatchEvent(new Event('change'));
                // console.log('男性選擇：自動勾選懷孕女性為「否」');
                
                // 可選：禁用懷孕女性選項，因為男性不可能懷孕
                pregnantFemaleRadios.forEach(radio => {
                    radio.disabled = true;
                });
            } else {
                // console.log('未找到懷孕女性「否」選項');
            }
        } 
    } else {
        console.log('未找到性別選擇或懷孕女性欄位');
    }
}

// 匯出模組
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        setupInclusionCriteriaMonitoring,
        updateInclusionCriteria,
        updateExclusionCriteria,
        toggleTreatmentSection,
        toggleExclusionDetails,
        setupTabNavigation,
        validateTreatmentData,
        updatePregnantFemaleSelection,
        toggleHistoryDateSection
    };
}
