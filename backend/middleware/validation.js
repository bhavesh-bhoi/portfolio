// backend/middleware/validation.js - Input Validation

/**
 * Validate email format
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Trim and validate text field
 */
const validateTextField = (text, fieldName, minLength = 2, maxLength = 255) => {
  if (!text || typeof text !== 'string') {
    return { valid: false, error: `${fieldName} is required` };
  }

  const trimmed = text.trim();

  if (trimmed.length < minLength) {
    return { 
      valid: false, 
      error: `${fieldName} must be at least ${minLength} characters` 
    };
  }

  if (trimmed.length > maxLength) {
    return { 
      valid: false, 
      error: `${fieldName} cannot exceed ${maxLength} characters` 
    };
  }

  return { valid: true, value: trimmed };
};

/**
 * Validate contact form
 * 
 * Required fields:
 * - name: 2-100 characters
 * - email: valid email format
 * - subject: 5-200 characters
 * - message: 10-5000 characters
 */
exports.validateContactForm = (req, res, next) => {
  const errors = [];
  const { name, email, subject, message } = req.body;

  // Validate name
  const nameValidation = validateTextField(name, 'Name', 2, 100);
  if (!nameValidation.valid) {
    errors.push(nameValidation.error);
  }

  // Validate email
  if (!email || typeof email !== 'string') {
    errors.push('Email is required');
  } else if (!isValidEmail(email)) {
    errors.push('Please provide a valid email address');
  } else if (email.length > 255) {
    errors.push('Email is too long');
  }

  // Validate subject
  const subjectValidation = validateTextField(subject, 'Subject', 5, 200);
  if (!subjectValidation.valid) {
    errors.push(subjectValidation.error);
  }

  // Validate message
  const messageValidation = validateTextField(message, 'Message', 10, 5000);
  if (!messageValidation.valid) {
    errors.push(messageValidation.error);
  }

  // If there are errors, return them
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors
    });
  }

  // Continue to next middleware/controller
  next();
};

/**
 * Rate limiting helper (can be used with express-rate-limit)
 */
exports.createRateLimiter = (windowMs = 15 * 60 * 1000, maxRequests = 5) => {
  const rateLimit = require('express-rate-limit');
  
  return rateLimit({
    windowMs: windowMs,
    max: maxRequests,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false
  });
};
