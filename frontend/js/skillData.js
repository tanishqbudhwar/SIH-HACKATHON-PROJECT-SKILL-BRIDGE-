// Centralized repository of all skills in the SkillBridge platform.
// Adding new skills here automatically makes them available in the assessment autocomplete system.

const TECHNICAL_SKILLS = [
    "Python", "Java", "JavaScript", "C++", "C", "C#", "Rust", "Go", 
    "HTML", "CSS", "React", "Node.js", "Express", "MongoDB", "SQL", "MySQL", 
    "Data Structures", "Algorithms", "Machine Learning", "Artificial Intelligence", 
    "Deep Learning", "Cybersecurity", "Cloud Computing", "AWS", "Azure", 
    "Docker", "Kubernetes", "Git", "GitHub", "UI/UX", "Figma", 
    "Data Analysis", "Data Science", "Power BI", "Excel"
];

const SOFT_SKILLS = [
    "Communication", "Leadership", "Project Management"
];

// Ayurveda / Healthcare Skills
const AYURVEDA_SKILLS = [
    "Ayurveda",
    "Ayurveda Fundamentals",
    "Dosha Assessment",
    "Vata",
    "Pitta",
    "Kapha",
    "Panchakarma Techniques",
    "Abhyanga",
    "Shirodhara",
    "Nasya",
    "Herbal Formulation (Bhaishajya Kalpana)",
    "Churnas",
    "Decoctions",
    "Herbal Oils",
    "Nadi Pariksha",
    "Ayurvedic Dietetics (Ahara Vigyan)",
    "Constitution-based nutrition",
    "Seasonal diet and lifestyle"
];

// Export to the global window object for use across scripts
window.ALL_SKILLS = [
    ...TECHNICAL_SKILLS,
    ...SOFT_SKILLS,
    ...AYURVEDA_SKILLS
];
