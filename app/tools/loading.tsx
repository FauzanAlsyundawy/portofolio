export default function ToolsLoading() {
  return (
    <div className="container-section py-20 space-y-8 animate-pulse font-mono">
      <div className="space-y-3 border-b border-border/80 pb-6">
        <div className="h-4 w-48 bg-surface rounded" />
        <div className="h-8 w-72 bg-surface rounded" />
        <div className="h-4 w-full max-w-xl bg-surface rounded" />
      </div>

      <div className="flex space-x-6 border-b border-border pb-2">
        <div className="h-8 w-24 bg-surface rounded" />
        <div className="h-8 w-28 bg-surface rounded" />
        <div className="h-8 w-28 bg-surface rounded" />
        <div className="h-8 w-28 bg-surface rounded" />
      </div>

      <div className="h-48 w-full bg-surface/50 border border-border/60 rounded-md" />
    </div>
  );
}
