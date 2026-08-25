import { Suspense } from "react";
import TrackClient from "./TrackClient";

function TrackLoading() {
  return (
    <div className="grid min-h-[60vh] place-items-center px-6">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-cyan-400" />
        <p className="mt-4 text-sm text-slate-500">Loading tracking information...</p>
      </div>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<TrackLoading />}>
      <TrackClient />
    </Suspense>
  );
}
