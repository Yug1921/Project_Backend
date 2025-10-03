import { Router } from 'express';
import { loginUser, registerUser, logoutUser, refreshAccessToken, changeCurrentpassword, getCurrentUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage, getUserChannelProfile, getWatchHistory } from '../controllers/user.controller.js';
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
router.route("/logout").post(
  (req, res, next) => {
    console.log("Logout route hit")
    console.log("Cookies received:", req.cookies)
    console.log("Headers:", req.headers)
    next()
  },
  verifyJWT,
  logoutUser,
)

router.route("/refresh-token").post(refreshAccessToken)

router.route("/change-password").post(verifyJWT, changeCurrentpassword)

router.route("/current-user").get(verifyJWT, getCurrentUser)

router.route("/update-accounts").patch(verifyJWT, updateAccountDetails)

router.route("/avatar").patch(verifyJWT,upload.single("avatar"), updateUserAvatar)

router.route("/cover-image").patch(verifyJWT,upload.single("/coverImage"), updateUserCoverImage)

router.route("/c/:username").get(verifyJWT, getUserChannelProfile)

router.route("/history").get(verifyJWT,getWatchHistory)

export default router; // Export router, not userRouter
