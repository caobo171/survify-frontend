import { Metadata } from 'next';
import Users from './users/_components/Users';


export const metadata: Metadata = {
  title: 'Users - Admin - Survify',
  description: 'Users - Admin - Survify',
  alternates: {
    canonical: 'https://app.survify.net/admin/users',
  },
};

export default function Page() {
  return <Users />
}
