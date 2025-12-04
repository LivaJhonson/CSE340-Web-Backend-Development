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

    // Prevent crash if no records found
    if (!data || data.length === 0) {
      throw new Error("No vehicles found for this classification.")
    }
  
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
  if (!data || data.length === 0) {
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

/* ***************************
 * Build the Inventory Management View (Task 1)
 * * UPDATED: Added classification list to the view data to enable item selection.
 * ************************** */
invCont.buildManagementView = async function (req, res, next) {
  let nav = await utilities.getNav()
  
  // Call the utility function to build the classification select list
  const classificationSelect = await utilities.buildClassificationList()
  
  res.render("./inventory/management", {
    title: "Inventory Management",
    nav,
    messages: res.locals.messages, // To display flash messages
    classificationSelect, // Pass the classification list HTML to the view
  })
}

/* ***************************
 * Deliver New Classification View (Task 2)
 * ************************** */
invCont.buildNewClassification = async function (req, res, next) {
  let nav = await utilities.getNav()
  res.render("./inventory/add-classification", {
    title: "Add New Classification",
    nav,
    errors: null, // Start with no errors
    messages: res.locals.messages,
  })
}

/* ***************************
 * Process New Classification (Task 2)
 * ************************** */
invCont.addClassification = async function (req, res) {
  const { classification_name } = req.body

  const classResult = await invModel.addClassification(classification_name)

  if (classResult) {
    req.flash(
      "notice",
      `The new classification "${classification_name}" was successfully added.`
    )
    // Rebuild navigation to show the new classification immediately
    let nav = await utilities.getNav() 
    
    // Render the management view with success message
    res.status(201).render("./inventory/management", {
      title: "Inventory Management",
      nav,
      messages: res.locals.messages,
    })
  } else {
    req.flash("error", "Sorry, the new classification addition failed.")
    let nav = await utilities.getNav()
    res.status(501).render("./inventory/add-classification", {
      title: "Add New Classification",
      nav,
      errors: null,
      messages: res.locals.messages,
    })
  }
}

/* ***************************
 * Deliver New Inventory View (Task 3)
 * ************************** */
invCont.buildNewInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  // Build the classification select list
  let classificationList = await utilities.buildClassificationList()
  
  res.render("./inventory/add-inventory", {
    title: "Add New Vehicle",
    nav,
    classificationList,
    errors: null,
    messages: res.locals.messages,
    // Pass empty values for sticky form defaults
    inv_make: "", 
    inv_model: "", 
    inv_year: "", 
    inv_description: "", 
    inv_image: "/images/vehicles/no-image.png", // Use default path
    inv_thumbnail: "/images/vehicles/no-image-tn.png", // Use default path
    inv_price: "", 
    inv_miles: "", 
    inv_color: "", 
  })
}

/* ***************************
 * Process New Inventory (Task 3)
 * ************************** */
invCont.addInventory = async function (req, res) {
  const { 
    inv_make, 
    inv_model, 
    inv_year, 
    inv_description, 
    inv_image, 
    inv_thumbnail, 
    inv_price, 
    inv_miles, 
    inv_color, 
    classification_id 
  } = req.body

  const invResult = await invModel.addInventory(
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
  )

  if (invResult) {
    req.flash(
      "notice",
      `The new vehicle, ${inv_make} ${inv_model}, was successfully added.`
    )
    let nav = await utilities.getNav()
    
    // Navigate back to the management view
    res.status(201).render("./inventory/management", {
      title: "Inventory Management",
      nav,
      messages: res.locals.messages,
    })
  } else {
    req.flash("error", "Sorry, the vehicle addition failed.")
    let nav = await utilities.getNav()
    let classificationList = await utilities.buildClassificationList(classification_id)

    // Render the add-inventory view with failure message
    res.status(501).render("./inventory/add-inventory", {
      title: "Add New Vehicle",
      nav,
      classificationList,
      errors: null,
      // Pass back all form data for stickiness
      inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, 
      messages: res.locals.messages,
    })
  }
}


/* ***************************
 * Return Inventory by Classification As JSON
 * * NEW FUNCTION: Handles AJAX request from inventory.js 
 * and returns vehicle data for a selected classification.
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  // Collects the classification_id from the URL parameters
  // Uses parseInt() for security and type casting
  const classification_id = parseInt(req.params.classification_id)
  
  // Calls the model function to retrieve data. Note: The model function must be named 'getInventoryByClassificationId'.
  const invData = await invModel.getInventoryByClassificationId(classification_id) 
  
  // Check if any data was returned and if the first item has an inv_id
  if (invData[0] && invData[0].inv_id) {
    // If successful, return the data array as a JSON object
    return res.json(invData)
  } else {
    // If no data, throw an error for Express to handle
    next(new Error("No data returned"))
  }
}


module.exports = invCont