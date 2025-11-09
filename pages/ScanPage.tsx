// pages/ScanPage.tsx

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import { analyzeSkinImage, checkAndPromptApiKey, handleApiKeyError, API_KEY_BILLING_LINK } from '../services/geminiService';
import { fileToBase64 } from '../utils/imageUtils';
import { SkinAnalysisResult } from '../types';

const ScanPage: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null); // Corrected type to HTMLCanvasElement
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false); // For image analysis API call
  const [isInitializing, setIsInitializing] = useState(true); // For initial page setup (API key, camera)
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null); // base64 image data
  const [imageMimeType, setImageMimeType] = useState<string | null>(null); // mime type of the captured image

  // New states for explicit control over UI feedback
  const [apiKeyRequired, setApiKeyRequired] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [cameraUnavailable, setCameraUnavailable] = useState(false);

  // Initialize camera and check API key
  useEffect(() => {
    const init = async () => {
      setIsInitializing(true);
      setError(null);
      setApiKeyRequired(false);
      setCameraEnabled(false);
      setCameraUnavailable(false);

      try {
        // 1. Check and prompt for API key first
        await checkAndPromptApiKey();
        setApiKeyRequired(false); // Key is available
      } catch (keyError: any) {
        if (keyError.message === 'API_KEY_REQUIRED_NO_AISTUDIO' || keyError.message === 'API_KEY_SELECTION_FAILED') {
          console.log('API Key selection required or failed. Not proceeding with camera setup.');
          setApiKeyRequired(true);
          setIsInitializing(false);
          setError("An API key is required to use this application. Please select one to proceed.");
          return;
        }
        console.error('Unexpected error during API key check:', keyError);
        setError(`Failed to check API key: ${keyError.message}. Please try again.`);
        setIsInitializing(false);
        return;
      }

      // 2. Attempt to get camera stream
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user', // Request front camera
            width: { ideal: 1080 }, // Optimize for higher resolution
            height: { ideal: 1080 },
          },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play();
          setStream(mediaStream);
          setCameraEnabled(true);
        }
      } catch (err: any) {
        console.error('Camera access error:', err);
        setCameraUnavailable(true);
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setError('Camera access denied. Please grant permission in your browser settings or upload an image.');
        } else if (err.name === 'NotFoundError') {
          setError('No camera found on your device. Please upload an image manually.');
        } else {
          setError(`Failed to access camera: ${err.message}. Please upload an image manually.`);
        }
      } finally {
        setIsInitializing(false);
      }
    };

    init();

    // Cleanup: Stop camera stream when component unmounts
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]); // Re-run effect only if stream changes

  const handleSelectApiKey = async () => {
    setError(null);
    setLoading(true); // Indicate that we are trying to select a key
    try {
      await window.aistudio.openSelectKey();
      setApiKeyRequired(false);
      // After successful key selection, re-initialize to try camera again (if it failed)
      // or simply proceed if camera was already enabled.
      // A full page reload might also be an option depending on app complexity.
      // For now, let's just assume the key is now available and the app can proceed.
      // If camera was unavailable, we'll keep showing upload option.
      if (stream) {
        setCameraEnabled(true);
        setCameraUnavailable(false);
      } else {
        // If camera was initially unavailable, we don't re-init camera, just remove the API key prompt.
        // User will be prompted to upload or retry camera if they choose.
      }
    } catch (keyError: any) {
      console.error('Error selecting API key:', keyError);
      setError(`Failed to select API key: ${keyError.message}. Please try again.`);
      setApiKeyRequired(true); // Keep the prompt visible
    } finally {
      setLoading(false);
    }
  };

  const captureImage = useCallback(() => {
    setError(null);
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      // Set canvas dimensions to match video to avoid distortion
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/jpeg', 0.9); // Use JPEG for smaller size
        setCapturedImage(imageData);
        setImageMimeType('image/jpeg');

        // Stop camera stream after capturing
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
          setStream(null);
          setCameraEnabled(false);
        }
      }
    }
  }, [stream]);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = event.target.files?.[0];
    if (file) {
      setLoading(true);
      try {
        const base64 = await fileToBase64(file);
        setCapturedImage(`data:${file.type};base64,${base64}`); // Include data URL prefix for img src
        setImageMimeType(file.type);

        // Stop camera stream if it was active
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
          setStream(null);
          setCameraEnabled(false);
        }
      } catch (fileError: any) {
        console.error('Error converting file to base64:', fileError);
        setError(`Failed to process image: ${fileError.message}`);
      } finally {
        setLoading(false);
      }
    }
  }, [stream]);

  const handleAnalyze = async () => {
    if (!capturedImage || !imageMimeType) {
      setError('No image to analyze. Please take a photo or upload one.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const base64Data = capturedImage.split(',')[1]; // Remove prefix for API
      const result: SkinAnalysisResult = await analyzeSkinImage(base64Data, imageMimeType);
      navigate('/results', { state: { analysisResult: result, image: capturedImage } });
    } catch (err: any) {
      console.error('Analysis failed:', err);
      // handleApiKeyError attempts to re-prompt for key if specific API error occurs
      try {
        await handleApiKeyError(err);
      } catch (handledError: any) {
        // If handleApiKeyError re-throws (e.g., key invalid or user cancelled), update UI
        if (handledError.message === 'API_KEY_INVALID_OR_UNSELECTED' || handledError.message === 'API_KEY_RESELECTION_FAILED') {
          setApiKeyRequired(true);
          setError("The API key is invalid or selection was cancelled. Please select a valid API key.");
        } else if (handledError.message === 'API_KEY_REQUIRED_NO_AISTUDIO') {
          setApiKeyRequired(true);
          setError("An API key is required and cannot be automatically configured. Please select one.");
        } else {
          setError(`Analysis failed: ${handledError.message || 'Unknown error'}.`);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const retakePhoto = useCallback(async () => {
    setError(null);
    setCapturedImage(null);
    setImageMimeType(null);
    setLoading(true); // Indicate activity while re-enabling camera

    // Attempt to re-enable camera
    try {
      if (!stream) { // Only request new stream if one isn't already active
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1080 }, height: { ideal: 1080 } },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play();
          setStream(mediaStream);
          setCameraEnabled(true);
          setCameraUnavailable(false); // Camera is now available
        }
      } else { // If stream was merely paused or stopped, restart it
        stream.getTracks().forEach(track => {
          track.enabled = true;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          }
        });
        setCameraEnabled(true);
        setCameraUnavailable(false);
      }
    } catch (err: any) {
      console.error('Failed to re-enable camera:', err);
      setCameraUnavailable(true); // Camera still unavailable
      setError('Failed to re-enable camera. Please upload an image manually.');
    } finally {
      setLoading(false);
    }
  }, [stream]);

  const triggerFileUpload = () => {
    setError(null);
    fileInputRef.current?.click();
  };

  // UI rendering based on states
  return (
    <div className="flex flex-col flex-grow p-4 pt-0 pb-20 bg-black overflow-y-auto items-center justify-center relative">
      <h2 className="text-2xl font-bold text-white mb-6">Scan Your Skin</h2>

      {/* General Error Display */}
      {error && (
        <div role="alert" className="bg-red-900 bg-opacity-30 border border-red-700 text-red-300 px-4 py-3 rounded-lg relative mb-4 w-full text-center">
          {error}
        </div>
      )}

      {/* Initialization Loader */}
      {isInitializing && (
        <div className="flex flex-col items-center justify-center p-8 bg-gray-900 rounded-xl shadow-lg w-full max-w-sm">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent mb-4"></div>
          <p className="text-lg text-gray-300 font-semibold">Initializing app...</p>
          <p className="text-sm text-gray-500 mt-2 text-center">Checking API key and camera access.</p>
        </div>
      )}

      {/* API Key Required Prompt */}
      {!isInitializing && apiKeyRequired && (
        <div className="flex flex-col items-center justify-center p-8 bg-gray-900 rounded-xl shadow-lg w-full max-w-sm text-center">
          <p className="text-xl font-semibold text-red-400 mb-4">API Key Required</p>
          <p className="text-gray-300 mb-4">
            Please select your API key to proceed. This helps us ensure secure access to the AI models.
          </p>
          <p className="text-sm text-gray-500 mb-4">
            To learn more about API keys and billing, visit the{' '}
            <a href={API_KEY_BILLING_LINK} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">
              Gemini API billing documentation
            </a>.
          </p>
          <Button onClick={handleSelectApiKey} className="w-full mt-4" variant="primary">
            Select API Key
          </Button>
        </div>
      )}

      {/* Loading (for analysis) */}
      {!isInitializing && !apiKeyRequired && loading && (
        <div className="flex flex-col items-center justify-center p-8 bg-gray-900 rounded-xl shadow-lg w-full max-w-sm">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent mb-4"></div>
          <p className="text-lg text-gray-300 font-semibold">Analyzing skin...</p>
          <p className="text-sm text-gray-500 mt-2 text-center">This may take a few moments. Please do not close the app.</p>
        </div>
      )}

      {/* Camera/Image Capture UI */}
      {!isInitializing && !apiKeyRequired && !loading && !capturedImage && (
        <>
          {(cameraEnabled || cameraUnavailable) && ( // Show video or placeholder if camera was enabled/unavailable
            <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-gray-800 flex items-center justify-center mb-6 shadow-lg">
              {cameraEnabled ? (
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover transform scaleX(-1)" // Flip horizontally for selfie view
                  autoPlay
                  playsInline
                  muted
                />
              ) : (
                <div className="text-gray-500 text-center p-4">
                  <p className="text-lg mb-2">Camera unavailable</p>
                  <p className="text-sm">Please use the upload option below.</p>
                </div>
              )}
              <canvas ref={canvasRef} className="hidden" /> {/* Hidden canvas for image processing */}
            </div>
          )}


          <div className="flex flex-col gap-4 w-full max-w-xs">
            {cameraEnabled && ( // Only show take photo if camera is actually enabled
              <Button onClick={captureImage} className="w-full" variant="primary">
                Take Photo
              </Button>
            )}
            <Button onClick={triggerFileUpload} className="w-full" variant="secondary">
              Upload Image
            </Button>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </>
      )}

      {/* Captured Image Preview and Action Buttons */}
      {!isInitializing && !apiKeyRequired && !loading && capturedImage && (
        <>
          <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-6 shadow-lg bg-gray-800 flex items-center justify-center">
            <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col gap-4 w-full max-w-xs">
            <Button onClick={handleAnalyze} className="w-full" variant="primary">
              Analyze Skin
            </Button>
            <Button onClick={retakePhoto} className="w-full" variant="secondary">
              Retake Photo / Upload New
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default ScanPage;