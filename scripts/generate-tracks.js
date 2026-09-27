const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

const TRACKS = ['zic','gic','guia','sic','tianma','ningbo','zhuzhou','goldenport','chengdu','wuhan','ordos','shaoxing','zhengzhou','v1','pingtan','guangzhou','jingsu','fugang','fuji','suzuka','motegi','okayama','sugo','tsukuba','autopolis','ebisu','tokachi','sendai','mine','central','sepang','buriram','bira','bangsaen','sentul','clark','inje','korea','bathurst','sydney','phillip','dubai','yas','bahrain','losail','buddh','sepang-kart','buriram-kart','monza','spa','nurburgring','lemans','silverstone','monaco','laguna','daytona','cota','interlagos','zandvoort','imola','catalunya','redbull','hungaroring'];

const outDir = path.join(__dirname, '../assets/tracks');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir,{recursive:true});

function seededRand(str){
  let h=0; for(let i=0;i<str.length;i++) h=(h*31+str.charCodeAt(i))>>>0;
  return ()=>{ h=(h*1103515245+12345)>>>0; return (h&0x7fffffff)/0x7fffffff; };
}

TRACKS.forEach(id=>{
  const canvas = createCanvas(800,500);
  const ctx = canvas.getContext('2d');
  const rnd = seededRand(id);

  // 背景
  ctx.fillStyle='#0a0a0a'; ctx.fillRect(0,0,800,500);

  // 隨機生成賽道點，每條ID唔同形狀但固定
  const points=[];
  const num = 10 + Math.floor(rnd()*6);
  const cx=400, cy=240, rx=280, ry=170;
  for(let i=0;i<num;i++){
    const ang = (i/num)*Math.PI*2;
    const r1 = rx * (0.7 + rnd()*0.5);
    const r2 = ry * (0.7 + rnd()*0.5);
    points.push({x: cx + Math.cos(ang)*r1 + (rnd()-0.5)*50, y: cy + Math.sin(ang)*r2 + (rnd()-0.5)*50});
  }

  // 畫賽道陰影+外圈
  ctx.lineJoin='round'; ctx.lineCap='round';
  ctx.shadowColor='#00ff88'; ctx.shadowBlur=25;
  ctx.strokeStyle='#003322'; ctx.lineWidth=28;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for(let i=0;i<points.length;i++){
    const p1=points[i], p2=points[(i+1)%points.length];
    const mx=(p1.x+p2.x)/2, my=(p1.y+p2.y)/2;
    ctx.quadraticCurveTo(p1.x, p1.y, mx, my);
  }
  ctx.closePath(); ctx.stroke();

  // 畫賽道主線 Neon
  ctx.shadowBlur=18; ctx.shadowColor='#00ff88';
  ctx.strokeStyle='#00ff88'; ctx.lineWidth=5;
  ctx.stroke();

  // 內線
  ctx.shadowBlur=0; ctx.strokeStyle='#0aff8a'; ctx.lineWidth=1.2; ctx.globalAlpha=0.6;
  ctx.stroke(); ctx.globalAlpha=1;

  // 起點終點線
  const s = points[0];
  ctx.fillStyle='#ffffff'; ctx.fillRect(s.x-12, s.y-3, 24, 6);
  ctx.fillStyle='#000'; for(let i=0;i<3;i++) ctx.fillRect(s.x-12+i*8, s.y-3+(i%2)*3, 4,3);

  // ID字
  ctx.shadowBlur=12; ctx.shadowColor='#00ff88';
  ctx.fillStyle='#00ff88'; ctx.font='bold 38px Arial'; ctx.textAlign='center';
  ctx.fillText(id.toUpperCase(), 400, 440);
  ctx.shadowBlur=0; ctx.fillStyle='#555'; ctx.font='14px Arial';
  ctx.fillText('LAPGO • '+id, 400, 465);

  fs.writeFileSync(path.join(outDir, `${id}.jpg`), canvas.toBuffer('image/jpeg',{quality:0.92}));
  console.log(`✅ ${id}.jpg - 有賽道線`);
});
console.log(`Done ${TRACKS.length}`);
