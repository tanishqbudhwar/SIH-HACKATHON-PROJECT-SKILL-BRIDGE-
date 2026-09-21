document.addEventListener("DOMContentLoaded", () => {
    // 1. Get the skill from URL
    const urlParams = new URLSearchParams(window.location.search);
    const skill = urlParams.get('skill');

    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "../login.html";
        return;
    }

    if (!skill) {
        alert("No skill selected for assessment.");
        window.location.href = "assessment.html";
        return;
    }

    // Elements
    const loadingCard = document.getElementById("loadingCard");
    const assessmentCard = document.getElementById("assessmentCard");
    
    const questionCounter = document.getElementById("questionCounter");
    const progressText = document.getElementById("progressText");
    const progressBar = document.getElementById("progressBar");
    const questionText = document.getElementById("questionText");
    
    const optionA = document.getElementById("optionA");
    const optionB = document.getElementById("optionB");
    const optionC = document.getElementById("optionC");
    const optionD = document.getElementById("optionD");
    const options = [optionA, optionB, optionC, optionD];
    
    const optionAText = document.getElementById("optionAText");
    const optionBText = document.getElementById("optionBText");
    const optionCText = document.getElementById("optionCText");
    const optionDText = document.getElementById("optionDText");

    const backBtn = document.getElementById("backBtn");
    const nextBtn = document.getElementById("nextBtn");
    const nextBtnText = document.getElementById("nextBtnText");
    const exitBtn = document.getElementById("exitBtn");

    let questions = [];
    let currentQuestionIndex = 0;
    // userAnswers stores the selected option (e.g. "A", "B", "C", "D") for each index
    let userAnswers = {}; 
    let sessionId = null;

    // Generate Questions via Backend API
    async function generateQuestions() {
        try {
            const response = await fetch("${API_BASE_URL}/api/assessment/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ skill })
            });

            const data = await response.json();
            
            if (data.success && data.questions && data.questions.length > 0) {
                questions = data.questions;
                sessionId = data.sessionId;
                loadingCard.style.display = "none";
                assessmentCard.style.display = "flex";
                renderQuestion();
            } else {
                alert("Failed to generate questions. Please try again.");
                window.location.href = "assessment.html";
            }
        } catch (error) {
            console.error("Error fetching questions:", error);
            alert("An error occurred. Please check your connection or backend server.");
            window.location.href = "assessment.html";
        }
    }

    function renderQuestion() {
        const currentQuestion = questions[currentQuestionIndex];
        const total = questions.length;
        const progressPercentage = Math.round(((currentQuestionIndex + 1) / total) * 100);

        // Update Header & Progress
        questionCounter.textContent = currentQuestionIndex + 1;
        progressText.textContent = `${progressPercentage}%`;
        progressBar.style.width = `${progressPercentage}%`;

        // Update Question text
        questionText.textContent = currentQuestion.question;

        // Update Option texts - Handle case where AI returns an Array OR an Object
        if (Array.isArray(currentQuestion.options)) {
            optionAText.textContent = currentQuestion.options[0] || "Option A";
            optionBText.textContent = currentQuestion.options[1] || "Option B";
            optionCText.textContent = currentQuestion.options[2] || "Option C";
            optionDText.textContent = currentQuestion.options[3] || "Option D";
        } else {
            // Assume it's an object, handle various possible casings (A, a, B, b, etc)
            optionAText.textContent = currentQuestion.options["A"] || currentQuestion.options["a"] || "Option A";
            optionBText.textContent = currentQuestion.options["B"] || currentQuestion.options["b"] || "Option B";
            optionCText.textContent = currentQuestion.options["C"] || currentQuestion.options["c"] || "Option C";
            optionDText.textContent = currentQuestion.options["D"] || currentQuestion.options["d"] || "Option D";
        }

        // Reset selected classes
        options.forEach(opt => opt.classList.remove("selected"));

        // Restore user answer if it exists
        const savedAnswer = userAnswers[currentQuestionIndex];
        if (savedAnswer) {
            const savedOptionEl = document.getElementById(`option${savedAnswer}`);
            if (savedOptionEl) savedOptionEl.classList.add("selected");
        }

        // Update buttons state
        if (currentQuestionIndex === 0) {
            backBtn.disabled = true;
            backBtn.classList.add("opacity-50", "cursor-not-allowed");
            backBtn.classList.remove("hover:bg-gray-100", "hover:text-gray-800");
        } else {
            backBtn.disabled = false;
            backBtn.classList.remove("opacity-50", "cursor-not-allowed");
            backBtn.classList.add("hover:bg-gray-100", "hover:text-gray-800");
        }

        if (currentQuestionIndex === total - 1) {
            nextBtnText.textContent = "Submit Assessment";
        } else {
            nextBtnText.textContent = "Next Question";
        }
    }

    function selectOption(optionId, optionValue) {
        options.forEach(opt => opt.classList.remove("selected"));
        const selectedBtn = document.getElementById(optionId);
        selectedBtn.classList.add("selected");
        userAnswers[currentQuestionIndex] = optionValue;
    }

    // Event Listeners for Options
    optionA.addEventListener("click", () => selectOption("optionA", "A"));
    optionB.addEventListener("click", () => selectOption("optionB", "B"));
    optionC.addEventListener("click", () => selectOption("optionC", "C"));
    optionD.addEventListener("click", () => selectOption("optionD", "D"));

    // Event Listener for Next/Submit
    nextBtn.addEventListener("click", async () => {
        if (!userAnswers[currentQuestionIndex]) {
            alert("Please select an option before proceeding.");
            return;
        }

        if (currentQuestionIndex < questions.length - 1) {
            currentQuestionIndex++;
            renderQuestion();
        } else {
            // Submit Test
            await submitTest();
        }
    });

    // Event Listener for Back
    backBtn.addEventListener("click", () => {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            renderQuestion();
        }
    });

    // Exit Button
    exitBtn.addEventListener("click", () => {
        const confirmExit = confirm("Are you sure you want to exit? Your progress will be lost.");
        if (confirmExit) {
            window.location.href = "assessment.html";
        }
    });

    async function submitTest() {
        nextBtn.disabled = true;
        nextBtnText.textContent = "Submitting...";

        try {
            const response = await fetch("${API_BASE_URL}/api/assessment/submit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    sessionId: sessionId,
                    answers: userAnswers
                })
            });

            const data = await response.json();
            
            if (data.success) {
                // Assessment submitted successfully, navigate to the result page
                window.location.href = `result.html`;
            } else {
                alert("Failed to submit assessment.");
                nextBtn.disabled = false;
                nextBtnText.textContent = "Submit Assessment";
            }
        } catch (error) {
            console.error("Error submitting test:", error);
            alert("Error submitting assessment. Please try again.");
            nextBtn.disabled = false;
            nextBtnText.textContent = "Submit Assessment";
        }
    }

    // Start process
    generateQuestions();
});
