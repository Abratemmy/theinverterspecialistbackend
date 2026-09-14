const crypto = require("crypto");
const bcrypt = require("bcrypt");
const { Op } = require("sequelize");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const sendEmail = require("../utils/sendEmail");

exports.register = async (userData) => {
    const {
        first_name,
        last_name,
        email,
        phone,
        password
    } = userData;

    // Check if email already exists
    const existingUser = await User.findOne({
        where: { email }
    });

    if (existingUser) {
        throw new Error("Email already exists.");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
        first_name,
        last_name,
        email,
        phone,
        password: hashedPassword,

        // Never trust the frontend
        role: "customer"
    });

    // Generate JWT
    const token = generateToken(user.id, user.role);

    return {
        user,
        token
    };
};

exports.login = async (email, password) => {

    const bcrypt = require("bcrypt");

    const user = await User.findOne({
        where: { email }
    });

    if (!user) {
        throw new Error("Invalid email or password.");
    }

    if (user.status === "blocked") {
        throw new Error("Your account has been blocked. Please contact support.");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        throw new Error("Invalid email or password.");
    }

    // Update last login
    user.last_login = new Date();
    await user.save();

    const token = generateToken(user.id, user.role);

    return {
        user,
        token
    };
};

// forgotpassword
exports.forgotPassword = async (email) => {

    const user = await User.findOne({
        where: { email }
    });

    // Don't reveal if the email exists
    if (!user) {
        return;
    }

    // Generate random token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash the token before storing
    const hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    user.reset_password_token = hashedToken;
    user.reset_password_expires = new Date(Date.now() + 15 * 60 * 1000);

    await user.save();

    const resetLink =
        `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const html = `
        <h2>Password Reset</h2>

        <p>Hello ${user.first_name},</p>

        <p>You requested to reset your password.</p>

        <p>
            <a href="${resetLink}">
                Reset Password
            </a>
        </p>

        <p>This link expires in 15 minutes.</p>

        <p>If you didn't request this, please ignore this email.</p>
    `;

    await sendEmail(
        user.email,
        "Reset Your Password",
        html
    );

};

// ============================================================
// RESET PASSWORD
// ============================================================

exports.resetPassword = async (token, newPassword) => {

    if (!token) {
        throw new Error("Reset token is required.");
    }

    if (!newPassword || newPassword.length < 6) {
        throw new Error("Password must be at least 6 characters long.");
    }

    // ========================================================
    // HASH INCOMING TOKEN TO MATCH STORED HASH
    // ========================================================

    const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");


    // ========================================================
    // FIND USER WITH MATCHING, UNEXPIRED TOKEN
    // ========================================================

    const user = await User.findOne({
        where: {
            reset_password_token: hashedToken,
            reset_password_expires: {
                [Op.gt]: new Date()
            }
        }
    });

    if (!user) {
        throw new Error("This reset link is invalid or has expired.");
    }


    // ========================================================
    // UPDATE PASSWORD
    // ========================================================

    user.password = await bcrypt.hash(newPassword, 10);

    user.reset_password_token = null;
    user.reset_password_expires = null;

    await user.save();

    return true;

};

// ============================================================
// UPDATE PROFILE
// ============================================================

exports.updateProfile = async (
    userId,
    profileData,
    file
) => {

    const user = await User.findByPk(userId);

    if (!user) {
        throw new Error("User not found.");
    }


    // ========================================================
    // UPDATE PERSONAL INFORMATION
    // ========================================================

    user.first_name =
        profileData.first_name?.trim() ||
        user.first_name;

    user.last_name =
        profileData.last_name?.trim() ||
        user.last_name;

    user.phone =
        profileData.phone?.trim() || null;


    // ========================================================
    // SAVE PROFILE IMAGE
    // ========================================================

    if (file) {

        user.profile_image =
            `/uploads/profile-images/${file.filename}`;

    }


    // ========================================================
    // SAVE
    // ========================================================

    await user.save();


    // ========================================================
    // RETURN USER WITHOUT PASSWORD
    // ========================================================

    const userResponse =
        user.toJSON();

    delete userResponse.password;

    return userResponse;
};