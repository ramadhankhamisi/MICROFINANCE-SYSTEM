export const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
};

export const sendError = (res, message = 'Error', statusCode = 500, errors = null) => {
  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
    timestamp: new Date().toISOString(),
  });
};

export const sendPaginatedSuccess = (
  res,
  data,
  pagination,
  message = 'Success',
  statusCode = 200
) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
    pagination,
    timestamp: new Date().toISOString(),
  });
};
