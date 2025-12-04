// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities/")
const invValidate = require("../utilities/inv-validation")

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

// Route to build inventory detail view
// This route uses the invId parameter to fetch the specific vehicle details
router.get("/detail/:invId", utilities.handleErrors(invController.buildByInvId));

// Intentional 500 Error Route
router.get("/throwerror", utilities.handleErrors(invController.throwIntentionalError))


// **********************************************
// Management View Routes (Task 1) - NOW PROTECTED
// **********************************************
// Route to build the Inventory Management view
router.get(
    "/", 
    utilities.checkLogin, // Requires user to be logged in
    utilities.checkAuthorization, // Requires 'Employee' or 'Admin' role
    utilities.handleErrors(invController.buildManagementView)
)

// **********************************************
// Add Classification Routes (Task 2) - NOW PROTECTED
// **********************************************
// Route to deliver the add-classification view
router.get(
    "/add-classification", 
    utilities.checkLogin, // Requires user to be logged in
    utilities.checkAuthorization, // Requires 'Employee' or 'Admin' role
    utilities.handleErrors(invController.buildNewClassification)
)

// Route to process the new classification submission
router.post(
    "/add-classification",
    utilities.checkLogin, // Requires user to be logged in
    utilities.checkAuthorization, // Requires 'Employee' or 'Admin' role
    invValidate.classificationRules(), // Server-side validation rules
    invValidate.checkClassificationData, // Check for errors and handle sticky form/errors
    utilities.handleErrors(invController.addClassification) // Process the submission
)

// **********************************************
// Add Inventory Item Routes (Task 3) - NOW PROTECTED
// **********************************************
// Route to deliver the add-inventory view
router.get(
    "/add-inventory", 
    utilities.checkLogin, // Requires user to be logged in
    utilities.checkAuthorization, // Requires 'Employee' or 'Admin' role
    utilities.handleErrors(invController.buildNewInventory)
)

// Route to process the new inventory item submission
router.post(
    "/add-inventory",
    utilities.checkLogin, // Requires user to be logged in
    utilities.checkAuthorization, // Requires 'Employee' or 'Admin' role
    invValidate.inventoryRules(), // Server-side validation rules
    invValidate.checkInventoryData, // Check for errors and handle sticky form/errors
    utilities.handleErrors(invController.addInventory) // Process the submission
)

module.exports = router;