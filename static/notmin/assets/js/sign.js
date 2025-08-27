var data_now={"len":0};
var col_arr=['DATE', "SIGN_IN", "SIGN_OUT", "DURATION", "STATE" , "LOG"];
var col_disp=['日期', "簽到時間", "簽退時間", "時數", "狀態" , "備註"];
var col_num=col_arr.length;
var index_arr=[];

check_login()
async function sign_in(boolean_io){
    check_login();
    if (data_now.len!=0){
        if (data_now["d"+(data_now.len-1)][index_arr[4]]=="signin"){
            if (!confirm("有未簽退紀錄，是否要覆蓋?")) {
                return;
            }
        }
    }
    
    var response = await postfunct("/sign/sign_in",JSON.stringify({'option':1,'user':'user'})); 
    if (response.status==302){
        alert("閒置過久，請再試一次");
    }
    if (response.status==200){
        alert("簽到成功\n"+response.msg);
    }
    getrecord();
    return response;
}
async function sign_out(){
    check_login()
    var dl=data_now["d"+(data_now.len-1)]
    if (dl[index_arr[4]]=="signin"){
        if (!confirm("今日上班簽到時間:"+dl[index_arr[1]]+"，是否簽退?")) {
            return;
        }
    }
    var response = await postfunct("/sign/sign_in",JSON.stringify({'option':0,'user':'user'})); 
    if (response.status==302){
        alert("閒置過久，請再試一次");
        return;
    }
    if (response.status==200){
        alert("簽退成功\n"+response.msg);
    }else{
        alert("無待簽退紀錄，若您仍需要簽退請提交紙本申請\n"+response.msg);
        return;
    }
    getrecord();
    return response;
}

async function getrecord(month=""){
    response = await postfunct("/sign/get_record",JSON.stringify({'month':month,'user':'khh00001'}));
    console.log(response);
    data_now=response.data;
    if (index_arr.length==0){
        for(var i=0;i<col_num;i++){
            index_arr.push(data_now.column_id.indexOf(col_arr[i]));
        }
    }
    if (data_now.len!=0){
        refresh_table(data_now);
    }
    
    
    return ;
}
function refresh_table(res){
    var table=document.getElementById("dataTable-sign");
    var th=table.children[0];
    var tb=table.children[1];
    var thHTML="<tr>";  
    //thHTML+='<th style="width:2em;font-size:small;" font>選項</th>';
    for(i=0;i<col_disp.length;i++){
        thHTML+="<th>"+col_disp[i]+"</th>";                                                    
    }        
    thHTML+="</tr>";
    th.innerHTML=thHTML;
    
    var tbHTML="";
    for(i=res.len-1;i>=0;i--){
        var k="d"+i;
        tbHTML+='<tr id="tr-{id}">';
        //tbHTML+='<td>'+res[k]+'</td>';
        console.log("k="+k);
        for(j=0;j<index_arr.length;j++){
            tbHTML+="<td>"+res[k][index_arr[j]]+"</td>";
        }
        tbHTML=tbHTML+'</tr>';
    }
    //console.log(tbHTML);
    tb.innerHTML=tbHTML;
    table.children[2].innerHTML=th.innerHTML;
}
getrecord();
