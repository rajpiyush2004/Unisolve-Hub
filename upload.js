const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { cloudinary } = require('./cloudConfig');

const resourceStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'resource-files',
    format: async (req, file) => {
      if (file.mimetype !== 'application/pdf') {
        throw new Error('Only PDF files are allowed');
      }
      return 'pdf';
    },
    public_id: (req, file) => file.originalname.split('.')[0],
    resource_type: 'raw', // Ensure Cloudinary treats it as a file, not an image
  },
});

const upload = multer({ storage: resourceStorage });

module.exports = upload;
