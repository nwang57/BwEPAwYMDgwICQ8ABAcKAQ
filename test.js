'use strict';
let expect = require('chai').expect;
let RateDownloader = require('./src/ex_rate_client');
let RateRequest = require('./src/rate_request');
let RateWorker = require('./src/worker');
let Beanstalkd = require('beanstalkd');

describe('ExchangeRateClient', function () {
    describe('#get_data', function () {
        it('Api call success', function () {
            RateDownloader.get_data('USD', 'HKD')
                .then(function (data) {
                    expect(data.from).to.equal('USD');
                    done();
                });
        });
    });
});

describe('RateRequest', function () {
    describe('#set_data', function () {
        it('set data success', function () {
            let request = new RateRequest('USD', 'HKD');
            request.data = 'test';
            expect(request.data).to.equal('test');
        });
    });
});

describe('Rate Worker', function () {
    let worker = {};
    let test_config = {
        'host': 'localhost',
        'port': 11300,
        'tube': 'nwang57'
    };
    beforeEach(function () {
        worker = new RateWorker(test_config.host, test_config.port, test_config.tube);
    });

    it('should get exchange rate', function () {
        let request = new RateRequest('HKD', 'USD');
        worker.getExchangeRate(request)
            .then(function (new_request) {
                expect(new_request.data.rate).to.be.a('string');
                done();
            });
    });

    it('should get job from beanstalkd', function () {
        const beanstalkd = new Beanstalkd(test_config.host, test_config.port);
        let request = new RateRequest('US', 'HKD');
        beanstalkd.connect()
            .then(function (client) {
                client.use('nwang57').then(function () {
                    return client.put(0, 0, 60, JSON.stringify(request));
                }).then(function () {
                    beanstalkd.quit();
                });
            });
        worker.getJobFromBeanstalkd()
            .then(function (new_request) {
                expect(new_request.from).to.equal('US');
            });
    });
});
