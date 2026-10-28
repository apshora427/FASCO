import crypto from "node:crypto";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ensureUploadsDirectory, uploadsDirectory } from "../utils/uploadStorage.js";

const detectImage = (buffer) => {
  if (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) return { mime: "image/jpeg", extension: "jpg" };
  if (
    buffer.length >= 8 &&
    buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  ) return { mime: "image/png", extension: "png" };
  if (
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) return { mime: "image/webp", extension: "webp" };
  return null;
};

export const uploadProductImage = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, "Choose an image to upload");
  const image = detectImage(req.file.buffer);
  if (!image || image.mime !== req.file.mimetype) {
    throw new ApiError(400, "Image content does not match its declared file type");
  }

  await ensureUploadsDirectory();
  const filename = `${crypto.randomUUID()}.${image.extension}`;
  await writeFile(join(uploadsDirectory, filename), req.file.buffer, { flag: "wx" });
  const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${filename}`;
  res.status(201).json({ success: true, message: "Image uploaded", imageUrl });
});
