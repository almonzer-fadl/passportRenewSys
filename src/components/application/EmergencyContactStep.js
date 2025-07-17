export default function EmergencyContactStep({ formData, updateFormData, errors }) {
  const handleChange = (field, value) => {
    updateFormData({
      emergencyContact: {
        ...formData.emergencyContact,
        [field]: value
      }
    });
  };

  const formatPhoneNumber = (value) => {
    // Remove all non-digits and non-plus
    let cleaned = value.replace(/[^\d+]/g, '');
    
    // Ensure it starts with +
    if (!cleaned.startsWith('+')) {
      cleaned = '+' + cleaned.replace(/^\+*/, '');
    }
    
    // Limit to reasonable length (+XXX-XXXXXXXXXXXX = 16 chars max)
    if (cleaned.length > 16) {
      cleaned = cleaned.substring(0, 16);
    }
    
    return cleaned;
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    handleChange('phoneNumber', formatted);
  };

  const validatePhoneNumber = (phone) => {
    // International phone format: + followed by country code and number
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
  };

  const relationshipOptions = [
    'Father', 'Mother', 'Spouse', 'Brother', 'Sister', 
    'Son', 'Daughter', 'Uncle', 'Aunt', 'Cousin',
    'Friend', 'Guardian', 'Other'
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Emergency Contact</h2>
        <p className="text-gray-600">
          Provide contact information for someone who can be reached in case of emergency during your travel.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact Name */}
        <div className="md:col-span-2">
          <label htmlFor="emergencyName" className="block text-sm font-medium text-gray-700">
            Full Name *
          </label>
          <input
            type="text"
            id="emergencyName"
            name="emergencyName"
            value={formData.emergencyContact.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Enter full name"
            className={`
              mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500
              ${errors.emergencyName ? 'border-red-300' : 'border-gray-300'}
            `}
          />
          {errors.emergencyName && (
            <p className="mt-1 text-sm text-red-600">{errors.emergencyName}</p>
          )}
        </div>

        {/* Relationship */}
        <div>
          <label htmlFor="relationship" className="block text-sm font-medium text-gray-700">
            Relationship *
          </label>
          <select
            id="relationship"
            name="relationship"
            value={formData.emergencyContact.relationship}
            onChange={(e) => handleChange('relationship', e.target.value)}
            className={`
              mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500
              ${errors.relationship ? 'border-red-300' : 'border-gray-300'}
            `}
          >
            <option value="">Select relationship</option>
            {relationshipOptions.map((relationship) => (
              <option key={relationship} value={relationship}>
                {relationship}
              </option>
            ))}
          </select>
          {errors.relationship && (
            <p className="mt-1 text-sm text-red-600">{errors.relationship}</p>
          )}
        </div>

        {/* Phone Number */}
        <div>
          <label htmlFor="emergencyPhone" className="block text-sm font-medium text-gray-700">
            Phone Number *
          </label>
          <input
            type="tel"
            id="emergencyPhone"
            name="emergencyPhone"
            value={formData.emergencyContact.phoneNumber}
            onChange={handlePhoneChange}
            placeholder="+1234567890"
            className={`
              mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500
              ${errors.emergencyPhone ? 'border-red-300' : 'border-gray-300'}
            `}
          />
          <p className="mt-1 text-xs text-gray-500">International format: +[country code][number]</p>
          {errors.emergencyPhone && (
            <p className="mt-1 text-sm text-red-600">{errors.emergencyPhone}</p>
          )}
          {formData.emergencyContact.phoneNumber && !validatePhoneNumber(formData.emergencyContact.phoneNumber) && (
            <p className="mt-1 text-sm text-red-600">Please enter a valid international phone number</p>
          )}
        </div>

        {/* Address */}
        <div className="md:col-span-2">
          <label htmlFor="emergencyAddress" className="block text-sm font-medium text-gray-700">
            Address *
          </label>
          <textarea
            id="emergencyAddress"
            name="emergencyAddress"
            rows={3}
            value={formData.emergencyContact.address}
            onChange={(e) => handleChange('address', e.target.value)}
            placeholder="Full address including city, state/province, and country"
            className={`
              mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500
              ${errors.emergencyAddress ? 'border-red-300' : 'border-gray-300'}
            `}
          />
          {errors.emergencyAddress && (
            <p className="mt-1 text-sm text-red-600">{errors.emergencyAddress}</p>
          )}
        </div>
      </div>

      {/* Additional Emergency Contact (Optional) */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-800 mb-3">
          Additional Emergency Contact (Optional)
        </h4>
        <p className="text-xs text-gray-600 mb-4">
          You may provide a second emergency contact for additional safety.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="secondaryName" className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              id="secondaryName"
              name="secondaryName"
              value={formData.emergencyContact.secondaryName || ''}
              onChange={(e) => handleChange('secondaryName', e.target.value)}
              placeholder="Enter full name"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="secondaryRelationship" className="block text-sm font-medium text-gray-700">
              Relationship
            </label>
            <select
              id="secondaryRelationship"
              name="secondaryRelationship"
              value={formData.emergencyContact.secondaryRelationship || ''}
              onChange={(e) => handleChange('secondaryRelationship', e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select relationship</option>
              {relationshipOptions.map((relationship) => (
                <option key={relationship} value={relationship}>
                  {relationship}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="secondaryPhone" className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              type="tel"
              id="secondaryPhone"
              name="secondaryPhone"
              value={formData.emergencyContact.secondaryPhone || ''}
              onChange={(e) => handleChange('secondaryPhone', formatPhoneNumber(e.target.value))}
              placeholder="+1234567890"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="secondaryAddress" className="block text-sm font-medium text-gray-700">
              Address
            </label>
            <input
              type="text"
              id="secondaryAddress"
              name="secondaryAddress"
              value={formData.emergencyContact.secondaryAddress || ''}
              onChange={(e) => handleChange('secondaryAddress', e.target.value)}
              placeholder="Full address"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Important Notes */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Emergency Contact Guidelines</h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Choose someone who is easily reachable and available</li>
                <li>Ensure they know about your travel plans and passport application</li>
                <li>This contact will be notified only in case of emergency</li>
                <li>Make sure the phone number is active and regularly monitored</li>
                <li>Consider time zones when choosing international emergency contacts</li>
                <li>Provide the complete international address including country</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-gray-800">Privacy Notice</h3>
            <p className="mt-1 text-sm text-gray-700">
              Emergency contact information is kept confidential and used only for official passport-related emergencies 
              or as required by consular services. This information will not be shared with third parties.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 