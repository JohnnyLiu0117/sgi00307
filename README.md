# Johnny Edu Speaking Hub｜演講邀約與內容自動化管理系統

個人講師工作室：連結 Blog、演講邀約、主題知識庫與演講後的回饋。

目前狀態：**公開網站已部署至 Vercel，正式 PostgreSQL 已建立；正式 Google 登入與 Calendar 空檔同步已驗證，演講事件寫入待驗證**。已實作公開講題、邀約、管理後台、資料庫與日曆整合程式。最新部署狀態見 [正式部署進度](docs/13-deployment-status.md)。正式網站：https://johnny-edu-speaking-hub.vercel.app/speaking 。

公開品牌：**強尼老師｜劉宗騰・教育設計實踐者**。主站為 [強尼老師個人網站](https://john-liu-edu.sgi00307.chatgpt.site/)，主要 Google 帳號為 **sgi00307@gmail.com**。既有內容、12 個講題與接軌方式見 [網站內容套用](docs/11-existing-website-alignment.md)。

## 閱讀順序與交付項目

| 交付項目 | 文件 | 重點 |
|---|---|---|
| A. Architecture Proposal | [系統架構](docs/01-architecture.md) | Domain、技術選擇、資料流、設計決策 |
| B. Database Proposal | [資料庫提案](docs/02-database.md) | Entity、欄位、關聯、限制、版本與索引 |
| C. ER Diagram | [ER 圖](docs/03-er-diagram.md) | 核心與支援資料關係 |
| D. Sitemap | [網站地圖](docs/04-sitemap.md) | Public / Admin、API、SEO、UX |
| E. Workflow | [完整工作流程](docs/05-workflows.md) | 邀約、確認、準備、回饋與知識回流 |
| F. MVP Scope | [階段範圍與驗收](docs/06-mvp-scope.md) | 本輪交付、MVP 必做與延後項目 |
| G. Repository Structure | [程式結構規劃](docs/07-repository-structure.md) | 未來目錄、模組責任、依賴方向 |
| H. Development Roadmap | [開發路線圖](docs/08-roadmap.md) | 階段順序、風險、待確認決策 |
| Google / AI Architecture | [整合設計](docs/09-integrations.md) | OAuth、Calendar、Drive、Forms、AI pipeline |
| Permission Model | [權限與隱私](docs/10-permissions-privacy.md) | 三種角色、公開投影、上傳與人工控制 |

## 原始架構決策（歷史紀錄）

1. 採 Next.js + PostgreSQL + Prisma 的模組化單體架構；Google 是整合服務，核心資料由資料庫保存。
2. Inquiry 與 Event 分離；TopicVersion 與素材修訂版固定保存，案件綁定確切版本。
3. 第一個可上線 MVP 是原需求的 **Phase 2**；本輪 **Phase 1 僅做架構**。
4. MVP 使用原生邀約表單、講師 Google 登入與 Google Calendar 同步；既有 Google Form 保留過渡收件與人工對帳，自動串接、Drive 自動整理及 AI 排到後續階段。

整合細節已參考官方文件；文件中的產品設計、效能目標與階段取捨均為提案，不代表已實作或驗證成功。後續已依繼續開發指示建立應用，實際完成狀態以執行與上線交接文件為準。



