const accountModel = require("../models/account-model")
const utilities = require("../utilities/")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
require("dotenv").config()

/* ****************************************
 * Deliver login view
 * *************************************** */
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
 * *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  })
}

/* ****************************************
 * Process Registration
 * *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  // Hash the password before storing
  let hashedPassword
  try {
    // Regular password and cost (salt rounds) to hash the password
    hashedPassword = await bcrypt.hash(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
    return
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, ${account_firstname}, you\'re registered. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }
}

/* ****************************************
 * Process login request
 * *************************************** */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body

  const accountData = await accountModel.getAccountByEmail(account_email)
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
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      // Redirect to the Account Management View on successful login
      return res.redirect("/account/") 
    }
  } catch (error) {
    return new Error('Access Forbidden')
  }
}


/* ****************************************
 * Deliver account management view
 * *************************************** */
async function buildAccountManagement(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/management", {
        title: "Account Management",
        nav,
        errors: null,
        // The accountData is available via res.locals.accountData from checkJWTToken
    })
}

/* ****************************************
 * Process Logout
 * *************************************** */
async function accountLogout(req, res) {
    // Clear the JWT cookie
    res.clearCookie("jwt")
    // Redirect to the home page or login page
    req.flash("notice", "You have been successfully logged out.")
    res.redirect("/") 
}


/* ****************************************
 * Deliver account update view (GET /account/update)
 * *************************************** */
async function buildAccountUpdate(req, res, next) {
    let nav = await utilities.getNav()
    
    // Get the current account data from res.locals (set by checkJWTToken)
    const accountData = res.locals.accountData;

    res.render("account/update", {
        title: "Edit Account",
        nav,
        errors: null,
        // Pass current data for sticky fields
        account_id: accountData.account_id,
        account_firstname: accountData.account_firstname,
        account_lastname: accountData.account_lastname,
        account_email: accountData.account_email,
    })
}

/* ****************************************
 * Process account details update (POST /account/update/details)
 * *************************************** */
async function updateAccount(req, res, next) {
    let nav = await utilities.getNav()
    const { account_id, account_firstname, account_lastname, account_email } = req.body
    
    const updateResult = await accountModel.updateAccountDetails(
        account_id,
        account_firstname,
        account_lastname,
        account_email
    )

    if (updateResult) {
        // 1. Successful update: Re-fetch the new account data
        const accountData = await accountModel.getAccountById(account_id)
        
        // 2. Re-issue the JWT token with the new information
        delete accountData.account_password
        const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
        
        // 3. Set the new JWT cookie
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
        
        req.flash("notice", `Congratulations, your account information has been successfully updated.`)
        res.redirect("/account/") // Redirect back to management page
    } else {
        // Failed update, render the form again with errors
        req.flash("notice", "Sorry, the update failed.")
        // Re-render the page, ensuring sticky data is passed
        res.status(501).render("account/update", {
            title: "Edit Account",
            nav,
            errors: null,
            account_id,
            account_firstname,
            account_lastname,
            account_email,
        })
    }
}

/* ****************************************
 * Process password update (POST /account/update/password)
 * *************************************** */
async function updatePassword(req, res, next) {
    let nav = await utilities.getNav()
    const { account_id, account_password } = req.body

    // Hash the password before storing
    let hashedPassword
    try {
        hashedPassword = await bcrypt.hash(account_password, 10)
    } catch (error) {
        req.flash("notice", 'Sorry, there was an error updating the password.')
        res.status(500).redirect("/account/update")
        return
    }

    const updateResult = await accountModel.updateAccountPassword(
        account_id,
        hashedPassword
    )

    if (updateResult) {
        // Password updated successfully. We don't need to re-issue JWT here.
        req.flash("notice", `Congratulations, your password has been successfully updated.`)
        res.redirect("/account/") // Redirect back to management page
    } else {
        // Failed update, render the form again with errors
        req.flash("notice", "Sorry, the password update failed.")
        res.status(501).redirect("/account/update")
    }
}

module.exports = { 
    buildLogin, 
    buildRegister, 
    registerAccount, 
    accountLogin, 
    buildAccountManagement,
    accountLogout,
    buildAccountUpdate, // New
    updateAccount, // New
    updatePassword // New
}