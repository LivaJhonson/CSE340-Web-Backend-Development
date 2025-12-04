/* *********************************
* Inventory Management Client Side Script
* Purpose: Handles the classification selection change event 
* and fetches the corresponding vehicle inventory data via AJAX.
********************************** */

// Get the classification select list element
const classificationList = document.querySelector("#classificationList")

// Get the container for the inventory table
const inventoryDisplay = document.querySelector("#inventoryDisplay")


/* *********************************
* Event Listener for Classification Change
* Fired when the user selects a new classification.
********************************** */
classificationList.addEventListener("change", function () {
    // Get the ID of the selected classification
    const classification_id = classificationList.value 
    
    // Construct the URL for the AJAX request
    const classIdURL = "/inv/getInventory/" + classification_id
    
    // Fetch the inventory data from the server
    fetch(classIdURL)
        .then(response => {
            if (response.ok) {
                return response.json()
            }
            // If response is not okay (e.g., 404 or 500), throw an error
            throw Error("Network response was not OK.")
        })
        .then(data => {
            // Build the HTML table using the received JSON data
            console.log(data) // Log data to console for debugging
            buildInventoryList(data)
        })
        .catch(error => {
            // Handle any errors during fetch or JSON parsing
            console.error('There was a problem with the fetch operation:', error)
            // Display an error message to the user
            inventoryDisplay.innerHTML = '<p class="notice error">Sorry, fetching the inventory list failed. Please try again.</p>'
        })
})


/* *********************************
* Build Inventory HTML Table
* Takes the inventory data array and builds the table HTML.
********************************** */
function buildInventoryList(data) {
    let inventoryTable = '<table>';
    inventoryTable += '<thead>';
    inventoryTable += '<tr><th>Vehicle Name</th><th>&nbsp;</th><th>&nbsp;</th></tr>';
    inventoryTable += '</thead>';
    inventoryTable += '<tbody>';

    // Loop through the inventory data array
    data.forEach(item => {
        inventoryTable += `<tr><td>${item.inv_make} ${item.inv_model}</td>`;
        
        // Edit link - uses the inv_id to route to the edit view (to be implemented later)
        inventoryTable += `<td><a href='/inv/edit/${item.inv_id}' title='Click to update'>Modify</a></td>`;
        
        // Delete link - uses the inv_id to route to the delete confirmation view (to be implemented later)
        inventoryTable += `<td><a href='/inv/delete/${item.inv_id}' title='Click to delete'>Delete</a></td></tr>`;
    })

    inventoryTable += '</tbody>';
    inventoryTable += '</table>';

    // Inject the final table HTML into the display area
    inventoryDisplay.innerHTML = inventoryTable;
}

// Ensure the code doesn't try to run if the classification list isn't present (e.g., on other pages)
if (classificationList) {
    // Check if a classification is already selected on load (sticky form scenario)
    if (classificationList.value) {
        // Trigger the change event artificially to load data on page load
        classificationList.dispatchEvent(new Event('change'));
    }
}
