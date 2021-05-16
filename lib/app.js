const express = require("express");
const _authRouter = require("../auth/routes/authRoutes");
const cors = require("cors");
const _orgnizationRouter = require("../organization/routes/organizationRoutes");
const authMiddleware = require("../organization/middlewares/authMiddleware");

const app = express();


app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended: true}))


const authRouter = _authRouter(express);
const organizationRouter = _orgnizationRouter(express)

const baseUrl = "/api/v1";

app.get("/ping", (req,res) => {res.send("pong")})
app.use(baseUrl + "/auth", authRouter)
app.use(baseUrl + "/org", authMiddleware.authenticate, organizationRouter)

module.exports = app