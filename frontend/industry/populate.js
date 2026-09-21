const fs = require('fs');

const dashboard = fs.readFileSync('dashboard.html', 'utf8');

const pages = [
    { file: 'profile.html', title: 'Company Profile' },
    { file: 'manage.html', title: 'Manage Opportunities' },
    { file: 'find.html', title: 'Find Students' },
    { file: 'applications.html', title: 'Applications' },
    { file: 'requirement.html', title: 'Skill Requirements' },
    { file: 'program.html', title: 'Learning Programs' },
    { file: 'notification.html', title: 'Notifications' },
    { file: 'setting.html', title: 'Settings' }
];

pages.forEach(p => {
    if (fs.existsSync(p.file)) {
        const stats = fs.statSync(p.file);
        if (stats.size === 0) {
            let newContent = dashboard;
            
            // Remove active class from Dashboard link
            newContent = newContent.replace('class="nav-link active"', 'class="nav-link"');
            
            // Add active class to the current page's link
            const regex = new RegExp('<a href="' + p.file + '" class="nav-link">', 'g');
            newContent = newContent.replace(regex, '<a href="' + p.file + '" class="nav-link active">');
            
            // Replace the main dashboard content
            const mainContentRegex = /<main class="dashboard-content">([\s\S]*?)<\/main>/;
            newContent = newContent.replace(mainContentRegex, 
                '<main class="dashboard-content">\n    <div class="welcome-section">\n        <h1>' + p.title + '</h1>\n        <p>This page is under construction.</p>\n    </div>\n</main>'
            );
            
            fs.writeFileSync(p.file, newContent);
            console.log('Populated ' + p.file);
        }
    }
});
