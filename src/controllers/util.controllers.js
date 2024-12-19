import { asyncHandler } from "../utils/asyncHandler.js";

export const fileUpload = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No File Uploaded" });
  const fileUrl = await uploadToCloudinary(req.file.path);

  if (fileUrl) {
    return res.status(200).json({ url: fileUrl.url });
  }
  return res.status(500).json({ message: "Failed to upload" });
});
