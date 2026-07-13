import * as log from '../logger/index.js';

export function errorHandler(err, req, res, _next) {
  log.error(`Unhandled error: ${err.message}`);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    error: err.message || 'Internal server error',
  });
}

export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
  });
}