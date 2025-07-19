'use client';

import { useLanguage } from '@/contexts/LanguageContext';

export default function PersonalInfoStep({ formData, updateFormData, errors }) {
  const { t } = useLanguage();
  
  const handleChange = (field, value) => {
    updateFormData({
      personalInfo: {
        ...formData.personalInfo,
        [field]: value
      }
    });
  };

  const validateNationalId = (value) => {
    // Sudan National ID: 10 digits
    const nationalIdRegex = /^[0-9]{10}$/;
    return nationalIdRegex.test(value);
  };

  const handleNationalIdChange = (e) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    if (value.length <= 10) {
      handleChange('nationalId', value);
    }
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const sudaneseStates = [
    'Khartoum', 'Gezira', 'Kassala', 'River Nile', 'Northern',
    'Red Sea', 'White Nile', 'Blue Nile', 'North Kordofan', 'South Kordofan',
    'North Darfur', 'South Darfur', 'West Darfur', 'Central Darfur', 'East Darfur',
    'Sennar', 'Al Qadarif', 'West Kordofan'
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('application.personalInfoTitle')}</h2>
        <p className="text-gray-600">{t('application.personalInfoDesc')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* First Name */}
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
            {t('auth.firstName')} *
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.personalInfo.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            className={`
              mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500
              ${errors.firstName ? 'border-red-300' : 'border-gray-300'}
            `}
          />
          {errors.firstName && (
            <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
          )}
        </div>

        {/* Last Name */}
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
            {t('auth.lastName')} *
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.personalInfo.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            className={`
              mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500
              ${errors.lastName ? 'border-red-300' : 'border-gray-300'}
            `}
          />
          {errors.lastName && (
            <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
          )}
        </div>

        {/* Father's Name */}
        <div>
          <label htmlFor="fatherName" className="block text-sm font-medium text-gray-700">
            {t('application.fatherName')} *
          </label>
          <input
            type="text"
            id="fatherName"
            name="fatherName"
            value={formData.personalInfo.fatherName}
            onChange={(e) => handleChange('fatherName', e.target.value)}
            className={`
              mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500
              ${errors.fatherName ? 'border-red-300' : 'border-gray-300'}
            `}
          />
          {errors.fatherName && (
            <p className="mt-1 text-sm text-red-600">{errors.fatherName}</p>
          )}
        </div>

        {/* Grandfather's Name */}
        <div>
          <label htmlFor="grandfatherName" className="block text-sm font-medium text-gray-700">
            {t('application.grandfatherName')} *
          </label>
          <input
            type="text"
            id="grandfatherName"
            name="grandfatherName"
            value={formData.personalInfo.grandfatherName}
            onChange={(e) => handleChange('grandfatherName', e.target.value)}
            className={`
              mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500
              ${errors.grandfatherName ? 'border-red-300' : 'border-gray-300'}
            `}
          />
          {errors.grandfatherName && (
            <p className="mt-1 text-sm text-red-600">{errors.grandfatherName}</p>
          )}
        </div>

        {/* Mother's Name */}
        <div>
          <label htmlFor="motherName" className="block text-sm font-medium text-gray-700">
            {t('application.mothersName')} *
          </label>
          <input
            type="text"
            id="motherName"
            name="motherName"
            value={formData.personalInfo.motherName}
            onChange={(e) => handleChange('motherName', e.target.value)}
            className={`
              mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500
              ${errors.motherName ? 'border-red-300' : 'border-gray-300'}
            `}
          />
          {errors.motherName && (
            <p className="mt-1 text-sm text-red-600">{errors.motherName}</p>
          )}
        </div>

        {/* National ID */}
        <div>
          <label htmlFor="nationalId" className="block text-sm font-medium text-gray-700">
            {t('application.nationalIdNumber')} *
          </label>
          <input
            type="text"
            id="nationalId"
            name="nationalId"
            value={formData.personalInfo.nationalId}
            onChange={handleNationalIdChange}
            placeholder="1234567890"
            maxLength="10"
            className={`
              mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500
              ${errors.nationalId ? 'border-red-300' : 'border-gray-300'}
            `}
          />
          <p className="mt-1 text-xs text-gray-500">{t('application.nationalIdFormat')}</p>
          {errors.nationalId && (
            <p className="mt-1 text-sm text-red-600">{errors.nationalId}</p>
          )}
          {formData.personalInfo.nationalId && !validateNationalId(formData.personalInfo.nationalId) && (
            <p className="mt-1 text-sm text-red-600">{t('application.nationalIdValidation')}</p>
          )}
        </div>

        {/* Date of Birth */}
        <div>
          <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
            {t('application.dateOfBirth')} *
          </label>
          <input
            type="date"
            id="dateOfBirth"
            name="dateOfBirth"
            value={formData.personalInfo.dateOfBirth}
            onChange={(e) => handleChange('dateOfBirth', e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className={`
              mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500
              ${errors.dateOfBirth ? 'border-red-300' : 'border-gray-300'}
            `}
          />
          {errors.dateOfBirth && (
            <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth}</p>
          )}
          {formData.personalInfo.dateOfBirth && (
            <p className="mt-1 text-xs text-gray-500">
              Age: {calculateAge(formData.personalInfo.dateOfBirth)} years
            </p>
          )}
        </div>

        {/* Place of Birth */}
        <div>
          <label htmlFor="placeOfBirth" className="block text-sm font-medium text-gray-700">
            {t('application.placeOfBirth')} *
          </label>
          <select
            id="placeOfBirth"
            name="placeOfBirth"
            value={formData.personalInfo.placeOfBirth}
            onChange={(e) => handleChange('placeOfBirth', e.target.value)}
            className={`
              mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500
              ${errors.placeOfBirth ? 'border-red-300' : 'border-gray-300'}
            `}
          >
            <option value="">{t('common.selectState')}</option>
            {sudaneseStates.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
            <option value="Other">{t('application.otherOutsideSudan')}</option>
          </select>
          {errors.placeOfBirth && (
            <p className="mt-1 text-sm text-red-600">{errors.placeOfBirth}</p>
          )}
        </div>

        {/* Gender */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            {t('application.gender')} *
          </label>
          <div className="space-y-2">
            {[
              { value: 'male', label: t('application.male') },
              { value: 'female', label: t('application.female') }
            ].map((gender) => (
              <div key={gender.value} className="flex items-center">
                <input
                  id={`gender_${gender.value}`}
                  name="gender"
                  type="radio"
                  value={gender.value}
                  checked={formData.personalInfo.gender === gender.value}
                  onChange={(e) => handleChange('gender', e.target.value)}
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <label htmlFor={`gender_${gender.value}`} className="ml-3 text-sm text-gray-700">
                  {gender.label}
                </label>
              </div>
            ))}
          </div>
          {errors.gender && (
            <p className="mt-2 text-sm text-red-600">{errors.gender}</p>
          )}
        </div>

        {/* Marital Status */}
        <div>
          <label htmlFor="maritalStatus" className="block text-sm font-medium text-gray-700">
            {t('application.maritalStatus')} *
          </label>
          <select
            id="maritalStatus"
            name="maritalStatus"
            value={formData.personalInfo.maritalStatus}
            onChange={(e) => handleChange('maritalStatus', e.target.value)}
            className={`
              mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500
              ${errors.maritalStatus ? 'border-red-300' : 'border-gray-300'}
            `}
          >
            <option value="">Select status</option>
            <option value="single">{t('application.single')}</option>
            <option value="married">{t('application.married')}</option>
            <option value="divorced">{t('application.divorced')}</option>
            <option value="widowed">{t('application.widowed')}</option>
          </select>
          {errors.maritalStatus && (
            <p className="mt-1 text-sm text-red-600">{errors.maritalStatus}</p>
          )}
        </div>

        {/* Profession */}
        <div>
          <label htmlFor="profession" className="block text-sm font-medium text-gray-700">
            {t('application.profession')} *
          </label>
          <input
            type="text"
            id="profession"
            name="profession"
            value={formData.personalInfo.profession}
            onChange={(e) => handleChange('profession', e.target.value)}
            placeholder="Engineer, Doctor, Teacher, etc."
            className={`
              mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500
              ${errors.profession ? 'border-red-300' : 'border-gray-300'}
            `}
          />
          {errors.profession && (
            <p className="mt-1 text-sm text-red-600">{errors.profession}</p>
          )}
        </div>

        {/* Nationality */}
        <div>
          <label htmlFor="nationality" className="block text-sm font-medium text-gray-700">
            {t('application.nationality')} *
          </label>
          <input
            type="text"
            id="nationality"
            name="nationality"
            value={formData.personalInfo.nationality}
            onChange={(e) => handleChange('nationality', e.target.value)}
            readOnly
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-700 cursor-not-allowed"
          />
          <p className="mt-1 text-xs text-gray-500">Fixed as Sudanese for Sudan passport applications</p>
        </div>
      </div>

      {/* Age Warning */}
      {formData.personalInfo.dateOfBirth && calculateAge(formData.personalInfo.dateOfBirth) < 16 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{t('application.ageRequirement')}</h3>
              <p className="mt-1 text-sm text-red-700">
                {t('application.ageRequirementDesc')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Information Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">{t('application.importantNotice')}</h3>
            <p className="mt-1 text-sm text-blue-700">
              {t('application.matchNationalId')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 