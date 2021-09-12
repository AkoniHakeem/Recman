const http = require("http")
const config = require("./lib/config")
const StringDecoder = require("string_decoder").StringDecoder
const querystring = require("querystring")

var helpers = {};
helpers.decoder = new StringDecoder()
helpers.makeJsonRequest = function(method, path, payload, callback){
  // Configure the request details
  const requestPayload = JSON.stringify(payload)
  var requestDetails = {
    'protocol' : 'http:',
    'hostname' : 'localhost',
    'port' : 3001,
    'method' : method,
   
    'path' : path,
    'headers' : {
      'Content-Type' : 'application/json',
      'Content-Length': Buffer.byteLength(requestPayload),
      'Authorization': 'bearer ' + process.env.AUTH_TOKEN ,
    }
  };


  // Send the request
  var req = http.request(requestDetails, function(res){
      callback(res);
  });

  req.on("error", (err) => {
    console.log(err)
  })

  req.write(requestPayload);
  req.end();
};

const requestPayloads = {
  login: {"email": "someone@defaultmail.com", "password": "defaultpassword"},
  createOrg: {
    name: "golden rising sun"
  }, // to add new member first sign user up and then add as new member
  addMember: {
    organizationId: "608b0f55b109132168239da2",
    userId: "608831f334d7181874b92848",
    role: "admin",
    address: "Hob and Hog Plaza",
    ps1: 12345
  },
  createPayment: {
    recordName: "monthly payment",
    organizationId: "608b0f55b109132168239da2",
    userId: "608831f334d7181874b92848",
    target: 1000,
    cycle: "monthly"
  },
  postPayment: {
    recordName: "monthly payment",
    userId: "608831f334d7181874b92848",
    amount: 1000,
    date: Date.now(),
    mode: "local posting",
    organizationId: "608b0f55b109132168239da2",
  }
}

const basePath = "/api/v1"
const requestPaths = {
  login: basePath + "/auth/login",
  creatOrg: basePath + "/org/create",
  addMember: basePath + "/org/add-member",
  getMembers: basePath + "/org/get-members?page=1&organizationId=" + "608b0f55b109132168239da2",
  createPayment: basePath + "/org/create-payment",
  postPayment: basePath + "/org/post-payment"
};
const method = {
  post: "POST",
  get: "GET"
}

helpers.makeJsonRequest(method.post, requestPaths.login, requestPayloads.login, (res) => {
  let data = ""
  console.log(res.statusCode)
    res.on("data", (dataBuff) => {
      data += helpers.decoder.write(dataBuff);
    })

    res.on("end", () => {
      data += helpers.decoder.end()
      console.log(JSON.parse(data))
    })
})