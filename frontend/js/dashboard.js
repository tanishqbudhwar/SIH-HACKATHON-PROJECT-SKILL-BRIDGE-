const userData = localStorage.getItem("user");

if (!userData) {

    window.location.href = "../login.html";

} else {

    const user = JSON.parse(userData);


    // Welcome message

    const welcomeMessage =
        document.getElementById("welcomeMessage");

    welcomeMessage.textContent =
        `Good morning, ${user.name} 👋`;


    // Top-right username

    const topUserName =
        document.getElementById("topUserName");

    topUserName.textContent =
        user.name;
}