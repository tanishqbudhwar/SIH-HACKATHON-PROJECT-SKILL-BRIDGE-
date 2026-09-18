const saveProfileButton =
    document.getElementById("saveProfileButton");

const token = localStorage.getItem("token");


// Check login
if (!token) {
    window.location.href = "../login.html";
}


// =========================
// LOAD PROFILE
// =========================

const loadProfile = async () => {

    try {

        const response = await fetch(
            "http://localhost:4000/api/profile",
            {
                method: "GET",

                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );


        const data = await response.json();

        console.log(data);


        if (response.ok) {

            const profile = data.profile;

            document.getElementById("college").value =
                profile.college || "";

            document.getElementById("course").value =
                profile.course || "";

            document.getElementById("year").value =
                profile.year || "";

            document.getElementById("skills").value =
                profile.skills
                    ? profile.skills.join(", ")
                    : "";

            document.getElementById("bio").value =
                profile.bio || "";

            document.getElementById("profileUserName").textContent =
                profile.user.name;

        }

    } catch (error) {

        console.error(error);

    }

};


loadProfile();


// =========================
// SAVE PROFILE
// =========================

saveProfileButton.addEventListener("click", async () => {

    const college =
        document.getElementById("college").value;

    const course =
        document.getElementById("course").value;

    const year =
        document.getElementById("year").value;

    const skills =
        document.getElementById("skills").value;

    const bio =
        document.getElementById("bio").value;


    const skillsArray = skills
        .split(",")
        .map(skill => skill.trim())
        .filter(skill => skill !== "");


    try {

        const response = await fetch(
            "http://localhost:4000/api/profile",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },

                body: JSON.stringify({
                    college: college,
                    course: course,
                    year: Number(year),
                    skills: skillsArray,
                    bio: bio
                })
            }
        );


        const data = await response.json();

        console.log(data);


        if (response.ok) {

            alert("Profile saved successfully!");

        } else {

            alert(data.message);

        }

    } catch (error) {

        console.error(error);

        alert("Unable to connect to server");

    }

});