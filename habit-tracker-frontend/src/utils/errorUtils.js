// Enhanced error handling utilities for better user experience

/**
 * Extracts user-friendly error messages from various error types
 * @param {Error|Object} error - The error object from API calls or other sources
 * @returns {string} - User-friendly error message
 */
export const getErrorMessage = (error) => {
  // Handle axios/API errors
  if (error?.response) {
    const status = error.response.status;
    const message = error.response.data?.message || error.response.data?.error;
    
    switch (status) {
      case 400:
        return message || 'Invalid request. Please check your input and try again.';
      case 401:
        return 'Your session has expired. Please log in again.';
      case 403:
        return 'You don\'t have permission to perform this action.';
      case 404:
        return 'The requested item could not be found. It may have been deleted.';
      case 409:
        return message || 'A conflict occurred. This item may already exist.';
      case 422:
        return message || 'Invalid data provided. Please check your input.';
      case 429:
        return 'Too many requests. Please wait a moment and try again.';
      case 500:
        return 'Server error occurred. Please try again in a moment.';
      case 502:
      case 503:
      case 504:
        return 'Service temporarily unavailable. Please try again later.';
      default:
        return message || `An unexpected error occurred (${status}). Please try again.`;
    }
  }
  
  // Handle network errors
  if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('Network Error')) {
    return 'Network connection issue. Please check your internet connection and try again.';
  }
  
  // Handle timeout errors
  if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
    return 'Request timed out. Please check your connection and try again.';
  }
  
  // Handle specific application errors
  if (error?.message) {
    // Check for SharePoint-specific errors that we enhanced in the backend
    if (error.message.includes('already exists')) {
      return error.message; // Use our enhanced backend message
    }
    if (error.message.includes('Insufficient permissions')) {
      return error.message; // Use our enhanced backend message
    }
    if (error.message.includes('Invalid habit data')) {
      return error.message; // Use our enhanced backend message
    }
    
    // Generic message improvements
    if (error.message.includes('Failed to fetch')) {
      return 'Unable to connect to the server. Please check your internet connection.';
    }
    
    return error.message;
  }
  
  // Fallback for unknown errors
  return 'An unexpected error occurred. Please try again.';
};

/**
 * Determines if an error is likely temporary and worth retrying
 * @param {Error|Object} error - The error object
 * @returns {boolean} - Whether the error is retryable
 */
export const isRetryableError = (error) => {
  if (error?.response) {
    const status = error.response.status;
    // Retry on server errors and rate limiting, but not on client errors
    return status >= 500 || status === 429 || status === 408;
  }
  
  // Retry on network and timeout errors
  return error?.code === 'NETWORK_ERROR' || 
         error?.code === 'ECONNABORTED' ||
         error?.message?.includes('Network Error') ||
         error?.message?.includes('timeout') ||
         error?.message?.includes('Failed to fetch');
};

/**
 * Enhanced error notification types for better UX
 */
export const ErrorTypes = {
  NETWORK: 'network',
  VALIDATION: 'validation',
  PERMISSION: 'permission',
  NOT_FOUND: 'not_found',
  SERVER: 'server',
  GENERIC: 'generic'
};

/**
 * Categorizes errors for better UI handling
 * @param {Error|Object} error - The error object
 * @returns {string} - Error category from ErrorTypes
 */
export const categorizeError = (error) => {
  if (error?.response) {
    const status = error.response.status;
    
    if (status === 401 || status === 403) return ErrorTypes.PERMISSION;
    if (status === 404) return ErrorTypes.NOT_FOUND;
    if (status === 400 || status === 422) return ErrorTypes.VALIDATION;
    if (status >= 500) return ErrorTypes.SERVER;
  }
  
  if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('Network Error')) {
    return ErrorTypes.NETWORK;
  }
  
  return ErrorTypes.GENERIC;
};

/**
 * Gets appropriate icon for error type
 * @param {string} errorType - Error type from ErrorTypes
 * @returns {string} - Emoji icon for the error type
 */
export const getErrorIcon = (errorType) => {
  switch (errorType) {
    case ErrorTypes.NETWORK:
      return '🌐';
    case ErrorTypes.VALIDATION:
      return '⚠️';
    case ErrorTypes.PERMISSION:
      return '🔒';
    case ErrorTypes.NOT_FOUND:
      return '🔍';
    case ErrorTypes.SERVER:
      return '🔧';
    default:
      return '❌';
  }
};

/**
 * Creates a retry function with exponential backoff
 * @param {Function} fn - The function to retry
 * @param {number} maxAttempts - Maximum number of retry attempts (default: 3)
 * @param {number} baseDelay - Base delay in milliseconds (default: 1000)
 * @returns {Function} - Function that implements retry logic
 */
export const withRetry = (fn, maxAttempts = 3, baseDelay = 1000) => {
  return async (...args) => {
    let lastError;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn(...args);
      } catch (error) {
        lastError = error;
        
        // Don't retry if it's not a retryable error or if it's the last attempt
        if (!isRetryableError(error) || attempt === maxAttempts) {
          throw error;
        }
        
        // Exponential backoff: baseDelay * 2^(attempt-1)
        const delay = baseDelay * Math.pow(2, attempt - 1);
        console.log(`Retry attempt ${attempt}/${maxAttempts} in ${delay}ms...`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  };
};