/* ****************************************
 * PASSWORD VISIBILITY TOGGLE (Register + Login)
 **************************************** */

// Generic function so ANY toggle can work
function setupPasswordToggle(buttonId, inputId) {
    const btn = document.getElementById(buttonId)
    const input = document.getElementById(inputId)

    if (btn && input) {
        btn.addEventListener("click", () => {
            const isHidden = input.type === "password"
            input.type = isHidden ? "text" : "password"
            btn.textContent = isHidden ? "Hide Password" : "Show Password"

            // FIX: This prevents CSS breaking on toggle
            input.classList.add("touched")
        })
    }
}

/* Register page toggle */
setupPasswordToggle("pswdBtn", "account_password")

/* Login page toggle */
setupPasswordToggle("loginPswdBtn", "account_password")



/* ****************************************
 * FRONT-END VALIDATION TOUCH HANDLING
 **************************************** */
const requiredInputs = document.querySelectorAll("input[required]")

requiredInputs.forEach(input => {
    input.addEventListener("blur", () => {
        input.classList.add("touched")
    })
})
