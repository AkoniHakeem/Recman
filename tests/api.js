/*
 * API Tests
 *
 */

// Dependencies
var app = require("../dist/index");
var assert = require('assert');
var http = require('http');
var config = require("../dist/lib/config");
const StringDecoder = require("string_decoder").StringDecoder

// Holder for Tests
var api = {};

// Helpers
var helpers = {};
helpers.makeGetRequest = function(path,callback){
  // Configure the request details
  var requestDetails = {
    'protocol' : 'http:',
    'hostname' : 'localhost',
    'port' : config.default.httpPort,
    'method' : 'GET',
    'path' : path,
    'headers' : {
      'Content-Type' : 'application/json'
    }
  };


  // Send the request
  var req = http.request(requestDetails,function(res){
      callback(res);
  });
  req.end();
};

// The main init() function should be able to run without throwing.
api['app.start should start without throwing'] = function(done){
  assert.doesNotThrow(function(){
    try {
      app.default.start(function(err){
        done();
      })
    } catch (error) {
      throw error
    }
  },TypeError);
};

api['/ping should respond with a pong'] = function(done) {
  helpers.makeGetRequest("/ping", function(res){
    let decoder = new StringDecoder("utf-8")
    let data = ""
    res.on("data", (chunck) => { 
        data += decoder.write(chunck);
    }
      )
    res.on("end", () => {
      data += decoder.end()
      assert.strictEqual(data, "pong");
      done();
    })
  })
}

// Export the tests to the runner
module.exports = api;
