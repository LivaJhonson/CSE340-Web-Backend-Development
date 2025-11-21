// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities/")

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

// Route to build inventory detail view
// This route uses the invId parameter to fetch the specific vehicle details
router.get("/detail/:invId", utilities.handleErrors(invController.buildByInvId));

// New requirement for Assignment 3, Task 3: Intentional 500 Error Route
router.get("/throwerror", utilities.handleErrors(invController.throwIntentionalError))

module.exports = router;