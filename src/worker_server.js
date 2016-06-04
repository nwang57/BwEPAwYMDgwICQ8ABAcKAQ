'use strict';
let http = require('http');
let RateWorker = require('./worker');
let config = require('./config');
let seaport = require('seaport');
let ports = seaport.connect(config.seaport_host, config.seaport_port);

let server = http.createServer(function (req, res) {
    let worker = new RateWorker(config.beanstalk_host, config.beanstalk_port, config.beanstalk_tube, config.mongodb_url, config.mongodb_collection, config.job.success_duration, config.job.number_results, config.job.retry_duration, config.job.failed_attempts, config.job.timeout);
    if (req.url === '/start') {
        res.writeHead(200, {'Content-Type': 'text/html'});
        worker.start();
        res.end('Worker start running');
    } else if (req.url === '/stop') {
        res.writeHead(200, {'Content-Type': 'text/html'});
        worker.stop();
        res.end('Worker stop running');
    } else {
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.end('404 error! File not found.');
    }
});

server.listen(ports.register('worker_server'));
