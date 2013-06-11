var restroom = require('../');

var expect = require('chai').expect;
var supertest = require('supertest');

var request = supertest(app);

describe('Mongo Tests', function(){

  it('should list the avaliable collections', function(done){
    request.get('/')
    .expect(200)
    .end(function(error, response){

      done(error, response);
    });
  });

  after(function(done){
    db.users.drop(next);
  });


});
