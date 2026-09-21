document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    
    if (!token || !userStr) {
        window.location.href = "../login.html";
        return;
    }

    const user = JSON.parse(userStr);
    if (user.role !== "student") {
        window.location.href = "../login.html";
        return;
    }

    const container = document.getElementById("studentProgramsContainer");
    const searchInput = document.getElementById("searchProg");
    const difficultyFilter = document.getElementById("filterDifficulty");
    const modeFilter = document.getElementById("filterMode");

    let allPrograms = [];
    let studentSkills = [];

    // Fetch student's profile to know their current skills for matching
    async function fetchStudentProfile() {
        try {
            const res = await fetch("${API_BASE_URL}/api/profile", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                if (data.profile && data.profile.skills) {
                    studentSkills = data.profile.skills.map(s => s.toLowerCase());
                }
            }
        } catch (e) {
            console.error("Could not fetch profile for skill matching", e);
        }
    }

    // Fetch published programs
    async function fetchPrograms() {
        try {
            container.innerHTML = `<div class="loading-state">Loading learning programs...</div>`;
            const res = await fetch("${API_BASE_URL}/api/programs", {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (!res.ok) throw new Error("Failed to load programs");

            const data = await res.json();
            allPrograms = data.programs || [];
            
            renderPrograms(allPrograms);
        } catch (error) {
            console.error(error);
            container.innerHTML = `<div class="error-state">Failed to load learning programs.</div>`;
        }
    }

    // Check if program is recommended (student lacks a required skill)
    function checkIsRecommended(prog) {
        if (!prog.requiredSkills || prog.requiredSkills.length === 0) return false;
        
        let hasGap = false;
        for (let reqSkill of prog.requiredSkills) {
            if (!studentSkills.includes(reqSkill.name.toLowerCase())) {
                hasGap = true; // student doesn't have this skill, so it's a gap!
                break;
            }
        }
        return hasGap;
    }

    function renderPrograms(programsList) {
        container.innerHTML = "";

        if (programsList.length === 0) {
            container.innerHTML = `<div class="empty-state">No matching programs found.</div>`;
            return;
        }

        programsList.forEach(prog => {
            const isRecommended = checkIsRecommended(prog);
            const isFull = (prog.enrolledCount || 0) >= prog.seats;

            const card = document.createElement("div");
            card.className = `program-card ${isRecommended ? 'recommended' : ''}`;
            
            const skillsHTML = prog.requiredSkills ? prog.requiredSkills.map(s => `<span class="skill-tag">${s.name}</span>`).join("") : "";
            
            const badgeHTML = isRecommended ? `<div class="recommended-badge">Recommended for You</div>` : '';
            
            card.innerHTML = `
                ${badgeHTML}
                <div style="margin-top: ${isRecommended ? '8px' : '0'}">
                    <div class="program-title">${prog.title}</div>
                    <div class="program-company">By ${prog.industry ? prog.industry.name : 'Unknown Company'}</div>
                </div>

                <p style="font-size: 14px; color: #475569; margin: 8px 0; line-height: 1.5;">${prog.shortDescription}</p>

                <div class="program-meta">
                    <div class="meta-item"><span class="material-icons-round">schedule</span> ${prog.duration}</div>
                    <div class="meta-item"><span class="material-icons-round">laptop_mac</span> ${prog.mode}</div>
                    <div class="meta-item"><span class="material-icons-round">trending_up</span> ${prog.difficulty}</div>
                </div>

                <div>
                    <div style="font-size: 12px; font-weight: 500; color: #64748b; margin-bottom: 8px; text-transform: uppercase;">Skills Covered</div>
                    <div class="program-skills">${skillsHTML}</div>
                </div>

                <div class="program-footer">
                    <div class="seats-info">${prog.enrolledCount || 0} / ${prog.seats} Enrolled</div>
                    <button class="btn-enroll" onclick="window.studentProgApp.enroll('${prog._id}')" ${isFull ? 'disabled' : ''}>
                        ${isFull ? 'Program Full' : 'Enroll Now'}
                    </button>
                </div>
            `;

            container.appendChild(card);
        });
    }

    function applyFilters() {
        const search = searchInput.value.toLowerCase();
        const diff = difficultyFilter.value;
        const mode = modeFilter.value;

        const filtered = allPrograms.filter(p => {
            const matchSearch = p.title.toLowerCase().includes(search) || 
                                (p.requiredSkills && p.requiredSkills.some(s => s.name.toLowerCase().includes(search)));
            const matchDiff = diff === "all" || p.difficulty === diff;
            const matchMode = mode === "all" || p.mode === mode;

            return matchSearch && matchDiff && matchMode;
        });

        renderPrograms(filtered);
    }

    if (searchInput) searchInput.addEventListener("input", applyFilters);
    if (difficultyFilter) difficultyFilter.addEventListener("change", applyFilters);
    if (modeFilter) modeFilter.addEventListener("change", applyFilters);

    async function enroll(programId) {
        if (!confirm("Are you sure you want to enroll in this learning program?")) return;

        try {
            const res = await fetch(`${API_BASE_URL}/api/programs/${programId}/enroll`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` 
                }
            });

            const data = await res.json();
            
            if (!res.ok) throw new Error(data.message || "Failed to enroll");

            alert("Successfully enrolled in the program!");
            // Refresh to update seat counts and potentially disable button
            fetchPrograms();
        } catch (error) {
            alert(error.message);
        }
    }

    window.studentProgApp = { enroll };

    await fetchStudentProfile();
    await fetchPrograms();
});
