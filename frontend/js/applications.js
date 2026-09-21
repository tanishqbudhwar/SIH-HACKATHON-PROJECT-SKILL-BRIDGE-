document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Demo Data ---
    const applications = [
        {
            id: 1,
            name: "Rahul Sharma",
            avatar: "R",
            education: "B.Tech CSE • 3rd Year",
            opportunity: "Software Developer Intern",
            skills: ["Python", "DSA", "MongoDB", "JavaScript"],
            match: 92,
            date: "Oct 15, 2026",
            status: "Shortlisted",
            intro: "I am highly passionate about full-stack development. I have built several projects using the MERN stack and continuously improve my problem-solving skills on LeetCode."
        },
        {
            id: 2,
            name: "Sneha Patel",
            avatar: "S",
            education: "B.Sc Data Science • Final Year",
            opportunity: "Data Analyst Intern",
            skills: ["Python", "SQL", "Tableau", "Pandas"],
            match: 87,
            date: "Oct 14, 2026",
            status: "Interview",
            intro: "Data enthusiast with strong analytical skills. Experience in cleaning large datasets and creating impactful dashboards to drive business decisions."
        },
        {
            id: 3,
            name: "Amit Kumar",
            avatar: "A",
            education: "MCA • 2nd Year",
            opportunity: "Cybersecurity Intern",
            skills: ["Network Security", "Linux", "Ethical Hacking", "Python"],
            match: 78,
            date: "Oct 12, 2026",
            status: "Under Review",
            intro: "I have participated in multiple CTFs and hold a basic certification in Ethical Hacking. I am eager to apply my knowledge to secure enterprise systems."
        },
        {
            id: 4,
            name: "Priya Singh",
            avatar: "P",
            education: "B.Tech IT • 4th Year",
            opportunity: "Software Developer Intern",
            skills: ["Java", "Spring Boot", "MySQL", "Git"],
            match: 71,
            date: "Oct 10, 2026",
            status: "Applied",
            intro: "Strong foundation in Object-Oriented Programming and backend development. I enjoy building robust APIs and scalable microservices."
        },
        {
            id: 5,
            name: "Vikram Reddy",
            avatar: "V",
            education: "B.E Electronics • 3rd Year",
            opportunity: "Software Developer Intern",
            skills: ["C++", "Python", "Data Structures"],
            match: 64,
            date: "Oct 08, 2026",
            status: "Rejected",
            intro: "Transitioning into software development from an electronics background. Quick learner and hard worker."
        },
        {
            id: 6,
            name: "Neha Gupta",
            avatar: "N",
            education: "B.Tech CSE • Final Year",
            opportunity: "Data Analyst Intern",
            skills: ["Excel", "Python", "Statistics", "Machine Learning"],
            match: 95,
            date: "Oct 05, 2026",
            status: "Selected",
            intro: "Top of my class in Statistics and Probability. I love finding hidden patterns in data and predicting trends using ML algorithms."
        }
    ];

    // --- 2. DOM Elements ---
    const container = document.getElementById("applicationsContainer");
    const searchInput = document.getElementById("searchApp");
    const filterOpp = document.getElementById("filterOpp");
    const filterStatus = document.getElementById("filterStatus");

    const modalOverlay = document.getElementById("applicantModal");
    const closeModalBtn = document.getElementById("closeModal");
    
    // Modal fields
    const modalName = document.getElementById("modalName");
    const modalEdu = document.getElementById("modalEdu");
    const modalOpp = document.getElementById("modalOpp");
    const modalSkills = document.getElementById("modalSkills");
    const modalMatch = document.getElementById("modalMatch");
    const modalDate = document.getElementById("modalDate");
    const modalStatusBadge = document.getElementById("modalStatusBadge");
    const modalIntro = document.getElementById("modalIntro");
    const modalActions = document.getElementById("modalActions");

    // --- 3. Helper Functions ---
    const getStatusClass = (status) => {
        const map = {
            "Applied": "status-applied",
            "Under Review": "status-under-review",
            "Shortlisted": "status-shortlisted",
            "Interview": "status-interview",
            "Selected": "status-selected",
            "Rejected": "status-rejected"
        };
        return map[status] || "status-applied";
    };

    // --- 4. Render Logic ---
    function renderApplications(apps) {
        container.innerHTML = "";
        
        if (apps.length === 0) {
            container.innerHTML = `<div class="empty-state"><h3>No applications found</h3><p>Try adjusting your search or filters.</p></div>`;
            return;
        }

        apps.forEach(app => {
            const statusClass = getStatusClass(app.status);
            
            const card = document.createElement("div");
            card.className = "app-card";
            
            // Build skills HTML
            const skillsHTML = app.skills.map(s => `<span class="skill-tag">${s}</span>`).join("");

            card.innerHTML = `
                <div class="app-avatar">${app.avatar}</div>
                
                <div class="app-info">
                    <div class="app-name">${app.name}</div>
                    <div class="app-edu">${app.education}</div>
                    <div class="app-skills">
                        ${skillsHTML}
                    </div>
                </div>

                <div class="app-meta">
                    <div class="meta-row">
                        <span class="meta-label">Applied for:</span>
                        <span class="meta-value">${app.opportunity}</span>
                    </div>
                    <div class="meta-row" style="margin-top: 8px;">
                        <span class="meta-label">Match:</span>
                        <span class="meta-value" style="color: var(--brand-accent);">${app.match}%</span>
                    </div>
                    <div class="match-bar-container">
                        <div class="match-fill" style="width: ${app.match}%;"></div>
                    </div>
                </div>

                <div class="app-actions">
                    <div class="status-badge ${statusClass}">${app.status}</div>
                    <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">Applied: ${app.date}</div>
                    <button class="btn btn-outline" style="margin-top: auto;" data-id="${app.id}">View Profile</button>
                </div>
            `;
            
            container.appendChild(card);
        });

        // Add event listeners to buttons
        const viewBtns = container.querySelectorAll(".btn-outline");
        viewBtns.forEach(btn => {
            btn.addEventListener("click", (e) => {
                const id = parseInt(e.target.getAttribute("data-id"));
                openModal(id);
            });
        });
    }

    // --- 5. Filtering Logic ---
    function filterData() {
        const search = searchInput.value.toLowerCase();
        const opp = filterOpp.value;
        const status = filterStatus.value;

        const filtered = applications.filter(app => {
            // Search by name, skill, or opportunity
            const matchSearch = app.name.toLowerCase().includes(search) || 
                                app.skills.some(s => s.toLowerCase().includes(search)) ||
                                app.opportunity.toLowerCase().includes(search);
            
            const matchOpp = opp === "all" || app.opportunity === opp;
            const matchStatus = status === "all" || app.status === status;

            return matchSearch && matchOpp && matchStatus;
        });

        renderApplications(filtered);
    }

    searchInput.addEventListener("input", filterData);
    filterOpp.addEventListener("change", filterData);
    filterStatus.addEventListener("change", filterData);

    // --- 6. Modal Logic ---
    function openModal(id) {
        const app = applications.find(a => a.id === id);
        if(!app) return;

        modalName.textContent = app.name;
        modalEdu.textContent = app.education;
        modalOpp.textContent = app.opportunity;
        modalDate.textContent = app.date;
        modalMatch.textContent = app.match + "%";
        modalIntro.textContent = app.intro;

        modalSkills.innerHTML = app.skills.map(s => `<span class="skill-tag">${s}</span>`).join("");
        
        const statusClass = getStatusClass(app.status);
        modalStatusBadge.innerHTML = `<span class="status-badge ${statusClass}">${app.status}</span>`;

        // Action buttons
        modalActions.innerHTML = `
            <button class="btn btn-outline" onclick="closeAppModal()">Cancel</button>
            <button class="btn btn-primary" onclick="alert('Demo: Student shortlisted!')">Shortlist</button>
        `;

        modalOverlay.classList.add("active");
    }

    function closeAppModal() {
        modalOverlay.classList.remove("active");
    }

    // Expose close globally for the inline onclick
    window.closeAppModal = closeAppModal;

    closeModalBtn.addEventListener("click", closeAppModal);
    
    // Close on click outside
    modalOverlay.addEventListener("click", (e) => {
        if(e.target === modalOverlay) closeAppModal();
    });

    // --- 7. Initial Render ---
    renderApplications(applications);
});
