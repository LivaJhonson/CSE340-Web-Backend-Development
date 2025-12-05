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
 * ************************** */
invCont.buildByInvId = async function (req, res, next) {
  const inv_id = req.params.invId
  const data = await invModel.getInventoryById(inv_id)

  // Error check: If no data is found
  if (!data || data.length === 0) {
    throw new Error("Sorry, the vehicle you requested could not be found.")
  }

  const nav = await utilities.getNav()
  const detailView = await utilities.buildDetailPage(data)

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
  throw new Error("This is an intentional 500 server error test for Assignment 3.")
}

/* ***************************
 * Build the Inventory Management View (Task 1)
 * ************************** */
invCont.buildManagementView = async function (req, res, next) {
  let nav = await utilities.getNav()
  const classificationSelect = await utilities.buildClassificationList()

  res.render("./inventory/management", {
    title: "Inventory Management",
    nav,
    messages: res.locals.messages,
    classificationSelect,
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
    errors: null,
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
    req.flash("notice", `The new classification "${classification_name}" was successfully added.`)
    let nav = await utilities.getNav()

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
  let classificationSelect = await utilities.buildClassificationList()

  res.render("./inventory/add-inventory", {
    title: "Add New Vehicle",
    nav,
    classificationSelect,
    errors: null,
    messages: res.locals.messages,
    inv_make: "",
    inv_model: "",
    inv_year: "",
    inv_description: "",
    inv_image: "/images/vehicles/no-image.png",
    inv_thumbnail: "/images/vehicles/no-image-tn.png",
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
    req.flash("notice", `The new vehicle, ${inv_make} ${inv_model}, was successfully added.`)
    let nav = await utilities.getNav()

    res.status(201).render("./inventory/management", {
      title: "Inventory Management",
      nav,
      messages: res.locals.messages,
    })
  } else {
    req.flash("error", "Sorry, the vehicle addition failed.")
    let nav = await utilities.getNav()
    let classificationSelect = await utilities.buildClassificationList(classification_id)

    res.status(501).render("./inventory/add-inventory", {
      title: "Add New Vehicle",
      nav,
      classificationSelect,
      errors: null,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      messages: res.locals.messages,
    })
  }
}

/* ***************************
 * Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  const itemData = await invModel.getInventoryById(inv_id)

  if (!itemData) {
    req.flash("notice", "Sorry, that vehicle could not be found.")
    return res.redirect("/inv/")
  }

  let nav = await utilities.getNav()
  const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`

  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    // Price must be converted/cleaned for the input field
    inv_price: itemData.inv_price.toString().replace(/,/g, ""), 
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id,
  })
}

/* ***************************
 * Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body

  const updateResult = await invModel.updateInventory(
    inv_id,  
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/")
  } else {
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the update failed.")
    res.status(501).render("inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id,
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
    })
  }
}

/* ***************************
 * Return Inventory as JSON (AJAX)
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)

  if (invData[0] && invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

module.exports = invCont