interface Props {
  icon: string;
  title: string;
  desc: string;
}

/**
 * Feature highlight card used in the "Why StringLab?" section.
 * Renders an icon, bold title, and short description.
 */
export default function FeatureCard({ icon, title, desc }: Props) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex gap-4">
      <span className="text-3xl shrink-0 mt-0.5" aria-hidden="true">
        {icon}
      </span>
      <div>
        <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
