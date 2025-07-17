import { useState } from 'react';

export default function TravelInfoStep({ formData, updateFormData, errors }) {
  const [countryInput, setCountryInput] = useState('');

  const handleChange = (field, value) => {
    updateFormData({
      travelInfo: {
        ...formData.travelInfo,
        [field]: value
      }
    });
  };

  const addCountry = () => {
    if (countryInput.trim() && !formData.travelInfo.intendedCountries.includes(countryInput.trim())) {
      const updatedCountries = [...formData.travelInfo.intendedCountries, countryInput.trim()];
      handleChange('intendedCountries', updatedCountries);
      setCountryInput('');
    }
  };

  const removeCountry = (countryToRemove) => {
    const updatedCountries = formData.travelInfo.intendedCountries.filter(
      country => country !== countryToRemove
    );
    handleChange('intendedCountries', updatedCountries);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCountry();
    }
  };

  const popularDestinations = [
    'Saudi Arabia', 'Egypt', 'UAE', 'Qatar', 'Kuwait', 'Turkey', 
    'Jordan', 'Ethiopia', 'Kenya', 'United Kingdom', 'Germany', 
    'United States', 'Canada', 'Australia', 'Malaysia', 'Singapore'
  ];

  const purposeOptions = [
    { value: 'tourism', label: 'Tourism/Leisure', icon: '🏖️' },
    { value: 'business', label: 'Business', icon: '💼' },
    { value: 'education', label: 'Education/Study', icon: '🎓' },
    { value: 'medical', label: 'Medical Treatment', icon: '🏥' },
    { value: 'family', label: 'Family Visit', icon: '👨‍👩‍👧‍👦' },
    { value: 'pilgrimage', label: 'Religious Pilgrimage', icon: '🕌' },
    { value: 'other', label: 'Other', icon: '✈️' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Travel Information</h2>
        <p className="text-gray-600">
          Provide details about your intended travel plans. This information helps us process your application appropriately.
        </p>
      </div>

      {/* Purpose of Travel */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Primary Purpose of Travel *
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {purposeOptions.map((option) => (
            <div
              key={option.value}
              className={`
                relative border-2 rounded-lg p-3 cursor-pointer transition-all duration-200
                ${formData.travelInfo.purposeOfTravel === option.value
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
              onClick={() => handleChange('purposeOfTravel', option.value)}
            >
              <div className="flex items-center">
                <input
                  type="radio"
                  name="purposeOfTravel"
                  value={option.value}
                  checked={formData.travelInfo.purposeOfTravel === option.value}
                  onChange={() => handleChange('purposeOfTravel', option.value)}
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <div className="ml-3 flex items-center">
                  <span className="text-lg mr-2">{option.icon}</span>
                  <span className="text-sm font-medium text-gray-900">{option.label}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        {errors.purposeOfTravel && (
          <p className="mt-2 text-sm text-red-600">{errors.purposeOfTravel}</p>
        )}
      </div>

      {/* Intended Countries */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Intended Countries/Destinations
        </label>
        
        {/* Country Input */}
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={countryInput}
            onChange={(e) => setCountryInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter country name"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            type="button"
            onClick={addCountry}
            disabled={!countryInput.trim()}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add
          </button>
        </div>

        {/* Popular Destinations Quick Add */}
        <div className="mb-3">
          <p className="text-xs text-gray-500 mb-2">Quick add popular destinations:</p>
          <div className="flex flex-wrap gap-2">
            {popularDestinations.map((country) => (
              <button
                key={country}
                type="button"
                onClick={() => {
                  if (!formData.travelInfo.intendedCountries.includes(country)) {
                    const updatedCountries = [...formData.travelInfo.intendedCountries, country];
                    handleChange('intendedCountries', updatedCountries);
                  }
                }}
                disabled={formData.travelInfo.intendedCountries.includes(country)}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {country}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Countries */}
        {formData.travelInfo.intendedCountries.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Selected Countries:</p>
            <div className="flex flex-wrap gap-2">
              {formData.travelInfo.intendedCountries.map((country) => (
                <div
                  key={country}
                  className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                >
                  <span>{country}</span>
                  <button
                    type="button"
                    onClick={() => removeCountry(country)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {errors.intendedCountries && (
          <p className="mt-2 text-sm text-red-600">{errors.intendedCountries}</p>
        )}
      </div>

      {/* Travel Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="departureDate" className="block text-sm font-medium text-gray-700">
            Intended Departure Date
          </label>
          <input
            type="date"
            id="departureDate"
            name="departureDate"
            value={formData.travelInfo.departureDate}
            onChange={(e) => handleChange('departureDate', e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className={`
              mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500
              ${errors.departureDate ? 'border-red-300' : 'border-gray-300'}
            `}
          />
          <p className="mt-1 text-xs text-gray-500">Optional - for planning purposes</p>
          {errors.departureDate && (
            <p className="mt-1 text-sm text-red-600">{errors.departureDate}</p>
          )}
        </div>

        <div>
          <label htmlFor="returnDate" className="block text-sm font-medium text-gray-700">
            Intended Return Date
          </label>
          <input
            type="date"
            id="returnDate"
            name="returnDate"
            value={formData.travelInfo.returnDate}
            onChange={(e) => handleChange('returnDate', e.target.value)}
            min={formData.travelInfo.departureDate || new Date().toISOString().split('T')[0]}
            className={`
              mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500
              ${errors.returnDate ? 'border-red-300' : 'border-gray-300'}
            `}
          />
          <p className="mt-1 text-xs text-gray-500">Optional - for planning purposes</p>
          {errors.returnDate && (
            <p className="mt-1 text-sm text-red-600">{errors.returnDate}</p>
          )}
        </div>
      </div>

      {/* Date Validation Warning */}
      {formData.travelInfo.departureDate && formData.travelInfo.returnDate && 
       new Date(formData.travelInfo.returnDate) <= new Date(formData.travelInfo.departureDate) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Invalid Dates</h3>
              <p className="mt-1 text-sm text-red-700">
                Return date must be after departure date.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Additional Travel Information */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-800 mb-3">Additional Travel Notes (Optional)</h4>
        <textarea
          rows={3}
          value={formData.travelInfo.additionalNotes || ''}
          onChange={(e) => handleChange('additionalNotes', e.target.value)}
          placeholder="Any additional information about your travel plans, special requirements, or circumstances..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Important Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Travel Information Notice</h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Travel dates are for informational purposes and don't affect passport validity</li>
                <li>Your new passport will be valid for 10 years from the issue date</li>
                <li>Some countries require passports to be valid for 6+ months beyond travel dates</li>
                <li>Check visa requirements for your intended destinations</li>
                <li>For Hajj/Umrah travel, additional documentation may be required</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Visa Information */}
      {formData.travelInfo.intendedCountries.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Visa Requirements Reminder</h3>
              <p className="mt-1 text-sm text-yellow-700">
                Remember to check visa requirements for your intended destinations. Some countries require visa applications 
                to be submitted well in advance of travel. Contact the relevant embassies or consulates for specific requirements.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 