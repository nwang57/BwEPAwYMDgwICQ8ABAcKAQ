var httpProxy = require('http-proxy');
var http = require('http');
var seaport = require('seaport');
var config = require('.config');
var ports = seaport.connect(config.seaport_host, config.seaport_port);
var ipaddr = require('ipaddr.js');
//
// round robin proxy
//
var i = -1;
var proxy = httpProxy.createServer();
http.createServer(function(req,res) {
    loadBalanceProxy(req,res);
}).listen(8000);

function loadBalanceProxy(req, res) {
    var addresses = ports.query('worker_server');

    // if there are not workers, give an error
    if (!addresses.length) {
        res.writeHead(503, {'Content-Type' : 'text/plain'});
        res.end('Service unavailable');
        return;
    }

    i = (i + 1) % addresses.length;
    //need convert to IPv4
    var host = ipaddr.parse(addresses[i].host).toIPv4Address().toString();
    var target = 'http://' + host + ':' + addresses[i].port;
    proxy.proxyRequest(req, res, {
        target: target
    });
}
