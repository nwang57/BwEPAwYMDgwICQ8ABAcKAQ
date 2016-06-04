var expect = require('chai').expect;
var assert = require("assert");
var RateDownloader = require("./ex_rate_client");
var RateRequest = require("./rate_request");
var RateWorker = require('./worker');
var Beanstalkd = require('beanstalkd');

describe('ExchangeRateClient', function() {
    describe('#get_data', function() {
        it('Api call success', function() {
            RateDownloader.get_data('USD', 'HKD')
                .then(function(data) {
                    expect(data.from).to.equal('USD');
                    done();
                });
        });
    });
});

describe('RateRequest', function() {
    describe('#set_data', function() {
        it('set data success', function() {
            var request = new RateRequest('USD', 'HKD');
            request.data = "test";
            expect(request.data).to.equal('test');
        })
    })
})

describe('Rate Worker', function() {
    var worker = {};
    var test_config = {
        "host": "localhost",
        "port": 11300,
        "tube": "nwang57"
    };
    beforeEach(function() {
        worker = new RateWorker(test_config.host, test_config.port, test_config.tube);
    });

    it('should get exchange rate', function() {
        var request = new RateRequest('HKD', 'USD');
        worker.getExchangeRate(request)
            .then(function(new_request) {
                expect(new_request.data.rate).to.be.a('string');
                done();
            })
    })

    it('should get job from beanstalkd', function() {
        const beanstalkd = new Beanstalkd(test_config.host, test_config.port);
        var request = new RateRequest('US', 'HKD');
        beanstalkd.connect()
            .then(function(client) {
                client.use('nwang57').then(() => {
                    return client.put(0, 0, 60, JSON.stringify(request));
                }).then(() => {
                    beanstalkd.quit();
                })
            });
        worker.getJobFromBeanstalkd()
            .then(function(request) {
                expect(request.from).to.equal('US');
            });
    })
})
