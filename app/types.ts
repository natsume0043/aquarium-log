// アクアリウム管理アプリの型定義

export interface WaterChangeRecord {
  id: string;
  timestamp: string; // ISO 8601形式
  memo: string;
}

export interface Aquarium {
  id: string;
  name: string;
  records: WaterChangeRecord[];
}
