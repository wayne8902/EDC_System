var url_host="../";
var cross_org_host="https://istone.ee.nsysu.edu.tw:7777";
function get_date_string(){
    var d1=new Date();
    var YY=""+(d1.getYear()+1900);
    var MM=d1.getMonth()+1;
    var DD=d1.getDate();
    if(MM<10) MM="0"+MM;
    if(DD<10) DD="0"+DD;
    return YY+"/"+MM+"/"+DD;
}
let post_json = async(url,content) => {
    let response = await fetch(url,{
        method: 'post',body:content,mode: "cors",
        headers: {
            'Access-Control-Allow-Origin': cross_org_host,
            'Content-Type':'application/json'
        }
    });
    return response.json();
};
let postfunct = async(url,content="") => {
    if (content=="") content=JSON.stringify({'seed':Math.random()*10000})
    let response = await fetch(url,{
        method: 'post',
        body:content,
        mode: 'cors',
        credentials: "include",
        headers: {
            //'Access-Control-Allow-Origin': 'http://localhost:8002',
            //'Access-Control-Allow-Origin': 'http://127.0.0.1:8005',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials':true,
            'Content-Type':'application/json'
            
        }
    });
    return response.json();
};

function getParameterByName(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

function html_onload(sender){
    console.log("change name plate");
    //sender.value=getCookie('name');
    //document.getElementById('nvbar-ID').value=getCookie('name')
    if (document.getElementById('nvbar-ID')!=null){
        document.getElementById('nvbar-ID').innerHTML=decodeURI(getCookie('user_id'));
    }
}
async function check_login(){
    var check = await postfunct("/login/checklogin","");
    if (check.status==301){
        alert("請重新登入");
        window.location.href = check.redir;
    }
    else return;
}
html_onload()