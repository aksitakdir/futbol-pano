"use client";

/**
 * @deprecated This component is no longer used. Hub admin pages have been
 * replaced by the main Articles list with category filtering and the
 * standalone /admin/transfers page for Transfer Wire management.
 */
export default function HubArticlesPanel({ hubId: _hubId }: { hubId: string }) {
  return (
    <div className="py-10 text-center text-sm text-slate-400">
      This panel has been removed. Use the main Articles page with category filtering instead.
    </div>
  );
}
