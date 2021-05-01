const express = require("express");
const _authRouter = require("../auth/routes/authRoutes");
const cors = require("cors");
const _orgnizationRouter = require("../organization/routes/organizationRoutes");
const authMiddleware = require("../organization/middlewares/authMiddleware");

const app = express();


app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: true}))

// app.use((req, res, next) => {
//     res.setHeader("Access-Control-Allow-Origin", "*")
//     res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization")
//     res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS");
//     next();
// })


const authRouter = _authRouter(express);
const organizationRouter = _orgnizationRouter(express)

const baseUrl = "/api/v1";

app.get("/ping", (req,res) => {res.send("pong")})
app.use(baseUrl + "/auth", authRouter)
app.use(baseUrl + "/org", authMiddleware.authenticate, organizationRouter)

module.exports = app