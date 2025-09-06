import * as http from 'http';

const PORT = parseInt(process.env.PORT || '5000', 10);

const server = http.createServer((req, res) => {
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
        const response = {
            status: 'OK',
            timestamp: new Date().toISOString(),
            message: 'Minimal test server is running',
            nodeVersion: process.version,
            environment: process.env.NODE_ENV || 'development',
            port: PORT
        };
        res.writeHead(200);
        res.end(JSON.stringify(response, null, 2));
    } else if (req.url === '/') {
        const response = {
            message: 'Habit Tracker Backend - Minimal Test Server',
            status: 'running',
            endpoints: ['/api/health'],
            nodeVersion: process.version
        };
        res.writeHead(200);
        res.end(JSON.stringify(response, null, 2));
    } else {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Not Found' }));
    }
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Minimal test server running on port ${PORT}`);
    console.log(`Node version: ${process.version}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Platform: ${process.platform}`);
    console.log(`Architecture: ${process.arch}`);
});

process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
    });
});
