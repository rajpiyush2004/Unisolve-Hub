const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
})

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'unisolve_DEV',
      allowed_formats: ["png", "jpeg", "jpg","webp","pdf"],
    },
  });

  const storageProfile = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'UniSolveHub/Profiles',
      allowed_formats: ['jpg', 'jpeg', 'png'],
    },
  });

  const resourceStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'unisolve/resources',
        allowed_formats: ["pdf", "png", "jpg", "jpeg"],
    },
});

  module.exports = {
    cloudinary,storage,storageProfile,
    resourceStorage
  };