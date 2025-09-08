// EDC 系統表單驗證功能檔案
// 包含各種表單欄位的驗證規則和驗證函數

// 驗證規則配置
const VALIDATION_RULES = {
    // 基本驗證規則
    required: {
        test: (value) => value !== null && value !== undefined && value.toString().trim() !== '',
        message: '此欄位為必填項目'
    },
    
    // 數字驗證
    number: {
        test: (value) => !isNaN(parseFloat(value)) && isFinite(value),
        message: '請輸入有效的數字'
    },
    
    // 整數驗證
    integer: {
        test: (value) => Number.isInteger(parseFloat(value)),
        message: '請輸入整數'
    },
    
    // 正數驗證
    positive: {
        test: (value) => parseFloat(value) > 0,
        message: '請輸入正數'
    },
    
    // 非負數驗證
    nonNegative: {
        test: (value) => parseFloat(value) >= 0,
        message: '請輸入非負數'
    },
    
    // 範圍驗證
    range: (min, max) => ({
        test: (value) => {
            const num = parseFloat(value);
            return num >= min && num <= max;
        },
        message: `數值必須在 ${min} 到 ${max} 之間`
    }),
    
    // 長度驗證
    minLength: (min) => ({
        test: (value) => value.toString().length >= min,
        message: `長度至少需要 ${min} 個字元`
    }),
    
    maxLength: (max) => ({
        test: (value) => value.toString().length <= max,
        message: `長度不能超過 ${max} 個字元`
    }),
    
    // 日期驗證
    date: {
        test: (value) => !isNaN(Date.parse(value)),
        message: '請輸入有效的日期'
    },
    
    // 未來日期驗證
    futureDate: {
        test: (value) => new Date(value) > new Date(),
        message: '日期不能是過去或今天'
    },
    
    // 過去日期驗證
    pastDate: {
        test: (value) => new Date(value) < new Date(),
        message: '日期不能是未來或今天'
    },
    
    // 年齡範圍驗證
    ageRange: (min, max) => ({
        test: (value) => {
            const age = parseInt(value);
            return age >= min && age <= max;
        },
        message: `年齡必須在 ${min} 到 ${max} 歲之間`
    }),
    
    // BMI 範圍驗證
    bmiRange: {
        test: (value) => {
            const bmi = parseFloat(value);
            return bmi >= 10 && bmi <= 100; // 合理的 BMI 範圍
        },
        message: 'BMI 數值不合理，請檢查身高和體重'
    },
    
    // 身高範圍驗證 (公分)
    heightRange: {
        test: (value) => {
            const height = parseFloat(value);
            return height >= 50 && height <= 300;
        },
        message: '身高數值不合理，請檢查輸入'
    },
    
    // 體重範圍驗證 (公斤)
    weightRange: {
        test: (value) => {
            const weight = parseFloat(value);
            return weight >= 10 && weight <= 500;
        },
        message: '體重數值不合理，請檢查輸入'
    },
    
    // 血壓範圍驗證
    bloodPressureRange: {
        test: (value) => {
            const bp = parseFloat(value);
            return bp >= 50 && bp <= 300;
        },
        message: '血壓數值不合理，請檢查輸入'
    },
    
    // 心率範圍驗證
    heartRateRange: {
        test: (value) => {
            const hr = parseFloat(value);
            return hr >= 30 && hr <= 300;
        },
        message: '心率數值不合理，請檢查輸入'
    },
    
    // 體溫範圍驗證
    temperatureRange: {
        test: (value) => {
            const temp = parseFloat(value);
            return temp >= 30 && temp <= 45;
        },
        message: '體溫數值不合理，請檢查輸入'
    }
};

// 驗證器類別
class EDCValidator {
    constructor() {
        this.errors = new Map();
        this.customRules = new Map();
    }
    
    // 添加自定義驗證規則
    addCustomRule(name, rule) {
        this.customRules.set(name, rule);
    }
    
    // 驗證單一欄位
    validateField(fieldName, value, rules) {
        const fieldErrors = [];
        
        for (const rule of rules) {
            let validationRule;
            let ruleParams = [];
            
            // 處理帶參數的規則
            if (typeof rule === 'string') {
                validationRule = VALIDATION_RULES[rule];
            } else if (typeof rule === 'object' && rule.rule) {
                validationRule = VALIDATION_RULES[rule.rule];
                ruleParams = rule.params || [];
            } else if (typeof rule === 'function') {
                // 自定義驗證函數
                try {
                    const result = rule(value);
                    if (result !== true) {
                        fieldErrors.push(result || '驗證失敗');
                    }
                } catch (error) {
                    fieldErrors.push('自定義驗證錯誤');
                }
                continue;
            }
            
            if (!validationRule) {
                console.warn(`未知的驗證規則: ${rule}`);
                continue;
            }
            
            // 執行驗證
            let testFunction;
            let message;
            
            if (typeof validationRule === 'function') {
                const ruleInstance = validationRule(...ruleParams);
                testFunction = ruleInstance.test;
                message = ruleInstance.message;
            } else {
                testFunction = validationRule.test;
                message = validationRule.message;
            }
            
            if (!testFunction(value)) {
                fieldErrors.push(message);
            }
        }
        
        if (fieldErrors.length > 0) {
            this.errors.set(fieldName, fieldErrors);
        } else {
            this.errors.delete(fieldName);
        }
        
        return fieldErrors.length === 0;
    }
    
    // 驗證整個表單
    validateForm(formData, validationSchema) {
        this.errors.clear();
        let isValid = true;
        
        for (const [fieldName, rules] of Object.entries(validationSchema)) {
            const value = formData[fieldName];
            const fieldValid = this.validateField(fieldName, value, rules);
            if (!fieldValid) {
                isValid = false;
            }
        }
        
        return isValid;
    }
    
    // 獲取所有錯誤
    getErrors() {
        return Object.fromEntries(this.errors);
    }
    
    // 獲取特定欄位的錯誤
    getFieldErrors(fieldName) {
        return this.errors.get(fieldName) || [];
    }
    
    // 檢查是否有錯誤
    hasErrors() {
        return this.errors.size > 0;
    }
    
    // 清除錯誤
    clearErrors() {
        this.errors.clear();
    }
    
    // 顯示錯誤訊息
    showFieldErrors(fieldName, container) {
        const errors = this.getFieldErrors(fieldName);
        if (errors.length === 0) {
            container.innerHTML = '';
            container.style.display = 'none';
            return;
        }
        
        container.innerHTML = errors.map(error => 
            `<div class="text-danger small">${error}</div>`
        ).join('');
        container.style.display = 'block';
    }
    
    // 隱藏錯誤訊息
    hideFieldErrors(container) {
        container.innerHTML = '';
        container.style.display = 'none';
    }
}

// 預設驗證器實例
const edcValidator = new EDCValidator();

// 常用驗證組合
const COMMON_VALIDATIONS = {
    // 基本個人資料驗證
    personalInfo: {
        name: ['required', 'minLength:2', 'maxLength:50'],
        id: ['required', 'minLength:10', 'maxLength:10'],
        birthDate: ['required', 'date', 'pastDate'],
        gender: ['required'],
        phone: ['required', 'isValidTaiwanPhone'],
        email: ['isValidEmail']
    },
    
    // 身體測量驗證
    bodyMeasurements: {
        height: ['required', 'number', 'positive', 'heightRange'],
        weight: ['required', 'number', 'positive', 'weightRange'],
        bmi: ['number', 'positive', 'bmiRange']
    },
    
    // 生命徵象驗證
    vitalSigns: {
        systolicBP: ['number', 'positive', 'bloodPressureRange'],
        diastolicBP: ['number', 'positive', 'bloodPressureRange'],
        heartRate: ['number', 'positive', 'heartRateRange'],
        temperature: ['number', 'positive', 'temperatureRange'],
        respiratoryRate: ['number', 'positive', 'range:8,40']
    },
    
    // 實驗室檢查驗證
    labResults: {
        creatinine: ['number', 'positive', 'range:0.1,20'],
        egfr: ['number', 'positive', 'range:90,200'],
        hemoglobin: ['number', 'positive', 'range:5,25'],
        whiteBloodCell: ['number', 'positive', 'range:1,100'],
        platelet: ['number', 'positive', 'range:10,1000']
    }
};

// 表單驗證輔助函數
function validateFormField(field, rules) {
    return edcValidator.validateField(field.name, field.value, rules);
}

function showFormErrors(formElement, validationSchema) {
    const formData = new FormData(formElement);
    const data = Object.fromEntries(formData);
    
    edcValidator.validateForm(data, validationSchema);
    
    // 顯示每個欄位的錯誤
    for (const [fieldName, rules] of Object.entries(validationSchema)) {
        const field = formElement.querySelector(`[name="${fieldName}"]`);
        if (field) {
            const errorContainer = field.parentNode.querySelector('.error-message') || 
                                 createErrorContainer(field);
            
            if (edcValidator.hasErrors()) {
                edcValidator.showFieldErrors(fieldName, errorContainer);
                field.classList.add('is-invalid');
            } else {
                edcValidator.hideFieldErrors(errorContainer);
                field.classList.remove('is-invalid');
            }
        }
    }
}

function createErrorContainer(field) {
    const container = document.createElement('div');
    container.className = 'error-message text-danger small mt-1';
    container.style.display = 'none';
    
    const parent = field.parentNode;
    if (parent) {
        parent.appendChild(container);
    }
    
    return container;
}

function clearFormErrors(formElement) {
    const errorContainers = formElement.querySelectorAll('.error-message');
    errorContainers.forEach(container => {
        container.innerHTML = '';
        container.style.display = 'none';
    });
    
    const invalidFields = formElement.querySelectorAll('.is-invalid');
    invalidFields.forEach(field => {
        field.classList.remove('is-invalid');
    });
    
    edcValidator.clearErrors();
}

// 即時驗證事件處理
function setupFieldValidation(field, rules) {
    const validateField = () => {
        const isValid = validateFormField(field, rules);
        const errorContainer = field.parentNode.querySelector('.error-message') || 
                             createErrorContainer(field);
        
        if (isValid) {
            edcValidator.hideFieldErrors(errorContainer);
            field.classList.remove('is-invalid');
            field.classList.add('is-valid');
        } else {
            edcValidator.showFieldErrors(field.name, errorContainer);
            field.classList.remove('is-valid');
            field.classList.add('is-invalid');
        }
    };
    
    // 失去焦點時驗證
    field.addEventListener('blur', validateField);
    
    // 輸入時驗證（使用防抖）
    field.addEventListener('input', debounce(validateField, 300));
}

// 匯出模組
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        EDCValidator,
        VALIDATION_RULES,
        COMMON_VALIDATIONS,
        edcValidator,
        validateFormField,
        showFormErrors,
        clearFormErrors,
        setupFieldValidation
    };
}
