document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    
    if (!token || !userStr) {
        window.location.href = "../login.html";
        return;
    }

    const user = JSON.parse(userStr);
    if (user.role !== "industry") {
        window.location.href = "../login.html";
        return;
    }

    // DOM Elements - View
    const profileLoading = document.getElementById("profileLoading");
    const profileView = document.getElementById("profileView");
    const profileEdit = document.getElementById("profileEdit");

    const viewLogo = document.getElementById("viewLogo");
    const viewCompanyName = document.getElementById("viewCompanyName");
    const viewDomain = document.getElementById("viewDomain");
    const viewEmail = document.getElementById("viewEmail");
    const viewWebsite = document.getElementById("viewWebsite");
    const viewLocation = document.getElementById("viewLocation");
    const viewFounded = document.getElementById("viewFounded");
    const viewSize = document.getElementById("viewSize");
    const viewAbout = document.getElementById("viewAbout");
    const viewOpportunities = document.getElementById("viewOpportunities");
    const viewTechnologies = document.getElementById("viewTechnologies");
    const viewPhone = document.getElementById("viewPhone");
    const viewAddress = document.getElementById("viewAddress");

    // DOM Elements - Edit Form
    const profileForm = document.getElementById("profileForm");
    const editCompanyName = document.getElementById("editCompanyName");
    const editEmail = document.getElementById("editEmail");
    const editDomain = document.getElementById("editDomain");
    const editWebsite = document.getElementById("editWebsite");
    const editLocation = document.getElementById("editLocation");
    const editFounded = document.getElementById("editFounded");
    const editSize = document.getElementById("editSize");
    const editAbout = document.getElementById("editAbout");
    const editOpportunities = document.getElementById("editOpportunities");
    const editTechnologies = document.getElementById("editTechnologies");
    const editPhone = document.getElementById("editPhone");
    const editAddress = document.getElementById("editAddress");

    // Buttons
    const editProfileBtn = document.getElementById("editProfileBtn");
    const cancelEditBtn = document.getElementById("cancelEditBtn");
    const saveProfileBtn = document.getElementById("saveProfileBtn");

    let currentProfile = null;

    async function fetchProfile() {
        try {
            profileLoading.style.display = "block";
            profileView.style.display = "none";
            profileEdit.style.display = "none";

            const res = await fetch(`${API_BASE_URL}/api/industry-profile`, {
                headers: { "Authorization": `Bearer ${token}` }
            });

            const data = await res.json();
            
            if (!res.ok) {
                throw new Error(data.message || "Failed to load profile");
            }

            profileLoading.style.display = "none";

            if (data.profile) {
                currentProfile = data.profile;
                populateView(currentProfile);
                profileView.style.display = "block";
            } else {
                // No profile yet, just basic user info
                currentProfile = {
                    companyName: data.user.name || "",
                    email: data.user.email || ""
                };
                // Show edit form immediately if profile is completely empty
                populateEditForm(currentProfile);
                profileEdit.style.display = "block";
            }

        } catch (error) {
            console.error(error);
            profileLoading.textContent = "Error loading profile.";
            profileLoading.classList.replace("loading-state", "error-state");
        }
    }

    function populateView(profile) {
        viewCompanyName.textContent = profile.companyName || "-";
        viewLogo.textContent = profile.companyName ? profile.companyName.charAt(0).toUpperCase() : "C";
        viewDomain.textContent = profile.industryDomain || "Industry Domain not specified";
        viewEmail.textContent = profile.email || "-";
        
        if (profile.website) {
            viewWebsite.textContent = profile.website;
            viewWebsite.href = profile.website.startsWith('http') ? profile.website : `https://${profile.website}`;
        } else {
            viewWebsite.textContent = "-";
            viewWebsite.removeAttribute("href");
        }

        viewLocation.textContent = profile.location || "-";
        viewFounded.textContent = profile.foundedYear || "-";
        viewSize.textContent = profile.companySize || "-";
        
        viewAbout.textContent = profile.about || "No information provided.";
        viewOpportunities.textContent = profile.opportunitiesDescription || "No information provided.";

        // Tech stack tags
        if (profile.technologies && profile.technologies.length > 0) {
            viewTechnologies.innerHTML = profile.technologies.map(tech => `<span class="skill-tag">${tech}</span>`).join("");
        } else {
            viewTechnologies.innerHTML = `<span class="skill-tag" style="background:transparent; border:none; padding:0; color:var(--text-muted)">No technologies listed</span>`;
        }

        viewPhone.textContent = (profile.contactInfo && profile.contactInfo.phone) ? profile.contactInfo.phone : "-";
        viewAddress.textContent = (profile.contactInfo && profile.contactInfo.address) ? profile.contactInfo.address : "-";
    }

    function populateEditForm(profile) {
        editCompanyName.value = profile.companyName || "";
        editEmail.value = profile.email || "";
        editDomain.value = profile.industryDomain || "";
        editWebsite.value = profile.website || "";
        editLocation.value = profile.location || "";
        editFounded.value = profile.foundedYear || "";
        editSize.value = profile.companySize || "";
        editAbout.value = profile.about || "";
        editOpportunities.value = profile.opportunitiesDescription || "";
        
        if (profile.technologies) {
            editTechnologies.value = profile.technologies.join(", ");
        } else {
            editTechnologies.value = "";
        }

        editPhone.value = (profile.contactInfo && profile.contactInfo.phone) ? profile.contactInfo.phone : "";
        editAddress.value = (profile.contactInfo && profile.contactInfo.address) ? profile.contactInfo.address : "";
    }

    editProfileBtn.addEventListener("click", () => {
        populateEditForm(currentProfile);
        profileView.style.display = "none";
        profileEdit.style.display = "block";
    });

    cancelEditBtn.addEventListener("click", () => {
        if (!currentProfile._id) {
            // Cannot cancel if no profile exists yet
            alert("Please save your initial profile.");
            return;
        }
        profileEdit.style.display = "none";
        profileView.style.display = "block";
    });

    profileForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Process tech stack tags
        const techString = editTechnologies.value.trim();
        const techArray = techString ? techString.split(",").map(t => t.trim()).filter(t => t) : [];

        const payload = {
            companyName: editCompanyName.value.trim(),
            email: editEmail.value.trim(),
            industryDomain: editDomain.value.trim(),
            website: editWebsite.value.trim(),
            location: editLocation.value.trim(),
            foundedYear: editFounded.value ? parseInt(editFounded.value) : null,
            companySize: editSize.value,
            about: editAbout.value.trim(),
            opportunitiesDescription: editOpportunities.value.trim(),
            technologies: techArray,
            contactInfo: {
                phone: editPhone.value.trim(),
                address: editAddress.value.trim()
            }
        };

        const originalBtnText = saveProfileBtn.textContent;
        saveProfileBtn.textContent = "Saving...";
        saveProfileBtn.disabled = true;

        try {
            const res = await fetch(`${API_BASE_URL}/api/industry-profile`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` 
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            
            if (!res.ok) {
                throw new Error(data.message || "Failed to update profile");
            }

            // Update successful
            currentProfile = data.profile;
            populateView(currentProfile);
            
            profileEdit.style.display = "none";
            profileView.style.display = "block";
            
        } catch (error) {
            console.error(error);
            alert(error.message);
        } finally {
            saveProfileBtn.textContent = originalBtnText;
            saveProfileBtn.disabled = false;
        }
    });

    // Initial fetch
    fetchProfile();
});
