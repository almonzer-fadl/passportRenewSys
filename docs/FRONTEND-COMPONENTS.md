# Frontend Components Guide - Sudan Passport Renewal System

## 📋 Overview
This guide provides detailed information about all frontend components, their implementation, and usage patterns in the Sudan Passport Renewal System.

## 🏗️ Component Architecture

### Directory Structure
```
src/components/
├── auth/                 # Authentication components
├── application/          # Application form components  
├── camera/              # Camera and validation components
├── dashboard/           # Admin dashboard components
├── ui/                  # Basic UI components
├── shared/              # Shared utility components
└── layout/              # Layout and navigation components
```

---

## 🔐 Authentication Components

### LoginForm Component
**Location**: `src/components/auth/LoginForm.jsx`

**Purpose**: Handles user login for both citizens and administrators.

**Implementation**:
```javascript
'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card-sudan max-w-md mx-auto">
      <div className="card-body">
        <h2 className="card-title text-center text-sudan-gradient mb-6">
          🇸🇩 Sudan Passport Login
        </h2>
        
        {error && (
          <div className="alert alert-error mb-4">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="form-control-sudan">
            <label className="label">
              <span className="label-text">Email Address</span>
            </label>
            <input
              type="email"
              className={`input-sudan ${errors.email ? 'input-error' : ''}`}
              placeholder="Enter your email"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: 'Invalid email format'
                }
              })}
            />
            {errors.email && (
              <label className="label">
                <span className="label-text-alt text-error">
                  {errors.email.message}
                </span>
              </label>
            )}
          </div>

          <div className="form-control-sudan">
            <label className="label">
              <span className="label-text">Password</span>
            </label>
            <input
              type="password"
              className={`input-sudan ${errors.password ? 'input-error' : ''}`}
              placeholder="Enter your password"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters'
                }
              })}
            />
            {errors.password && (
              <label className="label">
                <span className="label-text-alt text-error">
                  {errors.password.message}
                </span>
              </label>
            )}
          </div>

          <div className="form-control mt-6">
            <button 
              type="submit" 
              className={`btn-sudan w-full ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </div>
        </form>

        <div className="divider">OR</div>

        <div className="text-center space-y-2">
          <button 
            className="btn btn-outline btn-block"
            onClick={() => router.push('/auth/register')}
          >
            Register New Account
          </button>
          <button 
            className="btn btn-link btn-sm"
            onClick={() => router.push('/auth/forgot-password')}
          >
            Forgot Password?
          </button>
        </div>
      </div>
    </div>
  );
}
```

### RegisterForm Component
**Location**: `src/components/auth/RegisterForm.jsx`

**Features**:
- Personal information collection
- Email verification
- Password strength validation
- Terms and conditions acceptance

---

## 📝 Application Form Components

### ApplicationWizard Component
**Location**: `src/components/application/ApplicationWizard.jsx`

**Purpose**: Main container for the multi-step application process.

**Implementation**:
```javascript
'use client';

import { useState, useContext } from 'react';
import { ApplicationContext } from '@/lib/context/ApplicationContext';
import StepIndicator from './StepIndicator';
import PersonalInfo from './PersonalInfo';
import PassportDetails from './PassportDetails';
import DocumentUpload from './DocumentUpload';
import FaceCapture from './FaceCapture';
import ReviewSubmit from './ReviewSubmit';
import PaymentForm from './PaymentForm';

const STEPS = [
  { id: 1, title: 'Personal Information', component: PersonalInfo },
  { id: 2, title: 'Passport Details', component: PassportDetails },
  { id: 3, title: 'Document Upload', component: DocumentUpload },
  { id: 4, title: 'Face Verification', component: FaceCapture },
  { id: 5, title: 'Review & Submit', component: ReviewSubmit },
  { id: 6, title: 'Payment', component: PaymentForm },
];

export default function ApplicationWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const { applicationData, updateApplicationData } = useContext(ApplicationContext);

  const nextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (stepNumber) => {
    setCurrentStep(stepNumber);
  };

  const CurrentStepComponent = STEPS[currentStep - 1].component;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-sudan-gradient mb-2">
          🇸🇩 Passport Renewal Application
        </h1>
        <p className="text-base-content/70">
          Complete your passport renewal application in {STEPS.length} simple steps
        </p>
      </div>

      {/* Step Indicator */}
      <StepIndicator 
        steps={STEPS}
        currentStep={currentStep}
        completedSteps={applicationData.completedSteps || []}
        onStepClick={goToStep}
      />

      {/* Step Content */}
      <div className="mt-8">
        <div className="card-sudan">
          <div className="card-body">
            <CurrentStepComponent
              data={applicationData}
              onNext={nextStep}
              onPrev={prevStep}
              onUpdate={updateApplicationData}
              isFirst={currentStep === 1}
              isLast={currentStep === STEPS.length}
            />
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-6">
        <div className="flex justify-between text-sm text-base-content/60">
          <span>Step {currentStep} of {STEPS.length}</span>
          <span>{Math.round((currentStep / STEPS.length) * 100)}% Complete</span>
        </div>
        <progress 
          className="progress progress-primary w-full mt-2" 
          value={currentStep} 
          max={STEPS.length}
        ></progress>
      </div>
    </div>
  );
}
```

### StepIndicator Component
**Purpose**: Visual progress indicator with clickable steps.

**Implementation**:
```javascript
export default function StepIndicator({ steps, currentStep, completedSteps, onStepClick }) {
  return (
    <div className="step-indicator">
      {steps.map((step, index) => {
        const isActive = step.id === currentStep;
        const isCompleted = completedSteps.includes(step.id);
        const isClickable = step.id <= currentStep || isCompleted;

        return (
          <div key={step.id} className="flex items-center">
            <div 
              className={`step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
              onClick={() => isClickable && onStepClick(step.id)}
            >
              <div className={`
                w-8 h-8 rounded-full border-2 flex items-center justify-center cursor-pointer
                ${isActive ? 'bg-primary border-primary text-white' : ''}
                ${isCompleted ? 'bg-success border-success text-white' : ''}
                ${!isActive && !isCompleted ? 'border-base-300 text-base-content/50' : ''}
              `}>
                {isCompleted ? '✓' : step.id}
              </div>
              <span className={`ml-2 ${isActive ? 'font-medium' : ''}`}>
                {step.title}
              </span>
            </div>
            
            {index < steps.length - 1 && (
              <div className={`
                h-0.5 w-12 mx-4
                ${step.id < currentStep || isCompleted ? 'bg-success' : 'bg-base-300'}
              `} />
            )}
          </div>
        );
      })}
    </div>
  );
}
```

### PersonalInfo Component
**Purpose**: Collect personal information in step 1.

**Fields**:
- First Name, Last Name
- Date of Birth, Place of Birth
- Gender, Nationality
- Email, Phone Number
- Current Address

---

## 📷 Camera Components

### CameraCapture Component
**Location**: `src/components/camera/CameraCapture.jsx`

**Purpose**: Handle camera access and image capture with real-time validation.

**Implementation**:
```javascript
'use client';

import { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import FaceDetection from './FaceDetection';
import ValidationOverlay from './ValidationOverlay';

export default function CameraCapture({ 
  type = 'face_photo', 
  onCapture, 
  onValidation,
  constraints = {} 
}) {
  const webcamRef = useRef(null);
  const [capturing, setCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [validation, setValidation] = useState(null);
  const [isValidating, setIsValidating] = useState(false);

  const videoConstraints = {
    width: 640,
    height: 480,
    facingMode: 'user',
    ...constraints
  };

  const capture = useCallback(async () => {
    setCapturing(true);
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedImage(imageSrc);
    
    // Start validation
    setIsValidating(true);
    try {
      const validationResult = await validateImage(imageSrc, type);
      setValidation(validationResult);
      onValidation?.(validationResult);
      
      if (validationResult.passed) {
        onCapture?.(imageSrc, validationResult);
      }
    } catch (error) {
      setValidation({
        passed: false,
        error: 'Validation failed. Please try again.',
        confidence: 0
      });
    } finally {
      setIsValidating(false);
      setCapturing(false);
    }
  }, [webcamRef, type, onCapture, onValidation]);

  const retake = () => {
    setCapturedImage(null);
    setValidation(null);
  };

  if (capturedImage) {
    return (
      <div className="camera-container">
        <div className="relative">
          <img 
            src={capturedImage} 
            alt="Captured" 
            className="w-full rounded-lg"
          />
          
          {isValidating && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
              <div className="loading loading-spinner loading-lg text-white"></div>
              <span className="ml-2 text-white">Validating...</span>
            </div>
          )}

          {validation && (
            <ValidationOverlay 
              validation={validation}
              type={type}
            />
          )}
        </div>

        <div className="mt-4 flex gap-4 justify-center">
          <button 
            className="btn btn-outline"
            onClick={retake}
          >
            Retake Photo
          </button>
          
          {validation?.passed && (
            <button 
              className="btn-sudan"
              onClick={() => onCapture(capturedImage, validation)}
            >
              Use This Photo
            </button>
          )}
        </div>

        {validation && !validation.passed && (
          <div className="mt-4 alert alert-warning">
            <span>⚠️ {validation.error || 'Photo validation failed'}</span>
            <div className="text-sm mt-2">
              {validation.details && (
                <ul className="list-disc list-inside">
                  {Object.entries(validation.details).map(([key, value]) => (
                    <li key={key} className={value ? 'text-success' : 'text-error'}>
                      {formatValidationMessage(key, value)}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="camera-container">
      <div className="relative camera-preview">
        <Webcam
          ref={webcamRef}
          videoConstraints={videoConstraints}
          screenshotFormat="image/jpeg"
          screenshotQuality={0.8}
          className="w-full rounded-lg"
        />
        
        <FaceDetection 
          webcamRef={webcamRef}
          type={type}
          onDetection={(detection) => {
            // Real-time feedback
            console.log('Face detected:', detection);
          }}
        />
      </div>

      <div className="mt-4 text-center">
        <button 
          className="btn-sudan"
          onClick={capture}
          disabled={capturing}
        >
          {capturing ? (
            <>
              <span className="loading loading-spinner"></span>
              Capturing...
            </>
          ) : (
            <>
              📷 Capture {type.replace('_', ' ').toUpperCase()}
            </>
          )}
        </button>
      </div>

      <div className="mt-4 text-sm text-base-content/70">
        <div className="alert alert-info">
          <span>💡 Photo Guidelines:</span>
          <ul className="list-disc list-inside mt-2">
            {type === 'face_photo' ? (
              <>
                <li>Look directly at the camera</li>
                <li>Ensure good lighting on your face</li>
                <li>Use a plain white background</li>
                <li>Keep your eyes open and visible</li>
                <li>Maintain a neutral expression</li>
              </>
            ) : (
              <>
                <li>Place document flat on a surface</li>
                <li>Ensure all text is clearly visible</li>
                <li>Avoid shadows and glare</li>
                <li>Fill the frame with the document</li>
                <li>Keep the document straight</li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

// Helper function for validation messages
function formatValidationMessage(key, value) {
  const messages = {
    faceDetected: value ? 'Face detected ✓' : 'No face detected ✗',
    eyesOpen: value ? 'Eyes are open ✓' : 'Please open your eyes ✗',
    properLighting: value ? 'Good lighting ✓' : 'Improve lighting ✗',
    whiteBackground: value ? 'White background ✓' : 'Use white background ✗',
    facePosition: value ? 'Face centered ✓' : 'Center your face ✗',
    documentDetected: value ? 'Document detected ✓' : 'No document detected ✗',
    textReadable: value ? 'Text is readable ✓' : 'Text not clear ✗',
    properOrientation: value ? 'Correct orientation ✓' : 'Rotate document ✗',
  };
  
  return messages[key] || `${key}: ${value ? '✓' : '✗'}`;
}

// Validation function
async function validateImage(imageSrc, type) {
  try {
    const response = await fetch('/api/applications/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type,
        imageData: imageSrc
      })
    });

    const result = await response.json();
    return result.data.validation;
  } catch (error) {
    throw new Error('Validation failed');
  }
}
```

### FaceDetection Component
**Purpose**: Real-time face detection using face-api.js.

### ValidationOverlay Component
**Purpose**: Display validation results over captured images.

---

## 🎛️ Dashboard Components

### ApplicationList Component
**Location**: `src/components/dashboard/ApplicationList.jsx`

**Purpose**: Display list of applications for admin review.

**Features**:
- Filterable by status
- Sortable by date, priority
- Pagination
- Bulk actions

### ApplicationDetail Component
**Purpose**: Detailed view of individual application.

**Features**:
- Document viewer
- Validation results
- Review actions
- Status history

---

## 🧩 UI Components

### Button Components
```javascript
// Primary Sudan Button
export function ButtonSudan({ children, loading, ...props }) {
  return (
    <button 
      className={`btn-sudan ${loading ? 'loading' : ''}`}
      disabled={loading}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
}

// Outline Sudan Button  
export function ButtonSudanOutline({ children, ...props }) {
  return (
    <button className="btn-sudan-outline" {...props}>
      {children}
    </button>
  );
}
```

### Input Components
```javascript
// Sudan Input Field
export function InputSudan({ label, error, ...props }) {
  return (
    <div className="form-control-sudan">
      {label && (
        <label className="label">
          <span className="label-text">{label}</span>
        </label>
      )}
      <input 
        className={`input-sudan ${error ? 'input-error' : ''}`}
        {...props}
      />
      {error && (
        <label className="label">
          <span className="label-text-alt text-error">{error}</span>
        </label>
      )}
    </div>
  );
}

// Sudan Select Field
export function SelectSudan({ label, options, error, ...props }) {
  return (
    <div className="form-control-sudan">
      {label && (
        <label className="label">
          <span className="label-text">{label}</span>
        </label>
      )}
      <select 
        className={`select-sudan ${error ? 'select-error' : ''}`}
        {...props}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <label className="label">
          <span className="label-text-alt text-error">{error}</span>
        </label>
      )}
    </div>
  );
}
```

### Card Components
```javascript
// Sudan Card
export function CardSudan({ title, children, actions }) {
  return (
    <div className="card-sudan">
      <div className="card-body">
        {title && <h2 className="card-title">{title}</h2>}
        {children}
        {actions && (
          <div className="card-actions justify-end mt-4">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## 🔄 State Management

### Application Context
**Location**: `src/lib/context/ApplicationContext.js`

```javascript
'use client';

import { createContext, useContext, useReducer } from 'react';

const ApplicationContext = createContext();

const initialState = {
  applicationId: null,
  personalInfo: {},
  passportDetails: {},
  documents: {},
  validation: {},
  payment: {},
  completedSteps: [],
  currentStep: 1,
  status: 'draft'
};

function applicationReducer(state, action) {
  switch (action.type) {
    case 'UPDATE_PERSONAL_INFO':
      return {
        ...state,
        personalInfo: { ...state.personalInfo, ...action.payload }
      };
    
    case 'UPDATE_PASSPORT_DETAILS':
      return {
        ...state,
        passportDetails: { ...state.passportDetails, ...action.payload }
      };
    
    case 'ADD_DOCUMENT':
      return {
        ...state,
        documents: { ...state.documents, [action.documentType]: action.payload }
      };
    
    case 'UPDATE_VALIDATION':
      return {
        ...state,
        validation: { ...state.validation, [action.validationType]: action.payload }
      };
    
    case 'COMPLETE_STEP':
      return {
        ...state,
        completedSteps: [...new Set([...state.completedSteps, action.step])]
      };
    
    case 'SET_CURRENT_STEP':
      return {
        ...state,
        currentStep: action.step
      };
    
    case 'RESET_APPLICATION':
      return initialState;
    
    default:
      return state;
  }
}

export function ApplicationProvider({ children }) {
  const [state, dispatch] = useReducer(applicationReducer, initialState);

  const updatePersonalInfo = (data) => {
    dispatch({ type: 'UPDATE_PERSONAL_INFO', payload: data });
  };

  const updatePassportDetails = (data) => {
    dispatch({ type: 'UPDATE_PASSPORT_DETAILS', payload: data });
  };

  const addDocument = (documentType, data) => {
    dispatch({ type: 'ADD_DOCUMENT', documentType, payload: data });
  };

  const updateValidation = (validationType, data) => {
    dispatch({ type: 'UPDATE_VALIDATION', validationType, payload: data });
  };

  const completeStep = (step) => {
    dispatch({ type: 'COMPLETE_STEP', step });
  };

  const setCurrentStep = (step) => {
    dispatch({ type: 'SET_CURRENT_STEP', step });
  };

  const resetApplication = () => {
    dispatch({ type: 'RESET_APPLICATION' });
  };

  const value = {
    ...state,
    updatePersonalInfo,
    updatePassportDetails,
    addDocument,
    updateValidation,
    completeStep,
    setCurrentStep,
    resetApplication
  };

  return (
    <ApplicationContext.Provider value={value}>
      {children}
    </ApplicationContext.Provider>
  );
}

export function useApplication() {
  const context = useContext(ApplicationContext);
  if (!context) {
    throw new Error('useApplication must be used within ApplicationProvider');
  }
  return context;
}

export { ApplicationContext };
```

---

## 🎨 Styling Guidelines

### CSS Custom Classes
All components use the custom Sudan-themed classes defined in `globals.css`:

```css
/* Primary button */
.btn-sudan {
  @apply btn bg-sudan-red hover:bg-sudan-red/90 text-white border-none shadow-lg;
}

/* Input field */
.input-sudan {
  @apply input input-bordered w-full focus:border-sudan-red focus:outline-none;
}

/* Card container */
.card-sudan {
  @apply card bg-base-100 shadow-lg border border-base-300 hover:shadow-xl transition-shadow;
}
```

### Color Palette
- **Primary**: `#D21F3C` (Sudan Red)
- **Secondary**: `#0047AB` (Sudan Blue) 
- **Success**: `#10b981` (Green)
- **Warning**: `#f59e0b` (Orange)
- **Error**: `#ef4444` (Red)

### Typography
- **Font**: Inter (Google Fonts)
- **Headings**: Font weights 600-700
- **Body**: Font weight 400
- **Small text**: Font weight 300

---

## 📱 Responsive Design

### Breakpoints
- **Mobile**: 640px and below
- **Tablet**: 641px - 1024px
- **Desktop**: 1025px and above

### Mobile-First Approach
All components are designed mobile-first using Tailwind CSS responsive utilities:

```javascript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Mobile: 1 column, Tablet: 2 columns, Desktop: 3 columns */}
</div>
```

---

## 🧪 Testing Components

### Unit Testing with React Testing Library
```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import LoginForm from '@/components/auth/LoginForm';

describe('LoginForm', () => {
  test('renders login form', () => {
    render(<LoginForm />);
    expect(screen.getByText('Sudan Passport Login')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
  });

  test('shows error for invalid email', async () => {
    render(<LoginForm />);
    const emailInput = screen.getByPlaceholderText('Enter your email');
    
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.blur(emailInput);
    
    expect(await screen.findByText('Invalid email format')).toBeInTheDocument();
  });
});
```

### Component Storybook
```javascript
// LoginForm.stories.js
export default {
  title: 'Auth/LoginForm',
  component: LoginForm,
  parameters: {
    layout: 'centered',
  },
};

export const Default = {};

export const WithError = {
  args: {
    initialError: 'Invalid credentials'
  }
};

export const Loading = {
  args: {
    isLoading: true
  }
};
```

---

## 🚀 Performance Optimization

### Code Splitting
```javascript
// Lazy load heavy components
import { lazy, Suspense } from 'react';

const CameraCapture = lazy(() => import('@/components/camera/CameraCapture'));

function DocumentUpload() {
  return (
    <Suspense fallback={<div className="loading">Loading camera...</div>}>
      <CameraCapture />
    </Suspense>
  );
}
```

### Image Optimization
```javascript
import Image from 'next/image';

function DocumentPreview({ src, alt }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={400}
      height={300}
      className="rounded-lg"
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,..."
    />
  );
}
```

---

## 📚 Component Library Usage

### Installation in Project
```bash
# Install component dependencies
npm install @heroicons/react lucide-react
npm install react-hook-form react-webcam
npm install face-api.js
```

### Component Import Example
```javascript
// Import UI components
import { ButtonSudan, InputSudan, CardSudan } from '@/components/ui';

// Import feature components
import LoginForm from '@/components/auth/LoginForm';
import ApplicationWizard from '@/components/application/ApplicationWizard';
import CameraCapture from '@/components/camera/CameraCapture';
```

---

*This component guide is updated with each new component addition.*

**Last Updated**: January 2024  
**Version**: 1.0.0 