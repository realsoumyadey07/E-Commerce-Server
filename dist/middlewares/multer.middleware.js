"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./public/temp"); // temp folder in your project
    },
    filename: (req, file, cb) => {
        // Get the file extension (.jpg, .png, etc.)
        const ext = path_1.default.extname(file.originalname);
        // Generate a random 12-char string
        const uniqueSuffix = crypto_1.default.randomBytes(6).toString("hex");
        // Clean original name (remove spaces & special chars)
        const safeName = path_1.default
            .basename(file.originalname, ext)
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "-");
        // Final filename: safeName-<timestamp>-<random>.ext
        cb(null, `${safeName}-${Date.now()}-${uniqueSuffix}${ext}`);
    },
});
// File filter (only allow image types)
const fileFilter = (req, file, cb) => {
    const ext = path_1.default.extname(file.originalname).toLowerCase();
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
    }
    else {
        cb(new Error("Only image files are allowed!"));
    }
};
exports.upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
});
