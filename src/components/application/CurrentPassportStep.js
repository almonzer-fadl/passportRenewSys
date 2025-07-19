'use client';

import { useLanguage } from '@/contexts/LanguageContext';

export default function CurrentPassportStep({ formData, updateFormData, errors }) {
  const { t } = useLanguage();
  
  const handleChange = (field, value) => {
    updateFormData({
      currentPassport: {
        ...formData.currentPassport,
        [field]: value
      }
    });
  };

  const validatePassportNumber = (value) => {
    const passportRegex = /^[A-Z]{2}[0-9]{7}$/;
    return passportRegex.test(value);
  };

  const handlePassportNumberChange = (e) => {
    let value = e.target.value.toUpperCase();
    // Remove any non-alphanumeric characters
    value = value.replace(/[^A-Z0-9]/g, '');
    // Limit to 9 characters
    if (value.length <= 9) {
      handleChange('passportNumber', value);
    }
  };

  const getDescriptionText = () => {
    const type = formData.applicationType === 'renewal' ? t('application.renewed') : t('application.replaced');
    return t('application.currentPassportDesc', { type });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('application.currentPassportTitle')}</h2>
        <p className="text-gray-600">
          {getDescriptionText()}
        </p>
      </div>

      {/* Passport Number */}
      <div>
        <label htmlFor="passportNumber" className="block text-sm font-medium text-gray-700">
          {t('application.passportNumber')} *
        </label>
        <input
          type="text"
          id="passportNumber"
          value={formData.currentPassport.passportNumber}
          onChange={handlePassportNumberChange}
          placeholder="XX1234567"
          className={`
            mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500
            ${errors.passportNumber ? 'border-red-300' : 'border-gray-300'}
          `}
        />
        <p className="mt-1 text-xs text-gray-500">Format: 2 letters followed by 7 digits (e.g., XX1234567)</p>
        {errors.passportNumber && (
          <p className="mt-1 text-sm text-red-600">{errors.passportNumber}</p>
        )}
        {formData.currentPassport.passportNumber && !validatePassportNumber(formData.currentPassport.passportNumber) && (
          <p className="mt-1 text-sm text-red-600">Invalid passport number format</p>
        )}
      </div>

      {/* Issue Date */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="issueDate" className="block text-sm font-medium text-gray-700">
            {t('application.issueDate')} *
          </label>
          <input
            type="date"
            id="issueDate"
            value={formData.currentPassport.issueDate}
            onChange={(e) => handleChange('issueDate', e.target.value)}
            className={`
              mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500
              ${errors.issueDate ? 'border-red-300' : 'border-gray-300'}
            `}
          />
          {errors.issueDate && (
            <p className="mt-1 text-sm text-red-600">{errors.issueDate}</p>
          )}
        </div>

        {/* Expiry Date */}
        <div>
          <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">
            {t('application.expiryDate')} *
          </label>
          <input
            type="date"
            id="expiryDate"
            value={formData.currentPassport.expiryDate}
            onChange={(e) => handleChange('expiryDate', e.target.value)}
            className={`
              mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500
              ${errors.expiryDate ? 'border-red-300' : 'border-gray-300'}
            `}
          />
          {errors.expiryDate && (
            <p className="mt-1 text-sm text-red-600">{errors.expiryDate}</p>
          )}
        </div>
      </div>

      {/* Issuing Office */}
      <div>
        <label htmlFor="issuingOffice" className="block text-sm font-medium text-gray-700">
          {t('application.issuingOffice')} *
        </label>
        <select
          id="issuingOffice"
          value={formData.currentPassport.issuingOffice}
          onChange={(e) => handleChange('issuingOffice', e.target.value)}
          className={`
            mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500
            ${errors.issuingOffice ? 'border-red-300' : 'border-gray-300'}
          `}
        >
          <option value="">Select issuing office</option>
          <option value="Khartoum">Khartoum Passport Office</option>
          <option value="Port Sudan">Port Sudan Passport Office</option>
          <option value="Kassala">Kassala Passport Office</option>
          <option value="Gedaref">Gedaref Passport Office</option>
          <option value="Nyala">Nyala Passport Office</option>
          <option value="El Fasher">El Fasher Passport Office</option>
          <option value="El Obeid">El Obeid Passport Office</option>
          <option value="Wad Medani">Wad Medani Passport Office</option>
          <option value="Sennar">Sennar Passport Office</option>
          <option value="Damazin">Damazin Passport Office</option>
          <option value="Embassy">Sudanese Embassy/Consulate</option>
        </select>
        {errors.issuingOffice && (
          <p className="mt-1 text-sm text-red-600">{errors.issuingOffice}</p>
        )}
      </div>

      {/* Current Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          {t('application.passportStatus')} *
        </label>
        <div className="space-y-2">
          {[
            { value: 'valid', label: t('application.valid') },
            { value: 'expired', label: t('application.expired') },
            { value: 'lost', label: t('application.lost') },
            { value: 'stolen', label: t('application.stolen') },
            { value: 'damaged', label: t('application.damaged') }
          ].map((status) => (
            <div key={status.value} className="flex items-center">
              <input
                id={`status_${status.value}`}
                name="passportStatus"
                type="radio"
                value={status.value}
                checked={formData.currentPassport.passportStatus === status.value}
                onChange={(e) => handleChange('passportStatus', e.target.value)}
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <label htmlFor={`status_${status.value}`} className="ml-3 text-sm text-gray-700">
                {status.label}
              </label>
            </div>
          ))}
        </div>
        {errors.passportStatus && (
          <p className="mt-2 text-sm text-red-600">{errors.passportStatus}</p>
        )}
      </div>

      {/* Replacement Reason (if applicable) */}
      {formData.applicationType === 'replacement' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            {t('application.replacementReason')} *
          </label>
          <div className="space-y-3">
            {[
              { value: 'lost', label: t('application.lostPassport') },
              { value: 'stolen', label: t('application.stolenPassport') },
              { value: 'damaged', label: t('application.damagedPassport') },
              { value: 'pages_full', label: t('application.pagesFullPassport') }
            ].map((reason) => (
              <div key={reason.value} className="flex items-center">
                <input
                  id={`replacement_${reason.value}`}
                  name="replacementReason"
                  type="radio"
                  value={reason.value}
                  checked={formData.currentPassport.replacementReason === reason.value}
                  onChange={(e) => handleChange('replacementReason', e.target.value)}
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor={`replacement_${reason.value}`} className="ml-3 text-sm text-gray-700">
                  {reason.label}
                </label>
              </div>
            ))}
          </div>
          {errors.replacementReason && (
            <p className="mt-2 text-sm text-red-600">{errors.replacementReason}</p>
          )}
        </div>
      )}

      {/* Important Notes */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-gray-800">{t('application.requiredDocuments')}</h3>
            <div className="mt-2 text-sm text-gray-700">
              <p>{t('application.documentsNeeded')}</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>{t('application.currentPassportPages')}</li>
                {formData.applicationType === 'replacement' && (
                  <>
                    <li>{t('application.policeReport')}</li>
                    <li>{t('application.affidavitLoss')}</li>
                  </>
                )}
                <li>{t('application.nationalIdCard')}</li>
                <li>{t('application.recentPhoto')}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 