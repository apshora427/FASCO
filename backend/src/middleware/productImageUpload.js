import multer from "multer";
import { ApiError } from "../utils/ApiError.js";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export const productImageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter(_req, file, callback) {
    if (!allowedTypes.has(file.mimetype)) {
      callback(new ApiError(400, "Upload a JPEG, PNG, or WebP image"));
      return;
    }
    callback(null, true);
  },
});
