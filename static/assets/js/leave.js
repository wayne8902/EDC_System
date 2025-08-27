// 測試模式開關 - 設為 true 啟用測試模式
const TEST_MODE = true;

// 測試模式預設資料
const TEST_DATA = {
    leave_type_id: '1',
    start_date: '',
    start_hour: '09',
    start_minute: '00',
    end_date: '',
    end_hour: '17',
    end_minute: '00',
    reason: '測試請假事由',
    job_rep: 'khh00001'
};

let leaveList = {
    leave: [],
    job_rep: []
};

function loadAllData() {
    loadMyLeaveBalance();
    loadLeaves();
    
    // 測試模式：自動填入預設資料
    if (TEST_MODE) {
        setTimeout(() => {
            fillTestData();
        }, 1000); // 等待職代列表載入完成
    }
}

$(document).ready(function() {
    loadAllData();
});

function loadMyLeaveBalance() {
  fetch('/leave/balance')
    .then(res => res.json())
    .then(data => {
      document.getElementById('annualLeave').innerHTML = data.annual_leave + ' 天';
      document.getElementById('personalLeave').innerHTML = data.personal_leave + ' 天';
      document.getElementById('sickLeave').innerHTML = data.sick_leave + ' 天';
      document.getElementById('compensatoryPoints').innerHTML = data.compensatory_point + ' 天';
    })
    .catch(() => {
      document.getElementById('annualLeave').innerHTML = '- 天';
      document.getElementById('personalLeave').innerHTML = '- 天';
      document.getElementById('sickLeave').innerHTML = '- 天';
      document.getElementById('compensatoryPoints').innerHTML = '- 天';
    });
}



function loadLeaves() {
    loadJobRepList();
    let pageSize = document.getElementById('entriesPerPage').value;
    let days = document.getElementById('daysFilter').value;
    $.ajax({
        url: '/leave/loadleave?pageSize=' + pageSize + '&days=' + days,
        type: 'GET',
        dataType: 'json',
        success: function(response) {
            if (response.status === 200) {
                console.log(response.data);
                renderLeaveTable(response.current_user, response.data);
                renderJobRepLeaveTable(response.current_user, response.data_rep);
            } else {
                alert('載入部門下請假單失敗');
            }
        },
        error: function() {
            alert('伺服器錯誤，無法取得部門下請假單');
        }
    });
}
document.getElementById('entriesPerPage').addEventListener('change', function() {
    loadLeaves();
});
document.getElementById('daysFilter').addEventListener('change', function() {
    loadLeaves();
});


// 測試模式：填入預設資料
function fillTestData() {
    if (!TEST_MODE) return;
    
    // 設定預設日期（明天）
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    // 填入表單資料
    const leaveType = document.getElementById('leaveType');
    const startDate = document.getElementById('startDate');
    const startHour = document.getElementById('startHour');
    const startMinute = document.getElementById('startMinute');
    const endDate = document.getElementById('endDate');
    const endHour = document.getElementById('endHour');
    const endMinute = document.getElementById('endMinute');
    const reason = document.getElementById('reason');
    const jobRep = document.getElementById('job_rep');
    
    if (leaveType) leaveType.value = TEST_DATA.leave_type_id;
    if (startDate) startDate.value = tomorrowStr;
    if (startHour) startHour.value = TEST_DATA.start_hour;
    if (startMinute) startMinute.value = TEST_DATA.start_minute;
    if (endDate) endDate.value = tomorrowStr;
    if (endHour) endHour.value = TEST_DATA.end_hour;
    if (endMinute) endMinute.value = TEST_DATA.end_minute;
    if (reason) reason.value = TEST_DATA.reason;
    if (jobRep) jobRep.value = TEST_DATA.job_rep;
    
    console.log('🧪 測試模式：已填入預設資料');
}

// 職代下拉選單的內容
function loadJobRepList() {
    fetch('/leave/job_rep')
        .then(response => response.json())
        .then(data => {
            if (data.status === 200) {
                let html = '<option value="">請選擇職務代理人</option>';
                data.data.forEach(user => {
                    html += `<option value="${user.id}">${user.id} ${user.name}</option>`;
                });
                document.getElementById('job_rep').innerHTML = html;
            } else {
                alert('無法取得職務代理人名單');
            }
        })
        .catch(() => {
            alert('伺服器錯誤，請稍後再試');
        });
}

// 將請假單資料渲染到頁面
function renderLeaveTable(currentUser, leaves) {
    leaveList.leave = leaves;
    let html = '';
    if (leaves.length === 0) {
        html = '<tr><td colspan="9">目前無部門下請假申請</td></tr>';
    } else {
        leaves.forEach(function(leave, idx) {
            html += `<tr>
                <td>${leave.NAME}</td>
                <td>${leave.USER}</td>
                <td>${leave.LEAVE_TYPE_ID}</td>
                <td>${leave.START_DATE.replace('T', ' ')}</td>
                <td>${leave.END_DATE.replace('T', ' ')}</td>
                <td>${leave.HOURS-Math.floor(leave.DAYS)*8}</td>
                <td>${Math.floor(leave.DAYS)}</td>
                <td title="${leave.REASON}">${leave.REASON}</td>
                <td>${leave.APPROVER_NAME || ''}</td>
                <td>${leave.STATUS}</td>`;
                
            if (currentUser === leave.USER && leave.can_approve && (leave.STATUS === '暫存' || leave.STATUS === '職代駁回' || leave.STATUS === '駁回')) {
                html += `<td>
                    <button class="btn btn-primary btn-sm" onclick="renderLeaveEditForm('${idx}', 'leave')">編輯</button>
                    <button class="btn btn-success btn-sm" onclick="approveLeave('${idx}', 'leave')">審核</button>
                    <button class="btn btn-danger btn-sm" onclick="openRejectModal('${idx}', 'leave', '${leave.STATUS}')">刪除</button>
                    <button class="btn btn-info btn-sm" onclick="renderLeaveDetail('${idx}', 'leave')">查閱</button>
                </td>`;
            }else if (leave.can_approve && (leave.STATUS === '審核中' || leave.STATUS === '駁回')) {
                html += `<td>
                    <button class="btn btn-success btn-sm" onclick="approveLeave('${idx}', 'leave')">審核</button>
                    <button class="btn btn-danger btn-sm" onclick="openRejectModal('${idx}', 'leave', '${leave.STATUS}')">駁回</button>
                    <button class="btn btn-info btn-sm" onclick="renderLeaveDetail('${idx}', 'leave')">查閱</button>
                </td>`;
            }  
            else {
                html += `<td>
                    <button class="btn btn-info btn-sm" onclick="renderLeaveDetail('${idx}', 'leave')">查閱</button>
                </td>`;
            }
            html += `</tr>`;
        });
    }
    $('#subordinateLeaveTableBody').html(html);
}

// 渲染可編輯的審核關卡
function renderEditableStages(stages) {
    let stageList;
    if (Array.isArray(stages)) {
        stageList = stages;
    } else {
        try {
            stageList = JSON.parse(stages);
        } catch {
            stageList = stages.replace(/[\[\]'"]+/g, '').split(',');
        }
    }
    
    let html = `<div class="stages-editor">`;
    
    // 添加標題和說明
    html += `<div class="mb-2">
        <small class="text-muted">點擊關卡可以編輯，拖拽可以調整順序（第一、二關固定）</small>
    </div>`;
    
    // 渲染每個關卡
    stageList.forEach((stage, idx) => {
        let stageDisplay = '';
        if (Array.isArray(stage) && stage.length >= 2) {
            stageDisplay = `${stage[0]} ${stage[1]}`;
        } else {
            stageDisplay = stage.toString();
        }
        
        // 前兩關（自己和職代）固定，不可編輯和拖拽
        const isFixed = idx < 2;
        const isEditable = !isFixed;
        const isDraggable = !isFixed;
        
        html += `
            <div class="stage-item mb-2 ${isFixed ? 'fixed-stage' : ''}" 
                 data-index="${idx}" 
                 draggable="${isDraggable}">
                <div class="input-group">
                    <span class="input-group-text">${idx + 1}</span>
                    <input type="text" class="form-control stage-input ${isFixed ? 'disabled' : ''}" 
                           value="${stageDisplay}" 
                           data-original="${stageDisplay}" 
                           data-index="${idx}"
                           ${isFixed ? 'readonly' : ''}>
                    ${isEditable ? `
                        <button class="btn btn-outline-danger btn-sm remove-stage" type="button" 
                                onclick="removeStage(${idx})" title="移除關卡">
                            <i class="fas fa-times"></i>
                        </button>
                    ` : `
                        <button class="btn btn-outline-secondary btn-sm" type="button" disabled title="固定關卡">
                            <i class="fas fa-lock"></i>
                        </button>
                    `}
                </div>
            </div>
        `;
    });
    
    // 添加新關卡的按鈕
    html += `
        <div class="mt-3">
            <button class="btn btn-outline-primary btn-sm" onclick="addNewStage()" type="button">
                <i class="fas fa-plus"></i> 新增關卡
            </button>
        </div>
    `;
    
    // 添加儲存按鈕
    html += `
        <div class="mt-3">
            <button class="btn btn-success btn-sm" onclick="saveStagesChanges()" type="button">
                <i class="fas fa-save"></i> 儲存變更
            </button>
        </div>
    `;
    
    html += `</div>`;
    
    // 等待 DOM 渲染完成後添加拖拽功能
    setTimeout(() => {
        initDragAndDrop();
    }, 100);
    
    return html;
}

// 初始化拖拽功能
function initDragAndDrop() {
    const stageItems = document.querySelectorAll('.stage-item');
    
    // 添加拖拽相關的 CSS 樣式
    const style = document.createElement('style');
    style.textContent = `
        .stage-item {
            cursor: move;
            transition: all 0.2s ease;
        }
        .stage-item.fixed-stage {
            cursor: not-allowed;
            opacity: 0.8;
        }
        .stage-item.fixed-stage:hover {
            background-color: #e9ecef;
        }
        .stage-item:not(.fixed-stage):hover {
            background-color: #f8f9fa;
            border-radius: 5px;
        }
        .stage-item.dragging {
            opacity: 0.5;
            transform: scale(1.05);
        }
        .stages-editor {
            padding: 15px;
            border: 1px solid #dee2e6;
            border-radius: 8px;
            background-color: #f8f9fa;
        }
        .stage-input {
            font-size: 14px;
        }
        .stage-input:disabled {
            background-color: #e9ecef;
            color: #6c757d;
        }
        .remove-stage {
            border-left: 1px solid #dee2e6;
        }
    `;
    document.head.appendChild(style);
    
    stageItems.forEach((item, idx) => {
        // 只有非固定關卡才能拖拽
        if (idx >= 2) {
            item.addEventListener('dragstart', handleDragStart);
            item.addEventListener('dragover', handleDragOver);
            item.addEventListener('drop', handleDrop);
            item.addEventListener('dragend', handleDragEnd);
        }
    });
}

// 拖拽事件處理
function handleDragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.dataset.index);
    e.target.classList.add('dragging');
}

function handleDragOver(e) {
    e.preventDefault();
}

function handleDrop(e) {
    e.preventDefault();
    const draggedIndex = e.dataTransfer.getData('text/plain');
    const targetItem = e.target.closest('.stage-item');
    
    // 前兩關不能參與拖拽
    if (draggedIndex < 2 || targetItem.dataset.index < 2) {
        return;
    }
    
    if (targetItem && targetItem.dataset.index !== draggedIndex) {
        const stagesEditor = document.getElementById('stagesEditor');
        const draggedItem = stagesEditor.querySelector(`[data-index="${draggedIndex}"]`);
        
        if (draggedItem && targetItem) {
            // 交換位置
            const targetIndex = targetItem.dataset.index;
            const temp = targetItem.nextSibling;
            
            if (draggedItem.nextSibling === targetItem) {
                draggedItem.parentNode.insertBefore(targetItem, draggedItem);
            } else {
                draggedItem.parentNode.insertBefore(draggedItem, targetItem);
                if (temp) {
                    targetItem.parentNode.insertBefore(targetItem, temp);
                }
            }
            
            // 重新編號
            renumberStages();
        }
    }
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
}

// 新增關卡
function addNewStage() {
    const stagesEditor = document.querySelector('.stages-editor');
    if (!stagesEditor) return;
    
    const stageItems = stagesEditor.querySelectorAll('.stage-item');
    const newIndex = stageItems.length;
    
    const newStageHtml = `
        <div class="stage-item mb-2" data-index="${newIndex}" draggable="true">
            <div class="input-group">
                <span class="input-group-text">${newIndex + 1}</span>
                <input type="text" class="form-control stage-input" value="新關卡" 
                       data-original="新關卡" data-index="${newIndex}">
                <button class="btn btn-outline-danger btn-sm remove-stage" type="button" 
                        onclick="removeStage(${newIndex})" title="移除關卡">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
    `;
    
    // 插入到新增按鈕之前
    const addButton = stagesEditor.querySelector('button[onclick="addNewStage()"]');
    addButton.insertAdjacentHTML('beforebegin', newStageHtml);
    
    // 重新編號所有關卡
    renumberStages();
}

// 移除關卡
function removeStage(index) {
    // 前兩關（自己和職代）不能移除
    if (index < 2) {
        alert('前兩關（自己和職代）不能移除！');
        return;
    }
    
    const stageItem = document.querySelector(`.stage-item[data-index="${index}"]`);
    if (stageItem) {
        stageItem.remove();
        renumberStages();
    }
}

// 重新編號關卡
function renumberStages() {
    const stageItems = document.querySelectorAll('.stage-item');
    stageItems.forEach((item, idx) => {
        item.setAttribute('data-index', idx);
        const numberSpan = item.querySelector('.input-group-text');
        const removeButton = item.querySelector('.remove-stage');
        const input = item.querySelector('.stage-input');
        
        if (numberSpan) numberSpan.textContent = idx + 1;
        if (removeButton) removeButton.setAttribute('onclick', `removeStage(${idx})`);
        if (input) input.setAttribute('data-index', idx);
    });
}

// 儲存關卡變更
function saveStagesChanges() {
    const stageInputs = document.querySelectorAll('.stage-input');
    const updatedStages = [];
    
    stageInputs.forEach(input => {
        const value = input.value.trim();
        if (value) {
            updatedStages.push(value);
        }
    });
    
    if (updatedStages.length === 0) {
        alert('至少需要一個審核關卡！');
        return;
    }
    
    // 更新全域變數中的審核流程
    if (window.currentApprovalStages) {
        window.currentApprovalStages = updatedStages;
        console.log('審核關卡已更新:', updatedStages);
        alert('審核關卡已儲存！');
    }
}

// 渲染"審核進度"的功能
function renderApprovalStages(stageStr, current_stage) {
    let stages;
    if (Array.isArray(stageStr)) {
        stages = stageStr;
    } else {
        try {
            stages = JSON.parse(stageStr);
        } catch {
            stages = stageStr.replace(/[\[\]'"]+/g, '').split(',');
        }
    }
    
    let currIdx = current_stage;
    if (currIdx == null || currIdx < 0 || currIdx > stages.length) {
        currIdx = stages.length;
    }

    let html = `<div style="display:flex;flex-direction:column;align-items:flex-start;">`;

    stages.forEach((stage, idx) => {
        const isReached = idx <= currIdx;
        const dotColor = isReached ? '#2196f3' : '#cccccc';
        const lineColor = isReached ? '#2196f3' : '#cccccc';

        let nameDisplay = '';
        if (Array.isArray(stage) && stage.length >= 2) {
            nameDisplay = `${stage[0]} ${stage[1]}`;
        } else {
            nameDisplay = stage.toString();
        }

        // 為前兩關添加說明和顏色
        let stageLabel = '';
        let stageColor = '';
        if (idx === 0) {
            stageLabel = ' (自己)';
            stageColor = '#007bff'; // 藍色 - 與 submit 相同
        } else if (idx === 1) {
            stageLabel = ' (職代)';
            stageColor = '#17a2b8'; // 青色 - 與 rep_approve 相同
        } else {
            stageColor = '#000000'; // 黑色 - 一般關卡
        }

        html += `
            <div style="display:flex;align-items:center;">
                <div style="display:flex;flex-direction:column;align-items:center;">
                    <div style="width:18px;height:18px;border-radius:50%;background:${dotColor};border:2px solid ${dotColor};"></div>
                </div>
                <span style="font-size:13px;margin-left:10px;color:${stageColor};font-weight:${idx < 2 ? 'bold' : 'normal'};">
                    ${nameDisplay}${stageLabel}
                </span>
            </div>
            ${idx < stages.length - 1
                ? `<div style="margin-left:7px;width:4px;height:28px;background:${lineColor};"></div>`
                : ``
            }
        `;
    });

    const isLastReached = currIdx >= stages.length;
    const lastDotColor = isLastReached ? '#2196f3' : '#cccccc';
    html += `
        <div style="margin-left:7px;width:4px;height:28px;background:${lastDotColor};"></div>
        <div style="display:flex;align-items:center;">
            <div style="display:flex;flex-direction:column;align-items:center;">
                <div style="width:18px;height:18px;border-radius:50%;background:${lastDotColor};border:2px solid ${lastDotColor};"></div>
            </div>
            <span style="font-size:13px;margin-left:10px;">核准</span>
        </div>
    `;
    return html;
}

// 渲染"審核歷史紀錄"的功能
function renderApprovalLogs(logs) {
    if (!Array.isArray(logs) || logs.length === 0)
        return '<span class="text-muted">暫無歷程</span>';

    const actionMap = {
        "approve": "<span class='badge rounded-pill bg-success text-white'>審核通過</span>",
        "rep_approve": "<span class='badge rounded-pill' style='background-color:#17a2b8;color:white;'>職代同意</span>",
        "reject": "<span class='badge rounded-pill bg-danger text-white'>駁回</span>",
        "rep_reject": "<span class='badge rounded-pill bg-danger text-white'>職代駁回</span>",
        "submit": "<span class='badge rounded-pill' style='background-color:#007bff;color:white;'>送出申請</span>",
    };

    let html = "<table class='table table-sm table-bordered table-striped align-middle mb-0'><thead class='table-light'><tr><th>時間</th><th>人員</th><th>動作</th></tr></thead><tbody>";

    logs.forEach(log => {
        const user = log[1] || log[0];
        const time = log[2] || '';
        const action = actionMap[log[3]] || log[3];
        const showTime = time ? time.substr(0, 10).replace(/-/g, "/") + " " + time.substr(11, 5) : '';

        let reason = log[4] || '';

        if (reason) {
            reason = reason.replace(/u([0-9a-fA-F]{4})/g, function(match, grp) {
                return String.fromCharCode(parseInt(grp, 16));
            });
        }

        // 第一列：動作列
        html += `<tr>
            <td>${showTime}</td>
            <td>${user}</td>
            <td>${action}</td>
        </tr>`;

        if (log[3] === 'reject' && reason) {
            html += `<tr>
                <td colspan="3" class="text-muted" style="padding-left: 0rem;">駁回理由：${reason}</td>
            </tr>`;
        }
    });

    html += "</tbody></table>";
    return html;
}


// 渲染"查閱"案紐的功能
function renderLeaveDetail(idx, type) {
    const leave = leaveList[type][idx];
    let html = `
        <table class="table table-bordered" style="width:100%;font-size:16px;table-layout:fixed;word-break:break-all;">
            <tr><th>姓名</th><td>${leave.NAME}</td></tr>
            <tr><th>員工編號</th><td>${leave.USER}</td></tr>
            <tr><th>假別</th><td>${leave.LEAVE_TYPE_ID}</td></tr>
            <tr><th>開始日期</th><td>${leave.START_DATE.replace('T', ' ')}</td></tr>
            <tr><th>結束日期</th><td>${leave.END_DATE.replace('T', ' ')}</td></tr>
            <tr><th>時數</th><td>${leave.HOURS-Math.floor(leave.DAYS)*8}</td></tr>
            <tr><th>天數</th><td>${Math.floor(leave.DAYS)}</td></tr>
            <tr><th>事由</th><td>${leave.REASON}</td></tr>
            <tr><th>職務代理人</th><td>${leave.JOB_REP_NAME || ''}</td></tr>
            <tr><th>審核人</th><td>${leave.APPROVER_NAME || ''}</td></tr>
            <tr><th>審核進度</th><td>${renderApprovalStages(leave.APPROVALSTAGES, leave.CURRENT_STAGE)}</td></tr>
            <tr>
                <th>審核歷史紀錄</th>
                <td>
                    <div class="collapse mt-2" id="approvalLogsCollapse">
                    ${renderApprovalLogs(leave.APPROVALLOGS) || ''}
                    </div>
                </td>
            </tr>
            <tr><th>狀態</th><td>${leave.STATUS}</td></tr>
            <tr>
                <th>證明文件</th>
                <td>
                    ${
                        leave.FILEPATH && leave.FILEPATH.toLowerCase().endsWith('.pdf')
                        ? `<a href="${leave.FILEPATH}" class="btn btn-outline-primary btn-sm" target="_blank">檢視</a>`
                        : '無'
                    }
                </td>
            </tr>
        </table>
    `;
    $('#leaveDetailBody').html(html);

    let footerHtml = `
        <button class="btn btn-success" onclick="downloadLeaveDetail()">下載表格</button>
        <button class="btn btn-secondary" data-bs-dismiss="modal">關閉</button>
    `;
    $('#leaveDetailFooter').html(footerHtml);
    $('#leaveDetailModal').modal('show');
}

function renderLeaveEditForm(idx, type) {
    const leave = leaveList[type][idx];
    let html = `
        <form id="editLeaveForm">
            <table class="table table-bordered" style="width:100%;font-size:16px;table-layout:fixed;word-break:break-all;">
                <tr><th>姓名</th><td><input type="text" class="form-control" name="user_name" value="${leave.NAME}" readonly></td></tr>
                <tr><th>員工編號</th><td><input type="text" class="form-control" name="user_id" value="${leave.USER}" readonly></td></tr>
                <tr><th>假別</th><td><input type="text" class="form-control" name="leave_type_id" value="${leave.LEAVE_TYPE_ID}" readonly></td></tr>
                <tr>
                    <th>開始日期時間</th>
                    <td>
                        <div class="row">
                            <div class="col-6">
                                <input type="date" class="form-control" id="editStartDate" style="color: #212529;" value="${leave.START_DATE.split(' ')[0]}" required>
                            </div>
                            <div class="col-3">
                                <select class="form-control" style="color: #212529;" id="editStartHour" required>
                                    <option value="">時</option>
                                </select>
                            </div>
                            <div class="col-3">
                                <select class="form-control" style="color: #212529;" id="editStartMinute" required>
                                    <option value="">分</option>
                                </select>
                            </div>
                        </div>
                        <input type="hidden" name="start_date_edit" id="editStartDateHidden">
                    </td>
                </tr>
                <tr>
                    <th>結束日期時間</th>
                    <td>
                        <div class="row">
                            <div class="col-6">
                                <input type="date" class="form-control" style="color: #212529;" id="editEndDate" value="${leave.END_DATE.split(' ')[0]}" required>
                            </div>
                            <div class="col-3">
                                <select class="form-control" style="color: #212529;" id="editEndHour" required>
                                    <option value="">時</option>
                                </select>
                            </div>
                            <div class="col-3">
                                <input type="text" class="form-control" id="editEndMinute" readonly placeholder="分" style="background-color: #e9ecef;">
                            </div>
                        </div>
                        <input type="hidden" name="end_date_edit" id="editEndDateHidden">
                    </td>
                </tr>
                <tr><th>時數</th><td><input type="number" class="form-control" name="hours_edit" value="${leave.HOURS-Math.floor(leave.DAYS)*8}"" readonly></td></tr>
                <tr><th>天數</th><td><input type="number" class="form-control" name="days_edit" value="${Math.floor(leave.DAYS)}"" readonly></td></tr>
                <tr><th>事由</th><td><textarea class="form-control" name="reason" style="color: #212529;" required>${leave.REASON}</textarea></td></tr>
                <tr><th>審核人</th><td><input type="text" class="form-control" name="approver_name" value="${leave.APPROVER_NAME || ''}" readonly></td></tr>
                <tr><th>狀態</th><td><input type="text" class="form-control" name="status" value="${leave.STATUS}" readonly></td></tr>
                <tr>
                    <th>證明文件</th>
                    <td>
                        ${
                            leave.FILEPATH && leave.FILEPATH.toLowerCase().endsWith('.pdf')
                            ? `<a href="${leave.FILEPATH}" class="btn btn-outline-primary btn-sm" target="_blank">檢視</a>`
                            : '無'
                        }
                        <input type="file" class="form-control mt-2" name="attachment">
                    </td>
                </tr>
            </table>
        </form>
    `;
    $('#leaveEditBody').html(html);

    let footerHtml = `
        <button class="btn btn-primary" onclick="submitEditLeave('${leave.LEAVE_ID}')">儲存修改</button>
        <button class="btn btn-secondary" data-bs-dismiss="modal">關閉</button>
    `;
    $('#leaveEditFooter').html(footerHtml);
    $('#leaveEditModal').modal('show');

    // 動態生成小時選項 (0-23)
    const startHourSelect = document.getElementById('editStartHour');
    const endHourSelect = document.getElementById('editEndHour');
    for (let i = 0; i < 24; i++) {
        const hour = i.toString().padStart(2, '0');
        startHourSelect.innerHTML += `<option value="${hour}">${hour}</option>`;
        endHourSelect.innerHTML += `<option value="${hour}">${hour}</option>`;
    }

    // 動態生成分鐘選項 (0, 15, 30, 45)
    const startMinuteSelect = document.getElementById('editStartMinute');
    for (let i = 0; i < 60; i += 15) {
        const minute = i.toString().padStart(2, '0');
        startMinuteSelect.innerHTML += `<option value="${minute}">${minute}</option>`;
    }

    // 設定初始時間值
    const startTime = leave.START_DATE.split(' ')[1]; // 取得時間部分 "HH:MM"
    const endTime = leave.END_DATE.split(' ')[1];
    
    if (startTime) {
        const [startHour, startMinute] = startTime.split(':');
        document.getElementById('editStartHour').value = startHour.padStart(2, '0');
        document.getElementById('editStartMinute').value = startMinute.padStart(2, '0');
        document.getElementById('editEndMinute').value = startMinute.padStart(2, '0'); // 結束分鐘跟隨開始分鐘
    }
    
    if (endTime) {
        const [endHour] = endTime.split(':');
        document.getElementById('editEndHour').value = endHour.padStart(2, '0');
    }

    // 設定日期時間合併功能
    function setupEditDateTime() {
        combineDateTime('editStartDate', 'editStartHour', 'editStartMinute', 'editStartDateHidden');
        combineDateTime('editEndDate', 'editEndHour', 'editEndMinute', 'editEndDateHidden');
        
        // 初始觸發一次
        updateEditDateTime();
    }

    function updateEditDateTime() {
        const startDate = document.getElementById('editStartDate');
        const startHour = document.getElementById('editStartHour');
        const startMinute = document.getElementById('editStartMinute');
        const startHidden = document.getElementById('editStartDateHidden');
        const endDate = document.getElementById('editEndDate');
        const endHour = document.getElementById('editEndHour');
        const endMinute = document.getElementById('editEndMinute');
        const endHidden = document.getElementById('editEndDateHidden');

        // 更新開始時間
        if (startDate.value && startHour.value && startMinute.value) {
            startHidden.value = `${startDate.value} ${startHour.value}:${startMinute.value}`;
        }

        // 更新結束時間（分鐘跟隨開始分鐘）
        if (endDate.value && endHour.value && startMinute.value) {
            endMinute.value = startMinute.value;
            endHidden.value = `${endDate.value} ${endHour.value}:${startMinute.value}`;
        }

        updateLeaveTime();
    }

    const hoursInput = document.querySelector('input[name="hours_edit"]');
    const daysInput = document.querySelector('input[name="days_edit"]');

    function updateLeaveTime() {
        const startVal = document.getElementById('editStartDateHidden').value;
        const endVal = document.getElementById('editEndDateHidden').value;

        if (!startVal || !endVal) {
            hoursInput.value = '';
            daysInput.value = '';
            return;
        }

        if (!checkWorkTime(startVal, endVal)) {
            hoursInput.value = '';
            daysInput.value = '';
            return;
        }

        const result = calcLeaveHoursAndDays(startVal, endVal);
        hoursInput.value = result.hours;
        daysInput.value = result.days;
    }

    // 設定事件監聽器
    setupEditDateTime();
    document.getElementById('editStartDate').addEventListener('change', updateEditDateTime);
    document.getElementById('editStartHour').addEventListener('change', updateEditDateTime);
    document.getElementById('editStartMinute').addEventListener('change', updateEditDateTime);
    document.getElementById('editEndDate').addEventListener('change', updateEditDateTime);
    document.getElementById('editEndHour').addEventListener('change', updateEditDateTime);
}

function submitEditLeave(leaveId) {
    var form = document.getElementById('editLeaveForm');
    var formData = new FormData(form);
    formData.append('leave_id', leaveId);

    fetch('/leave/edit', {
        method: 'POST',
        body: formData
    })
    .then(res => res.json())
    .then(response => {
        if (response.status === 200) {
            alert('修改成功！');
            $('#leaveEditModal').modal('hide');
            // 重新載入請假單列表
            loadAllData();
        } else {
            alert('修改失敗：' + (response.msg || ''));
        }
    })
    .catch(() => {
        alert('伺服器錯誤，請稍後再試');
    });
}

function downloadLeaveDetail() {
    var table = document.querySelector('#leaveDetailBody table');
    var today = new Date();
    var yyyy = today.getFullYear();
    var mm = String(today.getMonth() + 1).padStart(2, '0');
    var dd = String(today.getDate()).padStart(2, '0');
    var dateStr = yyyy + mm + dd;
    var filename = `請假詳情_${dateStr}.html`;

    var htmlContent = `<!DOCTYPE html>
    <html lang="zh-TW">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>請假詳情 - ${dateStr}</title>
        <style>
            /* A4紙張設定 */
            @page {
                size: A4;
                margin: 1cm;
            }
            
            body { 
                font-family: "Microsoft JhengHei", Arial, sans-serif; 
                margin: 0; 
                background-color: white;
                font-size: 16px;
                line-height: 1.4;
            }
            
            .container {
                width: 21cm;
                min-height: 29.7cm;
                margin: 0 auto;
                background: white;
                padding: 1cm;
                box-sizing: border-box;
            }
            
            .header {
                text-align: center;
                margin-bottom: 1cm;
                border-bottom: 2px solid #007bff;
                padding-bottom: 0.5cm;
            }
            
            .header h1 {
                color: #007bff;
                margin: 0;
                font-size: 26px;
                font-weight: bold;
            }
            
            .header p {
                color: #666;
                margin: 0.2cm 0 0 0;
                font-size: 16px;
            }
            
            table { 
                width: 100%; 
                border-collapse: collapse; 
                margin: 0.5cm 0;
                font-size: 15px;
                page-break-inside: avoid;
            }
            
            th, td { 
                border: 1px solid #ddd; 
                padding: 0.3cm; 
                text-align: left; 
                vertical-align: top;
            }
            
            th { 
                background-color: #f8f9fa; 
                font-weight: bold; 
                color: #495057;
                width: 25%;
                font-size: 15px;
            }
            
            td {
                word-wrap: break-word;
                font-size: 14px;
            }
            
            .footer {
                margin-top: 1cm;
                text-align: center;
                color: #666;
                font-size: 13px;
                border-top: 1px solid #eee;
                padding-top: 0.3cm;
            }
            
            /* 列印樣式優化 */
            @media print {
                body { 
                    margin: 0; 
                    background: white; 
                }
                .container { 
                    box-shadow: none; 
                    width: 100%;
                    min-height: auto;
                }
                table {
                    page-break-inside: avoid;
                }
                th, td {
                    padding: 0.2cm;
                    font-size: 12px;
                }
            }
            
            /* 螢幕顯示樣式 */
            @media screen {
                body {
                    background-color: #f8f9fa;
                    margin: 20px;
                }
                .container {
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>請假詳情表</h1>
                <p>生成日期：${yyyy}年${mm}月${dd}日</p>
            </div>
            ${table.outerHTML}
            <div class="footer">
                <p>此文件由系統自動生成</p>
            </div>
        </div>
    </body>
    </html>`;

    // 創建下載連結
    var blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    var url = window.URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

async function leave() {
    var form = document.getElementById('leaveForm');
 
    if (!form.checkValidity()) {
        form.reportValidity(); 
        return;
    }
    
    // 在讀取表單資料前，先手動觸發日期時間合併
    updateAllDateTime();
    
    var formData = new FormData(form);
    let jobRep = formData.get('job_rep');
    if (!jobRep) {
        alert("請選擇職務代理人！");
        return;
    }

    let startDate = formData.get('start_date');
    let endDate = formData.get('end_date');
    
    // 檢查是否有正確的日期時間值
    if (!startDate || !endDate || startDate.includes('NaN') || endDate.includes('NaN')) {
        alert("請確認日期時間選擇完整！");
        return;
    }
    
    if (!checkWorkTime(startDate, endDate)) {
        // alert已經顯示，不送出
        return;
    }
    
    leaveTime = calcLeaveHoursAndDays(startDate, endDate);
    formData.set("start_date", leaveTime.start_date);
    formData.set("end_date", leaveTime.end_date);
    formData.set("hours", leaveTime.hours);
    formData.set("days", leaveTime.days);

    formData.append('getApprovalStages', 'true');
    let res = await fetch(`/leave/leave`, {
        method: "POST",
        body: formData
    });
    let response;
    try {
        response = await res.json();
        // response.approvalStages 就是你要的審核關卡資料
        console.log(response.approvalStages);
    } catch (err) {
        alert("系統服務異常，請嘗試重新登入或稍後再試。");
        throw new Error("伺服器未回傳 JSON\n");
    }

    // 從 response 中取得審核流程資訊
    let approvalStages = null;
    if (response && response.approvalStages) {
        approvalStages = response.approvalStages;
    }
    
    renderCheckForm(formData, approvalStages);
    document.getElementById('submitCheckBtn').onclick = function() {
        formData.delete('getApprovalStages');
        submitCheckLeave(formData);
        $('#leaveCheckModal').modal('hide');

    };

}

function overtime() {
    var form = document.getElementById('overtimeForm');
 
    if (!form.checkValidity()) {
        form.reportValidity(); 
        return;
    }
    var formData = new FormData(form);
    formData.append('job_rep', '');
    console.log(formData.entries());
    for (let pair of formData.entries()) {
        console.log(pair[0] + ':', pair[1]);
    }
    let startDate = formData.get('start_date');
    let endDate = formData.get('end_date');
    if (!checkWorkTime(startDate, endDate)) {
        // alert已經顯示，不送出
        return;
    }
    
    leaveTime = calcLeaveHoursAndDays(startDate, endDate);
    formData.set("start_date", leaveTime.start_date);
    formData.set("end_date", leaveTime.end_date);
    formData.set("hours", leaveTime.hours);
    formData.set("days", leaveTime.days);

    renderOvertimeForm(formData);
    document.getElementById('submitCheckBtn').onclick = function() {
        submitCheckLeave(formData);
        $('#leaveCheckModal').modal('hide');

    };
}

async function submitCheckLeave(formData) {
    console.log(formData.entries());
    for (let pair of formData.entries()) {
        console.log(pair[0] + ':', pair[1]);
    }
    let res = await fetch(`/leave/leave`, {
        method: "POST",
        body: formData
    });
    let response;
    try {
        response = await res.json();
    } catch (err) {
        alert("系統服務異常，請嘗試重新登入或稍後再試。");
        throw new Error("伺服器未回傳 JSON\n");
    }

    switch (response.status) {
        case 302:
            alert("閒置過久，請再試一次");
            break;
        case 401:
            alert(response.msg);
            window.location.href = "/login/login";
            break;
        case 400:
        case 404:
            alert(response.msg);
            break;
        case 200:
            alert("請假存檔成功\n" + (response.msg || ""));
            break;
        default:
            alert("發生未知錯誤，請稍後再試");
    }
    loadAllData()
}

// =================計算請假時間=================
function pad(n) { return n < 10 ? '0'+n : n; }
function formatDateLocal(d) {
    return d.getFullYear() + '-'
        + String(d.getMonth()+1).padStart(2,'0') + '-'
        + String(d.getDate()).padStart(2,'0') + ' '
        + String(d.getHours()).padStart(2,'0') + ':'
        + String(d.getMinutes()).padStart(2,'0');
}
function ceilStartToBusiness(date) {
    let d = new Date(date);
    let h = d.getHours();
    let m = d.getMinutes();
    // 下班後/17:00以後，進位到明天08:00
    if (h >= 17) {
        d.setDate(d.getDate() + 1);
        d.setHours(8, 0, 0, 0);
        return d;
    }
    // 午休時間 → 進到13:00
    if (h === 12 || (h === 13 && m === 0) || (h > 12 && h < 13)) {
        d.setHours(13, 0, 0, 0);
        return d;
    }
    // 進位到下個整
    if (m > 0 && m < 30) d.setHours(h + 1, 0,0,0);
    else if (m > 30) {
        d.setHours(h + 1, 0,0,0);
    }
    else d.setMinutes(0,0,0);
    // 再次確認進位後沒落入午休
    if (d.getHours() === 12 || (d.getHours() === 13 && d.getMinutes() === 0) || (d.getHours() > 12 && d.getHours() < 13)) {
        d.setHours(13, 0, 0, 0);
    }
    return d;
}
function floorEndToBusiness(date) {
    // 結束：退位到最近的 0/30
    let d = new Date(date);
    let m = d.getMinutes();
    if (m > 0 && m <= 30) d.setMinutes(0,0,0);
    else if (m > 30) d.setMinutes(0,0,0);
    // 若是剛好在 0/30分分鐘就不用動
    return d;
}
function calcLeaveHoursAndDays(startStr, endStr) {
    // 工作時間和午休設定
    const workStart = 8;
    const workEnd = 17;
    const lunchStart = 12;
    const lunchEnd = 13;

    // 直接使用原始時間，不做修正
    let start = new Date(startStr);
    let end = new Date(endStr);

    let totalHours = 0;
    let curr = new Date(start);

    while (curr < end) {
        let dayStart = new Date(curr);
        dayStart.setHours(workStart, 0, 0, 0); // 從上班時間開始
        let dayEnd = new Date(curr);
        dayEnd.setHours(workEnd, 0, 0, 0); // 到下班時間結束

        let rangeStart = curr > dayStart ? curr : dayStart;
        let rangeEnd = (end.toDateString() === curr.toDateString()) ? end : dayEnd;
        
        // 確保時間範圍在工作時間內
        if (rangeStart.getHours() >= workEnd || rangeEnd.getHours() < workStart) {
            curr.setDate(curr.getDate() + 1);
            curr.setHours(workStart, 0, 0, 0);
            continue;
        }
        
        // 限制在工作時間範圍內
        if (rangeStart.getHours() < workStart) {
            rangeStart.setHours(workStart, 0, 0, 0);
        }
        if (rangeEnd.getHours() > workEnd || (rangeEnd.getHours() === workEnd && rangeEnd.getMinutes() > 0)) {
            rangeEnd.setHours(workEnd, 0, 0, 0);
        }
        
        if (rangeEnd <= rangeStart) {
            curr.setDate(curr.getDate() + 1);
            curr.setHours(workStart, 0, 0, 0);
            continue;
        }

        let startH = rangeStart.getHours() + rangeStart.getMinutes() / 60;
        let endH = rangeEnd.getHours() + rangeEnd.getMinutes() / 60;

        let hours = endH - startH;
        
        // 扣除午休時間 (12:00-13:00)
        if (startH < lunchEnd && endH > lunchStart) {
            let overlap = Math.min(endH, lunchEnd) - Math.max(startH, lunchStart);
            hours -= Math.max(0, overlap);
        }
        
        if (hours > 0) totalHours += hours;
        
        curr.setDate(curr.getDate() + 1);
        curr.setHours(workStart, 0, 0, 0);
    }

    let roundedHours = Math.round(totalHours * 100) / 100; // 保留兩位小數
    let roundedDays = Math.round(totalHours / 8 * 1000) / 1000;
    
    // 回傳原始時間，不做修正
    return {
        hours: roundedHours,
        days: roundedDays,
        start_date: formatDateLocal(start),
        end_date: formatDateLocal(end)
    };
}
function checkWorkTime(start, end) {
    // 格式假設如 '2025-07-24T08:00'
    const startTime = new Date(start);
    const endTime = new Date(end);

    if (startTime > endTime) {
        alert("開始時間不能晚於結束時間！");
        return false;
    }

    return true;
}
// =================計算請假時間=================

function renderForm(formData, fieldMap, leaveTypeMap, approvalStages = null) {
    let html = `
        <form id="checkLeaveForm">
            <table class="table table-bordered" style="width:100%;font-size:16px;">
                <tbody>
    `;

    for (const key of Object.keys(fieldMap)) {
        let value = formData.get(key);

        if (key === 'leave_type_id') {
            value = leaveTypeMap[value] || value;
        }
        if (key === 'stages' && approvalStages) {
            value = renderEditableStages(approvalStages);
        }
        if (value instanceof File) {
            value = value.name ? value.name : '沒有檔案';
        }
        if (value === null || value === undefined) {
            value = '';
        }

        if (key === 'stages' && approvalStages) {
            html += `
                <tr>
                    <th class="text-nowrap" style="width: 160px;">${fieldMap[key]}</th>
                    <td>${value}</td>
                </tr>
            `;
        } else {
            html += `
                <tr>
                    <th class="text-nowrap" style="width: 160px;">${fieldMap[key]}</th>
                    <td>${value}</td>
                </tr>
            `;
        }
    }
    html += `
                </tbody>
            </table>
        </form>
    `;

    $('#leaveCheckBody').html(html);

    let footerHtml = `
        <button id="submitCheckBtn" class="btn btn-primary">確認送出</button>
        <button class="btn btn-secondary" data-bs-dismiss="modal">關閉</button>
    `;
    $('#leaveCheckFooter').html(footerHtml);
    $('#leaveCheckModal').modal('show');
}

function renderCheckForm(formData, approvalStages = null) {
    const fieldMap = {
        leave_type_id: "假別代碼",
        start_date: "開始時間",
        end_date: "結束時間",
        hours: "請假時數",
        days: "請假天數",
        reason: "請假原因",
        job_rep: "職務代理人",
        stages: "審核關卡",
        attachment: "檔案"
    };
    const leaveTypeMap = {
        "1": "事假",
        "2": "病假",
        "3": "特休",
        "4": "公假",
        "5": "婚假",
        "6": "喪假",
        "7": "產假",
        "8": "陪產假",
        "9": "補休",
        "10": "其他"
    };
    renderForm(formData, fieldMap, leaveTypeMap, approvalStages);
}

function renderOvertimeForm(formData) {
    const fieldMap = {
        leave_type_id: "加班",
        start_date: "開始時間",
        end_date: "結束時間",
        hours: "加班時數",
        days: "加班天數",
        reason: "加班原因",
        attachment: "檔案"
    };
    const leaveTypeMap = {
        "11": "加班",
    };
    renderForm(formData, fieldMap, leaveTypeMap, null);
}

function approveLeave(idx, type) {
    const leave = leaveList[type][idx];
    console.log(leave);
    if (confirm('確定要通過這筆請假申請嗎？')) {
        $.ajax({
            url: '/leave/approve',
            type: 'POST',
            data: JSON.stringify({ leave_id: leave.LEAVE_ID }),
            contentType: 'application/json',
            success: function(response) {
                if (response.status === 200) {
                    alert('審核通過！');
                    loadAllData();
                } else {
                    alert('審核失敗：' + response.msg);
                }
            },
            error: function() {
                alert('伺服器錯誤，審核失敗');
            }
        });
    }
}

function openRejectModal(idx, type, status) {
  const leave = leaveList[type][idx];

  if (status === '暫存' || status === '職代駁回' || status === '駁回') {
    if (confirm('確定要刪除此筆暫存假單嗎？（刪除後無法恢復）')) {
      $.ajax({
        url: '/leave/delete',
        type: 'POST',
        data: JSON.stringify({ leave_id: leave.LEAVE_ID }),
        contentType: 'application/json',
        success: function(response) {
          if (response.status === 200) {
            alert('已成功刪除暫存假單！');
            loadAllData();
          } else {
            alert('刪除失敗：' + response.msg);
          }
        },
        error: function() {
          alert('伺服器錯誤，刪除失敗');
        }
      });
    }
    return; // 不開啟駁回modal
  }

  if (status === '審核中') {
    document.getElementById('rejectLeaveId').value = leave.LEAVE_ID;
    document.getElementById('rejectReason').value = '';
    var rejectModal = new bootstrap.Modal(document.getElementById('rejectModal'));
    rejectModal.show();
  }
}

$('#rejectForm').on('submit', function(e) {
    e.preventDefault();

    var leave_id = $('#rejectLeaveId').val();
    var reason = $('#rejectReason').val().trim();

    $.ajax({
        url: '/leave/reject',
        type: 'POST',
        data: JSON.stringify({ leave_id: leave_id, reason: reason }),
        contentType: 'application/json',
        success: function(response) {
            if (response.status === 200) {
                alert('已成功駁回！');
                $('#rejectModal').modal('hide');
                loadAllData();
            } else {
                alert('駁回失敗：' + response.msg);
            }
        },
        error: function() {
            alert('伺服器錯誤，駁回失敗');
        }
    });
});

// 職代表格的審核清單
function renderJobRepLeaveTable(current_user, leaves) {
    console.log(leaves);
    leaveList.job_rep = leaves;
    let html = '';
    if (leaves.length === 0) {
        html = '<tr><td colspan="10" class="text-center">目前無待審核的職務代理人請假單</td></tr>';
    } else {
        leaves.forEach(function(leave, idx) {
        html += `<tr>
            <td>${leave.NAME}</td>
            <td>${leave.USER}</td>
            <td>${leave.LEAVE_TYPE_ID}</td>
            <td>${leave.START_DATE.replace('T', ' ')}</td>
            <td>${leave.END_DATE.replace('T', ' ')}</td>
            <td>${leave.HOURS-Math.floor(leave.DAYS)*8}</td>
            <td>${Math.floor(leave.DAYS)}</td>
            <td>${leave.STATUS}</td>
            <td>${leave.DATE.replace('T', ' ')}</td>
            <td>`;
            if (leave.JOB_REP === current_user && leave.USER !== current_user && leave.STATUS === "待職代審核") {
                html += `
                    <button class="btn btn-success btn-sm" onclick="handleJobRepLeave('${leave.JOB_REP}', '${leave.LEAVE_ID}', 'approve')">同意</button>
                    <button class="btn btn-danger btn-sm" onclick="handleJobRepLeave('${leave.JOB_REP}', '${leave.LEAVE_ID}', 'reject')">駁回</button>
                    <button class="btn btn-info btn-sm" onclick="renderLeaveDetail('${idx}', 'job_rep')">查閱</button>
                `;
            } else {
                html += `
                <button class="btn btn-info btn-sm" onclick="renderLeaveDetail('${idx}', 'job_rep')">查閱</button>
                `;
            }
        html += `</td>
        </tr>`;
    });
    }
    document.getElementById('jobRepLeaveTableBody').innerHTML = html;
}

function handleJobRepLeave(job_rep_user, leaveId, action) {
    // action: 'approve' 或 'reject'
    let confirmMsg = action === 'approve' ? '確定要同意這筆請假申請嗎？' : '確定要駁回這筆請假申請嗎？';
    if (confirm(confirmMsg)) {
        fetch('/leave/job_rep_action', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ job_rep_user: job_rep_user, leave_id: leaveId, action: action })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 200) {
                alert(data.msg || '操作成功');
                loadAllData();
            } else {
                alert('操作失敗：' + (data.msg || ''));
            }
        })
        .catch(() => {
            alert('伺服器錯誤，請稍後再試');
        });
    }
}

// 日期時間合併函數
function combineDateTime(dateId, hourId, minuteId, hiddenId) {
    const dateInput = document.getElementById(dateId);
    const hourSelect = document.getElementById(hourId);
    const minuteSelect = document.getElementById(minuteId);
    const hiddenInput = document.getElementById(hiddenId);
    
    function updateDateTime() {
        let minuteValue;
        
        // 如果是結束時間的分鐘欄位且為只讀，使用開始時間的分鐘
        if (minuteSelect.readOnly) {
            // 根據不同表單使用對應的開始分鐘ID
            let startMinuteId = 'startMinute';
            if (minuteId === 'editEndMinute') {
                startMinuteId = 'editStartMinute';
            } else if (minuteId === 'overtimeEndMinute') {
                startMinuteId = 'overtimeStartMinute';
            }
            
            const startMinute = document.getElementById(startMinuteId);
            minuteValue = startMinute ? startMinute.value : '';
            minuteSelect.value = minuteValue; // 顯示在只讀欄位中
        } else {
            minuteValue = minuteSelect.value;
        }
        
        if (dateInput.value && hourSelect.value && minuteValue) {
            const datetime = `${dateInput.value} ${hourSelect.value}:${minuteValue}`;
            hiddenInput.value = datetime;
        }
    }
    
    dateInput.addEventListener('change', updateDateTime);
    hourSelect.addEventListener('change', updateDateTime);
    if (!minuteSelect.readOnly) {
        minuteSelect.addEventListener('change', updateDateTime);
    }
    
    // 如果是結束分鐘欄位，監聽開始分鐘的變化
    if (minuteSelect.readOnly && (minuteId === 'endMinute' || minuteId === 'editEndMinute' || minuteId === 'overtimeEndMinute')) {
        // 根據不同表單使用對應的開始分鐘ID
        let startMinuteId = 'startMinute';
        if (minuteId === 'editEndMinute') {
            startMinuteId = 'editStartMinute';
        } else if (minuteId === 'overtimeEndMinute') {
            startMinuteId = 'overtimeStartMinute';
        }
        
        const startMinute = document.getElementById(startMinuteId);
        if (startMinute) {
            startMinute.addEventListener('change', updateDateTime);
        }
    }
}

// 手動觸發所有日期時間合併
function updateAllDateTime() {
    // 觸發開始時間合併
    const startDate = document.getElementById('startDate');
    const startHour = document.getElementById('startHour');
    const startMinute = document.getElementById('startMinute');
    const startHidden = document.getElementById('startDateHidden');
    
    if (startDate && startHour && startMinute && startHidden) {
        if (startDate.value && startHour.value && startMinute.value) {
            const startDateTime = `${startDate.value} ${startHour.value}:${startMinute.value}`;
            startHidden.value = startDateTime;
        }
    }
    
    // 觸發結束時間合併
    const endDate = document.getElementById('endDate');
    const endHour = document.getElementById('endHour');
    const endMinute = document.getElementById('endMinute');
    const endHidden = document.getElementById('endDateHidden');
    
    if (endDate && endHour && endMinute && endHidden && startMinute) {
        // 結束分鐘使用開始分鐘的值
        const minuteValue = startMinute.value;
        endMinute.value = minuteValue; // 更新顯示
        
        if (endDate.value && endHour.value && minuteValue) {
            const endDateTime = `${endDate.value} ${endHour.value}:${minuteValue}`;
            endHidden.value = endDateTime;
        }
    }
}

// 初始化日期時間合併功能
$(document).ready(function() {
    // 請假表單
    combineDateTime('startDate', 'startHour', 'startMinute', 'startDateHidden');
    combineDateTime('endDate', 'endHour', 'endMinute', 'endDateHidden');
    
    // 加班表單專用處理
    setupOvertimeForm();
});

// 設置加班表單
function setupOvertimeForm() {
    // 動態生成小時選項 (0-23)
    const overtimeStartHourSelect = document.getElementById('overtimeStartHour');
    const overtimeEndHourSelect = document.getElementById('overtimeEndHour');
    if (overtimeStartHourSelect && overtimeEndHourSelect) {
        for (let i = 0; i < 24; i++) {
            const hour = i.toString().padStart(2, '0');
            overtimeStartHourSelect.innerHTML += `<option value="${hour}">${hour}</option>`;
            overtimeEndHourSelect.innerHTML += `<option value="${hour}">${hour}</option>`;
        }
    }

    // 動態生成分鐘選項 (0, 15, 30, 45)
    const overtimeStartMinuteSelect = document.getElementById('overtimeStartMinute');
    if (overtimeStartMinuteSelect) {
        for (let i = 0; i < 60; i += 15) {
            const minute = i.toString().padStart(2, '0');
            overtimeStartMinuteSelect.innerHTML += `<option value="${minute}">${minute}</option>`;
        }
    }
    
    // 設置加班表單的日期時間合併功能
    combineDateTime('overtimeStartDate', 'overtimeStartHour', 'overtimeStartMinute', 'overtimeStartDateHidden');
    combineDateTime('overtimeEndDate', 'overtimeEndHour', 'overtimeEndMinute', 'overtimeEndDateHidden');
}
