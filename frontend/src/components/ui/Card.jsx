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
        bg-white
        shadow-sm
        p-6
        transition-all
        duration-200
        dark:border-[#2A2E32]
        dark:bg-[#181B1D]
        dark:shadow-none
        ${className}
      `}
    >
      {children}
    </div>
  );
}