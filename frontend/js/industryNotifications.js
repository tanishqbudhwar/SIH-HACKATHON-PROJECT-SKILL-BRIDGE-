document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "../login.html";
        return;
    }

    const mainContainer = document.querySelector(".dashboard-content");
    mainContainer.innerHTML = `
        <div class="welcome-section" style="margin-bottom: 24px;">
            <h1 style="font-size: 24px; margin-bottom: 8px;">Notifications</h1>
            <p style="color: var(--text-muted); font-size: 15px;">Recent applications and updates from students.</p>
        </div>
        
        <div id="notificationsList" style="display: flex; flex-direction: column; gap: 16px;">
            <!-- Notifications will be loaded here -->
        </div>
    `;

    const notificationsList = document.getElementById("notificationsList");

    try {
        const response = await fetch("${API_BASE_URL}/api/applications/industry", {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (response.ok) {
            const data = await response.json();
            renderNotifications(data.applications || []);
        } else {
            notificationsList.innerHTML = `<p style="color: red;">Failed to load notifications.</p>`;
        }
    } catch (error) {
        console.error("Error:", error);
        notificationsList.innerHTML = `<p style="color: red;">Server error.</p>`;
    }

    function renderNotifications(apps) {
        if (apps.length === 0) {
            notificationsList.innerHTML = `
                <div style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: 12px; padding: 32px; text-align: center;">
                    <div style="width: 48px; height: 48px; background: #f1f5f9; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
                        <span class="material-icons-round" style="color: #94a3b8;">notifications_none</span>
                    </div>
                    <p style="color: var(--text-muted); font-size: 15px;">You have no new notifications.</p>
                </div>
            `;
            return;
        }

        notificationsList.innerHTML = apps.map(app => `
            <div style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: 12px; padding: 20px; display: flex; justify-content: space-between; align-items: center; transition: all 0.2s;">
                <div style="display: flex; gap: 16px; align-items: flex-start;">
                    <div style="width: 40px; height: 40px; border-radius: 50%; background: #eff6ff; color: #3b82f6; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 16px; flex-shrink: 0;">
                        ${app.student?.name ? app.student.name.charAt(0) : 'S'}
                    </div>
                    <div>
                        <div style="margin-bottom: 4px; font-size: 15px;">
                            <strong>${app.student?.name || "A student"}</strong> applied for <strong>${app.opportunity?.title || "an opportunity"}</strong>
                        </div>
                        <div style="color: var(--text-muted); font-size: 13px; display: flex; gap: 8px; align-items: center;">
                            <span>${new Date(app.createdAt).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>Status: <span style="color: ${app.status === 'Applied' ? '#eab308' : (app.status === 'Accepted' ? '#22c55e' : '#ef4444')}; font-weight: 500;">${app.status}</span></span>
                        </div>
                    </div>
                </div>
                
                ${app.status === 'Applied' ? `
                <div style="display: flex; gap: 12px;">
                    <button onclick="updateAppStatus('${app._id}', 'Rejected')" style="padding: 8px 16px; background: transparent; border: 1px solid #ef4444; color: #ef4444; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 500;">Reject</button>
                    <button onclick="updateAppStatus('${app._id}', 'Accepted')" style="padding: 8px 16px; background: #22c55e; border: none; color: white; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 500;">Accept</button>
                </div>
                ` : `
                <div>
                    <button style="padding: 8px 16px; background: transparent; border: 1px solid var(--border-color); color: var(--text-main); border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 500;">View Profile</button>
                </div>
                `}
            </div>
        `).join("");
    }

    // Expose function globally for inline handlers
    window.updateAppStatus = async (appId, status) => {
        try {
            const res = await fetch(\`${API_BASE_URL}/api/applications/\${appId}/status\`, {
                method: "PATCH",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": \`Bearer \${token}\`
                },
                body: JSON.stringify({ status })
            });

            if (res.ok) {
                alert(\`Application \${status.toLowerCase()} successfully!\`);
                location.reload(); // Refresh to update list
            } else {
                const err = await res.json();
                alert(err.message || "Failed to update status");
            }
        } catch (error) {
            console.error(error);
            alert("Server error");
        }
    };
});
