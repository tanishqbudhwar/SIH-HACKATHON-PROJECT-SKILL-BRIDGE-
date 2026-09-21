const fs = require('fs');
const path = require('path');

const dir = '.';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;

    // 1. Add id="welcomeMessage" to the h1 if it doesn't have it
    const h1Regex = /<h1>Welcome back, ABC Technologies 👋<\/h1>/;
    if (h1Regex.test(content)) {
        content = content.replace(h1Regex, '<h1 id="welcomeMessage">Welcome back, ABC Technologies 👋</h1>');
        changed = true;
    }
    
    // We can also target any other <h1> that was cloned
    const h1GenericRegex = /<h1>Company Profile<\/h1>|<h1>Manage Opportunities<\/h1>|<h1>Find Students<\/h1>|<h1>Applications<\/h1>|<h1>Skill Requirements<\/h1>|<h1>Learning Programs<\/h1>|<h1>Notifications<\/h1>|<h1>Settings<\/h1>/;
    if (h1GenericRegex.test(content)) {
        content = content.replace(/(<h1>.*?<\/h1>)/, '<div id="welcomeMessage" style="display:none;"></div>$1');
        changed = true;
    }
    
    // 2. Add <script src="../js/industryDashboard.js"></script> before </body>
    if (!content.includes('src="../js/industryDashboard.js"')) {
        content = content.replace(/<\/body>/, '    <script src="../js/industryDashboard.js"></script>\n</body>');
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(file, content);
        console.log('Injected dynamic JS to ' + file);
    }
});
