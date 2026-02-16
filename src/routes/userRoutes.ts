import express from "express";
import { registerUser,loginUser,getProfile, sendOTP, verifyOTP, resetPassword } from "../controllers/userController";
import { protect } from "../middlewares/authMiddleware";
//import passport from "passport";
import { ensureAuthenticated } from "../middlewares/ensureAuthenticated";
import { sendContact } from "../controllers/contactController";
import { contactLimiter } from "../middlewares/rateLimiter";

const router=express.Router();


router.get("/test", (req, res) => {
  res.send("USER ROUTE WORKS");
});


router.post("/sendotp",sendOTP);
router.post("/register",registerUser);  
router.post("/verify-otp",verifyOTP);  
router.post("/reset-password",resetPassword);  
// router.get('/auth/google',passport.authenticate('google',{scope:['profile','email']}));

// router.get('/auth/google/callback',passport.authenticate('google',{failureRedirect:'/'}),(req,res)=>{
//     res.redirect('/');
// });


router.post("/login",loginUser);
router.get("/profile",protect,getProfile)
router.post("/contact",contactLimiter,sendContact);
export default router;