export function Avatar({ initials, size = 26 }: { initials: string; size?: number }) {
  return (
    <div
      className="rounded-full bg-accent-bg text-navy flex items-center justify-center font-semibold flex-shrink-0"
      style={{ width: size, height: size, fontSize: Math.max(9, size * 0.4) }}
    >
      {initials}
    </div>
  );
}
