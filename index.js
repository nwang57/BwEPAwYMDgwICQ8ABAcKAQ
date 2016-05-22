var ExchangeRateClient = require('./ex_rate_client');

var client = new ExchangeRateClient('USD', 'HKD');

var results = [];
var errors = 0;
var timer = setInterval(function() {
    if (results.length > 5) {
        console.log(results);
        clearInterval(timer);
    }
    client.get_data(function(err, body) {
        if (err) {
            errors++;
            setTimeout(console.log("error"), 200);
        }
        else {
            results.push(body);
        }
    });
});
    
