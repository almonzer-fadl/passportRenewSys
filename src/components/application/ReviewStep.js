export default function ReviewStep({ formData, updateFormData, errors }) {
  const formatDate = (dateString) => {
    if (!dateString) return 'Not provided';
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  const formatPhoneNumber = (phone) => {
    if (!phone) return 'Not provided';
    return phone;
  };

  const ReviewSection = ({ title, children, icon }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
      <div className="flex items-center mb-3">
        <span className="text-lg mr-2">{icon}</span>
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      </div>
      <div className="space-y-2">
        {children}
      </div>
    </div>
  );

  const ReviewField = ({ label, value }) => (
    <div className="flex justify-between py-1">
      <span className="text-sm font-medium text-gray-600">{label}:</span>
      <span className="text-sm text-gray-900">{value || 'Not provided'}</span>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Review Your Application</h2>
        <p className="text-gray-600">
          Please review all information carefully before submitting. You can go back to edit any section if needed.
        </p>
      </div>

      {/* Application Type */}
      <ReviewSection title="Application Type" icon="📋">
        <ReviewField label="Type" value={formData.applicationType === 'renewal' ? 'Passport Renewal' : 
                                              formData.applicationType === 'new' ? 'New Passport' :
                                              formData.applicationType === 'replacement' ? 'Passport Replacement' :
                                              'Passport Correction'} />
        <ReviewField label="Processing Speed" value={formData.processingType === 'regular' ? 'Regular (14-21 days)' : 'Express (7-10 days)'} />
      </ReviewSection>

      {/* Current Passport (if applicable) */}
      {['renewal', 'replacement'].includes(formData.applicationType) && (
        <ReviewSection title="Current Passport Information" icon="📄">
          <ReviewField label="Passport Number" value={formData.currentPassport.passportNumber} />
          <ReviewField label="Issue Date" value={formatDate(formData.currentPassport.issueDate)} />
          <ReviewField label="Expiry Date" value={formatDate(formData.currentPassport.expiryDate)} />
          <ReviewField label="Issuing Office" value={formData.currentPassport.issuingOffice} />
          {formData.applicationType === 'replacement' && formData.currentPassport.replacementReason && (
            <ReviewField label="Replacement Reason" value={
              formData.currentPassport.replacementReason === 'lost' ? 'Lost Passport' :
              formData.currentPassport.replacementReason === 'stolen' ? 'Stolen Passport' :
              formData.currentPassport.replacementReason === 'damaged' ? 'Damaged Passport' :
              'Passport Pages Full'
            } />
          )}
        </ReviewSection>
      )}

      {/* Personal Information */}
      <ReviewSection title="Personal Information" icon="👤">
        <ReviewField label="Full Name" value={`${formData.personalInfo.firstName} ${formData.personalInfo.lastName}`} />
        <ReviewField label="Father's Name" value={formData.personalInfo.fatherName} />
        <ReviewField label="Grandfather's Name" value={formData.personalInfo.grandfatherName} />
        <ReviewField label="Mother's Name" value={formData.personalInfo.motherName} />
        <ReviewField label="National ID" value={formData.personalInfo.nationalId} />
        <ReviewField label="Date of Birth" value={formatDate(formData.personalInfo.dateOfBirth)} />
        <ReviewField label="Place of Birth" value={formData.personalInfo.placeOfBirth} />
        <ReviewField label="Gender" value={formData.personalInfo.gender === 'male' ? 'Male' : 'Female'} />
        <ReviewField label="Marital Status" value={
          formData.personalInfo.maritalStatus === 'single' ? 'Single' :
          formData.personalInfo.maritalStatus === 'married' ? 'Married' :
          formData.personalInfo.maritalStatus === 'divorced' ? 'Divorced' :
          'Widowed'
        } />
        <ReviewField label="Profession" value={formData.personalInfo.profession} />
        <ReviewField label="Nationality" value={formData.personalInfo.nationality} />
      </ReviewSection>

      {/* Contact Information */}
      <ReviewSection title="Contact Information" icon="📞">
        <ReviewField label="Phone Number" value={formatPhoneNumber(formData.contactInfo.phoneNumber)} />
        <ReviewField label="Email" value={formData.contactInfo.email} />
        <ReviewField label="Street Address" value={formData.contactInfo.address.street} />
        <ReviewField label="City" value={formData.contactInfo.address.city} />
        <ReviewField label="State" value={formData.contactInfo.address.state} />
        <ReviewField label="Postal Code" value={formData.contactInfo.address.postalCode} />
        <ReviewField label="Country" value={formData.contactInfo.address.country} />
        {formData.contactInfo.alternativePhone && (
          <ReviewField label="Alternative Phone" value={formatPhoneNumber(formData.contactInfo.alternativePhone)} />
        )}
        {formData.contactInfo.alternativeEmail && (
          <ReviewField label="Alternative Email" value={formData.contactInfo.alternativeEmail} />
        )}
        <ReviewField label="Preferred Communication" value={
          formData.contactInfo.preferredCommunication === 'email' ? 'Email notifications' :
          formData.contactInfo.preferredCommunication === 'sms' ? 'SMS text messages' :
          'Both email and SMS'
        } />
      </ReviewSection>

      {/* Emergency Contact */}
      <ReviewSection title="Emergency Contact" icon="🚨">
        <ReviewField label="Name" value={formData.emergencyContact.name} />
        <ReviewField label="Relationship" value={formData.emergencyContact.relationship} />
        <ReviewField label="Phone Number" value={formatPhoneNumber(formData.emergencyContact.phoneNumber)} />
        <ReviewField label="Address" value={formData.emergencyContact.address} />
        {formData.emergencyContact.secondaryName && (
          <>
            <div className="border-t border-gray-200 pt-2 mt-2">
              <p className="text-sm font-medium text-gray-700 mb-1">Secondary Emergency Contact</p>
            </div>
            <ReviewField label="Name" value={formData.emergencyContact.secondaryName} />
            <ReviewField label="Relationship" value={formData.emergencyContact.secondaryRelationship} />
            <ReviewField label="Phone Number" value={formatPhoneNumber(formData.emergencyContact.secondaryPhone)} />
            <ReviewField label="Address" value={formData.emergencyContact.secondaryAddress} />
          </>
        )}
      </ReviewSection>

      {/* Travel Information */}
      <ReviewSection title="Travel Information" icon="✈️">
        <ReviewField label="Purpose of Travel" value={
          formData.travelInfo.purposeOfTravel === 'tourism' ? 'Tourism/Leisure' :
          formData.travelInfo.purposeOfTravel === 'business' ? 'Business' :
          formData.travelInfo.purposeOfTravel === 'education' ? 'Education/Study' :
          formData.travelInfo.purposeOfTravel === 'medical' ? 'Medical Treatment' :
          formData.travelInfo.purposeOfTravel === 'family' ? 'Family Visit' :
          formData.travelInfo.purposeOfTravel === 'pilgrimage' ? 'Religious Pilgrimage' :
          'Other'
        } />
        {formData.travelInfo.intendedCountries.length > 0 && (
          <div className="py-1">
            <span className="text-sm font-medium text-gray-600">Intended Countries:</span>
            <div className="mt-1 flex flex-wrap gap-1">
              {formData.travelInfo.intendedCountries.map((country, index) => (
                <span key={index} className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                  {country}
                </span>
              ))}
            </div>
          </div>
        )}
        <ReviewField label="Departure Date" value={formatDate(formData.travelInfo.departureDate)} />
        <ReviewField label="Return Date" value={formatDate(formData.travelInfo.returnDate)} />
        {formData.travelInfo.additionalNotes && (
          <div className="py-1">
            <span className="text-sm font-medium text-gray-600">Additional Notes:</span>
            <p className="text-sm text-gray-900 mt-1">{formData.travelInfo.additionalNotes}</p>
          </div>
        )}
      </ReviewSection>

      {/* Terms and Conditions */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Terms and Conditions</h3>
        <div className="space-y-3">
          <div className="flex items-start">
            <input
              type="checkbox"
              id="accuracy"
              checked={formData.termsAccepted?.accuracy || false}
              onChange={(e) => updateFormData({
                termsAccepted: {
                  ...formData.termsAccepted,
                  accuracy: e.target.checked
                }
              })}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
            />
            <label htmlFor="accuracy" className="ml-3 text-sm text-gray-700">
              I certify that all information provided in this application is true and accurate to the best of my knowledge.
              I understand that providing false information may result in the rejection of my application or cancellation of my passport.
            </label>
          </div>
          
          <div className="flex items-start">
            <input
              type="checkbox"
              id="terms"
              checked={formData.termsAccepted?.terms || false}
              onChange={(e) => updateFormData({
                termsAccepted: {
                  ...formData.termsAccepted,
                  terms: e.target.checked
                }
              })}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
            />
            <label htmlFor="terms" className="ml-3 text-sm text-gray-700">
              I agree to the terms and conditions of passport issuance and understand my responsibilities as a passport holder.
              I acknowledge that fees paid are non-refundable once the application is submitted.
            </label>
          </div>
          
          <div className="flex items-start">
            <input
              type="checkbox"
              id="biometrics"
              checked={formData.termsAccepted?.biometrics || false}
              onChange={(e) => updateFormData({
                termsAccepted: {
                  ...formData.termsAccepted,
                  biometrics: e.target.checked
                }
              })}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
            />
            <label htmlFor="biometrics" className="ml-3 text-sm text-gray-700">
              I understand that I must appear in person for biometric data collection (fingerprints and photograph)
              at the designated passport office within 30 days of application approval.
            </label>
          </div>
        </div>
        
        {errors.termsAccepted && (
          <p className="mt-2 text-sm text-red-600">{errors.termsAccepted}</p>
        )}
      </div>

      {/* Next Steps Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">What Happens Next?</h3>
            <div className="mt-2 text-sm text-blue-700">
              <ol className="list-decimal list-inside space-y-1">
                <li>Your application will be submitted and assigned a tracking number</li>
                <li>You'll receive an email confirmation with your application number</li>
                <li>Upload required documents through your dashboard</li>
                <li>Wait for application review (typically 2-3 business days)</li>
                <li>Complete payment once your application is approved</li>
                <li>Schedule biometric appointment at passport office</li>
                <li>Collect your new passport when ready</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* Fee Information */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Fee Information</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p className="mb-2">Estimated fees for your application:</p>
              <ul className="space-y-1">
                <li>• {formData.applicationType === 'new' ? 'New passport' : formData.applicationType === 'renewal' ? 'Passport renewal' : 'Passport replacement'}: $150 USD</li>
                {formData.processingType === 'express' && (
                  <li>• Express processing: $75 USD</li>
                )}
                <li>• Service charge: $25 USD</li>
                <li className="font-medium border-t border-yellow-300 pt-1">
                  Total: ${150 + (formData.processingType === 'express' ? 75 : 0) + 25} USD
                </li>
              </ul>
              <p className="mt-2 text-xs">Payment will be processed after your application is reviewed and approved.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 