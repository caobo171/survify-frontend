import { RocketLaunchIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

interface ComingSoonProps {
  title?: string;
  description?: string;
  className?: string;
}

export default function ComingSoon({
  title = 'Feature in Development',
  description = 'We\'re working hard to bring you this feature. Stay tuned for updates!',
  className,
}: ComingSoonProps) {
  return (
    <div
      className={clsx(
        'flex min-h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center',
        className
      )}
    >
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
        <RocketLaunchIcon className="h-8 w-8 text-primary-600" aria-hidden="true" />
      </div>
      <h3 className="mt-6 text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-gray-500">{description}</p>
      <div className="mt-6 flex items-center gap-2">
        <span className="relative flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-400 opacity-75"></span>
          <span className="relative inline-flex h-3 w-3 rounded-full bg-primary-500"></span>
        </span>
        <span className="text-sm font-medium text-primary-600">Coming Soon</span>
      </div>
    </div>
  );
}
