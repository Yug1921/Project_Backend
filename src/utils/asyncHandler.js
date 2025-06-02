// const asyncHandeler = (fun) => async (req, res, next) => {
//   try {
//   } catch (error) {
//     res
//       .status(err.code || 500)
//       .json({ success: false, message: error.message });
//   }
// };

// second method
const asyncHandeler = (requestHandler)=>{
    (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => {
            next(err);
        });
    }
}

export { asyncHandeler };
 