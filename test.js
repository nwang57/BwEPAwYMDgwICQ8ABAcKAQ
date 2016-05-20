var assert = require("assert");
var ExchangeRateClient = require("./ex_rate_client");

suite('ExchangeRateClient', function() { 
    suite('#get_data', function() {
        test('Api call success', function() {
            var client = new ExchangeRateClient('HKD', 'USD');
            client.get_data(function(err, body) {
                assert.equal('HKD', body.from); 
            });
        });
    });
});
