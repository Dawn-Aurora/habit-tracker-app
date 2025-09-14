import dotenv from 'dotenv';
dotenv.config();

// Environment validation and configuration
export const config = {
  // Server configuration
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Authentication configuration
  jwtSecret: (() => {
    const secret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
    
    // Validate JWT secret in production
    if (process.env.NODE_ENV === 'production') {
      if (!secret || secret.includes('your-super-secret-jwt-key')) {
        console.error('❌ CRITICAL: Weak or default JWT_SECRET detected in production!');
        console.error('   Set a strong, random JWT_SECRET environment variable immediately.');
        process.exit(1); // Exit in production if weak secret
      }
    } else if (secret.includes('your-super-secret-jwt-key')) {
      console.warn('⚠️  WARNING: Using default JWT_SECRET in development. Set JWT_SECRET environment variable for better security.');
    }
    
    return secret;
  })(),
  
  // Data client configuration
  dataClient: (() => {
    const client = process.env.DATA_CLIENT?.toLowerCase();
    const useMock = process.env.USE_MOCK_DATA === 'true';
    
    // Auto-configure based on DATA_CLIENT if USE_MOCK_DATA is not explicitly set
    if (!process.env.USE_MOCK_DATA) {
      if (client === 'mock') {
        process.env.USE_MOCK_DATA = 'true';
        return 'mock';
      } else if (client === 'sharepoint') {
        process.env.USE_MOCK_DATA = 'false';
        return 'sharepoint';
      }
    }
    
    return useMock ? 'mock' : (client || 'sharepoint');
  })(),
  
  // SharePoint configuration
  sharepoint: {
    tenantId: process.env.SHAREPOINT_TENANT_ID || '',
    clientId: process.env.SHAREPOINT_CLIENT_ID || '',
    clientSecret: process.env.SHAREPOINT_CLIENT_SECRET || '',
    siteId: process.env.SHAREPOINT_SITE_ID || '',
    listId: process.env.SHAREPOINT_LIST_ID || '',
    usersListId: process.env.SHAREPOINT_USERS_LIST_ID || '',
    
    // Validation helper
    isConfigured(): boolean {
      return !!(this.tenantId && this.clientId && this.clientSecret && this.siteId && this.listId);
    },
    
    // Get missing configuration fields
    getMissingFields(): string[] {
      const missing: string[] = [];
      if (!this.tenantId) missing.push('SHAREPOINT_TENANT_ID');
      if (!this.clientId) missing.push('SHAREPOINT_CLIENT_ID');
      if (!this.clientSecret) missing.push('SHAREPOINT_CLIENT_SECRET');
      if (!this.siteId) missing.push('SHAREPOINT_SITE_ID');
      if (!this.listId) missing.push('SHAREPOINT_LIST_ID');
      return missing;
    }
  },
  
  // Frontend configuration
  frontend: {
    url: process.env.FRONTEND_URL || 'https://witty-sand-040223500.2.azurestaticapps.net',
    additionalOrigins: process.env.ADDITIONAL_ALLOWED_ORIGINS 
      ? process.env.ADDITIONAL_ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
      : [],
    
    // Get all allowed origins for CORS
    getAllowedOrigins(): string[] {
      if (process.env.NODE_ENV === 'production') {
        return [
          this.url,
          'https://witty-sand-040223500.2.azurestaticapps.net',
          'https://habit-tracker-frontend.azurestaticapps.net',
          ...this.additionalOrigins
        ];
      } else {
        return [
          'http://localhost:3000', 
          'http://localhost:3001', 
          'http://localhost:5000',
          'http://127.0.0.1:3000',
          'http://127.0.0.1:5000'
        ];
      }
    }
  },
  
  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'warn' : 'info'),
    enableDebug: process.env.ENABLE_DEBUG === 'true' || process.env.NODE_ENV === 'development'
  },
  
  // Rate limiting configuration
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10), // 100 requests per window
    message: process.env.RATE_LIMIT_MESSAGE || 'Too many requests from this IP, please try again later.'
  }
};

// Environment validation on startup
export function validateEnvironment() {
  const errors: string[] = [];
  
  // Check if using SharePoint but missing required configuration
  if (config.dataClient === 'sharepoint' && !config.sharepoint.isConfigured()) {
    const missing = config.sharepoint.getMissingFields();
    errors.push(`SharePoint configuration incomplete. Missing: ${missing.join(', ')}`);
  }
  
  // Validate port
  if (isNaN(config.port) || config.port < 1 || config.port > 65535) {
    errors.push('Invalid PORT value. Must be a number between 1 and 65535.');
  }
  
  // Environment-specific validations
  if (config.nodeEnv === 'production') {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.includes('your-super-secret-jwt-key')) {
      errors.push('JWT_SECRET must be set to a strong, random value in production.');
    }
  }
  
  if (errors.length > 0) {
    console.error('❌ Environment configuration errors:');
    errors.forEach(error => console.error(`   - ${error}`));
    
    if (config.nodeEnv === 'production') {
      console.error('Exiting due to configuration errors in production.');
      process.exit(1);
    } else {
      console.warn('⚠️  Continuing with warnings in development mode.');
    }
  } else {
    console.log('✅ Environment configuration validated successfully');
  }
}

// Helper to log configuration (without secrets)
export function logConfiguration() {
  if (!config.logging.enableDebug) return;
  
  console.log('📋 Application Configuration:');
  console.log(`   Environment: ${config.nodeEnv}`);
  console.log(`   Port: ${config.port}`);
  console.log(`   Data Client: ${config.dataClient}`);
  console.log(`   SharePoint Configured: ${config.sharepoint.isConfigured() ? '✅' : '❌'}`);
  console.log(`   Frontend URL: ${config.frontend.url}`);
  console.log(`   Log Level: ${config.logging.level}`);
}