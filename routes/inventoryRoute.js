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

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

// Route to build inventory detail view
router.get("/detail/:invId", utilities.handleErrors(invController.buildByInvId));

// Intentional 500 Error Route
router.get("/throwerror", utilities.handleErrors(invController.throwIntentionalError))

// **********************************************
// Management View Routes (Task 1)
// **********************************************
// Route to build the Inventory Management view
router.get("/", utilities.handleErrors(invController.buildManagementView))

// **********************************************
// Add Classification Routes (Task 2)
// **********************************************
// Route to deliver the add-classification view
router.get("/add-classification", utilities.handleErrors(invController.buildNewClassification))

// Route to process the new classification submission
router.post(
    "/add-classification",
    invValidate.classificationRules(), // Server-side validation rules
    invValidate.checkClassificationData, // Check for errors and handle sticky form/errors
    utilities.handleErrors(invController.addClassification) // Process the submission
)

// **********************************************
// Add Inventory Item Routes (Task 3)
// **********************************************
// Route to deliver the add-inventory view
router.get("/add-inventory", utilities.handleErrors(invController.buildNewInventory))

// Route to process the new inventory item submission
router.post(
    "/add-inventory",
    invValidate.inventoryRules(), // Server-side validation rules
    invValidate.checkInventoryData, // Check for errors and handle sticky form/errors
    utilities.handleErrors(invController.addInventory) // Process the submission
)

// New requirement for Assignment 3, Task 3: Intentional 500 Error Route
router.get("/throwerror", utilities.handleErrors(invController.throwIntentionalError))

module.exports = router;