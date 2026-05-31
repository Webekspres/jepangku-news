export default function SectionHeader({
  label,
  title,
  subtitle,
}: {
  label: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <section className="border-b-2 border-foreground bg-jepang-off-white">
      <div className="px-4 mx-auto max-w-7xl py-12">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-jepang-red mb-2">
          {label}
        </p>
        <h1 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl tracking-tighter mb-6">
          {title}
        </h1>
        {subtitle && <p className="max-w-2xl">{subtitle}</p>}
      </div>
    </section>
  );
}
