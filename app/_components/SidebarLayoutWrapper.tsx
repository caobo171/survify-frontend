'use client';

import {
  ChartBarIcon,
  CreditCardIcon,
  SpeakerWaveIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { PropsWithChildren, useMemo } from 'react';

import { SidebarLayout } from '@/components/layout/sidebar/sidebar-layout';
import { useMe } from '@/hooks/user';
import { FormInputIcon, ListOrderedIcon } from 'lucide-react';
import { LayoutFooter } from '@/components/layout/footer/footer';

export function SidebarLayoutWrapper({ children }: PropsWithChildren) {
  const me = useMe();

  const sections = useMemo(() => {
    let defaultSections = [

      {
        id: 'main',
        name: '',
        options: [
          { name: 'Tài khoản', href: '/' , icon: UserIcon},
          { name: 'Tạo form ngay', href: '/form/create' , icon: FormInputIcon},
          { name: 'Mã hoá data', href: '/data/encode' , icon: ListOrderedIcon},
          { name: 'Build dữ liệu đẹp', href: '/data/builder', id: 'build_data' , icon: ListOrderedIcon},
          { name: 'Nạp tiền', href: '/credit' , icon: CreditCardIcon},
          { name: 'Về survify', href: 'https://survify.info' , icon: SpeakerWaveIcon},
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
