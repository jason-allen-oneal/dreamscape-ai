import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { VertexAI } from '@google-cloud/vertexai';
import { GoogleAuth } from 'google-auth-library';
import * as fs from "fs";
import path from "path";
import { sleep } from "@/lib/utils";


class Agent {
    genAI: GoogleGenAI;
    vertexAI: VertexAI;
    modelId: string;
    model: any;
    location: string;
    projectId: string | undefined;

    constructor() {
        this.projectId = process.env.PROJECT_ID;
        this.location = "us-central1";
        this.modelId = "";
        this.genAI = new GoogleGenAI({
            vertexai: true,
            project: this.projectId,
            location: this.location,
        });
        this.vertexAI = new VertexAI({ project: this.projectId, location: this.location });
        this.model = this.vertexAI.getGenerativeModel({ model: process.env.MUSIC_MODEL! });
    }

    async getDescription(dreams: string): Promise<string> {
        const response = await this.genAI.models.generateContent({
            model: process.env.GEN_MODEL as string,
            contents: dreams,
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

        return response.text || "";
    }

    setModel(modelId: string) {
        this.modelId = modelId;
    }

    async getVideo(prompt: string, img: string | null = null): Promise<string> {
        this.setModel(process.env.VIDEO_MODEL!);
        prompt = `A slow, surreal, dreamlike video (≈60 seconds) that captures the essence of the following dream world description. 
Use 5 long scenes of ~10–12 seconds each with gentle transitions and lingering shots; avoid rapid cuts. 
Favor slow camera motion (dolly, pan) and hold on key compositions before transitioning.
${prompt}
`

        let src: { prompt: string; durationSeconds: number; referenceImages?: { image: {bytesBase64Encoded: string; mimeType: string }}[] };

        if (img) {
            src = {
                prompt: prompt,
                referenceImages: [
                    {
                        image: {
                            "bytesBase64Encoded": img,
                            "mimeType": "MIME_TYPE"
                        }
                    }
                ],
                durationSeconds: 60
            };
        } else {
            src = {
                prompt: prompt,
                durationSeconds: 60
            };
        }

        let operation = await this.genAI.models.generateVideos({
            model: this.modelId,
            source: src,
        });

        while (!operation.done) {
            console.log('Waiting for completion');
            await sleep(10000);
            operation = await this.genAI.operations.get({operation: operation});
        }
      
        const videos = operation.response?.generatedVideos;
        if (!videos || videos.length === 0) {
            throw new Error('No videos generated');
        }

        const generatedDir = path.join(process.cwd(), "public", "generated");
        if (!fs.existsSync(generatedDir)) {
            fs.mkdirSync(generatedDir, { recursive: true });
        }

        const primaryVideo = videos[0];
        const timestamp = Date.now();
        const videoPath = path.join(generatedDir, `video-${timestamp}.mp4`);

        await this.genAI.files.download({
            file: primaryVideo,
            downloadPath: videoPath,
        });
        console.log('Downloaded video', videoPath);

        return videoPath;
    }

    async getImage(type: string, prompt: string, img: { data: string; mimeType: string; } | null = null): Promise<string> {
        this.setModel(process.env.IMAGE_MODEL!);

        if (type == 'background') {
            prompt = `A surreal, dreamlike, abstract background that captures the essence of the following dream world description: ${prompt}`;
        }

        if (type.includes("floating")){
            prompt = `A second, different surreal, dreamlike, abstract floating object that would exist in the following dream world: ${prompt}`;
        }
        const contents: any = img ? [
            { text: prompt },
            { inlineData: { data: img.data, mimeType: img.mimeType } }
        ] : [{ text: prompt }];

        const response: GenerateContentResponse = await this.genAI.models.generateContent({
            model: this.modelId!,
            contents: contents,
            config: {
                systemInstruction: [`
                    You are a visual synthesis model that generates high-quality,
                    surreal dreamscapes blending beauty, symbolism, and subconscious logic.
                    Produce dreamlike scenes that feel emotionally charged and visually coherent,
                    yet impossible in ordinary reality. Each image should balance realism and
                    imagination—recognizable forms distorted by metaphor.
                `],
            },
        });

        if (response.candidates && response.candidates.length > 0) {
            if (response.candidates[0].content && response.candidates[0].content.parts){
                for (const part of response.candidates[0].content!.parts) {
                    if (part.text) {
                        console.log(part.text);
                    } else if (part.inlineData) {
                        const imageData = part.inlineData.data as string;
                        const buffer = Buffer.from(imageData, "base64");
                        const generatedDir = path.join(process.cwd(), "public", "generated");
                        if (!fs.existsSync(generatedDir)) {
                            fs.mkdirSync(generatedDir, { recursive: true });
                        }
                        const imagePath = path.join(generatedDir, `${type}.png`);
                        fs.writeFileSync(imagePath, buffer);
                        console.log(`Image saved as ${imagePath}`);
                        return imagePath.replace(path.join(process.cwd(), "public"), "");
                    }
                }
            }
        }
        return "";
    }

    async getMusic(prompt: string) {
        const musicModel = process.env.MUSIC_MODEL;
        
        if (!musicModel) {
            throw new Error("MUSIC_MODEL env is not set");
        }
        if (!this.projectId) {
            throw new Error("PROJECT_ID env is not set");
        }

        prompt = `A surreal, dream-like, atmospheric, ambient, and ethereal music piece that captures the essence of the following dream world description: ${prompt}`

        const generatedDir = path.join(process.cwd(), "public", "generated");
        if (!fs.existsSync(generatedDir)) {
            fs.mkdirSync(generatedDir, { recursive: true });
        }

        try {
            // Get access token for authentication
            const auth = new GoogleAuth({
                scopes: ['https://www.googleapis.com/auth/cloud-platform']
            });
            const client = await auth.getClient();
            const accessToken = await client.getAccessToken();

            if (!accessToken.token) {
                throw new Error("Failed to get access token");
            }

            // Construct the API endpoint using class properties
            const endpoint = `https://${this.location}-aiplatform.googleapis.com/v1/projects/${this.projectId}/locations/${this.location}/publishers/google/models/${musicModel}:predict`;

            // Make the prediction request
            const requestBody = {
                instances: [{ prompt: prompt }],
                parameters: {
                    // Optional: add parameters like negative_prompt, seed, sample_count
                    // negative_prompt: "drums, electric guitar",
                    // seed: 12345,
                    // sample_count: 1 // Cannot be used with seed
                },
            };

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken.token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Lyria API error: ${response.status} ${response.statusText}\n${errorText}`);
            }

            const result = await response.json();
            console.log('Lyria response:', JSON.stringify(result, null, 2));

            // Extract audio content from the response
            if (!result.predictions || result.predictions.length === 0) {
                throw new Error("No predictions in response");
            }

            const prediction = result.predictions[0];
            // Lyria API returns audio content in bytesBase64Encoded field (standard),
            // but some versions may use audioContent field (fallback)
            const audioContent = prediction.bytesBase64Encoded || prediction.audioContent;
            
            if (!audioContent) {
                console.warn('Lyria response prediction:', JSON.stringify(prediction, null, 2));
                throw new Error("No audio content found in prediction");
            }

            // Save the audio file
            const buffer = Buffer.from(audioContent, "base64");
            const fileName = `music.wav`; // Lyria typically outputs WAV format
            const outputPath = path.join(generatedDir, fileName);

            fs.writeFileSync(outputPath, buffer);
            console.log(`Music saved to ${outputPath}`);
            return outputPath.replace(path.join(process.cwd(), "public"), "");
        } catch (error) {
            console.error('Error generating music with Lyria:', error);
            throw error;
        }
    }
}

export default new Agent();
