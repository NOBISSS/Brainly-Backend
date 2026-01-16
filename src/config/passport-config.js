import passport from "passport";
import GoogleStrategy from "passport-google-oauth20"
import User from "../Models/userModel";
GoogleStrategy.Strategy;

passport.use(new GoogleStrategy({
    clientID:process.env.GOOGLE_CLIENT_ID,
    clientSecret:process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:"/auth/google/callback"
},
    function (accessToken,refreshToken,profile,done){
        User.findOrCreate({googleId:profile.id},
            function(err,user){
                return done(err,user);
            });
    }
));

passport.serializeUser((user,done)=>{
    done(null,user.id);
});

passport.deserializeUser((id,done)=>{
    User.findById(id,(err,user)=>{
        done(err,user);
    });
});

