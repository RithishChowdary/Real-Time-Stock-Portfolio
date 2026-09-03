export default function Input({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
}) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-[#9AA1A9]">
          {label}
        </span>
      )}

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 caret-blue-600 outline-none transition placeholder:text-slate-400 focus:border-[#3B82F6] focus:ring-2 focus:ring-blue-500/20 dark:border-[#2A2E32] dark:bg-[#141719] dark:text-[#F1F3F5] dark:placeholder-[#6F7780] dark:focus:border-[#3B82F6]"
      />
    </label>
  );
}