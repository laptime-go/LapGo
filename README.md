# 圈速go / LapGo - v1.0 Foreground Only

> 前台GPS圈速App，僅前景定位，熄屏自動暫停，符合Google Play定位政策。

### 📦 點解 `assets/tracks/` 係空嘅？（唔係Bug）
呢個係故意設計：

1.  本地Repo唔提交63張圖，只提交空folder + `.gitkeep`
2.  63張圖由 `scripts/generate-tracks.js` 在 GitHub Actions 雲端即時生成
3.  流程：`workflow → node scripts/generate-tracks.js → 生成assets/tracks/*.jpg → Verify → Expo prebuild → AAB/APK`
4.  `App.js` 有63個 `require('./assets/tracks/xxx.jpg')`，必須生成完先build到

**本地見唔到圖係正常，想本地睇：**
```bash
npm install canvas
node scripts/generate-tracks.js
