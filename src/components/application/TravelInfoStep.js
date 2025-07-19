'use client';

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function TravelInfoStep({ formData, updateFormData, errors }) {
  const { t } = useLanguage();
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
    { value: 'tourism', label: t('application.tourism'), icon: '🏖️' },
    { value: 'business', label: t('application.business'), icon: '💼' },
    { value: 'education', label: t('application.education'), icon: '🎓' },
    { value: 'medical', label: t('application.medical'), icon: '🏥' },
    { value: 'family', label: t('application.family'), icon: '👨‍👩‍👧‍👦' },
    { value: 'pilgrimage', label: t('application.pilgrimage'), icon: '🕌' },
    { value: 'other', label: t('application.other'), icon: '✈️' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('application.travelInfoTitle')}</h2>
        <p className="text-gray-600">
          {t('application.travelInfoDesc')}
        </p>
      </div>

      {/* Purpose of Travel */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          {t('application.primaryPurpose')} *
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
          {t('application.intendedCountries')}
        </label>
        
        {/* Country Input */}
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={countryInput}
            onChange={(e) => setCountryInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t('common.enterCountryName')}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            type="button"
            onClick={addCountry}
            disabled={!countryInput.trim()}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('common.add')}
          </button>
        </div>

        {/* Popular Destinations Quick Add */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">{t('application.popularDestinations')}:</p>
          <div className="flex flex-wrap gap-2">
            {popularDestinations.map((destination) => (
              <button
                key={destination}
                type="button"
                onClick={() => {
                  if (!formData.travelInfo.intendedCountries.includes(destination)) {
                    const updatedCountries = [...formData.travelInfo.intendedCountries, destination];
                    handleChange('intendedCountries', updatedCountries);
                  }
                }}
                disabled={formData.travelInfo.intendedCountries.includes(destination)}
                className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {destination}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Countries */}
        {formData.travelInfo.intendedCountries.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Selected countries:</p>
            <div className="flex flex-wrap gap-2">
              {formData.travelInfo.intendedCountries.map((country, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                >
                  {country}
                  <button
                    type="button"
                    onClick={() => removeCountry(country)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
        
        {errors.intendedCountries && (
          <p className="mt-2 text-sm text-red-600">{errors.intendedCountries}</p>
        )}
      </div>

      {/* Travel Dates */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">{t('application.travelDates')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Departure Date */}
          <div>
            <label htmlFor="departureDate" className="block text-sm font-medium text-gray-700">
              {t('application.departureDate')}
            </label>
            <input
              type="date"
              id="departureDate"
              value={formData.travelInfo.departureDate}
              onChange={(e) => handleChange('departureDate', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className={`
                mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500
                ${errors.departureDate ? 'border-red-300' : 'border-gray-300'}
              `}
            />
            {errors.departureDate && (
              <p className="mt-1 text-sm text-red-600">{errors.departureDate}</p>
            )}
          </div>

          {/* Return Date */}
          <div>
            <label htmlFor="returnDate" className="block text-sm font-medium text-gray-700">
              {t('application.returnDate')}
            </label>
            <input
              type="date"
              id="returnDate"
              value={formData.travelInfo.returnDate}
              onChange={(e) => handleChange('returnDate', e.target.value)}
              min={formData.travelInfo.departureDate || new Date().toISOString().split('T')[0]}
              className={`
                mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500
                ${errors.returnDate ? 'border-red-300' : 'border-gray-300'}
              `}
            />
            {errors.returnDate && (
              <p className="mt-1 text-sm text-red-600">{errors.returnDate}</p>
            )}
          </div>
        </div>
      </div>

      {/* Additional Notes */}
      <div>
        <label htmlFor="additionalNotes" className="block text-sm font-medium text-gray-700">
          {t('application.additionalNotes')}
        </label>
        <p className="mt-1 text-sm text-gray-500">{t('application.additionalNotesDesc')}</p>
        <textarea
          id="additionalNotes"
          rows={4}
          value={formData.travelInfo.additionalNotes || ''}
          onChange={(e) => handleChange('additionalNotes', e.target.value)}
          placeholder="Any specific details about your travel plans..."
          className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Travel Information Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">{t('application.importantNotice')}</h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Travel information helps us determine appropriate passport validity period</li>
                <li>You can add multiple destinations if you plan to visit several countries</li>
                <li>Dates are estimates - you don't need to have exact travel plans</li>
                <li>This information may be used for statistical purposes by immigration authorities</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 