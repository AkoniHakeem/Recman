const authController = require("../controllers/authcontroller");
const {strategyNames, passport} = require("../auth");

function _authRouter(e) {
    const authRouter = e.Router();
    authRouter.post("/signup", (req, res, next) => {
        passport.authenticate(strategyNames.signup, {session: false}, (err, user, options) => {
            if(!err) {
                if(user) {
                    req.user = user;
                    next();
                }
            }
            else {
                // i think its a good idea to do error loggig here
                // todo error logging 
                next(err)
            }
        })(req, res, next) // the pattern is that
        // call to passport.authenticate returns the  sign up strategy
        // so we need to invoke it with (req, res, next) since we are defining a callback middleware here woth req, res, next passed
    }, authController.signup);
    
    authRouter.post("/login", (req, res, next) => {
        passport.authenticate(strategyNames.login, {session: false})(req, res, next)}, authController.login);
    return authRouter;
}

module.exports = _authRouter;
