/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const env = require("dotenv").config()
const app = express()
const static = require("./routes/static")
const baseController = require("./controllers/baseController")
const inventoryRoute = require("./routes/inventoryRoute")
const utilities = require("./utilities/")


/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs")
app.set("views", "./views")
app.use(expressLayouts)
app.set("layout", "./layouts/layout") // not at views root


/* ***********************
 * Routes
 *************************/
app.use(static)
//Index route
app.get("/", utilities.handleErrors(baseController.buildHome))

// Inventory routes
app.use("/inv", inventoryRoute)

 // File Not Found Route
 app.use(async (req, res, next) => {
  next({status: 404, message: 'Sorry, we appear to have lost that page.'})
  })

/* ***********************
 * Express Error Handler
 * Place after all other middleware
 ************************* */
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav()
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)
  
  // Determine status code, default to 500 if none is present
  let status = err.status || 500 
  let title, message
  
  // Set generic message based on status (Task 2/3 requirement)
  if (status == 404) {
    message = err.message // Use the specific 404 message passed in
    title = "404 Not Found"
  } else {
    message = 'Oh no! There was a crash. Maybe try a different route?' // Generic 500 message
    title = 'Server Error'
  }

  // Set the HTTP status code and render the error view
  res.status(status).render("errors/error", {
    title,
    message,
    nav
  })
})

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT
const host = process.env.HOST

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})
