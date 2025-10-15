import { Metadata, ResolvingMetadata } from 'next';
import React from 'react';
import { MetaData } from '@/core/Metadata';
import AffiliateClientWrapper from './_components/AffiliateClientWrapper';

type Props = {
    params: { id: string };
    searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(
    _: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    // optionally access and extend (rather than replace) parent metadata
    const previousImages = (await parent).openGraph?.images || [];

    return {
        metadataBase: new URL(MetaData.landingPageDomain),
        title: 'Affiliate Program | Survify',
        description: 'Join the affiliate program of Survify to earn commission from introducing new users.',
        alternates: {
            canonical: MetaData.defaultCanonical,
            languages: MetaData.defaultLanguages,
        },
        openGraph: {
            images: ['https://app.survify.net/static/img/background.jpg', ...previousImages],
        },
    };
}

export default function Affiliate() {
    return (
        <AffiliateClientWrapper />
    );
}