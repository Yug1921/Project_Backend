// const asyncHandeler = (fun) => async (req, res, next) => {
//   try {
//   } catch (error) {
//     res
//       .status(err.code || 500)
//       .json({ success: false, message: error.message });
//   }
// };

// second method
const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
  }
}

export { asyncHandler }

