"use client";

// メインページ（アクアリウム／植物のタブ切り替え対応）

import { useEffect, useState } from "react";
import type { Aquarium, Category } from "./types";
import { supabase } from "./supabase";
import AquariumCard from "./components/AquariumCard";

const TABS: { category: Category; label: string; icon: string; color: string }[] = [
  { category: "aquarium", label: "水槽",  icon: "🐠", color: "blue" },
  { category: "plant",    label: "植物",  icon: "🌿", color: "green" },
];

export default function Home() {
  const [items, setItems] = useState<Aquarium[]>([]);
  const [activeTab, setActiveTab] = useState<Category>("aquarium");
  const [newName, setNewName] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);

  // 初回マウント時にSupabaseから全データを読み込む
  useEffect(() => {
    async function fetchAll() {
      const { data: aqRows } = await supabase
        .from("aquariums")
        .select("id, name, category")
        .order("created_at");

      const { data: wcRows } = await supabase
        .from("water_changes")
        .select("id, aquarium_id, memo, changed_at")
        .order("changed_at");

      const list: Aquarium[] = (aqRows ?? []).map((a) => ({
        id: a.id,
        name: a.name,
        category: a.category ?? "aquarium",
        records: (wcRows ?? [])
          .filter((w) => w.aquarium_id === a.id)
          .map((w) => ({ id: w.id, timestamp: w.changed_at, memo: w.memo })),
      }));

      setItems(list);
      setLoading(false);
    }
    fetchAll();
  }, []);

  // 現在のタブのアイテムだけ絞り込む
  const visibleItems = items.filter((a) => a.category === activeTab);
  const tab = TABS.find((t) => t.category === activeTab)!;

  // 新しいアイテムをSupabaseに追加する
  async function addItem() {
    const name = newName.trim();
    if (!name) {
      alert(`${tab.label}の名前を入力してください`);
      return;
    }

    const { data, error } = await supabase
      .from("aquariums")
      .insert({ name, category: activeTab })
      .select("id, name, category")
      .single();

    if (error || !data) {
      alert("追加に失敗しました: " + (error?.message ?? "不明なエラー"));
      return;
    }

    setItems((prev) => [...prev, { id: data.id, name: data.name, category: data.category, records: [] }]);
    setNewName("");
    setShowAddForm(false);
  }

  // 水やり／水換えをSupabaseに記録する
  async function recordChange(itemId: string, memo: string) {
    const { data, error } = await supabase
      .from("water_changes")
      .insert({ aquarium_id: itemId, memo: memo.trim() })
      .select("id, changed_at, memo")
      .single();

    if (error || !data) return;

    setItems((prev) =>
      prev.map((a) =>
        a.id !== itemId ? a : {
          ...a,
          records: [...a.records, { id: data.id, timestamp: data.changed_at, memo: data.memo }],
        }
      )
    );
  }

  // 名前をSupabaseで更新する
  async function renameItem(itemId: string, newName: string) {
    const { error } = await supabase
      .from("aquariums")
      .update({ name: newName })
      .eq("id", itemId);

    if (error) {
      alert("名前の変更に失敗しました: " + error.message);
      return;
    }
    setItems((prev) => prev.map((a) => (a.id === itemId ? { ...a, name: newName } : a)));
  }

  // Supabaseから削除する
  async function deleteItem(itemId: string) {
    const label = tab.label;
    if (!confirm(`この${label}を削除しますか？履歴もすべて消えます。`)) return;
    await supabase.from("aquariums").delete().eq("id", itemId);
    setItems((prev) => prev.filter((a) => a.id !== itemId));
  }

  // タブ切り替え時にフォームをリセットする
  function switchTab(category: Category) {
    setActiveTab(category);
    setShowAddForm(false);
    setNewName("");
  }

  const isBlue = activeTab === "aquarium";
  const accentBorder = isBlue ? "border-blue-300" : "border-green-300";
  const accentText   = isBlue ? "text-blue-500"   : "text-green-600";
  const accentBg     = isBlue ? "hover:bg-blue-50" : "hover:bg-green-50";
  const accentBtn    = isBlue
    ? "bg-blue-500 hover:bg-blue-600"
    : "bg-green-600 hover:bg-green-700";
  const bgGradient   = isBlue
    ? "from-blue-50 to-cyan-50"
    : "from-green-50 to-emerald-50";

  return (
    <main className={`min-h-screen bg-gradient-to-b ${bgGradient} pb-16`}>
      {/* ヘッダー */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-100 px-4 pt-3">
        <h1 className="text-xl font-bold text-gray-700 text-center mb-3">
          {tab.icon} {tab.label}ログ
        </h1>

        {/* タブ切り替え */}
        <div className="flex">
          {TABS.map((t) => (
            <button
              key={t.category}
              type="button"
              onClick={() => switchTab(t.category)}
              className={`flex-1 py-2 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === t.category
                  ? t.color === "blue"
                    ? "border-blue-500 text-blue-600"
                    : "border-green-600 text-green-700"
                  : "border-transparent text-gray-400"
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 pt-5 space-y-4">
        {loading ? (
          <p className="text-center text-gray-400 text-sm mt-16">読み込み中...</p>
        ) : (
          <>
            {visibleItems.length === 0 && (
              <p className="text-center text-gray-400 text-sm mt-16">
                まだ{tab.label}が登録されていません。<br />下のボタンから追加してください。
              </p>
            )}
            {visibleItems.map((a) => (
              <AquariumCard
                key={a.id}
                aquarium={a}
                onRecord={recordChange}
                onDelete={deleteItem}
                onRename={renameItem}
              />
            ))}

            {/* 追加フォーム */}
            {showAddForm ? (
              <div className={`bg-white rounded-2xl border-2 border-dashed ${accentBorder} p-4 space-y-3`}>
                <p className="text-sm font-semibold text-gray-600">{tab.label}の名前を入力</p>
                <input
                  type="text"
                  placeholder={activeTab === "aquarium" ? "例: 60cm メイン水槽" : "例: モンステラ"}
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className={`w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${isBlue ? "focus:ring-blue-400" : "focus:ring-green-400"}`}
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={addItem}
                    className={`flex-1 ${accentBtn} text-white py-2 rounded-lg text-sm font-semibold transition-colors`}
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
              </div>
            ) : (
              <button
                onClick={() => setShowAddForm(true)}
                className={`w-full py-3 rounded-2xl border-2 border-dashed ${accentBorder} ${accentText} text-sm font-semibold ${accentBg} transition-colors`}
              >
                ＋ {tab.label}を追加
              </button>
            )}
          </>
        )}
      </div>
    </main>
  );
}
