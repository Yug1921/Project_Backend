import { Router } from 'express';
import { loginUser, registerUser, logoutUser } from '../controllers/user.controller.js';
import { upload } from '../middlewares/multer.middleware.js'; // Importing upload for handling file uploads if needed
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.route('/register').post(
  upload.fields([
    {
      name: 'avatar',
      maxCount: 1, // Limit to one avatar image
    },
    {
      name: 'coverImage',
      maxCount: 1, // Limit to one cover image
    },
  ]),
  registerUser
);
// eg: http://localhost:8000/api/v1/users/register

router.route('/login').post(loginUser)  

//secure routes
router.route('logout').post(verifyJWT, logoutUser)

export default router; // Export router, not userRouter
