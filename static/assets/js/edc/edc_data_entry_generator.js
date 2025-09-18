class FormGenerator {
    constructor(config) {
        this.config = config;
    }

    // 主要生成函數 ${this.generateDebugSection()}
    generateForm() {
        return `
            <div class="wrap">
                
                ${this.generateTabNavigation()}
                ${this.generateTabContents()}
                ${this.generateActionBar()}
            </div>
        `;
    }

    // 生成 DEBUG 區塊
    generateDebugSection() {
        if (!this.config.debugMode.enabled) return '';
        
        return `
            <section class="card col-12 fade-in" style="background-color: #fff3cd; border: 1px solid #ffeaa7;">
                <h2 style="color: #856404;">${this.config.debugMode.title}</h2>
                <div class="grid">
                    <div class="col-12">
                        <label class="inline">
                            <input type="checkbox" id="debugMode" onchange="toggleDebugMode()"> 
                            啟用 DEBUG 模式（自動填入預設值）
                        </label>
                        <div class="hint" style="color: #856404;">
                            ${this.config.debugMode.description}
                        </div>
                    </div>
                </div>
            </section>
        `;
    }

    // 生成識別區塊
    generateIdentificationSection() {
        const identificationSection = this.config.sections.find(s => s.id === 'identification');
        if (!identificationSection) return '';

        return `
            <section class="card col-12 fade-in">
                <h2>${identificationSection.title}</h2>
                <div class="grid">
                    ${identificationSection.fields.map(field => this.generateField(field)).join('')}
                </div>
            </section>
        `;
    }

    // 生成頁籤導航
    generateTabNavigation() {
        return `
            <div class="tab-navigation col-12">
                ${this.config.tabs.map(tab => 
                    `<button class="tab-btn ${tab.active ? 'active' : ''}" data-tab="${tab.id}">${tab.title}</button>`
                ).join('')}
            </div>
        `;
    }

    // 生成頁籤內容
    generateTabContents() {
        return this.config.tabs.map(tab => {
            const sections = this.config.sections.filter(s => s.tab === tab.id);
            return `
                <div id="${tab.id}-tab" class="tab-content ${tab.active ? 'active' : ''}">
                    ${sections.map(section => this.generateSection(section)).join('')}
                </div>
            `;
        }).join('');
    }

    // 生成區塊
    generateSection(section) {
        let html = `
            <section class="card col-12 fade-in">
                <h2>${section.title}</h2>
        `;

        if (section.subsections) {
            // 有子區塊的情況
            html += section.subsections.map(subsection => `
                <h3>${subsection.title}</h3>
                <div class="grid">
                    ${subsection.fields.map(field => this.generateField(field)).join('')}
                </div>
            `).join('');
        } else if (section.fields) {
            // 直接有欄位的情況
            html += `
                <div class="grid">
                    ${section.fields.map(field => this.generateField(field)).join('')}
                </div>
            `;
        }

        html += `</section>`;
        return html;
    }

    // 生成欄位
    generateField(field) {
        const colClass = field.colClass || 'col-9';
        const required = field.required ? '<span style="color: var(--danger);">*</span>' : '';
        
        let fieldHtml = '';

        switch (field.type) {
            case 'text':
                fieldHtml = this.generateTextInput(field);
                break;
            case 'number':
                fieldHtml = this.generateNumberInput(field);
                break;
            case 'date':
                fieldHtml = this.generateDateInput(field);
                break;
            case 'radio':
                fieldHtml = this.generateRadioInput(field);
                break;
            case 'checkbox':
                fieldHtml = this.generateCheckboxInput(field);
                break;
            case 'textarea':
                fieldHtml = this.generateTextareaInput(field);
                break;
            case 'file':
                fieldHtml = this.generateFileInput(field);
                break;
            case 'html':
                fieldHtml = this.generateHtmlContent(field);
                break;
            default:
                fieldHtml = this.generateTextInput(field);
        }

        let html = `
            <div class="${colClass}">
                ${field.label ? `<label for="${field.id}">${field.label} ${required}</label>` : ''}
                ${fieldHtml}
                ${field.hint ? `<div class="hint">${field.hint}</div>` : ''}
                <div class="error" id="${field.id}Err" hidden>${this.getErrorMessage(field)}</div>
        `;

        // 處理條件顯示區塊
        if (field.conditionalSections) {
            field.conditionalSections.forEach(section => {
                html += `
                    <div id="${section.id}" style="${section.style}">
                        ${section.fields.map(subField => {
                            const subFieldHtml = this.generateSubField(subField);
                            return `
                                <label for="${subField.id}">${subField.label}</label>
                                ${subFieldHtml}
                                ${subField.hint ? `<div class="hint">${subField.hint}</div>` : ''}
                            `;
                        }).join('')}
                    </div>
                `;
            });
        }

        html += `</div>`;
        return html;
    }

    // 生成文字輸入框
    generateTextInput(field) {
        const attrs = this.buildInputAttributes(field);
        return `<input id="${field.id}" type="text" ${attrs} />`;
    }

    // 生成數字輸入框
    generateNumberInput(field) {
        const attrs = this.buildInputAttributes(field);
        const numberAttrs = [
            field.min !== undefined ? `min="${field.min}"` : '',
            field.max !== undefined ? `max="${field.max}"` : '',
            field.step !== undefined ? `step="${field.step}"` : ''
        ].filter(Boolean).join(' ');
        
        return `<input id="${field.id}" type="number" ${attrs} ${numberAttrs} />`;
    }

    // 生成日期輸入框
    generateDateInput(field) {
        const attrs = this.buildInputAttributes(field);
        return `<input id="${field.id}" type="date" ${attrs} />`;
    }

    // 生成單選框
    generateRadioInput(field) {
        if (!field.options) return '';
        
        return `
            <div class="row">
                ${field.options.map(option => `
                    <label class="inline">
                        <input type="radio" name="${field.id}" value="${option.value}" ${field.required ? 'required' : ''}> 
                        ${option.text}
                    </label>
                `).join('')}
            </div>
        `;
    }

    // 生成複選框
    generateCheckboxInput(field) {
        const attrs = this.buildInputAttributes(field);
        return `<input id="${field.id}" type="checkbox" ${attrs} />`;
    }

    // 生成文字區域
    generateTextareaInput(field) {
        const attrs = this.buildInputAttributes(field);
        const rows = field.rows || 4;
        return `<textarea id="${field.id}" rows="${rows}" ${attrs}></textarea>`;
    }

    // 生成檔案輸入
    generateFileInput(field) {
        const attrs = this.buildInputAttributes(field);
        const accept = field.accept ? `accept="${field.accept}"` : '';
        const multiple = field.multiple ? 'multiple' : '';
        return `<input id="${field.id}" type="file" ${attrs} ${accept} ${multiple} />`;
    }

    // 生成 HTML 內容
    generateHtmlContent(field) {
        return field.html || '';
    }

    // 生成子欄位（用於條件顯示區塊內）
    generateSubField(field) {
        switch (field.type) {
            case 'text':
                return this.generateTextInput(field);
            case 'number':
                return this.generateNumberInput(field);
            case 'date':
                return this.generateDateInput(field);
            case 'radio':
                return this.generateRadioInput(field);
            case 'checkbox':
                return this.generateCheckboxInput(field);
            case 'textarea':
                return this.generateTextareaInput(field);
            case 'file':
                return this.generateFileInput(field);
            case 'html':
                return this.generateHtmlContent(field);
            default:
                return this.generateTextInput(field);
        }
    }

    // 建立輸入屬性
    buildInputAttributes(field) {
        const attrs = [];
        
        if (field.required) attrs.push('required');
        if (field.readonly) attrs.push('readonly');
        if (field.disabled) attrs.push('disabled');
        if (field.placeholder) attrs.push(`placeholder="${field.placeholder}"`);
        if (field.pattern) attrs.push(`pattern="${field.pattern}"`);
        
        // 處理 checkbox 的 checked 屬性
        if (field.type === 'checkbox') {
            if (field.defaultValue === true || field.defaultValue === '1' || field.defaultValue === 1) {
                attrs.push('checked');
            }
        } else if (field.defaultValue) {
            attrs.push(`value="${field.defaultValue}"`);
        }
        
        return attrs.join(' ');
    }

    // 取得錯誤訊息
    getErrorMessage(field) {
        const messages = {
            'enrollDate': '請選擇納入日期',
            'subjectCode': '請輸入正確格式的受試者代碼',
            'birthDate': '請選擇出生日期',
            'age': '請選擇出生日期以計算年齡',
            'measureDate': '請選擇測量日期',
            'height': '請輸入有效身高',
            'weight': '請輸入有效體重',
            'bmi': '請輸入有效的身高和體重',
            'biochemDate': '請選擇採檢日期',
            'egfr': '請輸入eGFR值'
        };
        
        return messages[field.id] || `請正確填寫${field.label}`;
    }

    // 生成動作列
    generateActionBar() {
        return `
            <section class="card col-12 fade-in" id="actionBar">
                <div class="actions">
                    ${this.config.actions.map(action => `
                        <button 
                            class="${action.class}" 
                            type="button" 
                            id="${action.id}"
                            onclick="${action.onclick}"
                            ${action.hidden ? 'hidden' : ''}
                        >
                            ${action.text}
                        </button>
                    `).join('')}
                </div>
            </section>
        `;
    }
}

// 主要生成函數
function generateResearcherFormHTML(configPath = './edc_data_entry_config.json') {
    // 如果在 Node.js 環境中
    if (typeof require !== 'undefined') {
        const fs = require('fs');
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        const generator = new FormGenerator(config);
        return generator.generateForm();
    }
    
    // 如果在瀏覽器環境中，需要預先載入配置
    if (window.formConfig) {
        const generator = new FormGenerator(window.formConfig);
        return generator.generateForm();
    }
    
    throw new Error('配置檔案未載入');
}

// 異步載入配置檔案的函數（瀏覽器環境）
async function loadConfigAndGenerate(configPath = './edc_data_entry_config.json') {
    try {
        const response = await fetch(configPath);
        const config = await response.json();
        const generator = new FormGenerator(config);
        return generator.generateForm();
    } catch (error) {
        console.error('載入配置檔案失敗:', error);
        throw error;
    }
}

// 匯出（如果是 Node.js 環境）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        FormGenerator,
        generateResearcherFormHTML,
        loadConfigAndGenerate
    };
}

window.FormGenerator = FormGenerator;
window.generateResearcherFormHTML = generateResearcherFormHTML;
window.loadConfigAndGenerate = loadConfigAndGenerate;