// services/geminiService.ts

import { GoogleGenAI, Type, Modality, GenerateContentResponse } from '@google/genai';
import { SkinAnalysisResult } from '../types';

// Billing documentation link for API Key selection, as per guidelines.
const API_KEY_BILLING_LINK = 'https://ai.google.dev/gemini-api/docs/billing';

// Augment the Window interface to include aistudio directly within declare global.
// This helps ensure the definition is cohesive and avoids potential naming conflicts
// with an external or implicitly declared 'AIStudio' if one were to exist,
// which can cause "subsequent property declarations must have the same type" errors.
declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

let hasUserSelectedApiKeyAssumeSuccess = false; // Tracks if openSelectKey was called and assumed successful

/**
 * Checks if an API key is selected and prompts the user to select one if not.
 * This should be called before attempting any Gemini API operations.
 * @returns A promise that resolves if an API key is available or successfully selected,
 *          or rejects if the user needs to select a key.
 */
export async function checkAndPromptApiKey(): Promise<void> {
  // If aistudio is not present, we rely solely on process.env.API_KEY.
  // If process.env.API_KEY is not set either, it's an unrecoverable error for API usage.
  if (typeof window.aistudio === 'undefined' || typeof window.aistudio.hasSelectedApiKey === 'undefined') {
    if (!process.env.API_KEY) {
      console.error('API_KEY is not defined and aistudio is unavailable. Please ensure API_KEY is set or select it via UI if available.');
      throw new Error('API_KEY_REQUIRED_NO_AISTUDIO');
    }
    hasUserSelectedApiKeyAssumeSuccess = true; // Assume success if API_KEY is present and aistudio is not needed.
    return;
  }

  // If aistudio is available, check for selected key.
  const hasKey = await window.aistudio.hasSelectedApiKey();

  // If no key is selected or our assumption of success is false (e.g., after an error),
  // prompt the user to select a key.
  if (!hasKey || !hasUserSelectedApiKeyAssumeSuccess) {
    console.warn('No API key selected or previous selection failed. Opening selection dialog...');
    try {
      await window.aistudio.openSelectKey();
      hasUserSelectedApiKeyAssumeSuccess = true; // Assume success after calling openSelectKey
    } catch (error) {
      console.error('Error opening API key selection dialog:', error);
      throw new Error('API_KEY_SELECTION_FAILED');
    }
  }
}

/**
 * Handles API errors, specifically looking for "Requested entity was not found."
 * to re-prompt the user for API key selection.
 * @param error The error object.
 * @returns A promise that rejects, or resolves if handling was successful.
 */
export async function handleApiKeyError(error: any): Promise<void> {
  if (error.message && error.message.includes('Requested entity was not found.')) {
    console.error('API key might be invalid or not selected. Attempting to re-prompt for key selection.');
    hasUserSelectedApiKeyAssumeSuccess = false; // Reset state to force re-selection
    if (typeof window.aistudio !== 'undefined' && typeof window.aistudio.openSelectKey !== 'undefined') {
      try {
        await window.aistudio.openSelectKey();
        hasUserSelectedApiKeyAssumeSuccess = true; // Assume success after re-prompting
      } catch (selectKeyError) {
        console.error('Error re-opening API key selection dialog:', selectKeyError);
        throw new Error('API_KEY_RESELECTION_FAILED');
      }
    } else if (!process.env.API_KEY) { // If aistudio is not available, but key is missing after error
      throw new Error('API_KEY_REQUIRED_NO_AISTUDIO');
    }
    // Re-throw to be caught by component for user feedback and UI update.
    throw new Error('API_KEY_INVALID_OR_UNSELECTED');
  }
  // For other errors, just re-throw.
  throw error;
}

/**
 * Analyzes a base64 encoded image for skin health using the Gemini API.
 * @param base64Image The base64 encoded string of the image (without the 'data:image/jpeg;base64,' prefix).
 * @param mimeType The MIME type of the image (e.g., 'image/jpeg', 'image/png').
 * @returns A promise that resolves to the SkinAnalysisResult.
 */
export async function analyzeSkinImage(
  base64Image: string,
  mimeType: string,
): Promise<SkinAnalysisResult> {
  // process.env.API_KEY is where the selected API key will be injected.
  // We assume checkAndPromptApiKey has been called earlier to ensure a key is available or prompted.
  if (!process.env.API_KEY) {
    throw new Error('API_KEY is not defined. Please select an API key to proceed.');
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `Analyze the facial skin in this image for the following attributes: overall skin health score (0-100, where 100 is excellent), skin type (oily, dry, combination, normal), Fitzpatrick scale (I-VI), presence and severity of acne, wrinkles, hyperpigmentation, pores, redness, texture (smoothness), hydration, oiliness, dark circles, and facial symmetry. Provide specific areas if possible. Also, generate concise morning, evening, and weekly routines, product/ingredient suggestions, and lifestyle tips based on the analysis. Provide a brief explanation of the key findings. Respond strictly in JSON format according to the provided schema.`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', // General image generation and editing tasks
      contents: {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Image,
            },
          },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallScore: {
              type: Type.NUMBER,
              description: 'Overall skin health score from 0 to 100, where 100 is excellent.',
            },
            skinType: {
              type: Type.STRING,
              enum: ['oily', 'dry', 'combination', 'normal', 'unknown'],
              description: 'Identified skin type.',
            },
            fitzpatrickScale: {
              type: Type.STRING,
              enum: ['I', 'II', 'III', 'IV', 'V', 'VI', 'unknown'],
              description: 'Fitzpatrick scale for skin phototype.',
            },
            issues: {
              type: Type.OBJECT,
              properties: {
                acne: {
                  type: Type.OBJECT,
                  properties: {
                    score: { type: Type.NUMBER },
                    severity: { type: Type.STRING },
                    areas: { type: Type.ARRAY, items: { type: Type.STRING } },
                  },
                },
                wrinkles: {
                  type: Type.OBJECT,
                  properties: {
                    score: { type: Type.NUMBER },
                    severity: { type: Type.STRING },
                    areas: { type: Type.ARRAY, items: { type: Type.STRING } },
                  },
                },
                hyperpigmentation: {
                  type: Type.OBJECT,
                  properties: {
                    score: { type: Type.NUMBER },
                    severity: { type: Type.STRING },
                    areas: { type: Type.ARRAY, items: { type: Type.STRING } },
                  },
                },
                pores: {
                  type: Type.OBJECT,
                  properties: {
                    score: { type: Type.NUMBER },
                    severity: { type: Type.STRING },
                    areas: { type: Type.ARRAY, items: { type: Type.STRING } },
                  },
                },
                redness: {
                  type: Type.OBJECT,
                  properties: {
                    score: { type: Type.NUMBER },
                    severity: { type: Type.STRING },
                    areas: { type: Type.ARRAY, items: { type: Type.STRING } },
                  },
                },
                texture: {
                  type: Type.OBJECT,
                  properties: {
                    score: { type: Type.NUMBER },
                    severity: { type: Type.STRING },
                    areas: { type: Type.ARRAY, items: { type: Type.STRING } },
                  },
                },
                hydration: {
                  type: Type.OBJECT,
                  properties: {
                    score: { type: Type.NUMBER },
                    severity: { type: Type.STRING },
                    areas: { type: Type.ARRAY, items: { type: Type.STRING } },
                  },
                },
                oiliness: {
                  type: Type.OBJECT,
                  properties: {
                    score: { type: Type.NUMBER },
                    severity: { type: Type.STRING },
                    areas: { type: Type.ARRAY, items: { type: Type.STRING } },
                  },
                },
                darkCircles: {
                  type: Type.OBJECT,
                  properties: {
                    score: { type: Type.NUMBER },
                    severity: { type: Type.STRING },
                    areas: { type: Type.ARRAY, items: { type: Type.STRING } },
                  },
                },
                symmetry: {
                  type: Type.OBJECT,
                  properties: {
                    score: { type: Type.NUMBER },
                    description: { type: Type.STRING },
                  },
                },
              },
            },
            recommendations: {
              type: Type.OBJECT,
              properties: {
                morningRoutine: { type: Type.ARRAY, items: { type: Type.STRING } },
                eveningRoutine: { type: Type.ARRAY, items: { type: Type.STRING } },
                weeklyTreatments: { type: Type.ARRAY, items: { type: Type.STRING } },
                lifestyleTips: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
            },
            explainability: {
              type: Type.STRING,
              description: 'A brief explanation of the key findings from the analysis.',
            },
          },
          required: [
            'overallScore',
            'skinType',
            'fitzpatrickScale',
            'issues',
            'recommendations',
            'explainability',
          ],
        },
      },
    });

    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr) as SkinAnalysisResult;
  } catch (error: any) {
    console.error('Error analyzing skin image with Gemini:', error);
    // Allow handleApiKeyError to process this specific error and re-prompt if needed.
    await handleApiKeyError(error); // This will re-throw if it's an API key issue or other error
    throw new Error('Unhandled error in analyzeSkinImage'); // Should not be reached if handleApiKeyError always re-throws
  }
}

export { API_KEY_BILLING_LINK };