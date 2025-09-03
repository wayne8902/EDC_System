/**
 * EDC 資料瀏覽器頁面生成器
 * 根據配置檔案動態生成頁面內容
 */

class DataBrowserGenerator {
    constructor() {
        this.config = null;
        this.loaded = false;
    }

    /**
     * 載入配置檔案
     */
    async loadConfig() {
        try {

            
            const response = await fetch('assets/js/edc/edc_data_browser_config.json');
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const configText = await response.text();
            
            this.config = JSON.parse(configText);
            this.loaded = true;

            
        } catch (error) {
            console.error('✗ 載入配置檔案失敗:', error);
            console.error('錯誤詳情:', {
                name: error.name,
                message: error.message,
                stack: error.stack
            });
            
            // 使用預設配置

            this.config = this.getDefaultConfig();
            this.loaded = true;
        }
    }

    /**
     * 獲取預設配置（當配置檔案載入失敗時使用）
     */
    getDefaultConfig() {
        return {
            subject_detail_page: {
                title: "受試者詳細資料",
                icon: "fas fa-user",
                sections: [
                    {
                        id: "basic_info",
                        title: "基本資料",
                        icon: "fas fa-info-circle",
                        fields: [
                            {
                                id: "subject_code",
                                label: "受試者編號",
                                type: "text",
                                source: "subject.subject_code",
                                width: "col-10"
                            },
                            {
                                id: "age",
                                label: "年齡",
                                type: "text",
                                source: "subject.age",
                                width: "col-10"
                            },
                            {
                                id: "gender",
                                label: "性別",
                                type: "select",
                                source: "subject.gender",
                                width: "col-10",
                                options: {
                                    "1": "男",
                                    "0": "女"
                                }
                            },
                            {
                                id: "height_cm",
                                label: "身高 (cm)",
                                type: "text",
                                source: "subject.height_cm",
                                width: "col-10"
                            },
                            {
                                id: "weight_kg",
                                label: "體重 (kg)",
                                type: "text",
                                source: "subject.weight_kg",
                                width: "col-10"
                            },
                            {
                                id: "bmi",
                                label: "BMI",
                                type: "text",
                                source: "subject.bmi",
                                width: "col-10"
                            }
                        ]
                    },
                    {
                        id: "inclusion_criteria",
                        title: "納入條件評估",
                        icon: "fas fa-check-circle",
                        fields: [
                            {
                                id: "age_18_above",
                                label: "年齡18歲以上",
                                type: "select",
                                source: "inclusion_criteria.age_18_above",
                                width: "col-10",
                                options: {
                                    "1": "是",
                                    "0": "否"
                                }
                            },
                            {
                                id: "gender_available",
                                label: "性別資料完整",
                                type: "select",
                                source: "inclusion_criteria.gender_available",
                                width: "col-10",
                                options: {
                                    "1": "是",
                                    "0": "否"
                                }
                            }
                        ]
                    },
                    {
                        id: "exclusion_criteria",
                        title: "排除條件評估",
                        icon: "fas fa-times-circle",
                        fields: [
                            {
                                id: "pregnant_female",
                                label: "懷孕女性",
                                type: "select",
                                source: "exclusion_criteria.pregnant_female",
                                width: "col-10",
                                options: {
                                    "1": "是",
                                    "0": "否"
                                }
                            }
                        ]
                    }
                ],
                styles: {
                    section_margin: "2rem",
                    field_gap: "1.5rem",
                    input_padding: "0.75rem",
                    input_border: "1px solid #ddd",
                    input_border_radius: "4px",
                    input_background: "#f8f9fa",
                    label_font_weight: "600",
                    label_margin_bottom: "0.5rem"
                }
            }
        };
    }

    /**
     * 獲取預設樣式設定
     */
    getDefaultStyles() {
        return {
            section_margin: "2rem",
            field_gap: "1.5rem",
            input_padding: "0.75rem",
            input_border: "1px solid #ddd",
            input_border_radius: "4px",
            input_background: "#f8f9fa",
            label_font_weight: "600",
            label_margin_bottom: "0.5rem"
        };
    }

    /**
     * 檢查使用者是否有特定權限
     */
    hasPermission(permission) {
        // 檢查全域權限變數
        if (typeof userPermissions !== 'undefined' && Array.isArray(userPermissions)) {
            return userPermissions.includes(permission);
        }
        return false;
    }

    /**
     * 檢查使用者是否有編輯權限
     */
    hasEditPermission() {
        return this.hasPermission('edc.data.edit');
    }

    /**
     * 檢查受試者狀態是否允許編輯
     * @param {Object} subject - 受試者資料對象
     * @returns {boolean} - 是否允許編輯
     */
    canEditByStatus(subject) {
        if (!subject || !subject.status) {
            return true; // 如果沒有狀態資訊，預設允許編輯
        }
        
        const status = subject.status.toLowerCase();
        return status !== 'submitted' && status !== 'signed';
    }

    // 生成受試者詳細資料頁面
    async generateSubjectDetailPage(data) {
        
        // 如果配置未載入，立即嘗試載入
        if (!this.loaded || !this.config) {
            // 顯示載入指示器
            this.showLoadingIndicator();
            
            try {
                await this.loadConfig();
                // 隱藏載入指示器
                this.hideLoadingIndicator();
            } catch (error) {
                console.error('配置檔案載入失敗:', error);
                this.config = this.getDefaultConfig();
                this.loaded = true;
                
                // 隱藏載入指示器
                this.hideLoadingIndicator();
            }
        }

        const config = this.config.subject_detail_page;
        const styles = config.styles || this.getDefaultStyles();
        const canShowEditButton = DataBrowserManager.canShowEditButton(data.subject);
        
        // 檢查是否可以顯示簽署按鈕（狀態為 submitted 且用戶為試驗主持人）
        const canShowSignButton = data.subject?.status === 'submitted' && DataBrowserManager.isInvestigator();
        
        // 檢查是否可以顯示 Query 發起按鈕（用戶為試驗監測者且有權限）
        const canShowQueryButton = DataBrowserManager.canCreateQuery();

        return `
            <div class="wrap">
                <!-- 頁面標題和返回按鈕 -->
                <section class="card col-12 fade-in">
                    <div class="row" style="align-items: center; margin-bottom: 1rem;">
                        <div class="col-8">
                            <h2><i class="${config.icon}"></i> ${config.title}</h2>
                            <p class="text-muted">受試者編號: ${data.subject?.subject_code || 'N/A'}</p>
                        </div>
                        <div class="col-4 text-right">
                            <button class="btn btn-secondary" onclick="DataBrowserManager.backToDataBrowser()">
                                <i class="fas fa-arrow-left"></i> 返回資料瀏覽
                            </button>
                            ${canShowEditButton ? `
                                <button class="btn btn-primary" onclick="DataEditorManager.switchToEditMode()" style="margin-left: 10px;">
                                    <i class="fas fa-edit"></i> 編輯模式
                                </button>
                            ` : ''}
                            ${canShowSignButton ? `
                                <button class="btn btn-success" onclick="DataEditorManager.sign()" style="margin-left: 10px;">
                                    <i class="fas fa-signature"></i> 簽署
                                </button>
                            ` : ''}
                            ${canShowQueryButton ? `
                                <button class="btn btn-warning" onclick="DataBrowserManager.createQuery('${data.subject?.subject_code || ''}')" style="margin-left: 10px;">
                                    <i class="fas fa-question-circle"></i> 發起 Query
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </section>
                
                <!-- 主要資料區域 -->
                <div class="grid">
                    <div class="col-12">
                        ${this.generateSections(config.sections, data, styles)}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 生成所有區塊
     */
    generateSections(sections, data, styles) {
        return sections.map(section => {
            if (section.type === 'placeholder') {
                return this.generatePlaceholderSection(section, styles);
            } else {
                return this.generateDataSection(section, data, styles);
            }
        }).join('');
    }

    /**
     * 生成資料區塊
     */
    generateDataSection(section, data, styles) {
        // 檢查是否有子區段
        if (section.subsections) {
            return this.generateSubsectionsSection(section, data, styles);
        } else {
            const fields = this.generateFields(section.fields, data, styles);
            
            return `
                <section class="card fade-in" style="margin-bottom: ${styles.section_margin};">
                    <h3><i class="${section.icon}"></i> ${section.title}</h3>
                    <div class="grid" style="gap: ${styles.field_gap};">
                        ${fields}
                    </div>
                </section>
            `;
        }
    }

    /**
     * 生成包含子區段的資料區塊
     */
    generateSubsectionsSection(section, data, styles) {
        const subsections = section.subsections.map(subsection => {
            const fields = this.generateFields(subsection.fields, data, styles);
            
            return `
                <div class="subsection" style="margin-bottom: 2rem; padding: 1.5rem; border: 1px solid #e9ecef; border-radius: 8px; background-color: #f8f9fa;">
                    <h4 style="color: #495057; margin-bottom: 1rem; font-size: 1.1rem;">${subsection.title}</h4>
                    <div class="grid" style="gap: ${styles.field_gap};">
                        ${fields}
                    </div>
                </div>
            `;
        }).join('');

        return `
            <section class="card fade-in" style="margin-bottom: ${styles.section_margin};">
                <h3><i class="${section.icon}"></i> ${section.title}</h3>
                <div class="subsections-container">
                    ${subsections}
                </div>
            </section>
        `;
    }

    /**
     * 生成佔位符區塊
     */
    generatePlaceholderSection(section, styles) {
        const content = section.content;
        
        // 如果是歷程記錄區塊，生成特殊的歷程記錄顯示
        if (section.id === 'history_record') {
            return `
                <section class="card fade-in">
                    <h3><i class="${section.icon}"></i> ${section.title}</h3>
                    <div id="historyRecordContent">
                        <div class="text-center" style="padding: 3rem;">
                            <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: #007bff; margin-bottom: 1rem;"></i>
                            <p class="text-muted" style="font-size: 1.1rem; margin-bottom: 0.5rem;">載入歷程記錄中...</p>
                        </div>
                    </div>
                </section>
            `;
        }
        
        return `
            <section class="card fade-in">
                <h3><i class="${section.icon}"></i> ${section.title}</h3>
                <div class="text-center" style="padding: 3rem;">
                    <i class="${content.icon}" style="font-size: ${content.icon_size}; color: #ccc; margin-bottom: 1rem;"></i>
                    <p class="text-muted" style="font-size: 1.1rem; margin-bottom: 0.5rem;">${content.title}</p>
                    <p class="text-muted">${content.description}</p>
                </div>
            </section>
        `;
    }

    /**
     * 生成欄位
     */
    generateFields(fields, data, styles) {
        return fields.map(field => {
            const value = this.getFieldValue(field.source, data);
            const displayValue = this.formatFieldValue(field, value);
            
            // 根據欄位類型生成不同的顯示方式
            if (field.type === 'radio' || field.type === 'checkbox') {
                return this.generateRadioCheckboxField(field, value, styles);
            } else if (field.type === 'textarea') {
                return this.generateTextareaField(field, value, styles);
            } else {
                return this.generateTextField(field, displayValue, styles);
            }
        }).join('');
    }

    /**
     * 生成單選/複選欄位
     */
    generateRadioCheckboxField(field, value, styles) {
        const inputType = field.type;
        // 在瀏覽模式下，所有欄位都應該是唯讀的
        const isDisabled = true; // 強制設為唯讀
        
        let optionsHTML = '';
        
        if (field.options && field.options.length > 0) {
            // 如果有選項配置，生成選項
            optionsHTML = field.options.map(option => {
                const isChecked = value == option.value;
                const disabledAttr = 'disabled'; // 強制設為唯讀
                const checkedAttr = isChecked ? 'checked' : '';
                
                // 為 radio button 添加 name 屬性，確保只能單選
                const nameAttr = inputType === 'radio' ? `name="${field.id}"` : '';
                
                return `
                    <label class="radio-checkbox-option" style="display: flex; align-items: center; margin-right: 1.5rem; margin-bottom: 0.5rem;">
                        <input type="${inputType}" 
                               value="${option.value}" 
                               ${nameAttr}
                               ${checkedAttr} 
                               ${disabledAttr}
                               style="margin-right: 0.5rem; opacity: 0.6; cursor: not-allowed;">
                        <span>${option.text}</span>
                    </label>
                `;
            }).join('');
        } else {
            // 如果沒有選項配置（通常是checkbox），根據值生成單一選項
            if (inputType === 'checkbox') {
                const isChecked = value == 1 || value === true;
                const disabledAttr = 'disabled'; // 強制設為唯讀
                const checkedAttr = isChecked ? 'checked' : '';
                
                optionsHTML = `
                    <label class="radio-checkbox-option" style="display: flex; align-items: center; margin-right: 1.5rem; margin-bottom: 0.5rem;">
                        <input type="${inputType}" 
                               name="${field.id}"
                               id="${field.id}"
                               value="1" 
                               ${checkedAttr} 
                               ${disabledAttr}
                               style="margin-right: 0.5rem; opacity: 0.6; cursor: not-allowed;">
                        <span>${isChecked ? '是' : '否'}</span>
                    </label>
                `;
            }
        }

        const hintHTML = field.hint ? `<small class="text-muted" style="display: block; margin-top: 0.5rem;">${field.hint}</small>` : '';

        return `
            <div class="${field.width}">
                <label style="font-weight: ${styles.label_font_weight}; margin-bottom: ${styles.label_margin_bottom}; display: block;">
                    ${field.label}
                </label>
                <div class="options-container" style="padding: ${styles.input_padding}; border: ${styles.input_border}; border-radius: ${styles.input_border_radius}; background-color: ${styles.input_background};">
                    ${optionsHTML}
                </div>
                ${hintHTML}
            </div>
        `;
    }

    /**
     * 生成文字區域欄位
     */
    generateTextareaField(field, value, styles) {
        const rows = field.rows || 4;
        const placeholder = field.placeholder || '';
        const hintHTML = field.hint ? `<small class="text-muted" style="display: block; margin-top: 0.5rem;">${field.hint}</small>` : '';

        return `
            <div class="${field.width}">
                <label style="font-weight: ${styles.label_font_weight}; margin-bottom: ${styles.label_margin_bottom}; display: block;">
                    ${field.label}
                </label>
                <textarea readonly 
                        disabled
                        id="${field.id}"
                        name="${field.id}"
                        rows="${rows}" 
                        placeholder="${placeholder}"
                        style="width: 100%; 
                            padding: ${styles.input_padding}; 
                            border: ${styles.input_border}; 
                            border-radius: ${styles.input_border_radius}; 
                            background-color: ${styles.input_background}; 
                            resize: vertical;
                            opacity: 0.6; 
                            cursor: not-allowed;">${value || ''}</textarea>
                ${hintHTML}
            </div>
        `;
    }

    /**
     * 生成文字欄位
     */
    generateTextField(field, displayValue, styles) {
        const placeholder = field.placeholder || '';
        const hintHTML = field.hint ? `<small class="text-muted" style="display: block; margin-top: 0.5rem;">${field.hint}</small>` : '';

        return `
            <div class="${field.width}">
                <label style="font-weight: ${styles.label_font_weight}; margin-bottom: ${styles.label_margin_bottom}; display: block;">
                    ${field.label}
                </label>
                <input type="text" 
                    id="${field.id}"
                    name="${field.id}"
                    value="${displayValue}" 
                    placeholder="${placeholder}"
                    readonly 
                    disabled
                    style="width: 100%; 
                            padding: ${styles.input_padding}; 
                            border: ${styles.input_border}; 
                            border-radius: ${styles.input_border_radius}; 
                            background-color: ${styles.input_background};
                            opacity: 0.6; 
                            cursor: not-allowed;">
                ${hintHTML}
            </div>
        `;
    }

    /**
     * 根據來源路徑獲取欄位值
     */
    getFieldValue(source, data) {
        if (!source || !data) return null;
        
        const path = source.split('.');
        let value = data;
        
        for (const key of path) {
            if (value && typeof value === 'object' && key in value) {
                value = value[key];
            } else {
                return null;
            }
        }
        
        return value;
    }

    /**
     * 格式化欄位值
     */
    formatFieldValue(field, value) {
        if (value === null || value === undefined) {
            return 'N/A';
        }

        // 如果是選擇類型且有選項配置
        if (field.type === 'select' && field.options) {
            return field.options[value] || value;
        }

        // 如果是單選或複選類型且有選項配置
        if ((field.type === 'radio' || field.type === 'checkbox') && field.options) {
            const option = field.options.find(opt => opt.value == value);
            return option ? option.text : value;
        }

        // 如果是布林值
        if (typeof value === 'boolean') {
            return value ? '是' : '否';
        }

        // 如果是數字且為0或1，但只對布林類型或有選項配置的欄位進行轉換
        if (typeof value === 'number' && (value === 0 || value === 1)) {
            if (field.options) {
                // 檢查是否有新的選項格式
                if (Array.isArray(field.options)) {
                    const option = field.options.find(opt => opt.value == value);
                    return option ? option.text : value;
                } else {
                    // 舊格式的選項
                    return field.options[value] || value;
                }
            }
            // 只對明確標示為布林類型的欄位（radio、checkbox、select）進行是/否轉換
            if (field.type === 'radio' || field.type === 'checkbox' || field.type === 'select') {
                return value === 1 ? '是' : '否';
            }
            // 對於其他類型（如text），直接返回原始數值
            return value;
        }

        return value;
    }

    /**
     * 驗證配置檔案
     */
    validateConfig() {
        if (!this.config || !this.config.subject_detail_page) {
            console.error('配置檔案格式錯誤');
            return false;
        }

        const requiredKeys = ['title', 'icon', 'sections'];
        for (const key of requiredKeys) {
            if (!(key in this.config.subject_detail_page)) {
                console.error(`配置檔案缺少必要欄位: ${key}`);
                return false;
            }
        }

        return true;
    }

    /**
     * 重新載入配置
     */
    async reloadConfig() {
        this.loaded = false;
        await this.loadConfig();
    }
    
    /**
     * 顯示載入指示器
     */
    showLoadingIndicator() {
        const mainContent = document.getElementById('mainContent');
        if (mainContent) {
            const loadingHTML = `
                <div class="wrap">
                    <section class="card col-12 fade-in">
                        <div class="text-center" style="padding: 3rem;">
                            <div class="spinner-border text-primary" role="status">
                                <span class="visually-hidden">載入中...</span>
                            </div>
                            <h5 class="mt-3">正在載入頁面配置...</h5>
                            <p class="text-muted">請稍候，正在載入詳細資料頁面的配置檔案</p>
                        </div>
                    </section>
                </div>
            `;
            mainContent.innerHTML = loadingHTML;
        }
    }
    
    /**
     * 隱藏載入指示器
     */
    hideLoadingIndicator() {
    }
}

// 創建全域實例
const dataBrowserGenerator = new DataBrowserGenerator();

// EDC 資料瀏覽器生成器已載入
