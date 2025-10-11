'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Controller, useForm } from 'react-hook-form'
import { XCircle } from 'lucide-react'
import { z } from 'zod'

import Fetch from '@/lib/core/fetch/Fetch'
import { Toast } from '@/services/Toast'
import LoadingAbsolute from '@/components/loading'
import { Button, Input } from '@/components/common'
import { FormItem, InlineFormItem } from '@/components/form/FormItem'
import Meta from '@/components/ui/Meta'

const formCreateSchema = z.object({
    form_link: z.string().min(1, 'Vui lòng nhập đường dẫn edit form!'),
});

type CreateFormValues = z.infer<typeof formCreateSchema>;

export default function FormCreate() {
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(false);
    const [msg, setMsg] = useState<string>('');
    const [isViewFormLink, setIsViewFormLink] = useState<boolean>(false);

    const {
        control,
        handleSubmit,
        watch,
        formState: { isSubmitting, errors },
    } = useForm<CreateFormValues>();

    const formLink = watch('form_link');

    useEffect(() => {
        if (formLink && formLink?.includes('/viewform')) {
            setIsViewFormLink(true);
        } else {
            setIsViewFormLink(false);
            setMsg('');
        }
    }, [formLink]);

    const onSubmit = async (formData: CreateFormValues) => {
        if (!formData?.form_link) {
            setMsg('Vui lòng nhập đường dẫn edit form!');
            return;
        }

        if (formData?.form_link.includes('/viewform')) {
            setMsg('Bạn đang sử dụng link xem form (/viewform). Vui lòng sử dụng link edit form (/edit) thay thế!');
            return;
        }

        setLoading(true);

        try {
            const res: any = await Fetch.postWithAccessToken('/api/form/create', {
                form_link: formData?.form_link,
            });

            if (res.data?.form) {
                Toast.success('Tạo form thành công!');
                router.push(`/form/${res.data?.form?.id}`);
            }
        } catch (e) {
            setMsg(`Đã xảy ra lỗi, bạn hãy kiểm tra xem form đã được mở quyền truy cập cho tất có mọi người có link và tắt thu thập email, tắt cho phép chỉnh sửa câu trả lời và phải tắt mỗi mail chỉ điền 1 lần hay chưa nha ! 
                Một số câu hỏi bọn mình cũng chưa hỗ trợ ví dụ như file nè !`);
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
                            Clone <span className="text-blue-600">Survey Data</span>
                        </h2>
                        <p className="text-gray-600">
                            Please read the instruction and view demo carefully
                        </p>
                    </div>

                    {/* Form Section */}
                    <div className="bg-white shadow-sm rounded-lg border border-gray-100 mb-6">
                        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
                            <InlineFormItem
                                label="Enter Edit Link Form"
                                className="mb-6"
                                error={errors.form_link?.message}
                            >
                                <Controller
                                    render={({ field }) => (
                                        <Input
                                            placeholder="Example: https://docs.google.com/forms/d/xxx/edit"
                                            className="w-full"
                                            {...field}
                                            size="large"
                                            state={errors.form_link ? 'error' : 'normal'}
                                        />
                                    )}
                                    name="form_link"
                                    control={control}
                                />
                            </InlineFormItem>

                            <Button
                                htmlType="submit"
                                className="uppercase items-center mt-4 w-full block text-center py-3 px-4 bg-primary-600 text-white font-bold rounded-md hover:bg-primary-700 transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                                size="large"
                                loading={isSubmitting || loading}
                            >
                                <span>Get Survey Data Now</span>
                            </Button>
                        </form>

                        {/* Alert Message */}
                        {msg && (
                            <div className="mt-4">
                                <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded text-center flex items-center gap-2 justify-center">
                                    <XCircle className="w-5 h-5 flex-shrink-0" />
                                    <span>{msg}</span>
                                </div>
                            </div>
                        )}

                        {/* ViewForm Link Warning */}
                        {isViewFormLink && (
                            <div className="mt-4">
                                <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                                    <h4 className="text-red-700 font-bold mb-2 flex items-center gap-2">
                                        <XCircle className="w-5 h-5" />
                                        You are using view form link (/viewform)
                                    </h4>
                                    <p className="text-red-700 mb-4">
                                        Please use the <strong>edit form</strong> link with the <strong>/edit</strong> suffix instead of the view form link with the <strong>/viewform</strong> suffix.
                                    </p>
                                    <div className="bg-white p-3 rounded border border-red-100 mb-3">
                                        <p className="text-sm font-medium text-gray-700 mb-2">Link view form (wrong):</p>
                                        <p className="text-xs bg-red-50 p-2 rounded overflow-auto text-red-700 font-mono">
                                            https://docs.google.com/forms/d/xxx/viewform
                                        </p>
                                    </div>
                                    <div className="bg-white p-3 rounded border border-green-100">
                                        <p className="text-sm font-medium text-gray-700 mb-2">Link edit form (correct):</p>
                                        <p className="text-xs bg-green-50 p-2 rounded overflow-auto text-green-700 font-mono">
                                            https://docs.google.com/forms/d/xxx/edit
                                        </p>
                                    </div>
                                    <div className="mt-4">
                                        <Image
                                            src="/static/img/guide-s1.png"
                                            alt="Edit Link Guide"
                                            width={600}
                                            height={400}
                                            className="w-full rounded-lg shadow-sm border border-gray-200"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Storylane Demo Section - After Input Form */}
                    <div className="border border-primary-100 rounded-lg overflow-hidden bg-primary-50 mb-4">
                        <h3 className="text-lg font-bold px-4 py-2 bg-primary-100 border-b border-primary-200 text-primary-800">Interactive Demo</h3>
                        <div className="p-4">
                            <iframe
                                src="https://app.storylane.io/demo/3ad9zgkguwpw?embed=inline"
                                title="Storylane Demo"
                                width="100%"
                                height="600"
                                style={{ border: 'none', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
                                allowFullScreen
                            ></iframe>
                        </div>
                    </div>

                    {/* Guide Sections */}
                    <div className="space-y-12">
                        {/* Warning Note */}
                        <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 text-yellow-800">
                            <p className="font-medium">
                                <strong className="text-yellow-600">Important Note: </strong>
                                If you <strong>first time</strong>, please create a copy of your form and perform on the copy before!
                            </p>
                        </div>

                        <div className="border border-gray-100 rounded-lg overflow-hidden">
                            <h3 className="text-xl font-bold p-4 bg-gray-50 border-b border-gray-100">Guide</h3>

                            {/* Step 1 */}
                            <div className="p-6 border-b border-gray-100">
                                <div className="grid md:grid-cols-2 gap-8 items-center">
                                    <div className="text-left">
                                        <p className="font-bold mb-2 text-gray-900">Step 1: Copy edit link</p>
                                        <p className="mb-2 text-gray-700">
                                            Copy the edit link of the form into the field above. The edit link is taken from the form editing page of you,
                                            <strong> must have the /edit suffix</strong>. Example:
                                        </p>
                                        <p className="text-xs bg-gray-50 p-2 rounded overflow-auto">
                                            https://docs.google.com/forms/d/1IkrTNv9VlSHbDbFx_tnRXXarN1BaNkzHr9VHtBamkRw/edit
                                        </p>
                                    </div>
                                    <div>
                                        <Image
                                            src="/static/img/guide-s1.png"
                                            alt="Survify Step 1"
                                            width={600}
                                            height={400}
                                            className="w-full rounded-lg shadow-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div className="p-6 border-b border-gray-100">
                                <div className="grid md:grid-cols-2 gap-8 items-center">
                                    <div className="text-left">
                                        <p className="font-bold mb-2 text-gray-900">Step 2: Open form access and publish form</p>
                                        <p className="text-gray-700">
                                            Publish the form and open the edit permission for all objects.
                                            <strong> You only need to open the permission at this step</strong>,
                                            after you click "Create now" and the system saves the data successfully, you can disable the access.
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Image
                                            src="/static/img/guide-s21.png"
                                            alt="Survify Step 2.1"
                                            width={300}
                                            height={200}
                                            className="w-full rounded-lg shadow-sm"
                                        />
                                        <Image
                                            src="/static/img/guide-s22.png"
                                            alt="Survify Step 2.2"
                                            width={300}
                                            height={200}
                                            className="w-full rounded-lg shadow-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Step 3 */}
                            <div className="p-6">
                                <div className="grid md:grid-cols-2 gap-8 items-center">
                                    <div className="text-left">
                                        <p className="font-bold mb-2 text-gray-900">Step 3: Configure form</p>
                                        <p className="mb-4 text-gray-700">
                                            You need to turn off email collection,
                                            &nbsp;<strong>disable answer editing</strong> and
                                            &nbsp;<strong>disable email collection</strong>.
                                            Configure the form as shown in the image below!
                                        </p>
                                        <p className="text-gray-700">
                                            Need support? Contact{' '}
                                            <a
                                                href="https://www.facebook.com/survifyvn"
                                                className="text-primary-600 hover:underline font-medium"
                                            >
                                                Survify - Fill survey automatically
                                            </a>
                                        </p>
                                    </div>
                                    <div>
                                        <Image
                                            src="/static/img/guide-s3.png"
                                            alt="Survify Step 3"
                                            width={600}
                                            height={400}
                                            className="w-full rounded-lg shadow-sm"
                                        />
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