import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiErrors.js';
import { User } from '../models/user.models.js';
import { uploadOnCloudinary } from '../utils/cloudinary_service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import jwt from 'jsonwebtoken';

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      'Something went worng while generating access and refresh token'
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  console.log('Register user endpoint hit');
  console.log('Request body:', req.body);

  // REMOVE THIS EARLY RETURN - This was preventing the actual registration logic from running
  // res.status(200).json({
  //   success: true,
  //   message: "User registration endpoint working!",
  //   data: req.body,
  // });

  // 1. GET USER DETAILS FROM FRONTEND - REMOVE AWAIT FROM req.body
  const { fullName, email, password, username } = req.body;
  console.log('User details from request body:', {
    fullName,
    email,
    password,
    username,
  });

  // 2. Validation - FIX: Remove duplicate password in array
  if (
    [fullName, email, password, username].some((field) => field?.trim() === '')
  ) {
    throw new ApiError(400, 'All fields are required');
  }

  // 3. CHECK IF USER ALREADY EXISTS
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, 'Username or Email Already exists');
  }

  // 4. CHECK FOR IMAGE, CHECK FOR AVATAR
  console.log('Files received:', req.files);

  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  console.log('Avatar path:', avatarLocalPath);
  console.log('Cover image path:', coverImageLocalPath);

  if (!avatarLocalPath) {
    throw new ApiError(400, 'Avatar file is required');
  }

  if (!coverImageLocalPath) {
    throw new ApiError(400, 'Cover image file is required');
  }

  // 5. UPLOAD TO CLOUDINARY
  console.log('Uploading avatar...');
  const avatar = await uploadOnCloudinary(avatarLocalPath);

  console.log('Uploading cover image...');
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  console.log('Avatar upload result:', avatar);
  console.log('Cover image upload result:', coverImage);

  if (!avatar) {
    throw new ApiError(400, 'Failed to upload avatar');
  }

  if (!coverImage) {
    throw new ApiError(400, 'Failed to upload cover image');
  }

  // 6. CREATE USER IN DATABASE
  const user = await User.create({
    fullName,
    email,
    password,
    username: username.toLowerCase(),
    avatar: avatar.url,
    coverImage: coverImage?.url || '',
  });

  // 7. FIX: Use User model, not user instance
  const createdUser = await User.findById(user._id).select(
    '-password -refreshToken'
  );

  if (!createdUser) {
    throw new ApiError(500, 'Something went wrong while creating user');
  }

  // 8. RETURN SUCCESS RESPONSE
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, 'User registered successfully'));
});

const loginUser = asyncHandler(async (req, res) => {
  // req body -> data
  // check username or email
  // find the username
  // password check
  // generate access and refresh token
  // send cookies

  const { email, username, password } = req.body;

  if (!username && !email) {
    throw new ApiError(400, 'Username or email is required');
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, 'User does not exists');
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(404, 'Password is incorrect');
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    '-password -refreshToken'
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie('accessToken', accessToken, options)
    .cookie('refreshToken', refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        'User logged in successfully'
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  try {
    console.log('Logout request for user:', req.user?._id);

    // Steps :
    // Remove Cookies
    // Remove Tokens (Access/Refresh Tokens)
    await User.findByIdAndUpdate(
      req.user._id,
      {
        $unset: { refreshToken: 1 }, // Use $unset instead of $set with undefined
      },
      {
        new: true,
      }
    );

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Only secure in production
      sameSite: 'lax', // Added sameSite for better CORS handling
      path: '/', // Ensure path matches login cookies
    };

    console.log('User logged out successfully:', req.user._id);

    return res
      .status(200)
      .clearCookie('accessToken', options)
      .clearCookie('refreshToken', options)
      .json(new ApiResponse(200, {}, 'User logged out successfully'));
  } catch (error) {
    console.log('Logout error:', error);
    throw new ApiError(500, 'Error during logout process');
  }
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(
      401,
      'Unauthorized Request - No Incoming refresh token!'
    );
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
  
    const user = await User.findById(decodedToken?._id);
  
    if (!user) {
      throw new ApiError(401, 'Invalid refresh token!');
    }
  
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, 'Refresh token is expired or used (Invalid)!');
    }
  
    const options = {
      httpOnly: true,
      secure: true,
    };
  
    const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(
      user._id
    );
  
    return res
      .status(200)
      .cookie('accessToken', accessToken, options)
      .cookie('refreshToken', newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          'Access Token Refreshed'
        )
      );
  } catch (error) {
    throw new ApiError(401,error._message || "Invalid refresh token!");
  }

});

export { registerUser, loginUser, logoutUser, refreshAccessToken };
