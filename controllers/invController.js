const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
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
 * Intentional 500 Error Test (For Assignment 3, Task 3)
 * ************************** */
invCont.throwIntentionalError = async function (req, res, next) {
  // This line intentionally throws an error, which will be caught 
  // by the utilities.handleErrors HOF and passed to the Express Error Handler.
  throw new Error("This is an intentional 500 server error test for Assignment 3.")
}

module.exports = invCont