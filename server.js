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
const inventoryRoute = require("./routes/inventoryRoute") // New: Route for inventory pages


/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout") // not at views root


/* ***********************
 * Routes
 *************************/
app.use(static)
//Index route
app.get("/", function(req, res){
  res.render("index", {title: "Home"})
})

// New: Inventory routes (e.g., /inventory/custom, /inventory/suv)
app.use("/inventory", inventoryRoute)


// ** Optional: Add a 404/Not Found route at the end of all routes **
// app.use((req, res, next) => {
//   res.status(404).render("errors/error", { title: "404 Not Found" })
// })

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
