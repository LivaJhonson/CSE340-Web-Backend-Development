const express = require("express")
const router = new express.Router()
const utilities = require("../utilities/")
const accountController = require("../controllers/accountController")
const regValidate = require('../utilities/account-validation')

// GET login route
router.get("/login", utilities.handleErrors(accountController.buildLogin))

// NOTE: The previous POST /login route has been replaced below.

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
 
// *****************************************************************
// JWT and Cookie REQUIREMENT: Process the login request
// This route now applies validation rules and calls the new controller function.
// *****************************************************************
router.post(
  "/login",
  regValidate.loginRules(), // Validation rules for login data
  regValidate.checkLoginData, // Check for and handle validation errors
  utilities.handleErrors(accountController.accountLogin) // New function to authenticate and set JWT
)

// *****************************************************************
// JWT and Cookie REQUIREMENT: Route to deliver the Account Management view
// This route is the redirect target after a successful login.
// *****************************************************************
router.get(
    "/",
    // Middleware to check if the user is logged in before allowing access to the view
    utilities.checkLogin, 
    utilities.handleErrors(accountController.buildAccountManagement)
)
 
module.exports = router