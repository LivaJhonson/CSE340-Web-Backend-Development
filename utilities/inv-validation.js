const utilities = require(".")
const { body, validationResult } = require("express-validator")
const invModel = require("../models/inventory-model")
const validate = {}

/* **********************************
 * Classification Rules
 * ********************************* */
validate.classificationRules = () => {
  return [
    // Classification name is required, must not contain spaces or special characters, and cannot already exist
    body("classification_name")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Please provide a classification name.")
      .matches(/^[A-Za-z0-9]+$/) // Must contain only letters and numbers (no spaces/special chars)
      .withMessage("Classification name cannot contain spaces or special characters.")
      .custom(async (classification_name) => {
        const classificationExists = await invModel.checkExistingClassification(classification_name)
        if (classificationExists){
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
    let nav = await utilities.getNav()
    res.render("./inventory/add-classification", {
      title: "Add New Classification",
      nav,
      errors,
      classification_name, // Sticky Form (even though it's one field)
      messages: res.locals.messages,
    })
    return
  }
  next()
}

/* **********************************
 * Inventory Item Rules
 * ********************************* */
validate.inventoryRules = () => {
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
      .isInt({ min: 1886, max: new Date().getFullYear() + 1 }) // Check for reasonable year
      .withMessage("Year must be a valid four-digit number."),
    
    body("inv_description")
      .trim()
      .isLength({ min: 10 })
      .withMessage("Description must be at least 10 characters."),

    body("inv_image")
      .trim()
      .matches(/^\/images\/vehicles\/.*$/)
      .withMessage("Image path must be a valid path."),

    body("inv_thumbnail")
      .trim()
      .matches(/^\/images\/vehicles\/.*-tn\..*$/)
      .withMessage("Thumbnail path must be a valid path."),

    body("inv_price")
      .trim()
      .isNumeric()
      .isFloat({ min: 0 })
      .withMessage("Price must be a valid positive number."),

    body("inv_miles")
      .trim()
      .isNumeric()
      .isInt({ min: 0 })
      .withMessage("Miles must be a valid positive integer."),

    body("inv_color")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Color is required."),
  ]
}

/* ************************************
 * Check inventory data and return errors
 * ********************************** */
validate.checkInventoryData = async (req, res, next) => {
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

  let errors = validationResult(req)

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    let classificationList = await utilities.buildClassificationList(classification_id) // Rebuild the list with sticky classification
    
    res.render("./inventory/add-inventory", {
      title: "Add New Vehicle",
      nav,
      classificationList,
      errors,
      // Sticky Form Data
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
    return
  }
  next()
}

module.exports = validate