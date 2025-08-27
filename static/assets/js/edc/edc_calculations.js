// EDC 系統計算功能檔案
// 包含各種醫學計算和驗證功能

// 自動計算年齡
function calculateAge() {
    const birthDateInput = document.getElementById('birthDate');
    const ageInput = document.getElementById('age');
    const error = document.getElementById('ageErr');
    
    if (birthDateInput && ageInput) {
        if (birthDateInput.value) {
            const birthDate = new Date(birthDateInput.value);
            const today = new Date();
            
            // 計算年齡
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            
            // 如果今年的生日還沒到，年齡減1
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            
            // 驗證年齡範圍
            if (age >= 0 && age <= 120) {
                ageInput.value = age;
                ageInput.style.borderColor = 'var(--line)';
                if (error) {
                    error.hidden = true;
                }
                
                // 觸發納入條件更新
                if (typeof updateInclusionCriteria === 'function') {
                    updateInclusionCriteria();
                }
            } else {
                ageInput.value = '';
                ageInput.style.borderColor = 'var(--danger)';
                if (error) {
                    error.hidden = false;
                    error.textContent = '年齡超出有效範圍（0-120歲）';
                }
            }
        } else {
            ageInput.value = '';
            ageInput.style.borderColor = 'var(--line)';
            if (error) {
                error.hidden = true;
            }
        }
    }
}

// 自動計算 BMI
function calculateBMI() {
    const heightInput = document.getElementById('height');
    const weightInput = document.getElementById('weight');
    const bmiInput = document.getElementById('bmi');
    const error = document.getElementById('bmiErr');
    
    if (heightInput && weightInput && bmiInput) {
        const height = parseFloat(heightInput.value);
        const weight = parseFloat(weightInput.value);
        
        // 檢查身高體重是否有效
        if (height > 0 && weight > 0) {
            // BMI = 體重(kg) / 身高(m)²
            const heightInMeters = height / 100; // 轉換cm為m
            const bmi = weight / (heightInMeters * heightInMeters);
            
            // 保存精確值到小數點後第三位，但顯示到小數點後一位
            const preciseBMI = bmi.toFixed(3); // 保存精確值
            bmiInput.value = bmi.toFixed(1);   // 顯示一位小數
            bmiInput.setAttribute('data-precise-value', preciseBMI); // 儲存精確值
            
            // 驗證BMI範圍
            if (bmi < 10 || bmi > 60) {
                if (error) {
                    error.hidden = false;
                    error.textContent = '計算出的BMI值異常，請檢查身高體重';
                }
                bmiInput.style.borderColor = 'var(--warn)';
            } else {
                if (error) {
                    error.hidden = true;
                }
                bmiInput.style.borderColor = 'var(--line)';
            }
        } else {
            // 清空BMI值
            bmiInput.value = '';
            bmiInput.removeAttribute('data-precise-value');
            if (error) {
                error.hidden = true;
            }
            bmiInput.style.borderColor = 'var(--line)';
        }
    }
}

// 獲取精確的BMI值（小數點後第三位）
function getPreciseBMI() {
    const bmiInput = document.getElementById('bmi');
    if (bmiInput) {
        return bmiInput.getAttribute('data-precise-value') || bmiInput.value;
    }
    return null;
}

// 獲取顯示的BMI值（小數點後一位）
function getDisplayBMI() {
    const bmiInput = document.getElementById('bmi');
    if (bmiInput) {
        return bmiInput.value;
    }
    return null;
}

// 自動計算 eGFR（使用IDMS-MDRD公式）
function calculateEGFR() {
    const creatinineInput = document.getElementById('creatinine');
    const egfrInput = document.getElementById('egfr');
    const ageInput = document.getElementById('age');
    const genderInputs = document.querySelectorAll('input[name="gender"]:checked');
    
    if (creatinineInput && egfrInput && ageInput && genderInputs.length > 0) {
        const creatinine = parseFloat(creatinineInput.value);
        const age = parseFloat(ageInput.value);
        const gender = genderInputs[0].value;
        
        // 檢查必要參數是否有效
        if (creatinine > 0 && age > 0) {
            // IDMS-MDRD公式：eGFR = 175 × (肌酸酐)^-1.154 × (年齡)^-0.203 × 性別係數 × 種族係數
            // 這裡假設為亞洲人種，種族係數為0.742
            // 性別係數：男性=1.0，女性=0.742
            
            let genderCoefficient = 1.0;
            if (gender === 'female') {
                genderCoefficient = 0.742;
            }
            
            const raceCoefficient = 0.742; // 亞洲人種係數
            
            // 計算eGFR
            const egfr = 175 * Math.pow(creatinine, -1.154) * Math.pow(age, -0.203) * genderCoefficient * raceCoefficient;
            
            // 保存精確值到小數點後第三位，但顯示到小數點後一位
            const preciseEGFR = egfr.toFixed(3);
            egfrInput.value = egfr.toFixed(1);
            egfrInput.setAttribute('data-precise-value', preciseEGFR);
            
            // 驗證eGFR範圍
            if (egfr < 0 || egfr > 200) {
                egfrInput.style.borderColor = 'var(--warn)';
            } else {
                egfrInput.style.borderColor = 'var(--line)';
            }
            
            // 隱藏錯誤訊息
            const error = document.getElementById('egfrErr');
            if (error) {
                error.hidden = true;
            }
        }
    }
}

// 獲取精確的eGFR值（小數點後第三位）
function getPreciseEGFR() {
    const egfrInput = document.getElementById('egfr');
    if (egfrInput) {
        return egfrInput.getAttribute('data-precise-value') || egfrInput.value;
    }
    return null;
}

// 檢查檢驗時間間隔
function checkLabTimeInterval() {
    const labTimeWithin7Checkbox = document.getElementById('labTimeWithin7');
    if (!labTimeWithin7Checkbox) return;
    
    // 獲取各種檢驗日期
    const biochemDate = document.getElementById('biochemDate')?.value;
    const urineDate = document.getElementById('urineDate')?.value;
    const urinalysisDate = document.getElementById('urinalysisDate')?.value;
    
    // 檢查是否有足夠的日期資料來進行比較
    if (biochemDate && urineDate && urinalysisDate) {
        const biochemDateObj = new Date(biochemDate);
        const urineDateObj = new Date(urineDate);
        const urinalysisDateObj = new Date(urinalysisDate);
        
        // 計算所有日期之間的最大間隔
        const dates = [biochemDateObj, urineDateObj, urinalysisDateObj].sort((a, b) => a - b);
        const maxDiffTime = dates[dates.length - 1] - dates[0];
        const maxDiffDays = Math.ceil(maxDiffTime / (1000 * 60 * 60 * 24));
        
        // 如果最大間隔≤7天，勾選為"是"
        labTimeWithin7Checkbox.checked = maxDiffDays <= 7;
    }
}

// 檢查影像與檢驗資料時間間隔
function checkImageLabTimeInterval() {
    const imgLabWithin7Checkbox = document.getElementById('imgLabWithin7');
    if (!imgLabWithin7Checkbox) return;
    
    // 獲取影像檢查日期和各種檢驗日期
    const imgDate = document.getElementById('imgDate')?.value;
    const biochemDate = document.getElementById('biochemDate')?.value;
    const urineDate = document.getElementById('urineDate')?.value;
    const urinalysisDate = document.getElementById('urinalysisDate')?.value;
    
    // 檢查是否有足夠的日期資料來進行比較
    if (imgDate && (biochemDate || urineDate || urinalysisDate)) {
        const imgDateObj = new Date(imgDate);
        const labDates = [];
        
        // 收集所有有效的檢驗日期
        if (biochemDate) labDates.push(new Date(biochemDate));
        if (urineDate) labDates.push(new Date(urineDate));
        if (urinalysisDate) labDates.push(new Date(urinalysisDate));
        
        // 計算影像日期與各檢驗日期的最大間隔
        let maxDiffDays = 0;
        labDates.forEach(labDate => {
            const diffTime = Math.abs(imgDateObj - labDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays > maxDiffDays) {
                maxDiffDays = diffDays;
            }
        });
        
        // 如果最大間隔≤7天，勾選為"是"
        imgLabWithin7Checkbox.checked = maxDiffDays <= 7;
    } else {
        // 如果沒有完整的日期資料，設為未勾選
        imgLabWithin7Checkbox.checked = false;
    }
}

// 計算身體表面積 (BSA) - 使用 DuBois 公式
function calculateBodySurfaceArea(height, weight) {
    if (height > 0 && weight > 0) {
        // DuBois 公式: BSA = 0.007184 × height^0.725 × weight^0.425
        const heightInCm = height;
        const weightInKg = weight;
        const bsa = 0.007184 * Math.pow(heightInCm, 0.725) * Math.pow(weightInKg, 0.425);
        return bsa.toFixed(2);
    }
    return null;
}

// 計算理想體重 (IBW) - 使用 Devine 公式
function calculateIdealBodyWeight(height, gender) {
    if (height > 0) {
        const heightInCm = height;
        let ibw;
        
        if (gender === 'male' || gender === '1') {
            // 男性: IBW = 50 + 2.3 × (height - 152.4)
            ibw = 50 + 2.3 * (heightInCm - 152.4);
        } else {
            // 女性: IBW = 45.5 + 2.3 × (height - 152.4)
            ibw = 45.5 + 2.3 * (heightInCm - 152.4);
        }
        
        return ibw.toFixed(1);
    }
    return null;
}

// 計算體重指數 (Weight Index)
function calculateWeightIndex(actualWeight, idealWeight) {
    if (actualWeight > 0 && idealWeight > 0) {
        const weightIndex = (actualWeight / idealWeight) * 100;
        return weightIndex.toFixed(1);
    }
    return null;
}

// 計算肌酸酐清除率 (Cockcroft-Gault 公式)
function calculateCreatinineClearance(creatinine, weight, age, gender) {
    if (creatinine > 0 && weight > 0 && age > 0) {
        // Cockcroft-Gault 公式: CrCl = [(140 - age) × weight] / (72 × creatinine) × 性別係數
        let genderCoefficient = 1.0;
        if (gender === 'female' || gender === '0') {
            genderCoefficient = 0.85;
        }
        
        const crCl = ((140 - age) * weight) / (72 * creatinine) * genderCoefficient;
        return crCl.toFixed(1);
    }
    return null;
}

// 匯出模組
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        calculateAge,
        calculateBMI,
        getPreciseBMI,
        getDisplayBMI,
        calculateEGFR,
        getPreciseEGFR,
        checkLabTimeInterval,
        checkImageLabTimeInterval,
        calculateBodySurfaceArea,
        calculateIdealBodyWeight,
        calculateWeightIndex,
        calculateCreatinineClearance
    };
}
