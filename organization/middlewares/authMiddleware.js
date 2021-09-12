const { passport, strategyNames } = require("../../auth/auth");

const authMiddleware = {}

authMiddleware.authenticate = (req, res, next) => {
    passport.authenticate(strategyNames.authToken,{session: false}, (err, user, credentials) => {
        if(credentials && credentials.id) {
            req.currentUser = credentials; 
            next();
        }
        else {
            res.status(401).send()
        }
    })(req, res, next);
}

module.exports = authMiddleware;