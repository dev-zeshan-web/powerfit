// Gemini AI Integration - Free API
// Get API key from: https://aistudio.google.com/app/apikey

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY

// Use gemini-2.0-flash (latest free model)
const GEMINI_MODEL = 'gemini-2.0-flash'
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`

const GYM_SYSTEM_PROMPT = `You are PowerFit AI Coach, an expert fitness and gym assistant for PowerFit Gym Management System.
You specialize in:
- Workout planning and exercise recommendations
- Diet and nutrition advice
- BMI analysis and health goals
- Gym class recommendations
- Injury prevention and recovery
- Motivation and fitness tips
- Explaining fitness concepts clearly

Keep responses concise (under 200 words), practical, and encouraging.
Always end with a motivational tip when appropriate.
Format responses with emojis to make them engaging.
If asked non-fitness questions, politely redirect to fitness topics.`

export async function askGemini(userMessage, conversationHistory = []) {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_gemini_api_key_here') {
    return {
      text: "⚠️ Gemini AI not configured. Please add VITE_GEMINI_API_KEY to your .env file.\n\nGet a FREE key at: https://aistudio.google.com/app/apikey",
      error: true
    }
  }

  try {
    const contents = [
      {
        role: 'user',
        parts: [{ text: GYM_SYSTEM_PROMPT }]
      },
      {
        role: 'model',
        parts: [{ text: "Understood! I'm PowerFit AI Coach, ready to help with fitness, workouts, and nutrition advice." }]
      },
      // Include last 4 messages of conversation history
      ...conversationHistory.slice(-4).map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      })),
      {
        role: 'user',
        parts: [{ text: userMessage }]
      }
    ]

    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 500,
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        ]
      })
    })

    if (!response.ok) {
      const err = await response.json()
      const msg = err?.error?.message || 'API request failed'
      if (msg.includes('API_KEY_INVALID') || msg.includes('API key')) {
        return { text: '❌ Invalid Gemini API key. Please check your .env file.', error: true }
      }
      if (msg.includes('not found') || msg.includes('not supported')) {
        return { text: '❌ Gemini model unavailable. The API key may need to be refreshed.', error: true }
      }
      throw new Error(msg)
    }

    const data = await response.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text

    if (!text) throw new Error('Empty response from AI')

    return { text, error: false }
  } catch (error) {
    console.error('Gemini API Error:', error)
    return {
      text: `🤖 AI temporarily unavailable. Please try again.\n\n_${error.message}_`,
      error: true
    }
  }
}

export async function getWorkoutSuggestion(bmi, goal, fitnessLevel) {
  const prompt = `Based on: BMI=${bmi}, Goal=${goal}, Fitness Level=${fitnessLevel}
  Give me a 3-day beginner weekly workout plan (brief, practical, numbered).`
  return askGemini(prompt)
}

export async function getDietAdvice(bmi, goal) {
  const prompt = `For someone with BMI ${bmi} wanting to ${goal}, give 5 quick daily nutrition tips.`
  return askGemini(prompt)
}

export async function analyzeProgress(currentWeight, targetWeight, weeks) {
  const prompt = `Current weight: ${currentWeight}kg, Target: ${targetWeight}kg, Timeline: ${weeks} weeks. 
  Is this realistic? Give brief advice on how to achieve this safely.`
  return askGemini(prompt)
}
