'use client';

import { useLanguage } from '@/contexts/LanguageContext';

export default function ContactInfoStep({ formData, updateFormData, errors }) {
  const { t } = useLanguage();
  
  const handleChange = (field, value) => {
    updateFormData({
      contactInfo: {
        ...formData.contactInfo,
        [field]: value
      }
    });
  };

  const handleAddressChange = (field, value) => {
    updateFormData({
      contactInfo: {
        ...formData.contactInfo,
        address: {
          ...formData.contactInfo.address,
          [field]: value
        }
      }
    });
  };

  const validatePhoneNumber = (phone) => {
    // International phone format: + followed by country code and number
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
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

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const countries = [
    'Sudan', 'Egypt', 'Saudi Arabia', 'UAE', 'Qatar', 'Kuwait', 'Bahrain', 'Oman',
    'Jordan', 'Lebanon', 'Syria', 'Iraq', 'Turkey', 'Ethiopia', 'Eritrea', 'Kenya',
    'Uganda', 'Chad', 'Libya', 'Morocco', 'Tunisia', 'Algeria', 'United Kingdom',
    'Germany', 'France', 'Italy', 'Netherlands', 'Belgium', 'Spain', 'Portugal',
    'United States', 'Canada', 'Australia', 'New Zealand', 'South Africa', 'Nigeria',
    'Ghana', 'Malaysia', 'Singapore', 'Indonesia', 'Thailand', 'Philippines',
    'India', 'Pakistan', 'Bangladesh', 'Afghanistan', 'Iran', 'Other'
  ];

  const getStatesByCountry = (country) => {
    const statesByCountry = {
      'Sudan': [
        'Khartoum', 'Gezira', 'Kassala', 'River Nile', 'Northern',
        'Red Sea', 'White Nile', 'Blue Nile', 'North Kordofan', 'South Kordofan',
        'North Darfur', 'South Darfur', 'West Darfur', 'Central Darfur', 'East Darfur',
        'Sennar', 'Al Qadarif', 'West Kordofan'
      ],
      'Egypt': ['Cairo', 'Alexandria', 'Giza', 'Luxor', 'Aswan', 'Other'],
      'Saudi Arabia': ['Riyadh', 'Mecca', 'Medina', 'Eastern Province', 'Jeddah', 'Other'],
      'UAE': ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Fujairah', 'Ras Al Khaimah', 'Umm Al Quwain'],
      'United States': ['California', 'New York', 'Texas', 'Florida', 'Illinois', 'Other'],
      'United Kingdom': ['England', 'Scotland', 'Wales', 'Northern Ireland'],
      'Canada': ['Ontario', 'Quebec', 'British Columbia', 'Alberta', 'Manitoba', 'Other'],
      'Australia': ['New South Wales', 'Victoria', 'Queensland', 'Western Australia', 'Other']
    };
    
    return statesByCountry[country] || [];
  };

  const selectedCountry = formData.contactInfo.address.country;
  const availableStates = getStatesByCountry(selectedCountry);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('application.contactInfoTitle')}</h2>
        <p className="text-gray-600">Provide your current contact details and residential address.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Phone Number */}
        <div>
          <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
            {t('auth.phoneNumber')} *
          </label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={formData.contactInfo.phoneNumber}
            onChange={handlePhoneChange}
            placeholder="+1234567890"
            className={`
              mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500
              ${errors.phoneNumber ? 'border-red-300' : 'border-gray-300'}
            `}
          />
          <p className="mt-1 text-xs text-gray-500">International format: +[country code][number]</p>
          {errors.phoneNumber && (
            <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>
          )}
          {formData.contactInfo.phoneNumber && !validatePhoneNumber(formData.contactInfo.phoneNumber) && (
            <p className="mt-1 text-sm text-red-600">Please enter a valid international phone number</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            {t('auth.email')} *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.contactInfo.email}
            onChange={(e) => handleChange('email', e.target.value.toLowerCase())}
            placeholder="your.email@example.com"
            className={`
              mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500
              ${errors.email ? 'border-red-300' : 'border-gray-300'}
            `}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
          {formData.contactInfo.email && !validateEmail(formData.contactInfo.email) && (
            <p className="mt-1 text-sm text-red-600">Please enter a valid email address</p>
          )}
        </div>
      </div>

      {/* Address Section */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Residential Address</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Country - First so it can control state options */}
          <div className="md:col-span-2">
            <label htmlFor="country" className="block text-sm font-medium text-gray-700">
              {t('application.country')} *
            </label>
            <select
              id="country"
              name="country"
              value={formData.contactInfo.address.country}
              onChange={(e) => {
                handleAddressChange('country', e.target.value);
                // Clear state when country changes
                handleAddressChange('state', '');
              }}
              className={`
                mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500
                ${errors.country ? 'border-red-300' : 'border-gray-300'}
              `}
            >
              <option value="">Select country</option>
              {countries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
            {errors.country && (
              <p className="mt-1 text-sm text-red-600">{errors.country}</p>
            )}
          </div>

          {/* Street Address */}
          <div className="md:col-span-2">
            <label htmlFor="street" className="block text-sm font-medium text-gray-700">
              {t('application.street')} *
            </label>
            <textarea
              id="street"
              name="street"
              rows={3}
              value={formData.contactInfo.address.street}
              onChange={(e) => handleAddressChange('street', e.target.value)}
              placeholder="House number, street name, neighborhood"
              className={`
                mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500
                ${errors.street ? 'border-red-300' : 'border-gray-300'}
              `}
            />
            {errors.street && (
              <p className="mt-1 text-sm text-red-600">{errors.street}</p>
            )}
          </div>

          {/* City */}
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700">
              {t('application.city')} *
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.contactInfo.address.city}
              onChange={(e) => handleAddressChange('city', e.target.value)}
              placeholder="Enter city or town"
              className={`
                mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500
                ${errors.city ? 'border-red-300' : 'border-gray-300'}
              `}
            />
            {errors.city && (
              <p className="mt-1 text-sm text-red-600">{errors.city}</p>
            )}
          </div>

          {/* State/Province */}
          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700">
              {t('application.state')} *
            </label>
            {availableStates.length > 0 ? (
              <select
                id="state"
                name="state"
                value={formData.contactInfo.address.state}
                onChange={(e) => handleAddressChange('state', e.target.value)}
                className={`
                  mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500
                  ${errors.state ? 'border-red-300' : 'border-gray-300'}
                `}
              >
                <option value="">Select state/province</option>
                {availableStates.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                id="state"
                name="state"
                value={formData.contactInfo.address.state}
                onChange={(e) => handleAddressChange('state', e.target.value)}
                placeholder="Enter state, province, or region"
                className={`
                  mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500
                  ${errors.state ? 'border-red-300' : 'border-gray-300'}
                `}
              />
            )}
            {errors.state && (
              <p className="mt-1 text-sm text-red-600">{errors.state}</p>
            )}
          </div>

          {/* Postal Code */}
          <div>
            <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">
              {t('application.postalCode')}
            </label>
            <input
              type="text"
              id="postalCode"
              name="postalCode"
              value={formData.contactInfo.address.postalCode}
              onChange={(e) => handleAddressChange('postalCode', e.target.value)}
              placeholder="Enter postal/ZIP code"
              className={`
                mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500
                ${errors.postalCode ? 'border-red-300' : 'border-gray-300'}
              `}
            />
            {errors.postalCode && (
              <p className="mt-1 text-sm text-red-600">{errors.postalCode}</p>
            )}
          </div>
        </div>
      </div>

      {/* Alternative Contact Method */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-800 mb-3">Alternative Contact Information (Optional)</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="alternativePhone" className="block text-sm font-medium text-gray-700">
              Alternative Phone Number
            </label>
            <input
              type="tel"
              id="alternativePhone"
              name="alternativePhone"
              value={formData.contactInfo.alternativePhone || ''}
              onChange={(e) => handleChange('alternativePhone', formatPhoneNumber(e.target.value))}
              placeholder="+1234567890"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="alternativeEmail" className="block text-sm font-medium text-gray-700">
              Alternative Email
            </label>
            <input
              type="email"
              id="alternativeEmail"
              name="alternativeEmail"
              value={formData.contactInfo.alternativeEmail || ''}
              onChange={(e) => handleChange('alternativeEmail', e.target.value.toLowerCase())}
              placeholder="alternative@example.com"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Communication Preferences */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Preferred Communication Method *</h4>
        <div className="space-y-3">
          {[
            { value: 'email', label: 'Email notifications' },
            { value: 'sms', label: 'SMS text messages' },
            { value: 'both', label: 'Both email and SMS' }
          ].map((option) => (
            <div key={option.value} className="flex items-center">
              <input
                id={`communication_${option.value}`}
                name="preferredCommunication"
                type="radio"
                value={option.value}
                checked={formData.contactInfo.preferredCommunication === option.value}
                onChange={(e) => handleChange('preferredCommunication', e.target.value)}
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <label htmlFor={`communication_${option.value}`} className="ml-3 text-sm text-gray-700">
                {option.label}
              </label>
            </div>
          ))}
        </div>
        {errors.preferredCommunication && (
          <p className="mt-2 text-sm text-red-600">{errors.preferredCommunication}</p>
        )}
      </div>

      {/* Important Notes */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Important Contact Information</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Ensure your phone number is active and can receive SMS messages</li>
                <li>Check your email regularly for application status updates</li>
                <li>You will be contacted when your passport is ready for collection</li>
                <li>Updates about processing delays or requirements will be sent to your preferred contact method</li>
                <li>For international residents, provide a reliable local contact method</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 