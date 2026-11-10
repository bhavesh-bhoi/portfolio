// backend/routes/contact.js - Contact Form Routes

const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { validateContactForm } = require('../middleware/validation');

/**
 * POST /api/contact
 * Submit contact form
 * 
 * Request body:
 * {
 *   "name": "string (required)",
 *   "email": "string (required, valid email)",
 *   "subject": "string (required)",
 *   "message": "string (required)"
 * }
 * 
 * Response (Success):
 * {
 *   "success": true,
 *   "message": "Message received successfully"
 * }
 * 
 * Response (Error):
 * {
 *   "success": false,
 *   "message": "Error description",
 *   "errors": [...]
 * }
 */
router.post('/', validateContactForm, contactController.submitForm);

module.exports = router;
