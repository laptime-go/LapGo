const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');
const TRACKS = ["zic","gic","guia","sic","tianma","ningbo","zhuzhou","goldenport","chengdu","wuhan","ordos","shaoxing","zhengzhou","v1","pingtan","guangzhou","jingsu","fugang","fuji","suzuka","motegi","okayama","sugo","tsukuba","autopolis","ebisu","tokachi","sendai","mine","central","sepang","buriram","bira","bangsaen","sentul","clark","inje","korea","bathurst","sydney","phillip","dubai","yas","bahrain","losail","buddh","monza","spa","nurburgring","lemans","silverstone","monaco","laguna","daytona","cota","interlagos","zandvoort","imola","catalunya","redbull","hungaroring","shanghai-kart","beijing-kart","macau-kart"];

const outDir = path.join(__dirname, '../assets');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, {recursive:true});

TRACKS.forEach(id=>{
  const canvas = createCanvas(800,500);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle='#0a0a0a'; ctx.fillRect(0,0,800,500);
  ctx.strokeStyle='#00ff88'; ctx.lineWidth=8; ctx.shadowColor='#00ff88'; ctx.shadowBlur=25;
  ctx.strokeRect(20,20,760,460);
  ctx.shadowBlur=15; ctx.fillStyle='#00ff88'; ctx.font='bold 62px Arial'; ctx.textAlign='center';
  ctx.fillText(id.toUpperCase(),400,250);
  ctx.shadowBlur=0; ctx.fillStyle='#fff'; ctx.font='bold 20px Arial';
  ctx.fillText('CIRCUIT • NEON GREEN',400,310);
  fs.writeFileSync(path.join(outDir, `${id}.jpg`), canvas.toBuffer('image/jpeg',{quality:0.9}));
  console.log(`✅ ${id}.jpg`);
});
console.log(`Done ${TRACKS.length}`);
