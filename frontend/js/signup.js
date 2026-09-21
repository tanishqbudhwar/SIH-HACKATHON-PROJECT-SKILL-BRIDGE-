// =========================
// ROLE SELECTION
// =========================

const roleButtons = document.querySelectorAll(".role-button");

let selectedRole = "";

roleButtons.forEach((button) => {

    button.addEventListener("click", () => {

        roleButtons.forEach((btn) => {
            btn.classList.remove("selected");
        });

        button.classList.add("selected");

        selectedRole = button.dataset.role;

        console.log("Selected role:", selectedRole);
    });

});


// =========================
// PASSWORD EYE BUTTONS
// =========================

const togglePassword = document.getElementById("togglePassword");
const toggleConfirmPassword = document.getElementById("toggleConfirmPassword");

const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirmPassword");


togglePassword.addEventListener("click", () => {

    if (password.type === "password") {
        password.type = "text";
        togglePassword.textContent = "🙈";
    } else {
        password.type = "password";
        togglePassword.textContent = "👁";
    }

});


toggleConfirmPassword.addEventListener("click", () => {

    if (confirmPassword.type === "password") {
        confirmPassword.type = "text";
        toggleConfirmPassword.textContent = "🙈";
    } else {
        confirmPassword.type = "password";
        toggleConfirmPassword.textContent = "👁";
    }

});


// =========================
// SIGNUP
// =========================

const signupButton = document.getElementById("signupButton");

signupButton.addEventListener("click", async () => {

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;

    const passwordValue = password.value;
    const confirmPasswordValue = confirmPassword.value;


    // Check empty fields

    if (!name || !email || !passwordValue || !confirmPasswordValue) {

        alert("Please fill all fields");

        return;
    }


    // Check password

    if (passwordValue !== confirmPasswordValue) {

        alert("Passwords do not match");

        return;
    }


    // Check role

    if (!selectedRole) {

        alert("Please select your role");

        return;
    }


    try {

        const response = await fetch(
            `${API_BASE_URL}/api/auth/signup`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    name: name,
                    email: email,
                    password: passwordValue,
                    role: selectedRole
                })
            }
        );


        const data = await response.json();

        console.log(data);


        if (response.ok) {

            alert("Account created successfully!");

            window.location.href = "login.html";

        } else {

            alert(data.message);

        }


    } catch (error) {

        console.error(error);

        alert("Unable to connect to server");

    }

});