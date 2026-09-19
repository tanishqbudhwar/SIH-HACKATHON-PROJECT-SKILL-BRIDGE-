document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('skillSearchInput');
    const suggestionsList = document.getElementById('skillSuggestions');
    const takeTestBtn = document.getElementById('takeTestBtn');
    
    let selectedSkill = '';
    let debounceTimer;

    // Skills are now loaded from skillData.js via window.ALL_SKILLS

    // Load top user info
    const token = localStorage.getItem('token');
    if (token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (payload.name) {
                document.getElementById('topUserName').textContent = payload.name;
            }
        } catch (e) {
            console.error('Error parsing token for username');
        }
    }

    // Mobile Menu Toggle Logic
    const mobileMenuBtn = document.getElementById("mobileMenuBtn");
    const sidebarOverlay = document.getElementById("sidebarOverlay");
    const studentDashboard = document.querySelector(".student-dashboard");

    function toggleMenu() {
        const isMenuOpen = studentDashboard.classList.contains("sidebar-open");
        if (isMenuOpen) {
            studentDashboard.classList.remove("sidebar-open");
            if(mobileMenuBtn) {
                mobileMenuBtn.setAttribute("aria-expanded", "false");
                mobileMenuBtn.setAttribute("aria-label", "Open navigation menu");
            }
        } else {
            studentDashboard.classList.add("sidebar-open");
            if(mobileMenuBtn) {
                mobileMenuBtn.setAttribute("aria-expanded", "true");
                mobileMenuBtn.setAttribute("aria-label", "Close navigation menu");
            }
        }
    }

    if (mobileMenuBtn && sidebarOverlay) {
        mobileMenuBtn.addEventListener("click", toggleMenu);
        sidebarOverlay.addEventListener("click", toggleMenu);
        
        // Close menu on Escape key
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && studentDashboard.classList.contains("sidebar-open")) {
                toggleMenu();
            }
        });
    }

    // Handle Search Input
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        clearTimeout(debounceTimer);
        
        if (query.length < 1) {
            suggestionsList.style.display = 'none';
            selectedSkill = '';
            updateTakeTestBtn();
            return;
        }

        // Search immediately for the static list
        debounceTimer = setTimeout(() => {
            fetchSuggestions(query);
        }, 150);
    });

    function fetchSuggestions(query) {
        // Case-insensitive, partial matching
        const qLower = query.toLowerCase();
        const filtered = window.ALL_SKILLS.filter(skill => skill.toLowerCase().includes(qLower));
        
        // Sort matches: skills that START with the query appear first
        filtered.sort((a, b) => {
            const aStarts = a.toLowerCase().startsWith(qLower);
            const bStarts = b.toLowerCase().startsWith(qLower);
            if (aStarts && !bStarts) return -1;
            if (!aStarts && bStarts) return 1;
            return 0;
        });

        const suggestions = filtered.slice(0, 8); // Show top 8 results max
        showSuggestions(suggestions);
    }

    function showSuggestions(suggestions) {
        suggestionsList.innerHTML = '';
        if (suggestions.length === 0) {
            suggestionsList.style.display = 'none';
            return;
        }

        suggestions.forEach(skill => {
            const li = document.createElement('li');
            // Adding a small icon/avatar for premium look
            li.innerHTML = `<span class="material-icons-round skill-icon">search</span> <span class="skill-name">${skill}</span>`;
            li.addEventListener('click', () => {
                selectSkill(skill);
            });
            suggestionsList.appendChild(li);
        });

        suggestionsList.style.display = 'block';
    }

    // Global function for Popular Skills cards to call
    window.selectSkill = function(skillName) {
        searchInput.value = skillName;
        selectedSkill = skillName;
        suggestionsList.style.display = 'none';
        updateTakeTestBtn();
    };

    function updateTakeTestBtn() {
        if (selectedSkill) {
            takeTestBtn.disabled = false;
        } else {
            takeTestBtn.disabled = true;
        }
    }

    // Handle Take Test Click
    takeTestBtn.addEventListener('click', () => {
        if (selectedSkill) {
            // Redirect using URL parameters as requested
            window.location.href = `test.html?skill=${encodeURIComponent(selectedSkill)}`;
        }
    });

    // Close suggestions if clicked outside
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !suggestionsList.contains(e.target)) {
            suggestionsList.style.display = 'none';
        }
    });
});
