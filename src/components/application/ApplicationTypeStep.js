'use client';

import { useLanguage } from '@/contexts/LanguageContext';

export default function ApplicationTypeStep({ formData, updateFormData, errors }) {
  const { t } = useLanguage();
  
  const handleChange = (field, value) => {
    updateFormData({ [field]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('application.applicationTypeTitle')}</h2>
        <p className="text-gray-600">{t('application.typeSelectDescription')}</p>
      </div>

      {/* Application Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          {t('application.typeOfApplication')} *
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              value: 'renewal',
              title: t('application.renewal'),
              description: t('application.renewalDesc'),
              icon: '🔄'
            },
            {
              value: 'new',
              title: t('application.newApplication'),
              description: t('application.newPassportDesc'),
              icon: '📄'
            },
            {
              value: 'replacement',
              title: t('application.replacement'),
              description: t('application.replacementDesc'),
              icon: '🔄'
            },
            {
              value: 'correction',
              title: t('application.correction'),
              description: t('application.correctionDesc'),
              icon: '✏️'
            }
          ].map((option) => (
            <div
              key={option.value}
              className={`
                relative border-2 rounded-lg p-4 cursor-pointer transition-all duration-200
                ${formData.applicationType === option.value
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
              onClick={() => handleChange('applicationType', option.value)}
            >
              <div className="flex items-center">
                <input
                  type="radio"
                  name="applicationType"
                  value={option.value}
                  checked={formData.applicationType === option.value}
                  onChange={() => handleChange('applicationType', option.value)}
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <div className="ml-3 flex-1">
                  <div className="flex items-center">
                    <span className="text-lg mr-2">{option.icon}</span>
                    <span className="font-medium text-gray-900">{option.title}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        {errors.applicationType && (
          <p className="mt-2 text-sm text-red-600">{errors.applicationType}</p>
        )}
      </div>

      {/* Processing Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          {t('application.processingSpeed')} *
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              value: 'regular',
              title: t('application.regular'),
              description: t('application.regularProcessingPrice'),
              icon: '📅',
              price: '$150'
            },
            {
              value: 'express',
              title: t('application.express'),
              description: t('application.expressProcessingPrice'),
              icon: '⚡',
              price: '$225'
            }
          ].map((option) => (
            <div
              key={option.value}
              className={`
                relative border-2 rounded-lg p-4 cursor-pointer transition-all duration-200
                ${formData.processingType === option.value
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
              onClick={() => handleChange('processingType', option.value)}
            >
              <div className="flex items-center">
                <input
                  type="radio"
                  name="processingType"
                  value={option.value}
                  checked={formData.processingType === option.value}
                  onChange={() => handleChange('processingType', option.value)}
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <div className="ml-3 flex-1">
                  <div className="flex items-center">
                    <span className="text-lg mr-2">{option.icon}</span>
                    <span className="font-medium text-gray-900">{option.title}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                  <p className="text-sm font-medium text-blue-600 mt-1">{option.price}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        {errors.processingType && (
          <p className="mt-2 text-sm text-red-600">{errors.processingType}</p>
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
            <h3 className="text-sm font-medium text-yellow-800">{t('application.importantInformation')}</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <ul className="list-disc list-inside space-y-1">
                <li>{t('application.processingTimeNote')}</li>
                <li>{t('application.expressDocNote')}</li>
                <li>{t('application.feesNonRefundable')}</li>
                <li>{t('application.biometricRequired')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 