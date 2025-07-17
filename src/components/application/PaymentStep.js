'use client';

import { useState } from 'react';

export default function PaymentStep({ formData, updateFormData, errors }) {
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');

  // Calculate fees
  const baseFee = 150.00;
  const expressFee = formData.processingSpeed === 'express' ? 75.00 : 0.00;
  const serviceFee = 25.00;
  const totalFee = baseFee + expressFee + serviceFee;

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
    updateFormData({ paymentMethod: method });
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock payment success
      const paymentResult = {
        paymentId: `PAY_${Date.now()}`,
        transactionId: `TXN_${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        status: 'completed',
        amount: totalFee,
        currency: 'USD',
        paymentMethod: paymentMethod,
        processedAt: new Date().toISOString()
      };

      updateFormData({ 
        payment: paymentResult,
        paymentCompleted: true 
      });

      // Send payment confirmation email (optional - could be done on backend)
      try {
        await fetch('/api/send-payment-confirmation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            payment: paymentResult,
            applicationNumber: formData.applicationNumber || 'PENDING'
          })
        });
      } catch (emailError) {
        console.error('Failed to send payment confirmation email:', emailError);
        // Don't fail payment on email error
      }

    } catch (error) {
      console.error('Payment error:', error);
      updateFormData({ 
        paymentError: error.message || 'Payment failed',
        paymentCompleted: false 
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Payment</h2>
        <p className="text-gray-600">
          Complete your payment to submit your passport application.
        </p>
      </div>

      {/* Fee Breakdown */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Fee Breakdown</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Base Processing Fee</span>
            <span className="font-medium">${baseFee.toFixed(2)}</span>
          </div>
          {expressFee > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Express Processing Fee</span>
              <span className="font-medium">${expressFee.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Service Fee</span>
            <span className="font-medium">${serviceFee.toFixed(2)}</span>
          </div>
          <div className="border-t border-gray-300 pt-3">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">Total Amount</span>
              <span className="text-xl font-bold text-blue-600">${totalFee.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Status */}
      {formData.paymentCompleted && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Payment Successful</h3>
              <div className="mt-2 text-sm text-green-700">
                <p>Payment ID: {formData.payment?.paymentId}</p>
                <p>Transaction ID: {formData.payment?.transactionId}</p>
                <p>Amount: ${formData.payment?.amount?.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {formData.paymentError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Payment Failed</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{formData.paymentError}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Form */}
      {!formData.paymentCompleted && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Method</h3>
          
          {/* Payment Method Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[
              {
                id: 'card',
                title: 'Credit/Debit Card',
                description: 'Visa, Mastercard, American Express',
                icon: '💳'
              },
              {
                id: 'bank',
                title: 'Bank Transfer',
                description: 'Direct bank transfer',
                icon: '🏦'
              },
              {
                id: 'mobile',
                title: 'Mobile Payment',
                description: 'Mobile wallet payment',
                icon: '📱'
              }
            ].map((method) => (
              <div
                key={method.id}
                className={`
                  relative border-2 rounded-lg p-4 cursor-pointer transition-all duration-200
                  ${paymentMethod === method.id
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                  }
                `}
                onClick={() => handlePaymentMethodChange(method.id)}
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.id}
                    checked={paymentMethod === method.id}
                    onChange={() => handlePaymentMethodChange(method.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{method.icon}</span>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{method.title}</h4>
                        <p className="text-sm text-gray-500">{method.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Payment Form */}
          <form onSubmit={handlePaymentSubmit} className="space-y-4">
            {paymentMethod === 'card' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Card Number
                  </label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CVV
                  </label>
                  <input
                    type="text"
                    placeholder="123"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            )}

            {paymentMethod === 'bank' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Bank Transfer Instructions</h4>
                <div className="text-sm text-blue-700">
                  <p>Account Name: Sudan Passport Office</p>
                  <p>Account Number: 123456789012</p>
                  <p>Bank: Central Bank of Sudan</p>
                  <p>Reference: Include your application number</p>
                </div>
              </div>
            )}

            {paymentMethod === 'mobile' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile Number
                </label>
                <input
                  type="text"
                  placeholder="+249 123 456 789"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            )}

            <button
              type="submit"
              disabled={processing}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing Payment...
                </div>
              ) : (
                `Pay $${totalFee.toFixed(2)}`
              )}
            </button>
          </form>
        </div>
      )}

      {/* Security Notice */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-gray-800">Secure Payment</h3>
            <p className="text-sm text-gray-600 mt-1">
              Your payment information is encrypted and secure. We do not store your card details.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 