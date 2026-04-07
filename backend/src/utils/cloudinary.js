import { v2 as cloudinary } from 'cloudinary';
import { AppError } from './appError.js';

// Configure cloudinary with dummy fallbacks if environment variables aren't set yet
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'test_cloud_name',
  api_key: process.env.CLOUDINARY_API_KEY || 'test_api_key',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'test_api_secret',
});

/**
 * Uploads a file buffer to Cloudinary and returns the result
 * @param {Buffer} buffer - The file buffer to upload
 * @param {string} folder - The folder in Cloudinary
 * @returns {Promise<Object>} - The Cloudinary upload result
 */
export const uploadToCloudinary = (buffer, folder = 'travelbuddy_ids') => {
  return new Promise((resolve, reject) => {
    // If we're missing the env vars, we might want to return a dummy URL for local testing
    // Or throw an error telling the user they forgot to add credentials.
    if (!process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME === 'test_cloud_name') {
      console.warn('WARNING: Missing Cloudinary credentials. Returning dummy image URL for local testing.');
      return resolve({
        secure_url: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg'
      });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          return reject(new AppError('Failed to upload image to Cloudinary', 500));
        }
        resolve(result);
      }
    );

    uploadStream.end(buffer);
  });
};
