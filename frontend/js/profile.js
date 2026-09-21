const saveProfileButton = document.getElementById("saveProfileButton");
const token = localStorage.getItem("token");
const userData = localStorage.getItem("user");

// Check login
if (!token || !userData) {
    window.location.href = "../login.html";
}

const user = JSON.parse(userData);

// Set basic user info in topbar and card
document.addEventListener("DOMContentLoaded", () => {
    if (user.name) {
        document.getElementById("topUserName").textContent = user.name;
        document.getElementById("cardUserName").textContent = user.name;
    }
    if (user.email) {
        document.getElementById("cardUserEmail").textContent = user.email;
    }
});


// =========================
// STATE
// =========================
let currentProfilePicBase64 = null;

// =========================
// LOAD PROFILE
// =========================
const loadProfile = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/profile`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            const profile = data.profile || data;

            document.getElementById("college").value = profile.college || "";
            document.getElementById("course").value = profile.course || "";
            document.getElementById("year").value = profile.year || "";
            document.getElementById("skills").value = profile.skills ? profile.skills.join(", ") : "";
            document.getElementById("bio").value = profile.bio || "";
            
            if (profile.profilePic) {
                currentProfilePicBase64 = profile.profilePic;
                const avatarPreview = document.getElementById("avatarPreview");
                const avatarIcon = document.getElementById("avatarIcon");
                
                if(avatarPreview && avatarIcon) {
                    avatarPreview.src = profile.profilePic;
                    avatarPreview.style.display = "block";
                    avatarIcon.style.display = "none";
                }
            }
        }
    } catch (error) {
        console.error("Failed to load profile:", error);
    }
};

// =========================
// PROFILE PIC UPLOAD LOGIC
// =========================
const profilePicInput = document.getElementById("profilePicInput");
if(profilePicInput) {
    profilePicInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
            if(file.size > 2 * 1024 * 1024) { // 2MB limit
                alert("Image size should be less than 2MB");
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (event) => {
                currentProfilePicBase64 = event.target.result;
                const avatarPreview = document.getElementById("avatarPreview");
                const avatarIcon = document.getElementById("avatarIcon");
                
                avatarPreview.src = currentProfilePicBase64;
                avatarPreview.style.display = "block";
                avatarIcon.style.display = "none";
            };
            reader.readAsDataURL(file);
        }
    });
}


// =========================
// SAVE PROFILE
// =========================
saveProfileButton.addEventListener("click", async () => {
    const college = document.getElementById("college").value;
    const course = document.getElementById("course").value;
    const year = document.getElementById("year").value;
    const skills = document.getElementById("skills").value;
    const bio = document.getElementById("bio").value;

    const skillsArray = skills
        .split(",")
        .map(skill => skill.trim())
        .filter(skill => skill !== "");

    try {
        saveProfileButton.disabled = true;
        saveProfileButton.innerHTML = `<span class="material-icons-round">hourglass_empty</span> Saving...`;

        const response = await fetch(`${API_BASE_URL}/api/profile`, {
            method: "POST", // Now works as an upsert based on backend change
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                profilePic: currentProfilePicBase64,
                college,
                course,
                year: Number(year),
                skills: skillsArray,
                bio
            })
        });

        const data = await response.json();

        if (response.ok) {
            // Show toast instead of annoying alert
            const toast = document.getElementById("toast");
            toast.classList.add("show");
            setTimeout(() => {
                toast.classList.remove("show");
            }, 3000);
        } else {
            alert(data.message || "Failed to save profile");
        }
    } catch (error) {
        console.error(error);
        alert("Unable to connect to server");
    } finally {
        saveProfileButton.disabled = false;
        saveProfileButton.innerHTML = `<span class="material-icons-round">save</span> Save Profile`;
    }
});


// Initialization
loadProfile();