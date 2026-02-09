"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const contactController_1 = require("../controllers/contactController");
const rateLimiter_1 = require("../middlewares/rateLimiter");
const router = express_1.default.Router();
router.get("/test", (req, res) => {
    res.send("USER ROUTE WORKS");
});
router.post("/sendotp", userController_1.sendOTP);
router.post("/register", userController_1.registerUser);
// router.get('/auth/google',passport.authenticate('google',{scope:['profile','email']}));
// router.get('/auth/google/callback',passport.authenticate('google',{failureRedirect:'/'}),(req,res)=>{
//     res.redirect('/');
// });
router.post("/login", userController_1.loginUser);
router.get("/profile", authMiddleware_1.protect, userController_1.getProfile);
router.post("/contact", rateLimiter_1.contactLimiter, contactController_1.sendContact);
exports.default = router;
