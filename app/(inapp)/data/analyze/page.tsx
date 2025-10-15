import { MetaData } from '@/core/Metadata';
import { Metadata, ResolvingMetadata } from 'next';
import ComingSoon from '@/components/common/ComingSoon';

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
        title: 'Survify - Data Analysis',
        description: MetaData.defaultDescription,
        alternates: {
            canonical: MetaData.defaultCanonical,
            languages: MetaData.defaultLanguages,
        },
        openGraph: {
            images: ['https://app.survify.net/static/img/background.jpg', ...previousImages],
        },
    };
}
export default function ModelAdvanceBuilderPage() {
    return (
        <ComingSoon 
            title="Data Analysis Feature"
            description="We're building powerful data analysis tools to help you gain insights from your research. This feature will be available soon!"
        />
    );
}
