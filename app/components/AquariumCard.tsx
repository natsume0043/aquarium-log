"use client";

// 水槽カードコンポーネント
// 最後の水換えからの経過日数と履歴を表示し、水換え記録ボタンを提供する

import { useState } from "react";
import type { Aquarium, WaterChangeRecord } from "../types";
import VoiceMemoInput from "./VoiceMemoInput";

interface Props {
  aquarium: Aquarium;
  onRecord: (aquariumId: string, memo: string) => void;
  onDelete: (aquariumId: string) => void;
}

// 最後の水換えからの経過時間を人間が読みやすい形式に変換する
function formatElapsed(isoString: string): string {
  const last = new Date(isoString).getTime();
  const now = Date.now();
  const diffMs = now - last;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffDays > 0) return `${diffDays}日前`;
  if (diffHours > 0) return `${diffHours}時間前`;
  if (diffMinutes > 0) return `${diffMinutes}分前`;
  return "たった今";
}

// 経過日数に応じた緊急度カラーを返す
function urgencyColor(isoString: string | null): string {
  if (!isoString) return "bg-gray-100 border-gray-300";
  const diffDays = Math.floor(
    (Date.now() - new Date(isoString).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diffDays >= 7) return "bg-red-50 border-red-400";
  if (diffDays >= 4) return "bg-yellow-50 border-yellow-400";
  return "bg-green-50 border-green-400";
}

export default function AquariumCard({ aquarium, onRecord, onDelete }: Props) {
  const [memo, setMemo] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const lastRecord = aquarium.records.at(-1) ?? null;
  const colorClass = urgencyColor(lastRecord?.timestamp ?? null);

  function handleRecord() {
    onRecord(aquarium.id, memo);
    setMemo("");
    setShowForm(false);
  }

  return (
    <div className={`rounded-2xl border-2 p-4 shadow-sm ${colorClass}`}>
      {/* 水槽名と経過時間 */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-lg font-bold text-gray-800">{aquarium.name}</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {lastRecord
              ? `最後の水換え: ${formatElapsed(lastRecord.timestamp)}`
              : "まだ記録がありません"}
          </p>
        </div>
        <button
          onClick={() => onDelete(aquarium.id)}
          className="text-gray-300 hover:text-red-400 text-xl leading-none"
          title="水槽を削除"
        >
          ×
        </button>
      </div>

      {/* 水換えボタン */}
      {showForm ? (
        <form
          onSubmit={(e) => { e.preventDefault(); handleRecord(); }}
          className="mt-3 flex flex-col gap-2"
        >
          <VoiceMemoInput value={memo} onChange={setMemo} />
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-blue-500 text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-600 active:bg-blue-700 transition-colors"
            >
              記録する
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-lg text-sm text-gray-500 bg-white border hover:bg-gray-50"
            >
              キャンセル
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="mt-3 w-full bg-blue-500 text-white py-3 rounded-xl text-base font-semibold hover:bg-blue-600 active:bg-blue-700 transition-colors"
        >
          💧 水換えした！
        </button>
      )}

      {/* 履歴トグル */}
      {aquarium.records.length > 0 && (
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="mt-3 text-xs text-gray-400 hover:text-gray-600 w-full text-left"
        >
          {showHistory ? "▲ 履歴を閉じる" : `▼ 過去の記録（${aquarium.records.length}件）`}
        </button>
      )}

      {/* 履歴一覧 */}
      {showHistory && (
        <ul className="mt-2 space-y-1 max-h-48 overflow-y-auto">
          {[...aquarium.records].reverse().map((r: WaterChangeRecord) => (
            <li key={r.id} className="text-xs text-gray-600 bg-white rounded-lg px-3 py-2">
              <span className="font-medium">
                {new Date(r.timestamp).toLocaleString("ja-JP")}
              </span>
              {r.memo && <span className="ml-2 text-gray-400">— {r.memo}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
