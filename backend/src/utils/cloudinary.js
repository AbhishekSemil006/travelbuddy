import { v2 as cloudinary } from 'cloudinary';
import { AppError } from './appError.js';

/**
 * Ensure Cloudinary is configured with the latest env vars.
 * Called lazily (at upload time) so that dotenv has already loaded.
 */
const ensureConfigured = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
};

/**
 * Uploads a file buffer to Cloudinary and returns the result
 * @param {Buffer} buffer - The file buffer to upload
 * @param {string} folder - The folder in Cloudinary
 * @returns {Promise<Object>} - The Cloudinary upload result
 */
export const uploadToCloudinary = (buffer, folder = 'travelbuddy_ids') => {
  return new Promise((resolve, reject) => {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.warn('WARNING: Missing Cloudinary credentials. Returning dummy image URL for local testing.');
      return resolve({
        secure_url: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg'
      });
    }

    // Configure with real credentials right before uploading
    ensureConfigured();

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
