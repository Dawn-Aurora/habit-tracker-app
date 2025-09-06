import express from 'express';

const app = express();
const PORT = parseInt(process.env.PORT || '5000', 10);

app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        message: 'Test server is running',
        nodeVersion: process.version,
        environment: process.env.NODE_ENV || 'development'
    });
});

app.get('/', (req, res) => {
    res.json({ 
        message: 'Habit Tracker Backend Test Server', 
        status: 'running',
        endpoints: ['/api/health']
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Test server running on port ${PORT}`);
    console.log(`Node version: ${process.version}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
