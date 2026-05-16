"use client";

// 音声入力付きメモ入力コンポーネント
// Web Speech API（SpeechRecognition）を使って日本語音声入力をサポートする

import { useState, useRef } from "react";

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export default function VoiceMemoInput({ value, onChange }: Props) {
  const [listening, setListening] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  // 音声認識の開始・停止を切り替える
  function toggleVoice() {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("このブラウザは音声入力に対応していません。");
      return;
    }

    const rec = new SpeechRecognition();
    rec.lang = "ja-JP";
    rec.continuous = false;
    rec.interimResults = false;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      onChange(value ? value + " " + transcript : transcript);
    };

    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);

    rec.start();
    recognitionRef.current = rec;
    setListening(true);
  }

  return (
    <div className="flex gap-2 items-center">
      <input
        type="text"
        placeholder="気づきメモ（任意）"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      <button
        type="button"
        onClick={toggleVoice}
        title={listening ? "音声入力を停止" : "音声でメモを入力"}
        className={`p-2 rounded-full transition-colors ${
          listening
            ? "bg-red-500 text-white animate-pulse"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}
      >
        🎤
      </button>
    </div>
  );
}
