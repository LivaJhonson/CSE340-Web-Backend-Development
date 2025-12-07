/* ****************************************
 * NEW FILE: routes/searchRoute.js
 * *************************************** */
const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');
const utilities = require('../utilities/'); // Import utilities for handleErrors

// Route to display the search form: /search/
// Uses the handleErrors utility for robust error handling
router.get('/', utilities.handleErrors(searchController.buildSearchView));

// Route to process the search form submission: /search/
// Uses the handleErrors utility for robust error handling
router.post('/', utilities.handleErrors(searchController.performSearch));

module.exports = router;