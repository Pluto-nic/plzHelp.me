var app  = require('../../server/server.js');
var chai = require("chai");
var sinon = require("sinon");
var sinonChai = require("sinon-chai");
var request  = require("supertest");
var expect = chai.expect;
chai.use(sinonChai);


describe("Server", function() {

  it("responds with 200 to requests to '/'", function(done){
    request(app).get('/').expect(200, done);
  });
// More tests here
});