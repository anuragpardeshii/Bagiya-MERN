class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
const asyncRoute = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success)
    return res.status(400).json({
      message: 'Please check the submitted fields',
      fields: result.error.flatten().fieldErrors,
    });
  req.body = result.data;
  next();
};
function pagination(query) {
  const page = Number(query.page || 1),
    limit = Number(query.limit || 20);
  if (
    !Number.isInteger(page) ||
    page < 1 ||
    page > 10000 ||
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > 100
  )
    throw new HttpError(400, 'Invalid pagination');
  return { page, limit, skip: (page - 1) * limit };
}
function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);
  let status = err.status || 500,
    message = err.message;
  if (err.code === 11000) {
    status = 409;
    message =
      'This record already exists or the operation is already in progress';
  }
  if (err.name === 'CastError' || err.name === 'ValidationError') {
    status = 400;
    message = 'Invalid request data';
  }
  if (status >= 500) {
    console.error(
      JSON.stringify({
        event: 'request_failed',
        requestId: req.requestId,
        type: err.name,
      }),
    );
    message = 'Something went wrong. Please try again.';
  }
  res.status(status).json({ message, requestId: req.requestId });
}
module.exports = { HttpError, asyncRoute, validate, pagination, errorHandler };
