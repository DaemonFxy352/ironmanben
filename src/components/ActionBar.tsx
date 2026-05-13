"use client";

interface ActionBarProps {
  onCheckIn?: () => void;
  onSawBen?: () => void;
  onCenterMap?: () => void;
}

export function ActionBar({
  onCheckIn = () => {},
  onSawBen = () => {},
  onCenterMap = () => {},
}: ActionBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border pb-safe">
      <div className="px-4 py-4 flex items-center gap-3">
        {/* Check In - Primary button (45%) */}
        <button
          onClick={onCheckIn}
          className="flex-[0_0_45%] h-14 bg-primary text-primary-text rounded-xl font-bold text-[17px] transition-all active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Check In
        </button>

        {/* Saw Ben - Secondary button (45%) */}
        <button
          onClick={onSawBen}
          className="flex-[0_0_45%] h-14 bg-card text-primary-text border border-border rounded-xl font-bold text-[17px] transition-all active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Saw Ben
        </button>

        {/* Center Map - Icon button (10%) */}
        <button
          onClick={onCenterMap}
          className="flex-[0_0_10%] h-14 bg-card text-primary-text border border-border rounded-xl font-bold text-2xl flex items-center justify-center transition-all active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          aria-label="Center map on my location"
        >
          ⊕
        </button>
      </div>
    </div>
  );
}
