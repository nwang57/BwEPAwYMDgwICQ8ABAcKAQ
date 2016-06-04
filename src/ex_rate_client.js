'use strict';

let Promise = require('bluebird');
let request = Promise.promisify(require('request'));

let parse_data = function (from, to, res) {
    return {
        'from': from,
        'to': to,
        'created_at': Date.now(),
        'rate': Number((res.rates[to]).toFixed(2)).toString()
    };
};

let get_data = function (from, to) {
    return request('http://api.fixer.io/latest?' + 'base=' + from + '&symbols=' + to)
        .then(function (response) {
            return JSON.parse(response.body);
        })
        .then(parse_data.bind(null, from, to));
};
exports.get_data = get_data;
