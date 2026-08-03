const crypto = require("crypto");
const bcrypt = require("bcrypt");
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