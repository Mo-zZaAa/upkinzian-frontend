"use client";

import { useState } from "react";
import { createSimulation } from "@/lib/api";
import { TargetCondition, SimulationRequest } from "@/lib/types";

const REGIONS = [
  "전체", "서울", "경기", "부산", "대구", "인천", "광주", "대전",
  "울산", "세종", "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주",
];

const DEFAULT_QUESTIONS = [
  "이 서비스의 첫인상은 어떤가요?",
  "사용할 의향이 있나요? (1~5점)",
  "가장 마음에 드는 점은 무엇인가요?",
  "가장 걱정되는 점은 무엇인가요?",
  "얼마 정도라면 지불할 의향이 있나요?",
  "주변 사람에게 추천할 것 같나요? (1~5점)",
];

interface Props {
  onStart: (simulationId: string) => void;
}

export default function InputScreen({ onStart }: Props) {
  const [desc, setDesc] = useState("");
  const [ageMin, setAgeMin] = useState(20);
  const [ageMax, setAgeMax] = useState(39);
  const [gender, setGender] = useState("전체");
  const [region, setRegion] = useState("전체");
  const [count, setCount] = useState(10);
  const [questions, setQuestions] = useState(DEFAULT_QUESTIONS);
  const [newQ, setNewQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canStart = desc.trim().length > 0 && questions.length > 0 && !loading;

  const removeQ = (i: number) => setQuestions(questions.filter((_, idx) => idx !== i));
  const addQ = () => {
    const t = newQ.trim();
    if (!t) return;
    setQuestions([...questions, t]);
    setNewQ("");
  };

  const handleStart = async () => {
    if (!canStart) return;
    setLoading(true);
    setError(null);

    const targetCondition: TargetCondition = {
      age_min: ageMin,
      age_max: ageMax,
      gender: gender === "전체" ? null : gender === "남성" ? "남자" : "여자",
      province: region === "전체" ? null : region,
      occupation: null,
      education_level: null,
      persona_count: count,
    };

    const request: SimulationRequest = {
      product_description: desc,
      target_condition: targetCondition,
      questions,
    };

    try {
      const result = await createSimulation(request);
      onStart(result.simulation_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 fade-in">
      {/* Hero */}
      <div className="pt-6 pb-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight text-[#1a365d]">
          한국인 100명에게 물어본 듯한
          <br />
          시장 반응을 <span className="text-[#FF6B6B]">30분</span> 만에.
        </h1>
        <p className="mt-3 text-sm text-gray-600 leading-relaxed">
          제품/서비스 아이디어를 입력하면, AI가 한국인 페르소나의 반응을
          시뮬레이션합니다.
        </p>
      </div>

      {/* 제품 설명 */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-gray-800">
            제품/서비스 설명
          </label>
          <span className="text-[11px] text-gray-400 font-mono">필수</span>
        </div>
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value.slice(0, 2000))}
          placeholder="예: AI 기반 대학생 과제 관리 앱. 강의계획서, 과제 마감일, 시험 일정을 자동 정리해주고 AI가 우선순위를 추천. 월 3,900원."
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none h-[120px]"
        />
        <div className="flex justify-end mt-1.5">
          <span className="text-[11px] text-gray-400 font-mono">
            {desc.length}/2000
          </span>
        </div>
      </div>

      {/* 타겟 조건 */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <label className="text-sm font-semibold text-gray-800 block mb-4">
          타겟 조건 설정
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">연령 최소</label>
            <input
              type="number"
              value={ageMin}
              onChange={(e) => setAgeMin(+e.target.value)}
              min={19}
              max={99}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">연령 최대</label>
            <input
              type="number"
              value={ageMax}
              onChange={(e) => setAgeMax(+e.target.value)}
              min={19}
              max={99}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">성별</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>전체</option>
              <option>남성</option>
              <option>여성</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">지역</label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {REGIONS.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-baseline justify-between mb-2">
            <label className="text-sm text-gray-700">시뮬레이션 인원</label>
            <span className="font-bold text-lg text-[#1a365d]">
              {count}
              <span className="text-sm font-medium text-gray-500 ml-0.5">명</span>
            </span>
          </div>
          <input
            type="range"
            min="5"
            max="50"
            step="5"
            value={count}
            onChange={(e) => setCount(+e.target.value)}
            className="w-full"
          />
          <div className="flex justify-between text-[11px] text-gray-400 font-mono mt-1">
            <span>5명</span>
            <span>50명</span>
          </div>
        </div>
      </div>

      {/* 질문 설정 */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <label className="text-sm font-semibold text-gray-800 block mb-3">
          질문 설정{" "}
          <span className="text-gray-400 font-normal">({questions.length}개)</span>
        </label>
        <ul className="space-y-2">
          {questions.map((q, i) => (
            <li
              key={i}
              className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 border border-gray-100"
            >
              <span className="font-mono text-[11px] text-gray-400 w-5">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="flex-1 text-sm text-gray-700">{q}</span>
              <button
                onClick={() => removeQ(i)}
                className="text-gray-300 hover:text-red-500 transition w-6 h-6 flex items-center justify-center rounded"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex gap-2">
          <input
            value={newQ}
            onChange={(e) => setNewQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addQ();
              }
            }}
            placeholder="커스텀 질문 추가"
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={addQ}
            className="px-4 py-2 rounded-lg text-sm font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
          >
            추가
          </button>
        </div>
      </div>

      {/* 에러 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* 제출 */}
      <button
        disabled={!canStart}
        onClick={handleStart}
        className="w-full py-4 rounded-xl text-white font-semibold text-[15px] transition disabled:bg-gray-300 disabled:cursor-not-allowed shadow-sm bg-[#1a365d] hover:bg-[#2c5282]"
      >
        {loading ? "시뮬레이션 생성 중..." : `시뮬레이션 시작 (${count}명)`}
      </button>
    </div>
  );
}
