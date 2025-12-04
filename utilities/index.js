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
* ************************************ */
Util.buildClassificationGrid = async function(data){
    let grid
    if(data.length > 0){
        grid = '<ul id="inv-display">'
        data.forEach(vehicle => { 
            grid += '<li>'
            grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
            + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
            + 'details"><img src="' + vehicle.inv_thumbnail 
            +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
            +' on CSE Motors" /></a>'
            grid += '<div class="namePrice">'
            grid += '<hr />'
            grid += '<h2>'
            grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
            + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
            + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
            grid += '</h2>'
            grid += '<span>$' 
            + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
            grid += '</div>'
            grid += '</li>'
        })
        grid += '</ul>'
    } else { 
        grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
    }
    return grid
}

/* **************************************
* Build the inventory detail view HTML
* ************************************ */
Util.buildDetailPage = async function (vehicle) {
    // Use price formatting for currency and miles formatting for numbers
    const formattedPrice = new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency: 'USD',
        minimumFractionDigits: 0 // Optional: remove cents if not needed, or use 2
    }).format(vehicle.inv_price)

    const formattedMiles = new Intl.NumberFormat('en-US').format(vehicle.inv_miles)

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
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

/* **************************************
 * Build the classification select list
 * ************************************ */
Util.buildClassificationList = async function (classification_id = null) {
    let data = await invModel.getClassifications()
    let classificationList =
        '<select name="classification_id" id="classificationList" required>'
    classificationList += "<option value=''>Choose a Classification</option>"

    // Use data.rows because invModel.getClassifications() returns a result object
    data.rows.forEach((row) => {
        classificationList += `<option value="${row.classification_id}"`

        // Check if the current classification_id matches the one passed in (for sticky form)
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
    // Check if the JWT cookie exists
    if (req.cookies.jwt) {
        // Verify the token using the secret key
        jwt.verify(
            req.cookies.jwt,
            process.env.ACCESS_TOKEN_SECRET,
            function (err, accountData) {
                if (err) {
                    // Token invalid/expired: Clear cookie and redirect to login
                    req.flash("notice", "Please log in")
                    res.clearCookie("jwt")
                    return res.redirect("/account/login")
                }
                // Token is valid: Store account data in locals for view/controller access
                res.locals.accountData = accountData
                res.locals.loggedin = 1
                next()
            })
    } else {
        // No cookie found, proceed to next middleware/route handler
        next()
    }
}

/* ****************************************
 * Check Login
 * Middleware to check if the user is logged in
 * ************************************ */
Util.checkLogin = (req, res, next) => {
    // Check if the 'loggedin' flag was set by checkJWTToken middleware
    if (res.locals.loggedin) {
      next() // User is logged in, continue to the next step
    } else {
      // User is not logged in: Flash a notice and redirect to the login view
      req.flash("notice", "Please log in.")
      return res.redirect("/account/login")
    }
   }

/* ****************************************
 * Check Authorization (Role-Based Access)
 * Middleware to check if the user is an 'Employee' or 'Admin'
 * ************************************ */
Util.checkAuthorization = (req, res, next) => {
    // Check if accountData exists and the account_type is either 'Employee' or 'Admin'
    if (res.locals.loggedin && 
        (res.locals.accountData.account_type === 'Employee' || 
         res.locals.accountData.account_type === 'Admin')) {
        next() // Authorized, continue to the next step
    } else {
        // Not authorized: Flash a notice and redirect them to the home page
        req.flash("notice", "You are not authorized to access that page.")
        return res.redirect("/")
    }
}


module.exports = Util