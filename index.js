var ExchangeRateClient = require('./ex_rate_client');

var client = new ExchangeRateClient('USD', 'HKD');

client.get_data(function(err, body) {
    console.log(body);
});
