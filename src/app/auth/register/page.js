'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    nationalId: '',
    phoneNumber: '+249',
    dateOfBirth: '',
    password: '',
    confirmPassword: '',
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: ''
    },
    agreeToTerms: false
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  
  const router = useRouter();

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';

    // Email validation
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // National ID validation (Sudan format - 10 digits)
    const nationalIdRegex = /^[0-9]{10}$/;
    if (!formData.nationalId) {
      newErrors.nationalId = 'National ID is required';
    } else if (!nationalIdRegex.test(formData.nationalId)) {
      newErrors.nationalId = 'National ID must be exactly 10 digits';
    }

    // Phone validation (Sudan format)
    const phoneRegex = /^\+249[0-9]{9}$/;
    if (!formData.phoneNumber || formData.phoneNumber === '+249') {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!phoneRegex.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Phone number must be in format +249xxxxxxxxx';
    }

    // Date of birth validation
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 18) {
        newErrors.dateOfBirth = 'You must be at least 18 years old';
      }
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Address validation
    if (!formData.address.street.trim()) newErrors['address.street'] = 'Street address is required';
    if (!formData.address.city.trim()) newErrors['address.city'] = 'City is required';
    if (!formData.address.state.trim()) newErrors['address.state'] = 'State is required';

    // Terms validation
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Account created successfully! Please check your email to verify your account.');
        setTimeout(() => {
          router.push('/auth/login');
        }, 3000);
      } else {
        setErrors({ submit: data.error || 'Registration failed' });
      }
    } catch (error) {
      setErrors({ submit: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sudan-red/10 via-white to-sudan-blue/10 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-sudan-red w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-3xl font-bold">🇸🇩</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Register for Passport Services
          </h1>
          <p className="text-gray-600">
            Create your account to apply for passport renewal
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-600 text-sm">{success}</p>
          </div>
        )}

        {/* Error Message */}
        {errors.submit && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{errors.submit}</p>
          </div>
        )}

        {/* Registration Form */}
        <div className="card-sudan p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    name="firstName"
                    type="text"
                    required
                    className={`input-sudan ${errors.firstName ? 'border-red-500' : ''}`}
                    value={formData.firstName}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    name="lastName"
                    type="text"
                    required
                    className={`input-sudan ${errors.lastName ? 'border-red-500' : ''}`}
                    value={formData.lastName}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    National ID *
                  </label>
                  <input
                    name="nationalId"
                    type="text"
                    required
                    placeholder="10 digits"
                    maxLength="10"
                    className={`input-sudan ${errors.nationalId ? 'border-red-500' : ''}`}
                    value={formData.nationalId}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  {errors.nationalId && <p className="text-red-500 text-xs mt-1">{errors.nationalId}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth *
                  </label>
                  <input
                    name="dateOfBirth"
                    type="date"
                    required
                    className={`input-sudan ${errors.dateOfBirth ? 'border-red-500' : ''}`}
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  {errors.dateOfBirth && <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    name="email"
                    type="email"
                    required
                    className={`input-sudan ${errors.email ? 'border-red-500' : ''}`}
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    name="phoneNumber"
                    type="tel"
                    required
                    placeholder="+249xxxxxxxxx"
                    className={`input-sudan ${errors.phoneNumber ? 'border-red-500' : ''}`}
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Address</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address *
                  </label>
                  <input
                    name="address.street"
                    type="text"
                    required
                    className={`input-sudan ${errors['address.street'] ? 'border-red-500' : ''}`}
                    value={formData.address.street}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  {errors['address.street'] && <p className="text-red-500 text-xs mt-1">{errors['address.street']}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      name="address.city"
                      type="text"
                      required
                      className={`input-sudan ${errors['address.city'] ? 'border-red-500' : ''}`}
                      value={formData.address.city}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                    {errors['address.city'] && <p className="text-red-500 text-xs mt-1">{errors['address.city']}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State *
                    </label>
                    <input
                      name="address.state"
                      type="text"
                      required
                      className={`input-sudan ${errors['address.state'] ? 'border-red-500' : ''}`}
                      value={formData.address.state}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                    {errors['address.state'] && <p className="text-red-500 text-xs mt-1">{errors['address.state']}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Postal Code
                    </label>
                    <input
                      name="address.postalCode"
                      type="text"
                      className="input-sudan"
                      value={formData.address.postalCode}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Security */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Security</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password *
                  </label>
                  <input
                    name="password"
                    type="password"
                    required
                    className={`input-sudan ${errors.password ? 'border-red-500' : ''}`}
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                  <p className="text-gray-500 text-xs mt-1">Must be at least 8 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password *
                  </label>
                  <input
                    name="confirmPassword"
                    type="password"
                    required
                    className={`input-sudan ${errors.confirmPassword ? 'border-red-500' : ''}`}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div>
              <div className="flex items-start">
                <input
                  name="agreeToTerms"
                  type="checkbox"
                  className={`h-4 w-4 text-sudan-red focus:ring-sudan-red border-gray-300 rounded mt-1 ${errors.agreeToTerms ? 'border-red-500' : ''}`}
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                <label className="ml-2 block text-sm text-gray-700">
                  I agree to the{' '}
                  <Link href="/terms" className="text-sudan-red hover:text-sudan-red/80">
                    Terms and Conditions
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-sudan-red hover:text-sudan-red/80">
                    Privacy Policy
                  </Link>
                </label>
              </div>
              {errors.agreeToTerms && <p className="text-red-500 text-xs mt-1">{errors.agreeToTerms}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-sudan w-full"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating Account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-sudan-red hover:text-sudan-red/80 font-medium">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 