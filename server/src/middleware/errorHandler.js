export function globalErrorHandler(err, req, res, next) {
  console.error("Global Error Handler caught:", err);
  
  const status = err.statusCode || 500;
  const message = err.message || "An unexpected emergency app error occurred. Please try again.";
  
  res.status(status).json({
    error: message,
    status: status,
    timestamp: new Date().toISOString()
  });
}
