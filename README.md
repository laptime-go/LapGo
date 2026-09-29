# 圈速go / LapGo - v1.0 Foreground Only

> 前台GPS圈速App，僅前景定位，熄屏自動暫停計時，符合Play政策。

### 📦 點解 `assets/tracks/` 係空嘅？（唔係Bug）
呢個係最易誤會位，特此說明：

1.  本地Repo唔提交63張賽道圖，只提交一個空folder + `.gitkeep`
2.  63張圖由 `scripts/generate-tracks.js` 在 GitHub Actions 雲端即時生成
3.  流程：`workflow跑 → node scripts/generate-tracks.js → 生成assets/tracks/*.jpg → 再eas build`
4.  `App.js` 入面有63個 `require('./assets/tracks/xxx.jpg')`，所以一定要等腳本生成完先build到，唔係漏咗圖

**結論：本地見唔到圖係正常，雲端build會有。**

### 🔨 Build指令
