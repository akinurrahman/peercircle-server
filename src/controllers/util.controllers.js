import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

export const fileUpload = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No File Uploaded" });
  }

  // Validate file type
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif"];
  if (!allowedMimeTypes.includes(req.file.mimetype)) {
    return res
      .status(400)
      .json({ message: "Invalid file type. Only images are allowed." });
  }

  // Validate file size (e.g., 5MB limit)
  const fileSizeLimit = 5 * 1024 * 1024; // 5MB
  if (req.file.size > fileSizeLimit) {
    return res
      .status(400)
      .json({ message: "File is too large. Maximum size allowed is 5MB." });
  }

  const fileUrl = await uploadToCloudinary(req.file.path);

  if (fileUrl) {
    return res.status(200).json({ url: fileUrl.url });
  }
  return res.status(500).json({ message: "Failed to upload" });
});

export const fileUploadMultiple = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: "No Files Uploaded" });
  }

  const fileUrls = [];
  for (let file of req.files) {
    const fileUrl = await uploadToCloudinary(file.path);
    if (fileUrl) {
      fileUrls.push(fileUrl.url);
    }
  }

  if (fileUrls.length > 0) {
    return res.status(200).json({ urls: fileUrls });
  }

  return res.status(500).json({ message: "Failed to upload" });
});
