// Needed resources
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities/")
// Import the validation file
const invValidate = require("../utilities/inv-validation")

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId))

// Route to build inventory detail view
router.get("/detail/:invId", utilities.handleErrors(invController.buildByInvId))

// Route to build inventory management view
router.get("/", utilities.handleErrors(invController.buildManagementView))

// Route to build the new classification form view
router.get("/add-classification", utilities.handleErrors(invController.buildNewClassification))

// Route to process the new classification addition
router.post(
    "/add-classification",
    invValidate.classificationRules(),
    invValidate.checkClassificationData,
    utilities.handleErrors(invController.addClassification)
)

// Route to build the new inventory form view
router.get("/add-inventory", utilities.handleErrors(invController.buildNewInventory))

// Route to process the new inventory addition
router.post(
    "/add-inventory",
    // Uses the rules defined for adding new inventory
    invValidate.addInventoryRules(),
    // Uses the check function that handles sticky data and error rendering for Add/Edit
    invValidate.checkInventoryData,
    utilities.handleErrors(invController.addInventory)
)

// Route to get inventory as JSON (for management view)
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))

// Route to build the edit inventory view
router.get("/edit/:inv_id", utilities.handleErrors(invController.editInventoryView))

// Route to update inventory data
router.post(
    "/update/",
    // Uses the rules defined for adding/editing inventory
    invValidate.addInventoryRules(),
    // Uses the check function specific for updates (ensures redirection to edit view on error)
    invValidate.checkUpdateData,
    utilities.handleErrors(invController.updateInventory)
)

// Route to build the delete confirmation view
router.get("/delete/:inv_id", utilities.handleErrors(invController.buildDeleteView))

// Route to process the delete action
router.post("/delete", utilities.handleErrors(invController.deleteItem))

// Intentional 500 error route (for testing)
router.get("/intentional-error", utilities.handleErrors(invController.throwIntentionalError))


module.exports = router