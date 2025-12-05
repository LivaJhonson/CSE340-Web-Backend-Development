const utilities = require(".")
const { body, validationResult } = require("express-validator")
const invModel = require("../models/inventory-model")
const validate = {}

/* **********************************
 * Classification Rules
 * ********************************* */
validate.classificationRules = () => {
  return [
    body("classification_name")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Please provide a classification name.")
      .matches(/^[A-Za-z0-9\s-]+$/) 
      .withMessage("Classification name can only contain letters, numbers, spaces, and hyphens.")
      .custom(async (classification_name) => {
        const classificationExists = await invModel.checkExistingClassification(classification_name)
        if (classificationExists) {
          throw new Error("Classification already exists.")
        }
      }),
  ]
}

/* ************************************
 * Check classification data and return errors
 * ********************************** */
validate.checkClassificationData = async (req, res, next) => {
  const { classification_name } = req.body
  let errors = validationResult(req)

  if (!errors.isEmpty()) {
    // Flash message removed here.
    let nav = await utilities.getNav()
    res.render("./inventory/add-classification", {
      title: "Add New Classification",
      nav,
      errors, 
      classification_name,
      messages: res.locals.messages, 
    })
    return
  }
  next()
}

/* **********************************
 * Inventory Item Rules (Used for Adding/Updating)
 * ********************************* */
validate.addInventoryRules = () => {
  return [
    body("classification_id")
      .isInt({ min: 1 })
      .withMessage("Please select a valid classification."),

    body("inv_make")
      .trim()
      .isLength({ min: 3 })
      .withMessage("Make must be at least 3 characters."),

    body("inv_model")
      .trim()
      .isLength({ min: 3 })
      .withMessage("Model must be at least 3 characters."),

    body("inv_year")
      .trim()
      .isInt({ min: 1886, max: new Date().getFullYear() + 1 })
      .withMessage("Year must be a valid four-digit number (e.g., 2024)."),

    body("inv_description")
      .trim()
      .isLength({ min: 20 })
      .withMessage("Description must be at least 20 characters."),

    body("inv_image")
      .trim()
      .matches(/^\/images\/vehicles\/.*$/)
      .withMessage("Image path must start with '/images/vehicles/'."),

    body("inv_thumbnail")
      .trim()
      .matches(/^\/images\/vehicles\/.*-tn\..*$/)
      .withMessage("Thumbnail path must be a valid path ending in '-tn.extension'."),

    body("inv_price")
      .trim()
      .isNumeric()
      .isFloat({ min: 0 })
      .withMessage("Price must be a valid positive number (e.g., 25000)."),

    body("inv_miles")
      .trim()
      .isNumeric()
      .isInt({ min: 0 })
      .withMessage("Miles must be a valid positive integer (e.g., 50000)."),

    body("inv_color")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Color is required."),
  ]
}

/* ************************************
 * Check inventory data and return errors (Used for Adding)
 * ********************************** */
validate.checkInventoryData = async (req, res, next) => {
  const {
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
    classification_id,
  } = req.body

  let errors = validationResult(req)

  if (!errors.isEmpty()) {
    // Flash message removed here.
    let nav = await utilities.getNav()
    const classificationSelect = await utilities.buildClassificationList(classification_id)

    let viewName
    let titleName

    // Determine which view to render
    if (inv_id) {
      viewName = "./inventory/edit-inventory"
      titleName = "Edit " + inv_make + " " + inv_model
    } else {
      viewName = "./inventory/add-inventory"
      titleName = "Add New Vehicle"
    }

    res.render(viewName, {
      title: titleName,
      nav,
      classificationSelect,
      errors, 
      
      // Sticky data
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
      classification_id,

      messages: res.locals.messages,
    })
    return
  }
  next()
}

/* ************************************
 * Check update data and return errors, directing to edit view
 * ********************************** */
validate.checkUpdateData = async (req, res, next) => {
  const {
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
    classification_id,
  } = req.body

  let errors = validationResult(req)

  if (!errors.isEmpty()) {
    // Flash message removed here.
    let nav = await utilities.getNav()
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = inv_make + " " + inv_model

    // Always render the edit view upon error
    res.render("./inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect: classificationSelect,
      errors, 

      // Sticky data
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
      classification_id,
      
      messages: res.locals.messages,
    })
    return
  }
  next()
}

module.exports = validate