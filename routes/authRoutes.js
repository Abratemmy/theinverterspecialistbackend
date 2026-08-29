const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authMiddleware");
const {
    register,
    login,
    logout,
    forgotPassword,
    resetPassword,
    changePassword,
    getCurrentUser,
    checkAuth,
    updateProfile
} = require("../controllers/authController");
const validate = require("../middleware/validate");

const {
    registerValidator,
    loginValidator,
    forgotPasswordValidator
} = require("../validators/authValidator");

const upload =
    require("../middleware/uploadMiddleware");
 
// register link
router.post(
    "/register",
    registerValidator,
    validate,
    register
);

// login link
router.post(
    "/login",
    loginValidator,
    validate,
    login
);

router.post("/logout", logout);

router.post(
    "/forgot-password",
    forgotPasswordValidator,
    validate,
    forgotPassword
);

router.post("/reset-password/:token", resetPassword);
router.post("/change-password", changePassword);

router.get("/me", authenticate, getCurrentUser);
router.get("/check", authenticate, checkAuth);

router.put(
    "/profile",
    authenticate,
    upload.single("profile_image"),
    updateProfile
);

module.exports = router;