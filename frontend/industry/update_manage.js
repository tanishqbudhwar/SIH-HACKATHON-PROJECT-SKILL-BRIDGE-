const fs = require('fs');

const css = `
        /* Manage Opportunities Specific Styles */
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 24px; margin-bottom: 32px; }
        .stat-card { background: var(--bg-surface); padding: 24px; border-radius: 12px; border: 1px solid var(--border-color); box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
        .stat-title { color: var(--text-muted); font-size: 14px; font-weight: 500; margin-bottom: 8px; }
        .stat-value { color: var(--brand-primary); font-size: 32px; font-weight: 700; }

        .filter-bar { display: flex; gap: 16px; margin-bottom: 24px; background: var(--bg-surface); padding: 16px; border-radius: 12px; border: 1px solid var(--border-color); align-items: center; flex-wrap: wrap; justify-content: space-between; }
        .filter-group { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
        .search-input, .filter-select { padding: 10px 16px; border: 1px solid var(--border-color); border-radius: 8px; font-size: 14px; outline: none; background: var(--bg-body); }
        .search-input:focus, .filter-select:focus { border-color: var(--brand-accent); }
        .search-input { min-width: 250px; }
        
        .opp-card { background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: 12px; padding: 24px; margin-bottom: 20px; display: flex; flex-direction: column; gap: 16px; transition: box-shadow 0.2s; }
        .opp-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .opp-card-header { display: flex; justify-content: space-between; align-items: flex-start; }
        .opp-title { font-size: 20px; font-weight: 700; color: var(--text-main); margin-bottom: 4px; }
        .opp-subtitle { font-size: 14px; color: var(--text-muted); }
        .opp-status { padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
        .status-active { background: #d1fae5; color: #059669; }
        .status-closed { background: #fee2e2; color: #dc2626; }
        .status-draft { background: #e2e8f0; color: #475569; }
        
        .opp-card-body { padding-bottom: 16px; border-bottom: 1px solid var(--border-color); }
        .opp-description { font-size: 14px; color: var(--text-main); margin-bottom: 16px; line-height: 1.5; }
        .opp-details-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; }
        .detail-item { display: flex; flex-direction: column; gap: 4px; }
        .detail-label { font-size: 12px; color: var(--text-muted); font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; }
        .detail-value { font-size: 14px; font-weight: 500; }
        
        .opp-skills { display: flex; gap: 8px; flex-wrap: wrap; }
        .skill-tag { background: var(--bg-body); color: var(--text-muted); padding: 4px 10px; border-radius: 16px; font-size: 12px; font-weight: 500; border: 1px solid var(--border-color); }
        
        .opp-card-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 4px; }
        .opp-applicants-count { display: flex; align-items: center; gap: 8px; font-weight: 600; color: var(--brand-accent); font-size: 15px; }
        .opp-actions { display: flex; gap: 12px; }

        /* Modal Styles */
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.6); display: none; align-items: center; justify-content: center; z-index: 2000; backdrop-filter: blur(4px); }
        .modal-overlay.active { display: flex; }
        .modal-content { background: var(--bg-surface); width: 95%; max-width: 800px; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); overflow: hidden; animation: modalIn 0.3s ease; display: flex; flex-direction: column; max-height: 85vh; }
        @keyframes modalIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .modal-header { padding: 24px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; background: var(--bg-body); }
        .modal-title { font-size: 20px; font-weight: 700; color: var(--brand-primary); }
        .close-modal { background: none; border: none; cursor: pointer; color: var(--text-muted); font-size: 24px; line-height: 1; padding: 4px; }
        .modal-body { padding: 24px; overflow-y: auto; flex: 1; background: var(--bg-surface); }
        
        .applicant-row { display: flex; justify-content: space-between; align-items: center; padding: 16px; border: 1px solid var(--border-color); border-radius: 12px; margin-bottom: 16px; flex-wrap: wrap; gap: 16px; }
        .applicant-info { display: flex; gap: 16px; align-items: flex-start; }
        .applicant-avatar { width: 48px; height: 48px; border-radius: 50%; background: var(--brand-primary); color: white; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 600; flex-shrink: 0; }
        .applicant-name { font-size: 16px; font-weight: 700; }
        .applicant-course { font-size: 13px; color: var(--text-muted); margin-top: 4px; }
        .applicant-actions { display: flex; gap: 12px; align-items: center; }
        .status-select { padding: 8px 12px; border: 1px solid var(--border-color); border-radius: 8px; font-size: 13px; font-weight: 600; background: var(--bg-body); outline: none; }
        
        .loading-state, .empty-state, .error-state { text-align: center; padding: 48px; color: var(--text-muted); }
        
        @media (max-width: 768px) {
            .opp-card-footer { flex-direction: column; align-items: flex-start; gap: 16px; }
            .opp-actions { width: 100%; justify-content: space-between; }
            .applicant-row { flex-direction: column; align-items: flex-start; }
            .applicant-actions { width: 100%; justify-content: space-between; }
        }
    </style>
`;

const htmlBlock = `
        <main class="dashboard-content">
            <div class="welcome-section" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
                <div>
                    <h1>Manage Opportunities</h1>
                    <p>Create, manage, and track your internships, jobs, and other opportunities.</p>
                </div>
                <a href="post.html" class="btn btn-primary" style="text-decoration: none;">+ Post New Opportunity</a>
            </div>

            <!-- Stats Grid -->
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-title">Active Opportunities</div>
                    <div class="stat-value" id="statActive">0</div>
                </div>
                <div class="stat-card">
                    <div class="stat-title">Total Applicants</div>
                    <div class="stat-value" id="statTotalApplicants">0</div>
                </div>
                <div class="stat-card">
                    <div class="stat-title">Closing Soon</div>
                    <div class="stat-value" id="statClosingSoon">0</div>
                </div>
                <div class="stat-card">
                    <div class="stat-title">Total Positions</div>
                    <div class="stat-value" id="statPositions">0</div>
                </div>
            </div>

            <!-- Filters -->
            <div class="filter-bar">
                <input type="text" class="search-input" id="searchOpp" placeholder="Search opportunities by title or skill...">
                <div class="filter-group">
                    <select class="filter-select" id="filterType">
                        <option value="all">All Types</option>
                        <option value="Internship">Internship</option>
                        <option value="Job">Job</option>
                        <option value="Training">Training</option>
                    </select>
                    <select class="filter-select" id="filterStatus">
                        <option value="all">All Statuses</option>
                        <option value="published">Active</option>
                        <option value="closed">Closed</option>
                        <option value="draft">Draft</option>
                    </select>
                </div>
            </div>

            <!-- Opportunities List -->
            <div id="opportunitiesContainer">
                <div class="loading-state">Loading your opportunities...</div>
            </div>
        </main>

        <!-- Applicants Modal -->
        <div class="modal-overlay" id="applicantModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title" id="modalOppTitle">Applicants</h2>
                    <button class="close-modal" id="closeModalBtn">&times;</button>
                </div>
                <div class="modal-body" id="modalApplicantsList">
                    <!-- Dynamic applicant rows -->
                </div>
            </div>
        </div>
`;

let file = fs.readFileSync('manage.html', 'utf8');

if(file.includes('</style>')) {
    file = file.replace('    </style>', css);
}

const mainRegex = /<main class="dashboard-content">[\s\S]*?<\/main>/;
if(file.match(mainRegex)) {
    file = file.replace(mainRegex, htmlBlock);
} else {
    // just in case it doesn't match perfectly, append it before </div> of dashboard-container
    console.log("Regex didn't match main.");
}

if(!file.includes('manage.js')) {
    file = file.replace('</body>', '    <script src="../js/manage.js"></script>\n</body>');
}

fs.writeFileSync('manage.html', file);
console.log('Modified manage.html');
`;
