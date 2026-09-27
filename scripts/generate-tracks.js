const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// 對返你而家App.js 63條，一條都唔差
const TRACKS = ['zic','gic','guia','sic','tianma','ningbo','zhuzhou','goldenport','chengdu','wuhan','ordos','shaoxing','zhengzhou','v1','pingtan','guangzhou','jingsu','fugang','fuji','suzuka','motegi','okayama','sugo','tsukuba','autopolis','ebisu','tokachi','sendai','mine','central','sepang','buriram','bira','bangsaen','sentul','clark','inje','korea','bathurst','sydney','phillip','dubai','yas','bahrain','losail','buddh','sepang-kart','buriram-kart','monza','spa','nurburgring','lemans','silverstone','monaco','laguna','daytona','cota','interlagos','zandvoort','imola','catalunya','redbull','hungaroring'];

const outDir = path.join(__dirname, '../assets/tracks');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, {recursive:true});

TRACKS.forEach(id=>{
  const canvas = createCanvas(800,500);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle='#000'; ctx.fillRect(0,0,800,500);
  ctx.strokeStyle='#00ff88'; ctx.lineWidth=6; ctx.shadowColor='#00ff88'; ctx.shadowBlur=18;
  ctx.strokeRect(15,15,770,470);
  ctx.shadowBlur=20; ctx.fillStyle='#00ff88'; ctx.font='bold 70px Arial'; ctx.textAlign='center';
  ctx.fillText(id.toUpperCase(),400,260);
  ctx.shadowBlur=0; ctx.fillStyle='#666'; ctx.font='18px Arial'; ctx.textAlign='center';
  ctx.fillText('LAPGO • GREEN NEON • '+id,400,310);
  fs.writeFileSync(path.join(outDir, `${id}.jpg`), canvas.toBuffer('image/jpeg',{quality:0.9}));
  console.log(`✅ ${id}.jpg`);
});
console.log(`Done ${TRACKS.length} / ${fs.readdirSync(outDir).length}`);
