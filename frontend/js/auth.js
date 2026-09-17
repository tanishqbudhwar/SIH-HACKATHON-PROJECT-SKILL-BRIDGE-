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

            // Save login token
            localStorage.setItem("token", data.token);

            // Save user information
            localStorage.setItem("user", JSON.stringify(data.user));

        } else {
            alert(data.message);
        }

    } catch (error) {
        console.error(error);
        alert("Unable to connect to server");
    }
});