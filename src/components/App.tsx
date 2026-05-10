"use client";

import { useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import InputScreen from "./InputScreen";
import RunningScreen from "./RunningScreen";
import ResultScreen from "./ResultScreen";
import { SimulationResult } from "@/lib/types";

export default function App() {
  const [step, setStep] = useState<"input" | "running" | "result">("input");
  const [simulationId, setSimulationId] = useState<string>("");
  const [result, setResult] = useState<SimulationResult | null>(null);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-3xl w-full mx-auto px-5 pb-6">
        {step === "input" && (
          <InputScreen
            onStart={(simId) => {
              setSimulationId(simId);
              setStep("running");
            }}
          />
        )}
        {step === "running" && (
          <RunningScreen
            simulationId={simulationId}
            onDone={(r) => {
              setResult(r);
              setStep("result");
            }}
          />
        )}
        {step === "result" && result && (
          <ResultScreen
            result={result}
            onRestart={() => {
              setResult(null);
              setSimulationId("");
              setStep("input");
            }}
          />
        )}
      </main>
      <Footer />
    </div>
  );
}
