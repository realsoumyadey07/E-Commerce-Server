"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const error_middleware_1 = require("./middlewares/error.middleware");
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const db_1 = __importDefault(require("./utils/db"));
const category_routes_1 = __importDefault(require("./routes/category.routes"));
const product_routes_1 = __importDefault(require("./routes/product.routes"));
const cart_routes_1 = __importDefault(require("./routes/cart.routes"));
const address_route_1 = __importDefault(require("./routes/address.route"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 8000;
const allowedOrigins = process.env.NODE_ENV === "production"
    ? [process.env.FRONTEND_URL]
    : [process.env.FRONTEND_URL_LOCAL];
// app configuration
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true
}));
// demo routing
app.get("/", (req, res) => {
    return res.json({
        serverStatus: "Running",
        message: "Server is running 👋",
    });
});
// routes
app.use("/api/v1/user", user_routes_1.default);
app.use("/api/v1/category", category_routes_1.default);
app.use("/api/v1/product", product_routes_1.default);
app.use("/api/v1/cart", cart_routes_1.default);
app.use("/api/v1/address", address_route_1.default);
// Works in Express 5
app.all(/.*/, (req, res, next) => {
    const err = new Error(`Route ${req.originalUrl} is not found`);
    err.statusCode = 404;
    next(err);
});
app.use(error_middleware_1.ErrorMiddleware);
(0, db_1.default)().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on: ${PORT}`);
    });
}).catch((err) => {
    console.log("❌ Db connection failed!", err);
});
