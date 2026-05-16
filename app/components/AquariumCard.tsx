"use client";

// 水槽カードコンポーネント
// 経過日数バッジ・名前編集・水換え記録・履歴表示を提供する

import { useState } from "react";
import type { Aquarium, WaterChangeRecord } from "../types";
import VoiceMemoInput from "./VoiceMemoInput";

interface Props {
  aquarium: Aquarium;
  onRecord: (aquariumId: string, memo: string) => void;
  onDelete: (aquariumId: string) => void;
  onRename: (aquariumId: string, newName: string) => void;
}

// 経過日数を計算して返す（日未満は0）
function elapsedDays(isoString: string): number {
  return Math.floor((Date.now() - new Date(isoString).getTime()) / (1000 * 60 * 60 * 24));
}

// 経過時間を人間が読みやすい形式に変換する
function formatElapsed(isoString: string): string {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor(diffMs / (1000 * 60));
  if (days > 0) return `${days}日前`;
  if (hours > 0) return `${hours}時間前`;
  if (minutes > 0) return `${minutes}分前`;
  return "たった今";
}

// 経過日数に応じた緊急度カラーを返す
function urgencyColor(isoString: string | null): string {
  if (!isoString) return "bg-gray-100 border-gray-300";
  const days = elapsedDays(isoString);
  if (days >= 7) return "bg-red-50 border-red-400";
  if (days >= 4) return "bg-yellow-50 border-yellow-400";
  return "bg-green-50 border-green-400";
}

// 経過日数バッジのカラーを返す
function badgeColor(isoString: string | null): string {
  if (!isoString) return "bg-gray-200 text-gray-500";
  const days = elapsedDays(isoString);
  if (days >= 7) return "bg-red-500 text-white";
  if (days >= 4) return "bg-yellow-400 text-white";
  return "bg-green-500 text-white";
}

export default function AquariumCard({ aquarium, onRecord, onDelete, onRename }: Props) {
  const [memo, setMemo] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(aquarium.name);

  const lastRecord = aquarium.records.at(-1) ?? null;
  const colorClass = urgencyColor(lastRecord?.timestamp ?? null);

  function handleRecord() {
    onRecord(aquarium.id, memo);
    setMemo("");
    setShowForm(false);
  }

  function handleRename() {
    const name = editName.trim();
    if (!name || name === aquarium.name) {
      setEditing(false);
      return;
    }
    onRename(aquarium.id, name);
    setEditing(false);
  }

  return (
    <div className={`rounded-2xl border-2 p-4 shadow-sm ${colorClass}`}>
      {/* 水槽名・経過日数バッジ・削除ボタン */}
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1 min-w-0">
          {editing ? (
            /* 名前編集モード */
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="flex-1 border border-blue-400 rounded-lg px-2 py-1 text-base font-bold focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                type="button"
                onClick={handleRename}
                className="text-sm bg-blue-500 text-white px-3 py-1 rounded-lg"
              >
                保存
              </button>
              <button
                type="button"
                onClick={() => { setEditing(false); setEditName(aquarium.name); }}
                className="text-sm text-gray-400 px-2 py-1"
              >
                ✕
              </button>
            </div>
          ) : (
            /* 通常表示モード */
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-800 truncate">{aquarium.name}</h2>
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="text-gray-300 hover:text-blue-400 text-base flex-shrink-0"
                title="名前を編集"
              >
                ✏️
              </button>
            </div>
          )}

          {/* 経過時間テキスト */}
          <p className="text-sm text-gray-500 mt-0.5">
            {lastRecord
              ? `最後の水換え: ${formatElapsed(lastRecord.timestamp)}`
              : "まだ記録がありません"}
          </p>
        </div>

        {/* 経過日数バッジ＋削除ボタン */}
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <button
            type="button"
            onClick={() => onDelete(aquarium.id)}
            className="text-gray-300 hover:text-red-400 text-xl leading-none"
            title="水槽を削除"
          >
            ×
          </button>
          {lastRecord && (
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${badgeColor(lastRecord.timestamp)}`}>
              {elapsedDays(lastRecord.timestamp)}日経過
            </span>
          )}
        </div>
      </div>

      {/* 水換えボタン */}
      {showForm ? (
        <div className="mt-3 flex flex-col gap-2">
          <VoiceMemoInput value={memo} onChange={setMemo} />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleRecord}
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
        </div>
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
