/* *********************************
* Inventory Update Client Side Script
* Purpose: Enables the "Update Vehicle" button only after a change 
* is detected in the form fields.
********************************** */

// 1. Get the form element by its ID from the edit-inventory.ejs file.
const editForm = document.querySelector("#editInventoryForm");

// 2. Get the submit button, which must be initially disabled in the EJS.
const updateButton = editForm ? editForm.querySelector("button[type='submit']") : null;


/* *********************************
* Event Listener for Form Changes
* Fired when the user modifies any field in the form.
********************************** */
if (editForm && updateButton) {
    // Listen for any 'change' event within the form (typing, selecting, etc.)
    editForm.addEventListener("change", function () {
        // Remove the 'disabled' attribute to make the button clickable
        updateButton.removeAttribute("disabled");
    });
} else {
    // Optional: Log an error if the elements aren't found, useful for debugging
    // console.error("Could not find the edit form or the update button.");
}