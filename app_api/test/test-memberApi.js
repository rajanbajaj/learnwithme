// During the test the env variable is set to test
process.env.NODE_ENV = 'test';

// const mongoose = require('mongoose');

// Require the dev-dependencies
const {describe, it} = require('mocha');
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../app');
// const Member = mongoose.model('Member');
chai.should();


chai.use(chaiHttp);

// Our parent block
describe('Members', () => {
  /*
    * Test the /GET route
    */
  describe('/GET Member', () => {
    it('it should GET all the Members', (done) => {
      chai.request(server)
          .get('/api/members')
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.keys(['_links', 'size', 'limit', 'start', 'results']);
            res.body.results.should.be.a('array');
            res.body._links.should.be.a('object');
            res.body._links.should.have.keys(['self', 'prev', 'next']);
            done();
          });
    });
  });
});
