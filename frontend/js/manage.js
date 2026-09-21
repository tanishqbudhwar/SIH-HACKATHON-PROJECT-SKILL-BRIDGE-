document.addEventListener('DOMContentLoaded', () => {
    // Check if industry user is logged in
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    
    if (!token || !userStr) {
        window.location.href = "../login.html";
        return;
    }

    const user = JSON.parse(userStr);
    if (user.role !== "industry") {
        window.location.href = "../login.html";
        return;
    }

    // --- DOM Elements ---
    const container = document.getElementById("opportunitiesContainer");
    const searchInput = document.getElementById("searchOpp");
    const filterStatus = document.getElementById("filterStatus");
    const filterType = document.getElementById("filterType");

    // Stats
    const statActive = document.getElementById("statActive");
    const statTotalApplicants = document.getElementById("statTotalApplicants");
    const statClosingSoon = document.getElementById("statClosingSoon");
    const statPositions = document.getElementById("statPositions");

    // Modal
    const applicantModal = document.getElementById("applicantModal");
    const closeModalBtn = document.getElementById("closeModalBtn");
    const modalApplicantsList = document.getElementById("modalApplicantsList");
    const modalOppTitle = document.getElementById("modalOppTitle");

    let opportunitiesData = [];
    let currentApplicants = [];

    // --- Fetch Opportunities ---
    async function fetchMyOpportunities() {
        try {
            container.innerHTML = `<div class="loading-state">Loading your opportunities...</div>`;
            
            const res = await fetch(`${API_BASE_URL}/api/opportunities/my`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!res.ok) throw new Error("Failed to fetch opportunities");

            const data = await res.json();
            opportunitiesData = data.opportunities || [];
            
            updateStats();
            renderOpportunities(opportunitiesData);
        } catch (error) {
            console.error("Error:", error);
            container.innerHTML = `<div class="error-state">Failed to load opportunities. Please try again later.</div>`;
        }
    }

    // --- Update Stats ---
    function updateStats() {
        if (!opportunitiesData) return;

        let active = 0;
        let totalApplicants = 0;
        let positions = 0;
        let closingSoon = 0;

        const now = new Date();

        opportunitiesData.forEach(opp => {
            if (opp.status === "published") active++;
            totalApplicants += (opp.applicantsCount || 0);
            positions += (opp.positions || 1);

            if (opp.deadline) {
                const deadlineDate = new Date(opp.deadline);
                const diffTime = Math.abs(deadlineDate - now);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                if (diffDays <= 7 && opp.status === "published") {
                    closingSoon++;
                }
            }
        });

        statActive.textContent = active;
        statTotalApplicants.textContent = totalApplicants;
        statPositions.textContent = positions;
        statClosingSoon.textContent = closingSoon;
    }

    // --- Render Opportunities ---
    function renderOpportunities(apps) {
        container.innerHTML = "";

        if (apps.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>No opportunities posted yet</h3>
                    <p>Create your first opportunity to start receiving applications.</p>
                    <a href="post.html" class="btn btn-primary" style="display:inline-block; margin-top:16px; text-decoration:none;">Post Your First Opportunity</a>
                </div>
            `;
            return;
        }

        apps.forEach(opp => {
            const card = document.createElement("div");
            card.className = "opp-card";
            
            const skillsHTML = opp.requiredSkills ? opp.requiredSkills.map(s => `<span class="skill-tag">${s.name}</span>`).join("") : "";
            const deadlineText = opp.deadline ? new Date(opp.deadline).toLocaleDateString() : "Not specified";
            const createdText = new Date(opp.createdAt).toLocaleDateString();

            const statusClass = opp.status === "published" ? "status-active" : (opp.status === "closed" ? "status-closed" : "status-draft");
            const statusText = opp.status === "published" ? "Active" : (opp.status === "closed" ? "Closed" : "Draft");

            card.innerHTML = `
                <div class="opp-card-header">
                    <div>
                        <div class="opp-title">${opp.title}</div>
                        <div class="opp-subtitle">${opp.opportunityType} • ${opp.workMode || 'Remote'} • ${opp.duration || 'Flexible'}</div>
                    </div>
                    <div class="opp-status ${statusClass}">${statusText}</div>
                </div>
                
                <div class="opp-card-body">
                    <p class="opp-description">${opp.shortDescription || opp.description.substring(0, 100) + "..."}</p>
                    
                    <div class="opp-details-grid">
                        <div class="detail-item">
                            <span class="detail-label">Location</span>
                            <span class="detail-value">${opp.location || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Positions</span>
                            <span class="detail-value">${opp.positions || 1}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Stipend/Salary</span>
                            <span class="detail-value">${opp.stipend || 'Unpaid'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Deadline</span>
                            <span class="detail-value">${deadlineText}</span>
                        </div>
                    </div>

                    <div style="margin-top: 16px;">
                        <span class="detail-label" style="display:block; margin-bottom:8px;">Required Skills:</span>
                        <div class="opp-skills">${skillsHTML}</div>
                    </div>
                </div>
                
                <div class="opp-card-footer">
                    <div class="opp-applicants-count">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                        ${opp.applicantsCount || 0} Applicants
                    </div>
                    
                    <div class="opp-actions">
                        <button class="btn btn-outline" onclick="alert('View/Edit functionality coming soon')">Edit</button>
                        <button class="btn btn-primary" onclick="window.manageApp.openApplicants('${opp._id}', '${opp.title}')">Applicants</button>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    }

    // --- Filtering Logic ---
    function applyFilters() {
        const search = searchInput.value.toLowerCase();
        const status = filterStatus.value;
        const type = filterType.value;

        const filtered = opportunitiesData.filter(opp => {
            const matchSearch = opp.title.toLowerCase().includes(search) || 
                                (opp.requiredSkills && opp.requiredSkills.some(s => s.name.toLowerCase().includes(search)));
            
            const matchStatus = status === "all" || opp.status === status;
            const matchType = type === "all" || opp.opportunityType === type;

            return matchSearch && matchStatus && matchType;
        });

        renderOpportunities(filtered);
    }

    if(searchInput) searchInput.addEventListener("input", applyFilters);
    if(filterStatus) filterStatus.addEventListener("change", applyFilters);
    if(filterType) filterType.addEventListener("change", applyFilters);

    // --- Modal Logic ---
    async function openApplicants(oppId, oppTitle) {
        modalOppTitle.textContent = \`Applicants for \${oppTitle}\`;
        applicantModal.classList.add("active");
        modalApplicantsList.innerHTML = \`<div class="loading-state">Loading applicants...</div>\`;

        try {
            const res = await fetch(\`${API_BASE_URL}/api/opportunities/\${oppId}/applicants\`, {
                headers: {
                    "Authorization": \`Bearer \${token}\`
                }
            });

            if (!res.ok) throw new Error("Failed to fetch applicants");

            const data = await res.json();
            currentApplicants = data.applications || [];
            renderApplicantsList(currentApplicants);
        } catch (error) {
            console.error(error);
            modalApplicantsList.innerHTML = \`<div class="error-state">Failed to load applicants.</div>\`;
        }
    }

    function renderApplicantsList(apps) {
        if (apps.length === 0) {
            modalApplicantsList.innerHTML = \`<div class="empty-state">No one has applied to this opportunity yet.</div>\`;
            return;
        }

        modalApplicantsList.innerHTML = "";

        apps.forEach(app => {
            const studentName = app.student ? app.student.name : "Unknown Student";
            const appliedDate = new Date(app.createdAt).toLocaleDateString();
            
            // Extract from profile
            const course = app.profile && app.profile.course ? app.profile.course : "Course not provided";
            const college = app.profile && app.profile.college ? app.profile.college : "College not provided";
            const skills = app.profile && app.profile.skills ? app.profile.skills.map(s => \`<span class="skill-tag">\${s}</span>\`).join("") : "No skills listed";
            
            const card = document.createElement("div");
            card.className = "applicant-row";

            const statuses = ["Applied", "Under Review", "Shortlisted", "Interview", "Selected", "Rejected"];
            const statusOptions = statuses.map(s => 
                \`<option value="\${s}" \${app.status === s ? 'selected' : ''}>\${s}</option>\`
            ).join("");

            card.innerHTML = \`
                <div class="applicant-info">
                    <div class="applicant-avatar">\${studentName.charAt(0)}</div>
                    <div>
                        <div class="applicant-name">\${studentName}</div>
                        <div class="applicant-course">\${course} • \${college}</div>
                        <div class="opp-skills" style="margin-top:8px;">\${skills}</div>
                        <div style="font-size:12px; color:var(--text-muted); margin-top:8px;">Applied: \${appliedDate}</div>
                    </div>
                </div>
                <div class="applicant-actions">
                    <select class="status-select" onchange="window.manageApp.updateStatus('\${app._id}', this.value)">
                        \${statusOptions}
                    </select>
                    <button class="btn btn-outline" style="padding: 6px 12px; font-size: 13px;" onclick="alert('View profile feature coming soon')">View Profile</button>
                </div>
            \`;

            modalApplicantsList.appendChild(card);
        });
    }

    async function updateStatus(applicationId, newStatus) {
        try {
            const res = await fetch(\`${API_BASE_URL}/api/applications/\${applicationId}/status\`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": \`Bearer \${token}\`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (!res.ok) throw new Error("Failed to update status");
            
            // Re-fetch to update numbers
            fetchMyOpportunities();

        } catch (error) {
            console.error(error);
            alert("Error updating status.");
        }
    }

    function closeApplicantsModal() {
        applicantModal.classList.remove("active");
    }

    if(closeModalBtn) closeModalBtn.addEventListener("click", closeApplicantsModal);
    
    window.manageApp = {
        openApplicants,
        updateStatus,
        closeApplicantsModal
    };

    // Initial Fetch
    fetchMyOpportunities();
});
