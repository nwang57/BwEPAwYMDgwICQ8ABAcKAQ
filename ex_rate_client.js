var request = require('request');

var ex_rate_client = function (from, to) {
    var url = 'http://api.fixer.io/latest?' + 'base=' + from + '&symbols=' + to;
    this.get_data = function (callback) {
        request(url, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                try {
                    body = JSON.parse(body);
                    var res = {
                        "from": from,
                        "to": to,
                        "created_at": Date.now(),
                        "rate": Number((body.rates[to]).toFixed(2)).toString()
                    };
                    callback(error, res);
                }
                catch (err) {
                    callback("Invalid JSON response", body);
                }
            }
            else if (error) {
                console.log('error: ' + error);
            }
        });
    };
}; 
module.exports = ex_rate_client;
