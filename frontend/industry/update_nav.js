const fs = require('fs');
const files = ['dashboard.html', 'post.html'];

const navMapping = {
    'Dashboard': 'dashboard.html',
    'Company Profile': 'profile.html',
    'Post Opportunity': 'post.html',
    'Manage Opportunities': 'manage.html',
    'Find Students': 'find.html',
    'Applications': 'applications.html',
    'Skill Requirements': 'requirement.html',
    'Learning Programs': 'program.html',
    'Notifications': 'notification.html',
    'Settings': 'setting.html',
    'Log Out': '../signup.html'
};

files.forEach(file => {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    
    const regex = /<a href="#" class="nav-link(.*?)">([\s\S]*?)(Dashboard|Company Profile|Post Opportunity|Manage Opportunities|Find Students|Applications|Skill Requirements|Learning Programs|Notifications|Settings|Log Out)([\s\S]*?)<\/a>/g;
    
    let updatedContent = content.replace(regex, (match, classModifiers, beforeText, linkText, afterText) => {
        let newHref = navMapping[linkText];
        
        let replacement = match.replace('href="#"', `href="${newHref}"`);
        
        // Remove existing active class
        replacement = replacement.replace('nav-link active', 'nav-link');
        
        // Add active class if this is the current page
        if (newHref === file) {
            replacement = replacement.replace('nav-link', 'nav-link active');
        }

        // Add an ID to Log Out so JS can pick it up
        if (linkText === 'Log Out') {
            replacement = replacement.replace('nav-link', 'nav-link" id="logoutBtn');
            // fix double quotes if added
            replacement = replacement.replace('""', '"');
        }
        
        return replacement;
    });
    
    fs.writeFileSync(file, updatedContent);
});
console.log('Updated navigation links in ' + files.join(', '));
