export default function PersonalInfoStep({ formData, updateFormData, errors }) {
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
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Personal Information</h2>
        <p className="text-gray-600">Enter your personal details as they appear on your national ID.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* First Name */}
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
            First Name *
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
            Last Name *
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
            Fathers Name *
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
            Grandfathers Name *
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
            Mothers Name *
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
            National ID Number *
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
          <p className="mt-1 text-xs text-gray-500">10-digit Sudan National ID number</p>
          {errors.nationalId && (
            <p className="mt-1 text-sm text-red-600">{errors.nationalId}</p>
          )}
          {formData.personalInfo.nationalId && !validateNationalId(formData.personalInfo.nationalId) && (
            <p className="mt-1 text-sm text-red-600">National ID must be exactly 10 digits</p>
          )}
        </div>

        {/* Date of Birth */}
        <div>
          <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
            Date of Birth *
          </label>
          <input
            type="date"
            id="dateOfBirth"
            name="dateOfBirth"
            value={formData.personalInfo.dateOfBirth}
            onChange={(e) => handleChange('dateOfBirth', e.target.value)}
            max={new Date(Date.now() - 16 * 365.25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]} // Minimum 16 years old
            className={`
              mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500
              ${errors.dateOfBirth ? 'border-red-300' : 'border-gray-300'}
            `}
          />
          {formData.personalInfo.dateOfBirth && (
            <p className="mt-1 text-xs text-gray-500">
              Age: {calculateAge(formData.personalInfo.dateOfBirth)} years
            </p>
          )}
          {errors.dateOfBirth && (
            <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth}</p>
          )}
        </div>

        {/* Place of Birth */}
        <div>
          <label htmlFor="placeOfBirth" className="block text-sm font-medium text-gray-700">
            Place of Birth *
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
            <option value="">Select state</option>
            {sudaneseStates.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
            <option value="Other">Other (Outside Sudan)</option>
          </select>
          {errors.placeOfBirth && (
            <p className="mt-1 text-sm text-red-600">{errors.placeOfBirth}</p>
          )}
        </div>

        {/* Gender */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Gender *
          </label>
          <div className="flex space-x-4">
            <div className="flex items-center">
              <input
                id="gender_male"
                name="gender"
                type="radio"
                value="male"
                checked={formData.personalInfo.gender === 'male'}
                onChange={(e) => handleChange('gender', e.target.value)}
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <label htmlFor="gender_male" className="ml-3 text-sm text-gray-700">
                Male
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="gender_female"
                name="gender"
                type="radio"
                value="female"
                checked={formData.personalInfo.gender === 'female'}
                onChange={(e) => handleChange('gender', e.target.value)}
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <label htmlFor="gender_female" className="ml-3 text-sm text-gray-700">
                Female
              </label>
            </div>
          </div>
          {errors.gender && (
            <p className="mt-2 text-sm text-red-600">{errors.gender}</p>
          )}
        </div>

        {/* Marital Status */}
        <div>
          <label htmlFor="maritalStatus" className="block text-sm font-medium text-gray-700">
            Marital Status *
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
            <option value="single">Single</option>
            <option value="married">Married</option>
            <option value="divorced">Divorced</option>
            <option value="widowed">Widowed</option>
          </select>
          {errors.maritalStatus && (
            <p className="mt-1 text-sm text-red-600">{errors.maritalStatus}</p>
          )}
        </div>

        {/* Profession */}
        <div>
          <label htmlFor="profession" className="block text-sm font-medium text-gray-700">
            Profession/Occupation *
          </label>
          <input
            type="text"
            id="profession"
            name="profession"
            value={formData.personalInfo.profession}
            onChange={(e) => handleChange('profession', e.target.value)}
            placeholder="e.g., Engineer, Teacher, Student"
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
            Nationality *
          </label>
          <select
            id="nationality"
            name="nationality"
            value={formData.personalInfo.nationality}
            onChange={(e) => handleChange('nationality', e.target.value)}
            className={`
              mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500
              ${errors.nationality ? 'border-red-300' : 'border-gray-300'}
            `}
          >
            <option value="Sudanese">Sudanese</option>
            <option value="Dual Citizen">Dual Citizen</option>
            <option value="Other">Other</option>
          </select>
          {errors.nationality && (
            <p className="mt-1 text-sm text-red-600">{errors.nationality}</p>
          )}
        </div>
      </div>

      {/* Age Validation Warning */}
      {formData.personalInfo.dateOfBirth && calculateAge(formData.personalInfo.dateOfBirth) < 16 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Age Requirement</h3>
              <p className="mt-1 text-sm text-red-700">
                Applicants must be at least 16 years old to apply for a passport. For minors under 16, 
                a guardian must apply on their behalf with additional documentation.
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
            <h3 className="text-sm font-medium text-blue-800">Important Notice</h3>
            <p className="mt-1 text-sm text-blue-700">
              All information must match exactly with your National ID card. Any discrepancies may cause delays 
              in processing your application. Make sure to double-check all entries before proceeding.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 