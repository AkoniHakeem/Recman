const config = {}

config.environment = {
    "development": {
        "httpPort": 3001,
        "mongoUri": "mongodb://localhost:27017/recman_test",
        "db": "recman_test",
        "jwtSecret": process.env.jwtSecret || "thisisaverylongsecretkey",
        "expiresIn": "1d",
        "encryptionSalt": 10
    },
    "testing": {},
    "staging": {},
    "production": {
        "httpPort": process.env.HTTP_PORT,
        "mongoUri": process.env.MONGO_URI,
        "db": process.env.MONGODB_NAME,
        "jwtSecret": process.env.JWT_SECRET,
        "expiresIn": process.env.EXPIRES_IN, // stands for one day
        "encryptionSalt": process.env.ENCRYPTION_SALT
    }
}
process.env["NODE_ENV"] || console.log("NODE_ENV is not defined") 
const currentEnvironment = config.environment[`${process.env.NODE_ENV.toLocaleLowerCase()}`] || config.environment.development;

module.exports = currentEnvironment;