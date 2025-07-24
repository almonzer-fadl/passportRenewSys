import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type for passport photo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Only JPEG and PNG images are allowed for passport photos.' 
      }, { status: 400 });
    }

    // Simulate AI validation delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate AI validation results
    // In a real implementation, this would use a face detection library like face-api.js
    const validationResult = {
      passed: Math.random() > 0.2, // 80% pass rate for demo
      confidence: 0.75 + Math.random() * 0.2, // 75-95% confidence
      details: {
        faceDetected: Math.random() > 0.05, // 95% chance
        eyesOpen: Math.random() > 0.1, // 90% chance
        properLighting: Math.random() > 0.15, // 85% chance
        whiteBackground: Math.random() > 0.1, // 90% chance
        neutralExpression: Math.random() > 0.1, // 90% chance
        noGlasses: Math.random() > 0.2, // 80% chance
        properSize: Math.random() > 0.1, // 90% chance
        noShadows: Math.random() > 0.15, // 85% chance
        clearImage: Math.random() > 0.05, // 95% chance
        frontFacing: Math.random() > 0.1 // 90% chance
      },
      recommendations: []
    };

    // Generate recommendations if validation failed
    if (!validationResult.passed) {
      const recommendations = [
        'Ensure the photo has a white background',
        'Make sure your face is clearly visible and centered',
        'Keep your eyes open and looking directly at the camera',
        'Use proper lighting to avoid shadows',
        'Maintain a neutral expression',
        'Remove glasses if possible',
        'Ensure the image is high quality and clear'
      ];
      
      validationResult.recommendations = recommendations.slice(0, 3);
    }

    // Calculate overall score
    const detailScores = Object.values(validationResult.details);
    const passedDetails = detailScores.filter(score => score).length;
    const totalDetails = detailScores.length;
    validationResult.score = (passedDetails / totalDetails) * 100;

    return NextResponse.json({
      success: true,
      validation: validationResult
    });

  } catch (error) {
    console.error('Photo validation error:', error);
    return NextResponse.json({ error: 'Failed to validate photo' }, { status: 500 });
  }
} 