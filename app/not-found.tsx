import React from "react";
import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
      <div className="font-mono text-xs uppercase tracking-wider text-accent font-bold">
        404 | ROUTE NOT FOUND
      </div>
      <h1 className="text-3xl font-bold text-ink">
        Page Not Found in DigiTiles Platform
      </h1>
      <p className="text-sm text-secondary max-w-md mx-auto">
        The requested screen does not exist. Return to the main marketplace hub
        or your role workspace.
      </p>
      <div className="pt-2">
        <Link
          href="/"
          className="inline-flex items-center justify-center min-h-[42px] px-5 py-2.5 rounded bg-accent hover:bg-accent-hover text-white text-xs font-semibold transition-colors"
        >
          Return to DigiTiles Home
        </Link>
      </div>
    </div>
  );
}
