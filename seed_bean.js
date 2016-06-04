'use strict';
let RateRequest = require('./rate_request');
let Beanstalkd = require('beanstalkd');
let config = require('./config');
const beanstalkd = new Beanstalkd(config.beanstalk_host, config.beanstalk_port);
let request = new RateRequest('USD', 'HKD');

beanstalkd.connect()
    .then(function (client) {
        client.use(config.beanstalk_tube).then(() => {
            return client.put(0, 0, 60, JSON.stringify(request));
        }).then((jobid) => {
            console.log(jobid);
        }).then(() => {
            beanstalkd.quit();
        }).catch((e) => {
            console.log(e);
        });
    });
