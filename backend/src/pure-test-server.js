var http = require('http');

var PORT = parseInt(process.env.PORT || '5000', 10);

var server = http.createServer(function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    if (req.url === '/api/health') {
        var response = {
            status: 'OK',
            timestamp: new Date().toISOString(),
            message: 'Pure CommonJS test server is running',
            nodeVersion: process.version,
            environment: process.env.NODE_ENV || 'development',
            port: PORT,
            platform: process.platform,
            architecture: process.arch
        };
        res.writeHead(200);
        res.end(JSON.stringify(response, null, 2));
        return;
    }

    // Root endpoint
    if (req.url === '/') {
        var rootResponse = {
            message: 'Habit Tracker Backend - Pure CommonJS Test Server',
            status: 'running',
            endpoints: ['/api/health'],
            nodeVersion: process.version,
            serverType: 'Pure CommonJS - No TypeScript compilation'
        };
        res.writeHead(200);
        res.end(JSON.stringify(rootResponse, null, 2));
        return;
    }

    res.writeHead(404);
    res.end(JSON.stringify({
        error: 'Not Found',
        url: req.url,
        method: req.method
    }));
});

server.listen(PORT, '0.0.0.0', function () {
    console.log('Pure CommonJS test server running on port ' + PORT);
    console.log('Node version: ' + process.version);
    console.log('Environment: ' + (process.env.NODE_ENV || 'development'));
    console.log('Platform: ' + process.platform);
    console.log('Architecture: ' + process.arch);
    console.log('Server type: Pure CommonJS (no TypeScript)');
});

process.on('SIGTERM', function () {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(function () {
        console.log('Process terminated');
        process.exit(0);
    });
});

console.log('Pure CommonJS test server starting...');
