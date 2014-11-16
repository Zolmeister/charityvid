$(function() {
    $(window).bind('beforeunload', function(){
        return "Your donation is incomplete."
    })
    $('.close-button').bind('click', function() {
        $('.overlay').addClass('shrink-death');
    });
    onclick='postToFB(); return false;'
    $('.fb-share-btn').bind('click', function(){
        postToFB();
        return false;
    });
    if($(document).width()<=685){
        if(window.innerWidth<=439){
            $('.watch-ad').attr('src', DonateAdUrl+'&width=290&height=230').width(290).height(230)
        }
        else{
            $('.watch-ad').attr('src', DonateAdUrl+'&width=440&height=328').width(440).height(328)
        }
    }

    function checkAd() {
        $.post("/ajax/adcheck", {
            _csrf: $("#csrfToken").val(),
            cvparam: CVPARAM
        }, function(data) {
            if (data.success) {
                $(window).unbind('beforeunload')
                $('#donation-status')
                    .html('Complete')
                    .removeClass('incomplete')
                    .addClass('complete')
                $('#donation-continue')
                    .removeClass('disabled')
                    .attr('href','/')
                $('.thanks').show(200);
            } else {
                if(data.error){
                    $(window).unbind('beforeunload')
                    window.location = '/';
                }
                else{
                    setTimeout(checkAd, 1000);
                }
            }
        });
    }
    
    window.postToFB = function postToFB() {
        var obj = {
          method: 'feed',
          link: 'http://charityvid.org',
          picture: 'http://charityvid.org'+CharityLogo,
          name: 'Donation to '+CharityName,
          caption: 'CharityVid.org',
          display: 'popup',
          description: 'I donated to '+CharityName+' for free through CharityVid.org'
        };

        FB.ui(obj, function(){});
      }
    
    checkAd()
});