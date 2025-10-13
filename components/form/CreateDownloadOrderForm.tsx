import React, { useEffect, useState } from 'react';
import PaymentInformation from '../common/PaymentInformation';
import Link from 'next/link';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import { useMe } from '@/hooks/user';
import { MODERATE_VARIABLE_PRICE, MEDIATOR_VARIABLE_PRICE, DEPENDENT_VARIABLE_PRICE, INDEPENDENT_VARIABLE_PRICE, READ_RESULT_PRICE } from '@/core/Constants';
import PricePackages from '@/app/(inapp)/credit/_components/PricePackages';

interface CreateDownloadOrderFormProps {
    userCredit: number;
    numRequest: number;
    modelId?: string;
    modelName?: string;
    bankInfo?: any;
    onNumRequestChange: (value: number) => void;
    className?: string;
    showTitle?: boolean;
    showBackButton?: boolean;
    numModerateVariables?: number;
    numMediatorVariables?: number;
    numIndependentVariables?: number;
    numDependentVariables?: number;
    hidePayment?: boolean;
    isReadingAnalysisResult?: boolean;
    onIsReadingAnalysisResultChange?: (value: boolean) => void;
}


const CreateDownloadOrderForm: React.FC<CreateDownloadOrderFormProps> = ({
    userCredit,
    numRequest,
    bankInfo,
    modelId,
    modelName,
    onNumRequestChange,
    numModerateVariables,
    numMediatorVariables,
    numIndependentVariables,
    numDependentVariables,
    isReadingAnalysisResult,
    onIsReadingAnalysisResultChange,

    className = '',
    showTitle = true,
    showBackButton = true,
    hidePayment = false,
}) => {
    const user = useMe();
    const [total, setTotal] = useState<number>(0);

    const isSPSSModel = (numModerateVariables || 0) <= 0 && (numMediatorVariables || 0) <= 0 && (numIndependentVariables || 0) > 1 && (numDependentVariables || 0) == 1;

    // Calculate price based on variable types and counts
    useEffect(() => {
        let totalPrice = 0;

        // Calculate price based on each variable type
        totalPrice += (numModerateVariables || 0) * MODERATE_VARIABLE_PRICE;
        totalPrice += (numMediatorVariables || 0) * MEDIATOR_VARIABLE_PRICE;
        totalPrice += (numIndependentVariables || 0) * INDEPENDENT_VARIABLE_PRICE;
        totalPrice += (numDependentVariables || 0) * DEPENDENT_VARIABLE_PRICE;

        // Add Vietnamese SPSS result fee if selected
        if (isSPSSModel && isReadingAnalysisResult) {
            totalPrice += READ_RESULT_PRICE;
        }

        setTotal(totalPrice);
    }, [numModerateVariables, numMediatorVariables, numIndependentVariables, numDependentVariables, isReadingAnalysisResult, isSPSSModel]);





    const insufficientFunds = total > userCredit;

    return (
        <div className={`${className} relative px-3`}>
            {modelId && showBackButton && (
                <Link
                    href={`/data/builder/${modelId}`}
                    className="absolute top-0 left-0 text-gray-600 hover:text-gray-800 p-2"
                    aria-label="Back"
                >
                    <ChevronLeftIcon className="w-6 h-6" />
                </Link>
            )}
            {showTitle && (
                <>
                    <h3 className="text-xl sm:text-2xl font-bold mb-2 mt-2 sm:mt-0 text-right sm:text-center">Download data for model</h3>
                    {modelName && <h6 className="text-sm text-gray-500 mb-4 text-center">{modelName}</h6>}
                </>
            )}
            <div className="text-left">
                <div className="mb-3 flex flex-col sm:flex-row items-start sm:items-center">
                    <label htmlFor="credit" className="w-full sm:w-1/2 font-sm mb-2 sm:mb-0 text-gray-700">Account balance:</label>
                    <div className="w-full sm:w-1/2 p-2 rounded">
                        <input type="text" readOnly className="bg-transparent w-full sm:text-right font-bold" id="credit" value={userCredit.toLocaleString() + ' Credits'} />
                    </div>
                </div>
                <div className="mb-3 flex flex-col sm:flex-row items-start sm:items-center">
                    <label htmlFor="num_request" className="w-full sm:w-1/2 font-sm mb-2 sm:mb-0 text-gray-700">Number of samples:</label>
                    <div className="w-full sm:w-1/2">
                        <input
                            type="number"
                            required
                            className="w-full border border-primary-500 rounded px-3 py-2 text-right font-bold"
                            id="num_request"
                            name="num_request"
                            value={numRequest}
                            onChange={(e) => onNumRequestChange(parseInt(e.target.value) || 0)}
                            min="0"
                        />
                    </div>
                </div>

                {/* Vietnamese SPSS analysis result option */}
                {isSPSSModel && (
                    <div className="mb-3 flex flex-col sm:flex-row items-start sm:items-center">
                        <label htmlFor="vn-spss-result-download" className="w-full sm:w-1/2 font-sm mb-2 sm:mb-0 text-gray-700">Receive SPSS analysis result:</label>
                        <div className="w-full sm:w-1/2">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="vn-spss-result-download"
                                    checked={isReadingAnalysisResult || false}
                                    onChange={(e) => {
                                        if (onIsReadingAnalysisResultChange) {
                                            onIsReadingAnalysisResultChange(e.target.checked);
                                        }
                                    }}
                                    className="h-4 w-4 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="vn-spss-result-download" className="ml-2 text-sm text-gray-700">
                                    <span className="block text-xs text-gray-500">Tick to receive PDF (+{READ_RESULT_PRICE.toLocaleString()} Credits fixed fee)</span>
                                </label>
                            </div>
                        </div>
                    </div>
                )}

            </div>

            {!hidePayment && (
                <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-lg p-6 my-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row items-center justify-between border-b border-blue-200 pb-4 mb-4">
                        <h3 className="text-lg sm:text-xl font-bold">Total:</h3>
                        <div className="text-2xl font-bold text-blue-700">{total.toLocaleString()} Credits</div>
                    </div>

                    {/* Pricing Breakdown */}
                    <div className="bg-white rounded-lg p-4 mb-3 border border-blue-100">
                        <h4 className="font-medium text-blue-800 mb-3">Price breakdown:</h4>
                        <div className="bg-gray-50 p-3 rounded-lg mb-4">
                            {(numModerateVariables || 0) > 0 && (
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-gray-600">
                                        Moderate variables ({numModerateVariables} × {MODERATE_VARIABLE_PRICE.toLocaleString()}):
                                    </span>
                                    <span className="font-medium">
                                        {((numModerateVariables || 0) * MODERATE_VARIABLE_PRICE).toLocaleString()} Credits
                                    </span>
                                </div>
                            )}
                            {(numMediatorVariables || 0) > 0 && (
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-gray-600">
                                        Mediator variables ({numMediatorVariables} × {MEDIATOR_VARIABLE_PRICE.toLocaleString()}):
                                    </span>
                                    <span className="font-medium">
                                        {((numMediatorVariables || 0) * MEDIATOR_VARIABLE_PRICE).toLocaleString()} Credits
                                    </span>
                                </div>
                            )}
                            {(numIndependentVariables || 0) > 0 && (
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-gray-600">
                                        Independent variables ({numIndependentVariables} × {INDEPENDENT_VARIABLE_PRICE.toLocaleString()}):
                                    </span>
                                    <span className="font-medium">
                                        {((numIndependentVariables || 0) * INDEPENDENT_VARIABLE_PRICE).toLocaleString()} Credits
                                    </span>
                                </div>
                            )}
                            {(numDependentVariables || 0) > 0 && (
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-gray-600">
                                        Dependent variables ({numDependentVariables} × {DEPENDENT_VARIABLE_PRICE.toLocaleString()}):
                                    </span>
                                    <span className="font-medium">
                                        {((numDependentVariables || 0) * DEPENDENT_VARIABLE_PRICE).toLocaleString()} Credits
                                    </span>
                                </div>
                            )}

                            {/* Vietnamese SPSS result add-on breakdown */}
                            {isSPSSModel && isReadingAnalysisResult && (
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-gray-600">Analysis result (fixed fee):</span>
                                    <span className="font-medium text-purple-700">+{READ_RESULT_PRICE.toLocaleString()} Credits</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {insufficientFunds && (
                        <div className="mt-4 p-4 bg-white rounded-lg border border-red-100">
                            <div className="p-3 bg-red-100 text-red-700 rounded-lg mb-4 text-center font-sm">
                                ❌ You don't have enough credits, please recharge to continue!
                            </div>
                            <h4 className="text-lg font-bold mb-3 text-center">Please recharge <span className="text-red-600">{(total - userCredit).toLocaleString()} Credits</span> to continue</h4>

                            {bankInfo && (
                                <PricePackages
                                />
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CreateDownloadOrderForm;
