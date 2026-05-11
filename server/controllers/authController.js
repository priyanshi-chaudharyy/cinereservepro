import User from "../models/User.js";
import jwt from 'jsonwebtoken';

//genertate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

const isProduction = process.env.NODE_ENV === 'production';
const baseCookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'strict'
};

//@desc Register new user
//@route POST /api/auth/signup
//@access Public
export const signup = async (req, res) => {
    try {
        const { name, email, password, phone, role, businessName } = req.body;

        //check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        // Determine role and approval status
        const userRole = role === 'theater_admin' ? 'theater_admin' : 'user';
        const isApproved = userRole === 'theater_admin' ? false : true;

        // Validate business name for theater admins
        if (userRole === 'theater_admin' && !businessName) {
            return res.status(400).json({
                success: false,
                message: 'Business name is required for cinema partner registration'
            });
        }

        //create user
        const user = await User.create({
            name,
            email,
            password,
            phone,
            role: userRole,
            isApproved,
            businessName: userRole === 'theater_admin' ? businessName : undefined
        });

        //generate token
        const token = generateToken(user._id);

        //set HTTP-only cookie
        res.cookie('token', token, {
            ...baseCookieOptions,
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role
            },
            token
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error creating user',
            error: error.message
        });
    }
};

//@desc Login user
//@route POST /api/auth/login
//@access Public
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        //validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        //check if user exists (include password field)
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        //check password
        const isPasswordCorrect = await user.comparePassword(password);
        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        //check approval
        if (user.role === 'theater_admin' && !user.isApproved) {
            return res.status(403).json({
                success: false,
                message: 'Your account is pending approval by the super admin.'
            });
        }

        //generate token
        const token = generateToken(user._id);

        //set HTTP-only cookie
        res.cookie('token', token, {
            ...baseCookieOptions,
            maxAge: 30 * 24 * 60 * 60 * 1000
        });

        res.json({
            success: true,
            message: 'Login successfully',
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role
            },
            token
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error logging in',
            error: error.message
        });
    }
};

//@desc Logout user
//@route POST /api/auth/logout
//@access Private
export const logout = async (req, res) => {
    try {
        res.cookie('token', '', {
            ...baseCookieOptions,
            expires: new Date(0)
        });

        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error logging out',
            error: error.message
        });
    }
};

//@desc Get current user profile
//@route GET /api/auth/me
//@access Private
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching user profile',
            error: error.message
        });
    }
};

//@desc Update user profile
//@route PUT /api/auth/profile
//@access Private 
export const updateProfile = async (req, res) => {
    try {
        const { name, phone, profilePicture } = req.body;

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { name, phone, profilePicture },
            { new: true, runValidators: true }
        ).select('-password');

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: user
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error updating profile',
            error: error.message
        });
    }
};

//@desc change password
//@route PUT /api/auth/change-password
//@access Private
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        //get user with password
        const user = await User.findById(req.user._id).select('+password');

        //check current password
        const isPasswordCorrect = await user.comparePassword(currentPassword);
        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        //update passowrd
        user.password = newPassword;
        await user.save();

        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error changing password',
            error: error.message
        });
    }
};

// @desc Google Login / Signup
// @route POST /api/auth/google
// @access Public
export const googleLogin = async (req, res) => {
    try {
        const { name, email, profilePicture } = req.body;

        //1.check if user already exists
        let user = await User.findOne({ email });

        if (!user) {
            // 2. If they don't exist, create a new user account seamlessly
            // We set a random strong password since they use Google to login
            const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);

            user = await User.create({
                name,
                email,
                password: randomPassword,
                profilePicture,
                role: 'user'
            });
        }

        //3. generate standard JWT token just like normal login
        const token = generateToken(user._id);

        //4. Set the HTTP-only cookie identical to normal login
        res.cookie('token', token, {
            ...baseCookieOptions,
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });

        res.json({
            success: true,
            message: 'Google login successful',
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profilePicture: user.profilePicture
            },
            token
        });
    } catch (error) {
        console.error("Google Auth controller error:", error);
        res.status(500).json({
            success: false,
            message: 'Server error during Google login',
            error: error.message
        });
    }
};