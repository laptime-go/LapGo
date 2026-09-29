import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable, Alert, Image, Modal, Switch, ScrollView } from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
// 模擬真跑素材版 - 去廣告 - 真實圈速+極速
const TRACKS=[
{id:'zic',name:'珠海國際賽車場',en:'Zhuhai Circuit',short:'ZIC • 14T',lat:22.3598,lng:113.5678,r1:0.28,r2:0.36,baseLap:115,baseMax:215,img:require('./assets/tracks/zic.jpg')},
{id:'gic',name:'廣東國際賽車場',en:'Guangdong Circuit',short:'GIC • 13T',lat:23.1216,lng:112.559,r1:0.32,r2:0.35,baseLap:82,baseMax:205,img:require('./assets/tracks/gic.jpg')},
{id:'guia',name:'東望洋賽道',en:'Guia Circuit',short:'GUIA • 22T',lat:22.197,lng:113.555,r1:0.38,r2:0.31,baseLap:158,baseMax:260,img:require('./assets/tracks/guia.jpg')},
{id:'sic',name:'上海國際賽道',en:'Shanghai Circuit',short:'SIC • 16T',lat:31.339,lng:121.221,r1:0.34,r2:0.33,baseLap:138,baseMax:280,img:require('./assets/tracks/sic.jpg')},
{id:'tianma',name:'上海天馬',en:'Shanghai Tianma',short:'TIANMA • 14T',lat:31.076,lng:121.131,r1:0.33,r2:0.32,baseLap:71,baseMax:175,img:require('./assets/tracks/tianma.jpg')},
{id:'ningbo',name:'寧波國際',en:'Ningbo Circuit',short:'NINGBO • 22T',lat:30.33,lng:121.45,r1:0.30,r2:0.35,baseLap:112,baseMax:220,img:require('./assets/tracks/ningbo.jpg')},
{id:'zhuzhou',name:'株洲國際',en:'Zhuzhou Circuit',short:'ZHUZHOU • 14T',lat:27.85,lng:113.15,r1:0.32,r2:0.34,baseLap:108,baseMax:210,img:require('./assets/tracks/zhuzhou.jpg')},
{id:'goldenport',name:'北京金港',en:'Goldenport',short:'GOLDENPORT • 16T',lat:39.98,lng:116.51,r1:0.31,r2:0.33,baseLap:68,baseMax:180,img:require('./assets/tracks/goldenport.jpg')},
{id:'chengdu',name:'成都天府',en:'Chengdu Tianfu',short:'TIANFU • 19T',lat:30.73,lng:103.95,r1:0.29,r2:0.36,baseLap:122,baseMax:225,img:require('./assets/tracks/chengdu.jpg')},
{id:'wuhan',name:'武漢',en:'Wuhan Circuit',short:'WUHAN • 13T',lat:30.59,lng:114.29,r1:0.34,r2:0.32,baseLap:95,baseMax:195,img:require('./assets/tracks/wuhan.jpg')},
{id:'ordos',name:'鄂爾多斯',en:'Ordos Circuit',short:'ORDOS • 18T',lat:39.62,lng:109.86,r1:0.33,r2:0.35,baseLap:118,baseMax:215,img:require('./assets/tracks/ordos.jpg')},
{id:'shaoxing',name:'浙江紹興',en:'Zhejiang Circuit',short:'ZHEJIANG • 16T',lat:30.08,lng:120.71,r1:0.31,r2:0.34,baseLap:105,baseMax:210,img:require('./assets/tracks/shaoxing.jpg')},
{id:'zhengzhou',name:'鄭州國際',en:'Zhengzhou Circuit',short:'ZHENGZHOU • 17T',lat:34.82,lng:113.92,r1:0.30,r2:0.36,baseLap:125,baseMax:230,img:require('./assets/tracks/zhengzhou.jpg')},
{id:'v1',name:'天津V1',en:'Tianjin V1',short:'V1 • 19T',lat:39.12,lng:117.35,r1:0.32,r2:0.35,baseLap:118,baseMax:218,img:require('./assets/tracks/v1.jpg')},
{id:'pingtan',name:'平潭如意湖',en:'Pingtan Circuit',short:'PINGTAN • 13T',lat:25.50,lng:119.78,r1:0.35,r2:0.31,baseLap:68,baseMax:165,img:require('./assets/tracks/pingtan.jpg')},
{id:'guangzhou',name:'廣州從化',en:'Conghua Circuit',short:'CONGHUA • 10T',lat:23.54,lng:113.58,r1:0.36,r2:0.30,baseLap:62,baseMax:170,img:require('./assets/tracks/guangzhou.jpg')},
{id:'jingsu',name:'廣東競速',en:'Guangdong Jingsu',short:'JINGSU • 13T',lat:23.02,lng:113.63,r1:0.34,r2:0.32,baseLap:66,baseMax:168,img:require('./assets/tracks/jingsu.jpg')},
{id:'fugang',name:'惠州福崗',en:'Fugang Circuit',short:'FUGANG • 8T',lat:23.11,lng:114.41,r1:0.35,r2:0.33,baseLap:58,baseMax:160,img:require('./assets/tracks/fugang.jpg')},
{id:'fuji',name:'富士賽道',en:'Fuji Speedway',short:'FUJI • 16T',lat:35.3717,lng:138.927,r1:0.36,r2:0.32,baseLap:132,baseMax:285,img:require('./assets/tracks/fuji.jpg')},
{id:'suzuka',name:'鈴鹿賽道',en:'Suzuka Circuit',short:'SUZUKA • 18T',lat:34.8431,lng:136.5409,r1:0.34,r2:0.35,baseLap:148,baseMax:255,img:require('./assets/tracks/suzuka.jpg')},{id:'motegi',name:'茂木賽道',en:'Twin Ring Motegi',short:'MOTEGI • 14T',lat:36.534,lng:140.230,r1:0.32,r2:0.33,baseLap:128,baseMax:240,img:require('./assets/tracks/motegi.jpg')},
{id:'okayama',name:'岡山國際',en:'Okayama Circuit',short:'OKAYAMA • 11T',lat:34.915,lng:134.212,r1:0.33,r2:0.32,baseLap:92,baseMax:200,img:require('./assets/tracks/okayama.jpg')},
{id:'sugo',name:'菅生賽道',en:'Sportsland SUGO',short:'SUGO • 12T',lat:38.139,lng:140.617,r1:0.30,r2:0.36,baseLap:98,baseMax:210,img:require('./assets/tracks/sugo.jpg')},
{id:'tsukuba',name:'筑波賽道',en:'Tsukuba Circuit',short:'TSUKUBA • 9T',lat:36.083,lng:140.075,r1:0.38,r2:0.30,baseLap:65,baseMax:175,img:require('./assets/tracks/tsukuba.jpg')},
{id:'autopolis',name:'Autopolis',en:'Autopolis',short:'AUTOPOLIS • 18T',lat:33.03,lng:131.01,r1:0.31,r2:0.35,baseLap:118,baseMax:225,img:require('./assets/tracks/autopolis.jpg')},
{id:'ebisu',name:'惠比壽',en:'Ebisu Circuit',short:'EBISU • 16T',lat:37.64,lng:140.36,r1:0.32,r2:0.34,baseLap:75,baseMax:185,img:require('./assets/tracks/ebisu.jpg')},
{id:'tokachi',name:'十勝賽道',en:'Tokachi Speedway',short:'TOKACHI • 16T',lat:42.93,lng:142.96,r1:0.35,r2:0.32,baseLap:108,baseMax:235,img:require('./assets/tracks/tokachi.jpg')},
{id:'sendai',name:'仙台',en:'Sendai Hi-Land',short:'SENDAI • 12T',lat:38.36,lng:140.85,r1:0.33,r2:0.33,baseLap:88,baseMax:195,img:require('./assets/tracks/sendai.jpg')},
{id:'mine',name:'美祢賽道',en:'Mine Circuit',short:'MINE • 13T',lat:34.15,lng:131.19,r1:0.32,r2:0.34,baseLap:78,baseMax:190,img:require('./assets/tracks/mine.jpg')},
{id:'central',name:'中央賽道',en:'Central Circuit',short:'CENTRAL • 12T',lat:34.91,lng:135.14,r1:0.34,r2:0.31,baseLap:82,baseMax:200,img:require('./assets/tracks/central.jpg')},
{id:'sepang',name:'雪邦賽道',en:'Sepang Circuit',short:'SEPANG • 15T',lat:2.7606,lng:101.738,r1:0.31,r2:0.36,baseLap:155,baseMax:270,img:require('./assets/tracks/sepang.jpg')},
{id:'buriram',name:'武里南賽道',en:'Buriram Circuit',short:'BURIRAM • 12T',lat:14.966,lng:103.095,r1:0.35,r2:0.33,baseLap:98,baseMax:240,img:require('./assets/tracks/buriram.jpg')},
{id:'bira',name:'Bira賽道',en:'Bira Circuit',short:'BIRA • 11T',lat:12.92,lng:101.01,r1:0.34,r2:0.32,baseLap:72,baseMax:185,img:require('./assets/tracks/bira.jpg')},
{id:'bangsaen',name:'邦盛街道',en:'Bangsaen Street',short:'BANGSAEN • 19T',lat:13.28,lng:100.90,r1:0.39,r2:0.30,baseLap:102,baseMax:210,img:require('./assets/tracks/bangsaen.jpg')},
{id:'sentul',name:'Sentul賽道',en:'Sentul Circuit',short:'SENTUL • 12T',lat:-6.53,lng:106.85,r1:0.33,r2:0.34,baseLap:95,baseMax:200,img:require('./assets/tracks/sentul.jpg')},
{id:'clark',name:'Clark賽道',en:'Clark Speedway',short:'CLARK • 18T',lat:15.18,lng:120.54,r1:0.32,r2:0.35,baseLap:118,baseMax:220,img:require('./assets/tracks/clark.jpg')},
{id:'inje',name:'Inje賽道',en:'Inje Speedium',short:'INJE • 19T',lat:38.08,lng:128.29,r1:0.30,r2:0.36,baseLap:115,baseMax:215,img:require('./assets/tracks/inje.jpg')},
{id:'korea',name:'韓國KIC',en:'Korea KIC',short:'KIC • 17T',lat:35.13,lng:126.88,r1:0.31,r2:0.34,baseLap:108,baseMax:210,img:require('./assets/tracks/korea.jpg')},
{id:'bathurst',name:'Bathurst',en:'Bathurst Circuit',short:'BATHURST • 23T',lat:-33.44,lng:149.55,r1:0.38,r2:0.32,baseLap:158,baseMax:270,img:require('./assets/tracks/bathurst.jpg')},
{id:'sydney',name:'悉尼賽車場',en:'Sydney Motorsport Park',short:'SYDNEY • 11T',lat:-33.80,lng:150.86,r1:0.32,r2:0.34,baseLap:95,baseMax:205,img:require('./assets/tracks/sydney.jpg')},
{id:'phillip',name:'Phillip Island',en:'Phillip Island',short:'PHILLIP • 12T',lat:-38.50,lng:145.23,r1:0.34,r2:0.33,baseLap:108,baseMax:240,img:require('./assets/tracks/phillip.jpg')},
{id:'dubai',name:'杜拜賽道',en:'Dubai Autodrome',short:'DUBAI • 16T',lat:25.05,lng:55.23,r1:0.33,r2:0.34,baseLap:118,baseMax:230,img:require('./assets/tracks/dubai.jpg')},
{id:'yas',name:'Yas Marina',en:'Yas Marina Circuit',short:'YAS • 16T',lat:24.46,lng:54.60,r1:0.32,r2:0.35,baseLap:142,baseMax:265,img:require('./assets/tracks/yas.jpg')},
{id:'bahrain',name:'巴林賽道',en:'Bahrain Circuit',short:'BAHRAIN • 15T',lat:26.03,lng:50.51,r1:0.33,r2:0.34,baseLap:135,baseMax:270,img:require('./assets/tracks/bahrain.jpg')},
{id:'losail',name:'Losail賽道',en:'Losail Circuit',short:'LOSAIL • 16T',lat:25.49,lng:51.45,r1:0.35,r2:0.32,baseLap:132,baseMax:275,img:require('./assets/tracks/losail.jpg')},
{id:'buddh',name:'Buddh賽道',en:'Buddh Circuit',short:'BUDDH • 16T',lat:28.35,lng:77.53,r1:0.31,r2:0.36,baseLap:128,baseMax:260,img:require('./assets/tracks/buddh.jpg')},
{id:'sepang-kart',name:'雪邦Kart',en:'Sepang Kart',short:'SEPANG-K • 12T',lat:2.76,lng:101.73,r1:0.36,r2:0.32,baseLap:58,baseMax:95,img:require('./assets/tracks/sepang-kart.jpg')},
{id:'buriram-kart',name:'武里南Kart',en:'Buriram Kart',short:'BURIRAM-K • 10T',lat:14.96,lng:103.09,r1:0.36,r2:0.31,baseLap:52,baseMax:90,img:require('./assets/tracks/buriram-kart.jpg')},
{id:'monza',name:'Monza',en:'Monza Circuit',short:'MONZA • 11T',lat:45.61,lng:9.28,r1:0.38,r2:0.30,baseLap:118,baseMax:290,img:require('./assets/tracks/monza.jpg')},
{id:'spa',name:'Spa',en:'Spa-Francorchamps',short:'SPA • 19T',lat:50.43,lng:5.97,r1:0.32,r2:0.38,baseLap:155,baseMax:285,img:require('./assets/tracks/spa.jpg')},
{id:'nurburgring',name:'紐柏林北環',en:'Nurburgring Nordschleife',short:'NORDSCHLEIFE • 73T',lat:50.33,lng:6.94,r1:0.40,r2:0.32,baseLap:500,baseMax:260,img:require('./assets/tracks/nurburgring.jpg')},
{id:'lemans',name:'Le Mans',en:'Le Mans Circuit',short:'LE MANS • 38T',lat:47.95,lng:0.20,r1:0.36,r2:0.33,baseLap:245,baseMax:295,img:require('./assets/tracks/lemans.jpg')},
{id:'silverstone',name:'Silverstone',en:'Silverstone Circuit',short:'SILVERSTONE • 18T',lat:52.07,lng:-1.01,r1:0.33,r2:0.34,baseLap:135,baseMax:275,img:require('./assets/tracks/silverstone.jpg')},
{id:'monaco',name:'摩納哥',en:'Monaco Circuit',short:'MONACO • 19T',lat:43.73,lng:7.42,r1:0.37,r2:0.32,baseLap:92,baseMax:185,img:require('./assets/tracks/monaco.jpg')},
{id:'laguna',name:'Laguna Seca',en:'Laguna Seca',short:'LAGUNA • 11T',lat:36.58,lng:-121.75,r1:0.32,r2:0.35,baseLap:88,baseMax:205,img:require('./assets/tracks/laguna.jpg')},
{id:'daytona',name:'Daytona',en:'Daytona Speedway',short:'DAYTONA • 12T',lat:29.18,lng:-81.07,r1:0.40,r2:0.30,baseLap:115,baseMax:295,img:require('./assets/tracks/daytona.jpg')},
{id:'cota',name:'COTA',en:'Circuit of the Americas',short:'COTA • 20T',lat:30.13,lng:-97.64,r1:0.32,r2:0.35,baseLap:145,baseMax:275,img:require('./assets/tracks/cota.jpg')},
{id:'interlagos',name:'Interlagos',en:'Interlagos Circuit',short:'INTERLAGOS • 15T',lat:-23.70,lng:-46.69,r1:0.34,r2:0.33,baseLap:98,baseMax:250,img:require('./assets/tracks/interlagos.jpg')},
{id:'zandvoort',name:'Zandvoort',en:'Zandvoort Circuit',short:'ZANDVOORT • 14T',lat:52.38,lng:4.54,r1:0.33,r2:0.32,baseLap:88,baseMax:220,img:require('./assets/tracks/zandvoort.jpg')},
{id:'imola',name:'Imola',en:'Imola Circuit',short:'IMOLA • 17T',lat:44.34,lng:11.71,r1:0.32,r2:0.34,baseLap:112,baseMax:260,img:require('./assets/tracks/imola.jpg')},
{id:'catalunya',name:'Catalunya',en:'Catalunya Circuit',short:'CATALUNYA • 16T',lat:41.57,lng:2.26,r1:0.33,r2:0.34,baseLap:122,baseMax:265,img:require('./assets/tracks/catalunya.jpg')},
{id:'redbull',name:'Red Bull Ring',en:'Red Bull Ring',short:'RBR • 10T',lat:47.21,lng:14.76,r1:0.36,r2:0.32,baseLap:88,baseMax:250,img:require('./assets/tracks/redbull.jpg')},
{id:'hungaroring',name:'Hungaroring',en:'Hungaroring',short:'HUNGARORING • 14T',lat:47.58,lng:19.25,r1:0.34,r2:0.33,baseLap:98,baseMax:215,img:require('./assets/tracks/hungaroring.jpg')},
];
const LANG={zh:{app:'圈速go DEMO',gpsOk:'● DEMO真跑中',gpsNo:'● DEMO真跑中',acc:'精度',speed:'速度',temp:'氣溫',prev:'上一圈',best:'最佳',delta:'Delta',sf:'起/終點',s1:'S1',s2:'S2',s3:'S3',hist:'圈速紀錄 可滾動',dash:'儀表',sess:'紀錄',tracks:'賽道',set:'設定',timer:'--- 計時 ---',disp:'--- 顯示 ---',sys:'--- 系統 ---',proF:'--- Pro功能',night:'夜間模式',unit:'速度單位',tempUnit:'溫度單位',timeFmt:'時間制式',dot:'即時紅點',langTitle:'語言',ghost:'幽靈線透明度',clear:'清除紀錄',ver:'DEMO v1.0',proFree:'免費版，圈速紀錄30圈 +基本功能',proOn:'Pro大佬已啟用 (30日)',proDesc:'解鎖Pro,圈速紀錄100圈，Gps即時紅點+幽靈線',upgrade:'升級 Pro',calib:'起/終點校準',minTrig:'最低觸發',autoLap:'自動計圈',needPro:'不日推出',needProDesc:'敬請期待🤣',gpsHz:'GPS頻率',accFilt:'精度過濾',labels:'賽道標籤',about:'--- 關於 ---',disclaimer:'免責聲明',privacy:'私隱政策',contact:'聯絡我',disTxt:'DEMO版：真實圈速模擬，用於商店素材展示。',priTxt:'無收集數據',conTxt:'fungfung1984@gmail.com'},en:{app:'LapGo DEMO',gpsOk:'● DEMO Running',gpsNo:'● DEMO Running',acc:'Acc',speed:'Speed',temp:'Temp',prev:'Prev',best:'Best',delta:'Delta',sf:'S/F',s1:'S1',s2:'S2',s3:'S3',hist:'Lap History Scrollable',dash:'Dash',sess:'Logs',tracks:'Tracks',set:'Settings',timer:'--- Timer ---',disp:'--- Display ---',sys:'--- System ---',proF:'--- Pro ---',night:'Night Mode',unit:'Speed Unit',tempUnit:'Temp Unit',timeFmt:'Time Format',dot:'Live Dot',langTitle:'Language',ghost:'Ghost Opacity',clear:'Clear All',ver:'DEMO v1.0',proFree:'Free: 30 Laps + Basic',proOn:'Pro Active (30d)',proDesc:'Unlock Pro: 100 Laps, Live Dot + Ghost',upgrade:'Upgrade Pro',calib:'S/F Calib',minTrig:'Min Trigger',autoLap:'Auto Lap',needPro:'Coming Soon',needProDesc:'Stay tuned 🤣',gpsHz:'GPS Rate',accFilt:'Accuracy Filter',labels:'Track Labels',about:'--- About ---',disclaimer:'Disclaimer',privacy:'Privacy',contact:'Contact',disTxt:'DEMO: Realistic lap times',priTxt:'No data',conTxt:'fungfung1984@gmail.com'}};
function dist(a,b,c,d){const R=6371000;const dLat=(c-a)*Math.PI/180;const dLng=(d-b)*Math.PI/180;const x=Math.sin(dLat/2)**2+Math.cos(a*Math.PI/180)*Math.cos(c*Math.PI/180)*Math.sin(dLng/2)**2;return R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x));}
function TimerText({startRef, running, timeFmt, style, lastRef}){const [cur,setCur]=useState(0);useEffect(()=>{let id=null;if(running){id=setInterval(()=>{const v=(Date.now()-startRef.current)/1000;setCur(v);lastRef.current=v;},80);}return()=>{if(id)clearInterval(id);};},[running]);const fmt=s=>{if(s==null)return '0:00.00';if(timeFmt==='ss')return `${s.toFixed(2)}s`;const mm=Math.floor(s/60);const r=(s%60).toFixed(2);return `${mm}:${r.padStart(5,'0')}`;};const show=running?cur:(lastRef.current||0);return <Text style={style}>{fmt(show)}</Text>;}export default function App(){
const [track,setTrack]=useState(TRACKS[0]);const [locked,setLocked]=useState(true);const [acc,setAcc]=useState(1.8);const [speedMs,setSpeedMs]=useState(0);
const [running,setRunning]=useState(false);const [best,setBest]=useState(null);const [prev,setPrev]=useState(null);
const [sector,setSector]=useState([0,0,0]);const [history,setHistory]=useState([]);const [isPro,setIsPro]=useState(false);
const [tab,setTab]=useState('dash');const [showSet,setShowSet]=useState(false);const [darkMode,setDarkMode]=useState(false);const [lang,setLang]=useState('zh');
const [calibDist,setCalibDist]=useState(25);const [minTrigger,setMinTrigger]=useState(15);const [autoLap,setAutoLap]=useState(true);const [unit,setUnit]=useState('kmh');const [tempU,setTempU]=useState('C');const [tempC,setTempC]=useState(29.2);const [timeFmt,setTimeFmt]=useState('mm:ss');const [ghostOp,setGhostOp]=useState(0.5);const [gForce,setGForce]=useState({x:'0.00',max:'0.00'});const [gpsHz,setGpsHz]=useState(10);const [accFilt,setAccFilt]=useState(20);const [showLabels,setShowLabels]=useState(true);
const [maxKphLive,setMaxKphLive]=useState(0);
const startRef=useRef(0);const lastTimeRef=useRef(0);const trackRef=useRef(TRACKS[0]);const runningRef=useRef(false);const maxSpeedLapRef=useRef(0);const finishLapRef=useRef(null);const demoIntRef=useRef(null);const histScrollRef=useRef(null);const T=LANG[lang];
useEffect(()=>{trackRef.current=track;},[track]);
useEffect(()=>{(async()=>{const vals=await AsyncStorage.multiGet(['lap_history','darkMode','lang']);const m=Object.fromEntries(vals);if(m.lap_history)try{const p=JSON.parse(m.lap_history);setHistory(p);const v=p.filter(x=>x.time>0).map(x=>x.time);if(v.length)setBest(Math.min(...v));}catch(e){}if(m.darkMode!==null)setDarkMode(m.darkMode==='1');if(m.lang)setLang(m.lang);})();},[]);
const fmt=s=>{if(!s||s<=0)return '--:--.--';if(timeFmt==='ss')return `${s.toFixed(2)}s`;const mm=Math.floor(s/60);const r=(s%60).toFixed(2);return `${mm}:${r.padStart(5,'0')}`;};
const getSpeed=()=>{const kmh=speedMs*3.6;return unit==='kmh'?kmh.toFixed(0):(kmh*0.621371).toFixed(0);};
const getTemp=()=>{return tempU==='C'?`${tempC.toFixed(1)}°C`:`${(tempC*9/5+32).toFixed(1)}°F`;};
const getMaxDisplay=(kph)=>{if(!kph)return '--';const v=parseFloat(kph);if(isNaN(v)||v<=1)return '--';if(unit==='mph')return (v*0.621371).toFixed(1);return v.toFixed(1);};
// 真實模擬引擎
useEffect(()=>{
 if(!running) return;
 let tick=0;
 demoIntRef.current=setInterval(()=>{
  tick++;
  const tr=trackRef.current;
  const elapsed=(Date.now()-startRef.current)/1000;
  const prog=elapsed / tr.baseLap;
  let kmh;
  if(prog < tr.r1) kmh = tr.baseMax*0.72 + Math.sin(tick*0.25)*14 + Math.random()*6;
  else if(prog < tr.r1+tr.r2) kmh = tr.baseMax*0.42 + Math.sin(tick*0.45)*18 + Math.random()*8;
  else kmh = tr.baseMax*0.62 + Math.sin(tick*0.35)*12 + Math.random()*6;
  kmh=Math.max(50, Math.min(tr.baseMax, kmh));
  setSpeedMs(kmh/3.6);
  if(kmh>maxSpeedLapRef.current){maxSpeedLapRef.current=kmh; setMaxKphLive(kmh);}
  const g = 0.5 + Math.abs(Math.sin(tick*0.7))*1.1 + Math.random()*0.3;
  setGForce(p=>({x:g.toFixed(2),max:Math.max(g,parseFloat(p.max)||0).toFixed(2)}));
  if(prog>=1 && finishLapRef.current) finishLapRef.current();
 },110);
 return()=>clearInterval(demoIntRef.current);
},[running, track.id]);
const start=()=>{ if(running) return; startRef.current=Date.now(); lastTimeRef.current=0; maxSpeedLapRef.current=0; setMaxKphLive(0); runningRef.current=true; setRunning(true); setGForce({x:'0.00',max:'0.00'}); };
const stop=()=>{ runningRef.current=false; setRunning(false); setSpeedMs(0); if(demoIntRef.current) clearInterval(demoIntRef.current); };
const handleTrack=(t)=>{ runningRef.current=false; setRunning(false); lastTimeRef.current=0; startRef.current=0; setSector([0,0,0]); setPrev(null); setMaxKphLive(0); maxSpeedLapRef.current=0; setTrack(t); trackRef.current=t; setTab('dash'); };
const finishLap=async()=>{
  const tr=trackRef.current;
  const jitter=(Math.random()-0.5)*(tr.baseLap*0.035);
  const raw=tr.baseLap+jitter;
  const s1=raw*tr.r1; const s2=raw*tr.r2; const s3=raw-s1-s2;
  const maxKphRaw=maxSpeedLapRef.current||tr.baseMax*0.96;
  maxSpeedLapRef.current=0; setMaxKphLive(0);
  const lap={id:Date.now(),time:raw,s1,s2,s3,track:tr.id,date:new Date().toISOString(),maxKph:maxKphRaw,gMax:gForce.max};
  let nh=[lap,...history];if(nh.length>30)nh=nh.slice(0,30);
  setHistory(nh);await AsyncStorage.setItem('lap_history',JSON.stringify(nh));setPrev(raw);if(!best||raw<best)setBest(raw);setSector([s1,s2,s3]);startRef.current=Date.now(); lastTimeRef.current=0;
  setTimeout(()=>{histScrollRef.current?.scrollTo({y:0,animated:true});},80);
};
useEffect(()=>{finishLapRef.current=finishLap;},[history,best,gForce,lang]);
const save=async(k,v)=>{await AsyncStorage.setItem(k,String(v));};const theme=darkMode?darkS:lightS;
const toggleLang=async()=>{const nl=lang==='zh'?'en':'zh';setLang(nl);await save('lang',nl);};
const toggleUnit=async()=>{const nu=unit==='kmh'?'mph':'kmh';setUnit(nu);await save('unit',nu);};
const showComingSoon=()=>{Alert.alert(T.needPro,T.needProDesc,[{text:'知道了',style:'cancel'}],{cancelable:true});};const DashContent=()=>{return(<View><View style={{alignItems:'center',marginVertical:4}}><TimerText startRef={startRef} running={running} timeFmt={timeFmt} lastRef={lastTimeRef} style={[s.big,theme.t]} /><Text style={{fontSize:9,color:'#00cc66',fontWeight:'bold'}}>DEMO REAL • {track.short} • {track.baseLap}s / {track.baseMax}km/h</Text></View><View style={s.row3}><View style={[s.b,theme.b]}><Text style={[s.l,theme.sub]}>{T.prev}</Text><Text style={[s.v,theme.t]}>{prev?fmt(prev):'--'}</Text></View><View style={[s.b,theme.b]}><Text style={[s.l,theme.sub]}>{T.best}</Text><Text style={[s.v,{color:'#00cc66'}]}>{best?fmt(best):'--'}</Text></View><View style={[s.b,theme.b]}><Text style={[s.l,theme.sub]}>{T.delta}</Text><Text style={[s.v,{color: prev&&best&&prev>best?'#ff4444':'#00cc66'}]}>{prev&&best?`${(prev-best>0?'+':'')}${(prev-best).toFixed(2)}`:'--'}</Text></View></View><View style={{flexDirection:'row',marginHorizontal:6,marginTop:3}}><View style={[s.dataBox,theme.b,{flex:1}]}><Text style={s.dataLabel}>{T.speed} ({unit}) REAL</Text><Text style={[s.dataVal,{color:'#00e5ff'}]}>{getSpeed()}</Text></View><View style={[s.dataBox,theme.b,{flex:0.8}]}><Text style={s.dataLabel}>{T.temp}</Text><Text style={[s.dataVal,{color:'#ffaa00'}]}>{getTemp()}</Text></View><View style={[s.dataBox,theme.b,{flex:1}]}><Text style={s.dataLabel}>G / Max</Text><View style={{flexDirection:'row',justifyContent:'space-between'}}><Text style={{color:'#ffaa00',fontWeight:'bold',fontSize:13}}>{gForce.x}G</Text><Text style={[theme.t,{fontWeight:'bold',fontSize:10}]}>{gForce.max}G</Text></View><Text style={{color:'#00e5ff',fontWeight:'bold',fontSize:11,marginTop:1}}>{getMaxDisplay(maxKphLive)} {unit}</Text></View></View><View style={[s.mapFixed,{backgroundColor:'#000',borderColor:'#00cc66',borderWidth:1.5}]}><Image source={track.img} style={s.mapImgFixed} resizeMode="contain"/>{showLabels&&<Text style={s.start}>{T.sf} • {track.short} • {track.baseLap}s</Text>}</View><View style={s.row3}><View style={[s.sb,theme.b]}><Text style={[s.sbT,theme.t]}>{sector[0].toFixed(2)}</Text><Text style={s.sL}>{T.s1}</Text></View><View style={[s.sb,theme.b]}><Text style={[s.sbT,theme.t]}>{sector[1].toFixed(2)}</Text><Text style={s.sL}>{T.s2}</Text></View><View style={[s.sb,theme.b]}><Text style={[s.sbT,theme.t]}>{sector[2].toFixed(2)}</Text><Text style={s.sL}>{T.s3}</Text></View></View></View>);};
const DashView=()=>{
  return(
  <View style={{flex:1}}>
    <DashContent/>
    <View style={s.btnR}>
      <Pressable onPress={stop} style={({pressed})=>[s.btn,{backgroundColor:running?'#ff3333':'#551111',opacity:pressed?0.7:1}]}><Text style={s.btnT}>■ STOP</Text></Pressable>
      <Pressable onPress={start} style={({pressed})=>[s.btn,{backgroundColor:running?'#114422':'#00cc66',opacity:pressed?0.7:1}]}><Text style={s.btnT}>▶ DEMO START</Text></Pressable>
    </View>
    <Text style={[s.hT,theme.t]}>{T.hist} ({history.length}) - 手指上下滑動</Text>
    <View style={{marginHorizontal:6,marginTop:4,borderWidth:1,borderColor:'#00cc66',borderRadius:8,overflow:'hidden',height:260}}>
      <View style={{flexDirection:'row',paddingVertical:5,paddingHorizontal:6,backgroundColor:'#111'}}>
        <Text style={{flex:0.5,fontSize:9,color:'#888'}}>LAP</Text>
        <Text style={{flex:1.1,fontSize:9,color:'#888'}}>TIME</Text>
        <Text style={{flex:0.7,fontSize:9,color:'#888'}}>TRACK</Text>
        <Text style={{flex:0.5,fontSize:9,color:'#888'}}>G</Text>
        <Text style={{flex:0.6,fontSize:9,color:'#00e5ff'}}>MAX</Text>
      </View>
      <ScrollView ref={histScrollRef} style={{flex:1}} bounces={true} showsVerticalScrollIndicator={true}>
        {history.map((h,i)=>{
          const isBest=h.time===best;
          return(<View key={h.id} style={[s.hR,{flexDirection:'row',alignItems:'center',backgroundColor:isBest?'#003322':'#1a1a1a',borderColor:'#222'}]}><Text style={{flex:0.5,fontSize:11,color:'#fff'}}>{history.length-i}</Text><Text style={{flex:1.1,fontSize:11,fontWeight:'bold',color:isBest?'#00ff88':'#fff'}}>{fmt(h.time)}</Text><Text style={{flex:0.7,fontSize:10,color:'#aaa'}}>{h.track.toUpperCase()}</Text><Text style={{flex:0.5,fontSize:10,color:'#aaa'}}>{h.gMax||0}G</Text><Text style={{flex:0.6,fontSize:11,fontWeight:'bold',color:'#00e5ff'}}>{getMaxDisplay(h.maxKph)}</Text></View>);
        })}
        {history.length===0&&<Text style={[theme.sub,{textAlign:'center',marginVertical:30}]}>未有紀錄 - 按DEMO START真實模擬會滾動</Text>}
      </ScrollView>
    </View>
  </View>
  );
};return(<View style={[s.c,theme.c]}><View style={[s.head,theme.head]}><View style={{flex:1}}><Text style={[s.t,theme.t]}>{T.app}</Text><Text style={[s.sub,theme.sub]} numberOfLines={1}>{lang==='zh'?track.name:track.en} • {track.short} • {track.baseLap}s / {track.baseMax}km/h REAL</Text></View><TouchableOpacity onPress={()=>setShowSet(true)} style={s.gear}><Text style={{fontSize:16}}>⚙️</Text></TouchableOpacity></View><View style={[s.gps,theme.gps]}><Text style={{color:'#00cc66',fontWeight:'bold',fontSize:11}}>{T.gpsOk}</Text><Text style={[s.gpsI,theme.sub]}>DEMO {track.baseLap}s • {track.baseMax}km/h • 可滾動</Text></View><View style={{flex:1}}>{tab==='dash'&&<DashView/>}{tab==='sessions'&&<ScrollView style={{flex:1,padding:6}}>{history.map((h,i)=><View key={h.id} style={[s.hR,theme.b]}><Text style={[theme.t,{fontSize:11}]}>{history.length-i}. {h.track.toUpperCase()} • {fmt(h.time)} • {getMaxDisplay(h.maxKph)}{unit} • S {h.s1.toFixed(1)}/{h.s2.toFixed(1)}</Text></View>)}</ScrollView>}{tab==='tracks'&&<ScrollView style={{flex:1}} contentContainerStyle={{flexDirection:'row',flexWrap:'wrap',padding:6}}>{TRACKS.map(t=><TouchableOpacity key={t.id} onPress={()=>handleTrack(t)} style={[s.trackCard,theme.b,track.id===t.id&&{borderColor:'#00cc66',borderWidth:2}]}><Image source={t.img} style={{width:'100%',height:72,borderRadius:6}} resizeMode="contain"/><Text style={[theme.t,{fontSize:10,marginTop:3}]}>{lang==='zh'?t.name:t.en} {t.baseLap}s</Text></TouchableOpacity>)}</ScrollView>}</View><View style={{width:'100%',height:52,backgroundColor:'#000',alignItems:'center',justifyContent:'center',borderTopWidth:1,borderColor:'#00cc66'}}><Text style={{color:'#00cc66',fontSize:10,fontWeight:'bold'}}>DEMO MODE • NO ADS • REALISTIC {track.baseLap}s / {track.baseMax}km/h • SCROLLABLE</Text></View><Modal visible={showSet} animationType="slide"><View style={[s.setPage,theme.c]}><ScrollView style={{padding:14,paddingTop:8}}><View style={{flexDirection:'row',justifyContent:'space-between',marginBottom:8,marginTop:4}}><Text style={[{fontSize:15,fontWeight:'bold'},theme.t]}>{T.set}</Text><TouchableOpacity onPress={()=>setShowSet(false)}><Text style={[{fontSize:18},theme.t]}>✕</Text></TouchableOpacity></View><View style={[s.proCard,{backgroundColor:'#111',borderColor:'#00cc66'}]}><Text style={{fontWeight:'bold',color:'#00ff88',fontSize:12}}>● DEMO真實模擬已啟用</Text><Text style={{fontSize:9,color:'#fff',marginTop:2}}>ZIC 115s/215km/h • Guia 158s/260km/h • 北環500s/260km/h • 可滾動</Text></View><Text style={[s.setTitle,theme.t]}>{T.timer}</Text><View style={[s.setRow,theme.b]}><Text style={theme.t}>圈速紀錄可滾動</Text><Text style={[theme.t,{color:'#00cc66'}]}>已啟用 ✓</Text></View><Text style={[s.setTitle,theme.t]}>{T.disp}</Text><View style={[s.setRow,theme.b]}><Text style={theme.t}>{T.night}</Text><Switch value={darkMode} onValueChange={v=>{setDarkMode(v);save('darkMode',v?'1':'0');}}/></View><TouchableOpacity style={[s.setRow,theme.b]} onPress={toggleLang}><Text style={theme.t}>{T.langTitle}</Text><Text style={[theme.t,{fontWeight:'bold',color:'#00cc66'}]}>{lang==='zh'?'中文':'EN'} ↔</Text></TouchableOpacity><TouchableOpacity style={[s.setRow,theme.b]} onPress={toggleUnit}><Text style={theme.t}>{T.unit}</Text><Text style={[theme.t,{fontWeight:'bold',color:'#00cc66'}]}>{unit.toUpperCase()} ↔</Text></TouchableOpacity><View style={{alignItems:'center',marginTop:14,marginBottom:10}}><Text style={{fontSize:11,color:'#888'}}>DEMO v1.0 NO ADS • Scrollable • Real Lap Times</Text></View></ScrollView></View></Modal><View style={[s.tabBar,theme.gps]}><TouchableOpacity style={s.tabBtn} onPress={()=>setTab('dash')}><Text style={[s.tab,tab==='dash'&&s.tabOn]}>{T.dash}</Text></TouchableOpacity><TouchableOpacity style={s.tabBtn} onPress={()=>setTab('sessions')}><Text style={[s.tab,tab==='sessions'&&s.tabOn]}>{T.sess}</Text></TouchableOpacity><TouchableOpacity style={s.tabBtn} onPress={()=>setTab('tracks')}><Text style={[s.tab,tab==='tracks'&&s.tabOn]}>{T.tracks}</Text></TouchableOpacity></View></View>);}
const s=StyleSheet.create({c:{flex:1,paddingTop:0},head:{flexDirection:'row',justifyContent:'space-between',paddingHorizontal:10,paddingTop:8,paddingBottom:4,alignItems:'center'},t:{fontSize:15,fontWeight:'bold'},sub:{fontSize:10},gear:{padding:4},proCard:{backgroundColor:'#fff3cd',padding:8,borderRadius:8,marginTop:6,borderWidth:1,borderColor:'#ffaa00'},upBtn:{backgroundColor:'#111',padding:7,borderRadius:6,marginTop:5},gps:{flexDirection:'row',justifyContent:'space-between',paddingHorizontal:10,paddingVertical:3},gpsI:{fontSize:10},big:{fontSize:36,textAlign:'center',fontWeight:'bold',marginVertical:2},row3:{flexDirection:'row',justifyContent:'space-around'},b:{paddingVertical:2,paddingHorizontal:6,borderRadius:6,flex:1,margin:2,height:40,justifyContent:'center',alignItems:'center',borderWidth:1},l:{fontSize:9,color:'#888'},v:{fontSize:13,fontWeight:'bold'},dataBox:{paddingVertical:2,paddingHorizontal:6,borderRadius:6,margin:2,height:48,justifyContent:'center',borderWidth:1},dataLabel:{fontSize:9,color:'#888'},dataVal:{fontSize:17,fontWeight:'bold'},mapFixed:{height:135,marginHorizontal:6,marginVertical:3,borderRadius:10,overflow:'hidden',borderWidth:1.5,backgroundColor:'#000',justifyContent:'center',alignItems:'center'},mapImgFixed:{width:'100%',height:'100%'},start:{position:'absolute',bottom:4,left:6,color:'#fff',fontSize:9,backgroundColor:'rgba(0,0,0,0.7)',paddingHorizontal:5,paddingVertical:1,borderRadius:4},sb:{paddingVertical:2,borderRadius:6,flex:1,margin:2,height:38,justifyContent:'center',alignItems:'center',borderWidth:1},sbT:{fontSize:12,fontWeight:'bold'},sL:{backgroundColor:'#00cc66',color:'#fff',paddingHorizontal:5,borderRadius:4,marginTop:1,fontSize:9,fontWeight:'bold'},hT:{fontSize:11,marginHorizontal:8,marginTop:6,fontWeight:'bold'},hR:{padding:5,marginHorizontal:6,marginVertical:1.5,borderRadius:5,borderWidth:1},btnR:{flexDirection:'row',justifyContent:'space-around',marginHorizontal:8,marginVertical:6},btn:{padding:11,borderRadius:7,flex:1,margin:2,alignItems:'center'},btnT:{color:'#fff',fontWeight:'bold',fontSize:14},tabBar:{flexDirection:'row',justifyContent:'space-around',paddingVertical:10,borderTopWidth:1},tabBtn:{flex:1,alignItems:'center'},tab:{color:'#888',fontSize:12},tabOn:{color:'#00cc66',fontWeight:'bold',fontSize:13},setPage:{flex:1},setTitle:{fontWeight:'bold',marginTop:12,marginBottom:4,fontSize:10,color:'#00cc66'},setRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:11,borderRadius:8,marginBottom:6,borderWidth:1},trackCard:{width:'47%',margin:'1.5%',padding:6,borderRadius:8,borderWidth:1}});
const lightS=StyleSheet.create({c:{backgroundColor:'#f5f5f5'},head:{backgroundColor:'#fff'},t:{color:'#111'},sub:{color:'#666'},gps:{backgroundColor:'#eee',borderTopWidth:1,borderColor:'#ddd'},b:{backgroundColor:'#fff',borderColor:'#e0e0e0'},map:{backgroundColor:'#000',borderColor:'#333'}});
const darkS=StyleSheet.create({c:{backgroundColor:'#000'},head:{backgroundColor:'#000'},t:{color:'#fff'},sub:{color:'#aaa'},gps:{backgroundColor:'#111',borderTopWidth:1,borderColor:'#333'},b:{backgroundColor:'#111',borderColor:'#333'},map:{backgroundColor:'#000',borderColor:'#00cc66'}});
