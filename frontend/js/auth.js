const roleButtons = document.querySelectorAll(".login-role-button");

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
// PASSWORD EYE BUTTON
// =========================
const togglePassword = document.getElementById("togglePassword");
const password = document.getElementById("password");

if (togglePassword && password) {
    togglePassword.addEventListener("click", () => {
        if (password.type === "password") {
            password.type = "text";
            togglePassword.textContent = "🙈";
        } else {
            password.type = "password";
            togglePassword.textContent = "👁";
        }
    });
}

const loginButton = document.getElementById("loginButton");

loginButton.addEventListener("click", async () => {

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!email || !password) {
        alert("Please enter email and password");
        return;
    }

    try {

        const response = await fetch("${API_BASE_URL}/api/auth/login", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const data = await response.json();

        console.log(data);

        if (response.ok) {
            alert("Login successful!");

            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            if (data.user.role === "student") {
                window.location.href = "student/dashboard.html";
            } else if (data.user.role === "industry") {
                window.location.href = "industry/dashboard.html";
            } else if (data.user.role === "college") {
                window.location.href = "college/dashboard.html";
            } else {
                window.location.href = "index.html"; // Fallback
            }
        } else {
            alert(data.message);
        }

    } catch (error) {
        console.error(error);
        alert("Unable to connect to server");
    }
});