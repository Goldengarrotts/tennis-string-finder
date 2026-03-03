'use client';

import { usePathname, useRouter } from 'next/navigation';
import type { StringType } from '@/types';

const TYPES: { value: StringType; label: string }[] = [
  { value: 'polyester',     label: 'Poly' },
  { value: 'multifilament', label: 'Multi' },
  { value: 'natural-gut',   label: 'Gut' },
  { value: 'synthetic-gut', label: 'Syn Gut' },
];

interface Props {
  activeType: StringType | null;
}

export default function BestStringsTypeFilter({ activeType }: Props) {
  const pathname = usePathname();
  const router   = useRouter();

  function handleClick(type: StringType) {
    router.push(type === activeType ? pathname : `${pathname}?type=${type}`);
  }

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter recommendations by string type">
      {TYPES.map(({ value, label }) => {
        const isActive = value === activeType;
        return (
          <button
            key={value}
            onClick={() => handleClick(value)}
            aria-pressed={isActive}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-all
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-court focus-visible:ring-offset-2
              ${
                isActive
                  ? 'bg-court text-white border-court'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:shadow-sm'
              }`}
          >
            {label}
            {isActive && ' ×'}
          </button>
        );
      })}
    </div>
  );
}
