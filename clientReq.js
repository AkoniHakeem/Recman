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
      'Authorization': 'bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYwODgzMWYzMzRkNzE4MTg3NGI5Mjg0OCIsImZpcnN0bmFtZSI6Ik1heW93YSIsImxhc3RuYW1lIjoiQWtvbmkiLCJlbWFpbCI6InNvbWVvbmVAZGVmYXVsdG1haWwuY29tIiwicGhvbmUiOiIyMjItMjIyMi0yMjIiLCJpYXQiOjE2MTk4NjA4MTUsImV4cCI6MTYxOTk0NzIxNX0.kX9Xe-cCDtyGOO-C1X3e4jMpK3cAgAo0g7EL4JcUzeg',
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
  },
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
  }
}

const basePath = "/api/v1"
const requestPaths = {
  login: basePath + "/auth/login",
  creatOrg: basePath + "/org/create",
  addMember: basePath + "/org/add-member",
  getMembers: basePath + "/org/get-members?page=1&organizationId=" + "608b0f55b109132168239da2",
  createPayment: basePath + "/org/create-payment",
  postPayment: basePath + "/org/create-payment"
};
const method = {
  post: "POST",
  get: "GET"
}

helpers.makeJsonRequest(method.post, requestPaths.createPayment, requestPayloads.createPayment, (res) => {
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