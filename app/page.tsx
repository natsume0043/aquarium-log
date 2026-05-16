"use client";

// アクアリウム水換え記録アプリ メインページ

import { useEffect, useState } from "react";
import type { Aquarium } from "./types";
import { loadAquariums, saveAquariums } from "./storage";
import AquariumCard from "./components/AquariumCard";

export default function Home() {
  const [aquariums, setAquariums] = useState<Aquarium[]>([]);
  const [newName, setNewName] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  // 初回マウント時にlocalStorageからデータを読み込む
  useEffect(() => {
    setAquariums(loadAquariums());
  }, []);

  // 水槽リストが変わるたびにlocalStorageへ保存する
  useEffect(() => {
    saveAquariums(aquariums);
  }, [aquariums]);

  // 新しい水槽を追加する
  function addAquarium() {
    const name = newName.trim();
    if (!name) return;
    const aquarium: Aquarium = {
      id: crypto.randomUUID(),
      name,
      records: [],
    };
    setAquariums((prev) => [...prev, aquarium]);
    setNewName("");
    setShowAddForm(false);
  }

  // 水換えを記録する
  function recordWaterChange(aquariumId: string, memo: string) {
    setAquariums((prev) =>
      prev.map((a) =>
        a.id !== aquariumId
          ? a
          : {
              ...a,
              records: [
                ...a.records,
                {
                  id: crypto.randomUUID(),
                  timestamp: new Date().toISOString(),
                  memo: memo.trim(),
                },
              ],
            }
      )
    );
  }

  // 水槽を削除する
  function deleteAquarium(aquariumId: string) {
    if (!confirm("この水槽を削除しますか？履歴もすべて消えます。")) return;
    setAquariums((prev) => prev.filter((a) => a.id !== aquariumId));
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-cyan-50 pb-16">
      {/* ヘッダー */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-blue-100 px-4 py-3">
        <h1 className="text-xl font-bold text-blue-800 text-center">🐠 水換えログ</h1>
      </header>

      <div className="max-w-lg mx-auto px-4 pt-5 space-y-4">
        {/* 水槽カード一覧 */}
        {aquariums.length === 0 && (
          <p className="text-center text-gray-400 text-sm mt-16">
            まだ水槽が登録されていません。<br />下のボタンから追加してください。
          </p>
        )}
        {aquariums.map((a) => (
          <AquariumCard
            key={a.id}
            aquarium={a}
            onRecord={recordWaterChange}
            onDelete={deleteAquarium}
          />
        ))}

        {/* 水槽追加フォーム */}
        {showAddForm ? (
          <form
            onSubmit={(e) => { e.preventDefault(); addAquarium(); }}
            className="bg-white rounded-2xl border-2 border-dashed border-blue-300 p-4 space-y-3"
          >
            <p className="text-sm font-semibold text-gray-600">水槽名を入力</p>
            <input
              type="text"
              placeholder="例: 60cm メイン水槽"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              autoFocus
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-blue-500 text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors"
              >
                追加
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 rounded-lg text-sm text-gray-500 bg-gray-100 hover:bg-gray-200"
              >
                キャンセル
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full py-3 rounded-2xl border-2 border-dashed border-blue-300 text-blue-500 text-sm font-semibold hover:bg-blue-50 transition-colors"
          >
            ＋ 水槽を追加
          </button>
        )}
      </div>
    </main>
  );
}
