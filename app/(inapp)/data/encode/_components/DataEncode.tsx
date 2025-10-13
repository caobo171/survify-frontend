'use client'

import { useState } from 'react'
import { Controller, SubmitHandler, useForm } from 'react-hook-form'
import { XCircle } from 'lucide-react'
import { z } from 'zod'

import { Button, Input } from '@/components/common'
import { FormItem, InlineFormItem } from '@/components/form/FormItem'
import Fetch from '@/lib/core/fetch/Fetch'
import { Helper } from '@/services/Helper'
import { CSVLink } from 'react-csv'
import LoadingAbsolute from '@/components/loading'
import { Toast } from '@/services/Toast'
import { AnyObject } from '@/store/interface'

const formCreateSchema = z.object({
    form_link: z.string().min(1, 'Vui lòng nhập đường dẫn edit form!'),
    sheet_data_link: z.string().min(1, 'Vui lòng nhập đường dẫn sheet data!'),
});

type CreateFormValues = z.infer<typeof formCreateSchema>;

export default function DataEncode() {
    const [loading, setLoading] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>();
    const [sheetData, setSheetData] = useState<{
        data: any,
        headers: any,
        name: string,
    }>({
        data: [],
        headers: [],
        name: '',
    });

    const {
        control,
        handleSubmit,
        formState: { isSubmitting, errors },
    } = useForm<CreateFormValues>();

    const onSubmit: SubmitHandler<CreateFormValues> = async (formData) => {
        const { form_link, sheet_data_link } = formData;

        if (!form_link || !sheet_data_link) {
            setErrorMessage('Vui lòng nhập đầy đủ thông tin!');
            return;
        }

        setLoading(true);

        try {
            const res = await Fetch.postWithAccessToken<{
                data: any,
                form: any,
                sheet: any,
                name: string,
            }>('/api/form/data.encode', {
                form_link,
                sheet_data_link,
            });

            const data = res.data.data;
            const form = res.data.form;
            const sheet = res.data.sheet;

            let headers: AnyObject = {};
            for (let i = 0; i < data[0].length; i++) {
                headers[data[0][i]] = data[0][i];
            }

            let rows: AnyObject[] = [];
            for (let row_index = 1; row_index < data.length; row_index++) {
                let row: AnyObject = {};
                for (let col_index = 0; col_index < data[0].length; col_index++) {
                    row[data[0][col_index]] = data[row_index][col_index];
                }
                rows.push(row);
            }

            Helper.exportCSVFile(headers, rows, Helper.purify(res.data.name));
            Toast.success('Mã hóa dữ liệu thành công!');

        } catch (e) {
            setErrorMessage('Đã xảy ra lỗi! Hãy kiểm tra quyền truy cập của form và sheet của bạn.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className=" ">
            <div className=" relative isolate overflow-hidden">
                {loading && <LoadingAbsolute />}

                <div className="container mx-auto" data-aos="fade-up">
                    {/* Header */}


                    <div className="mb-8 text-left">
                        <h2 className="text-3xl font-bold mb-3">
                            Encode data <span className="text-blue-600">from existing results</span>
                        </h2>
                        <p className="text-gray-600">
                            Enter link edit form and link sheet data into the box below. Remember to open access to both sheet and form.
                        </p>
                    </div>

                    {/* Form Section */}
                    <div className="bg-white shadow-sm rounded-lg border border-gray-100 mb-6">
                        <form
                            onSubmit={handleSubmit(onSubmit)}
                            className="p-6"
                        >
                            <InlineFormItem
                                label="Enter Edit Link Form"
                                className="mb-6"
                                error={errors.form_link?.message}
                            >
                                <Controller
                                    render={({ field }) => (
                                        <Input
                                            placeholder='Enter form edit link here'
                                            className="w-full"
                                            type="text"
                                            {...field}
                                            size="large"
                                            state={errors.form_link ? 'error' : 'normal'}
                                        />
                                    )}
                                    name="form_link"
                                    control={control}
                                />
                            </InlineFormItem>
                            <InlineFormItem
                                label="Enter Link sheet data"
                                className="mb-6"
                                error={errors.sheet_data_link?.message}
                            >
                                <Controller
                                    render={({ field }) => (
                                        <Input
                                            placeholder='Enter sheet data link here'
                                            className="w-full"
                                            type="text"
                                            {...field}
                                            size="large"
                                            state={errors.sheet_data_link ? 'error' : 'normal'}
                                        />
                                    )}
                                    name="sheet_data_link"
                                    control={control}
                                />
                            </InlineFormItem>

                            <Button
                                className="uppercase items-center mt-4 w-full block text-center py-3 px-4 bg-primary-600 text-white font-bold rounded-md hover:bg-primary-700 transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                                size="large"
                                loading={isSubmitting || loading}
                                htmlType="submit"
                            >
                                <span>Encode data now</span>
                            </Button>

                            <CSVLink
                                data={sheetData.data}
                                headers={sheetData.headers}
                                filename={`${Helper.purify(sheetData.name)}_result.csv`}
                                className="hidden"
                            ></CSVLink>
                        </form>

                        {/* Alert Message */}
                        {errorMessage && (
                            <div className="px-6">
                                <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded text-center flex items-center gap-2 justify-center">
                                    <XCircle className="w-5 h-5 flex-shrink-0" />
                                    <span>{errorMessage}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Guide Section */}
                    <div className="space-y-12">
                        <div className="border border-gray-100 rounded-lg overflow-hidden">
                            <h3 className="text-xl font-bold p-4 bg-gray-50 border-b border-gray-100">Usage Guide</h3>

                            <div className="p-6">
                                <div className="space-y-4">
                                    <p className="font-medium text-gray-900">To encode data from a form:</p>
                                    <ol className="list-decimal pl-5 space-y-2 text-gray-700">
                                        <li>Enter the edit form link of your form (URL ends with /edit)</li>
                                        <li>Enter the Google Sheet link containing form data</li>
                                        <li>Grant access to both form and sheet so the system can read the data</li>
                                        <li>Click "Encode data now" to proceed with encoding</li>
                                        <li>File CSV result will be downloaded to your device</li>
                                    </ol>

                                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-blue-800 mt-4">
                                        <p>
                                            <strong className="text-blue-600">Note: </strong>
                                            File CSV created will contain encoded data, helping you fill out the form faster with Survify.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}