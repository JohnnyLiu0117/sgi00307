# 講師工作室後台整合

既有專案：`johnny-edu-speaking-hub`（`prj_iZQu4nOQShtbnRAxlP3M1bF8pytt`）。
Blog 網址：`https://john-liu-edu.sgi00307.chatgpt.site`。
正式網址保持 `https://johnny-edu-speaking-hub.vercel.app/admin/speaking`。

## 已完成的程式

- 工作室導覽與首頁加入教育 Q&A 收件匣、網站內容管理。
- Q&A 可篩選、編輯、儲存草稿、生成 AI 草稿、確認公開及封存。
- 網站內容管理包含文章、人物履歷、研究成果、案例合作、照片素材、瀏覽統計。
- 延用 Google 本人登入及原有演講功能。所有管理 API 再驗證本人身分。
- Sites/D1 與原演講資料庫不搬移；由工作室伺服器轉送管理請求。
- 密鑰保留於伺服器環境變數。管理請求不快取，跨來源寫入與不支援的路徑會拒絕。

## 正式啟用前需要完成

1. Vercel 原專案已設定 `SITES_QA_API_BASE`（Production）。程式也支援 `WEBSITE_BASE_URL`，固定只連接上述 Blog。
2. Vercel 已設定 `SITES_QA_BRIDGE_SECRET`（Production）；程式也支援 `QA_BRIDGE_SECRET`。其值必須與 Blog Sites 的 `QA_BRIDGE_SECRET` 相同。不可填入 `NEXT_PUBLIC_*`，不可放進 GitHub。
3. 發布 Blog 的網站內容管理 API 授權更新；保留原 Sites 專案、網址與 D1。
4. 透過原 GitHub 連線部署至原 Vercel 專案；直接 Vercel 連接器目前回傳權限錯誤，但 GitHub 自動部署已確認正常。
5. 使用本人 Google 帳號驗證 Q&A 讀取、草稿儲存及公開操作；AI 實際生成仍需網站的 OpenAI API 可正常使用。

本次未執行任何正式資料刪除、搬移、邀約寄信或 Q&A 公開。

## 驗證指令

`npm run db:generate`

`node --import tsx --test tests/website-bridge.test.ts`

`npm run typecheck`

`npm run build`

## 上傳限制

工作室單檔上限 4MB，較大檔案可使用原 Blog `/studio` 的 8MB 上傳入口。設定此限制是為了避開 Vercel Functions 的 4.5MB 請求大小上限（[官方文件](https://vercel.com/docs/functions/limitations)）。
