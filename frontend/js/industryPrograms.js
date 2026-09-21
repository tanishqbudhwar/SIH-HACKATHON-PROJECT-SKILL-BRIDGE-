document.addEventListener('DOMContentLoaded', () => {
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

    // DOM Elements
    const container = document.getElementById("programsContainer");
    const createProgramBtn = document.getElementById("createProgramBtn");
    
    const createModal = document.getElementById("createProgramModal");
    const closeCreateModalBtn = document.getElementById("closeCreateModalBtn");
    const createProgramForm = document.getElementById("createProgramForm");
    
    const studentsModal = document.getElementById("programStudentsModal");
    const closeStudentsModalBtn = document.getElementById("closeStudentsModalBtn");
    const studentsListContainer = document.getElementById("programStudentsList");
    const studentsModalTitle = document.getElementById("studentsModalTitle");

    const statActive = document.getElementById("statActive");
    const statTotalEnrolled = document.getElementById("statTotalEnrolled");
    const statClosed = document.getElementById("statClosed");

    const addSkillBtn = document.getElementById("addSkillBtn");
    const skillsContainer = document.getElementById("skillsContainer");

    let programsData = [];

    // Fetch My Programs
    async function fetchMyPrograms() {
        try {
            container.innerHTML = `<div class="loading-state">Loading your programs...</div>`;
            
            const res = await fetch(`${API_BASE_URL}/api/programs/my`, {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (!res.ok) throw new Error("Failed to fetch programs");

            const data = await res.json();
            programsData = data.programs || [];
            
            updateStats();
            renderPrograms(programsData);
        } catch (error) {
            console.error("Error:", error);
            container.innerHTML = `<div class="error-state">Failed to load programs.</div>`;
        }
    }

    function updateStats() {
        let active = 0;
        let totalEnrolled = 0;
        let closed = 0;

        programsData.forEach(p => {
            if (p.status === "Active") active++;
            if (p.status === "Closed" || p.status === "Completed") closed++;
            totalEnrolled += (p.enrolledCount || 0);
        });

        if(statActive) statActive.textContent = active;
        if(statTotalEnrolled) statTotalEnrolled.textContent = totalEnrolled;
        if(statClosed) statClosed.textContent = closed;
    }

    function renderPrograms(programs) {
        container.innerHTML = "";

        if (programs.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>No learning programs created yet</h3>
                    <p>Create your first program to start upskilling students.</p>
                </div>
            `;
            return;
        }

        programs.forEach(prog => {
            const card = document.createElement("div");
            card.className = "opp-card";
            
            const skillsHTML = prog.requiredSkills ? prog.requiredSkills.map(s => `<span class="skill-tag">${s.name} (${s.level})</span>`).join("") : "";
            
            const statusClass = prog.status === "Active" ? "status-active" : "status-closed";
            const statusText = prog.status;

            card.innerHTML = `
                <div class="opp-card-header">
                    <div>
                        <div class="opp-title">${prog.title}</div>
                        <div class="opp-subtitle">${prog.duration} • ${prog.mode}</div>
                    </div>
                    <div class="opp-status ${statusClass}">${statusText}</div>
                </div>
                
                <div class="opp-card-body">
                    <p class="opp-description">${prog.shortDescription}</p>
                    
                    <div class="opp-details-grid">
                        <div class="detail-item">
                            <span class="detail-label">Difficulty</span>
                            <span class="detail-value">${prog.difficulty}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Seats / Enrolled</span>
                            <span class="detail-value">${prog.enrolledCount || 0} / ${prog.seats}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Start Date</span>
                            <span class="detail-value">${new Date(prog.startDate).toLocaleDateString()}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Deadline</span>
                            <span class="detail-value">${new Date(prog.registrationDeadline).toLocaleDateString()}</span>
                        </div>
                    </div>

                    <div style="margin-top: 16px;">
                        <span class="detail-label" style="display:block; margin-bottom:8px;">Target Skills:</span>
                        <div class="opp-skills">${skillsHTML}</div>
                    </div>
                </div>
                
                <div class="opp-card-footer">
                    <div class="opp-actions">
                        <button class="btn btn-outline" onclick="window.industryProgApp.viewStudents('${prog._id}', '${prog.title}')">Students</button>
                        ${prog.status === 'Active' ? `<button class="btn btn-outline" onclick="window.industryProgApp.closeProgram('${prog._id}')" style="color:red; border-color:red;">Close Program</button>` : ''}
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    }

    // Create Program Logic
    if (createProgramBtn) {
        createProgramBtn.addEventListener('click', () => {
            createModal.classList.add('active');
        });
    }

    if (closeCreateModalBtn) {
        closeCreateModalBtn.addEventListener('click', () => {
            createModal.classList.remove('active');
        });
    }

    if (addSkillBtn) {
        addSkillBtn.addEventListener('click', () => {
            const skillRow = document.createElement('div');
            skillRow.className = 'form-row';
            skillRow.style.marginBottom = '8px';
            skillRow.innerHTML = `
                <input type="text" class="form-input skill-name-input" placeholder="e.g. MongoDB" required style="flex:2;">
                <select class="form-input skill-level-input" style="flex:1;">
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                </select>
                <button type="button" class="btn btn-outline remove-skill-btn">X</button>
            `;
            skillsContainer.appendChild(skillRow);
            
            skillRow.querySelector('.remove-skill-btn').addEventListener('click', () => {
                skillRow.remove();
            });
        });
    }

    if (createProgramForm) {
        createProgramForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Gather skills
            const requiredSkills = [];
            document.querySelectorAll('#skillsContainer .form-row').forEach(row => {
                const name = row.querySelector('.skill-name-input').value;
                const level = row.querySelector('.skill-level-input').value;
                if(name) requiredSkills.push({ name, level });
            });

            // Gather standard fields
            const payload = {
                title: document.getElementById('progTitle').value,
                shortDescription: document.getElementById('progShortDesc').value,
                description: document.getElementById('progDesc').value,
                skillCategory: document.getElementById('progCategory').value,
                difficulty: document.getElementById('progDifficulty').value,
                duration: document.getElementById('progDuration').value,
                mode: document.getElementById('progMode').value,
                seats: parseInt(document.getElementById('progSeats').value),
                fee: document.getElementById('progFee').value,
                certificateAvailable: document.getElementById('progCert').value === 'true',
                startDate: document.getElementById('progStartDate').value,
                endDate: document.getElementById('progEndDate').value,
                registrationDeadline: document.getElementById('progDeadline').value,
                requiredSkills
            };

            try {
                const res = await fetch(`${API_BASE_URL}/api/programs`, {
                    method: "POST",
                    headers: { 
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}` 
                    },
                    body: JSON.stringify(payload)
                });

                if(!res.ok) {
                    const err = await res.json();
                    throw new Error(err.message || "Failed to create program");
                }

                alert("Program created successfully!");
                createModal.classList.remove('active');
                createProgramForm.reset();
                fetchMyPrograms();

            } catch(error) {
                alert(error.message);
            }
        });
    }

    // View Students Logic
    async function viewStudents(programId, programTitle) {
        studentsModalTitle.textContent = `Enrolled Students: ${programTitle}`;
        studentsModal.classList.add('active');
        studentsListContainer.innerHTML = `<div class="loading-state">Loading students...</div>`;

        try {
            const res = await fetch(`${API_BASE_URL}/api/programs/${programId}/students`, {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (!res.ok) throw new Error("Failed to fetch students");

            const data = await res.json();
            const students = data.students || [];
            
            if (students.length === 0) {
                studentsListContainer.innerHTML = `<div class="empty-state">No students have enrolled yet.</div>`;
                return;
            }

            studentsListContainer.innerHTML = "";
            students.forEach(enr => {
                const sName = enr.student ? enr.student.name : "Unknown Student";
                const college = enr.profile && enr.profile.college ? enr.profile.college : "College not provided";
                const course = enr.profile && enr.profile.course ? enr.profile.course : "Course not provided";
                const skills = enr.profile && enr.profile.skills ? enr.profile.skills.map(s => `<span class="skill-tag">${s}</span>`).join("") : "";
                
                const card = document.createElement('div');
                card.className = "applicant-row";
                card.innerHTML = `
                    <div class="applicant-info">
                        <div class="applicant-avatar">${sName.charAt(0)}</div>
                        <div>
                            <div class="applicant-name">${sName}</div>
                            <div class="applicant-course">${course} • ${college}</div>
                            <div class="opp-skills" style="margin-top:8px;">${skills}</div>
                            <div style="font-size:12px; color:var(--text-muted); margin-top:8px;">Enrolled: ${new Date(enr.enrolledAt).toLocaleDateString()}</div>
                        </div>
                    </div>
                    <div class="applicant-actions">
                        <span class="match-badge">Enrolled</span>
                    </div>
                `;
                studentsListContainer.appendChild(card);
            });

        } catch (error) {
            console.error(error);
            studentsListContainer.innerHTML = `<div class="error-state">Error loading students.</div>`;
        }
    }

    if (closeStudentsModalBtn) {
        closeStudentsModalBtn.addEventListener('click', () => {
            studentsModal.classList.remove('active');
        });
    }

    // Close Program Logic
    async function closeProgram(programId) {
        if(!confirm("Are you sure you want to close this program? Students will no longer be able to enroll.")) return;

        try {
            const res = await fetch(`${API_BASE_URL}/api/programs/${programId}/status`, {
                method: "PATCH",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` 
                },
                body: JSON.stringify({ status: "Closed" })
            });

            if(!res.ok) throw new Error("Failed to close program");
            
            fetchMyPrograms();
        } catch(error) {
            alert(error.message);
        }
    }

    window.industryProgApp = {
        viewStudents,
        closeProgram
    };

    fetchMyPrograms();
});
