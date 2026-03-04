interface Props {
  label?: string;
  title: string;
  subtitle?: string;
  centered?: boolean;
}

/**
 * Reusable section heading with optional eyebrow label and subtitle.
 * Pass `centered` for centred layouts (e.g. How it Works).
 */
export default function SectionHeader({ label, title, subtitle, centered = false }: Props) {
  return (
    <div className={centered ? 'text-center' : ''}>
      {label && (
        <p className="text-court text-xs font-semibold uppercase tracking-widest mb-2">{label}</p>
      )}
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{title}</h2>
      {subtitle && <p className="text-gray-500 mt-2 text-base">{subtitle}</p>}
    </div>
  );
}
