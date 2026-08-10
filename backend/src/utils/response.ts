export const sendSuccess = (res: any, data: any, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
  });
};

export const sendError = (res: any, message: string, statusCode = 400) => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};
