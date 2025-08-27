var data_now = { len: 0 };
var col_arr = ["DATE", "SIGN_IN", "SIGN_OUT", "STATE", "DURATION", "LOG"];
var col_disp = ["日期", "簽到時間", "簽退時間", "狀態", "工作時長", "備註"];
var col_num = col_arr.length;
var index_arr = [];

var userPrivilege = null;

// 檢查用戶權限
async function checkUserPrivilege() {
    try {
        const response = await postfunct(
            "/sign/get_privilege",
            JSON.stringify({ user: "user" })
        );
        
        // 檢查是否為重定向（未登入）
        if (response && response.status === 302) {
            console.warn("用戶未登入，無法取得權限資訊");
            return;
        }
        
        if (response && response.status === 200 && response.data) {
            userPrivilege = response.data;
            console.log("User privilege:", userPrivilege);
            
            // 如果用戶有 searchall 權限，顯示用戶選擇下拉式選單
            if (userPrivilege && userPrivilege.ALLOW_FUNCTION && userPrivilege.ALLOW_FUNCTION.includes("searchall")) {
                const userSelectContainer = document.getElementById("userSelectContainer");
                if (userSelectContainer) {
                    userSelectContainer.style.display = "block";
                    loadUserList();
                }
            }
        } else {
            console.warn("無法取得用戶權限資訊");
        }
    } catch (error) {
        console.error("檢查用戶權限錯誤:", error);
        // 如果是 JSON 解析錯誤，可能是用戶未登入
        if (error.name === 'SyntaxError') {
            console.warn("可能因為用戶未登入導致的 JSON 解析錯誤");
        }
    }
}

// 載入用戶列表
async function loadUserList() {
    try {
        const response = await postfunct(
            "/sign/get_user_list",
            JSON.stringify({})
        );
        
        // 檢查是否為重定向（未登入）
        if (response && response.status === 302) {
            console.warn("用戶未登入，無法載入用戶列表");
            return;
        }
        
        if (response && response.status === 200 && response.data) {
            const userSelect = document.getElementById("targetUserSelect");
            if (userSelect) {
                userSelect.innerHTML = '<option value="">請選擇查詢對象</option>';
                
                // 處理用戶列表資料
                let userData = response.data;
                
                // 如果 data 是字串，需要先解析成 JSON
                if (typeof userData === 'string') {
                    try {
                        userData = JSON.parse(userData);
                    } catch (e) {
                        console.error("解析用戶資料失敗:", e);
                        return;
                    }
                }
                
                if (userData && typeof userData === 'object') {
                    // 檢查是否為數組格式（直接的用戶列表）
                    if (Array.isArray(userData)) {
                        userData.forEach(user => {
                            if (user && user.length >= 2) {
                                const userId = user[0];   // UNIQUE_ID
                                const userName = user[1]; // NAME
                                
                                const option = document.createElement("option");
                                option.value = userId;
                                option.textContent = `${userId} - ${userName || userId}`;
                                userSelect.appendChild(option);
                            }
                        });
                    } 
                    // 檢查是否為物件格式（包含 column_id 的格式）
                    else if (userData.column_id && userData.len) {
                        // 遍歷所有 d0, d1, d2... 格式的資料
                        for (let index = 0; index < userData.len; index++) {
                            const userRecord = userData[`d${index}`];
                            if (userRecord && Array.isArray(userRecord) && userRecord.length >= 3) {
                                const userId = userRecord[2];   // UNIQUE_ID 欄位
                                const userName = userRecord[1]; // NAME 欄位
                                
                                if (userId) {
                                    const option = document.createElement("option");
                                    option.value = userId;
                                    option.textContent = `${userId} - ${userName || userId}`;
                                    userSelect.appendChild(option);
                                }
                            }
                        }
                    }
                }
            }
        } else if (response && response.status === 403) {
            console.warn("沒有權限載入用戶列表");
        } else {
            console.warn("無法載入用戶列表");
        }
    } catch (error) {
        console.error("載入用戶列表錯誤:", error);
        // 如果是 JSON 解析錯誤，可能是用戶未登入
        if (error.name === 'SyntaxError') {
            console.warn("可能因為用戶未登入導致的 JSON 解析錯誤");
        }
    }
}

check_login();
// 初始化時檢查權限
checkUserPrivilege();

// 設定預設日期範圍（當日前一個月到當日）
function setDefaultDateRange() {
    const today = new Date();
    const oneMonthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
    
    const startDateInput = document.getElementById("startDate");
    const endDateInput = document.getElementById("endDate");
    
    if (startDateInput) {
        startDateInput.value = formatDateForInput(oneMonthAgo);
    }
    if (endDateInput) {
        endDateInput.value = formatDateForInput(today);
    }
}

// 頁面載入完成後設定預設日期
document.addEventListener('DOMContentLoaded', function() {
    setDefaultDateRange();
});

// 如果 DOM 已經載入完成，直接執行
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setDefaultDateRange);
} else {
    setDefaultDateRange();
}

async function sign_in(boolean_io) {
    check_login();
    if (data_now.len != 0) {
        var lastRecord = data_now["d" + (data_now.len - 1)];
        var lastDate = lastRecord[index_arr[0]]; // 日期欄位
        var lastState = lastRecord[index_arr[3]]; // 狀態欄位
        
        // 取得今日日期 (YYYYMMDD格式)
        var today = new Date();
        var todayStr = today.getFullYear().toString() + 
                      (today.getMonth() + 1).toString().padStart(2, '0') + 
                      today.getDate().toString().padStart(2, '0');
        
        // 檢查最後一筆紀錄是否為今日且狀態為signin
        if (lastDate == todayStr && lastState == "signin") {
            if (!confirm("今日已有簽到紀錄且未簽退，是否要繼續執行簽到？")) {
                return;
            }
        }
        // 保留原有的檢查邏輯
        else if (lastState == "signin") {
            if (!confirm("有未簽退紀錄，是否要覆蓋?")) {
                return;
            }
        }
    }

    var response = await postfunct(
        "/sign/sign_in",
        JSON.stringify({ option: 1, user: "user" }),
    );
    if (response.status == 302) {
        alert("閒置過久，請再試一次");
    }
    if (response.status == 200) {
        alert("簽到成功\n" + response.msg);
    }
    getrecord();
    return response;
}
async function sign_out() {
    check_login();
    var dl = data_now["d" + (data_now.len - 1)];
    if (dl[index_arr[4]] == "signin") {
        if (!confirm("今日上班簽到時間:" + dl[index_arr[1]] + "，是否簽退?")) {
            return;
        }
    }
    var response = await postfunct(
        "/sign/sign_in",
        JSON.stringify({ option: 0, user: "user" }),
    );
    if (response.status == 302) {
        alert("閒置過久，請再試一次");
        return;
    }
    if (response.status == 200) {
        alert("簽退成功\n" + response.msg);
    } else {
        alert("無待簽退紀錄，若您仍需要簽退請提交紙本申請\n" + response.msg);
        return;
    }
    getrecord();
    return response;
}

async function getrecord(month = "") {
    try {
        response = await postfunct(
            "/sign/get_record",
            JSON.stringify({ month: month, user: "khh00001" }),
        );
        
        // 檢查是否為重定向（未登入）
        if (response && response.status === 302) {
            console.warn("用戶未登入，無法取得記錄");
            return;
        }
        
        console.log(response);
        if (response && response.status === 200 && response.data) {
            data_now = response.data;
            if (index_arr.length == 0) {
                for (var i = 0; i < col_num; i++) {
                    index_arr.push(data_now.column_id.indexOf(col_arr[i]));
                }
            }
            if (data_now.len != 0) {
                refresh_table(data_now);
            }
        } else {
            console.warn("無法取得記錄資料");
        }
    } catch (error) {
        console.error("取得記錄錯誤:", error);
        // 如果是 JSON 解析錯誤，可能是用戶未登入
        if (error.name === 'SyntaxError') {
            console.warn("可能因為用戶未登入導致的 JSON 解析錯誤");
        }
    }

    return;
}
function refresh_table(res) {
    var table = document.getElementById("dataTable-sign");
    var th = table.children[0];
    var tb = table.children[1];
    var thHTML = "<tr>";
    //thHTML+='<th style="width:2em;font-size:small;" font>選項</th>';
    for (i = 0; i < col_disp.length; i++) {
        thHTML += '<th class="text-center">' + col_disp[i] + "</th>";
    }
    thHTML += "</tr>";
    th.innerHTML = thHTML;

    var tbHTML = "";
    for (i = res.len - 1; i >= 0; i--) {
        var k = "d" + i;
        tbHTML += '<tr id="tr-{id}" style="cursor: pointer;" onclick="showMonthlyRecordDetail(\'' + k + '\')">';
        //tbHTML+='<td>'+res[k]+'</td>';
        console.log("k=" + k);
        for (j = 0; j < index_arr.length; j++) {
            var cellValue = res[k][index_arr[j]];
            var cellClass = "text-center";
            
            // 如果是狀態欄位，套用Badge樣式
            if (j === 3) { // 狀態欄位
                var stateDisplay = getStateDisplay(cellValue);
                var badgeClass = getStateBadgeClass(cellValue);
                tbHTML += '<td class="' + cellClass + '"><span class="badge ' + badgeClass + '">' + stateDisplay + '</span></td>';
            } else if (j === 4) { // 工作時長欄位
                var formattedDuration = formatDuration(cellValue);
                tbHTML += '<td class="' + cellClass + '">' + formattedDuration + '</td>';
            } else if (j === 5) { // 備註欄位
                tbHTML += '<td class="text-start" title="' + cellValue + '">' + truncateText(cellValue, 35) + '</td>';
            } else if (j === 0) { // 日期欄位
                var formattedDate = formatDate(cellValue);
                tbHTML += '<td class="' + cellClass + '">' + formattedDate + '</td>';
            } else if (j === 1 || j === 2) { // 簽到/簽退時間欄位
                var formattedTime = formatDateTime(cellValue);
                tbHTML += '<td class="' + cellClass + '">' + formattedTime + '</td>';
            } else {
                tbHTML += '<td class="' + cellClass + '">' + cellValue + '</td>';
            }
        }
        tbHTML = tbHTML + "</tr>";
    }
    //console.log(tbHTML);
    tb.innerHTML = tbHTML;
    table.children[2].innerHTML = th.innerHTML;
}
getrecord();

// 搜尋歷史紀錄
async function searchHistoryRecord() {
    const startDate = document.getElementById("startDate").value;
    const endDate = document.getElementById("endDate").value;
    
    // 檢查是否有 searchall 權限並獲取目標用戶
    let targetUser = null;
    if (userPrivilege && userPrivilege.ALLOW_FUNCTION && userPrivilege.ALLOW_FUNCTION.includes("searchall")) {
        const targetUserSelect = document.getElementById("targetUserSelect");
        if (targetUserSelect && targetUserSelect.value) {
            targetUser = targetUserSelect.value;
        }
    }

    if (!startDate && !endDate) {
        showAlert("請至少選擇一個日期", "warning");
        return;
    }

    // 驗證日期範圍
    if (startDate && endDate && startDate > endDate) {
        showAlert("起始日期不能大於結束日期", "warning");
        return;
    }

    // 顯示載入狀態
    showLoading("正在查詢歷史紀錄...");

    try {
        const requestData = {
            start_date: startDate,
            end_date: endDate,
        };
        
        // 如果有指定目標用戶，加入請求中
        if (targetUser) {
            requestData.target_user = targetUser;
        }
        
        const response = await postfunct(
            "/sign/get_history_record",
            JSON.stringify(requestData),
        );

        hideLoading();

        if (response.status === 200) {
            displayHistoryRecord(response.data, startDate, endDate);
        } else {
            showAlert("查詢失敗：" + response.content, "error");
        }
    } catch (error) {
        hideLoading();
        console.error("查詢歷史紀錄錯誤:", error);
        showAlert("查詢歷史紀錄時發生錯誤", "error");
    }
}

// 顯示歷史紀錄
function displayHistoryRecord(data, startDate, endDate) {
    const tableBody = document.getElementById("historyTableBody");
    const tableDiv = document.getElementById("historyRecordTable");
    const noDataDiv = document.getElementById("historyNoData");
    const infoElement = document.getElementById("historyRecordInfo");

    // 清空現有內容
    tableBody.innerHTML = "";

    if (data.len === 0) {
        tableDiv.style.display = "none";
        noDataDiv.style.display = "block";
        noDataDiv.innerHTML = `
            <i class="fas fa-inbox fa-3x mb-3 text-muted"></i>
            <p class="text-muted">查詢範圍內無簽到紀錄</p>
            <small class="text-muted">日期範圍: ${startDate || "不限"} ~ ${endDate || "不限"}</small>
        `;
        return;
    }

    // 隱藏無資料提示，顯示表格
    noDataDiv.style.display = "none";
    tableDiv.style.display = "block";

    // 按日期排序（最新的在前）
    const records = [];
    for (let i = 0; i < data.len; i++) {
        records.push(data[`d${i}`]);
    }
    records.sort((a, b) => b[2].localeCompare(a[2]));

    // 填入資料
    records.forEach((record) => {
        const row = tableBody.insertRow();

        // 格式化資料
        //const indexNumber = record[0]; //removed
        const userName = record[1]; // 使用者名稱（已從 UNIQUE_ID 轉換為 NAME）
        const date = formatDate(record[2]);
        const signIn = formatDateTime(record[3]);
        const signOut = record[4]
            ? formatDateTime(record[4])
            : '<span class="text-muted">-</span>';
        const duration = record[5]
            ? formatDuration(record[5])
            : '<span class="text-muted">-</span>';
        const state = getStateDisplay(record[7]);
        const log = record[6] || "-";

        row.innerHTML = `
            <td class="text-center">${userName}</td>
            <td class="text-center">${date}</td>
            <td class="text-center">${signIn}</td>
            <td class="text-center">${signOut}</td>
            <td class="text-center"><span class="badge ${getStateBadgeClass(record[7])}">${state}</span></td>
            <td class="text-center">${duration}</td>
            <td class="text-start" title="${log}">${truncateText(log, 35)}</td>
        `;

        // 添加行點擊事件查看詳細資料
        row.style.cursor = "pointer";
        row.onclick = () => showRecordDetail(record);
    });

    // 更新資訊
    const dateRangeText =
        startDate && endDate
            ? `${startDate} ~ ${endDate}`
            : startDate
              ? `${startDate} 之後`
              : `${endDate} 之前`;

    infoElement.innerHTML = `
        <i class="fas fa-info-circle"></i> 
        顯示 ${data.len} 筆歷史紀錄 
        <small class="text-muted">(${dateRangeText})</small>
    `;
}

// 清除歷史搜尋
function clearHistorySearch() {
    document.getElementById("startDate").value = "";
    document.getElementById("endDate").value = "";
    document.getElementById("historyRecordTable").style.display = "none";
    document.getElementById("historyNoData").style.display = "block";
    document.getElementById("historyNoData").innerHTML = `
        <i class="fas fa-search fa-3x mb-3"></i>
        <p>請選擇日期範圍進行查詢</p>
    `;
    document.getElementById("historyTableBody").innerHTML = "";
    document.getElementById("historyRecordInfo").innerHTML =
        '<i class="fas fa-info-circle"></i> 顯示 0 筆歷史紀錄';
}

// 設定上個月日期範圍
function setLastMonth() {
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth(), 0);

    document.getElementById("startDate").value = formatDateForInput(lastMonth);
    document.getElementById("endDate").value = formatDateForInput(lastDay);
}

// 設定近三個月日期範圍
function setLastThreeMonths() {
    const today = new Date();
    const threeMonthsAgo = new Date(
        today.getFullYear(),
        today.getMonth() - 3,
        today.getDate(),
    );

    document.getElementById("startDate").value =
        formatDateForInput(threeMonthsAgo);
    document.getElementById("endDate").value = formatDateForInput(today);
}

// 匯出歷史紀錄
function exportHistoryRecord() {
    const tableBody = document.getElementById("historyTableBody");
    if (!tableBody.children.length) {
        showAlert("無資料可匯出", "warning");
        return;
    }

    try {
        // CSV表頭
        const headers = ["使用者", "日期", "簽到時間", "簽退時間", "狀態", "工作時長", "備註"];
        let csvContent = headers.join(",") + "\n";

        // 收集表格資料
        const rows = tableBody.children;
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const cells = row.children;
            const rowData = [];
            
            for (let j = 0; j < cells.length; j++) {
                let cellText = cells[j].textContent.trim();
                
                // 清理狀態欄位的Badge文字
                if (j === 3) { // 狀態欄位
                    const badge = cells[j].querySelector('.badge');
                    if (badge) {
                        cellText = badge.textContent.trim();
                    }
                }
                
                // 處理包含逗號的文字，用雙引號包圍
                if (cellText.includes(",") || cellText.includes('"') || cellText.includes("\n")) {
                    cellText = '"' + cellText.replace(/"/g, '""') + '"';
                }
                
                rowData.push(cellText);
            }
            
            csvContent += rowData.join(",") + "\n";
        }

        // 產生檔案名稱
        const now = new Date();
        const timestamp = now.getFullYear() + 
                         String(now.getMonth() + 1).padStart(2, '0') + 
                         String(now.getDate()).padStart(2, '0') + '_' +
                         String(now.getHours()).padStart(2, '0') + 
                         String(now.getMinutes()).padStart(2, '0') + 
                         String(now.getSeconds()).padStart(2, '0');
        
        const filename = `簽到紀錄_${timestamp}.txt`;

        // 建立並下載檔案
        const blob = new Blob([csvContent], { type: 'text/plain;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        
        // 模擬點擊下載
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // 清理URL物件
        window.URL.revokeObjectURL(url);
        
        showAlert(`已匯出 ${rows.length} 筆紀錄到 ${filename}`, "success");
        
    } catch (error) {
        console.error("匯出資料時發生錯誤:", error);
        showAlert("匯出資料時發生錯誤", "error");
    }
}

// 顯示本月紀錄詳細資料
function showMonthlyRecordDetail(recordKey) {
    var record = data_now[recordKey];
    if (!record) {
        alert("無法取得紀錄詳細資料");
        return;
    }
    
    const modalContent = `
        <div class="row">
            <div class="col-md-6">
                <p><strong>使用者：</strong>${record[index_arr[1]]}</p>
                <p><strong>日期：</strong>${formatDate(record[index_arr[0]])}</p>
                <p><strong>簽到時間：</strong>${formatDateTime(record[index_arr[1]])}</p>
            </div>
            <div class="col-md-6">
                <p><strong>簽退時間：</strong>${record[index_arr[2]] ? formatDateTime(record[index_arr[2]]) : "未簽退"}</p>
                <p><strong>工作時長：</strong>${record[index_arr[4]] ? formatDuration(record[index_arr[4]]) : "-"}</p>
                <p><strong>狀態：</strong><span class="badge ${getStateBadgeClass(record[index_arr[3]])}">${getStateDisplay(record[index_arr[3]])}</span></p>
            </div>
            <div class="col-12 mt-3">
                <p><strong>備註：</strong></p>
                <div class="bg-light p-2 rounded">${record[index_arr[5]] || "無備註"}</div>
            </div>
        </div>
    `;

    showModal("簽到紀錄詳細資料", modalContent);
}

// 顯示紀錄詳細資料
function showRecordDetail(record) {
    const modalContent = `
        <div class="row">
            
            <div class="col-md-6">
                
                <p><strong>使用者：</strong>${record[1]}</p>
                <p><strong>日期：</strong>${formatDate(record[2])}</p>
                <p><strong>簽到時間：</strong>${formatDateTime(record[3])}</p>
            </div>
            <div class="col-md-6">
                <p><strong>簽退時間：</strong>${record[4] ? formatDateTime(record[4]) : "未簽退"}</p>
                <p><strong>工作時長：</strong>${record[5] ? formatDuration(record[5]) : "-"}</p>
                <p><strong>狀態：</strong><span class="badge ${getStateBadgeClass(record[7])}">${getStateDisplay(record[7])}</span></p>
            </div>
            <div class="col-12 mt-3">
                <p><strong>備註：</strong></p>
                <div class="bg-light p-2 rounded">${record[6] || "無備註"}</div>
            </div>
        </div>
    `;

    showModal("簽到紀錄詳細資料", modalContent);
}

// 格式化工作時長
function formatDuration(duration) {
    if (!duration || duration === "-") return "-";

    // 解析時長格式 (例如: "8:30:15" 或 "8:30:15.123456")
    const parts = duration.split(":");
    if (parts.length >= 3) {
        const hours = parseInt(parts[0]);
        const minutes = parseInt(parts[1]);
        const seconds = parseInt(parts[2].split(".")[0]);

        if (hours > 0) {
            return `${hours}小時${minutes}分鐘`;
        } else if (minutes > 0) {
            return `${minutes}分鐘${seconds}秒`;
        } else {
            return `${seconds}秒`;
        }
    }

    return duration;
}

// 格式化日期給input使用
function formatDateForInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

// 顯示載入狀態
function showLoading(message = "載入中...") {
    // 可以在這裡實作載入動畫
    console.log(message);
}

// 隱藏載入狀態
function hideLoading() {
    // 隱藏載入動畫
    console.log("載入完成");
}

// 顯示提示訊息
function showAlert(message, type = "info") {
    // 使用較友善的提示方式
    const alertClass = {
        "success": "alert-success",
        "error": "alert-danger", 
        "warning": "alert-warning",
        "info": "alert-info"
    }[type] || "alert-info";
    
    // 建立提示元素
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert ${alertClass} alert-dismissible fade show position-fixed`;
    alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    // 自動移除提示
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.parentNode.removeChild(alertDiv);
        }
    }, 3000);
    
    // Fallback 使用 alert
    if (type === "error") {
        console.error(message);
    }
}

// 顯示模態視窗
function showModal(title, content) {
    // 可以使用 Bootstrap 的 modal 組件
    alert(`${title}\n\n${content.replace(/<[^>]*>/g, "")}`);
}

// 格式化日期時間 (YYYYMMDD-HH:MM:SS -> HH:MM)
function formatDateTime(dateTimeStr) {
    if (!dateTimeStr || dateTimeStr === "-" || dateTimeStr === "None")
        return "-";

    // 處理 YYYYMMDD-HH:MM:SS 格式
    if (dateTimeStr.includes("-") && dateTimeStr.length > 10) {
        const timePart = dateTimeStr.split("-")[1];
        if (timePart && timePart.includes(":")) {
            // 只返回 HH:MM
            return timePart.substring(0, 5);
        }
    }

    // 如果包含空格，取時間部分
    if (dateTimeStr.includes(" ")) {
        const timePart = dateTimeStr.split(" ")[1];
        if (timePart) {
            // 只返回 HH:MM
            return timePart.substring(0, 5);
        }
    }

    // 如果是時間格式 HH:MM:SS，只返回 HH:MM
    if (dateTimeStr.includes(":")) {
        return dateTimeStr.substring(0, 5);
    }

    return dateTimeStr;
}

// 格式化日期 (YYYYMMDD -> YYYY-MM-DD)
function formatDate(dateStr) {
    if (!dateStr || dateStr === "-") return "-";

    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);

    return `${year}-${month}-${day}`;
}
// 取得狀態顯示文字
function getStateDisplay(state) {
    switch (state) {
        case "normal":
            return "正常";
        case "late":
            return "遲到";
        case "early":
            return "早退";
        case "completed":
            return "完成";
        case "abnormal":
            return "異常";
        default:
            return "未知";
    }
}

// 取得狀態Badge樣式
function getStateBadgeClass(state) {
    switch (state) {
        case "normal":
            return "bg-success text-white";
        case "late":
            return "bg-warning text-dark";
        case "early":
            return "bg-danger text-white";
        case "completed":
            return "bg-primary text-white";
        case "abnormal":
            return "bg-danger text-white";
        default:
            return "bg-secondary text-white";
    }
}
//截斷文字
function truncateText(text, maxLength) {
    if (text.length > maxLength) {
        return text.substring(0, maxLength) + "...";
    }
    return text;
}

// 補簽到相關變數
var makeupCurrentRecord = null;

// 切換補簽到區塊顯示/隱藏
function toggleMakeupSection() {
    const makeupSection = document.getElementById("makeupSection");
    if (makeupSection.style.display === "none") {
        makeupSection.style.display = "block";
        loadMakeupRecords();
    } else {
        makeupSection.style.display = "none";
    }
}

// 載入補簽到記錄 (顯示異常狀態的記錄)
async function loadMakeupRecords() {
    try {
        const response = await postfunct(
            "/sign/get_record",
            JSON.stringify({ user: "user" })
        );
        
        if (response.status === 200) {
            displayMakeupRecords(response.data);
        } else {
            console.error("載入補簽記錄失敗:", response);
        }
    } catch (error) {
        console.error("載入補簽記錄錯誤:", error);
    }
}

// 顯示補簽記錄表格
function displayMakeupRecords(data) {
    const table = document.getElementById("dataTable-makeup-table");
    const tbody = table.children[1];
    
    if (!data || data.len === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">暫無異常紀錄</td></tr>';
        return;
    }
    
    let tbHTML = "";
    let abnormalCount = 0;
    
    // 篩選異常狀態的記錄
    for (let i = data.len - 1; i >= 0; i--) {
        const k = "d" + i;
        const record = data[k];
        const state = record[index_arr[3]]; // 狀態欄位
        
        // 只顯示異常狀態的記錄
        if (state === "abnormal") {
            abnormalCount++;
            tbHTML += '<tr>';
            
            // 日期
            tbHTML += '<td class="text-center">' + formatDate(record[index_arr[0]]) + '</td>';
            // 簽到時間
            tbHTML += '<td class="text-center">' + formatDateTime(record[index_arr[1]]) + '</td>';
            // 簽退時間
            tbHTML += '<td class="text-center">' + (record[index_arr[2]] ? formatDateTime(record[index_arr[2]]) : "未簽退") + '</td>';
            // 狀態
            tbHTML += '<td class="text-center"><span class="badge ' + getStateBadgeClass(state) + '">' + getStateDisplay(state) + '</span></td>';
            // 工作時長
            tbHTML += '<td class="text-center">' + (record[index_arr[4]] ? formatDuration(record[index_arr[4]]) : "-") + '</td>';
            // 備註
            tbHTML += '<td class="text-start" title="' + record[index_arr[5]] + '">' + truncateText(record[index_arr[5]], 25) + '</td>';
            // 操作按鈕
            tbHTML += '<td class="text-center"><button class="btn btn-sm btn-success" onclick="openMakeupModal(\'' + k + '\')">補簽</button></td>';
            
            tbHTML += '</tr>';
        }
    }
    
    if (abnormalCount === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">暫無異常紀錄</td></tr>';
    } else {
        tbody.innerHTML = tbHTML;
    }
    
    // 更新資訊
    const infoElement = document.getElementById("dataTable_info-makeup");
    infoElement.innerHTML = `顯示 ${abnormalCount} 筆異常紀錄`;
}

// 開啟補簽模態視窗
function openMakeupModal(recordKey) {
    const record = data_now[recordKey];
    if (!record) {
        alert("無法取得紀錄資料");
        return;
    }
    
    makeupCurrentRecord = record;
    
    // 設定簽到時間顯示
    document.getElementById("makeupSignInTime").textContent = formatDateTime(record[index_arr[1]]);
    
    // 設定預設簽退時間為簽到時間
    const signInDateTime = record[index_arr[1]]; // 格式: YYYYMMDD-HH:MM:SS
    const signInDate = signInDateTime.split('-')[0]; // YYYYMMDD
    const signInTime = signInDateTime.split('-')[1]; // HH:MM:SS
    
    // 轉換為 datetime-local 格式
    const year = signInDate.substring(0, 4);
    const month = signInDate.substring(4, 6);
    const day = signInDate.substring(6, 8);
    const time = signInTime.substring(0, 5); // HH:MM
    
    const defaultDateTime = `${year}-${month}-${day}T${time}`;
    document.getElementById("makeupSignOutTime").value = defaultDateTime;
    
    // 清空原因
    document.getElementById("makeupReason").value = "";
    
    // 顯示模態視窗
    const modal = new bootstrap.Modal(document.getElementById('makeupModal'));
    modal.show();
}

// 提交補簽申請
async function submitMakeup() {
    if (!makeupCurrentRecord) {
        alert("無有效的補簽記錄");
        return;
    }
    
    const signOutTime = document.getElementById("makeupSignOutTime").value;
    const reason = document.getElementById("makeupReason").value;
    
    if (!signOutTime) {
        alert("請選擇簽退時間");
        return;
    }
    
    if (!reason.trim()) {
        alert("請填寫補簽原因");
        return;
    }
    
    try {
        // 轉換時間格式為 YYYYMMDD-HH:MM:SS
        const dateTime = new Date(signOutTime);
        const formattedSignOutTime = dateTime.getFullYear().toString() +
            String(dateTime.getMonth() + 1).padStart(2, '0') +
            String(dateTime.getDate()).padStart(2, '0') + '-' +
            String(dateTime.getHours()).padStart(2, '0') + ':' +
            String(dateTime.getMinutes()).padStart(2, '0') + ':' +
            String(dateTime.getSeconds()).padStart(2, '0');
        
        // 取得申請時間
        const applicationTime = new Date().toLocaleString('zh-TW', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
        
        // 在原因中加註申請時間
        const reasonWithTime = `${reason} (申請時間: ${applicationTime})`;
        
        const response = await postfunct(
            "/sign/makeup",
            JSON.stringify({
                record: makeupCurrentRecord,
                sign_out_time: formattedSignOutTime,
                reason: reasonWithTime
            })
        );
        
        if (response.status === 200) {
            alert("補簽申請已提交成功");
            
            // 關閉模態視窗
            const modal = bootstrap.Modal.getInstance(document.getElementById('makeupModal'));
            modal.hide();
            
            // 重新載入記錄
            loadMakeupRecords();
            getrecord();
        } else {
            alert("補簽申請失敗：" + (response.msg || response.content));
        }
    } catch (error) {
        console.error("提交補簽申請錯誤:", error);
        alert("提交補簽申請時發生錯誤");
    }
}
