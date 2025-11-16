/* *********************************
 * Inventory routes
 * /inventory/
 **********************************/
const express = require("express")
const router = express.Router()

// Route to build custom vehicle view
router.get("/custom", function(req, res) {
  res.render("inventory/custom", { title: "Custom Vehicles" })
})

// Route to build sedan vehicle view
router.get("/sedan", function(req, res) {
  res.render("inventory/sedan", { title: "Sedan Vehicles" })
})

// Route to build SUV vehicle view
router.get("/suv", function(req, res) {
  res.render("inventory/suv", { title: "SUV Vehicles" })
})

// Route to build truck vehicle view
router.get("/truck", function(req, res) {
  res.render("inventory/truck", { title: "Truck Vehicles" })
})

module.exports = router