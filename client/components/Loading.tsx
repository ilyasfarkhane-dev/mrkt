export default function Loading() {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#cbac70] border-t-transparent"></div>
          <p className="text-lg font-medium text-[#042e62]">Loading...</p>
        </div>
      </div>
    );
  }