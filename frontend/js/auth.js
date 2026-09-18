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

const loginButton = document.getElementById("loginButton");

loginButton.addEventListener("click", async () => {

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!email || !password) {
        alert("Please enter email and password");
        return;
    }

    try {

        const response = await fetch("http://localhost:4000/api/auth/login", {
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
            }
        } else {
            alert(data.message);
        }

    } catch (error) {
        console.error(error);
        alert("Unable to connect to server");
    }
});