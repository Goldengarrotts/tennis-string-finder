'use client';

import { useRouter } from 'next/navigation';
import type { StringType } from '@/types';

export const STRING_TYPE_INFO: Record<StringType, { label: string; desc: string; icon: string }> = {
  polyester: {
    label: 'Polyester',
    icon: '🔵',
    desc: 'Maximum control and spin. Stiff and durable but hard on arms. Used by most touring pros.',
  },
  multifilament: {
    label: 'Multifilament',
    icon: '🟣',
    desc: 'Thousands of fibres mimicking natural gut. Comfortable, arm-friendly, and powerful.',
  },
  'natural-gut': {
    label: 'Natural Gut',
    icon: '🟡',
    desc: 'The gold standard. Best comfort, feel, and tension maintenance — but expensive.',
  },
  'synthetic-gut': {
    label: 'Synthetic Gut',
    icon: '⚪',
    desc: 'Solid all-rounders. Ideal for beginners and those wanting reliable, affordable strings.',
  },
};

interface Props {
  activeType: StringType | null;
}

export default function StringTypeFilter({ activeType }: Props) {
  const router = useRouter();

  function handleClick(type: StringType) {
    // Toggle: clicking the active card clears the filter
    if (type === activeType) {
      router.push('/strings');
    } else {
      router.push(`/strings?type=${type}`);
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
      {(Object.entries(STRING_TYPE_INFO) as [StringType, (typeof STRING_TYPE_INFO)[StringType]][]).map(
        ([type, info]) => {
          const isActive = type === activeType;
          return (
            <button
              key={type}
              onClick={() => handleClick(type)}
              aria-pressed={isActive}
              className={`text-left w-full rounded-xl p-4 border transition-all
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-court focus-visible:ring-offset-2
                ${
                  isActive
                    ? 'bg-court/5 border-court shadow-sm'
                    : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }`}
            >
              <p className="text-2xl mb-2">{info.icon}</p>
              <p
                className={`font-semibold text-sm mb-1 ${
                  isActive ? 'text-court' : 'text-gray-900'
                }`}
              >
                {info.label}
              </p>
              <p className="text-xs text-gray-500 leading-relaxed">{info.desc}</p>
              {isActive && (
                <p className="text-xs text-court/70 mt-2 font-medium">
                  Click to show all types ×
                </p>
              )}
            </button>
          );
        },
      )}
    </div>
  );
}
