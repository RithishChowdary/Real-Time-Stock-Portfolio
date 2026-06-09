export default function Loader() {
  return (
    <div className="flex min-h-[350px] flex-col items-center justify-center gap-4">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

      <p className="text-sm font-medium text-slate-500">
        Loading dashboard...
      </p>
    </div>
  );
}