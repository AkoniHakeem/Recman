const config = require("../lib/config");
const db = (dbName=undefined) => require("../lib/dbClient").database(dbName || config.db);
module.exports = db;