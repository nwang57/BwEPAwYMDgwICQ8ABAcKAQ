'use strict'

let RateWorker = require('./worker');
let config = require('./config');

let worker = new RateWorker(config.beanstalk_host, config.beanstalk_port, config.beanstalk_tube, config.mongodb_url, config.mongodb_collection, config.job.success_duration, config.job.number_results, config.job.retry_duration, config.job.failed_attempts, config.job.timeout);
worker.start();
