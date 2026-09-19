import { GoogleGenerativeAI } from "@google/generative-ai";
import StudentProfile from "../models/StudentProfile.js";
import AssessmentSession from "../models/AssessmentSession.js";
import AssessmentResult from "../models/AssessmentResult.js";

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "PLACEHOLDER_KEY");

export const generateQuestions = async (req, res) => {
    try {
        const { skill } = req.body;

        if (!skill) {
            return res.status(400).json({ success: false, message: "Skill is required" });
        }

        if (!process.env.GEMINI_API_KEY) {
            console.warn("GEMINI_API_KEY is not set in environment variables.");
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `Generate a multiple choice assessment test for the skill: ${skill}. 
        Provide exactly 10 questions. 
        Each question should have exactly 4 options (A, B, C, D).
        Indicate the correct option letter.
        Include a 'topic' (e.g. "Data Structures" or "Panchakarma") and 'subtopic' (e.g. "Trees" or "Abhyanga").
        
        IMPORTANT SAFETY INSTRUCTION:
        If the skill relates to healthcare, medicine, or Ayurveda (e.g. Dosha Assessment, Nadi Pariksha), generate strictly educational questions testing conceptual knowledge, terminology, principles, and theoretical understanding. Do NOT generate questions that ask for or provide personalized medical diagnosis, treatments, or prescriptions.
        
        The output MUST be exactly in the following JSON format (no markdown tags, just pure JSON):
        [
            {
                "question": "Question text here?",
                "topic": "General",
                "subtopic": "Basics",
                "options": {
                    "A": "Option A text",
                    "B": "Option B text",
                    "C": "Option C text",
                    "D": "Option D text"
                },
                "correctAnswer": "A"
            }
        ]`;

        let questions = [];

        try {
            const result = await model.generateContent(prompt);
            let text = result.response.text();
            
            text = text.replace(/```json/g, "").replace(/```/g, "").trim();

            let parsed = JSON.parse(text);
            
            // Bulletproof checking in case Gemini wraps it in an object like { "questions": [...] }
            if (!Array.isArray(parsed) && parsed.questions && Array.isArray(parsed.questions)) {
                parsed = parsed.questions;
            }
            
            if (Array.isArray(parsed) && parsed.length > 0) {
                questions = parsed;
            } else {
                throw new Error("Gemini returned invalid structure");
            }
        } catch (apiError) {
            console.warn("Gemini API failed or key is invalid, using fallback mock questions:", apiError.message);
            questions = getMockQuestions(skill);
        }

        // Save session with correct answers to the database securely
        const session = new AssessmentSession({
            user: req.user.userId,
            skill: skill,
            questions: questions,
            status: 'in_progress'
        });
        await session.save();

        // Strip correct answers before sending to frontend for security
        const safeQuestions = questions.map(q => {
            const { correctAnswer, ...safeQ } = q;
            return safeQ;
        });

        res.status(200).json({
            success: true,
            sessionId: session._id,
            questions: safeQuestions
        });

    } catch (error) {
        console.error("Error generating questions:", error);
        res.status(500).json({ success: false, message: "Failed to generate assessment questions" });
    }
};

// Fallback function to generate 10 realistic, hard mock questions so the hackathon demo works
function getMockQuestions(skill) {
    const sLower = skill.toLowerCase();
    const isAyurveda = ["ayur", "dosha", "vata", "pitta", "kapha", "panch", "abhyanga", "shirodhara", "nasya", "herb", "churna", "decoction", "nadi", "diet", "ahara"].some(k => sLower.includes(k));

    if (isAyurveda) {
        return [
            {
                question: `In the context of ${skill}, how does the predominance of Vata dosha physically manifest in an individual's constitution?`,
                topic: `Dosha Assessment`,
                subtopic: `Vata`,
                options: { A: `Dry skin, irregular appetite, and cold sensitivity`, B: `Excessive sweating, strong digestion, and warm body`, C: `Oily skin, slow digestion, and heavy build`, D: `Perfectly balanced digestion and moderate build` },
                correctAnswer: "A"
            },
            {
                question: `Which fundamental principle dictates the selection of herbs for a patient undergoing ${skill} therapy?`,
                topic: `Herbal Formulation`,
                subtopic: `Principles`,
                options: { A: `The principle of Vipaka (post-digestive effect)`, B: `The principle of random selection`, C: `The principle of allopathic interaction`, D: `The principle of surgical intervention` },
                correctAnswer: "A"
            },
            {
                question: `During the assessment of ${skill}, what does a 'Manduka Gati' (frog-like pulse) indicate in Nadi Pariksha?`,
                topic: `Nadi Pariksha`,
                subtopic: `Pulse Analysis`,
                options: { A: `Pitta dosha predominance`, B: `Kapha dosha predominance`, C: `Vata dosha predominance`, D: `Complete tridoshic balance` },
                correctAnswer: "A"
            },
            {
                question: `What is the primary physiological objective of administering Sneapana (internal oleation) before beginning a complete ${skill} procedure?`,
                topic: `Panchakarma Techniques`,
                subtopic: `Preparation`,
                options: { A: `To loosen and mobilize deep-seated Ama (toxins) into the GI tract`, B: `To immediately induce purgation`, C: `To cool the body temperature`, D: `To increase Vata dosha` },
                correctAnswer: "A"
            },
            {
                question: `According to Ayurvedic Dietetics applied to ${skill}, which taste (Rasa) is most effective for pacifying aggravated Pitta?`,
                topic: `Ayurvedic Dietetics`,
                subtopic: `Ahara Vigyan`,
                options: { A: `Sweet (Madhura), Bitter (Tikta), and Astringent (Kashaya)`, B: `Sour (Amla), Salty (Lavana), and Pungent (Katu)`, C: `Only Pungent (Katu)`, D: `Only Salty (Lavana)` },
                correctAnswer: "A"
            },
            {
                question: `In formulating treatments for ${skill}, how does the concept of 'Anupana' (vehicle) enhance therapeutic efficacy?`,
                topic: `Herbal Formulation`,
                subtopic: `Bhaishajya Kalpana`,
                options: { A: `By acting as a carrier to transport herbs to specific tissues (Dhatus)`, B: `By neutralizing the active ingredients`, C: `By increasing the shelf life of the medicine indefinitely`, D: `By adding artificial flavoring` },
                correctAnswer: "A"
            },
            {
                question: `When evaluating a patient's suitability for ${skill}, which factor represents their core, unchangeable constitution?`,
                topic: `Dosha Assessment`,
                subtopic: `Prakriti`,
                options: { A: `Prakriti`, B: `Vikriti`, C: `Ama`, D: `Ojas` },
                correctAnswer: "A"
            },
            {
                question: `Which specific Panchakarma procedure is indicated as the primary treatment for Kapha disorders related to ${skill}?`,
                topic: `Panchakarma Techniques`,
                subtopic: `Vamana`,
                options: { A: `Vamana (Therapeutic emesis)`, B: `Virechana (Therapeutic purgation)`, C: `Basti (Medicated enema)`, D: `Raktamokshana (Bloodletting)` },
                correctAnswer: "A"
            },
            {
                question: `How does the seasonal regimen (Ritucharya) influence the application of ${skill}?`,
                topic: `Ayurvedic Dietetics`,
                subtopic: `Seasonal Regimen`,
                options: { A: `By dictating diet and lifestyle modifications to prevent seasonal doshic accumulation`, B: `By completely halting all treatments during winter`, C: `By ignoring seasonal changes entirely`, D: `By prescribing only cold therapies year-round` },
                correctAnswer: "A"
            },
            {
                question: `What role does 'Agni' (digestive fire) play in the success of ${skill} interventions?`,
                topic: `Core Concepts`,
                subtopic: `Agni`,
                options: { A: `It determines the capacity to digest food and assimilate medicinal herbs`, B: `It only affects body temperature`, C: `It has no bearing on treatment outcomes`, D: `It is only relevant during childhood` },
                correctAnswer: "A"
            }
        ];
    }

    const defaultQuestions = [
        {
            question: `When optimizing the execution context of a ${skill} application, which algorithmic approach yields O(1) complexity for state retrieval?`,
            topic: `Core Concepts`,
            subtopic: `Performance`,
            options: { A: `Hash Map / Dictionary structures`, B: `Binary Search Trees`, C: `Linear Array Traversal`, D: `Doubly Linked Lists` },
            correctAnswer: "A"
        },
        {
            question: `In a microservices architecture utilizing ${skill}, what is the most robust method for handling distributed transactions without locking?`,
            topic: `Architecture`,
            subtopic: `Distributed Systems`,
            options: { A: `Saga Pattern with Compensating Transactions`, B: `Two-Phase Commit (2PC)`, C: `Synchronous REST Polling`, D: `Global Shared Database` },
            correctAnswer: "A"
        },
        {
            question: `Which concurrency model is intrinsically leveraged by the core event loop of ${skill} to prevent thread starvation?`,
            topic: `Core Concepts`,
            subtopic: `Concurrency`,
            options: { A: `Asynchronous Non-blocking I/O`, B: `Multi-threaded Preemptive Scheduling`, C: `Synchronous Blocking I/O`, D: `Global Interpreter Lock (GIL)` },
            correctAnswer: "A"
        },
        {
            question: `When resolving dependency conflicts in a massive ${skill} monorepo, which resolution strategy guarantees deterministic builds?`,
            topic: `Tooling`,
            subtopic: `Dependency Management`,
            options: { A: `Strict Lockfile / Hash Verification`, B: `Semantic Versioning (SemVer) ranges`, C: `Dynamic Runtime Resolution`, D: `Glob pattern matching` },
            correctAnswer: "A"
        },
        {
            question: `How does ${skill} handle memory leak prevention in long-running daemon processes?`,
            topic: `Core Concepts`,
            subtopic: `Memory Management`,
            options: { A: `Mark-and-Sweep Garbage Collection`, B: `Manual Memory Allocation (malloc/free)`, C: `Reference Counting exclusively`, D: `Heap fragmentation` },
            correctAnswer: "A"
        },
        {
            question: `To achieve zero-downtime deployments with a stateful ${skill} service, which orchestration technique is mandatory?`,
            topic: `Architecture`,
            subtopic: `Deployments`,
            options: { A: `Blue-Green Deployment with Session Draining`, B: `Hard Restart`, C: `Rolling Update with immediate termination`, D: `Canary Release without sticky sessions` },
            correctAnswer: "A"
        },
        {
            question: `Which cryptographic standard should be implemented when securing payloads in a ${skill} RESTful API?`,
            topic: `Security`,
            subtopic: `Cryptography`,
            options: { A: `AES-256-GCM`, B: `MD5 Hashing`, C: `Base64 Encoding`, D: `DES` },
            correctAnswer: "A"
        },
        {
            question: `When a ${skill} node encounters a network partition (Split Brain), how is data consistency guaranteed according to the CAP theorem?`,
            topic: `Architecture`,
            subtopic: `Distributed Systems`,
            options: { A: `By sacrificing Availability for Consistency (CP)`, B: `By prioritizing Availability (AP)`, C: `By maintaining both (CA)`, D: `By restarting the node` },
            correctAnswer: "A"
        },
        {
            question: `What is the theoretical maximum throughput (TPS) bottleneck for a single-threaded ${skill} instance bound by CPU?`,
            topic: `Core Concepts`,
            subtopic: `Performance`,
            options: { A: `Clock speed and IPC (Instructions Per Clock)`, B: `Network latency`, C: `Disk I/O speed`, D: `RAM capacity` },
            correctAnswer: "A"
        },
        {
            question: `In the context of ${skill}, what does "Idempotency" guarantee in a distributed API system?`,
            topic: `Architecture`,
            subtopic: `API Design`,
            options: { A: `Multiple identical requests yield the same system state`, B: `Requests are executed in exact order`, C: `Data is encrypted at rest`, D: `Responses are cached indefinitely` },
            correctAnswer: "A"
        }
    ];
    return defaultQuestions;
}

export const submitAssessment = async (req, res) => {
    try {
        const { sessionId, answers } = req.body;
        const userId = req.user.userId;

        if (!sessionId || !answers) {
            return res.status(400).json({ success: false, message: "Session ID and answers are required" });
        }

        const session = await AssessmentSession.findOne({ _id: sessionId, user: userId });
        if (!session) {
            return res.status(404).json({ success: false, message: "Assessment session not found" });
        }

        if (session.status === 'completed') {
            return res.status(400).json({ success: false, message: "Assessment already completed" });
        }

        const questions = session.questions;
        const totalQuestions = questions.length;
        let correctAnswers = 0;
        
        // Topic tracking
        const topicStats = {};

        questions.forEach((q, index) => {
            const userAns = (answers[index] || "").toUpperCase();
            const correctAns = (q.correctAnswer || "").toUpperCase();
            
            const isCorrect = userAns === correctAns;
            if (isCorrect) correctAnswers++;

            const topicKey = q.subtopic ? `${q.topic}: ${q.subtopic}` : (q.topic || "General");
            
            if (!topicStats[topicKey]) {
                topicStats[topicKey] = { total: 0, correct: 0 };
            }
            topicStats[topicKey].total++;
            if (isCorrect) {
                topicStats[topicKey].correct++;
            }
        });

        const incorrectAnswers = totalQuestions - correctAnswers;
        const score = Math.round((correctAnswers / totalQuestions) * 100);
        
        let status = "Developing";
        if (score >= 80) status = "Expert";
        else if (score >= 60) status = "Proficient";

        const skillBreakdown = [];
        const plusPoints = [];
        const minorPoints = [];
        const recommendations = [];

        for (const [topic, stats] of Object.entries(topicStats)) {
            const percentage = Math.round((stats.correct / stats.total) * 100);
            skillBreakdown.push({
                topic,
                total: stats.total,
                correct: stats.correct,
                percentage
            });

            if (percentage >= 80) {
                plusPoints.push(topic);
            } else if (percentage < 60) {
                minorPoints.push(topic);
                recommendations.push(`Review and practice concepts related to ${topic}.`);
            }
        }

        // Create the result
        const result = new AssessmentResult({
            user: userId,
            skill: session.skill,
            totalQuestions,
            correctAnswers,
            incorrectAnswers,
            score,
            status,
            skillBreakdown,
            plusPoints,
            minorPoints,
            recommendations
        });
        await result.save();

        // Mark session as completed
        session.status = 'completed';
        await session.save();

        // Update student profile
        const profile = await StudentProfile.findOne({ user: userId });
        if (profile) {
            profile.skillScore = profile.skillScore === 0 ? score : Math.round((profile.skillScore + score) / 2);
            await profile.save();
        }

        res.status(200).json({
            success: true,
            message: "Assessment submitted successfully",
            resultId: result._id
        });

    } catch (error) {
        console.error("Error submitting assessment:", error);
        res.status(500).json({ success: false, message: "Failed to submit assessment" });
    }
};

export const getLatestResult = async (req, res) => {
    try {
        const userId = req.user.userId;
        
        // Find the most recently created result for this user
        const result = await AssessmentResult.findOne({ user: userId }).sort({ createdAt: -1 });
        
        if (!result) {
            return res.status(404).json({ success: false, message: "No assessment results found" });
        }

        res.status(200).json({
            success: true,
            result
        });
    } catch (error) {
        console.error("Error fetching latest result:", error);
        res.status(500).json({ success: false, message: "Failed to fetch result" });
    }
};

export const getHistory = async (req, res) => {
    try {
        const userId = req.user.userId;
        
        // Find all results for this user, sorted by most recent
        const history = await AssessmentResult.find({ user: userId }).sort({ createdAt: -1 });

        if (!history || history.length === 0) {
            return res.status(200).json({ success: true, history: [] });
        }

        res.status(200).json({
            success: true,
            history: history
        });

    } catch (error) {
        console.error("Error fetching assessment history:", error);
        res.status(500).json({ success: false, message: "Failed to fetch assessment history" });
    }
};
