const logger = require('./logger');

/**
 * Utility functions for Lambda handlers
 */

// Create consistent HTTP response
exports.createResponse = (statusCode, body) => ({
  statusCode,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(body),
});

// Error response helper
exports.errorResponse = (statusCode, message, errorDetails = null) => {
  const response = {
    status: 'error',
    message,
  };

  if (errorDetails && process.env.NODE_ENV !== 'production') {
    response.error = errorDetails;
  }

  logger.error(`Error response: ${message}`, { statusCode, errorDetails });

  return exports.createResponse(statusCode, response);
};

// Success response helper
exports.successResponse = (data, statusCode = 200) => {
  logger.info('Success response', { statusCode, data });
  return exports.createResponse(
    statusCode,
    {
      status: 'success',
      data,
    }
  );
};

// Validate request body against schema
exports.validateRequest = (schema, body) => {
  try {
    const data = typeof body === 'string' ? JSON.parse(body) : body;
    const { error, value } = schema.validate(data, { abortEarly: false });

    if (error) {
      logger.warn('Validation failed', { errors: error.details.map((detail) => detail.message) });
      return {
        isValid: false,
        errors: error.details.map((detail) => detail.message),
        value: null,
      };
    }

    logger.info('Validation succeeded', { value });
    return {
      isValid: true,
      errors: null,
      value,
    };
  } catch (error) {
    logger.error('Invalid JSON format', { error: error.message });
    return {
      isValid: false,
      errors: ['Invalid JSON format'],
      value: null,
    };
  }
};

// Parse event for Lambda function
exports.parseEvent = (event) => {
  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const pathParameters = event.pathParameters || {};
    const queryStringParameters = event.queryStringParameters || {};
    const headers = event.headers || {};

    logger.info('Parsed event successfully', { body, pathParameters, queryStringParameters, headers });

    return {
      body,
      pathParameters,
      queryStringParameters,
      headers,
    };
  } catch (error) {
    logger.error('Error parsing event', { error: error.message });
    throw new Error('Error parsing event');
  }
};

// Logger with request ID
exports.logger = (requestId) => ({
  info: (message, data = {}) => {
    console.info(JSON.stringify({
      level: 'INFO',
      requestId,
      message,
      ...data,
      timestamp: new Date().toISOString(),
    }));
  },
  error: (message, error = {}, data = {}) => {
    console.error(JSON.stringify({
      level: 'ERROR',
      requestId,
      message,
      error: error.message || error,
      stack: error.stack,
      ...data,
      timestamp: new Date().toISOString(),
    }));
  },
  warn: (message, data = {}) => {
    console.warn(JSON.stringify({
      level: 'WARN',
      requestId,
      message,
      ...data,
      timestamp: new Date().toISOString(),
    }));
  },
  debug: (message, data = {}) => {
    if (process.env.DEBUG) {
      console.debug(JSON.stringify({
        level: 'DEBUG',
        requestId,
        message,
        ...data,
        timestamp: new Date().toISOString(),
      }));
    }
  },
});