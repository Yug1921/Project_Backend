import { v2 as cloudinary } from "cloudinary"
import fs from "fs"

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_API_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,  
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null

    // Check if file exists before uploading
    if (!fs.existsSync(localFilePath)) {
      console.log("File does not exist:", localFilePath)
      return null
    }

    // UPLOAD FILE ON CLOUDINARY
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    })

    // FILE HAS BEEN UPLOADED SUCCESSFULLY
    console.log("FILE IS UPLOADED IN CLOUDINARY", response.url)

    // Clean up the local file after successful upload
    fs.unlinkSync(localFilePath)

    return response
  } catch (error) {
    console.error("Cloudinary upload error:", error)

    // Remove the locally saved temporary file if upload failed
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath)
    }

    return null
  }
}

export { uploadOnCloudinary }
