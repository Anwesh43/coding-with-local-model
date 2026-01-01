/**
 * Security utility functions for input sanitization and validation
 */

// Maximum input length to prevent DoS attacks
const MAX_INPUT_LENGTH = 5000;

// Common prompt injection patterns to detect
const PROMPT_INJECTION_PATTERNS = [
  /ignore\s+previous\s+instructions?/gi,
  /forget\s+previous\s+instructions?/gi,
  /disregard\s+previous\s+instructions?/gi,
  /system\s*:\s*ignore/gi,
  /system\s*:\s*forget/gi,
  /\[SYSTEM\]/gi,
  /<\|system\|>/gi,
  /new\s+instructions?:\s*/gi,
  /override\s+instructions?/gi,
];

/**
 * Sanitizes user input to prevent prompt injection attacks
 * @param {string} input - User input text
 * @returns {string} - Sanitized input
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') {
    throw new Error('Input must be a string');
  }

  // Trim whitespace
  let sanitized = input.trim();

  // Check length
  if (sanitized.length > MAX_INPUT_LENGTH) {
    throw new Error(`Input exceeds maximum length of ${MAX_INPUT_LENGTH} characters`);
  }

  // Check for empty input
  if (sanitized.length === 0) {
    throw new Error('Input cannot be empty');
  }

  // Detect and warn about potential prompt injection patterns
  const suspiciousPatterns = PROMPT_INJECTION_PATTERNS.filter(pattern => pattern.test(sanitized));
  if (suspiciousPatterns.length > 0) {
    console.warn('Potential prompt injection detected, but allowing input for legitimate use cases');
    // Note: We log but don't block, as these patterns might be legitimate
    // In a production environment, you might want to add more strict filtering
  }

  // Remove null bytes and control characters (except newlines, tabs, carriage returns)
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  return sanitized;
}

/**
 * Escapes HTML characters to prevent XSS attacks
 * @param {string} text - Text to escape
 * @returns {string} - Escaped HTML
 */
export function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Sanitizes HTML output while preserving intentional <br> tags
 * Escapes HTML but preserves <br> tags for formatting
 * @param {string} html - HTML string to sanitize
 * @returns {string} - Sanitized HTML
 */
export function sanitizeHtmlOutput(html) {
  if (typeof html !== 'string') {
    return '';
  }

  // Replace <br> with a placeholder (case-insensitive)
  const placeholder = '__BR_PLACEHOLDER__';
  const withPlaceholder = html.replace(/<br\s*\/?>/gi, placeholder);

  // Escape HTML
  const escaped = escapeHtml(withPlaceholder);

  // Replace placeholder back with <br>
  return escaped.replace(new RegExp(placeholder, 'g'), '<br>');
}

/**
 * Validates input before sending to LLM
 * @param {string} input - User input
 * @returns {object} - { isValid: boolean, error?: string, sanitized?: string }
 */
export function validateInput(input) {
  try {
    const sanitized = sanitizeInput(input);
    return {
      isValid: true,
      sanitized
    };
  } catch (error) {
    return {
      isValid: false,
      error: error.message
    };
  }
}

