document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (!token || !userStr) {
        window.location.href = "../login.html";
        return;
    }

    const user = JSON.parse(userStr);
    if (user.role !== "college") {
        window.location.href = "../login.html";
        return;
    }

    document.getElementById("topUserName").textContent = user.name;

    // --- NAVIGATION LOGIC ---
    const navLinks = document.querySelectorAll(".nav-link[data-target]");
    const sections = document.querySelectorAll(".section-view");

    navLinks.forEach(link => {
        link.addEventListener("click", () => {
            // Remove active from all links and sections
            navLinks.forEach(l => l.classList.remove("active"));
            sections.forEach(s => s.classList.remove("active"));

            // Add active to clicked link
            link.classList.add("active");

            // Show corresponding section
            const targetId = link.getAttribute("data-target");
            document.getElementById(targetId).classList.add("active");
            
            // Re-fetch data if needed when switching tabs
            if(targetId === "dashboard") fetchStats();
            if(targetId === "students") fetchStudents();
            if(targetId === "opportunities") fetchOpportunities();
            if(targetId === "applications") fetchApplications();
            if(targetId === "profile") fetchProfile();
        });
    });

    document.getElementById("logoutBtn").addEventListener("click", () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "../login.html";
    });

    // --- API FETCH LOGIC ---
    async function authFetch(url, options = {}) {
        options.headers = {
            ...options.headers,
            "Authorization": `Bearer ${token}`
        };
        const res = await fetch(url, options);
        if (res.status === 401 || res.status === 403) {
            alert("Session expired or unauthorized");
            localStorage.removeItem("token");
            window.location.href = "../login.html";
        }
        return res;
    }

    function formatDate(dateString) {
        if(!dateString) return "-";
        const d = new Date(dateString);
        return d.toLocaleDateString("en-GB", { day: 'numeric', month: 'short', year: 'numeric' });
    }

    function getStatusBadge(status) {
        const safeStatus = status.replace(" ", ".");
        return `<span class="status-badge status-${safeStatus}">${status}</span>`;
    }

    // 1. Fetch Stats
    async function fetchStats() {
        try {
            const res = await authFetch("${API_BASE_URL}/api/college/stats");
            const data = await res.json();
            
            if (res.ok && data.stats) {
                document.getElementById("statStudents").textContent = data.stats.totalStudents;
                document.getElementById("statCompleted").textContent = data.stats.completedProfiles;
                document.getElementById("statOpportunities").textContent = data.stats.activeOpportunities;
                document.getElementById("statPending").textContent = data.stats.pendingApplications;
            }

            // Also fetch recent applications for the dashboard
            const appRes = await authFetch("${API_BASE_URL}/api/college/applications");
            const appData = await appRes.json();
            
            const tbody = document.getElementById("recentApplicationsList");
            tbody.innerHTML = "";
            
            if(appRes.ok && appData.applications && appData.applications.length > 0) {
                const recent = appData.applications.slice(0, 5); // Just first 5
                recent.forEach(app => {
                    const tr = document.createElement("tr");
                    tr.innerHTML = `
                        <td>
                            <div style="font-weight: 600;">${app.student?.name || "Unknown"}</div>
                            <div style="font-size: 12px; color: var(--text-muted);">${app.student?.email || ""}</div>
                        </td>
                        <td>${app.opportunity?.title || "Unknown"}</td>
                        <td>${app.company?.name || "Unknown"}</td>
                        <td>${formatDate(app.createdAt)}</td>
                        <td>${getStatusBadge(app.status)}</td>
                    `;
                    tbody.appendChild(tr);
                });
            } else {
                tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">No recent applications found. Ensure your College Profile name is exact.</td></tr>`;
            }
            
        } catch (error) {
            console.error(error);
        }
    }

    // 2. Fetch Students
    async function fetchStudents() {
        try {
            const res = await authFetch("${API_BASE_URL}/api/college/students");
            const data = await res.json();
            const tbody = document.getElementById("studentsList");
            tbody.innerHTML = "";

            if (res.ok && data.students && data.students.length > 0) {
                data.students.forEach(student => {
                    const tr = document.createElement("tr");
                    tr.innerHTML = `
                        <td>
                            <div style="font-weight: 600;">${student.user?.name || "Unknown"}</div>
                        </td>
                        <td>${student.user?.email || "-"}</td>
                        <td>${student.course || "-"} (${student.year || "-"})</td>
                        <td>
                            <div style="width: 100%; background: var(--border-color); border-radius: 4px; height: 6px; overflow: hidden; margin-top: 8px;">
                                <div style="width: ${student.profileCompletion}%; background: var(--success); height: 100%;"></div>
                            </div>
                            <div style="font-size: 11px; margin-top: 4px; text-align: right;">${student.profileCompletion}%</div>
                        </td>
                        <td><strong>${student.applicationCount}</strong></td>
                    `;
                    tbody.appendChild(tr);
                });
            } else {
                tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">No students registered under your college name yet.</td></tr>`;
            }
        } catch (error) {
            console.error(error);
        }
    }

    // 3. Fetch Opportunities
    async function fetchOpportunities() {
        try {
            const res = await authFetch("${API_BASE_URL}/api/opportunities");
            const data = await res.json();
            const container = document.getElementById("opportunitiesList");
            container.innerHTML = "";

            if (res.ok && data.opportunities && data.opportunities.length > 0) {
                data.opportunities.forEach(opp => {
                    const card = document.createElement("div");
                    card.className = "opportunity-card";
                    card.innerHTML = `
                        <div class="opportunity-title">${opp.title}</div>
                        <div class="opportunity-company">${opp.companyName}</div>
                        <div style="font-size: 13px; color: var(--text-main); margin-bottom: 8px;">
                            <span class="material-icons-round" style="font-size: 16px; vertical-align: middle;">location_on</span> ${opp.location || "Not specified"}
                        </div>
                        <div class="tag-list">
                            <span class="tag">${opp.opportunityType}</span>
                            ${opp.workMode ? `<span class="tag">${opp.workMode}</span>` : ""}
                        </div>
                    `;
                    container.appendChild(card);
                });
            } else {
                container.innerHTML = `<p style="color: var(--text-muted);">No active opportunities found.</p>`;
            }
        } catch (error) {
            console.error(error);
        }
    }

    // 4. Fetch All Applications
    async function fetchApplications() {
        try {
            const res = await authFetch("${API_BASE_URL}/api/college/applications");
            const data = await res.json();
            const tbody = document.getElementById("allApplicationsList");
            tbody.innerHTML = "";

            if (res.ok && data.applications && data.applications.length > 0) {
                data.applications.forEach(app => {
                    const tr = document.createElement("tr");
                    tr.innerHTML = `
                        <td>
                            <div style="font-weight: 600;">${app.student?.name || "Unknown"}</div>
                            <div style="font-size: 12px; color: var(--text-muted);">${app.student?.email || ""}</div>
                        </td>
                        <td>${app.opportunity?.title || "Unknown"}</td>
                        <td>${app.company?.name || "Unknown"}</td>
                        <td>${formatDate(app.createdAt)}</td>
                        <td>${getStatusBadge(app.status)}</td>
                    `;
                    tbody.appendChild(tr);
                });
            } else {
                tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">No applications found.</td></tr>`;
            }
        } catch (error) {
            console.error(error);
        }
    }

    // 5. Fetch Profile
    let currentProfile = null;
    async function fetchProfile() {
        try {
            const res = await authFetch("${API_BASE_URL}/api/college/profile");
            const data = await res.json();
            
            if (res.ok) {
                if(data.profile) {
                    currentProfile = data.profile;
                } else {
                    currentProfile = {
                        collegeName: data.user.name || "",
                        email: data.user.email || ""
                    };
                }
                populateProfileView(currentProfile);
            }
        } catch (error) {
            console.error(error);
        }
    }

    function populateProfileView(profile) {
        document.getElementById("viewCollegeName").textContent = profile.collegeName || "-";
        document.getElementById("viewEmail").textContent = profile.email || "-";
        document.getElementById("viewLocation").textContent = profile.location || "-";
        
        const wv = document.getElementById("viewWebsite");
        if(profile.website) {
            wv.textContent = profile.website;
        } else {
            wv.textContent = "-";
        }

        document.getElementById("viewDepartment").textContent = profile.contactInfo?.department || "-";
        document.getElementById("viewDescription").textContent = profile.description || "-";
    }

    // Profile Edit Logic
    const profileView = document.getElementById("profileView");
    const profileEdit = document.getElementById("profileEdit");

    document.getElementById("editProfileBtn").addEventListener("click", () => {
        document.getElementById("editCollegeName").value = currentProfile.collegeName || "";
        document.getElementById("editEmail").value = currentProfile.email || "";
        document.getElementById("editLocation").value = currentProfile.location || "";
        document.getElementById("editWebsite").value = currentProfile.website || "";
        document.getElementById("editDepartment").value = currentProfile.contactInfo?.department || "";
        document.getElementById("editDescription").value = currentProfile.description || "";

        profileView.style.display = "none";
        profileEdit.style.display = "block";
    });

    document.getElementById("cancelProfileBtn").addEventListener("click", () => {
        if(!currentProfile._id) {
            alert("Please save your initial profile first so students can link to you.");
            return;
        }
        profileEdit.style.display = "none";
        profileView.style.display = "block";
    });

    document.getElementById("profileForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const payload = {
            collegeName: document.getElementById("editCollegeName").value.trim(),
            email: document.getElementById("editEmail").value.trim(),
            location: document.getElementById("editLocation").value.trim(),
            website: document.getElementById("editWebsite").value.trim(),
            description: document.getElementById("editDescription").value.trim(),
            contactInfo: {
                department: document.getElementById("editDepartment").value.trim()
            }
        };

        const btn = document.getElementById("saveProfileBtn");
        const originalText = btn.textContent;
        btn.textContent = "Saving...";
        btn.disabled = true;

        try {
            const res = await fetch("${API_BASE_URL}/api/college/profile", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            
            if(res.ok) {
                currentProfile = data.profile;
                populateProfileView(currentProfile);
                profileEdit.style.display = "none";
                profileView.style.display = "block";
                
                // Fetch stats again in case name changed and affected metrics
                fetchStats();
            } else {
                alert(data.message || "Failed to save profile");
            }
        } catch (error) {
            console.error(error);
            alert("Server error");
        } finally {
            btn.textContent = originalText;
            btn.disabled = false;
        }
    });

    // Initialize Dashboard data
    fetchStats();
});
