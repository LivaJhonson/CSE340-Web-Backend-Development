const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const { validationResult } = require("express-validator")
const bcrypt = require("bcryptjs")
// JWT and Cookie REQUIREMENT: Require jsonwebtoken and dotenv
const jwt = require("jsonwebtoken")
require("dotenv").config()


/* ****************************************
* Deliver login view
**************************************** */
async function buildLogin(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/login", {
        title: "Login",
        nav,
        errors: null,
    })
}

/* ****************************************
* Deliver registration view
**************************************** */
async function buildRegister(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/register", {
        title: "Register",
        nav,
        errors: null
    })
}

/* ****************************************
* Process Registration
**************************************** */
async function registerAccount(req, res) {
    let nav = await utilities.getNav()
    const { account_firstname, account_lastname, account_email, account_password } = req.body

    // Hash the password before storing
    let hashedPassword
    try {
        // regular password and cost (salt is generated automatically)
        hashedPassword = await bcrypt.hashSync(account_password, 10)
    } catch (error) {
        req.flash("error", 'Sorry, there was an error processing the registration.')
        res.status(500).render("account/register", {
            title: "Registration",
            nav,
            errors: null,
        })
    }

    // === VALIDATION CHECK ===
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.render("account/register", {
            title: "Register",
            nav,
            errors: errors.array(),
            account_firstname,
            account_lastname,
            account_email
        })
    }

    // === If no validation errors, continue ===
    const regResult = await accountModel.registerAccount(
        account_firstname,
        account_lastname,
        account_email,
        hashedPassword
    )

    if (regResult) {
        req.flash("notice",
            `Congratulations, you're registered ${account_firstname}. Please log in.`
        )
        return res.redirect("/account/login")
    }

    // Model failed
    req.flash("error", "Sorry, the registration failed, please try again.")
    res.status(501).render("account/register", {
        title: "Register",
        nav,
        errors: null,
        account_firstname,
        account_lastname,
        account_email
    })
}


/* ****************************************
 * Process login request (REPLACES old loginAccount function)
 * ************************************ */
async function accountLogin(req, res) {
    let nav = await utilities.getNav()
    const { account_email, account_password } = req.body

    // Calls new model function to retrieve account data by email
    const accountData = await accountModel.getAccountByEmail(account_email)

    // Check if account data was returned (i.e., email exists)
    if (!accountData) {
        req.flash("notice", "Please check your credentials and try again.")
        res.status(400).render("account/login", {
            title: "Login",
            nav,
            errors: null,
            account_email,
        })
        return
    }

    try {
        // Compare submitted password against the hashed password from the database
        if (await bcrypt.compare(account_password, accountData.account_password)) {
            // Remove the hash before creating the token payload
            delete accountData.account_password

            // Create the JWT token (expires in 1 hour)
            const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })

            // Cookie creation based on environment
            if (process.env.NODE_ENV === 'development') {
                res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
            } else {
                // Secure flag is for production (HTTPS only)
                res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
            }
            return res.redirect("/account/") // Redirect to the account management view
        }
        else {
            // Passwords do not match
            req.flash("message notice", "Please check your credentials and try again.")
            res.status(400).render("account/login", {
                title: "Login",
                nav,
                errors: null,
                account_email,
            })
        }
    } catch (error) {
        // Catch errors during comparison or token creation
        throw new Error('Access Forbidden')
    }
}


/* ****************************************
 * Build account management view
 * ************************************ */
async function buildAccountManagement(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/management", { // Renders the new view file
        title: "Account Management",
        nav,
        errors: null,
    })
}


module.exports = {
    buildLogin,
    buildRegister,
    registerAccount,
    accountLogin, // New login processor
    buildAccountManagement // New view builder function
}