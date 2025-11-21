// Needed Resources 
const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 * Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

/* ***************************
 * Build inventory by inventory Id View
 * *************************** */
invCont.buildByInvId = async function (req, res, next) {
  const inv_id = req.params.invId
  const data = await invModel.getInventoryById(inv_id) // Get single vehicle data from Model

  // Error check: If no data is found, trigger a 404 error
  if (!data) {
    // Since we are using utilities.handleErrors() in the route, we can simply throw an error
    // and Express will catch it and use the error view.
    throw new Error("Sorry, the vehicle you requested could not be found.")
  }

  const nav = await utilities.getNav()
  // Build the HTML using a utility function (to be added to utilities/index.js)
  const detailView = await utilities.buildDetailPage(data) 

  // Render the detail view
  res.render("inventory/detail", {
    title: `${data.inv_year} ${data.inv_make} ${data.inv_model}`,
    nav,
    detailView,
  })
}

/* ***************************
 * Intentional 500 Error Test (For Assignment 3, Task 3)
 * ************************** */
invCont.throwIntentionalError = async function (req, res, next) {
  // This line intentionally throws an error, which will be caught 
  // by the utilities.handleErrors HOF and passed to the Express Error Handler.
  throw new Error("This is an intentional 500 server error test for Assignment 3.")
}

module.exports = invCont