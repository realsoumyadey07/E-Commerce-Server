import multer, { FileFilterCallback } from "multer";
import path from "path";
import crypto from "crypto";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/temp"); // temp folder in your project
  },
  filename: (req, file, cb) => {
    // Get the file extension (.jpg, .png, etc.)
    const ext = path.extname(file.originalname);

    // Generate a random 12-char string
    const uniqueSuffix = crypto.randomBytes(6).toString("hex");

    // Clean original name (remove spaces & special chars)
    const safeName = path
      .basename(file.originalname, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-");

    // Final filename: safeName-<timestamp>-<random>.ext
    cb(null, `${safeName}-${Date.now()}-${uniqueSuffix}${ext}`);
  },
});

// File filter (only allow image types)
const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExt = [".jpeg", ".jpg", ".png", ".webp", ".gif"];
  const allowedMime = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
  ];

  if (allowedExt.includes(ext) && allowedMime.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});
