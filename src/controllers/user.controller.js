import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiErrors.js'; // Importing ApiError for error handling
import { User } from '../models/user.models.js';
import { uploadONCloudinary } from '../utils/cloudinary_service.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const registerUser = asyncHandler(async (req, res) => {
  console.log('Register user endpoint hit');
  console.log('Request body:', req.body);

  res.status(200).json({
    success: true,
    message: 'User registration endpoint working!',
    data: req.body,
  });

  // STEPS TO REGISTER A USER

  // 1. GET USER DETAILS FROM FRONTEND
  // 2. VALIDATE USER DETAILS - NOT EMPTY, VALID EMAIL, ETC.
  // 3. CHECK IF USER ALREADY EXISTS : USERNAME OR EMAIL
  // 4. CHECK FOR IMAGE, CHECK FOR AVATAR
  // 5. UPLOAD TO CLOUDINARY, AVATAR
  // 6. CREATE USER-OBJECT TO BE STORED IN DATABASE- CREATE ENTRY IN DB
  // 7. SEND RESPONSE BACK TO FRONTEND - SUCCESS OR FAILURE
  // 8. REMOVE PASSWORD AND REFRESH TOKEN FIELD FROM RESPONSE (NOT ALLOWING USER TO SEE THESE FIELDS)
  // 9. CHECK FOR USER CREATION SUCCESS OR FAILURE
  // 10. IF SUCCESS, RETURN RESPONSE WITH USER DETAILS (EXCLUDING PASSWORD AND REFRESH TOKEN)
  // 11. IF FAILURE, RETURN ERROR MESSAGE

  // 1. GET USER DETAILS FROM FRONTEND :
  const { fullName, email, password, username } = req.body;
  console.log('User details from request body:', {
    fullName,
    email,
    password,
    username,
  });

  // 2. Validation :

  // if (fullName === "") {
  //   throw new ApiError(400,"FULL NAME IS REQUIRED")
  // }
  // ALTERNATE :

  if (
    [fullName, email, password, username, password].some(
      (field) => field?.trim() === ''
    )
  ) {
    throw new ApiError(400, 'All fields are required');
  }

  // 3. CHECK IF USER ALREADY EXISTS : USERNAME OR EMAIL :
  const existedUser = User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, 'Username or Email Already exists');
  }

  // 4. CHECK FOR IMAGE, CHECK FOR AVATAR
  const avatarLocalPath = req.files?.avatar[0]?.path;
  console.log(req.files);
  const coverImageLocalPath = req.files?.coverImage[0]?.path;
  if (avatarLocalPath) {
    throw new ApiError(400, 'Avatar is Required');
  }

  // 5. UPLOAD TO CLOUDINARY, AVATAR :
  const avatar = await uploadONCloudinary(avatarLocalPath);
  const coverImage = await uploadONCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, 'Avatar upload failed');
  }

  // 6. CREATE USER-OBJECT TO BE STORED IN DATABASE- CREATE ENTRY IN DB :
  const user = await User.create({
    fullName,
    email,
    password,
    username: username.toLowerCase(),
    avatar: avatar.url,
    coverImage: coverImage?.url || ' ',
  });
  const createdUser = await user.findById(user._id).select(
    '-password -refreshToken'
  );
  if (!createdUser) {
    throw new ApiError(500, 'Something went wrong while creating user');
  }
});

// 10. IF SUCCESS, RETURN RESPONSE WITH USER DETAILS (EXCLUDING PASSWORD AND REFRESH TOKEN) :
return res.status(201).json(
  new ApiResponse(200,createdUser,"User registered succesfully")
)

export { registerUser };
