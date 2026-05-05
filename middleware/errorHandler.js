// middleware/errorHandler.js

function errorHandler(err, req, res, next) {
  console.error(`[ERROR] ${err.message}`);

  const statusCode = err.statusCode || err.status || 500;
  const message =
    statusCode === 500 ? "An internal server error occurred." : err.message;

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
}

module.exports = errorHandler;
