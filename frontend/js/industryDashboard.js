document.addEventListener("DOMContentLoaded", () => {
    // 1. Check if user is logged in
    const userData = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!userData || !token) {
        window.location.href = "../login.html";
        return;
    }

    const user = JSON.parse(userData);

    // 2. Protect route: Ensure the user is an industry role
    if (user.role !== "industry") {
        alert("Forbidden: Only Industry users can access this dashboard.");
        // If it's a student trying to access, they could be redirected to their own dashboard or login
        if (user.role === "student") {
            window.location.href = "../student/dashboard.html";
        } else if (user.role === "college") {
            window.location.href = "../college/dashboard.html";
        } else {
            window.location.href = "../login.html";
        }
        return;
    }

    // 3. Display user name / company name dynamically
    // We try to find common ID or classes that might display the user's name
    const nameElements = document.querySelectorAll("#topUserName, .user-name, #welcomeMessage .name, .company-name-display, .preview-company, #companyName");
    nameElements.forEach(el => {
        if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
            el.value = user.name;
        } else {
            el.textContent = user.name;
        }
    });

    const welcomeMessages = document.querySelectorAll("#welcomeMessage, .welcome-text");
    welcomeMessages.forEach(el => {
        // If the element has text like "Welcome Back!", we can append or replace
        if (!el.querySelector('.name')) {
             // Basic replacement if it's just a generic text
             if (el.textContent.includes("Welcome")) {
                 el.textContent = `Welcome Back, ${user.name}! 👋`;
             }
        }
    });

    // 4. Handle Logout functionality
    const logoutBtns = document.querySelectorAll("#logoutBtn, .logout-button, [data-action='logout']");
    logoutBtns.forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            // Clear auth data
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            // Redirect to login
            window.location.href = "../login.html";
        });
    });

});
