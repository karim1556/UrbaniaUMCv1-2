const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'urbania',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        transformation: [{ width: 800, height: 600, crop: 'fit' }]
    }
});

// Upload file to Cloudinary
const uploadToCloudinary = async (file) => {
    try {
        const result = await cloudinary.uploader.upload(file.path, {
            folder: 'urbania',
            allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
            transformation: [{ width: 800, height: 600, crop: 'fit' }]
        });

        return {
            public_id: result.public_id,
            url: result.secure_url
        };
    } catch (error) {
        throw new Error('Error uploading file to Cloudinary: ' + error.message);
    }
};

// Delete file from Cloudinary
const deleteFromCloudinary = async (public_id) => {
    try {
        await cloudinary.uploader.destroy(public_id);
    } catch (error) {
        throw new Error('Error deleting file from Cloudinary: ' + error.message);
    }
};

module.exports = {
    uploadToCloudinary,
    deleteFromCloudinary,
    storage
}; 