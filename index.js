// import server from "./lib/server"
const server = require("./lib/server")



const serverStarter = {}

serverStarter.start = (name = "") => {
    server.init(name);
}

if(require.main === module) {
    serverStarter.start();
}

module.exports = serverStarter