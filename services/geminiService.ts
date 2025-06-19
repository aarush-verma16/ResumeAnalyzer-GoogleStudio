
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { AnalysisResult } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // This will be caught by the App component and shown to the user.
  // In a real app, you might have more sophisticated error handling or UI for this.
  console.error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY || "NO_KEY_FALLBACK" }); // Fallback to avoid crash if not set, error handled in App

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

export const analyzeResumeAndJob = async (
  resumeFile: File,
  jobDescription: string
): Promise<AnalysisResult> => {
  if (!API_KEY) {
    throw new Error("Gemini API Key is not configured. Please set the API_KEY environment variable.");
  }

  const fileReader = new FileReader();

  const base64Pdf = await new Promise<string>((resolve, reject) => {
    fileReader.onload = () => {
      resolve(arrayBufferToBase64(fileReader.result as ArrayBuffer));
    };
    fileReader.onerror = (error) => reject(error);
    fileReader.readAsArrayBuffer(resumeFile);
  });

  const resumePart = {
    inlineData: {
      mimeType: resumeFile.type, // 'application/pdf'
      data: base64Pdf,
    },
  };

  const jobDescriptionPart = {
    text: jobDescription,
  };

  const prompt = `
    You are an expert HR professional and resume analyzer.
    I have provided you with a resume (as a PDF document) and a job description.
    Your task is to:
    1. Thoroughly analyze the content of the resume.
    2. Compare the skills, experience, and qualifications mentioned in the resume against the requirements and keywords in the job description.
    3. Provide a matching score from 0 to 100, where 100 indicates a perfect match and 0 indicates no match. The score should be an integer.
    4. Provide a brief analysis (2-3 sentences) explaining the score.
    5. Highlight 2-4 key strengths of the resume in relation to this specific job description.
    6. Suggest 2-3 specific, actionable areas where the resume could be improved to better align with the job description.

    Please return your response ONLY in the following JSON format. Do not include any other text or explanations outside of this JSON structure:
    {
      "score": <integer_between_0_and_100>,
      "analysis": "<string_explanation_of_score>",
      "strengths": ["<string_strength_1>", "<string_strength_2>", ...],
      "improvements": ["<string_improvement_1>", "<string_improvement_2>", ...]
    }
  `;

  const contents = { parts: [resumePart, jobDescriptionPart, {text: prompt}] };
  
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-04-17',
      contents: contents,
      config: {
        responseMimeType: "application/json",
        temperature: 0.3, // Lower temperature for more factual, less creative output
      }
    });

    let jsonStr = response.text.trim();
    // Remove potential markdown fences (```json ... ```)
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }
    
    // Validate the JSON structure
    const parsedData = JSON.parse(jsonStr) as AnalysisResult;
    if (typeof parsedData.score !== 'number' || 
        typeof parsedData.analysis !== 'string' ||
        !Array.isArray(parsedData.strengths) ||
        !Array.isArray(parsedData.improvements)) {
      throw new Error("Invalid JSON structure received from API.");
    }
    return parsedData;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to analyze resume: ${error.message}`);
    }
    throw new Error("Failed to analyze resume due to an unknown error.");
  }
};
