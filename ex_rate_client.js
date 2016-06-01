var Promise = require("bluebird");
var request = Promise.promisify(require('request'));

var parse_data = function(from, to, res) {
    return {
        "from": from,
        "to": to,
        "created_at": Date.now(),
        "rate": Number((res.rates[to]).toFixed(2)).toString()
    };
};

var get_data = function (from, to) {
    return request('http://api.fixer.io/latest?' + 'base=' + from + '&symbols=' + to)
        .then(function(response) {
            return JSON.parse(response.body);
        })
        .then(parse_data.bind(null, from, to))
        .catch(function(e) {
            console.log("erorr");
        });
};
exports.get_data = get_data;
