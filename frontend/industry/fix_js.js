const fs = require('fs');
const path = require('path');

const dir = '.';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace e.preventDefault(); inside the nav link click handlers
    // We can just safely comment out any e.preventDefault() that appears near navLinks or just generally if it's the demo code
    
    // To be precise, we know the user had: e.preventDefault();
    // Let's replace it with a comment
    
    if (content.includes('e.preventDefault();')) {
        // Only replace it if it's inside the nav section (we don't want to break form submissions)
        // Let's do a regex that targets the specific block.
        
        // Actually, looking at post.html, it's inside:
        // link.addEventListener('click', (e) => { ... e.preventDefault(); ... })
        // Let's replace the whole demo active state logic to be clean
        
        const dashboardRegex = /\/\/ Simple Nav Active State toggling for demonstration[\s\S]*?navLinks\.forEach\(link => \{[\s\S]*?link\.addEventListener\('click', \(e\) => \{[\s\S]*?e\.preventDefault\(\);[\s\S]*?navLinks\.forEach\(l => l\.classList\.remove\('active'\)\);[\s\S]*?e\.currentTarget\.classList\.add\('active'\);[\s\S]*?\/\/ Close mobile menu when a link is clicked[\s\S]*?if \(window\.innerWidth <= 768\) \{[\s\S]*?toggleSidebar\(\);[\s\S]*?\}[\s\S]*?\}\);[\s\S]*?\}\);/g;
        
        const cleanDashboard = `
            // Native Navigation Active State handling
            const navLinks = document.querySelectorAll('.nav-link');
            navLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    // Close mobile menu when a link is clicked
                    if (window.innerWidth <= 768) {
                        if (typeof toggleSidebar === 'function') toggleSidebar();
                    }
                });
            });
        `;
        
        const postRegex = /\/\/ Active Nav Links[\s\S]*?const navLinks = document\.querySelectorAll\('\.nav-link'\);[\s\S]*?navLinks\.forEach\(link => \{[\s\S]*?link\.addEventListener\('click', \(e\) => \{[\s\S]*?if \(e\.currentTarget\.textContent\.trim\(\) !== "Post Opportunity"\) \{[\s\S]*?\/\/ Just visual for demo[\s\S]*?e\.preventDefault\(\);[\s\S]*?navLinks\.forEach\(l => l\.classList\.remove\('active'\)\);[\s\S]*?e\.currentTarget\.classList\.add\('active'\);[\s\S]*?if \(window\.innerWidth <= 768\) toggleSidebar\(\);[\s\S]*?\}[\s\S]*?\}\);[\s\S]*?\}\);/g;
        
        const cleanPost = `
            // Active Nav Links
            const navLinks = document.querySelectorAll('.nav-link');
            navLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    if (window.innerWidth <= 768) {
                        if (typeof toggleSidebar === 'function') toggleSidebar();
                    }
                });
            });
        `;

        if (dashboardRegex.test(content)) {
            content = content.replace(dashboardRegex, cleanDashboard.trim());
        } else if (postRegex.test(content)) {
            content = content.replace(postRegex, cleanPost.trim());
        }
        
        fs.writeFileSync(file, content);
        console.log('Fixed navigation JS in ' + file);
    }
});
