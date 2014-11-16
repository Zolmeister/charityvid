$(function() {
    $('.facebook-login').bind('touchstart click', function(e){
        e.preventDefault();
        LoginFB();
    });
    window.LoginFB = function LoginFB(){
        FB.getLoginStatus(function(response) {
            if (response.status === 'connected') {
                window.location = '/auth/facebook';
            }
            else{
                FB.login(function(response){
                    if (response.authResponse) {
                        window.location = '/auth/facebook';
                    }
                })
            }
        })
    }
        
})