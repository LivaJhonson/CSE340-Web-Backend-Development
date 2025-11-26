const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const { validationResult } = require("express-validator")
const bcrypt = require("bcryptjs")


/* ****************************************
* Deliver login view
**************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null, // Added errors: null for consistency
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

  // === NEW: VALIDATION CHECK ===
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.render("account/register", {
      title: "Register",
      nav,
      errors: errors.array(),   // Pass errors to the view
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
* Process Login
**************************************** */
async function loginAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body

  const loginResult = await accountModel.login(account_email, account_password)

  if (loginResult) {
    req.flash("success", `Welcome back, ${loginResult.account_firstname}!`)
    res.redirect("/") // redirect to homepage or dashboard
  } else {
    req.flash("error", "Invalid email or password.")
    res.redirect("/account/login")
  }
}

module.exports = { buildLogin, buildRegister, registerAccount, loginAccount }
