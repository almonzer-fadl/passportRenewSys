export default function CurrentPassportStep({ formData, updateFormData, errors }) {
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Current Passport Information</h2>
        <p className="text-gray-600">
          Enter the details from your current passport that needs to be {formData.applicationType === 'renewal' ? 'renewed' : 'replaced'}.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Passport Number */}
        <div className="md:col-span-2">
          <label htmlFor="passportNumber" className="block text-sm font-medium text-gray-700">
            Passport Number *
          </label>
          <input
            type="text"
            id="passportNumber"
            name="passportNumber"
            value={formData.currentPassport.passportNumber}
            onChange={handlePassportNumberChange}
            placeholder="AB1234567"
            className={`
              mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500
              ${errors.passportNumber ? 'border-red-300' : 'border-gray-300'}
            `}
          />
          <p className="mt-1 text-xs text-gray-500">Format: 2 letters followed by 7 numbers (e.g., AB1234567)</p>
          {errors.passportNumber && (
            <p className="mt-1 text-sm text-red-600">{errors.passportNumber}</p>
          )}
          {formData.currentPassport.passportNumber && !validatePassportNumber(formData.currentPassport.passportNumber) && (
            <p className="mt-1 text-sm text-red-600">Invalid passport number format</p>
          )}
        </div>

        {/* Issue Date */}
        <div>
          <label htmlFor="issueDate" className="block text-sm font-medium text-gray-700">
            Issue Date *
          </label>
          <input
            type="date"
            id="issueDate"
            name="issueDate"
            value={formData.currentPassport.issueDate}
            onChange={(e) => handleChange('issueDate', e.target.value)}
            max={new Date().toISOString().split('T')[0]}
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
            Expiry Date *
          </label>
          <input
            type="date"
            id="expiryDate"
            name="expiryDate"
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

        {/* Issuing Office */}
        <div className="md:col-span-2">
          <label htmlFor="issuingOffice" className="block text-sm font-medium text-gray-700">
            Issuing Office *
          </label>
          <select
            id="issuingOffice"
            name="issuingOffice"
            value={formData.currentPassport.issuingOffice}
            onChange={(e) => handleChange('issuingOffice', e.target.value)}
            className={`
              mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500
              ${errors.issuingOffice ? 'border-red-300' : 'border-gray-300'}
            `}
          >
            <option value="">Select issuing office</option>
            <option value="Khartoum Central Office">Khartoum Central Office</option>
            <option value="Port Sudan Office">Port Sudan Office</option>
            <option value="Kassala Office">Kassala Office</option>
            <option value="El Obeid Office">El Obeid Office</option>
            <option value="Nyala Office">Nyala Office</option>
            <option value="El Fasher Office">El Fasher Office</option>
            <option value="Wad Madani Office">Wad Madani Office</option>
            <option value="Gedaref Office">Gedaref Office</option>
            <option value="Atbara Office">Atbara Office</option>
            <option value="Dongola Office">Dongola Office</option>
            <option value="Sudanese Embassy - Cairo">Sudanese Embassy - Cairo</option>
            <option value="Sudanese Embassy - Riyadh">Sudanese Embassy - Riyadh</option>
            <option value="Sudanese Embassy - Dubai">Sudanese Embassy - Dubai</option>
            <option value="Sudanese Embassy - London">Sudanese Embassy - London</option>
            <option value="Other Embassy/Consulate">Other Embassy/Consulate</option>
          </select>
          {errors.issuingOffice && (
            <p className="mt-1 text-sm text-red-600">{errors.issuingOffice}</p>
          )}
        </div>
      </div>

      {/* Passport Status Check */}
      {formData.currentPassport.expiryDate && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Passport Status</h3>
              <div className="mt-2 text-sm text-blue-700">
                {(() => {
                  const expiryDate = new Date(formData.currentPassport.expiryDate);
                  const today = new Date();
                  const diffTime = expiryDate - today;
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                  if (diffDays < 0) {
                    return (
                      <p className="text-red-700">
                        ⚠️ Your passport expired {Math.abs(diffDays)} days ago. A renewal application is required.
                      </p>
                    );
                  } else if (diffDays <= 180) {
                    return (
                      <p className="text-orange-700">
                        ⚠️ Your passport expires in {diffDays} days. Renewal is recommended within 6 months of expiry.
                      </p>
                    );
                  } else {
                    return (
                      <p className="text-green-700">
                        ✅ Your passport is valid for {diffDays} more days.
                      </p>
                    );
                  }
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Replacement Reason */}
      {formData.applicationType === 'replacement' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Reason for Replacement *
          </label>
          <div className="space-y-3">
            {[
              { value: 'lost', label: 'Lost Passport' },
              { value: 'stolen', label: 'Stolen Passport' },
              { value: 'damaged', label: 'Damaged Passport' },
              { value: 'pages_full', label: 'Passport Pages Full' }
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
            <h3 className="text-sm font-medium text-gray-800">Required Documents</h3>
            <div className="mt-2 text-sm text-gray-700">
              <p>You will need to upload the following documents:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Clear photo/scan of your current passport (all pages)</li>
                {formData.applicationType === 'replacement' && (
                  <>
                    <li>Police report (for lost/stolen passports)</li>
                    <li>Affidavit of loss/theft (if applicable)</li>
                  </>
                )}
                <li>National ID card</li>
                <li>Recent passport-sized photograph</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 