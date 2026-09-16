/**
 * Global Error Handling Middleware for Express
 */
function errorHandler(err, req, res, next) {
  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err.message || err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    error: err.name || 'API Error',
    message: message
  });
}

module.exports = errorHandler;
