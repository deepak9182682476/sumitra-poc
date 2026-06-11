// const expect = require('chai').expect;
// var chai = require('chai')
//     , chaiHttp = require('chai-http');

// chai.use(chaiHttp);
// // import math file
// const serverUrl = 'http://127.0.0.1:3000';

// describe('Alarm Controller', () => {
//     it('Should be defined alarm-info get request', async () => {
//         let res = chai
//             .request(alarmRoutes)
//             .get('/alarm-info');
//             console.log(res ,'======');
//         // expect(res.status).to.equal(200);
//     });
// });

const sinon = require('sinon');
const request = require('request');
const env = require('../app/config/env');
const chaiHttp = require('chai-http');
const alarmRoutes = require('../app/routes/alarm');
const chai = require('chai');
chai.use(chaiHttp);

describe('Alarm Service', function () {

    beforeEach(() => {
        this.get = sinon.stub(request, 'get');
        this.post = sinon.stub(request, 'post');
        this.put = sinon.stub(request, 'put');
    });
    afterEach(() => {
        this.get.restore();
        this.post.restore();
        this.put.restore();
    });
    describe("Get Alarm Data API", () => {

        it('should be defined /alarm-info', (done) => {
            chai.request(alarmRoutes)
                .get('/alarm-info')
                .end(function (error, response, body) {
                    expect(response.status).to.be.equal(200);
                    done();
                });
        });

        it('should be defined /create-update', (done) => {
            chai.request(alarmRoutes)
                .post('/create-update')
                .send({ username: '' })
                .end(function (error, response, body) {
                    expect(response.status).to.be.equal(200);
                    done();
                });
        });

        it('should be defined /acknowledge-clear', (done) => {
            chai.request(alarmRoutes)
                .put('/acknowledge-clear')
                .send({ alarm_id: 1, acknowledged_cleared: false })
                .end(function (error, response, body) {
                    expect(response.status).to.be.equal(200);
                    done();
                });
        });

        it('should be defined /alarm-timeline', (done) => {
            chai.request(alarmRoutes)
                .get('/alarm-timeline')
                .query({ zoneId: 1, alarmId: 1 })
                .end(function (error, response, body) {
                    expect(response.status).to.be.equal(200);
                    done();
                });
        });


        it('should be defined /auto-manual-mode', (done) => {
            chai.request(alarmRoutes)
                .post('/auto-manual-mode')
                .end(function (error, response, body) {
                    expect(response.status).to.be.equal(200);
                    done();
                });
        });

        it('should be defined /update-auto-manual-mode', (done) => {
            chai.request(alarmRoutes)
                .put('/update-auto-manual-mode')
                .send({ mode: 'auto' })
                .end(function (error, response, body) {
                    expect(response.status).to.be.equal(200);
                    done();
                });
        });

        it('should be defined /get-auto-manual-mode', (done) => {
            chai.request(alarmRoutes)
                .get('/get-auto-manual-mode')
                .end(function (error, response, body) {
                    expect(response.status).to.be.equal(200);
                    done();
                });
        });

        it('should be defined /find-distance-iff', (done) => {
            chai.request(alarmRoutes)
                .get('/find-distance-iff')
                .end(function (error, response, body) {
                    expect(response.status).to.be.equal(200);
                    done();
                });
        });

        it('should be defined /find-zones-alarm-list', (done) => {
            chai.request(alarmRoutes)
                .post('/find-zones-alarm-list')
                .end(function (error, response, body) {
                    expect(response.status).to.be.equal(200);
                    done();
                });
        });


    });
}); 