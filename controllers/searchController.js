/* ****************************************
 * NEW FILE: controllers/searchController.js
 * New Controller Behaviors: Defines search view and logic
 * Data Validation and Error Handling implemented.
 * *************************************** */
const invModel = require('../models/inventory-model');
const utilities = require('../utilities/'); 

/* ****************************************
 * Deliver search view (GET /search)
 * *************************************** */
async function buildSearchView(req, res, next) {
    let nav = await utilities.getNav();
    res.render('inventory/search', {
        title: 'Vehicle Search',
        nav,
        errors: null,
        searchTerm: '', // Initial empty values for the form
        maxPrice: '',   // Initial empty values for the form
    });
}

/* ****************************************
 * Perform search and deliver results (POST /search)
 * *************************************** */
async function performSearch(req, res, next) {
    const { searchTerm, maxPrice } = req.body;
    let nav = await utilities.getNav();
    let errors = [];
    // Default price cap is a large number if user leaves the field blank
    let price = 1000000000; 

    // --- Data Validation ---
    if (!searchTerm || searchTerm.trim() === '') {
        errors.push({ msg: 'Please provide a search term.' });
    }

    if (maxPrice) {
        price = parseFloat(maxPrice);
        if (isNaN(price) || price <= 0) {
            errors.push({ msg: 'Max Price must be a positive number.' });
        }
    }

    // Check for validation errors and re-render the form if failures occur
    if (errors.length > 0) {
        req.flash('notice', 'Please check the input fields.');
        return res.render('inventory/search', {
            title: 'Vehicle Search',
            nav,
            errors,
            searchTerm,
            maxPrice,
        });
    }

    // --- Model Call and Error Handling ---
    try {
        // Calls the new model function
        const inventoryData = await invModel.getInventoryBySearchAndPrice(searchTerm, price);

        // FIX: The 'await' keyword is crucial here to resolve the Promise returned
        // by the utility function and prevent the '[object Promise]' error.
        let resultView = await utilities.buildInventoryGrid(inventoryData);

        if (!inventoryData || inventoryData.length === 0) {
            resultView = `<p class="notice">Sorry, no vehicles matched your search and price criteria.</p>`;
        }

        // Deliver the search results page
        res.render('inventory/search-results', {
            title: `Search Results for "${searchTerm}"`,
            nav,
            errors: null,
            inventoryGrid: resultView,
            searchTerm,
            maxPrice: maxPrice, // Pass original maxPrice for display
        });

    } catch (error) {
        // Graceful server error handling
        console.error('Search failed:', error);
        req.flash('notice', 'Sorry, the search failed due to a server error.');
        res.render('inventory/search', {
            title: 'Vehicle Search',
            nav,
            errors: [{ msg: 'A server error occurred during the search.' }],
            searchTerm,
            maxPrice,
        });
    }
}

module.exports = {
    buildSearchView,
    performSearch,
};