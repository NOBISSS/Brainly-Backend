import express from "express";
import { registerUser,loginUser,getProfile, sendOTP } from "../controllers/userController";
import { protect } from "../middlewares/authMiddleware";
//import passport from "passport";
import { ensureAuthenticated } from "../middlewares/ensureAuthenticated";

const router=express.Router();


router.get("/test", (req, res) => {
  res.send("USER ROUTE WORKS");
});


router.post("/sendotp",sendOTP);
router.post("/register",registerUser);  
// router.get('/auth/google',passport.authenticate('google',{scope:['profile','email']}));

// router.get('/auth/google/callback',passport.authenticate('google',{failureRedirect:'/'}),(req,res)=>{
//     res.redirect('/');
// });


router.post("/login",loginUser);
router.get("/profile",protect,getProfile)

export default router;