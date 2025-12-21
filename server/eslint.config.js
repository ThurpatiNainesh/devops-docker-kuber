// Export an array of ESLint configuration objects
export default [
  {
    // Apply this configuration to all JavaScript files
    // ** = any folder, *.js = any JavaScript file
    files: ['**/*.js'],

    // Define ESLint rules
    rules: {
      // Enforce semicolons at the end of statements
      // 'error' → ESLint will show this as an error and fail linting
      semi: 'error',

      // Warn when variables are declared but never used
      // 'warn' → ESLint will show a warning but not fail linting
      'no-unused-vars': 'warn',
    },
  },
];
