
async function send() {
    var account = document.getElementById('account').value;
    var email = document.getElementById('email').value;

    
    var response = await postfunct("/login/gen_passwd_reset_key",JSON.stringify({'id':account,'email':email})); 
    if (response.status==200){
        alert("成功\n"+response.msg);
        window.location.href = response.redir;
    }else{
        alert("失敗\n"+response.msg);
    }
    return response;
    
}
