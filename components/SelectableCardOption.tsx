interface Props {
  selected: boolean;
  onClick: () => void;
  icon: string;
  title: string;
  description: string;
  disabled?: boolean;
}

/**
 * A large, clearly-selectable card button used in wizard steps.
 *
 * Selected state:
 *  - Left accent bar in brand green
 *  - Tinted background + stronger border
 *  - Check badge top-right
 *
 * Hover state:
 *  - Subtle border darkening + light background tint
 *
 * Supports keyboard focus (focus-visible ring) and aria-pressed.
 */
export default function SelectableCardOption({
  selected,
  onClick,
  icon,
  title,
  description,
  disabled = false,
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      className={[
        'relative w-full text-left p-4 rounded-xl border-2 overflow-hidden',
        'transition-all cursor-pointer select-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-court focus-visible:ring-offset-2',
        'active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed',
        selected
          ? 'border-court bg-court/5 shadow-sm'
          : 'border-gray-200 bg-white hover:border-court/40 hover:bg-gray-50 hover:shadow-sm',
      ].join(' ')}
    >
      {/* Left accent bar — brand colour when selected */}
      {selected && (
        <span
          className="absolute left-0 top-0 bottom-0 w-1 bg-court rounded-l-[10px]"
          aria-hidden="true"
        />
      )}

      <div className={`flex items-start justify-between gap-3 ${selected ? 'pl-2' : ''}`}>
        <div>
          <span className="text-2xl mb-2 block" aria-hidden="true">
            {icon}
          </span>
          <p className="font-semibold text-gray-900 text-sm sm:text-base leading-snug">{title}</p>
          <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{description}</p>
        </div>

        {/* Check badge — only when selected */}
        {selected && (
          <span
            className="shrink-0 w-6 h-6 bg-court rounded-full flex items-center justify-center mt-0.5"
            aria-label="Selected"
          >
            <svg
              className="w-3.5 h-3.5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </span>
        )}
      </div>
    </button>
  );
}
