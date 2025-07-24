'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import AuthGuard from '@/components/auth/AuthGuard';

// Import step components
import ApplicationTypeStep from '../../components/application/ApplicationTypeStep';
import CurrentPassportStep from '../../components/application/CurrentPassportStep';
import PersonalInfoStep from '../../components/application/PersonalInfoStep';
import ContactInfoStep from '../../components/application/ContactInfoStep';
import EmergencyContactStep from '../../components/application/EmergencyContactStep';
import TravelInfoStep from '../../components/application/TravelInfoStep';
import DocumentUploadStep from '../../components/application/DocumentUploadStep';
import PaymentStep from '../../components/application/PaymentStep';
import ReviewStep from '../../components/application/ReviewStep';

export default function ApplyPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    applicationType: 'renewal',
    processingType: 'regular',
    currentPassport: {
      passportNumber: '',
      issueDate: '',
      expiryDate: '',
      issuingOffice: ''
    },
    personalInfo: {
      firstName: '',
      lastName: '',
      fatherName: '',
      grandfatherName: '',
      motherName: '',
      nationalId: '',
      dateOfBirth: '',
      placeOfBirth: '',
      gender: '',
      maritalStatus: '',
      profession: '',
      nationality: 'Sudanese'
    },
    contactInfo: {
      phoneNumber: '',
      email: '',
      address: {
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: ''
      }
    },
    emergencyContact: {
      name: '',
      relationship: '',
      phoneNumber: '',
      address: ''
    },
    travelInfo: {
      purposeOfTravel: '',
      intendedCountries: [],
      departureDate: '',
      returnDate: ''
    },
    documents: {
      passportPhoto: null,
      passportPhotoPreview: null,
      passportPhotoName: null,
      identityDocument: null,
      identityDocumentPreview: null,
      identityDocumentName: null,
      citizenshipDocument: null,
      citizenshipDocumentPreview: null,
      citizenshipDocumentName: null,
      supportingDocument: null,
      supportingDocumentPreview: null,
      supportingDocumentName: null,
      currentPassportCopy: null,
      currentPassportCopyPreview: null,
      currentPassportCopyName: null
    }
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Pre-fill email from user session
  useEffect(() => {
    if (user?.email) {
      setFormData(prev => ({
        ...prev,
        contactInfo: {
          ...prev.contactInfo,
          email: user.email
        }
      }));
    }
  }, [user?.email]);

  const getVisibleSteps = () => {
    const allSteps = [
      { number: 1, title: 'Application Type', component: ApplicationTypeStep },
      { number: 2, title: 'Current Passport', component: CurrentPassportStep, condition: () => ['renewal', 'replacement'].includes(formData.applicationType) },
      { number: 3, title: 'Personal Information', component: PersonalInfoStep },
      { number: 4, title: 'Contact Information', component: ContactInfoStep },
      { number: 5, title: 'Emergency Contact', component: EmergencyContactStep },
      { number: 6, title: 'Travel Information', component: TravelInfoStep },
      { number: 7, title: 'Document Upload', component: DocumentUploadStep },
      { number: 8, title: 'Review & Submit', component: ReviewStep }
    ];
    
    return allSteps.filter(step => !step.condition || step.condition());
  };

  const visibleSteps = getVisibleSteps();

  const updateFormData = (stepData) => {
    setFormData(prev => ({ ...prev, ...stepData }));
    setErrors({});
  };

  const validateCurrentStep = () => {
    // TEMPORARILY DISABLED FOR TESTING - Skip all validations
    setErrors({});
    return true;
    
    // Original validation code (commented out for now)
    /*
    const currentStepData = visibleSteps.find(step => step.number === currentStep);
    const newErrors = {};

    // Validate based on current step
    switch (currentStep) {
      case 1: // Application Type
        if (!formData.applicationType) {
          newErrors.applicationType = 'Please select an application type';
        }
        if (!formData.processingType) {
          newErrors.processingType = 'Please select processing speed';
        }
        break;
      
      case 2: // Current Passport (only for renewal/replacement)
        if (['renewal', 'replacement'].includes(formData.applicationType)) {
          if (!formData.currentPassport?.passportNumber) {
            newErrors.passportNumber = 'Current passport number is required';
          }
          if (!formData.currentPassport?.issueDate) {
            newErrors.issueDate = 'Issue date is required';
          }
          if (!formData.currentPassport?.expiryDate) {
            newErrors.expiryDate = 'Expiry date is required';
          }
          if (!formData.currentPassport?.issuingOffice) {
            newErrors.issuingOffice = 'Issuing office is required';
          }
          if (formData.applicationType === 'replacement' && !formData.currentPassport?.replacementReason) {
            newErrors.replacementReason = 'Replacement reason is required';
          }
        }
        break;
      
      case 3: // Personal Information
        if (!formData.personalInfo?.firstName) newErrors.firstName = 'First name is required';
        if (!formData.personalInfo?.lastName) newErrors.lastName = 'Last name is required';
        if (!formData.personalInfo?.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
        if (!formData.personalInfo?.nationalId) newErrors.nationalId = 'National ID is required';
        if (!formData.personalInfo?.gender) newErrors.gender = 'Gender is required';
        if (!formData.personalInfo?.placeOfBirth) newErrors.placeOfBirth = 'Place of birth is required';
        break;
      
      case 4: // Contact Information
        if (!formData.contactInfo?.phoneNumber) newErrors.phoneNumber = 'Phone number is required';
        if (!formData.contactInfo?.address?.street) newErrors.street = 'Address is required';
        if (!formData.contactInfo?.address?.city) newErrors.city = 'City is required';
        if (!formData.contactInfo?.address?.state) newErrors.state = 'State is required';
        if (!formData.contactInfo?.address?.country) newErrors.country = 'Country is required';
        break;
      
      case 5: // Emergency Contact
        if (!formData.emergencyContact?.name) newErrors.emergencyContactName = 'Emergency contact name is required';
        if (!formData.emergencyContact?.phoneNumber) newErrors.emergencyContactPhone = 'Emergency contact phone is required';
        if (!formData.emergencyContact?.relationship) newErrors.emergencyContactRelationship = 'Relationship is required';
        break;
      
      case 6: // Travel Information
        if (!formData.travelInfo?.purposeOfTravel) newErrors.travelPurpose = 'Travel purpose is required';
        if (!formData.travelInfo?.intendedCountries || formData.travelInfo?.intendedCountries.length === 0) {
          newErrors.travelCountries = 'At least one travel country is required';
        }
        break;
      
      case 7: // Document Upload
        if (!formData.documents?.passportPhoto) newErrors.passportPhoto = 'Passport photo is required';
        if (!formData.documents?.identityDocument) newErrors.identityDocument = 'Identity document is required';
        if (!formData.documents?.citizenshipDocument) newErrors.citizenshipDocument = 'Proof of citizenship is required';
        
        // Current passport copy required for renewal/replacement/correction
        if (['renewal', 'replacement', 'correction'].includes(formData.applicationType) && !formData.documents?.currentPassportCopy) {
          newErrors.currentPassportCopy = 'Current passport copy is required';
        }
        break;
      
      case 8: // Payment
        if (!formData.paymentCompleted) {
          newErrors.payment = 'Payment must be completed before proceeding';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
    */
  };

  const nextStep = () => {
    if (validateCurrentStep()) {
      const nextIndex = visibleSteps.findIndex(step => step.number > currentStep);
      if (nextIndex !== -1) {
        setCurrentStep(visibleSteps[nextIndex].number);
      }
    }
  };

  const prevStep = () => {
    const prevIndex = visibleSteps.slice().reverse().findIndex(step => step.number < currentStep);
    if (prevIndex !== -1) {
      const actualIndex = visibleSteps.length - 1 - prevIndex;
      setCurrentStep(visibleSteps[actualIndex].number);
    }
  };

  const submitApplication = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        router.push(`/dashboard?submitted=${result.applicationNumber}`);
      } else {
        const error = await response.json();
        setErrors({ submit: error.message || 'Failed to submit application' });
      }
    } catch (error) {
      setErrors({ submit: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // No authentication loading needed for demo

  const currentStepData = visibleSteps.find(step => step.number === currentStep);
  const StepComponent = currentStepData?.component;
  const stepIndex = visibleSteps.findIndex(step => step.number === currentStep);
  const isLastStep = stepIndex === visibleSteps.length - 1;
  const isFirstStep = stepIndex === 0;

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Passport Application</h1>
            <p className="text-gray-600 mt-1">Complete all steps to submit your application</p>
          </div>

          {/* Progress Steps */}
          <div className="px-6 py-4">
            <div className="flex items-center justify-between overflow-x-auto">
              {visibleSteps.map((step, index) => (
                <div key={step.number} className="flex items-center flex-shrink-0">
                  <div className={`
                    flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
                    ${currentStep >= step.number 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                    }
                  `}>
                    {step.number}
                  </div>
                  <div className="ml-2 text-sm min-w-0">
                    <p className={`font-medium truncate ${currentStep >= step.number ? 'text-blue-600' : 'text-gray-500'}`}>
                      {step.title}
                    </p>
                  </div>
                  {index < visibleSteps.length - 1 && (
                    <div className={`
                      h-0.5 w-8 md:w-12 lg:w-16 mx-2 md:mx-4 flex-shrink-0
                      ${currentStep > step.number ? 'bg-blue-600' : 'bg-gray-200'}
                    `} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Step {currentStep} of {visibleSteps.length}: {currentStepData?.title}
              </h2>
              <span className="text-sm text-gray-500">
                {Math.round((currentStep / visibleSteps.length) * 100)}% Complete
              </span>
            </div>
          </div>
          <div className="p-6">
            {StepComponent && (
              <StepComponent
                formData={formData}
                updateFormData={updateFormData}
                errors={errors}
                setErrors={setErrors}
              />
            )}

            {/* Step-specific error display */}
            {Object.keys(errors).length > 0 && errors.submit === undefined && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Please fix the following errors:</h3>
                    <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                      {Object.values(errors).map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between">
            <button
              type="button"
              onClick={prevStep}
              disabled={isFirstStep}
              className={`
                px-4 py-2 text-sm font-medium rounded-md
                ${isFirstStep 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }
              `}
            >
              Previous
            </button>

            {isLastStep ? (
              <button
                type="button"
                onClick={submitApplication}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                )}
                {loading ? 'Submitting...' : 'Submit Application'}
              </button>
            ) : (
              <button
                type="button"
                onClick={nextStep}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
              >
                Next
              </button>
            )}
          </div>
        </div>

        {/* Error Display */}
        {errors.submit && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="mt-1 text-sm text-red-700">{errors.submit}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </AuthGuard>
  );
} 