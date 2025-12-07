const invModel = require("../models/inventory-model")
const Util = {}

// JWT and Cookie REQUIREMENT: Require jsonwebtoken and dotenv
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ************************
 * Constructs the nav HTML unordered list
 * ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  
  // NEW ENHANCEMENT: Add Search link to the navigation
  list += '<li><a href="/search" title="Search Inventory">Search</a></li>'

  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })

  list += "</ul>"
  return list
}

/* **************************************
 * Build the classification view HTML
 * NOTE: Renaming to buildInventoryGrid for generic use in search results.
 * The function logic remains identical to the original buildClassificationGrid.
 * ************************************ */
Util.buildInventoryGrid = async function (data) {
  let grid

  if (data.length > 0) {
    grid = '<ul id="inv-display">'
    data.forEach((vehicle) => {
      grid += "<li>"
      grid +=
        '<a href="../../inv/detail/' +
        vehicle.inv_id +
        '" title="View ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        'details"><img src="' +
        vehicle.inv_thumbnail +
        '" alt="Image of ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' on CSE Motors" /></a>'

      grid += '<div class="namePrice">'
      grid += "<hr />"
      grid += "<h2>"
      grid +=
        '<a href="../../inv/detail/' +
        vehicle.inv_id +
        '" title="View ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' details">' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        "</a>"
      grid += "</h2>"

      grid +=
        "<span>$" +
        new Intl.NumberFormat("en-US").format(vehicle.inv_price) +
        "</span>"
      grid += "</div>"
      grid += "</li>"
    })
    grid += "</ul>"
  } else {
    grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }

  return grid
}

/* **************************************
 * Build the inventory detail view HTML
 * ************************************ */
Util.buildDetailPage = async function (vehicle) {
// ... (The rest of Util.buildDetailPage remains unchanged)
  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(vehicle.inv_price)

  const formattedMiles = new Intl.NumberFormat("en-US").format(
    vehicle.inv_miles
  )

  let detailHTML = `
    <div class="detail-container">
      <h1 class="detail-title">${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}</h1>
      <div class="detail-content-grid">
        <img class="detail-img" src="${vehicle.inv_image}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model}">
        <div class="detail-info">
          <h2>${vehicle.inv_make} ${vehicle.inv_model} Details</h2>
          <ul class="detail-list">
            <li><span>Price:</span> ${formattedPrice}</li>
            <li><span>Description:</span> ${vehicle.inv_description}</li>
            <li><span>Color:</span> ${vehicle.inv_color}</li>
            <li><span>Miles:</span> ${formattedMiles}</li>
          </ul>
        </div>
      </div>
    </div>
  `

  return detailHTML
}

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for General Error Handling
 **************************************** */
Util.handleErrors =
  (fn) =>
  (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next)

/* **************************************
 * Build the classification select list
 * ************************************ */
Util.buildClassificationList = async function (classification_id = null) {
// ... (The rest of Util.buildClassificationList remains unchanged)
  let data = await invModel.getClassifications()

  let classificationList =
    '<select name="classification_id" id="classificationList" required>'
  classificationList += "<option value=''>Choose a Classification</option>"

  data.rows.forEach((row) => {
    classificationList += `<option value="${row.classification_id}"`

    if (
      classification_id != null &&
      Number(row.classification_id) === Number(classification_id)
    ) {
      classificationList += " selected"
    }

    classificationList += `>${row.classification_name}</option>`
  })

  classificationList += "</select>"
  return classificationList
}

/* ****************************************
 * Middleware to check token validity
 * JWT/Cookie REQUIREMENT
 **************************************** */
Util.checkJWTToken = (req, res, next) => {
// ... (The rest of Util.checkJWTToken remains unchanged)
  if (req.cookies.jwt) {
    jwt.verify(
      req.cookies.jwt,
      process.env.ACCESS_TOKEN_SECRET,
      function (err, accountData) {
        if (err) {
          req.flash("notice", "Please log in")
          res.clearCookie("jwt")
          return res.redirect("/account/login")
        }

        res.locals.accountData = accountData
        res.locals.loggedin = 1
        next()
      }
    )
  } else {
    next()
  }
}

/* ****************************************
 * Check Login Middleware
 * ************************************ */
Util.checkLogin = (req, res, next) => {
// ... (The rest of Util.checkLogin remains unchanged)
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
}

/* ****************************************
 * Task 2: Check access for Employee or Admin
 **************************************** */
Util.checkEmployeeOrAdminAccess = (req, res, next) => {
// ... (The rest of Util.checkEmployeeOrAdminAccess remains unchanged)
  if (
    res.locals.loggedin &&
    (res.locals.accountData.account_type === "Employee" ||
      res.locals.accountData.account_type === "Admin")
  ) {
    next()
  } else {
    req.flash(
      "notice",
      "You must be an Employee or Admin to access Inventory Management."
    )
    return res.redirect("/account/login")
  }
}

/* ****************************************
 * Original Role-Based Authorization
 **************************************** */
Util.checkAuthorization = (req, res, next) => {
// ... (The rest of Util.checkAuthorization remains unchanged)
  if (
    res.locals.loggedin &&
    (res.locals.accountData.account_type === "Employee" ||
      res.locals.accountData.account_type === "Admin")
  ) {
    next()
  } else {
    req.flash("notice", "You are not authorized to access that page.")
    return res.redirect("/")
  }
}

/* **************************************
 * Build account link for header
 * ************************************ */
Util.buildAccountLink = function (res) {
// ... (The rest of Util.buildAccountLink remains unchanged)
  let link = ""

  if (res.locals.loggedin && res.locals.accountData) {
    link = `<li><a href="/" title="Go to Welcome Page">Welcome ${res.locals.accountData.account_firstname}</a></li>`
  } else {
    link = `<li><a href="/account/login" title="Click to log in">My Account</a></li>`
  }

  return link
}

module.exports = Util