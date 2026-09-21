document.addEventListener("DOMContentLoaded", () => {
    // We assume there's a button with an ID or text "Publish Opportunity"
    // Let's bind to a form submission or a button click
    const publishBtn = document.querySelector("button:contains('Publish Opportunity')") 
        || Array.from(document.querySelectorAll("button")).find(b => b.textContent.includes("Publish"))
        || document.getElementById("publishBtn");
        
    const form = document.querySelector("form");

    const submitHandler = async (e) => {
        if (e) e.preventDefault();

        // Retrieve token
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Authentication token missing. Please log in.");
            window.location.href = "../login.html";
            return;
        }

        // Check if user is industry
        const userDataStr = localStorage.getItem("user");
        if (userDataStr) {
            const userData = JSON.parse(userDataStr);
            if (userData.role !== "industry") {
                alert("Forbidden: Only Industry users can publish opportunities.");
                return;
            }
        }

        // Helper to get value
        const getVal = (nameOrId) => {
            const el = document.getElementById(nameOrId) || document.querySelector(`[name="${nameOrId}"]`);
            return el ? el.value : undefined;
        };

        // For opportunityType (could be radio or select)
        let opportunityType = getVal("opportunityType");
        if (!opportunityType) {
            const checkedRadio = document.querySelector('input[name="opportunityType"]:checked');
            if (checkedRadio) opportunityType = checkedRadio.value;
        }

        const payload = {
            opportunityType: opportunityType,
            title: getVal("title"),
            companyName: getVal("companyName"),
            shortDescription: getVal("shortDescription"),
            description: getVal("description"),
            location: getVal("location"),
            workMode: getVal("workMode"),
            duration: getVal("duration"),
            positions: getVal("positions") ? parseInt(getVal("positions")) : 1,
            stipend: getVal("stipend"),
            deadline: getVal("deadline"),
            experience: getVal("experience"),
            education: getVal("education"),
            responsibilities: getVal("responsibilities"),
            requirements: getVal("requirements"),
            learningOutcomes: getVal("learningOutcomes")
        };

        // Benefits (assuming comma separated or multi-select, handling as string for now)
        const benefitsVal = getVal("benefits");
        if (benefitsVal) {
            payload.benefits = benefitsVal.split(",").map(b => b.trim()).filter(b => b);
        }

        // Required skills chips collection
        // Adjust these selectors based on your exact HTML structure!
        const requiredSkills = [];
        const skillChips = document.querySelectorAll(".skill-chip, .skill-item"); // Example selector
        skillChips.forEach(chip => {
            const name = chip.getAttribute("data-name") || chip.querySelector(".skill-name")?.textContent || chip.textContent.trim();
            const level = chip.getAttribute("data-level") || chip.querySelector(".skill-level")?.textContent || "Beginner";
            if (name) {
                requiredSkills.push({ name: name.trim(), level: level.trim() });
            }
        });
        
        // If skill chips are not found, let's try getting from a hidden input or just an empty array
        if (requiredSkills.length > 0) {
            payload.requiredSkills = requiredSkills;
        }

        // Validation
        if (!payload.opportunityType || !payload.title || !payload.description || !payload.companyName) {
            alert("Please fill in the required fields: type, title, company, description.");
            return;
        }

        try {
            // Disable button during submission
            if (publishBtn) {
                publishBtn.disabled = true;
                publishBtn.textContent = "Publishing...";
            }

            const response = await fetch("${API_BASE_URL}/api/opportunities", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) {
                alert("Opportunity published successfully.");
                // Redirect or clear
                window.location.href = "dashboard.html";
            } else {
                alert(`Error: ${data.message || "Failed to publish"}`);
                if (publishBtn) {
                    publishBtn.disabled = false;
                    publishBtn.textContent = "Publish Opportunity";
                }
            }
        } catch (error) {
            console.error("Network error:", error);
            alert("Network error occurred while publishing.");
            if (publishBtn) {
                publishBtn.disabled = false;
                publishBtn.textContent = "Publish Opportunity";
            }
        }
    };

    if (form) {
        form.addEventListener("submit", submitHandler);
    } else if (publishBtn) {
        publishBtn.addEventListener("click", submitHandler);
    }
});
