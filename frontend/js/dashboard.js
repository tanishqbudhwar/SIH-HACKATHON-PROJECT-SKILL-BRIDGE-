document.addEventListener("DOMContentLoaded", async () => {
    const userData = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!userData || !token) {
        window.location.href = "../login.html";
        return;
    }

    const user = JSON.parse(userData);

    // Welcome message
    const welcomeMessage = document.getElementById("welcomeMessage");
    if (welcomeMessage && user && user.name) {
        const first_name = user.name.split(" ")[0];
        welcomeMessage.textContent = `Welcome Back, ${first_name}! 👋`;
    }

    // Top-right username
    const topUserName = document.getElementById("topUserName");
    if (topUserName && user && user.name) {
        topUserName.textContent = user.name;
    }

    // Mobile Menu Toggle Logic
    const mobileMenuBtn = document.getElementById("mobileMenuBtn");
    const sidebarOverlay = document.getElementById("sidebarOverlay");
    const studentDashboard = document.querySelector(".student-dashboard");

    function toggleMenu() {
        const isMenuOpen = studentDashboard.classList.contains("sidebar-open");
        if (isMenuOpen) {
            studentDashboard.classList.remove("sidebar-open");
            mobileMenuBtn.setAttribute("aria-expanded", "false");
            mobileMenuBtn.setAttribute("aria-label", "Open navigation menu");
        } else {
            studentDashboard.classList.add("sidebar-open");
            mobileMenuBtn.setAttribute("aria-expanded", "true");
            mobileMenuBtn.setAttribute("aria-label", "Close navigation menu");
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

    // Logout
    const logoutBtn = document.getElementById("logoutBtn");
    if(logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            window.location.href = "../login.html";
        });
    }

    try {
        // Fetch Profile for standard user data (course, year, certificates)
        const profileResponse = await fetch("${API_BASE_URL}/api/profile", {
            headers: { "Authorization": `Bearer ${token}` }
        });

        // Fetch Assessment History for dynamic metrics
        const historyResponse = await fetch("${API_BASE_URL}/api/assessment/history", {
            headers: { "Authorization": `Bearer ${token}` }
        });

        let profile = {};
        if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            profile = profileData.profile || {};
        }

        let history = [];
        if (historyResponse.ok) {
            const historyData = await historyResponse.json();
            history = historyData.history || [];
        }

        // --- 1. Populate Basic Profile Stats ---
        const internshipsAppliedVal = document.getElementById("internshipsAppliedVal");
        if (internshipsAppliedVal) internshipsAppliedVal.textContent = profile.internshipsApplied || "12";

        const placementReadinessVal = document.getElementById("placementReadinessVal");
        if (placementReadinessVal) placementReadinessVal.textContent = profile.placementReadiness ? `${profile.placementReadiness}%` : "84%";

        const certificatesVal = document.getElementById("certificatesVal");
        if (certificatesVal) certificatesVal.textContent = profile.certificates || "5";

        const welcomeSubtitle = document.getElementById("welcomeSubtitle");
        if (welcomeSubtitle && profile.course && profile.year) {
            welcomeSubtitle.textContent = `${profile.course} • ${profile.year} Year`;
        }

        // --- 2. Calculate and Populate Overall Skill Score ---
        const skillScoreVal = document.getElementById("skillScoreVal");
        if (skillScoreVal) {
            if (history.length === 0) {
                skillScoreVal.textContent = "0%";
            } else {
                // Average of all assessment scores
                const totalScore = history.reduce((sum, assessment) => sum + assessment.score, 0);
                const averageScore = Math.round(totalScore / history.length);
                skillScoreVal.textContent = `${averageScore}%`;
                
                // Latest Assessment Subtitle update
                if (welcomeSubtitle) {
                    const latest = history[0]; // History is sorted newest first
                    welcomeSubtitle.textContent += ` | Latest Assessment: ${latest.skill} (${latest.score}%)`;
                }
            }
        }

        // --- 3. Populate Skill Gap Analysis ---
        const skillGapContainer = document.getElementById("skillGapContainer");
        if (skillGapContainer) {
            skillGapContainer.innerHTML = "";
            
            if (history.length === 0) {
                skillGapContainer.innerHTML = "<p style='color: #64748b; font-size: 14px;'>Complete assessments to see your skill gaps.</p>";
            } else {
                // Extract all skillBreakdown topics from recent assessments
                // To prevent UI clutter, we'll take the breakdowns from up to the 5 most recent assessments
                const recentHistory = history.slice(0, 5);
                
                // Use a Map to keep the latest percentage for each topic
                const uniqueTopics = new Map();
                
                // Iterate backwards so newest history overwrites older history in the Map
                for (let i = recentHistory.length - 1; i >= 0; i--) {
                    const assessment = recentHistory[i];
                    if (assessment.skillBreakdown && assessment.skillBreakdown.length > 0) {
                        assessment.skillBreakdown.forEach(topic => {
                            uniqueTopics.set(topic.topic, topic.percentage);
                        });
                    } else if (assessment.skill) {
                        // Fallback if breakdown is missing, use overall score
                        uniqueTopics.set(assessment.skill, assessment.score);
                    }
                }

                if (uniqueTopics.size === 0) {
                    skillGapContainer.innerHTML = "<p style='color: #64748b; font-size: 14px;'>No skill data available.</p>";
                } else {
                    // Convert to array and render (limit to top 6 to fit nicely in UI)
                    const topicsArray = Array.from(uniqueTopics.entries()).slice(0, 6);
                    
                    topicsArray.forEach(([topicName, percentage]) => {
                        const row = document.createElement("div");
                        row.className = "skill-bar-row";
                        
                        // Default industry requirement to 80% (Proficient)
                        const industryReq = 80;
                        
                        row.innerHTML = `
                            <span class="skill-name">${topicName}</span>
                            <div class="progress-track">
                                <div class="progress-industry" style="width: ${industryReq}%;"></div>
                                <div class="progress-user" style="width: ${percentage}%;"></div>
                            </div>
                            <span class="skill-value">${percentage}%</span>
                        `;
                        skillGapContainer.appendChild(row);
                    });
                }
            }
        }

        // --- 4. Populate Skills to Improve ---
        const skillsToImproveList = document.getElementById("skillsToImproveList");
        skillsToImproveList.innerHTML = "";
        
        if (history.length === 0) {
            skillsToImproveList.innerHTML = "<li style='color: #64748b; list-style: none;'>Take an assessment first.</li>";
        } else {
            // Collect minorPoints from recent assessments
            const recentHistory = history.slice(0, 3); // Look at last 3 for actionable feedback
            const allMinorPoints = new Set();
            
            recentHistory.forEach(assessment => {
                if (assessment.minorPoints && assessment.minorPoints.length > 0) {
                    assessment.minorPoints.forEach(pt => allMinorPoints.add(pt));
                }
            });
            
            if (allMinorPoints.size === 0) {
                skillsToImproveList.innerHTML = "<li style='color: #0f9d58; list-style: none;'>No major skill gaps detected! 🎉</li>";
            } else {
                const minorPointsArr = Array.from(allMinorPoints).slice(0, 5); // Max 5 items
                minorPointsArr.forEach((skill, index) => {
                    const li = document.createElement("li");
                    li.innerHTML = `
                        <span class="skill-number">${index + 1}</span>
                        ${skill}
                    `;
                    skillsToImproveList.appendChild(li);
                });
            }
        }

        // --- 5. Populate Recommended Opportunities ---
        const opportunitiesContainer = document.getElementById("opportunitiesContainer");
        if (opportunitiesContainer) {
            try {
                const oppResponse = await fetch("${API_BASE_URL}/api/opportunities", {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                
                if (oppResponse.ok) {
                    const oppData = await oppResponse.json();
                    const opportunities = oppData.opportunities || [];
                    
                    if (opportunities.length === 0) {
                        opportunitiesContainer.innerHTML = "<p style='color: #64748b; font-size: 14px; padding: 15px;'>No opportunities available yet.</p>";
                    } else {
                        opportunitiesContainer.innerHTML = "";
                        opportunities.forEach(opp => {
                            const matchPercentage = Math.floor(Math.random() * (95 - 75 + 1)) + 75; // Mock match percentage for now
                            
                            const jobCard = document.createElement("div");
                            jobCard.className = "job-card";
                            jobCard.innerHTML = `
                                <div class="job-icon">
                                    <span class="material-icons-round">work</span>
                                </div>
                                <div class="job-details">
                                    <div class="job-title-row">
                                        <h4>${opp.title}</h4>
                                        <span class="match-badge">${matchPercentage}% Match</span>
                                    </div>
                                    <p class="company-name">${opp.companyName}</p>
                                    <div class="job-tags">
                                        ${opp.workMode ? `<span class="tag">${opp.workMode}</span>` : ""}
                                        ${opp.stipend ? `<span class="tag">${opp.stipend}</span>` : ""}
                                        ${opp.duration ? `<span class="tag">${opp.duration}</span>` : ""}
                                    </div>
                                    <div class="job-actions">
                                        <button class="primary-btn apply-btn" data-id="${opp._id}">Apply Now</button>
                                    </div>
                                </div>
                            `;
                            opportunitiesContainer.appendChild(jobCard);
                        });

                        // Add event listeners for apply buttons
                        document.querySelectorAll('.apply-btn').forEach(btn => {
                            btn.addEventListener('click', async (e) => {
                                const oppId = e.target.getAttribute('data-id');
                                const originalText = e.target.textContent;
                                e.target.textContent = 'Applying...';
                                e.target.disabled = true;

                                try {
                                    const res = await fetch('${API_BASE_URL}/api/applications', {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json',
                                            'Authorization': `Bearer ${token}`
                                        },
                                        body: JSON.stringify({ opportunityId: oppId })
                                    });

                                    const data = await res.json();
                                    
                                    if (res.ok) {
                                        e.target.textContent = 'Applied';
                                        e.target.classList.replace('primary-btn', 'secondary-btn');
                                        alert('Application submitted successfully!');
                                    } else {
                                        e.target.textContent = originalText;
                                        e.target.disabled = false;
                                        alert(data.message || 'Failed to apply');
                                    }
                                } catch (err) {
                                    console.error(err);
                                    e.target.textContent = originalText;
                                    e.target.disabled = false;
                                    alert('Server error while applying');
                                }
                            });
                        });
                    }
                }
            } catch (error) {
                console.error("Error fetching opportunities:", error);
                opportunitiesContainer.innerHTML = "<p style='color: #e74c3c; font-size: 14px; padding: 15px;'>Failed to load opportunities.</p>";
            }
        }

    } catch (error) {
        console.error("Error fetching dashboard data:", error);
    }
});