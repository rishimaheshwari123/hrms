const {uploadImageToCloudinary} = require("../config/imageUploader")
const fs = require('fs');

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

exports.imageUpload = async(req,res)=>{
    try{
    const {thumbnail} = req.files 
    if (!thumbnail) {
      return res.status(400).json({ success: false, message: "No file provided" });
    }

    if (!ALLOWED_MIME.includes(thumbnail.mimetype)) {
      return res.status(415).json({ success: false, message: "Unsupported file type" });
    }
    if (thumbnail.size > MAX_SIZE_BYTES) {
      return res.status(413).json({ success: false, message: "File too large" });
    }

    const folder = process.env.FOLDER_NAME || "hrms/dev";

    const thumbnailImage = await uploadImageToCloudinary(
        thumbnail,
        folder
      )

      res.status(200).json({
        success:true,
        message:"Image upload successfully",
        thumbnailImage
      })


    }catch(error){
      console.error('Image upload error:', error);
      res.status(500).json({ success: false, message: 'Image upload failed', error });
    }
}

exports.uploadImages = async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ success: false, message: 'No files were uploaded.' });
    }
    const files = req.files.thumbnail; // Assumes files are uploaded with the name 'thumbnail'
    const urls = [];

    const fileArray = Array.isArray(files) ? files : [files];

    for (const file of fileArray) {
      if (!ALLOWED_MIME.includes(file.mimetype)) {
        return res.status(415).json({ success: false, message: "Unsupported file type" });
      }
      if (file.size > MAX_SIZE_BYTES) {
        return res.status(413).json({ success: false, message: "File too large" });
      }
      const folder = process.env.FOLDER_NAME || "hrms/dev";
      const newpath = await uploadImageToCloudinary(file, folder);
      urls.push(newpath);
      fs.unlinkSync(file.tempFilePath);
    }

    res.status(200).json({
      success: true,
      message: 'Images uploaded successfully',
      images: urls
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ success: false, message: 'Image upload failed', error });
  }
};