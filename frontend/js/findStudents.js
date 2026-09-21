document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "../login.html";
        return;
    }

    const mainContainer = document.querySelector(".dashboard-content");
    mainContainer.innerHTML = `
        <div class="welcome-section">
            <h1 style="font-size: 24px; margin-bottom: 8px;">Find Students</h1>
            <p style="color: var(--text-muted); font-size: 15px;">Search and discover talented students for your opportunities.</p>
        </div>
        
        <div style="margin-bottom: 24px;">
            <input type="text" id="searchInput" placeholder="Search by skills (e.g. React, Python)" style="width: 100%; max-width: 400px; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px; font-size: 14px;">
        </div>

        <div id="studentsGrid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px;">
            <!-- Student cards will be loaded here -->
        </div>
    `;

    const studentsGrid = document.getElementById("studentsGrid");
    const searchInput = document.getElementById("searchInput");
    let allStudents = [];

    try {
        const response = await fetch(`${API_BASE_URL}/api/profile/students`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (response.ok) {
            const data = await response.json();
            allStudents = data.students;
            renderStudents(allStudents);
        } else {
            studentsGrid.innerHTML = `<p style="color: red;">Failed to load students.</p>`;
        }
    } catch (error) {
        console.error("Error:", error);
        studentsGrid.innerHTML = `<p style="color: red;">Server error.</p>`;
    }

    searchInput.addEventListener("input", (e) => {
        const query = e.target.value.toLowerCase();
        const filtered = allStudents.filter(student => {
            const skillsStr = (student.skills || []).join(" ").toLowerCase();
            const name = (student.user?.name || "").toLowerCase();
            const college = (student.college || "").toLowerCase();
            return skillsStr.includes(query) || name.includes(query) || college.includes(query);
        });
        renderStudents(filtered);
    });

    function renderStudents(students) {
        if (students.length === 0) {
            studentsGrid.innerHTML = `<p style="color: var(--text-muted); grid-column: 1/-1;">No students found matching your criteria.</p>`;
            return;
        }

        studentsGrid.innerHTML = students.map(student => `
            <div style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: 12px; padding: 24px;">
                <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">
                    <div style="width: 50px; height: 50px; border-radius: 50%; background: var(--brand-primary); color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 20px;">
                        ${student.user?.name ? student.user.name.charAt(0) : 'S'}
                    </div>
                    <div>
                        <h3 style="margin: 0; font-size: 16px;">${student.user?.name || "Anonymous"}</h3>
                        <p style="margin: 4px 0 0; font-size: 13px; color: var(--text-muted);">${student.college || "No College specified"}</p>
                    </div>
                </div>
                
                <div style="margin-bottom: 16px;">
                    <strong style="font-size: 12px; color: var(--text-muted); display: block; margin-bottom: 8px;">SKILLS</strong>
                    <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                        ${(student.skills || []).slice(0, 5).map(skill => `
                            <span style="background: #f1f5f9; color: #475569; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${skill}</span>
                        `).join("")}
                        ${student.skills && student.skills.length > 5 ? `<span style="background: #f1f5f9; color: #475569; padding: 4px 8px; border-radius: 4px; font-size: 12px;">+${student.skills.length - 5}</span>` : ""}
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; border-top: 1px solid var(--border-color); padding-top: 16px; margin-bottom: 16px;">
                    <div>
                        <div style="font-size: 12px; color: var(--text-muted);">Skill Score</div>
                        <div style="font-size: 16px; font-weight: 600; color: var(--brand-accent);">${student.skillScore || 0}%</div>
                    </div>
                    <div>
                        <div style="font-size: 12px; color: var(--text-muted);">Placement Readiness</div>
                        <div style="font-size: 16px; font-weight: 600; color: var(--brand-accent);">${student.placementReadiness || 0}%</div>
                    </div>
                </div>

                <button style="width: 100%; padding: 10px; background: white; border: 1px solid var(--brand-primary); color: var(--brand-primary); border-radius: 6px; cursor: pointer; font-weight: 500;">
                    View Full Profile
                </button>
            </div>
        `).join("");
    }
});
