// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities/")
// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

module.exports = router;

// New requirement for Assignment 3, Task 3: Intentional 500 Error Route
router.get("/throwerror", utilities.handleErrors(invController.throwIntentionalError))