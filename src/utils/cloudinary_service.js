import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs  ';

(async function () {
  // Configuration
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_API_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
});

const uploadONCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    // UPLOAD FILE ON CLOUDINARY
    const response = cloudinary.uploader.upload(localFilePath, {
      resource_type: 'auto',
    });
    // FILE HAS BEEN UPLOADED SUCCESSFULLY
    console.log('FILE IS UPLOADED IN CLOUDINARY',(await response).url);
    return response

  } catch (error) {
    fs.unlinkSync(localFilePath) // REMOVES THE LOCALLY SAVED TEMPERARY FILE AS THE UPLOAD OPERATION GOT FAILED 
    return null
  }
};

export {uploadONCloudinary}