// services/geminiService.ts

import { GoogleGenAI, Type, Modality, GenerateContentResponse } from '@google/genai';
import { SkinAnalysisResult } from '../types';

// Billing documentation link for API Key selection, as per guidelines.
const API_KEY_BILLING_LINK = 'https://ai.google.dev/gemini-api/docs/billing';

// FIX 1: Move AIStudio interface inside declare global to ensure its scope is tied to the global augmentation.
// This might prevent subtle duplicate identifier issues if AIStudio was considered global elsewhere.
declare global {
  /**
   * Define a named interface for aistudio properties to ensure consistent typing across all declarations.
   */
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    aistudio: AIStudio;
  }
}

let hasUserSelectedApiKeyAssumeSuccess = false; // Tracks if openSelectKey was called and assumed successful

/**
 * Helper to safely check if process.env.API_KEY is available.
 */
const isProcessEnvApiKeySet = () => typeof process !== 'undefined' && typeof process.env !== 'undefined' && process.env.API_KEY;

/**
 * Checks if an API key is selected and prompts the user to select one if not.
 * This should be called before attempting any Gemini API operations.
 * @returns A promise that resolves if an API key is available or successfully selected,
 *          or rejects if the user needs to select a key.
 */
export async function checkAndPromptApiKey(): Promise<void> {
  const isAistudioAvailable = typeof window.aistudio !== 'undefined' && typeof window.aistudio.hasSelectedApiKey !== 'undefined';
  
  if (!isAistudioAvailable) {
    if (!isProcessEnvApiKeySet()) {
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
    const isAistudioAvailable = typeof window.aistudio !== 'undefined' && typeof window.aistudio.openSelectKey !== 'undefined';
    if (isAistudioAvailable) {
      try {
        await window.aistudio.openSelectKey();
        hasUserSelectedApiKeyAssumeSuccess = true; // Assume success after re-prompting
      } catch (selectKeyError) {
        console.error('Error re-opening API key selection dialog:', selectKeyError);
        throw new Error('API_KEY_RESELECTION_FAILED');
      }
    } else if (!isProcessEnvApiKeySet()) { // If aistudio is not available, but key is missing after error
      throw new Error('API_KEY_REQUIRED_NO_AISTUDIO');
    }
    // Re-throw to be caught by component for user feedback and UI update.
    throw new Error('API_KEY_INVALID_OR_UNSELECTED');
  }
  // For other errors, just re-throw.
  throw error;
}

// JSON schema representation of the SkinAnalysisResult interface
const skinAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    overallScore: { type: Type.NUMBER, description: 'Overall skin health score from 0-100, where 100 is excellent.' },
    skinType: { type: Type.STRING, description: 'Skin type: oily, dry, combination, normal, or unknown.', enum: ['oily', 'dry', 'combination', 'normal', 'unknown'] },
    fitzpatrickScale: { type: Type.STRING, description: 'Fitzpatrick scale: I, II, III, IV, V, VI, or unknown.', enum: ['I', 'II', 'III', 'IV', 'V', 'VI', 'unknown'] },
    issues: {
      type: Type.OBJECT,
      description: 'Detailed analysis of various skin issues with score, severity, and optional areas.',
      properties: {
        acne: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER, description: 'Score for acne severity (0-100).' },
            severity: { type: Type.STRING, description: 'Severity description (e.g., "low", "medium", "high").' },
            areas: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Optional areas affected by acne.' }
          },
          required: ['score', 'severity']
        },
        wrinkles: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER, description: 'Score for wrinkles severity (0-100).' },
            severity: { type: Type.STRING, description: 'Severity description.' },
            areas: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Optional areas affected by wrinkles.' }
          },
          required: ['score', 'severity']
        },
        hyperpigmentation: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER, description: 'Score for hyperpigmentation severity (0-100).' },
            severity: { type: Type.STRING, description: 'Severity description.' },
            areas: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Optional areas affected by hyperpigmentation.' }
          },
          required: ['score', 'severity']
        },
        pores: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER, description: 'Score for pore visibility (0-100).' },
            severity: { type: Type.STRING, description: 'Severity description.' },
            areas: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Optional areas with visible pores.' }
          },
          required: ['score', 'severity']
        },
        redness: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER, description: 'Score for redness severity (0-100).' },
            severity: { type: Type.STRING, description: 'Severity description.' },
            areas: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Optional areas with redness.' }
          },
          required: ['score', 'severity']
        },
        texture: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER, description: 'Score for skin texture (0-100, higher is smoother).' },
            severity: { type: Type.STRING, description: 'Severity description.' },
            areas: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Optional areas for texture assessment.' }
          },
          required: ['score', 'severity']
        },
        hydration: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER, description: 'Score for skin hydration (0-100, higher is more hydrated).' },
            severity: { type: Type.STRING, description: 'Severity description.' },
            areas: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Optional areas for hydration assessment.' }
          },
          required: ['score', 'severity']
        },
        oiliness: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER, description: 'Score for skin oiliness (0-100, higher is more oily).' },
            severity: { type: Type.STRING, description: 'Severity description.' },
            areas: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Optional areas for oiliness assessment.' }
          },
          required: ['score', 'severity']
        },
        darkCircles: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER, description: 'Score for dark circles (0-100).' },
            severity: { type: Type.STRING, description: 'Severity description.' },
            areas: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Optional areas for dark circles assessment.' }
          },
          required: ['score', 'severity']
        },
        symmetry: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER, description: 'Score for facial symmetry (0-100, higher is more symmetrical).' },
            description: { type: Type.STRING, description: 'A brief description of facial symmetry.' }
          },
          required: ['score', 'description']
        }
      },
      required: ['acne', 'wrinkles', 'hyperpigmentation', 'pores', 'redness', 'texture', 'hydration', 'oiliness', 'darkCircles', 'symmetry']
    },
    recommendations: {
      type: Type.OBJECT,
      description: 'Personalized recommendations for skin care routines and lifestyle tips.',
      properties: {
        morningRoutine: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Steps for a morning skincare routine.' },
        eveningRoutine: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Steps for an evening skincare routine.' },
        weeklyTreatments: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Suggestions for weekly treatments.' },
        lifestyleTips: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'General lifestyle advice for skin health.' }
      },
      required: ['morningRoutine', 'eveningRoutine', 'weeklyTreatments', 'lifestyleTips']
    },
    explainability: { type: Type.STRING, description: 'A concise explanation of the overall findings and reasoning.' }
  },
  required: ['overallScore', 'skinType', 'fitzpatrickScale', 'issues', 'recommendations', 'explainability']
};


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
  if (!isProcessEnvApiKeySet()) {
    throw new Error('API_KEY is not defined. Please select an API key to proceed.');
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! }); // Use non-null assertion as checked above

  const prompt = `Analyze the facial skin in this image for the following attributes: overall skin health score (0-100, where 100 is excellent), skin type (oily, dry, combination, normal), Fitzpatrick scale (I-VI), presence and severity of acne, wrinkles, hyperpigmentation, pores, redness, texture (smoothness), hydration, oiliness, dark circles, and facial symmetry. Provide specific areas if possible. 

Respond strictly in JSON format according to the following JSON schema:
${JSON.stringify(skinAnalysisSchema, null, 2)}`;

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
      // Removed responseMimeType and responseSchema as they are not supported by gemini-2.5-flash-image
      // as per guidelines for general image generation and editing tasks.
      // The prompt itself instructs the model to return JSON.
    });

    let jsonStr = response.text.trim();
    if (!jsonStr) {
      throw new Error('AI response was empty. Cannot parse JSON.');
    }

    // Remove Markdown code block fences if present
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.substring('```json'.length);
    }
    if (jsonStr.endsWith('```')) {
      jsonStr = jsonStr.substring(0, jsonStr.length - '```'.length);
    }
    jsonStr = jsonStr.trim(); // Trim again after removing fences
    
    if (!jsonStr) { // Check again if it became empty after stripping fences
      throw new Error('AI response contained only markdown fences or was empty after cleaning. Cannot parse JSON.');
    }

    let parsedResult: SkinAnalysisResult;
    try {
      parsedResult = JSON.parse(jsonStr) as SkinAnalysisResult;
    } catch (parseError: any) {
      console.error('JSON parsing failed:', parseError);
      throw new Error(`AI response is not valid JSON. Details: ${parseError.message}. Raw response: ${jsonStr}`);
    }

    // Validate essential properties to prevent TypeError later
    if (
      !parsedResult ||
      typeof parsedResult.overallScore !== 'number' ||
      !['oily', 'dry', 'combination', 'normal', 'unknown'].includes(parsedResult.skinType) ||
      !['I', 'II', 'III', 'IV', 'V', 'VI', 'unknown'].includes(parsedResult.fitzpatrickScale) ||
      typeof parsedResult.issues !== 'object' || parsedResult.issues === null ||
      typeof parsedResult.recommendations !== 'object' || parsedResult.recommendations === null ||
      !parsedResult.explainability
    ) {
      throw new Error(
        'AI response is missing critical data or is malformed after parsing. ' +
        'Ensure all top-level properties (overallScore, skinType, fitzpatrickScale, ' +
        'issues, recommendations, explainability) are present and correctly typed.'
      );
    }

    // FIX 2: Adjust validation logic for issues, specifically for 'symmetry' which has 'description' instead of 'severity'.
    const requiredIssueKeys: (keyof SkinAnalysisResult['issues'])[] = [
      'acne', 'wrinkles', 'hyperpigmentation', 'pores', 'redness', 'texture', 
      'hydration', 'oiliness', 'darkCircles', 'symmetry'
    ];
    for (const key of requiredIssueKeys) {
      const issue = parsedResult.issues[key];
      if (!issue || typeof issue.score !== 'number') {
        throw new Error(`AI response issue "${key}" is missing score or is malformed.`);
      }

      if (key === 'symmetry') {
        // For symmetry, check description property
        const symmetryIssue = issue as SkinAnalysisResult['issues']['symmetry'];
        if (typeof symmetryIssue.description !== 'string') {
          throw new Error(`AI response symmetry issue is missing description or is malformed.`);
        }
      } else {
        // For all other issues, check severity property
        const genericIssue = issue as { severity: string };
        if (typeof genericIssue.severity !== 'string') {
          throw new Error(`AI response issue "${key}" is missing severity or is malformed.`);
        }
      }
    }

    const requiredRecommendationKeys: (keyof SkinAnalysisResult['recommendations'])[] = [
      'morningRoutine', 'eveningRoutine', 'weeklyTreatments', 'lifestyleTips'
    ];
    for (const key of requiredRecommendationKeys) {
      const routine = parsedResult.recommendations[key];
      if (!Array.isArray(routine) || !routine.every(item => typeof item === 'string')) {
        throw new Error(`AI response recommendation "${key}" is missing or malformed (expected array of strings).`);
      }
    }


    return parsedResult;
  } catch (error: any) {
    console.error('Error analyzing skin image with Gemini:', error);
    // Allow handleApiKeyError to process this specific error and re-prompt if needed.
    await handleApiKeyError(error); // This will re-throw if it's an API key issue or other error
    throw error; // Re-throw the original error or the error from handleApiKeyError
  }
}

export { API_KEY_BILLING_LINK };