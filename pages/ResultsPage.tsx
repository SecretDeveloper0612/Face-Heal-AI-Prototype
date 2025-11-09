// pages/ResultsPage.tsx

import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SkinAnalysisResult } from '../types';
import ProgressBar from '../components/ui/ProgressBar';
import Button from '../components/ui/Button';

// Helper component for displaying an individual issue score
interface IssueCardProps {
  name: string;
  score: number;
  severity: string;
  areas?: string[];
}

const IssueCard: React.FC<IssueCardProps> = ({ name, score, severity, areas }) => (
  <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg shadow-sm">
    <div className="flex flex-col">
      <span className="text-gray-200 font-semibold">{name}</span>
      <span className="text-sm text-gray-400">Severity: {severity}</span>
      {areas && areas.length > 0 && (
        <span className="text-xs text-gray-500">Areas: {areas.join(', ')}</span>
      )}
    </div>
    <span className="text-emerald-400 font-bold">{score}%</span>
  </div>
);

// Helper function to get a description for skin type
const getSkinTypeDescription = (type: string): string => {
  switch (type.toLowerCase()) {
    case 'oily':
      return 'Characterized by excess sebum production, leading to a shiny complexion and proneness to breakouts.';
    case 'dry':
      return 'Lacks moisture, often feels tight, can appear flaky or dull.';
    case 'combination':
      return 'Oily in the T-zone (forehead, nose, chin) and dry or normal on the cheeks and other areas.';
    case 'normal':
      return 'Well-balanced, clear, not too oily or too dry with minimal imperfections.';
    default:
      return 'Skin type could not be determined.';
  }
};

// Helper function to get a description for Fitzpatrick scale
const getFitzpatrickDescription = (scale: string): string => {
  switch (scale) {
    case 'I':
      return 'Very fair skin, always burns, never tans.';
    case 'II':
      return 'Fair skin, usually burns, sometimes tans.';
    case 'III':
      return 'Medium skin, sometimes burns, usually tans.';
    case 'IV':
      return 'Olive skin, rarely burns, always tans.';
    case 'V':
      return 'Dark brown skin, very rarely burns, tans easily.';
    case 'VI':
      return 'Deeply pigmented dark brown/black skin, never burns, tans easily.';
    default:
      return 'Fitzpatrick scale could not be determined.';
  }
};


const ResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { analysisResult, image } = location.state as { analysisResult: SkinAnalysisResult; image: string } || {};

  const [activeTab, setActiveTab] = useState<'issues' | 'recommendations' | 'explanation'>('issues');

  if (!analysisResult) {
    return (
      <div className="flex flex-col items-center justify-center flex-grow p-4 text-center bg-black">
        <p className="text-gray-300 text-lg">No analysis results found.</p>
        <Button onClick={() => navigate('/scan')} className="mt-4">
          Perform New Scan
        </Button>
      </div>
    );
  }

  const issues = Object.entries(analysisResult.issues).filter(
    ([key, value]) => value && typeof value.score === 'number'
  ) as [string, { score: number; severity: string; areas?: string[]; description?: string }][];

  return (
    <div className="flex flex-col flex-grow p-4 pt-0 pb-20 bg-black overflow-y-auto">
      <h2 className="text-2xl font-bold text-white mb-6">Your Skin Analysis</h2>

      {image && (
        <div className="w-full h-48 rounded-xl overflow-hidden mb-6 shadow-lg bg-gray-900 flex items-center justify-center">
          <img src={image} alt="Scanned Face" className="w-full h-full object-cover" />
        </div>
      )}

      <div className="bg-gray-900 rounded-xl p-6 mb-8 shadow-lg flex flex-col items-center text-center">
        <h3 className="text-xl font-semibold mb-4 text-gray-200">Overall Skin Health</h3>
        <ProgressBar progress={analysisResult.overallScore} size={150} strokeWidth={12} label="" />
        <p className="mt-4 text-lg text-emerald-400 font-bold">
          {analysisResult.overallScore}% Excellent
        </p>
        <p className="text-sm text-gray-400 mt-2">
          Skin Type: {analysisResult.skinType.charAt(0).toUpperCase() + analysisResult.skinType.slice(1)}
        </p>
        <p className="text-xs text-gray-500 mt-1 px-4">
          {getSkinTypeDescription(analysisResult.skinType)}
        </p>
        <p className="text-sm text-gray-400 mt-2">
          Fitzpatrick Scale: {analysisResult.fitzpatrickScale}
        </p>
        <p className="text-xs text-gray-500 mt-1 px-4">
          {getFitzpatrickDescription(analysisResult.fitzpatrickScale)}
        </p>
      </div>

      <div className="flex justify-center bg-gray-900 rounded-xl p-1 mb-6 shadow-md">
        <Button
          variant={activeTab === 'issues' ? 'primary' : 'ghost'}
          onClick={() => setActiveTab('issues')}
          className="flex-1 text-center"
          size="sm"
        >
          Issues
        </Button>
        <Button
          variant={activeTab === 'recommendations' ? 'primary' : 'ghost'}
          onClick={() => setActiveTab('recommendations')}
          className="flex-1 text-center"
          size="sm"
        >
          Recommendations
        </Button>
        <Button
          variant={activeTab === 'explanation' ? 'primary' : 'ghost'}
          onClick={() => setActiveTab('explanation')}
          className="flex-1 text-center"
          size="sm"
        >
          Summary
        </Button>
      </div>

      {activeTab === 'issues' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-200">Identified Issues</h3>
          {issues.length > 0 ? (
            issues.map(([key, issue]) => (
              <IssueCard
                key={key}
                name={key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                score={issue.score}
                severity={issue.severity}
                areas={issue.areas}
              />
            ))
          ) : (
            <p className="text-gray-400 text-center">No specific issues identified. Keep up the great work!</p>
          )}
        </div>
      )}

      {activeTab === 'recommendations' && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-200">Personalized Recommendations</h3>
          <div className="bg-gray-800 rounded-xl p-4 shadow-md">
            <h4 className="font-bold text-gray-200 mb-2">Morning Routine</h4>
            <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
              {analysisResult.recommendations.morningRoutine.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ul>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 shadow-md">
            <h4 className="font-bold text-gray-200 mb-2">Evening Routine</h4>
            <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
              {analysisResult.recommendations.eveningRoutine.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ul>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 shadow-md">
            <h4 className="font-bold text-gray-200 mb-2">Weekly Treatments</h4>
            <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
              {analysisResult.recommendations.weeklyTreatments.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ul>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 shadow-md">
            <h4 className="font-bold text-gray-200 mb-2">Lifestyle Tips</h4>
            <ul className="list-disc list-inside text-gray-300 text-sm space-y-1">
              {analysisResult.recommendations.lifestyleTips.map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {activeTab === 'explanation' && (
        <div className="bg-gray-800 rounded-xl p-4 shadow-md">
          <h3 className="text-lg font-semibold text-gray-200 mb-2">Analysis Summary</h3>
          <p className="text-gray-300 leading-relaxed text-sm">
            {analysisResult.explainability}
          </p>
        </div>
      )}

      <Button onClick={() => navigate('/')} className="mt-8 w-full max-w-xs mx-auto" variant="secondary">
        Back to Home
      </Button>
    </div>
  );
};

export default ResultsPage;