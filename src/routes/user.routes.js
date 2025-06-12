import { Router } from 'express';
import { registerUser } from '../controllers/user.controller.js';
import { upload } from '../middlewares/multer.middleware.js'; // Importing upload for handling file uploads if needed

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

export default router; // Export router, not userRouter
