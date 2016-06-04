'use strict'

var Promise = require('bluebird');
var RateDownloader = require('./ex_rate_client')
var MongoClient = require('mongodb').MongoClient;
var RateRequest = require('./rate_request');
var Beanstalkd = require('beanstalkd');

/**
 * The exchange rate worker
 * @typedef {object} RateWorker
 * @property {string} beanstalk_host
 * @property {string} beanstalk_port
 * @property {string} beanstalk_tube
 * @property {string} db_url - mongodb url
 * @property {string} mongo_collection - the collection that results are saved
 * @property {number} success_duration - in seconds
 * @property {number} number_results - total number of success to stop
 * @property {number} retry_duration - in seconds
 * @property {number} failed_attempts - total number of failure to stop
 * @property {number} reserve_timeout
 * @property {object} beanstalkd_connection
 * @property {boolean} running - worker state
 */
class RateWorker {
    constructor(beanstalk_host, beanstalk_port, beanstalk_tube, db_url, mongo_collection, success_duration, number_results, retry_duration, failed_attempts, timeout) {
        this.beanstalk_host = beanstalk_host;
        this.beanstalk_port = beanstalk_port;
        this.beanstalk_tube = beanstalk_tube;
        this.db_url = db_url;
        this.mongo_collection = mongo_collection;
        this.success_duration = success_duration || 6;
        this.number_results = number_results || 3;
        this.retry_duration = retry_duration || 3;
        this.failed_attempts = failed_attempts || 3;
        this.reserve_timeout = timeout || 10;
        this.beanstalkd_connection = new Beanstalkd(beanstalk_host, beanstalk_port);
    }

    start() {
        this.running = true;
        this.beanstalkd_connection.connect();
        this.run();
    }

    run() {
        var that = this;
        if(that.running) {
            return that.getJobFromBeanstalkd()
                .then(that.getExchangeRate.bind(that))
                .then(that.saveToMongo.bind(that))
                .then(that.checkSuccess.bind(that), that.requestErrorHandle.bind(that))
                .then(that.run.bind(that), that.run.bind(that))
        }
    }

    stop() {
        this.running = false;
        this.beanstalkd_connection.quit();
    }

    getJobFromBeanstalkd() {
        var that = this;
        var worker = new Beanstalkd(that.beanstalk_host, that.beanstalk_port);
        return new Promise(function(resolve, reject) {
            worker.connect().then(function() {
                return worker.watch(that.beanstalk_tube)
                    .then(function() {
                        return worker.ignore('default');
                    });
            }).then(function() {
                return worker.reserveWithTimeout(that.reserve_timeout).spread(function(jobid, body) {
                    var job = JSON.parse(body.toString());
                    var request = new RateRequest(job._from, job._to, job._success_count, job._failed_count, jobid, job._last_success_ts, job._last_fail_ts);
                    worker.destroy(jobid);
                    resolve(request);
                })
            }).then(function() {
                worker.quit();
            })
            .catch(function(err) {
                console.log(err);
                reject(err);
            })
        });
    }

    getExchangeRate(request) {
        return new Promise(function(resolve, reject) {
            RateDownloader.get_data(request.from, request.to)
                .then(function(data) {
                    request.data = data;
                    resolve(request);
                }).catch(function(err) {
                    reject(request);
                })
        });
    }

    saveToMongo(request) {
        var that = this;
        return new Promise(function(resolve, reject) {
            MongoClient.connect(that.db_url, function(err, db) {
                if (err) {
                    console.log(err);
                    reject(request);
                }
                db.collection(that.mongo_collection).insert(request.data, function(err, res) {
                    if (err) {
                        console.log(err);
                        reject(request);
                    } else {
                        resolve(request);
                    }
                });
            });
        });
    }

    saveJob(request, delay) {
        var that = this;
        that.beanstalkd_connection.use(that.beanstalk_tube).then(function() {
            return that.beanstalkd_connection.put(0, delay, 60, JSON.stringify(request)).then(function(jobid) {
            });
        });
    }

    requestErrorHandle(request) {
        var that = this;
        return new Promise(function(resolve, reject) {
            var number_failures = request.failed_count + 1;
            if (number_failures < that.failed_attempts) {
                request.failed_count = number_failures;
                request.last_fail_ts = Date.now();
                that.saveJob(request, that.retry_duration);
            } else {
                // Job discarded
                that.stop();
            }
            reject(request);
        });
    }

    checkSuccess(request) {
        var that = this;
        return new Promise(function(resolve, reject) {
            var success_count = request.success_count + 1;
            if (success_count < that.number_results) {
                request.success_count = success_count;
                request.last_success_ts = Date.now();
                that.saveJob(request, that.success_duration);
            } else {
                // Job finished
                that.stop();
            }
            resolve(request);
        });
    }
}

module.exports = RateWorker;
