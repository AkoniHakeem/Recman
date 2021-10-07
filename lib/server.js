// import https from "https"
const http = require("http")
const app = require("./app")

const dotenv = require("dotenv");
const dotenvExpand = require("dotenv-expand")

// require('dotenv').config({path: path.resolve(__dirname+'/.env')});

const config = require("./config");
const port = config.httpPort || config.httpsPort


const server = {}

server.apps = {
    expressApp: app,
    ahdeinyApp: (req, res) => {
        // do stuffs
    }
}

const onError = error => {
    if (error.syscall !== "listen") {
    // ToDo: Needs advanced error logging
      console.log(error)
    }
    const bind = typeof addr === "string" ? "pipe " + addr : "port " + port;
    switch (error.code) {
      case "EACCES":
        // ToDo: Needs advanced error logging
        console.error(bind + " requires elevated privileges");
        process.exit(1);
      case "EADDRINUSE":
        // ToDo: Needs advanced error logging
        console.error(bind + " is already in use");
        process.exit(1);
      default:
        throw error;
    }
  };

// const httpServer = http.createServer((req, res)=> {
        
// });

server.init = (appName="expressApp") => {
    dotenvExpand(dotenv.config());
    appName = appName.trim() === '' && server.apps[appName]  ? appName : "expressApp"
    const httpServer = http.createServer(server.apps[appName]);
    
    
    httpServer.listen(port, () => {
        console.log(`server is now listening on port ${port}`)
    })

    // httpServer.on(onError);
}

module.exports = server;