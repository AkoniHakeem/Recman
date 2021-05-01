const passportLocal = require("passport-local").Strategy;
const passport = require("passport");
const passportJwt = require("passport-jwt");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const config = require("../lib/config");
const User = require("./models/user");
const Password = require("./models/password");
const db = require("./db")();

const options = {
    usernameField: "email",
    passwordField: "password",
    passReqToCallback: true   
}

const strategyNames = {
    signup: "signup",
    login: "login",
    authToken: "authToken"
}

const checkUserExist = async (email, db) => {
    const userCollection = (await db).collection("users");
    let user = await userCollection.findOne({email: email});
    return user;
}

passport.use( strategyNames.signup, new passportLocal(options, async function(req, username, password, done) {
    try {
        // check if user email exist 
        // return done(err);
        let user = await checkUserExist(username, db);
        if(!user) {
                // create user and password
            const userCollection = (await db).collection("users");
            const passwordCollection = (await db).collection("passwords");

            user = new User(req.body);
            user.createdAt = Date.now();
            user.updatedAt = Date.now();

            let password = new Password(req.body);
            password.hash = await bcrypt.hash(req.body.password, Number(config.encryptionSalt));

            const insertedResult = await userCollection.insertOne(user);
            // todo: implement insertion as a transaction such that if one fails both fails
            if(insertedResult.insertedCount > 0) { 
                user._id = insertedResult.insertedId;
                password.userId = user._id;
                const password_inserteResult = await passwordCollection.insertOne(password);
                if(password_inserteResult.insertedCount > 0) {
                    const credentials = {
                        id: user._id,
                        firstname: user.firstname,
                        lastname: user.lastname,
                        emai: user.email,
                        phone: user.phone
                    }
                    // todo: update time for auth token expiration
                    const token = jwt.sign(credentials, config.jwtSecret,{ expiresIn: config.expiresIn});
                    req.info = {
                        token,
                        user
                    }
                    done(null, user)
                }
                else {
                    req.error = "err: something went wrong"
                    done(null, false, {"message": "err: something went wrong"});
                }
            }else {
                req.error = "err: something went wrong"
                done(null, false, {"message": "err: something went wrong"});
            }
        }
        else {
            req.error = "err: user already exist"
            done(null, false, {"message": "err: user already exist"});
        }
    } catch (error) {
        // todo: log error
        req.error = error;
        done(error, false)
    }



}))

passport.use(strategyNames.login, new passportLocal(options, async function(req, username, password, done) {
    // check if email exist
    try {
        let user = await checkUserExist(username, db);
        if(user) {
            // verify password
            // find userPassword
            const passwordCollection = (await db).collection("passwords");
            const passw = await passwordCollection.findOne({userId: user._id});

            const passwordValid = await bcrypt.compare(password, passw.hash) // expects results to be true
            if(passwordValid) {
                    // create auth token for future authentication
                const credentials = {
                    id: user._id,
                    firstname: user.firstname,
                    lastname: user.lastname,
                    email: user.email,
                    phone: user.phone
                }
                // todo: update time for auth token expiration
                const token = jwt.sign(credentials, config.jwtSecret,{ expiresIn: config.expiresIn});
                req.info = {
                    token,
                    user
                }
                done(null, user);
            }
            else {
                req.error = "err: password dosent match"
                done(null, false, {
                    "message": "err: password doesnt match",
                })
            }
        }
        else {
            req.error = "err: user not found"
            done(null, false, {
                "message": "err: user not found",
            })
        }
    } catch (error) {
        // todo: log error 
        req.error = error
        done(error, false)
    }

}))

const jwtTokenExtractionOptions = {
    secretOrKey: config.jwtSecret,
    jwtFromRequest: passportJwt.ExtractJwt.fromAuthHeaderAsBearerToken()
}
passport.use(strategyNames.authToken, 
    new passportJwt.Strategy(jwtTokenExtractionOptions, async function(credentials, done) {
    if(credentials && credentials.id) {
        done(null, false, credentials);
    }
    else {
        done("err: invalid token", false, null)
    }
}))

module.exports = {
    strategyNames: strategyNames,
    passport: passport
}