$(document).ready(function() {
    $("#editQuote").bind("click", editQuote)
})

function editQuote(e) {
    e.preventDefault()
    var prev = $("#userQuote").html()
    $("#userQuote").html("<textarea style='height:40px;width:400px;' type='text' id='editingQuote'>" + prev + "</textarea>")
    $(this).html("save")
    $(this).unbind("click")
    $(this).bind("click", function(e) {
        e.preventDefault()
        var prev = $("#editingQuote").val()


        function success() {
                $("#userQuote").html(prev)
                $("#editQuote").html("edit")
                $("#editQuote").unbind("click")
                $("#editQuote").bind("click", editQuote)
            }

        $.post("/ajax/profile", {
            _csrf: $("#csrfToken").val(),
            quote: prev
        }, function(resp) {
            if (resp.success) success()
        })
    })
}