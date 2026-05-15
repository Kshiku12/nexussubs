import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, image } = body;

    const apiKey = process.env.GEMINI_API_KEY;
    
    // If we have the API key, use Gemini
    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);

        // If an image is provided, use multimodal vision to identify it
        if (image) {
          const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

          const prompt = `
          You are an expert media identification AI for NexusSubs.
          The user has provided a screenshot and wants you to identify the movie, TV show, or video game in this image.
          
          User message (if any): "${message || 'What is this from?'}"
          
          Analyze the image carefully. Look for visual cues like:
          - Characters, actors, art style
          - UI elements (if it's a game: HUD, health bars, inventory)
          - Scenery, cinematography, color grading
          - Any visible text, logos, or watermarks
          
          Respond in JSON format only. The JSON must have this structure:
          {
            "text": "Your confident, detailed explanation of what you identified and how you recognized it",
            "action": {
              "type": "identify_media",
              "data": {
                "items": [
                  {
                    "title": "The exact official title",
                    "type": "movie" or "game" or "tv_show",
                    "description": "A high-quality 3-4 sentence summary of the plot/gameplay",
                    "rating": "The IMDb/Metascore rating (e.g., '8.5/10')",
                    "confidence": "high" or "medium" or "low",
                    "year": "Release year if known"
                  }
                ]
              }
            }
          }
          
          If you can identify multiple possible matches, include up to 3 items sorted by confidence (most likely first).
          If you truly cannot identify it, set items to an empty array and explain in text.
          
          Return ONLY valid JSON.
          `;

          // Parse the base64 image data
          const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
          const mimeMatch = image.match(/^data:(image\/\w+);base64,/);
          const mimeType = mimeMatch ? mimeMatch[1] : "image/png";

          const imagePart = {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          };

          const result = await model.generateContent([prompt, imagePart]);
          const responseText = result.response.text();
          
          const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleaned);
          return NextResponse.json(parsed);
        }

        // Normal text-only chat
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
        You are an AI assistant for a platform called NexusSubs.
        Your job is to help users manage subscriptions and recommend media.
        
        User message: "${message}"
        
        Respond in JSON format only. The JSON must have the following structure:
        {
          "text": "Your friendly reply to the user",
          "action": {
             "type": "cancel_subscription" | "recommend_media" | "none",
             "data": { 
                // for cancel: "services": ["netflix", "amazon"]
                // for recommend: "items": [{"title": "Inception", "type": "movie", "description": "A thief who steals corporate secrets through the use of dream-sharing technology...", "rating": "8.8/10"}]
             }
          }
        }
        
        If the user wants to cancel multiple subscriptions (e.g., "cancel my netflix and spotify"), set action.type to "cancel_subscription" and list them in action.data.services. Note that this is a simulated action. Do NOT mention that it is simulated in your text. Sound very professional.
        
        If the user asks for recommendations or is in a specific mood, set action.type to "recommend_media".
        You MUST provide EXACTLY 5 highly relevant titles in action.data.items. 
        CRITICAL: If the user asks for "games", return ONLY games. If they ask for "movies" or "shows", return ONLY movies. Do NOT mix them unless they ask for "both".
        
        For EVERY SINGLE item, you MUST provide:
        1. "title": The name of the movie/game.
        2. "type": "movie" or "game".
        3. "description": A high-quality, 3-sentence summary of the plot.
        4. "rating": The IMDb or Metascore rating (e.g., "9.0/10").
        
        Return ONLY valid JSON.
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        
        const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        return NextResponse.json(parsed);
      } catch (error) {
        console.error("Gemini API Error, falling back to mock:", error);
        // Fallback to mock logic if Gemini fails
        if (image) {
          return NextResponse.json({
            text: "I wasn't able to analyze the image right now. The AI vision service might be temporarily unavailable. Please try again in a moment!",
            action: { type: "none" }
          });
        }
        return handleMockResponse(message);
      }
    } else {
      if (image) {
        return NextResponse.json({
          text: "Image analysis requires the Gemini API key to be configured. Please set up your GEMINI_API_KEY in the environment variables to use the visual lookup feature!",
          action: { type: "none" }
        });
      }
      return handleMockResponse(message);
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ text: "Error processing your request." }, { status: 500 });
  }
}

function handleMockResponse(message: string) {
  const lower = message.toLowerCase();
  
  if (lower.includes("cancel") || lower.includes("get rid of")) {
     let services = [];
     if (lower.includes("netflix")) services.push("Netflix");
     if (lower.includes("spotify")) services.push("Spotify");
     if (lower.includes("amazon") || lower.includes("prime")) services.push("Amazon Prime");
     if (services.length === 0) services.push("Selected Subscriptions");
     
     return NextResponse.json({
        text: "I can certainly help you cancel those subscriptions right away. I will initiate the official cancellation process for you. Please confirm the action below.",
        action: {
          type: "cancel_subscription",
          data: { services }
        }
     });
  }
  
  if (lower.includes("depress") || lower.includes("sad") || lower.includes("cheer") || lower.includes("boys night") || lower.includes("game")) {
     return NextResponse.json({
        text: "I've got just the thing! Whether you're hanging with the boys or need a mood boost, these top-tier picks will definitely hit the spot. Check these out!",
        action: {
          type: "recommend_media",
          data: { 
            items: [
              { title: "Overcooked! 2", type: "game", description: "Journey back to the Onion Kingdom and assemble your team of chefs in classic couch co-op or online play for up to four players.", rating: "8.1/10" },
              { title: "It Takes Two", type: "game", description: "Embark on the craziest journey of your life in It Takes Two, a genre-bending platform adventure created purely for co-op.", rating: "8.9/10" },
              { title: "Mario Kart 8 Deluxe", type: "game", description: "Race and battle your friends in the definitive version of the Mario Kart 8 game.", rating: "9.2/10" },
              { title: "Rocket League", type: "game", description: "A high-powered hybrid of arcade-style soccer and vehicular mayhem with easy-to-understand controls and fluid, physics-driven competition.", rating: "8.0/10" },
              { title: "Jackbox Party Pack 9", type: "game", description: "The biggest and best Jackbox Party Pack yet, featuring five hilarious new games for your next party or hang out.", rating: "8.5/10" }
            ]
          }
        }
     });
  }

  if (lower.includes("horror") || lower.includes("scary")) {
     return NextResponse.json({
        text: "In the mood for a scare? I've got you covered. Here are some of the top recommended horror games and movies that will definitely keep you on the edge of your seat.",
        action: {
          type: "recommend_media",
          data: { 
            items: [
              { title: "The Conjuring", type: "movie", description: "Paranormal investigators Ed and Lorraine Warren work to help a family terrorized by a dark presence in their farmhouse.", rating: "7.5/10" },
              { title: "Hereditary", type: "movie", description: "A grieving family is haunted by tragic and disturbing occurrences.", rating: "7.3/10" },
              { title: "Resident Evil Village", type: "game", description: "Experience survival horror like never before.", rating: "8.4/10" },
              { title: "Silent Hill 2", type: "game", description: "A man travels to a foggy town after receiving a letter from his deceased wife.", rating: "9.4/10" },
              { title: "Alien: Isolation", type: "game", description: "Discover the true meaning of fear in Alien: Isolation, a survival horror set in an atmosphere of constant dread and mortal danger.", rating: "8.1/10" }
            ]
          }
        }
     });
  }

  return NextResponse.json({
     text: "I am your personal AI assistant! I can help you cancel subscriptions or recommend great movies/games. Try asking me for 'games for the boys night' or 'horror movies'!",
     action: { type: "none" }
  });
}
