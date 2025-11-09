// types.ts

import React from 'react';

/**
 * Interface for the structured JSON response from the Gemini API for skin analysis.
 */
export interface SkinAnalysisResult {
  overallScore: number; // 0-100
  skinType: 'oily' | 'dry' | 'combination' | 'normal' | 'unknown';
  fitzpatrickScale: 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI' | 'unknown';
  issues: {
    acne: { score: number; severity: string; areas?: string[] };
    wrinkles: { score: number; severity: string; areas?: string[] };
    hyperpigmentation: { score: number; severity: string; areas?: string[] };
    pores: { score: number; severity: string; areas?: string[] };
    redness: { score: number; severity: string; areas?: string[] };
    texture: { score: number; severity: string; areas?: string[] };
    hydration: { score: number; severity: string; areas?: string[] };
    oiliness: { score: number; severity: string; areas?: string[] };
    darkCircles: { score: number; severity: string; areas?: string[] };
    symmetry: { score: number; description: string };
  };
  recommendations: {
    morningRoutine: string[];
    eveningRoutine: string[];
    weeklyTreatments: string[];
    lifestyleTips: string[];
  };
  explainability: string; // A concise explanation of findings
}

/**
 * Interface for navigation bar items.
 */
export interface NavItem {
  name: string;
  icon: React.ReactNode;
  path: string;
}

/**
 * Props for the ProgressBar component.
 */
export interface ProgressBarProps {
  progress: number; // Current progress percentage (0-100)
  size?: number; // Size of the SVG circle
  strokeWidth?: number; // Width of the progress stroke
  label?: string; // Optional label to display in the center
  color?: string; // Tailwind color class for the progress stroke (e.g., 'text-emerald-400')
}

/**
 * Props for a generic button component.
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
}
