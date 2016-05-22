var assert = require("assert");
var ExchangeRateClient = require("./ex_rate_client");

describe('ExchangeRateClient', function() { 
    describe('#get_data', function() {
        it('Api call success', function() {
            var client = new ExchangeRateClient('HKD', 'USD');
            client.get_data(function(err, body) {
                assert.equal('HKD', body.from); 
            });
        });
    });
});
