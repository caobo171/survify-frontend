'use client'

import Fetch from '@/lib/core/fetch/Fetch'
import { mutate } from 'swr'
import { useState } from 'react'
import { Loader2 } from 'lucide-react';
import { Code, MIN_DRAW_CREDIT, REFER_PERCENT } from '@/core/Constants';
import { Toast } from '@/services/Toast';

export default function AffiliateComponent() {

  const [loading, setLoading] = useState(false);

  const handleRegisterPartner = async () => {
    // Implement the registration logic here
    console.log('Register as partner');
    setLoading(true);
    const res = await Fetch.postWithAccessToken<any>('/api/affiliate/register', {});
    //console.log(res);
    // You might want to redirect to a registration form or show a modal
    if (res.data.code == Code.SUCCESS) {
      
      Toast.success('Register as partner successfully');
    } else {
      Toast.error(res.data.message);
    }

    mutate('/api/me/profile');
    setLoading(false);
  }

  return (
    <section className="  py-12 px-4 sm:px-6 mx-auto">
      <div className="max-w-2xl mx-auto" data-aos="fade-up">
        {/* Affiliate Program Information */}
        <div className="bg-white rounded-xl p-8 shadow-md border border-gray-100">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-3">Affiliate Program Information</h1>
            <p className="text-gray-600">The benefits may change depending on the business</p>
          </div>

          <div className="space-y-8">
            <div className="bg-primary-50 p-5 rounded-lg border-l-4 border-primary-500">
              <h2 className="text-xl font-semibold mb-3 text-primary-700">Your benefits:</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Only affiliate with new accounts introduced.</li>
                <li>Survify will give you <span className="font-semibold text-primary-600">{REFER_PERCENT}%</span> on each deposit/transaction of the person introduced.</li>
                <li>The commission must reach <span className="font-semibold text-primary-600">{MIN_DRAW_CREDIT.toLocaleString()} Credits</span> before withdrawal.</li>
                <li>Accounts registered again or abuse, spam will be rejected.</li>
              </ul>
            </div>

            <div className="bg-green-50 p-5 rounded-lg border-l-4 border-green-500">
              <h2 className="text-xl font-semibold mb-3 text-green-700">Benefits of your introduced friends:</h2>
              <ul className="list-disc pl-6 text-gray-700">
                <li>Get <span className="font-semibold text-green-600">5000 credit</span> immediately into the new account.</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={handleRegisterPartner}
              disabled={loading}
              className="inline-flex items-center justify-center px-8 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-all font-bold shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                  <span>Loading...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Register as partner</span>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
