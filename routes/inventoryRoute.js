// Needed Resources 
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const Util = require("../utilities/") // <-- FIXED IMPORT NAME
const invValidate = require("../utilities/inv-validation")

/* **********************************************
 * Inventory by Classification View
 * ********************************************** */
router.get(
  "/type/:classificationId",
  Util.handleErrors(invController.buildByClassificationId) 
)

/* **********************************************
 * Inventory Detail View
 * ********************************************** */
router.get(
  "/detail/:invId",
  Util.handleErrors(invController.buildByInvId) 
)

/* **********************************************
 * Intentional 500 Error Route
 * ********************************************** */
router.get(
  "/throwerror",
  Util.handleErrors(invController.throwIntentionalError) 
)

/* **********************************************
 * AJAX Route – Returns Inventory as JSON
 * ********************************************** */
router.get(
  "/getInventory/:classification_id",
  Util.handleErrors(invController.getInventoryJSON) 
)

/* **********************************************
 * Management View (Protected)
 * ********************************************** */
router.get(
  "/", 
  Util.checkLogin, 
  Util.checkAuthorization, 
  Util.handleErrors(invController.buildManagementView) 
)

/* **********************************************
 * Add Classification (Protected)
 * ********************************************** */
router.get(
  "/add-classification",
  Util.checkLogin, 
  Util.checkAuthorization, 
  Util.handleErrors(invController.buildNewClassification) 
)

router.post(
  "/add-classification",
  Util.checkLogin, 
  Util.checkAuthorization, 
  invValidate.classificationRules(),
  invValidate.checkClassificationData,
  Util.handleErrors(invController.addClassification) 
)

/* **********************************************
 * Add Inventory Item (Protected)
 * ********************************************** */
router.get(
  "/add-inventory",
  Util.checkLogin, 
  Util.checkAuthorization, 
  Util.handleErrors(invController.buildNewInventory) 
)

router.post(
  "/add-inventory",
  Util.checkLogin, 
  Util.checkAuthorization, 
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  Util.handleErrors(invController.addInventory) 
)

/* **********************************************
 * Edit Inventory (Protected)
 * ********************************************** */
router.get(
  "/edit/:inv_id",
  Util.checkLogin, 
  Util.checkAuthorization, 
  Util.handleErrors(invController.editInventoryView) 
)

/* **********************************************
 * Post Route for Update Inventory Data (Protected)
 * ********************************************** */
router.post(
  "/update",
  Util.checkLogin, 
  Util.checkAuthorization, 
  invValidate.inventoryRules(),
  invValidate.checkUpdateData, // <-- Validation middleware
  Util.handleErrors(invController.updateInventory) // <-- Controller function
)

module.exports = router