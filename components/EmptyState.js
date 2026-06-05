import Link from 'next/link';

export default function EmptyState({ icon = '🏠', title = 'Nothing here yet', description = 'Be the first to add something!', ctaLabel, ctaHref }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mb-5">
        <span className="text-5xl">{icon}</span>
      </div>
      <h3 className="text-xl font-extrabold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-400 max-w-sm mb-6">{description}</p>
      {ctaLabel && ctaHref && (
        <Link href={ctaHref} className="btn-primary">{ctaLabel}</Link>
      )}
    </div>
  );
}
