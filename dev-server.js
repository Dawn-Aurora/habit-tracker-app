#!/usr/bin/env node

/**
 * Simple development server for the Habit Tracker HTML interface
 */

const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;
const API_PORT = process.env.API_PORT || 5000;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Proxy API requests to backend
app.use('/api', createProxyMiddleware({
  target: `http://localhost:${API_PORT}`,
  changeOrigin: true,
  pathRewrite: {
    '^/api': '/api'
  }
}));

// Serve index.html for all other routes (SPA fallback)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Frontend server running on http://localhost:${PORT}`);
  console.log(`📡 API server should be running on http://localhost:${API_PORT}`);
  console.log(`📋 Make sure to start the backend server first!`);
});
