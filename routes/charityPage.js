module.exports = function(req, res) {
    /*
     * here is where a page for each charity could be added
     * but instead it just redirects to /charities for FB like button support
     * var charityName=req.params.charity;
     */
    res.redirect('/charities?charity='+req.param('charity'))
}