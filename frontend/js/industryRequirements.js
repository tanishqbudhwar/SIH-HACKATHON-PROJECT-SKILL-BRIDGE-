document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "../login.html";
        return;
    }

    const mainContainer = document.querySelector(".dashboard-content");
    mainContainer.innerHTML = `
        <div class="welcome-section" style="margin-bottom: 24px;">
            <h1 style="font-size: 24px; margin-bottom: 8px;">Automated Skill Matchmaking</h1>
            <p style="color: var(--text-muted); font-size: 15px;">Discover the best student matches based on your posted opportunities.</p>
        </div>
        
        <div id="matchmakingContainer">
            <!-- Matches will be loaded here -->
        </div>
    `;

    const matchmakingContainer = document.getElementById("matchmakingContainer");

    try {
        // Fetch active opportunities for this industry
        const oppsRes = await fetch("${API_BASE_URL}/api/opportunities/my", {
            headers: { "Authorization": `Bearer ${token}` }
        });
        
        // Fetch all students
        const studentsRes = await fetch("${API_BASE_URL}/api/profile/students", {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (oppsRes.ok && studentsRes.ok) {
            const oppsData = await oppsRes.json();
            const studentsData = await studentsRes.json();
            
            const opportunities = oppsData.opportunities || [];
            const students = studentsData.students || [];

            renderMatches(opportunities, students);
        } else {
            matchmakingContainer.innerHTML = `<p style="color: red;">Failed to load matchmaking data.</p>`;
        }
    } catch (error) {
        console.error("Error:", error);
        matchmakingContainer.innerHTML = `<p style="color: red;">Server error.</p>`;
    }

    function renderMatches(opportunities, students) {
        if (opportunities.length === 0) {
            matchmakingContainer.innerHTML = `
                <div style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: 12px; padding: 32px; text-align: center;">
                    <p style="color: var(--text-muted); font-size: 15px;">Post an opportunity first to see automated candidate matches.</p>
                </div>
            `;
            return;
        }

        matchmakingContainer.innerHTML = opportunities.map(opp => {
            const requiredSkills = opp.skills || [];
            
            // Calculate match scores for all students
            const matchedStudents = students.map(student => {
                const studentSkills = student.skills || [];
                const matchCount = requiredSkills.filter(reqSkill => 
                    studentSkills.some(stuSkill => stuSkill.toLowerCase() === reqSkill.toLowerCase())
                ).length;
                
                const matchPercentage = requiredSkills.length > 0 
                    ? Math.round((matchCount / requiredSkills.length) * 100) 
                    : 0;
                    
                return { ...student, matchPercentage };
            })
            .filter(student => student.matchPercentage > 0) // Only show students with at least >0 match
            .sort((a, b) => b.matchPercentage - a.matchPercentage) // Highest match first
            .slice(0, 5); // Top 5 matches

            return `
                <div style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 16px; margin-bottom: 16px;">
                        <div>
                            <h3 style="margin: 0; font-size: 18px;">${opp.title}</h3>
                            <p style="margin: 4px 0 0; font-size: 13px; color: var(--text-muted);">Required Skills: ${requiredSkills.join(", ")}</p>
                        </div>
                        <span style="background: #eff6ff; color: #3b82f6; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">
                            ${matchedStudents.length} Matches
                        </span>
                    </div>

                    ${matchedStudents.length === 0 ? `
                        <p style="color: var(--text-muted); font-size: 14px;">No students found with matching skills yet.</p>
                    ` : `
                        <div style="display: flex; flex-direction: column; gap: 16px;">
                            ${matchedStudents.map(student => `
                                <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #f8fafc; border-radius: 8px;">
                                    <div style="display: flex; gap: 12px; align-items: center;">
                                        <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--brand-primary); color: white; display: flex; align-items: center; justify-content: center; font-weight: bold;">
                                            ${student.user?.name ? student.user.name.charAt(0) : 'S'}
                                        </div>
                                        <div>
                                            <div style="font-size: 15px; font-weight: 600;">${student.user?.name || "Anonymous"}</div>
                                            <div style="font-size: 12px; color: var(--text-muted);">${student.college || "Unknown College"}</div>
                                        </div>
                                    </div>
                                    <div style="display: flex; align-items: center; gap: 24px;">
                                        <div style="text-align: right;">
                                            <div style="font-size: 12px; color: var(--text-muted);">Match Score</div>
                                            <div style="font-size: 16px; font-weight: 600; color: #22c55e;">${student.matchPercentage}%</div>
                                        </div>
                                        <button style="padding: 6px 16px; background: var(--brand-accent); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 13px;">View Profile</button>
                                    </div>
                                </div>
                            `).join("")}
                        </div>
                    `}
                </div>
            `;
        }).join("");
    }
});
