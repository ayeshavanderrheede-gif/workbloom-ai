export function AsterLogo({ className = "h-9 w-9" }: { className?: string }) {
  const petals = Array.from({ length: 10 }, (_, i) => i * 36);
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path d="M24 40 C 22 34, 18 31, 12 31 C 14 37, 19 40, 24 40 Z" className="fill-leaf" />
      <g transform="translate(24 21)">
        {petals.map((a) => (
          <ellipse key={a} cx="0" cy="-10" rx="3.6" ry="8" transform={`rotate(${a})`} className="fill-petal" />
        ))}
        <circle r="5.5" className="fill-bloom-center" />
      </g>
    </svg>
  );
}

export function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <AsterLogo />
      <span className="text-lg font-bold tracking-tight">WorkBloom AI</span>
    </div>
  );
}
