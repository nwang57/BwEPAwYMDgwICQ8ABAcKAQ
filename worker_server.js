var http = require('http');
var RateWorker = require('./worker');
var config = require('./config');
var seaport = require('seaport');
var ports = seaport.connect(config.seaport_host, config.seaport_port);

var server = http.createServer(function(req, res) {
    var worker = new RateWorker(config.beanstalk_host, config.beanstalk_port, config.beanstalk_tube, config.mongodb_url, config.mongodb_collection);
    if (req.url == "/start") {
        res.writeHead(200, {"Content-Type": "text/html"});
        worker.start();
        res.end("Worker start running");
    } else if (req.url == "/stop") {
        res.writeHead(200, {"Content-Type": "text/html"});
        worker.stop();
        res.end("Worker stop running");
    } else {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("404 error! File not found.");
    }
});

server.listen(ports.register('worker_server'));
