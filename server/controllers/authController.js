const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const sendEmail = require('../utils/email');

const ADMIN_EMAIL = 'pratik792584@gmail.com';

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

exports.register = async (req, res) => {
    let user;
    try {
        const { name, email, password } = req.body;
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const verificationToken = crypto.randomBytes(20).toString('hex');

        user = await User.create({
            name,
            email,
            password: hashedPassword,
            verificationToken,
            role: email.toLowerCase() === ADMIN_EMAIL ? 'admin' : 'employee'
        });

        const verifyUrl = `${req.protocol}://${req.get('host')}/api/auth/verify/${verificationToken}`;
        const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Verify your OneClick account</title>
</head>
<body style="margin:0;padding:0;background-color:#FFFBF5;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#FFFBF5;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

          <!-- Header / Logo Bar -->
          <tr>
            <td style="background-color:#1B4332;border-radius:14px 14px 0 0;padding:28px 36px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="font-size:22px;font-weight:800;color:#FFFFFF;letter-spacing:-0.04em;">
                      OneClick<span style="color:#F59E0B;">.</span>
                    </span>
                    <br/>
                    <span style="font-size:11px;color:rgba(255,255,255,0.45);letter-spacing:0.08em;text-transform:uppercase;font-weight:500;">
                      HR Intelligence Platform
                    </span>
                  </td>
                  <td align="right">
                    <span style="background:rgba(255,255,255,0.12);color:rgba(255,255,255,0.7);font-size:11px;font-weight:600;padding:5px 12px;border-radius:100px;letter-spacing:0.05em;text-transform:uppercase;">
                      Account Verification
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Amber Accent Bar -->
          <tr>
            <td style="height:4px;background:linear-gradient(90deg,#D97706,#F59E0B);"></td>
          </tr>

          <!-- Main Body -->
          <tr>
            <td style="background:#FFFFFF;padding:40px 36px;border-radius:0 0 14px 14px;box-shadow:0 8px 32px rgba(28,25,23,0.08);">

              <!-- Icon -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom:28px;">
                    <div style="width:68px;height:68px;background:#D1FAE5;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;line-height:68px;">
                      <span style="font-size:30px;line-height:68px;display:block;text-align:center;">✉️</span>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Greeting -->
              <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#1C1917;text-align:center;letter-spacing:-0.02em;">
                Welcome, ${name}!
              </h1>
              <p style="margin:0 0 28px;font-size:15px;color:#78716C;text-align:center;line-height:1.6;">
                You're one step away from accessing your OneClick workspace.<br/>
                Please verify your email to activate your account.
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom:28px;">
                    <a href="${verifyUrl}"
                       style="display:inline-block;background:linear-gradient(135deg,#D97706,#F59E0B);color:#FFFFFF;font-size:15px;font-weight:700;text-decoration:none;padding:14px 36px;border-radius:10px;letter-spacing:0.01em;box-shadow:0 4px 14px rgba(217,119,6,0.35);">
                      ✓ &nbsp; Verify My Email Address
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="height:1px;background:#E7E5E4;margin-bottom:24px;"></td>
                </tr>
              </table>

              <!-- Alternative Link -->
              <p style="margin:20px 0 8px;font-size:12px;color:#78716C;text-align:center;">
                Button not working? Paste this link into your browser:
              </p>
              <p style="margin:0 0 24px;font-size:11px;color:#1B4332;text-align:center;word-break:break-all;">
                ${verifyUrl}
              </p>

              <!-- Info Box -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#FFFBF5;border:1px solid #E7E5E4;border-left:3px solid #D97706;border-radius:8px;padding:14px 16px;">
                    <p style="margin:0;font-size:12px;color:#78716C;line-height:1.6;">
                      <strong style="color:#44403C;">⏱ This link expires in 24 hours.</strong><br/>
                      If you didn't create a OneClick account, you can safely ignore this email.
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 36px 0;text-align:center;">
              <p style="margin:0 0 6px;font-size:12px;color:#78716C;">
                Sent by <strong style="color:#1B4332;">OneClick HR</strong> · HR Intelligence Platform
              </p>
              <p style="margin:0;font-size:11px;color:#A8A29E;">
                © ${new Date().getFullYear()} OneClick Inc. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
        `;

        await sendEmail({
            email,
            subject: '✉ Verify your OneClick account',
            html: emailHtml
        });

        res.status(201).json({ message: 'User registered, please verify email' });
    } catch (err) {
        if (user) {
            await User.findByIdAndDelete(user._id);
        }
        res.status(500).json({ message: 'Failed to send verification email. Please check server/.env GMAIL credentials.' });
    }
};

exports.verify = async (req, res) => {
    try {
        const user = await User.findOne({ verificationToken: req.params.token });
        if (!user) return res.status(400).json({ message: 'Invalid token' });

        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();
        
        const token = generateToken(user._id);
        const userData = encodeURIComponent(JSON.stringify({ _id: user._id, name: user.name, email: user.email, role: user.role, token }));
        
        res.redirect(`${req.protocol}://${req.get('host')}/verify-success?data=${userData}`);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });
        
        if (!user.isVerified) return res.status(401).json({ message: 'Please verify your email first' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        res.json({ _id: user._id, name: user.name, email: user.email, role: user.role, token: generateToken(user._id) });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.googleLogin = async (req, res) => {
    try {
        const { googleId, email, name } = req.body;
        let user = await User.findOne({ email });
        
        if (!user) {
            user = await User.create({
                name,
                email,
                googleId,
                isVerified: true,
                role: email.toLowerCase() === ADMIN_EMAIL ? 'admin' : 'employee'
            });
        } else if (email.toLowerCase() === ADMIN_EMAIL && user.role !== 'admin') {
            // Ensure existing admin email always has admin role
            user.role = 'admin';
            await user.save();
        }
        res.json({ _id: user._id, name: user.name, email: user.email, role: user.role, token: generateToken(user._id) });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
