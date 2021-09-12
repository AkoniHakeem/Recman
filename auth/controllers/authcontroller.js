const authController = {}

authController.signup = function (req, res) {
    const userData = req.info;
    if(userData) {
        // todo: consider sending mail to user for verification
        console.log(userData)
        res.json(JSON.stringify(userData))
    }
    else {
        res.sendStatus(500)
    }
}

authController.login = function(req, res) {
    const userData = req.info;
    if(userData) {
        // todo: imlement further needs
        res.json(JSON.stringify(userData));
    }
    else {
        res.sendStatus(500)
    }
}

authController.logout = function(req, res) {
    // todo: implement logout
        // tips: revoke token - cause to expire
        // send status code
}


module.exports = authController;