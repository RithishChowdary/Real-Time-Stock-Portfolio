export default function Button({
  children,
  type = "button",
  variant = "primary",
  className = "",
  disabled = false,
  onClick,
}) {
  const variants = {
    primary: "bg-[#3B82F6] text-white hover:bg-blue-600 border border-blue-500/20 shadow-sm",
    secondary: "border border-slate-300 dark:border-[#2A2E32] text-slate-700 dark:text-[#F1F3F5] bg-transparent dark:bg-[#141719] hover:bg-slate-100 dark:hover:bg-[#1D2023]",
    outline: "border border-slate-300 dark:border-[#2A2E32] text-slate-700 dark:text-[#9AA1A9] hover:text-slate-900 dark:hover:text-[#F1F3F5] hover:bg-slate-100 dark:hover:bg-[#1D2023]",
    danger: "bg-[#FF4D5A] text-white hover:bg-rose-600 border border-rose-500/20 shadow-sm",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}