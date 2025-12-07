const pool = require("../database/")

/* ***************************
 * Get all classification data
 **************************** */
async function getClassifications() {
  return await pool.query(
    "SELECT * FROM public.classification ORDER BY classification_name"
  )
}

/* ***************************
 * Get inventory by classification_id
 **************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i
       JOIN public.classification AS c
       ON i.classification_id = c.classification_id
       WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getInventoryByClassificationId error: " + error)
  }
}

/* ***************************
 * Get inventory item by inv_id
 **************************** */
async function getInventoryById(invId) {
  try {
    const data = await pool.query(
      `SELECT * FROM inventory
       WHERE inv_id = $1`,
      [invId]
    )
    return data.rows[0]
  } catch (error) {
    console.error("getInventoryById error: " + error)
  }
}

/* ***************************
 * Check existing classification name
 **************************** */
async function checkExistingClassification(classification_name) {
  try {
    const sql = "SELECT * FROM classification WHERE classification_name = $1"
    const result = await pool.query(sql, [classification_name])
    return result.rowCount
  } catch (error) {
    return error.message
  }
}

/* ***************************
 * Add new classification
 **************************** */
async function addClassification(classification_name) {
  try {
    const sql =
      "INSERT INTO classification (classification_name) VALUES ($1) RETURNING *"
    return await pool.query(sql, [classification_name])
  } catch (error) {
    return error.message
  }
}

/* ***************************
 * Add new inventory record
 **************************** */
async function addInventory(
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
) {
  try {
    const sql = `
      INSERT INTO inventory (
        inv_make, inv_model, inv_year, inv_description,
        inv_image, inv_thumbnail, inv_price, inv_miles,
        inv_color, classification_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `

    const result = await pool.query(sql, [
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
    ])

    return result.rowCount
  } catch (error) {
    return error.message
  }
}

/* ***************************
 * Update inventory record
 **************************** */
async function updateInventory(
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
) {
  try {
    const sql = `
      UPDATE public.inventory
      SET
        inv_make = $1,
        inv_model = $2,
        inv_description = $3,
        inv_image = $4,
        inv_thumbnail = $5,
        inv_price = $6,
        inv_year = $7,
        inv_miles = $8,
        inv_color = $9,
        classification_id = $10
      WHERE inv_id = $11
      RETURNING *
    `

    const result = await pool.query(sql, [
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
      inv_id,
    ])

    return result.rows[0]
  } catch (error) {
    console.error("updateInventory error: " + error)
    return null
  }
}

/* ***************************
 * Delete Inventory Item
 * Carries out a deletion of the inventory item based on inv_id
 **************************** */
async function deleteInventoryItem(inv_id) {
  try {
    const sql = "DELETE FROM inventory WHERE inv_id = $1"
    const data = await pool.query(sql, [inv_id])
    return data
  } catch (error) {
    console.error("deleteInventoryItem error: " + error)
    new Error("Delete Inventory Error")
  }
}

/* ****************************************
 * ADD TO: models/inventory-model.js (ensure you export this function)
 * *************************************** */

/* ******************************************************
 * Get all inventory items based on search term and max price
 * Database Interaction: Queries existing 'inventory' table
 * ***************************************************** */
async function getInventoryBySearchAndPrice(searchTerm, maxPrice) {
  try {
      const pool = require('../database/');

      // Format the search term for case-insensitive partial matching
      // The '%$1%' pattern allows searching for the term anywhere in the field
      const formattedSearchTerm = `%${searchTerm}%`;

      // SQL uses ILIKE (case-insensitive LIKE) for searching make, model, or description
      // and filters by the price placeholder $2
      const sql = `
          SELECT
              inv_id, inv_make, inv_model, inv_year, inv_description, inv_price, inv_miles, inv_color, classification_id, inv_image, inv_thumbnail
          FROM
              inventory
          WHERE
              (inv_make ILIKE $1 OR inv_model ILIKE $1 OR inv_description ILIKE $1)
          AND
              inv_price <= $2
      `;
      
      // Best Practice: Use prepared statements for safe data handling
      const data = await pool.query(sql, [formattedSearchTerm, maxPrice]);
      return data.rows;

  } catch (error) {
      console.error("getInventoryBySearchAndPrice error: " + error);
      throw error;
  }
}

module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getInventoryById,
  checkExistingClassification,
  addClassification,
  addInventory,
  updateInventory,
  deleteInventoryItem, 
  getInventoryBySearchAndPrice //Additional Enhancement
}
