'use client'
import { FC, useState, useEffect } from 'react'
import { useMe } from '@/hooks/user';
import { CreateOrderForm } from '@/components/form'
import { OPTIONS_DELAY_ENUM, PRICING_PACKAGES, PADDLE_CLIENT_TOKEN } from '@/core/Constants'
import { DollarSign, Plus, Award, Ticket } from 'lucide-react'

// Declare Paddle types
declare global {
  interface Window {
    Paddle?: any;
  }
}

const CreditPage: FC<{}> = () => {
    const [paddleLoaded, setPaddleLoaded] = useState(false);
    const me = useMe();

    useEffect(() => {
        if (!me?.data){
            return;
        }
        // Load Paddle.js script
        const script = document.createElement('script');
        script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js';
        script.async = true;
        script.onload = () => {
            if (window.Paddle) {
                window.Paddle.Environment.set('sandbox');
                window.Paddle.Initialize({
                    token: PADDLE_CLIENT_TOKEN,
                    pwCustomer: 'ctm_'+me?.data?.id,
                   // environment: 'sandbox' // Change to 'production' when ready
                });
                setPaddleLoaded(true);
            }
        };
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, [me]);

    const handleAddNow = (pkg: typeof PRICING_PACKAGES[0]) => {
        if (!paddleLoaded || !window.Paddle) {
            console.error('Paddle is not loaded yet');
            return;
        }

        if (!me?.data?.id) {
            console.error('User data not available');
            return;
        }

        window.Paddle.Checkout.open({
            items: [
                {
                    priceId: pkg.paddle_price_id,
                    quantity: 1
                }
            ],
            customData: {
                user_id: me.data.id,
                credit_id: me.data.idcredit,
                packageId: pkg.id,
                credits: pkg.credit
            },
            settings: {
                successUrl: window.location.href,
            },
            eventCallback: (event: any) => {
                if (event.name === 'checkout.completed') {
                    // Payment completed successfully
                    console.log('Payment completed:', event.data);
                    // Close the checkout
                    window.Paddle.Checkout.close();
                    // Optionally refresh user data or show success message
                    window.location.reload();
                } else if (event.name === 'checkout.closed') {
                    console.log('Checkout closed');
                }
            }
        });
    };

    const getPackageIcon = (id: string) => {
        switch (id) {
            case 'starter_package':
                return <DollarSign className="w-8 h-8 text-primary-600" />;
            case 'standard_package':
                return <Plus className="w-8 h-8 text-primary-600" />;
            case 'expert_package':
                return <Award className="w-8 h-8 text-primary-600" />;
            default:
                return <Ticket className="w-8 h-8 text-primary-600" />;
        }
    };

    const getPackageDescription = (id: string) => {
        switch (id) {
            case 'starter_package':
                return 'Ideal for trying product with basic feature Have a quick start.';
            case 'standard_package':
                return 'Ideal for using all service with standard need & quality';
            case 'expert_package':
                return 'Best Price for professional using & share with your friend';
            default:
                return '';
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto px-4 py-8">
            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {PRICING_PACKAGES.map((pkg) => (
                    <div
                        key={pkg.id}
                        className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 p-6 flex flex-col"
                    >
                        {/* Icon */}
                        <div className="bg-primary-50 rounded-2xl w-16 h-16 flex items-center justify-center mb-4">
                            {getPackageIcon(pkg.id)}
                        </div>

                        {/* Package Name */}
                        <h3 className="text-xl font-semibold text-gray-900 mb-2 capitalize">
                            {pkg.name}
                        </h3>

                        {/* Description */}
                        <p className="text-sm text-gray-600 mb-6 flex-grow">
                            {getPackageDescription(pkg.id)}
                        </p>

                        {/* Pricing */}
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-gray-700 text-sm">Pay</span>
                            <span className="text-3xl font-bold text-gray-900">
                                ${pkg.price}
                            </span>
                            <span className="text-lg text-gray-400 line-through">
                                ${pkg.old_price}
                            </span>
                        </div>

                        {/* Credits */}
                        <div className="flex items-center gap-3 mb-6">
                            <span className="text-gray-700 text-sm">Receive</span>
                            <div className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-primary-500 rounded-full">
                                <Ticket className="w-5 h-5 text-primary-600" />
                                <span className="text-primary-600 font-semibold">
                                    {pkg.credit.toLocaleString()} Credit
                                </span>
                            </div>
                        </div>

                        {/* Add Now Button */}
                        <button
                            onClick={() => handleAddNow(pkg)}
                            disabled={!paddleLoaded}
                            className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                        >
                            Add Now
                        </button>
                    </div>
                ))}
            </div>

            {/* Refund Policy Section */}
            <div className="bg-primary-50 rounded-2xl p-8 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    Refund 100%
                </h2>
                <p className="text-gray-700 mb-2">
                    We commit to refund 100% of credit fee if the tool is not successful or not as committed.
                </p>
                <p className="text-gray-600">
                    For more information. View our{' '}
                    <a href="#" className="text-primary-600 hover:text-primary-700 font-medium">
                        Detail Policy
                    </a>
                </p>
            </div>
        </div>
    )
}

export default CreditPage;