export default function Card({
  children,
  className = "",
  onClick,
}) {
  return (
    <div
      onClick={onClick}
      className={`
        rounded-2xl
        border
        border-slate-200
        bg-[var(--card-bg)]
        shadow-[var(--shadow-color)]
        backdrop-blur-sm
        p-6
        transition-all
        duration-300
        dark:border-slate-800
        dark:bg-slate-950/80
        dark:shadow-none
        ${className}
      `}
    >
      {children}
    </div>
  );
}