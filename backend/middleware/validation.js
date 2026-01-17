const { body, validationResult } = require('express-validator');

// Validation rules for user registration
const validateRegistration = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail({
      gmail_remove_dots: false,
      gmail_remove_subaddress: false,
      all_lowercase: true,
      gmail_convert_googlemaildotcom: false
    }),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/) // Requires uppercase, lowercase, and number
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
    .custom((value) => {
      // Additional custom validation if needed
      return true;
    })
];

// Validation rules for user login
const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail({
      gmail_remove_dots: false,
      gmail_remove_subaddress: false,
      all_lowercase: true,
      gmail_convert_googlemaildotcom: false
    }),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Validation rules for wellness logs
const validateWellnessLog = [
  body('user_id')
    .isInt({ min: 1 })
    .withMessage('Valid user ID is required'),
  
  body('date')
    .isISO8601()
    .withMessage('Valid date is required'),
  
  body('water_intake')
    .isFloat({ min: 0, max: 50 })
    .withMessage('Water intake must be between 0 and 50 glasses'),
  
  body('mood')
    .isIn(['very-sad', 'sad', 'neutral', 'happy', 'very-happy'])
    .withMessage('Valid mood selection is required'),
  
  body('sleep_hours')
    .isFloat({ min: 0, max: 24 })
    .withMessage('Sleep hours must be between 0 and 24'),
  
  body('energy_level')
    .isInt({ min: 1, max: 10 })
    .withMessage('Energy level must be between 1 and 10'),
  
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
];

// Middleware to check for validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateWellnessLog,
  handleValidationErrors
};

