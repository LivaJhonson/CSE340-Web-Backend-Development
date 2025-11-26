const express = require("express")
const router = new express.Router()
const utilities = require("../utilities/")
const accountController = require("../controllers/accountController")
const regValidate = require('../utilities/account-validation')

// GET login route
router.get("/login", utilities.handleErrors(accountController.buildLogin))

// POST login route
router.post("/login", utilities.handleErrors(accountController.loginAccount))

// GET registration route
router.get("/register", utilities.handleErrors(accountController.buildRegister))

// POST registration route
// 4: Route to process the registration form submission
// Process the registration data
router.post(
    "/register",
    regValidate.registationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount)
  )

  // Process the login attempt
router.post(
  "/login",
  (req, res) => {
    res.status(200).send('login process')
  }
)
  
module.exports = router
