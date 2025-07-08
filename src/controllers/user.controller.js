import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiErrors.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary_service.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  console.log("Register user endpoint hit");
  console.log("Request body:", req.body);

  // REMOVE THIS EARLY RETURN - This was preventing the actual registration logic from running
  // res.status(200).json({
  //   success: true,
  //   message: "User registration endpoint working!",
  //   data: req.body,
  // });

  // 1. GET USER DETAILS FROM FRONTEND - REMOVE AWAIT FROM req.body
  const { fullName, email, password, username } = req.body;
  console.log("User details from request body:", {
    fullName,
    email,
    password,
    username,
  });

  // 2. Validation - FIX: Remove duplicate password in array
  if (
    [fullName, email, password, username].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // 3. CHECK IF USER ALREADY EXISTS
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "Username or Email Already exists");
  }

  // 4. CHECK FOR IMAGE, CHECK FOR AVATAR
   console.log("Files received:", req.files)

  const avatarLocalPath = req.files?.avatar?.[0]?.path
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path

  console.log("Avatar path:", avatarLocalPath)
  console.log("Cover image path:", coverImageLocalPath)

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required")
  }

  if (!coverImageLocalPath) {
    throw new ApiError(400, "Cover image file is required")
  }

  // 5. UPLOAD TO CLOUDINARY
  console.log("Uploading avatar...")
  const avatar = await uploadOnCloudinary(avatarLocalPath)

  console.log("Uploading cover image...")
  const coverImage = await uploadOnCloudinary(coverImageLocalPath)

  console.log("Avatar upload result:", avatar)
  console.log("Cover image upload result:", coverImage)

  if (!avatar) {
    throw new ApiError(400, "Failed to upload avatar")
  }

  if (!coverImage) {
    throw new ApiError(400, "Failed to upload cover image")
  }


  // 6. CREATE USER IN DATABASE
  const user = await User.create({
    fullName,
    email,
    password,
    username: username.toLowerCase(),
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  });

  // 7. FIX: Use User model, not user instance
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while creating user");
  }

  // 8. RETURN SUCCESS RESPONSE
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

export { registerUser };
