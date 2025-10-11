'use client';

import {
  BookOpenIcon,
  ChartBarIcon,
  ChartBarSquareIcon,
  CreditCardIcon,
  CubeIcon,
  CurrencyDollarIcon,
  HomeIcon,
  SpeakerWaveIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { PropsWithChildren, useMemo } from 'react';

import { SidebarLayout } from '@/components/layout/sidebar/sidebar-layout';
import { useMe } from '@/hooks/user';
import { FormInputIcon, ListOrderedIcon } from 'lucide-react';

export function SidebarLayoutWrapper({ children }: PropsWithChildren) {
  const me = useMe();

  const sections = useMemo(() => {
    let defaultSections = [

      {
        id: 'main',
        name: '',
        options: [
          { name: 'Dashboard', href: '/' , icon: HomeIcon},
          { name: 'Fill survey', href: '/form/create' , icon: BookOpenIcon},
          { name: 'Research model', href: '/data/builder', id: 'build_data' , icon: CubeIcon },
          { name: 'Data service', href: '/data/encode' , icon: ChartBarSquareIcon},

          { name: 'Credit', href: '/credit' , icon: CurrencyDollarIcon},
          { name: 'Affiliate', href: '/affiliate' , icon: CreditCardIcon},
          { name: 'About', href: 'https://survify.info' , icon: SpeakerWaveIcon},
        ],
      },


    ];

    if (me.data?.is_super_admin) {
      defaultSections.push({
        id: 'admin',
        name: 'Admin',
        options: [
          { name: 'Users', icon: UserIcon, href: '/admin/users' },
          { name: 'Orders', icon: ListOrderedIcon, href: '/admin/orders' },
          { name: 'Data Orders', icon: ListOrderedIcon, href: '/admin/data.orders' },
          { name: 'Forms', icon: FormInputIcon, href: '/admin/forms' },
          { name: 'Annoucements', icon: SpeakerWaveIcon, href: '/admin/system.announcements' },
          { name: 'Affiliate Withdrawals', icon: CreditCardIcon, href: '/admin/affiliate/withdrawals' },
          { name: 'Affiliate Leaderboard', icon: ChartBarIcon, href: '/admin/affiliate' },
        ],
      },
      )
    }

    return defaultSections;
  }, [me.data]);

  return <SidebarLayout sections={sections}>
    {children}

  </SidebarLayout>;
}
