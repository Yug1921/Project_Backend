import { User } from "../models/user.models.js"
import { ApiError } from "../utils/ApiErrors.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import jwt from "jsonwebtoken"

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "") ||
      req.headers?.authorization?.replace("Bearer ", "")

    console.log("Token received:", token ? "Token present" : "No token found")
    console.log("Cookies:", req.cookies)
    console.log("Authorization header:", req.header("Authorization"))

    if (!token) {
      throw new ApiError(401, "Unauthorized request - No token provided")
    }

    let decodedToken
    try {
      decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    } catch (jwtError) {
      console.log("JWT verification error:", jwtError.message)
      throw new ApiError(401, "Invalid or expired token")
    }

    const user = await User.findById(decodedToken?._id).select("-password -refreshToken")

    if (!user) {
      throw new ApiError(401, "Invalid Access Token - User not found")
    }

    req.user = user
    next()
  } catch (error) {
    console.log("Auth middleware error:", error.message)
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(401, error?.message || "Invalid Access Token")
  }
})
