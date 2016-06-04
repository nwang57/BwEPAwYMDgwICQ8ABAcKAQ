'use strict'
var RateWorker = require('./worker');
var config = require('./config');

var worker = new RateWorker(config.beanstalk_host, config.beanstalk_port, config.beanstalk_tube, config.mongodb_url, config.mongodb_collection);
worker.start();
