import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import * as fs from "node:fs";
import * as path from "node:path";
import { getGeneratedDir } from "./client";

class Agent {
    private ai: GoogleGenAI;
    constructor() {
        this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
    }

    async getDescription(prompt: string): Promise<string> {
        const result: GenerateContentResponse = await this.ai.models.generateContent({
            model: process.env.GEN_MODEL!,
            contents: [{ role: "user", parts: [{ text: prompt }]}],
            config: {
                systemInstruction: [`
                You are a dream world synthesizer that creates a surreal, dreamlike interpretation of collective dreams.
                Analyze the dreams provided and synthesize them into a world description with the following elements:
                
                1. **Atmosphere**: Overall mood and ambiance of the dream world
                2. **Dominant Themes**: Main recurring themes across dreams
                3. **Emotional Landscape**: The collective emotional state
                4. **Visual Elements**: Key visual motifs, colors, and imagery
                5. **Symbolic Entities**: Recurring symbols or archetypes
                6. **World Characteristics**: Physical or metaphysical properties of this dreamscape
                
                Return a single, descriptive paragraph that reads like a rich, artistic description.
                No markdown or JSON allowed in responses.
                `
                ],
            },
        });

        const content = result.candidates?.[0]?.content;
        if (!content?.parts?.length) {
            throw new Error("Gemini response missing content parts")
        }

        return content.parts[0].text || "";
    }

    async getWeightedPrompts(prompt: string): Promise<string> {
        const result: GenerateContentResponse = await this.ai.models.generateContent({
            model: process.env.GEN_MODEL!,
            contents: [{ role: "user", parts: [{ text: prompt }]}],
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            text: {
                                type: Type.STRING,
                            },
                            weight: {
                                type: Type.STRING,
                            },
                        },
                        propertyOrdering: ["text", "weight"],
                    },
                },
                systemInstruction: [`
                You must take the provided text and generate a series of weighted prompts
                from the most important words and phrases in the text. Give responses in JSON format, such as this example:
                [
                    {
                        text: "ambient cinematic strings, gentle piano, slow build",
                        weight: 1.0
                    },
                ]
                `
                ],
            },
        });

        if (!result.text) {
            throw new Error("No response given")
        }

        return result.text;
    }

    async getImage(type: string, prompt: string): Promise<string> {
        const outDir = getGeneratedDir();
        if (!fs.existsSync(outDir)) {
            throw new Error("Generated media directory does not exist!");
        }


        if (type == 'background') {
            prompt = `A surreal, dreamlike, abstract background that captures the essence of the following dream world description: ${prompt}`;
        }

        if (type.includes("floating")){
            prompt = `A surreal, dreamlike, abstract floating object that would exist in the following dream world: ${prompt}`;
        }

        const result = await this.ai.models.generateImages({
            model: process.env.IMAGE_MODEL!,
            prompt,
            config: { numberOfImages: 1, aspectRatio: "4:3" },
        });

        if (!result.generatedImages || !result.generatedImages.length){
            throw new Error("No images generated");
        }
        
        if (result.generatedImages && result.generatedImages.length > 0) {
            const imagePath = `${outDir}/${type}.png`;
            const generatedImage = result.generatedImages[0];
            if (generatedImage.image) {
                const imgBytes = generatedImage.image.imageBytes!;
                const buffer = Buffer.from(imgBytes, "base64"); // Ensure imgBytes is not undefined
                fs.writeFileSync(imagePath, buffer);
            }
            return imagePath;
        }

        return "";
    }

    async getVideo(prompt: string) {
        let op = await this.ai.models.generateVideos({
            model: process.env.VIDEO_MODEL!,
            prompt,
        });
      
        while (!op.done) {
            await new Promise(r => setTimeout(r, 20000));
            op = await this.ai.operations.getVideosOperation({ operation: op });
        } 
      
        const fileRef = op.response!.generatedVideos![0].video!;
        const out = path.join(process.cwd(), "generated", `video.mp4`);
        await this.ai.files.download({ file: fileRef, downloadPath: out });
        return out;
    }

    async getMusic(prompt: string) {
        const outDir = path.join(process.cwd(), "generated");
        fs.mkdirSync(outDir, { recursive: true });
        const p = path.join(outDir, "lyria.raw.pcm"); // 48kHz stereo, 16-bit
        const fd = fs.openSync(p, "w");
      
        const session = await this.ai.live.music.connect({
            model: process.env.MUSIC_MODEL!,
            callbacks: {
                onmessage: (m) => {
                    const chunks = m.serverContent?.audioChunks ?? [];
                    for (const c of chunks) fs.writeSync(fd, Buffer.from(c.data!, "base64"));
                },
                onerror: (e) => console.error("lyria error:", e),
                onclose: () => fs.closeSync(fd),
            },
        });

        const weightedPrompts = await this.getWeightedPrompts(prompt);
      
        await session.setWeightedPrompts({
            weightedPrompts: JSON.parse(weightedPrompts),
        });
      
        await session.setMusicGenerationConfig({
            musicGenerationConfig: {
                temperature: 0.9,
            },
        });
      
        await session.play();
        await new Promise(r => setTimeout(r, 10000));
        await session.stop();
        await session.close();
      
        return p; // convert later: ffmpeg -f s16le -ar 48000 -ac 2 -i lyria.raw.pcm out.wav
    }
}

export default new Agent();