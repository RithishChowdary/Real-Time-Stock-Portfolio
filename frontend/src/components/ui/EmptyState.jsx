import { Inbox } from "lucide-react";

export default function EmptyState({ title, message }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-white/80 backdrop-blur-xl p-10 text-center dark:border-slate-700 dark:bg-slate-900/70">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
        <Inbox size={24} />
      </div>

      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
        {title}
      </h3>

      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        {message}
      </p>
    </div>
  );
}