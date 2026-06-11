const expect = require('chai').expect;
var chai = require('chai')
    , chaiHttp = require('chai-http');

chai.use(chaiHttp);
// import math file
const server = require('../server');
const serverUrl = 'http://127.0.0.1:3000';

describe('Server', () => {
    describe('Server should be defined', () => {
        it('Should be defined get request', () => {
            chai
                .request(server)
                .get(serverUrl + '/')
                .end((err, res) => {
                    res.should.have.status(200);
                    expect(res.body.message).to.deep.equal('Welcome to SUMITRA API Server.');
                    done();
                });

        });
    });
});