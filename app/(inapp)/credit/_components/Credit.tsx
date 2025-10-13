'use client'
import { FC, useState } from 'react'
import { useMe } from '@/hooks/user';
import { CreateOrderForm } from '@/components/form'
import { OPTIONS_DELAY_ENUM } from '@/core/Constants'
import PricePackages from './PricePackages';

const CreditPage: FC<{}> = () => {

    const me = useMe();
    const [numRequest, setNumRequest] = useState<number>(0);
    const [delayType, setDelayType] = useState<number>(OPTIONS_DELAY_ENUM.NO_DELAY);
    const [disabledDays, setDisabledDays] = useState<number[]>([]);
    const [scheduleEnabled, setScheduleEnabled] = useState(false);
    const [startTime, setStartTime] = useState('08:00');
    const [endTime, setEndTime] = useState('20:00');

    return (
        <section className=" ">
            <div className=" relative isolate overflow-hidden">
                <div className="container mx-auto" data-aos="fade-up">
                    {/* Header */}

                    <div className="mb-8 text-left">
                        <h2 className="text-3xl font-bold mb-3">
                            Buy <span className="text-blue-600">The Credit</span>
                        </h2>
                        <p className="text-gray-600">
                            Choose the package you want to buy, your current credit is {me?.data?.credit.toLocaleString()}
                        </p>
                    </div>


                    <PricePackages />

                    {/* Payment Information */}
                    <div className="bg-white shadow-sm rounded-lg border border-gray-100 mb-6">
                        <div className="p-6">
                            <div className="mb-6">
                                <p className="text-gray-700 mb-4">
                                    Please transfer <span className="font-bold">correctly the content of the transfer</span> below the system will automatically add money to you after 1 - 3 minutes after receiving the money.<br />
                                    After seeing the account transfer money successfully, try <span className="font-bold">Logout and Login again</span> to check the balance of Survify! <br />
                                    If after 10 minutes from when the money in your account is deducted but still not added money please contact support.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <CreateOrderForm
                                    userCredit={me?.data?.credit || 0}
                                    numRequest={numRequest}
                                    delayType={delayType}
                                    disabledDays={disabledDays}
                                    scheduleEnabled={scheduleEnabled}
                                    startTime={startTime}
                                    endTime={endTime}
                                    onNumRequestChange={setNumRequest}
                                    onDelayTypeChange={setDelayType}
                                    onScheduleEnabledChange={setScheduleEnabled}
                                    onStartTimeChange={setStartTime}
                                    onEndTimeChange={setEndTime}
                                    onDisabledDaysChange={setDisabledDays}
                                    className="flex flex-col justify-center bg-gray-50 p-4 rounded-lg"
                                    showTitle={false}
                                    showBackButton={false}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Important Notes */}
                    <div className="border border-gray-100 rounded-lg overflow-hidden mb-6">
                        <h3 className="text-xl font-bold p-4 bg-gray-50 border-b border-gray-100">IMPORTANT NOTES</h3>

                        <div className="p-6">
                            <ul className="list-disc pl-5 space-y-2 text-gray-700">
                                <li>Survify will refund 100% if the tool fails / the service is not used successfully.</li>
                                <li>Minimum deposit: 10,000 Credits. Intentionally depositing below the minimum amount is not supported under any circumstances.</li>
                                <li>Please contact support with the transfer receipt and login name to receive support.</li>
                                <li>Only support transactions that are deposited incorrectly within 30 days from the transfer date. After 30 days, KHÔNG xử lý under any circumstances!</li>
                                <li>Transfer money as soon as possible 24/7 to receive money immediately after a few minutes. In case of slow transfer, money will be added after the bank processes the transaction.</li>
                                <li>Transfer history data may be automatically deleted after 30 days from the transfer date!</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default CreditPage