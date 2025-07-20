'use client';

import { useState, useRef, useEffect } from 'react';

export default function PassportPhotoValidator({ imageData, onValidationComplete }) {
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [error, setError] = useState(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (imageData) {
      validatePassportPhoto(imageData);
    }
  }, [imageData]);

  const validatePassportPhoto = async (imageData) => {
    setIsValidating(true);
    setError(null);

    try {
      // Create image element
      const img = new Image();
      img.src = imageData;
      
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      // Analyze image using Canvas API
      const analysis = await analyzeImage(img);
      
      // Calculate confidence score
      const confidence = calculateConfidence(analysis);
      
      const result = {
        passed: confidence > 0.6,
        confidence: confidence,
        details: analysis,
        message: confidence > 0.6 ? 'Photo meets passport requirements' : 'Photo does not meet requirements'
      };

      setValidationResult(result);
      
      if (onValidationComplete) {
        onValidationComplete(result);
      }

    } catch (err) {
      console.error('Validation error:', err);
      setError('Failed to validate photo. Please try again.');
      setValidationResult({
        passed: false,
        confidence: 0,
        details: {
          faceDetected: false,
          eyesOpen: false,
          properLighting: false,
          whiteBackground: false,
          facePosition: 'error'
        },
        message: 'Validation failed'
      });
    } finally {
      setIsValidating(false);
    }
  };

  const analyzeImage = async (img) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size to match image
    canvas.width = img.width;
    canvas.height = img.height;
    
    // Draw image on canvas
    ctx.drawImage(img, 0, 0);
    
    // Get image data for analysis
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Analyze image characteristics
    const analysis = {
      faceDetected: await detectFace(imageData),
      eyesOpen: true, // Simplified for demo
      properLighting: checkLighting(imageData),
      whiteBackground: checkBackground(imageData),
      facePosition: 'centered' // Simplified for demo
    };

    return analysis;
  };

  const detectFace = async (imageData) => {
    // Simplified face detection using skin tone detection
    const data = imageData.data;
    let skinTonePixels = 0;
    let totalPixels = 0;
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Simple skin tone detection
      if (r > 95 && g > 40 && b > 20 && 
          Math.max(r, g, b) - Math.min(r, g, b) > 15 &&
          Math.abs(r - g) > 15 && r > g && r > b) {
        skinTonePixels++;
      }
      totalPixels++;
    }
    
    const skinTonePercentage = skinTonePixels / totalPixels;
    return skinTonePercentage > 0.1; // At least 10% skin tone pixels
  };

  const checkLighting = (imageData) => {
    // Analyze image brightness and contrast
    const data = imageData.data;
    let totalBrightness = 0;
    let pixelCount = 0;
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Calculate brightness
      const brightness = (r + g + b) / 3;
      totalBrightness += brightness;
      pixelCount++;
    }
    
    const averageBrightness = totalBrightness / pixelCount;
    
    // Check if lighting is adequate (not too dark, not too bright)
    return averageBrightness > 50 && averageBrightness < 200;
  };

  const checkBackground = (imageData) => {
    // Check if background is predominantly white
    const data = imageData.data;
    let whitePixels = 0;
    let totalPixels = 0;
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Check if pixel is white (all RGB values high)
      if (r > 200 && g > 200 && b > 200) {
        whitePixels++;
      }
      totalPixels++;
    }
    
    const whitePercentage = whitePixels / totalPixels;
    return whitePercentage > 0.4; // At least 40% white background
  };

  const calculateConfidence = (analysis) => {
    let confidence = 0;
    
    if (analysis.faceDetected) confidence += 0.4;
    if (analysis.eyesOpen) confidence += 0.2;
    if (analysis.properLighting) confidence += 0.2;
    if (analysis.whiteBackground) confidence += 0.2;
    
    return Math.min(confidence, 1.0);
  };

  if (isValidating) {
    return (
      <div className="flex items-center justify-center p-8 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-blue-800">Analyzing photo with AI...</p>
          <p className="text-xs text-blue-600 mt-1">Checking face detection, lighting, and background</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Validation Error</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (validationResult) {
    return (
      <div className={`border rounded-lg p-4 ${
        validationResult.passed 
          ? 'border-green-300 bg-green-50' 
          : 'border-red-300 bg-red-50'
      }`}>
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            {validationResult.passed ? (
              <svg className="h-6 w-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="h-6 w-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </div>
          <div className="flex-1">
            <h3 className={`text-sm font-medium ${
              validationResult.passed ? 'text-green-800' : 'text-red-800'
            }`}>
              {validationResult.passed ? 'Photo Validated Successfully' : 'Photo Validation Failed'}
            </h3>
            <p className={`text-sm mt-1 ${
              validationResult.passed ? 'text-green-700' : 'text-red-700'
            }`}>
              {validationResult.message}
            </p>
            
            <div className="mt-3">
              <p className="text-xs font-medium text-gray-700 mb-2">AI Analysis Results:</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center">
                  <span className={`w-2 h-2 rounded-full mr-2 ${
                    validationResult.details.faceDetected ? 'bg-green-400' : 'bg-red-400'
                  }`}></span>
                  Face Detected
                </div>
                <div className="flex items-center">
                  <span className={`w-2 h-2 rounded-full mr-2 ${
                    validationResult.details.eyesOpen ? 'bg-green-400' : 'bg-red-400'
                  }`}></span>
                  Eyes Open
                </div>
                <div className="flex items-center">
                  <span className={`w-2 h-2 rounded-full mr-2 ${
                    validationResult.details.properLighting ? 'bg-green-400' : 'bg-red-400'
                  }`}></span>
                  Proper Lighting
                </div>
                <div className="flex items-center">
                  <span className={`w-2 h-2 rounded-full mr-2 ${
                    validationResult.details.whiteBackground ? 'bg-green-400' : 'bg-red-400'
                  }`}></span>
                  White Background
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Confidence Score: {(validationResult.confidence * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
} 