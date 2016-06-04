'use strict';

let httpProxy = require('http-proxy');
let http = require('http');
let seaport = require('seaport');
let config = require('./config');
let ports = seaport.connect(config.seaport_host, config.seaport_port);
let ipaddr = require('ipaddr.js');
//
// round robin proxy
//
let i = -1;
let proxy = httpProxy.createServer();
http.createServer(function (req, res) {
    loadBalanceProxy(req, res);
}).listen(8000);

function loadBalanceProxy(req, res) {
    let addresses = ports.query('worker_server');

    //if there are not workers, give an error
    if (!addresses.length) {
        res.writeHead(503, {'Content-Type': 'text/plain'});
        res.end('Service unavailable');
        return;
    }

    i = (i + 1) % addresses.length;
    //need convert to IPv4
    let host = ipaddr.parse(addresses[i].host).toIPv4Address().toString();
    let target = 'http://' + host + ':' + addresses[i].port;
    proxy.proxyRequest(req, res, {
        target: target
    });
}
