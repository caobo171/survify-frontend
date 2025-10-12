'use client';

import { useMe } from '@/hooks/user';
import { MeFunctions } from '@/store/me/functions';
import { Dialog, Menu, MenuButton, MenuItem, MenuItems, Transition, TransitionChild } from '@headlessui/react';
import { Bars3Icon, BellIcon, ChevronDownIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import Link from 'next/link';
import { Fragment, PropsWithChildren, useEffect, useState } from 'react';

type NavigationType = {
  name: string;
  href: string;
  icon: React.ElementType;
  default?: boolean;
  count?: number;
};

type SectionType = { id: string; name: string; options: NavigationType[] };

export function SidebarLayout(
  props: PropsWithChildren<{ sections: SectionType[] }>
) {
  const [selectedHref, setSelectedHref] = useState<string>('');

  const me = useMe();

  useEffect(() => {
    setSelectedHref(window.location.pathname + window.location.search);
  }, []);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  function getSections() {
    return (
      <ul role="list" className="flex flex-1 flex-col gap-y-7">
        {props.sections.map((section) => (
          <li key={section.id} role="list" className="space-y-2">
            <div className="text-xs/6 font-semibold text-gray-400">{section.name}</div>
            <ul role="list" className="-mx-2 mt-2 space-y-1 list-none">
              {section.options.map((option) => {
                const active = selectedHref == option.href || option.default;

                return (
                  <li key={option.name}>
                    <Link
                      href={option.href}
                      className={clsx(
                        active
                          ? 'bg-primary-50 text-primary'
                          : 'text-gray-700 hover:bg-gray-100',
                        'group flex gap-x-2 rounded-md px-2 py-2 text-sm'
                      )}
                      onClick={() => setSelectedHref(option.href)}
                    >
                      <option.icon
                        className={clsx(
                          active ? 'text-primary' : 'text-gray-700',
                          'h-5 w-auto shrink-0'
                        )}
                        aria-hidden="true"
                      />
                      {option.name}
                      {option.count ? (
                        <span
                          className="ml-auto w-9 min-w-max whitespace-nowrap rounded-full bg-white px-2.5 py-0.5 text-center text-xs font-medium leading-5 text-gray-600 ring-1 ring-inset ring-gray-200"
                          aria-hidden="true"
                        >
                          {option.count}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ul>
    );
  }


  const userNavigation = [
    { name: 'Your profile', href: '#' },
    { name: 'Sign out', href: '#', onClick: () => MeFunctions.logout() },
  ]

  return (
    <div>
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50 lg:hidden"
          onClose={setSidebarOpen}
        >
          <TransitionChild
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/80" />
          </TransitionChild>

          <div className="fixed inset-0 flex">
            <TransitionChild
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <TransitionChild
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                    <button
                      type="button"
                      className="-m-2.5 p-2.5"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <span className="sr-only">Close sidebar</span>
                      <XMarkIcon
                        className="h-6 w-6 text-white"
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </TransitionChild>
                {/* Sidebar component, swap this element with another sidebar if you like */}
                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 py-4">
                  <nav className="flex flex-1 flex-col">{getSections()}</nav>
                </div>
              </Dialog.Panel>
            </TransitionChild>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col dark:bg-gray-900">
        {/* Sidebar component, swap this element with another sidebar if you like */}
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 pb-4 dark:border-white/10 dark:bg-black/10">

          <div className="flex h-16 shrink-0 items-center">
            <img
              alt="Your Company"
              src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
              className="h-8 w-auto dark:hidden"
            />
            <img
              alt="Your Company"
              src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500"
              className="hidden h-8 w-auto dark:block"
            />
          </div>
          <nav className="flex flex-1 flex-col">
            {getSections()}
          </nav>
        </div>
      </div>


      <main className="lg:pl-72">
        <div className="sticky top-0 z-40 border-gray-200 shadow-sm border-b bg-white lg:shadow-none dark:border-white/10 dark:bg-gray-900 dark:shadow-none">
          <div className='lg:mx-auto lg:max-w-7xl lg:px-8'>
            <div className="flex h-16 items-center gap-x-4  px-4  sm:gap-x-6 sm:px-6 lg:px-0 ">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="-m-2.5 p-2.5 text-gray-700 hover:text-gray-900 lg:hidden dark:text-gray-400 dark:hover:text-white"
              >
                <span className="sr-only">Open sidebar</span>
                <Bars3Icon aria-hidden="true" className="size-6" />
              </button>

              {/* Separator */}
              <div aria-hidden="true" className="h-6 w-px bg-gray-200 lg:hidden dark:bg-gray-700" />

              <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
                <form action="#" method="GET" className="grid flex-1 grid-cols-1">

                </form>
                <div className="flex items-center gap-x-4 lg:gap-x-6">
                  <button
                    type="button"
                    className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500 dark:hover:text-white"
                  >
                    <span className="sr-only">View notifications</span>
                    <BellIcon aria-hidden="true" className="size-6" />
                  </button>

                  {/* Separator */}
                  <div
                    aria-hidden="true"
                    className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200 dark:lg:bg-white/10"
                  />

                  {/* Profile dropdown */}
                  <Menu as="div" className="relative">
                    <MenuButton className="relative flex items-center">
                      <span className="absolute -inset-1.5" />
                      <span className="sr-only">Open user menu</span>
                      <img
                        alt=""
                        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                        className="size-8 rounded-full bg-gray-50 outline outline-1 -outline-offset-1 outline-black/5 dark:bg-gray-800 dark:outline-white/10"
                      />
                      <span className="hidden lg:flex lg:items-center">
                        <span aria-hidden="true" className="ml-4 text-sm/6 font-semibold text-gray-900 dark:text-white">
                          {me.data?.username}
                        </span>
                        <ChevronDownIcon aria-hidden="true" className="ml-2 size-5 text-gray-400" />
                      </span>
                    </MenuButton>
                    <MenuItems
                      transition
                      className="absolute right-0 z-10 mt-2.5 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg outline outline-1 outline-gray-900/5 transition data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in dark:bg-gray-800 dark:shadow-none dark:-outline-offset-1 dark:outline-white/10"
                    >
                      {userNavigation.map((item) => (
                        <MenuItem key={item.name}>
                          <a
                            href={item.href}
                            onClick={item.onClick}
                            className="block px-3 py-1 text-sm/6 text-gray-900 data-[focus]:bg-gray-50 data-[focus]:outline-none dark:text-white dark:data-[focus]:bg-gray-700"
                          >
                            {item.name}
                          </a>
                        </MenuItem>
                      ))}
                    </MenuItems>
                  </Menu>
                </div>
              </div>
            </div>
          </div>
        </div>

        <main className="py-10 bg-gradient-to-b from-primary-50 to-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{props.children}</div>
        </main>
      </main>
    </div>
  );
}
