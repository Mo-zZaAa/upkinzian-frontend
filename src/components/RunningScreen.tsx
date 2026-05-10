"use client";

import { useState, useEffect, useCallback } from "react";
import { getSimulation } from "@/lib/api";
import { SimulationResult, PersonaResponse } from "@/lib/types";

interface Props {
  simulationId: string;
  onDone: (result: SimulationResult) => void;
}

export default function RunningScreen({ simulationId, onDone }: Props) {
  const [progress, setProgress] = useState(0);
  const [total, setTotal] = useState(0);
  const [arrivals, setArrivals] = useState<PersonaResponse[]>([]);
  const [status, setStatus] = useState<string>("running");

  const poll = useCallback(async () => {
    try {
      const data = await getSimulation(simulationId);
      setProgress(data.progress);
      setTotal(data.total);
      setStatus(data.status);
      setArrivals(data.responses.slice(-3).reverse());

      if (data.status === "completed" || data.status === "failed") {
        onDone(data);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [simulationId, onDone]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    const doPoll = async () => {
      const done = await poll();
      if (!done) {
        timer = setTimeout(doPoll, 1500);
      }
    };
    doPoll();
    return () => clearTimeout(timer);
  }, [poll]);

  const pct = total > 0 ? (progress / total) * 100 : 0;

  // 간단한 실시간 통계
  const posCount = arrivals.filter((r) => r.overall_sentiment === "positive").length;

  return (
    <div className="space-y-5 fade-in pt-8">
      {/* Progress card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-baseline justify-between mb-4">
          <div>
            <div className="text-[11px] font-mono text-gray-400 uppercase tracking-wider mb-1">
              RUNNING
            </div>
            <h2 className="text-base font-semibold text-gray-800">
              {status === "analyzing"
                ? "인사이트 리포트 생성 중..."
                : "페르소나 응답 수집 중..."}
            </h2>
          </div>
          <div className="text-right">
            <div className="font-mono text-2xl font-bold text-[#1a365d]">
              {progress}
              <span className="text-gray-300 text-lg">/{total}</span>
            </div>
          </div>
        </div>
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="progress-fill h-full rounded-full"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-[11px] font-mono text-gray-400">
          <span>{Math.round(pct)}% 완료</span>
          <span>
            예상 잔여 시간 ~{Math.max(0, Math.round((total - progress) * 3))}초
          </span>
        </div>
      </div>

      {/* Live stream */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-800">실시간 응답</h3>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] text-emerald-600 font-medium font-mono">
              LIVE
            </span>
          </div>
        </div>
        <div className="space-y-2">
          {arrivals.length === 0 && (
            <div className="text-xs text-gray-400 text-center py-4">
              <div className="flex justify-center gap-1 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 pulse-dot" />
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 pulse-dot" />
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 pulse-dot" />
              </div>
              첫 번째 응답을 기다리는 중...
            </div>
          )}
          {arrivals.map((a) => (
            <div
              key={a.persona_id}
              className="slide-in flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100"
            >
              <span className="text-emerald-500 shrink-0 mt-0.5">&#10003;</span>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-700 font-medium">
                  {a.persona_info.age}세 {a.persona_info.sex}{" "}
                  <span className="text-gray-400 font-normal">
                    | {a.persona_info.province} | {a.persona_info.occupation}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-0.5 italic truncate">
                  &quot;{a.first_impression}&quot;
                </div>
              </div>
            </div>
          ))}
          {status === "running" && arrivals.length > 0 && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
              <div className="flex gap-0.5 items-center w-4 shrink-0 mt-1">
                <span className="w-1 h-1 rounded-full bg-gray-400 pulse-dot" />
                <span className="w-1 h-1 rounded-full bg-gray-400 pulse-dot" />
                <span className="w-1 h-1 rounded-full bg-gray-400 pulse-dot" />
              </div>
              <div className="flex-1">
                <div className="shimmer h-2 rounded w-3/4 mt-1" />
                <div className="shimmer h-2 rounded w-1/2 mt-1.5" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Live stats */}
      {arrivals.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">
            실시간 통계{" "}
            <span className="text-xs text-gray-400 font-normal">(업데이트 중)</span>
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-[10px] text-gray-500 font-mono">응답 완료</div>
              <div className="text-2xl font-bold text-[#1a365d]">{progress}</div>
            </div>
            <div className="text-center">
              <div className="text-[10px] text-gray-500 font-mono">긍정 비율</div>
              <div className="text-2xl font-bold text-emerald-600">
                {progress > 0
                  ? Math.round(
                      (arrivals.filter((r) => r.overall_sentiment === "positive").length /
                        Math.min(arrivals.length, 3)) *
                        100
                    )
                  : 0}
                %
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
