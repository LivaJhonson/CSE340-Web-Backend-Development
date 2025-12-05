// Needed Resources 
const express = require("express")
const router = new express.Router()
const accountController = require("../controllers/accountController")
const utilities = require("../utilities/")
const regValidate = require("../utilities/account-validation")

// Route to build account management view (Requires login)
router.get("/", 
    utilities.checkLogin, // Ensure user is logged in
    utilities.handleErrors(accountController.buildAccountManagement)
)

// Route to build login view
router.get("/login", utilities.handleErrors(accountController.buildLogin))

// Route to build registration view
router.get("/register", utilities.handleErrors(accountController.buildRegister))

// Route to process the registration submission
router.post(
    "/register",
    regValidate.registationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount)
)

// Route to process the login attempt (POST to login)
// Note: The login POST route should use the login rules and check data before processing
router.post(
    "/login",
    regValidate.loginRules(),
    regValidate.checkLoginData,
    utilities.handleErrors(accountController.accountLogin)
)

// Task 6: Route to handle logout (clears JWT cookie)
router.get("/logout", utilities.handleErrors(accountController.accountLogout))


// ------------------------------------
// TASK 5 ROUTES: Account Update & Password Change
// ------------------------------------

// Route 1 (FIX): GET to deliver the account update form
// This is likely the route that was missing and caused the 404
router.get("/update", 
    utilities.checkLogin, 
    utilities.handleErrors(accountController.buildAccountUpdate)
)

// Route 2: POST to process the account details update (name, email)
router.post(
    "/update/details", 
    utilities.checkLogin, 
    regValidate.updateDetailsRules(),
    regValidate.checkUpdateDetails,
    utilities.handleErrors(accountController.updateAccount)
)

// Route 3: POST to process the password change
router.post(
    "/update/password", 
    utilities.checkLogin, 
    regValidate.updatePasswordRules(),
    regValidate.checkUpdatePassword,
    utilities.handleErrors(accountController.updatePassword)
)

module.exports = router;