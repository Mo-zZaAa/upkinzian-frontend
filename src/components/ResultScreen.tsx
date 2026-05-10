"use client";

import { useState } from "react";
import { SimulationResult, PersonaResponse, InsightReport } from "@/lib/types";

interface Props {
  result: SimulationResult;
  onRestart: () => void;
}

export default function ResultScreen({ result, onRestart }: Props) {
  const [tab, setTab] = useState<"summary" | "responses" | "report">("summary");
  const responses = result.responses || [];
  const report = result.report;

  const tabs = [
    { id: "summary" as const, label: "요약" },
    { id: "responses" as const, label: `응답 카드 (${responses.length})` },
    { id: "report" as const, label: "리포트" },
  ];

  // 통계 계산
  const posCount = responses.filter((r) => r.overall_sentiment === "positive").length;
  const negCount = responses.filter((r) => r.overall_sentiment === "negative").length;
  const posPct = responses.length > 0 ? Math.round((posCount / responses.length) * 100) : 0;
  const negPct = responses.length > 0 ? Math.round((negCount / responses.length) * 100) : 0;
  const avgPurchase = responses.length > 0
    ? (responses.reduce((s, r) => s + r.purchase_intent_score, 0) / responses.length).toFixed(1)
    : "0";
  const avgRecommend = responses.length > 0
    ? (responses.reduce((s, r) => s + r.recommendation_likelihood, 0) / responses.length).toFixed(1)
    : "0";

  return (
    <div className="space-y-5 fade-in pt-4">
      {/* Header */}
      <div className="flex items-end justify-between gap-4 pb-2">
        <div>
          <div className="text-[11px] font-mono text-gray-400 uppercase tracking-wider mb-1">
            SIMULATION COMPLETE
          </div>
          <h2 className="text-2xl font-bold text-gray-900">시뮬레이션 결과</h2>
          <p className="text-xs text-gray-500 mt-1">
            {responses.length}명 응답 완료
          </p>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-semibold font-mono">
          DONE
        </span>
      </div>

      {/* Tabs */}
      <div className="bg-gray-100 rounded-lg p-1 flex gap-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition ${
              tab === t.id ? "tab-active" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "summary" && (
        <SummaryTab
          posPct={posPct}
          negPct={negPct}
          avgPurchase={avgPurchase}
          avgRecommend={avgRecommend}
          responses={responses}
        />
      )}
      {tab === "responses" && <ResponsesTab responses={responses} />}
      {tab === "report" && <ReportTab report={report} />}

      <button
        onClick={onRestart}
        className="w-full py-3.5 rounded-xl border-2 border-[#1a365d] text-[#1a365d] font-semibold text-sm transition hover:bg-gray-50"
      >
        + 새 시뮬레이션 시작
      </button>
    </div>
  );
}

// --- Summary Tab ---
function SummaryTab({
  posPct, negPct, avgPurchase, avgRecommend, responses,
}: {
  posPct: number; negPct: number; avgPurchase: string; avgRecommend: string;
  responses: PersonaResponse[];
}) {
  const allLikes = responses.flatMap((r) => r.liked_points);
  const allConcerns = responses.flatMap((r) => r.concerns);
  const topLikes = getTopItems(allLikes, 5);
  const topConcerns = getTopItems(allConcerns, 5);

  return (
    <div className="space-y-5 fade-in">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatTile label="긍정" value={`${posPct}`} suffix="%" color="#059669" />
        <StatTile label="부정" value={`${negPct}`} suffix="%" color="#dc2626" />
        <StatTile label="구매 의향" value={avgPurchase} suffix="/5" color="#2563eb" />
        <StatTile label="추천 의향" value={avgRecommend} suffix="/5" color="#7c3aed" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-emerald-700 mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            주요 매력 포인트
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            {topLikes.map((l, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-emerald-500">•</span>
                {l}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-red-700 mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            주요 우려사항
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            {topConcerns.map((c, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-red-500">•</span>
                {c}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 가격 분포 */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-800 mb-4">지불 의향가</h3>
        <div className="flex flex-wrap gap-2">
          {responses.map((r, i) => (
            <span
              key={i}
              className="inline-block bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-xs font-medium"
            >
              {r.willingness_to_pay}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Responses Tab ---
function ResponsesTab({ responses }: { responses: PersonaResponse[] }) {
  return (
    <div className="space-y-4 fade-in">
      {responses.map((r) => (
        <ResponseCard key={r.persona_id} p={r} />
      ))}
      {responses.length === 0 && (
        <p className="text-center text-gray-400 py-8">응답이 없습니다.</p>
      )}
    </div>
  );
}

function ResponseCard({ p }: { p: PersonaResponse }) {
  const bg = {
    positive: "bg-emerald-50/60 border-emerald-100",
    negative: "bg-red-50/60 border-red-100",
    neutral: "bg-gray-50 border-gray-200",
  }[p.overall_sentiment];

  const sentimentLabel = { positive: "긍정", negative: "부정", neutral: "중립" }[p.overall_sentiment];
  const badgeStyle = {
    positive: "bg-emerald-100 text-emerald-700",
    negative: "bg-red-100 text-red-700",
    neutral: "bg-gray-100 text-gray-600",
  }[p.overall_sentiment];

  const avatarBg = p.persona_info.sex === "여자" ? "bg-rose-100 text-rose-700" : "bg-sky-100 text-sky-700";

  return (
    <div className={`rounded-xl border ${bg} p-5`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className={`${avatarBg} w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm shrink-0`}>
            {p.persona_info.sex === "여자" ? "F" : "M"}
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-800">
              {p.persona_info.age}세 {p.persona_info.sex}{" "}
              <span className="text-gray-400 font-normal">
                | {p.persona_info.province} {p.persona_info.district} | {p.persona_info.occupation}
              </span>
            </div>
          </div>
        </div>
        <span className={`${badgeStyle} px-2 py-0.5 rounded-full text-[11px] font-semibold`}>
          {sentimentLabel}
        </span>
      </div>

      <p className="italic text-sm text-gray-700 leading-relaxed mb-4">
        &quot;{p.first_impression}&quot;
      </p>

      <div className="grid grid-cols-3 gap-2 mb-4 text-center">
        <div className="bg-white/70 rounded-lg p-2 border border-white">
          <div className="text-[10px] text-gray-500 font-mono">구매의향</div>
          <div className="text-base font-bold text-[#1a365d]">
            {p.purchase_intent_score}<span className="text-xs text-gray-400">/5</span>
          </div>
        </div>
        <div className="bg-white/70 rounded-lg p-2 border border-white">
          <div className="text-[10px] text-gray-500 font-mono">추천</div>
          <div className="text-base font-bold text-[#1a365d]">
            {p.recommendation_likelihood}<span className="text-xs text-gray-400">/5</span>
          </div>
        </div>
        <div className="bg-white/70 rounded-lg p-2 border border-white">
          <div className="text-[10px] text-gray-500 font-mono">지불의향</div>
          <div className="text-sm font-bold text-gray-800 mt-0.5">{p.willingness_to_pay}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <div>
          <div className="text-[11px] font-semibold text-emerald-700 mb-1.5 uppercase font-mono">매력 포인트</div>
          <ul className="space-y-1">
            {p.liked_points.map((l, i) => (
              <li key={i} className="text-xs text-gray-700 flex gap-1.5">
                <span className="text-emerald-500">+</span>{l}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="text-[11px] font-semibold text-red-700 mb-1.5 uppercase font-mono">우려사항</div>
          <ul className="space-y-1">
            {p.concerns.map((c, i) => (
              <li key={i} className="text-xs text-gray-700 flex gap-1.5">
                <span className="text-red-500">&minus;</span>{c}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-white/80 border border-gray-100 rounded-lg p-3 text-sm text-gray-800">
        <span className="text-gray-300 font-mono mr-2">&ldquo;</span>
        {p.representative_quote}
        <span className="text-gray-300 font-mono ml-1">&rdquo;</span>
      </div>
    </div>
  );
}

// --- Report Tab ---
function ReportTab({ report }: { report: InsightReport | null }) {
  if (!report) {
    return <p className="text-center text-gray-400 py-8">리포트를 생성하지 못했습니다.</p>;
  }

  return (
    <div className="space-y-5 fade-in">
      {/* Executive Summary */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="text-[11px] font-mono text-gray-400 uppercase tracking-wider mb-2">EXECUTIVE SUMMARY</div>
        <p className="text-sm text-gray-700 leading-relaxed">{report.executive_summary}</p>
      </div>

      {/* Distribution */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-sm font-semibold text-gray-800 mb-4">반응 분포</h3>
        <div className="space-y-3">
          <Bar label="긍정" pct={report.sentiment_breakdown.positive_percent} color="bg-emerald-500" />
          <Bar label="중립" pct={report.sentiment_breakdown.neutral_percent} color="bg-amber-400" />
          <Bar label="부정" pct={report.sentiment_breakdown.negative_percent} color="bg-red-500" />
        </div>
        <div className="grid grid-cols-2 gap-3 mt-5 pt-5 border-t border-gray-100">
          <div>
            <div className="text-xs text-gray-500">평균 구매 의향</div>
            <div className="text-2xl font-bold mt-1 text-[#1a365d]">{report.avg_purchase_intent}<span className="text-sm text-gray-400 font-medium">/5</span></div>
          </div>
          <div>
            <div className="text-xs text-gray-500">평균 추천 의향</div>
            <div className="text-2xl font-bold mt-1 text-purple-600">{report.avg_recommendation}<span className="text-sm text-gray-400 font-medium">/5</span></div>
          </div>
        </div>
      </div>

      {/* Segments */}
      {report.segment_comparison && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">세그먼트별 비교</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {report.segment_comparison.by_age && (
              <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                <div className="text-[11px] font-mono text-gray-400 uppercase mb-2">연령</div>
                <div className="space-y-2 text-sm">
                  {Object.entries(report.segment_comparison.by_age).map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <span className="text-gray-700">{k}</span>
                      <span className="font-semibold">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {report.segment_comparison.by_region && (
              <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                <div className="text-[11px] font-mono text-gray-400 uppercase mb-2">지역</div>
                <div className="space-y-2 text-sm">
                  {Object.entries(report.segment_comparison.by_region).map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <span className="text-gray-700">{k}</span>
                      <span className="font-semibold">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Representative Quotes */}
      {report.representative_quotes && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">대표 응답</h3>
          <div className="space-y-3">
            <div className="p-4 rounded-lg bg-emerald-50 border-l-2 border-emerald-500">
              <div className="text-[11px] font-semibold text-emerald-700 mb-1 font-mono">긍정 대표</div>
              <p className="text-sm text-gray-800 italic">&quot;{report.representative_quotes.positive}&quot;</p>
            </div>
            <div className="p-4 rounded-lg bg-red-50 border-l-2 border-red-500">
              <div className="text-[11px] font-semibold text-red-700 mb-1 font-mono">부정 대표</div>
              <p className="text-sm text-gray-800 italic">&quot;{report.representative_quotes.negative}&quot;</p>
            </div>
            <div className="p-4 rounded-lg bg-gray-100 border-l-2 border-gray-400">
              <div className="text-[11px] font-semibold text-gray-700 mb-1 font-mono">중립 대표</div>
              <p className="text-sm text-gray-800 italic">&quot;{report.representative_quotes.neutral}&quot;</p>
            </div>
          </div>
        </div>
      )}

      {/* Marketing Copy */}
      <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
        <div className="text-[11px] font-mono text-blue-600 uppercase tracking-wider font-semibold mb-1">RECOMMENDED</div>
        <h3 className="text-sm font-semibold text-blue-900 mb-4">추천 마케팅 카피</h3>
        <ol className="space-y-3">
          {report.marketing_copy_suggestions.map((copy, i) => (
            <li key={i} className="flex gap-3">
              <span className="font-mono text-blue-400 font-bold">{String(i + 1).padStart(2, "0")}</span>
              <span className="text-sm text-blue-950 font-medium">&ldquo;{copy}&rdquo;</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Improvements */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">제품 개선 제안</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          {report.product_improvement_suggestions.map((s, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-gray-400">•</span>{s}
            </li>
          ))}
        </ul>
      </div>

      {/* Follow-up */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">후속 설문 질문</h3>
        <ol className="space-y-2 text-sm text-gray-700">
          {report.follow_up_survey_questions.map((q, i) => (
            <li key={i} className="flex gap-3">
              <span className="font-mono text-gray-400 w-5">{String(i + 1).padStart(2, "0")}</span>
              {q}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

// --- Helpers ---
function StatTile({ label, value, suffix, color }: { label: string; value: string; suffix: string; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-5">
      <div className="text-[11px] text-gray-500 font-medium uppercase tracking-wider font-mono">{label}</div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-3xl sm:text-4xl font-bold" style={{ color }}>{value}</span>
        {suffix && <span className="text-sm text-gray-400 font-medium">{suffix}</span>}
      </div>
    </div>
  );
}

function Bar({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="font-mono text-gray-500">{pct}%</span>
      </div>
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function getTopItems(items: string[], count: number): string[] {
  const freq: Record<string, number> = {};
  items.forEach((item) => {
    const key = item.trim();
    if (key) freq[key] = (freq[key] || 0) + 1;
  });
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([key]) => key);
}
