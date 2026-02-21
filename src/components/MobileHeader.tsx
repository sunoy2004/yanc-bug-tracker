import React from 'react';
import { PanelLeft } from 'lucide-react';

export default function MobileHeader({ onOpen }: { onOpen: () => void }) {
  return (
    <header className="md:hidden fixed top-4 left-4 right-4 z-50 flex items-center justify-between">
      <button
        onClick={onOpen}
        aria-label="Open navigation"
        className="p-2.5 rounded-xl bg-card text-foreground shadow-card border border-border"
      >
        <PanelLeft size={18} />
      </button>
    </header>
  );
}

