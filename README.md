# 方塊遊戲 (Block Game)

這是一款基於 Electron 與前端技術 (HTML/CSS/JavaScript) 從零開始打造的桌面與網頁雙平台消除遊戲。結合了經典拼圖邏輯與現代連擊機制，並內建智慧防挫折演算法。

## 🌟 遊戲特色

* **跨平台支援**：可打包為 Electron 桌面應用程式，或直接部署於 GitHub Pages 作為網頁遊戲，並完美支援行動裝置的觸控拖曳 (Touch Events)。
* **雙難度模式**：
  * **🔴 普通模式**：完全隨機生成方塊，挑戰純粹的運氣與極限佈局。
  * **🟢 簡單模式**：內建「抽籤袋 (Bag System)」與「DFS 深度優先搜尋」的智慧防卡死系統。當系統預判玩家即將走入死局時，會在有限的資源內配發救命方塊。
* **連擊與計分系統**：連續放置並達成消除可累積 Combo，獲得指數成長的分數，並帶有專屬浮動動畫與音效。獨立記錄雙模式的最高分 (High Score)。

## 🚀 技術亮點

* 捨棄傳統 Canvas，採用 **CSS Grid** DOM 元素實作棋盤，大幅簡化碰撞判定與響應式排版。
* 實作 **DFS (Depth-First Search)** 搭配深度限制 (Lookahead Depth) 的虛擬盤面預判演算法，瞬間計算未來存活率，達成零卡頓的流暢體驗。
* 實作 **Fisher-Yates 洗牌演算法** 建立方塊抽籤袋，確保物資供給的均勻性。

## 🎮 如何遊玩

### 網頁版

直接點擊遊玩：[https://amais23.github.io/block-game/](https://amais23.github.io/block-game/)

### 本地端執行 (開發者)

1. 確保已安裝 Node.js
2. 複製此專案：`git clone https://github.com/amais23/block-game.git`
3. 安裝依賴：`npm install`
4. 啟動遊戲：`npm start`
