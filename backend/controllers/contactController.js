// backend/controllers/contactController.js - Contact Form Logic

const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');
const https = require('https');

/**
 * Configure email transporter
 */
const createTransporter = () => {
  // For Gmail or other email services
  if (process.env.EMAIL_SERVICE === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  // For SMTP (custom email server)
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });
  }

  // File-based storage (for development)
  return null;
};

/**
 * Save message to file (development mode)
 */
const saveMessageToFile = async (messageData) => {
  try {
    const messagesDir = path.join(__dirname, '../../messages');
    
    // Create directory if it doesn't exist
    try {
      await fs.access(messagesDir);
    } catch {
      await fs.mkdir(messagesDir, { recursive: true });
    }

    // Create filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = path.join(messagesDir, `message-${timestamp}.json`);

    // Save message
    await fs.writeFile(filename, JSON.stringify(messageData, null, 2));
    
    console.log(`✓ Message saved to file: ${filename}`);
    return true;
  } catch (error) {
    console.error('Error saving message to file:', error);
    return false;
  }
};

/**
 * Send email notification
 */
const sendEmailNotification = async (messageData) => {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      console.log('⚠ Email service not configured. Message will be saved to file only.');
      return await saveMessageToFile(messageData);
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER,
      to: process.env.EMAIL_RECIPIENT || process.env.EMAIL_USER,
      subject: `New Portfolio Contact: ${messageData.subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${escapeHtml(messageData.name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(messageData.email)}</p>
        <p><strong>Subject:</strong> ${escapeHtml(messageData.subject)}</p>
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(messageData.message).replace(/\n/g, '<br>')}</p>
        <p><small>Received at: ${new Date().toISOString()}</small></p>
      `,
      replyTo: messageData.email
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log(`✓ Email sent: ${info.messageId}`);

    // Also save to file as backup
    await saveMessageToFile(messageData);
    
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

const isAllowedAppsScriptHost = (hostname) =>
  hostname === 'script.google.com' || hostname.endsWith('.googleusercontent.com');

const postToAppsScript = (endpoint, payload, redirectCount = 0, method = 'POST') => new Promise((resolve, reject) => {
  const url = new URL(endpoint);
  if (url.protocol !== 'https:' || !isAllowedAppsScriptHost(url.hostname)) {
    reject(new Error('Google Sheets URL must use an HTTPS Google Apps Script endpoint'));
    return;
  }

  if (redirectCount > 3) {
    reject(new Error('Google Apps Script redirected too many times'));
    return;
  }

  const body = method === 'GET' ? null : Buffer.from(JSON.stringify(payload));
  const request = https.request(url, {
    method,
    headers: body ? {
      'Content-Type': 'application/json',
      'Content-Length': body.length
    } : {},
    timeout: 10000
  }, (response) => {
    const statusCode = response.statusCode || 0;
    const location = response.headers.location;

    if ([301, 302, 303, 307, 308].includes(statusCode) && location) {
      response.resume();
      const nextMethod = [307, 308].includes(statusCode) ? method : 'GET';
      postToAppsScript(new URL(location, url).toString(), payload, redirectCount + 1, nextMethod)
        .then(resolve, reject);
      return;
    }

    let responseBody = '';
    response.setEncoding('utf8');
    response.on('data', (chunk) => {
      responseBody += chunk;
      if (responseBody.length > 65536) {
        request.destroy(new Error('Google Apps Script response was too large'));
      }
    });
    response.on('end', () => {
      if (statusCode < 200 || statusCode >= 300) {
        reject(new Error(`Google Apps Script returned HTTP ${statusCode}`));
        return;
      }

      try {
        resolve(JSON.parse(responseBody));
      } catch {
        reject(new Error('Google Apps Script returned an invalid response'));
      }
    });
  });

  request.on('timeout', () => request.destroy(new Error('Google Sheets request timed out')));
  request.on('error', reject);
  if (body) request.write(body);
  request.end();
});

const saveMessageToGoogleSheet = async (messageData) => {
  const endpoint = process.env.GOOGLE_SHEETS_WEB_APP_URL;
  const secret = process.env.GOOGLE_SHEETS_SHARED_SECRET;

  if (!endpoint && !secret) return;
  if (!endpoint || !secret) {
    throw new Error('Google Sheets integration requires both GOOGLE_SHEETS_WEB_APP_URL and GOOGLE_SHEETS_SHARED_SECRET');
  }

  const result = await postToAppsScript(endpoint, {
    secret,
    receivedAt: messageData.receivedAt,
    name: messageData.name,
    email: messageData.email,
    subject: messageData.subject,
    message: messageData.message
  });

  if (!result || result.success !== true) {
    throw new Error(result && result.message ? result.message : 'Google Sheets did not confirm the submission');
  }
};

/**
 * Escape HTML special characters for security
 */
const escapeHtml = (text) => {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
};

/**
 * Handle contact form submission
 */
exports.submitForm = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    // Prepare message data
    const messageData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      subject: subject.trim(),
      message: message.trim(),
      receivedAt: new Date().toISOString(),
      ipAddress: req.ip || req.connection.remoteAddress
    };

    const deliveryResults = await Promise.allSettled([
      sendEmailNotification(messageData),
      saveMessageToGoogleSheet(messageData)
    ]);
    const failedDelivery = deliveryResults.find((result) => result.status === 'rejected');
    if (failedDelivery) throw failedDelivery.reason;

    // Send success response
    res.json({
      success: true,
      message: 'Your message has been received. I will get back to you soon!'
    });

  } catch (error) {
    console.error('Contact form error:', error);
    
    // Send error response
    res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again later.'
    });
  }
};
