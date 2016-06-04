# BwEPAwYMDgwICQ8ABAcKAQ

## Running in single machine

Modify the config file with the correct host, port for Beanstalkd and mongodb url. Seed job by running:  
`node seed_bean.js`


Then run the following command to start the worker:  
`node index.js`
    
## Running in multiple machines

I implement a simple load balancer using http-proxy in a round robin fashion. Worker servers are registered by `seaport`. It can monitor the running workers and discard the crashed ones.

Start seaport service:  
`seaport listen 9090`
    
Start load balancer, the load balancer will listen port 8000:  
`node load_balancer.js`

Start worker server:  
`node worker_server.js &`
