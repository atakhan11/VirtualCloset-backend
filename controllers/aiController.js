import { GoogleGenerativeAI } from '@google/generative-ai';

const getStyleAdvice = async (req, res) => {
    const { question, clothes } = req.body;

    if (!question) {
        return res.status(400).json({ message: 'Question not provided.' }); 
    }

    try {
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});
        const hasWardrobe = Array.isArray(clothes) && clothes.length > 0;

        const wardrobeContext = hasWardrobe 
            ? clothes.map(c => `- Name: "${c.name}", Category: "${c.category}", Season: "${c.season || 'not specified'}"`).join('\n') 
            : "Empty"; 

        const prompt = `
            You are a professional and creative style advisor for a virtual wardrobe application called "StyleFolio".
            All your responses MUST be in English.

            RULES:
            1. First, analyze the "WARDROBE LIST" below.
            2. Then, analyze the user's question ("${question}").
            3. Based on these two pieces of information, choose ONE of the following scenarios and respond accordingly:

            -----------------------------------------------------
            **SCENARIO A: If the wardrobe list is NOT "Empty" AND there are SUFFICIENT AND SUITABLE clothes to answer the user's question:**

            - Base your answer SOLELY and EXCLUSIVELY on the clothes in the "WARDROBE LIST".
            - ABSOLUTELY DO NOT invent a clothing item that is not in the list.
            - Precisely state the name of each clothing item you suggest, exactly as it appears in the list.
            - For example: "For a job interview, you can wear the 'White Classic Shirt' with the 'Black Classic Trousers' from your wardrobe."
            -----------------------------------------------------
            **SCENARIO B: If the wardrobe list IS "Empty" OR there are NO suitable clothes for the question:**

            - Completely disregard the wardrobe list.
            - Based on the user's question ("${question}"), provide general, fashionable, and external style advice.
            - Refer to general names for the clothing items you suggest (e.g., "a classic beige trench coat", "dark blue jeans", "white sports shoes").
            - End your response with a friendly sentence encouraging the user to add their clothes to the wardrobe. For example: "For more personalized advice, don't forget to add your own clothes to your wardrobe!"
            -----------------------------------------------------

            WARDROBE LIST:
            ${wardrobeContext}

            USER'S QUESTION: "${question}"

            YOUR ADVICE:
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({ answer: text });

    } catch (error) {
        console.error('AI STYLE ADVICE ERROR:', error);
        res.status(500).json({ message: 'Could not connect to the smart advisor.' }); 
    }
};

export { getStyleAdvice };