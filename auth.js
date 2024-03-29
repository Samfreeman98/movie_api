const jwtSecret = "your_jwt_secret"; // Has to be same key used in JWTStrategy
const jwt = require("jsonwebtoken");
const passport = require("passport");
const bcrypt = require("bcrypt");

require("./passport"); //Local passport file

let generateJWTToken = (user) => {
    return jwt.sign(user, jwtSecret, {
        subject: user.Username, //Username being encoded in JWT
        expiresIn: "7d", //Specifies that the token will expire in 7 days
        algorithm: "HS256" // Algorithm used to "sign" or encode values of JWT
    });
}

/* POST login. */
module.exports = (router) => {
    router.post("/login", (req, res) => {
        passport.authenticate("local", { session: false}, (error, user, info) => {
            if (error || !user) {
                return res.status(400).json({
                    message: "Something is not right",
                    user: user
                });
            }
            req.login(user, { session: false }, (error) => {
                if (error) {
                    res.send(error);
                }
                let token = generateJWTToken(user.toJSON());
                return res.json({user, token});
            });
        })(req, res);
    });
}