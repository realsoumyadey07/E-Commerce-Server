"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const mongoose_1 = __importStar(require("mongoose"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const userSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, "Name is required!"],
        trim: true,
    },
    email: {
        type: String,
        required: [true, "Email is required!"],
        unique: true,
        trim: true,
        validate: {
            validator: function (value) {
                return emailRegex.test(value);
            },
            message: "Invalid email format!",
        },
    },
    password: {
        type: String,
        required: [true, "Password is required!"],
    },
    role: {
        type: String,
        default: "user",
        enum: ["user", "admin"],
    },
    refresh_token: {
        type: String,
    },
}, { timestamps: true });
userSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.isModified("password")) {
            next();
        }
        this.password = yield bcrypt_1.default.hash(this.password, 10);
    });
});
userSchema.methods.comparePassword = function (enteredPassword) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield bcrypt_1.default.compare(enteredPassword, this.password);
    });
};
userSchema.methods.signAccessToken = function () {
    return jsonwebtoken_1.default.sign({
        id: this._id,
    }, process.env.ACCESS_TOKEN);
};
userSchema.methods.signRefreshToken = function () {
    return jsonwebtoken_1.default.sign({
        id: this._id,
    }, process.env.REFRESH_TOKEN);
};
exports.User = mongoose_1.default.models.User || mongoose_1.default.model("User", userSchema);
