const fs = require('fs');

const css = `
        /* Applications Specific Styles */
        .filter-bar { display: flex; gap: 16px; margin-bottom: 24px; background: var(--bg-surface); padding: 16px; border-radius: 12px; border: 1px solid var(--border-color); align-items: center; flex-wrap: wrap; }
        .filter-group { display: flex; align-items: center; gap: 8px; flex: 1; min-width: 200px; }
        .search-input, .filter-select { padding: 10px 16px; border: 1px solid var(--border-color); border-radius: 8px; font-size: 14px; color: var(--text-main); width: 100%; outline: none; transition: border-color 0.2s; background: var(--bg-body); }
        .search-input:focus, .filter-select:focus { border-color: var(--brand-accent); }
        .app-card { background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: 12px; padding: 24px; margin-bottom: 16px; display: flex; align-items: center; gap: 24px; transition: transform 0.2s, box-shadow 0.2s; }
        .app-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .app-avatar { width: 64px; height: 64px; border-radius: 50%; background-color: var(--brand-primary); color: white; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 600; flex-shrink: 0; }
        .app-info { flex: 2; }
        .app-name { font-size: 18px; font-weight: 600; margin-bottom: 4px; }
        .app-edu { font-size: 14px; color: var(--text-muted); margin-bottom: 12px; }
        .app-skills { display: flex; gap: 8px; flex-wrap: wrap; }
        .skill-tag { background: var(--bg-body); color: var(--text-muted); padding: 4px 10px; border-radius: 16px; font-size: 12px; font-weight: 500; border: 1px solid var(--border-color); }
        .app-meta { flex: 1.5; display: flex; flex-direction: column; gap: 12px; }
        .meta-row { display: flex; align-items: center; justify-content: space-between; font-size: 13px; }
        .meta-label { color: var(--text-muted); }
        .meta-value { font-weight: 500; }
        .match-bar-container { width: 100%; height: 6px; background: var(--border-color); border-radius: 3px; overflow: hidden; margin-top: 4px; }
        .match-fill { height: 100%; background: var(--brand-accent); border-radius: 3px; }
        .app-actions { flex: 1; display: flex; flex-direction: column; gap: 12px; align-items: flex-end; }
        
        .status-badge { padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-align: center; }
        .status-applied { background: #e2e8f0; color: #475569; }
        .status-under-review { background: #fef3c7; color: #d97706; }
        .status-shortlisted { background: #d1fae5; color: #059669; }
        .status-interview { background: #dbeafe; color: #2563eb; }
        .status-selected { background: #10b981; color: #ffffff; }
        .status-rejected { background: #fee2e2; color: #dc2626; }

        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.6); display: none; align-items: center; justify-content: center; z-index: 2000; backdrop-filter: blur(4px); }
        .modal-overlay.active { display: flex; }
        .modal-content { background: var(--bg-surface); width: 90%; max-width: 600px; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); overflow: hidden; animation: modalIn 0.3s ease; }
        @keyframes modalIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .modal-header { padding: 24px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; }
        .modal-title { font-size: 20px; font-weight: 700; color: var(--text-main); }
        .close-modal { background: none; border: none; cursor: pointer; color: var(--text-muted); font-size: 24px; line-height: 1; padding: 4px; }
        .close-modal:hover { color: var(--text-main); }
        .modal-body { padding: 24px; max-height: 70vh; overflow-y: auto; }
        .modal-footer { padding: 24px; border-top: 1px solid var(--border-color); display: flex; gap: 12px; justify-content: flex-end; background: var(--bg-body); }
        .detail-row { margin-bottom: 16px; }
        .detail-label { font-size: 13px; color: var(--text-muted); margin-bottom: 4px; font-weight: 500; }
        .detail-text { font-size: 15px; line-height: 1.6; }
        .empty-state { text-align: center; padding: 48px; color: var(--text-muted); }
        
        @media (max-width: 768px) {
            .app-card { flex-direction: column; align-items: flex-start; gap: 16px; }
            .app-actions { width: 100%; flex-direction: row; justify-content: space-between; align-items: center; }
            .app-meta { width: 100%; }
            .filter-group { width: 100%; }
        }
    </style>
`;

const htmlBlock = `
        <main class="dashboard-content">
            <div class="welcome-section">
                <h1 id="welcomeMessage">Applications</h1>
                <p>Review, manage, and track candidates who have applied to your opportunities.</p>
            </div>

            <!-- Stats Grid -->
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-title">Total Applications</div>
                    <div class="stat-value">42</div>
                </div>
                <div class="stat-card">
                    <div class="stat-title">Under Review</div>
                    <div class="stat-value">18</div>
                </div>
                <div class="stat-card">
                    <div class="stat-title">Shortlisted</div>
                    <div class="stat-value">12</div>
                </div>
                <div class="stat-card">
                    <div class="stat-title">Selected</div>
                    <div class="stat-value">3</div>
                </div>
            </div>

            <!-- Filters -->
            <div class="filter-bar">
                <div class="filter-group" style="flex: 2;">
                    <input type="text" class="search-input" id="searchApp" placeholder="Search by student name, skill, or opportunity...">
                </div>
                <div class="filter-group">
                    <select class="filter-select" id="filterOpp">
                        <option value="all">All Opportunities</option>
                        <option value="Software Developer Intern">Software Developer Intern</option>
                        <option value="Data Analyst Intern">Data Analyst Intern</option>
                        <option value="Cybersecurity Intern">Cybersecurity Intern</option>
                    </select>
                </div>
                <div class="filter-group">
                    <select class="filter-select" id="filterStatus">
                        <option value="all">All Statuses</option>
                        <option value="Applied">Applied</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Shortlisted">Shortlisted</option>
                        <option value="Interview">Interview</option>
                        <option value="Selected">Selected</option>
                        <option value="Rejected">Rejected</option>
                    </select>
                </div>
            </div>

            <!-- Applications List -->
            <div class="applications-container" id="applicationsContainer">
                <!-- Populated dynamically via JS -->
            </div>
        </main>

        <!-- Profile Modal -->
        <div class="modal-overlay" id="applicantModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title" id="modalName">Student Name</h2>
                    <button class="close-modal" id="closeModal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="detail-row">
                        <div class="detail-label">Education</div>
                        <div class="detail-text" id="modalEdu">...</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Applied Opportunity</div>
                        <div class="detail-text" id="modalOpp">...</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Skills</div>
                        <div class="detail-text app-skills" id="modalSkills" style="margin-top: 8px;">
                            <!-- skills injected here -->
                        </div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Match Percentage</div>
                        <div class="detail-text" style="color: var(--brand-accent); font-weight: 700; font-size: 18px;" id="modalMatch">0%</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Application Date</div>
                        <div class="detail-text" id="modalDate">...</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Current Status</div>
                        <div class="detail-text" id="modalStatusBadge">...</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Short Introduction</div>
                        <div class="detail-text" id="modalIntro">I am a passionate student eager to contribute to your team and grow my skills in a real-world environment.</div>
                    </div>
                </div>
                <div class="modal-footer" id="modalActions">
                    <!-- Actions injected here -->
                </div>
            </div>
        </div>
`;

let file = fs.readFileSync('applications.html', 'utf8');

// Inject CSS
file = file.replace('    </style>', css);

// Inject HTML
const mainRegex = /<main class="dashboard-content">[\s\S]*?<\/main>/;
file = file.replace(mainRegex, htmlBlock);

// Inject script ref
if(!file.includes('applications.js')) {
    file = file.replace('</body>', '    <script src="../js/applications.js"></script>\n</body>');
}

fs.writeFileSync('applications.html', file);
console.log('Modified applications.html');
