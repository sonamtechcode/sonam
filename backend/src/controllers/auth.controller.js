const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

exports.register = async (req, res) => {
  try {
    const { email, password, name, role, hospital_id } = req.body;

    const result = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (result.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const insertResult = await db.query(
      'INSERT INTO users (hospital_id, email, password_hash, first_name, role, is_active) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [hospital_id, email, hashedPassword, name, role || 'staff', true]
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      userId: insertResult.rows[0].id
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await db.query(
      'SELECT u.*, h.name as hospital_name FROM users u LEFT JOIN hospitals h ON u.hospital_id = h.id WHERE u.email = $1 AND u.is_active = true',
      [email]
    );

    const users = result.rows;

    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const user = users[0];
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    delete user.password_hash;

    res.json({
      success: true,
      token,
      user
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT u.id, u.email, u.first_name, u.role, u.hospital_id, h.name as hospital_name FROM users u LEFT JOIN hospitals h ON u.hospital_id = h.id WHERE u.id = $1',
      [req.user.id]
    );

    res.json({ success: true, user: result.rows[0] });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const [users] = await db.query('SELECT id, name, email FROM users WHERE email = ? AND is_active = 1', [email]);
    
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'No account found with this email' });
    }

    const user = users[0];

    // Generate reset token
    const crypto = require('crypto');
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Set expiry time (15 minutes)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // Delete any existing tokens for this user
    await db.query('DELETE FROM password_reset_tokens WHERE user_id = ?', [user.id]);

    // Save token to database
    await db.query(
      'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [user.id, hashedToken, expiresAt]
    );

    // Send email
    const { sendPasswordResetEmail } = require('../utils/emailService');
    const emailResult = await sendPasswordResetEmail(user.email, resetToken, user.name);

    if (!emailResult.success) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to send reset email. Please try again.' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Password reset link has been sent to your email. Please check your inbox.' 
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.verifyResetToken = async (req, res) => {
  try {
    const { token } = req.body;

    const crypto = require('crypto');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const [tokens] = await db.query(
      `SELECT * FROM password_reset_tokens 
       WHERE token = ? AND expires_at > NOW() AND used = 0`,
      [hashedToken]
    );

    if (tokens.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired reset token' 
      });
    }

    res.json({ success: true, message: 'Token is valid' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters long' 
      });
    }

    const crypto = require('crypto');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Verify token
    const [tokens] = await db.query(
      `SELECT * FROM password_reset_tokens 
       WHERE token = ? AND expires_at > NOW() AND used = 0`,
      [hashedToken]
    );

    if (tokens.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired reset token' 
      });
    }

    const resetToken = tokens[0];

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    await db.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, resetToken.user_id]
    );

    // Mark token as used
    await db.query(
      'UPDATE password_reset_tokens SET used = 1 WHERE id = ?',
      [resetToken.id]
    );

    // Create notification
    await db.query(
      `INSERT INTO notifications (user_id, title, message, type) 
       VALUES (?, ?, ?, ?)`,
      [
        resetToken.user_id,
        'Password Changed',
        'Your password has been successfully changed.',
        'success'
      ]
    );

    res.json({ 
      success: true, 
      message: 'Password has been reset successfully. You can now login with your new password.' 
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
