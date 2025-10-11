'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useMyForms } from '@/hooks/form'
import { useMyOrders } from '@/hooks/order'
import { useMe } from '@/hooks/user'
import { ORDER_STATUS, OPTIONS_DELAY } from '@/core/Constants'
import { useRouter } from 'next/navigation';
import FormLists from '../_sections/FormLists'
import OrderLists from '../_sections/OrderLists'
const ITEMS_PER_PAGE = 10;

export default function HomePage() {


    const me = useMe();
    const router = useRouter()

    // Pagination calculations


    const handleNavigate = (path: string) => {
        router.push(path)
    }

    return (
        <section className="   ">
            <div className="container mx-auto space-y-8" data-aos="fade-up">
                {/* User Info */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Section - Greeting and CTA */}
                    <div className="lg:col-span-2 space-y-6">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900">Hi, {me?.data?.username}</h1>
                            <p className="text-gray-600 mt-2">Let's finish your survey & research!</p>
                        </div>
                        
                        <button     
                            onClick={() => handleNavigate('/form/create')}
                            className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span>Start Fill Survey</span>
                        </button>
                    </div>

                    {/* Right Section - User Info Card */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-6">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Credit Balance</p>
                            <p className="text-2xl font-bold text-gray-900">${(me?.data?.credit || 0).toLocaleString()}</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Role and Package</p>
                                <p className="text-base font-semibold text-gray-900">Normal User</p>
                            </div>
                            {/* <div>
                                <p className="text-sm text-gray-500 mb-1">User Id</p>
                                <p className="text-base font-semibold text-gray-900">{me?.data?.id || '-'}</p>
                            </div> */}
                        </div>
                    </div>
                </div>

                {/* Forms Table */}
                <FormLists />


                {/* Orders Table */}
                <OrderLists />
            </div>
        </section>
    )
}