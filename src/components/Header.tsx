"use client";

export default function Header() {
  return (
    <header className="border-b border-gray-200 bg-white/80 backdrop-blur sticky top-0 z-10">
      <div className="max-w-3xl mx-auto px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md flex items-center justify-center text-white font-bold text-sm bg-[#1a365d]">
            업
          </div>
          <span className="font-bold text-[15px] tracking-tight">
            업킨지앤 컴퍼니
          </span>
        </div>
        <span className="text-xs text-gray-500 font-medium hidden sm:block">
          AI 시장조사 시뮬레이터
        </span>
      </div>
    </header>
  );
}
