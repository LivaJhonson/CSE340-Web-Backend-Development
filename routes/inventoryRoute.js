// Needed Resources 
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities/")
const invValidate = require("../utilities/inv-validation")

/* **********************************************
 * Inventory by Classification View
 ********************************************** */
router.get(
  "/type/:classificationId",
  utilities.handleErrors(invController.buildByClassificationId)
)

/* **********************************************
 * Inventory Detail View
 ********************************************** */
router.get(
  "/detail/:invId",
  utilities.handleErrors(invController.buildByInvId)
)

/* **********************************************
 * Intentional 500 Error Route
 ********************************************** */
router.get(
  "/throwerror",
  utilities.handleErrors(invController.throwIntentionalError)
)

/* **********************************************
 * AJAX Route – Returns Inventory as JSON
 ********************************************** */
router.get(
  "/getInventory/:classification_id",
  utilities.handleErrors(invController.getInventoryJSON)
)

/* **********************************************
 * Management View (Protected)
 ********************************************** */
router.get(
  "/", 
  utilities.checkLogin,
  utilities.checkAuthorization,
  utilities.handleErrors(invController.buildManagementView)
)

/* **********************************************
 * Add Classification (Protected)
 ********************************************** */
router.get(
  "/add-classification",
  utilities.checkLogin,
  utilities.checkAuthorization,
  utilities.handleErrors(invController.buildNewClassification)
)

router.post(
  "/add-classification",
  utilities.checkLogin,
  utilities.checkAuthorization,
  invValidate.classificationRules(),
  invValidate.checkClassificationData,
  utilities.handleErrors(invController.addClassification)
)

/* **********************************************
 * Add Inventory Item (Protected)
 ********************************************** */
router.get(
  "/add-inventory",
  utilities.checkLogin,
  utilities.checkAuthorization,
  utilities.handleErrors(invController.buildNewInventory)
)

router.post(
  "/add-inventory",
  utilities.checkLogin,
  utilities.checkAuthorization,
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invController.addInventory)
)

/* **********************************************
 * Edit Inventory (Protected)
 ********************************************** */
router.get(
  "/edit/:inv_id",
  utilities.checkLogin,
  utilities.checkAuthorization,
  utilities.handleErrors(invController.editInventoryView)
)

/* **********************************************
 * Update Inventory (Protected)
 ********************************************** */
router.post(
  "/update",
  utilities.checkLogin,
  utilities.checkAuthorization,
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  utilities.handleErrors(invController.updateInventory)
)

module.exports = router
