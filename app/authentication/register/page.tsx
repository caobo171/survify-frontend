'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { XCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button, Input } from '@/components/common';
import { FormItem } from '@/components/form/FormItem';
import Meta from '@/components/ui/Meta';
import { Code } from '@/core/Constants';
import Fetch from '@/lib/core/fetch/Fetch';
import { AnyObject } from '@/store/interface';

const registerSchema = z
  .object({
    email: z
      .string({ required_error: 'Email is required' })
      .min(1, { message: 'Email is required' })
      .email({ message: 'Invalid email format' }),

    username: z
      .string({ required_error: 'Username is required' })
      .min(1, { message: 'Username is required' })
      // regex only allow lowercase, uppercase characters and numbers
      .refine((val: string) => /^[a-zA-Z0-9]+$/.test(val), {
        message:
          'Username can only use numbers, uppercase and lowercase letters (no diacritical marks)',
      }),

    password: z
      .string({ required_error: 'Password is required' })
      .min(1, { message: 'Password is required' }),

    confirmPassword: z
      .string({ required_error: 'Confirm Password is required' })
      .min(1, { message: 'Confirm Password is required' }),

    referCode: z.string().optional(),
  })
  // check confirm password
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Password and Confirm Password must match',
    path: ['confirmPassword'],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Register() {
  const router = useRouter();

  const searchParams = useSearchParams();
  const refCode = searchParams.get('ref');
  const [errorMessage, setErrorMessage] = useState<string>();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  useEffect(() => {
    if (refCode) {
      setValue('referCode', refCode);
    }
  }, [refCode]);

  const onSubmit: SubmitHandler<RegisterFormValues> = async (formData) => {
    const { username, password, email, confirmPassword, referCode } = formData;

    console.log(formData);

    try {
      const res: AnyObject = await Fetch.post('/api/auth/signup', {
        email,
        username,
        password,
        confirm_password: confirmPassword,
        refer_id: referCode,
      });

      if (res && res.data && res.data.code === Code.SUCCESS) {
        router.push(
          `/authentication/wait-verify?email=${encodeURIComponent(email)}`
        );
      } else {
        setErrorMessage(res?.data?.message);
      }
    } catch (e) {
      setErrorMessage('Something went wrong!');
    }
  };

  const zodErrorMessage = useMemo(() => {
    const { email, username, password, confirmPassword } = errors;

    return (
      email?.message ??
      username?.message ??
      password?.message ??
      confirmPassword?.message
    );
  }, [errors]);

  return (
    <>
      <Meta title="Survify | Đăng kí tài khoản" />

      <div className="w-screen h-screen bg-cover bg-center bg-[url('/static/background_index.jpg')]">
        <div className="relative bg-white flex flex-col h-full justify-center items-center xl:w-1/2 2xl:w-[736px] px-6 sm:px-0">
          <div className="text-left text-sm leading-5 mb-[60px] w-full sm:w-auto">
            <Link href="/" className="inline-block">
              <img
                src="/static/logo-color-long.png"
                alt="logo"
                className="w-auto h-12 mb-6"
              />
            </Link>

            <h1 className="text-2xl leading-8 font-medium text-gray-900 mb-2">
              Register Account
            </h1>

            <p className="mb-10 text-gray-500">Welcome to Survify</p>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="w-full sm:w-[436px] mb-6"
            >
              <FormItem label="Email" className="mb-6">
                <Controller
                  render={({ field }) => <Input {...field} size="large" />}
                  name="email"
                  control={control}
                />
              </FormItem>

              <FormItem label="Username" className="mb-6">
                <Controller
                  render={({ field }) => (
                    <Input
                      {...field}
                      size="large"
                      autoComplete="new-username"
                    />
                  )}
                  name="username"
                  control={control}
                />
              </FormItem>


              <div className="flex justify-between">

                <FormItem label="Password" className="mb-6">
                  <Controller
                    render={({ field }) => (
                      <Input
                        size="large"
                        type="password"
                        autoComplete="new-password"
                        {...field}
                      />
                    )}
                    name="password"
                    control={control}
                  />
                </FormItem>

                <FormItem label="Confirm Password" className="mb-6">
                  <Controller
                    render={({ field }) => (
                      <Input size="large" type="password" {...field} />
                    )}
                    name="confirmPassword"
                    control={control}
                  />
                </FormItem>

              </div>



              <FormItem label="Referral Code (optional)" className="mb-8">
                <Controller
                  
                  render={({ field }) => <Input size="large" {...field} />}
                  name="referCode"
                  control={control}
                />
              </FormItem>

              <Button className="w-full" size="large" loading={isSubmitting}>
                Register
              </Button>
            </form>

            {(zodErrorMessage ?? errorMessage) && (
              <p className="text-red-500 flex items-start gap-2 sm:w-[436px] mb-4">
                <XCircle className="w-5 h-5" />
                <span className="flex-1">
                  {zodErrorMessage ?? errorMessage}
                </span>
              </p>
            )}

            <p className="mb-20">
              Already have an account? &nbsp;
              <Link
                href="/authentication/login"
                className="text-primary hover:text-primary-700"
              >
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
function setValue(arg0: string, refCode: string) {
  throw new Error('Function not implemented.');
}

