document.addEventListener("DOMContentLoaded", () => {
    // --- 1. Authentication Protection ---
    const userData = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!userData || !token) {
        window.location.href = "../signup.html";
        return;
    }

    const user = JSON.parse(userData);

    // Verify role is industry
    if (user.role !== "industry") {
        alert("Forbidden: Only Industry users can access this portal.");
        if (user.role === "student") {
            window.location.href = "../student/dashboard.html";
        } else if (user.role === "college") {
            window.location.href = "../college/dashboard.html";
        } else {
            window.location.href = "../signup.html";
        }
        return;
    }

    // --- 2. Update User Name/Company in UI ---
    const nameElements = document.querySelectorAll("#topUserName, .user-name, #welcomeMessage .name, .company-name-display");
    nameElements.forEach(el => {
        el.textContent = user.name;
    });

    const welcomeMessages = document.querySelectorAll("#welcomeMessage, .welcome-text");
    welcomeMessages.forEach(el => {
        if (!el.querySelector('.name') && el.textContent.includes("Welcome")) {
            el.textContent = `Welcome Back, ${user.name}! 👋`;
        }
    });

    // --- 3. Sidebar Navigation & Active State ---
    const navMapping = [
        { label: "Dashboard", file: "dashboard.html" },
        { label: "Company Profile", file: "profile.html" },
        { label: "Post Opportunity", file: "post.html" },
        { label: "Manage Opportunities", file: "manage.html" },
        { label: "Find Students", file: "find.html" },
        { label: "Applications", file: "applications.html" },
        { label: "Skill Requirements", file: "requirement.html" },
        { label: "Learning Programs", file: "program.html" },
        { label: "Notifications", file: "notification.html" }
    ];

    const currentPath = window.location.pathname;
    const currentFile = currentPath.substring(currentPath.lastIndexOf("/") + 1) || "dashboard.html";

    const sidebarItems = document.querySelectorAll(".sidebar-nav button, .sidebar-nav a, .sidebar-menu li");

    sidebarItems.forEach(item => {
        const itemText = item.textContent.trim();
        
        // Handle Sign Out
        if (itemText.includes("Sign Out") || item.id === "logoutBtn") {
            item.addEventListener("click", (e) => {
                e.preventDefault();
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                window.location.href = "../signup.html";
            });
            return;
        }

        // Handle regular navigation links
        const mappedNav = navMapping.find(nav => itemText.includes(nav.label));
        if (mappedNav) {
            // Set navigation action if it doesn't already have one
            if (item.tagName === "BUTTON") {
                item.onclick = () => { window.location.href = mappedNav.file; };
            } else if (item.tagName === "A") {
                item.href = mappedNav.file;
            }

            // Remove hardcoded active class
            item.classList.remove("active");

            // Add active class if this is the current page
            if (currentFile === mappedNav.file) {
                item.classList.add("active");
            }
        }
    });

    // Handle logout for any other loose logout buttons
    const looseLogoutBtns = document.querySelectorAll(".logout-button, [data-action='logout']");
    looseLogoutBtns.forEach(btn => {
        if (!btn.onclick && !btn.hasAttribute("href")) {
            btn.addEventListener("click", (e) => {
                e.preventDefault();
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                window.location.href = "../signup.html";
            });
        }
    });

    // --- 4. Mobile Menu Handling (Keep existing functionality working) ---
    // If the mobile menu toggle exists in this script, initialize it, 
    // otherwise the existing script on the page will handle it.
    const mobileMenuBtn = document.getElementById("mobileMenuBtn");
    const sidebarOverlay = document.getElementById("sidebarOverlay");
    const industryDashboard = document.querySelector(".industry-dashboard, .dashboard-container, .student-dashboard");

    if (mobileMenuBtn && sidebarOverlay && industryDashboard) {
        // Only bind if it isn't already bound (basic fallback)
        if (!mobileMenuBtn.onclick) {
            const toggleMenu = () => {
                const isMenuOpen = industryDashboard.classList.contains("sidebar-open");
                if (isMenuOpen) {
                    industryDashboard.classList.remove("sidebar-open");
                    mobileMenuBtn.setAttribute("aria-expanded", "false");
                } else {
                    industryDashboard.classList.add("sidebar-open");
                    mobileMenuBtn.setAttribute("aria-expanded", "true");
                }
            };
            mobileMenuBtn.addEventListener("click", toggleMenu);
            sidebarOverlay.addEventListener("click", toggleMenu);
        }
    }
});
