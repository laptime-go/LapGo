import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable, Alert, Image, Modal, Switch, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
const TRACKS=[
{id:'zic',name:'珠海國際賽車場',en:'Zhuhai Circuit',short:'ZIC • ZHUHAI • 14T',lat:22.3598,lng:113.5678,img:require('./assets/tracks/zic.jpg')},
{id:'gic',name:'廣東國際賽車場',en:'Guangdong Circuit',short:'GIC • 13T',lat:23.1216,lng:112.559,img:require('./assets/tracks/gic.jpg')},
{id:'guia',name:'東望洋賽道',en:'Guia Circuit',short:'GUIA • MACAU • 22T',lat:22.197,lng:113.555,img:require('./assets/tracks/guia.jpg')},
{id:'sic',name:'上海國際賽道',en:'Shanghai Circuit',short:'SIC • 16T',lat:31.339,lng:121.221,img:require('./assets/tracks/sic.jpg')},
{id:'tianma',name:'上海天馬',en:'Shanghai Tianma',short:'TIANMA • 14T',lat:31.076,lng:121.131,img:require('./assets/tracks/tianma.jpg')},
{id:'ningbo',name:'寧波國際',en:'Ningbo Circuit',short:'NINGBO • 22T',lat:30.33,lng:121.45,img:require('./assets/tracks/ningbo.jpg')},
{id:'zhuzhou',name:'株洲國際',en:'Zhuzhou Circuit',short:'ZHUZHOU • 14T',lat:27.85,lng:113.15,img:require('./assets/tracks/zhuzhou.jpg')},
{id:'goldenport',name:'北京金港',en:'Goldenport',short:'GOLDENPORT • 16T',lat:39.98,lng:116.51,img:require('./assets/tracks/goldenport.jpg')},
{id:'chengdu',name:'成都天府',en:'Chengdu Tianfu',short:'TIANFU • 19T',lat:30.73,lng:103.95,img:require('./assets/tracks/chengdu.jpg')},
{id:'wuhan',name:'武漢',en:'Wuhan Circuit',short:'WUHAN • 13T',lat:30.59,lng:114.29,img:require('./assets/tracks/wuhan.jpg')},
{id:'ordos',name:'鄂爾多斯',en:'Ordos Circuit',short:'ORDOS • 18T',lat:39.62,lng:109.86,img:require('./assets/tracks/ordos.jpg')},
{id:'shaoxing',name:'浙江紹興',en:'Zhejiang Circuit',short:'ZHEJIANG • 16T',lat:30.08,lng:120.71,img:require('./assets/tracks/shaoxing.jpg')},
{id:'zhengzhou',name:'鄭州國際',en:'Zhengzhou Circuit',short:'ZHENGZHOU • 17T',lat:34.82,lng:113.92,img:require('./assets/tracks/zhengzhou.jpg')},
{id:'v1',name:'天津V1',en:'Tianjin V1',short:'V1 • 19T',lat:39.12,lng:117.35,img:require('./assets/tracks/v1.jpg')},
{id:'pingtan',name:'平潭如意湖',en:'Pingtan Circuit',short:'PINGTAN • 13T',lat:25.50,lng:119.78,img:require('./assets/tracks/pingtan.jpg')},
{id:'guangzhou',name:'廣州從化',en:'Conghua Circuit',short:'CONGHUA • 10T',lat:23.54,lng:113.58,img:require('./assets/tracks/guangzhou.jpg')},
{id:'jingsu',name:'廣東競速',en:'Guangdong Jingsu',short:'JINGSU • 13T',lat:23.02,lng:113.63,img:require('./assets/tracks/jingsu.jpg')},
{id:'fugang',name:'惠州福崗',en:'Fugang Circuit',short:'FUGANG • 8T',lat:23.11,lng:114.41,img:require('./assets/tracks/fugang.jpg')},
{id:'fuji',name:'富士賽道',en:'Fuji Speedway',short:'FUJI • 16T',lat:35.3717,lng:138.927,img:require('./assets/tracks/fuji.jpg')},
{id:'suzuka',name:'鈴鹿賽道',en:'Suzuka Circuit',short:'SUZUKA • 18T',lat:34.8431,lng:136.5409,img:require('./assets/tracks/suzuka.jpg')},
{id:'motegi',name:'茂木賽道',en:'Twin Ring Motegi',short:'MOTEGI • 14T',lat:36.534,lng:140.230,img:require('./assets/tracks/motegi.jpg')},
{id:'okayama',name:'岡山國際',en:'Okayama Circuit',short:'OKAYAMA • 11T',lat:34.915,lng:134.212,img:require('./assets/tracks/okayama.jpg')},
{id:'sugo',name:'菅生賽道',en:'Sportsland SUGO',short:'SUGO • 12T',lat:38.139,lng:140.617,img:require('./assets/tracks/sugo.jpg')},
{id:'tsukuba',name:'筑波賽道',en:'Tsukuba Circuit',short:'TSUKUBA • 9T',lat:36.083,lng:140.075,img:require('./assets/tracks/tsukuba.jpg')},
{id:'autopolis',name:'Autopolis',en:'Autopolis',short:'AUTOPOLIS • 18T',lat:33.03,lng:131.01,img:require('./assets/tracks/autopolis.jpg')},
{id:'ebisu',name:'惠比壽',en:'Ebisu Circuit',short:'EBISU • 16T',lat:37.64,lng:140.36,img:require('./assets/tracks/ebisu.jpg')},
{id:'tokachi',name:'十勝賽道',en:'Tokachi Speedway',short:'TOKACHI • 16T',lat:42.93,lng:142.96,img:require('./assets/tracks/tokachi.jpg')},
{id:'sendai',name:'仙台',en:'Sendai Hi-Land',short:'SENDAI • 12T',lat:38.36,lng:140.85,img:require('./assets/tracks/sendai.jpg')},
{id:'mine',name:'美祢賽道',en:'Mine Circuit',short:'MINE • 13T',lat:34.15,lng:131.19,img:require('./assets/tracks/mine.jpg')},
{id:'central',name:'中央賽道',en:'Central Circuit',short:'CENTRAL • 12T',lat:34.91,lng:135.14,img:require('./assets/tracks/central.jpg')},
{id:'sepang',name:'雪邦賽道',en:'Sepang Circuit',short:'SEPANG • 15T',lat:2.7606,lng:101.738,img:require('./assets/tracks/sepang.jpg')},
{id:'buriram',name:'武里南賽道',en:'Buriram Circuit',short:'BURIRAM • 12T',lat:14.966,lng:103.095,img:require('./assets/tracks/buriram.jpg')},
{id:'bira',name:'Bira賽道',en:'Bira Circuit',short:'BIRA • 11T',lat:12.92,lng:101.01,img:require('./assets/tracks/bira.jpg')},
{id:'bangsaen',name:'邦盛街道',en:'Bangsaen Street',short:'BANGSAEN • 19T',lat:13.28,lng:100.90,img:require('./assets/tracks/bangsaen.jpg')},
{id:'sentul',name:'Sentul賽道',en:'Sentul Circuit',short:'SENTUL • 12T',lat:-6.53,lng:106.85,img:require('./assets/tracks/sentul.jpg')},
{id:'clark',name:'Clark賽道',en:'Clark Speedway',short:'CLARK • 18T',lat:15.18,lng:120.54,img:require('./assets/tracks/clark.jpg')},
{id:'inje',name:'Inje賽道',en:'Inje Speedium',short:'INJE • 19T',lat:38.08,lng:128.29,img:require('./assets/tracks/inje.jpg')},
{id:'korea',name:'韓國KIC',en:'Korea KIC',short:'KIC • 17T',lat:35.13,lng:126.88,img:require('./assets/tracks/korea.jpg')},
{id:'bathurst',name:'Bathurst',en:'Bathurst Circuit',short:'BATHURST • 23T',lat:-33.44,lng:149.55,img:require('./assets/tracks/bathurst.jpg')},
{id:'sydney',name:'悉尼賽車場',en:'Sydney Motorsport Park',short:'SYDNEY • 11T',lat:-33.80,lng:150.86,img:require('./assets/tracks/sydney.jpg')},
{id:'phillip',name:'Phillip Island',en:'Phillip Island',short:'PHILLIP • 12T',lat:-38.50,lng:145.23,img:require('./assets/tracks/phillip.jpg')},
{id:'dubai',name:'杜拜賽道',en:'Dubai Autodrome',short:'DUBAI • 16T',lat:25.05,lng:55.23,img:require('./assets/tracks/dubai.jpg')},
{id:'yas',name:'Yas Marina',en:'Yas Marina Circuit',short:'YAS • 16T',lat:24.46,lng:54.60,img:require('./assets/tracks/yas.jpg')},
{id:'bahrain',name:'巴林賽道',en:'Bahrain Circuit',short:'BAHRAIN • 15T',lat:26.03,lng:50.51,img:require('./assets/tracks/bahrain.jpg')},
{id:'losail',name:'Losail賽道',en:'Losail Circuit',short:'LOSAIL • 16T',lat:25.49,lng:51.45,img:require('./assets/tracks/losail.jpg')},
{id:'buddh',name:'Buddh賽道',en:'Buddh Circuit',short:'BUDDH • 16T',lat:28.35,lng:77.53,img:require('./assets/tracks/buddh.jpg')},
{id:'sepang-kart',name:'雪邦Kart',en:'Sepang Kart',short:'SEPANG-K • 12T',lat:2.76,lng:101.73,img:require('./assets/tracks/sepang-kart.jpg')},
{id:'buriram-kart',name:'武里南Kart',en:'Buriram Kart',short:'BURIRAM-K • 10T',lat:14.96,lng:103.09,img:require('./assets/tracks/buriram-kart.jpg')},
{id:'monza',name:'Monza',en:'Monza Circuit',short:'MONZA • 11T',lat:45.61,lng:9.28,img:require('./assets/tracks/monza.jpg')},
{id:'spa',name:'Spa',en:'Spa-Francorchamps',short:'SPA • 19T',lat:50.43,lng:5.97,img:require('./assets/tracks/spa.jpg')},
{id:'nurburgring',name:'紐柏林北環',en:'Nurburgring Nordschleife',short:'NORDSCHLEIFE • 73T',lat:50.33,lng:6.94,img:require('./assets/tracks/nurburgring.jpg')},
{id:'lemans',name:'Le Mans',en:'Le Mans Circuit',short:'LE MANS • 38T',lat:47.95,lng:0.20,img:require('./assets/tracks/lemans.jpg')},
{id:'silverstone',name:'Silverstone',en:'Silverstone Circuit',short:'SILVERSTONE • 18T',lat:52.07,lng:-1.01,img:require('./assets/tracks/silverstone.jpg')},
{id:'monaco',name:'摩納哥',en:'Monaco Circuit',short:'MONACO • 19T',lat:43.73,lng:7.42,img:require('./assets/tracks/monaco.jpg')},
{id:'laguna',name:'Laguna Seca',en:'Laguna Seca',short:'LAGUNA • 11T',lat:36.58,lng:-121.75,img:require('./assets/tracks/laguna.jpg')},
{id:'daytona',name:'Daytona',en:'Daytona Speedway',short:'DAYTONA • 12T',lat:29.18,lng:-81.07,img:require('./assets/tracks/daytona.jpg')},
{id:'cota',name:'COTA',en:'Circuit of the Americas',short:'COTA • 20T',lat:30.13,lng:-97.64,img:require('./assets/tracks/cota.jpg')},
{id:'interlagos',name:'Interlagos',en:'Interlagos Circuit',short:'INTERLAGOS • 15T',lat:-23.70,lng:-46.69,img:require('./assets/tracks/interlagos.jpg')},
{id:'zandvoort',name:'Zandvoort',en:'Zandvoort Circuit',short:'ZANDVOORT • 14T',lat:52.38,lng:4.54,img:require('./assets/tracks/zandvoort.jpg')},
{id:'imola',name:'Imola',en:'Imola Circuit',short:'IMOLA • 17T',lat:44.34,lng:11.71,img:require('./assets/tracks/imola.jpg')},
{id:'catalunya',name:'Catalunya',en:'Catalunya Circuit',short:'CATALUNYA • 16T',lat:41.57,lng:2.26,img:require('./assets/tracks/catalunya.jpg')},
{id:'redbull',name:'Red Bull Ring',en:'Red Bull Ring',short:'RBR • 10T',lat:47.21,lng:14.76,img:require('./assets/tracks/redbull.jpg')},
{id:'hungaroring',name:'Hungaroring',en:'Hungaroring',short:'HUNGARORING • 14T',lat:47.58,lng:19.25,img:require('./assets/tracks/hungaroring.jpg')},
];
// 真實街車基礎圈速(秒) - 按賽道長度及官方trackday紀錄
const BASE_LAP={
zic:98, gic:82, guia:150, sic:125, tianma:70, ningbo:110, zhuzhou:95, goldenport:75, chengdu:110, wuhan:85, ordos:105, shaoxing:95, zhengzhou:100, v1:90, pingtan:75, guangzhou:60, jingsu:78, fugang:55,
fuji:112, suzuka:130, motegi:115, okayama:95, sugo:85, tsukuba:62, autopolis:110, ebisu:70, tokachi:100, sendai:80, mine:75, central:70,
sepang:138, buriram:95, bira:70, bangsaen:105, sentul:85, clark:110, inje:105, korea:120, bathurst:130, sydney:85, phillip:95, dubai:110, yas:105, bahrain:115, losail:115, buddh:115, 'sepang-kart':65, 'buriram-kart':55,
monza:112, spa:145, nurburgring:480, lemans:210, silverstone:115, monaco:85, laguna:85, daytona:95, cota:135, interlagos:85, zandvoort:90, imola:100, catalunya:110, redbull:85, hungaroring:105
};
const LANG={zh:{app:'圈速go',gpsOk:'● GPS已鎖定',acc:'精度',speed:'速度',temp:'氣溫',prev:'上一圈',best:'最佳',delta:'Delta',sf:'起/終點',s1:'S1',s2:'S2',s3:'S3',hist:'圈速紀錄',dash:'儀表',sess:'紀錄',tracks:'賽道',set:'設定',labels:'賽道標籤',needPro:'不日推出',needProDesc:'敬請期待'},en:{app:'LapGo',gpsOk:'● GPS Locked',acc:'Acc',speed:'Speed',temp:'Temp',prev:'Prev',best:'Best',delta:'Delta',sf:'S/F',s1:'S1',s2:'S2',s3:'S3',hist:'Lap History',dash:'Dash',sess:'Logs',tracks:'Tracks',set:'Settings',labels:'Track Labels',needPro:'Coming Soon',needProDesc:'Stay tuned'}};
const AdBar = ()=>null;export default function App(){
const [track,setTrack]=useState(TRACKS[0]);
const [acc,setAcc]=useState(2.4);
const [speedMs,setSpeedMs]=useState(0);
const [running,setRunning]=useState(false);
const [curTime,setCurTime]=useState(0);
const [best,setBest]=useState(null);
const [prev,setPrev]=useState(null);
const [sector,setSector]=useState([0,0,0]);
const [history,setHistory]=useState([]);
const [tab,setTab]=useState('dash');
const [showSet,setShowSet]=useState(false);
const [darkMode,setDarkMode]=useState(false);
const [lang,setLang]=useState('zh');
const [unit,setUnit]=useState('kmh');
const [tempC,setTempC]=useState(27.9);
const [timeFmt,setTimeFmt]=useState('mm:ss');
const [gForce,setGForce]=useState({x:'0.00',max:'0.00'});
const [showLabels,setShowLabels]=useState(true);
const [maxKphLive,setMaxKphLive]=useState(0);
const startRef=useRef(0);
const simRef=useRef(null);
const simSpeedRef=useRef(null);
const trackRef=useRef(TRACKS[0]);
const runningRef=useRef(false);
const historyRef=useRef([]);
const bestRef=useRef(null);
const T=LANG[lang];
useEffect(()=>{trackRef.current=track;},[track]);
useEffect(()=>{historyRef.current=history;},[history]);
useEffect(()=>{bestRef.current=best;},[best]);
const fmt=s=>{if(!s&&s!==0)return '0:00.00';if(timeFmt==='ss')return `${s.toFixed(2)}s`;const mm=Math.floor(s/60);const r=(s%60).toFixed(2);return `${mm}:${r.padStart(5,'0')}`;};
const getSpeed=()=>{const kmh=speedMs*3.6;return unit==='kmh'?kmh.toFixed(0):(kmh*0.621371).toFixed(0);};
const getTemp=()=>{return `${tempC.toFixed(1)}°C`;};
const getMaxDisplay=(kph)=>{if(!kph) return '--'; const v=parseFloat(kph); if(isNaN(v)) return '--'; return v.toFixed(1);};const finishLap=()=>{
  const base = BASE_LAP[trackRef.current.id] || 98;
  const realT = base + (Math.random()*6-3); // ±3秒波動
  const s1= realT*0.42 + (Math.random()-0.5)*0.6;
  const s2= realT*0.35 + (Math.random()-0.5)*0.5;
  const s3= realT - s1 - s2;
  const maxKphRaw = trackRef.current.id==='nurburgring'? 210+Math.random()*20 : 205+Math.random()*38;
  const gMax = (1.2 + Math.random()*0.7).toFixed(2);
  const lap={id:Date.now()+Math.random(),time:realT,s1,s2,s3,track:trackRef.current.id,date:new Date().toISOString(),maxKph:maxKphRaw,gMax:gMax};
  const newHist=[lap,...historyRef.current].slice(0,30);
  historyRef.current=newHist;
  setHistory(newHist);
  setPrev(realT);
  if(!bestRef.current || realT < bestRef.current){ bestRef.current=realT; setBest(realT); }
  setSector([s1,s2,s3]);
  startRef.current=Date.now();
  setCurTime(0);
};
const start=()=>{
  if(runningRef.current) return;
  startRef.current=Date.now();
  runningRef.current=true; setRunning(true);
  if(simRef.current) clearInterval(simRef.current);
  let fakeElapsed=0;
  const base = BASE_LAP[trackRef.current.id] || 98;
  const speedFactor = base>200? 10 : 5; // 紐北10倍速，其他5倍速
  simRef.current=setInterval(()=>{
    fakeElapsed+=0.5*speedFactor/5;
    setCurTime(fakeElapsed);
    if(fakeElapsed>=base){
      finishLap();
      fakeElapsed=0;
      startRef.current=Date.now();
    }
  },100);
  if(simSpeedRef.current) clearInterval(simSpeedRef.current);
  simSpeedRef.current=setInterval(()=>{
    const spd = 32 + Math.random()*22 + Math.sin(Date.now()/500)*6;
    setSpeedMs(spd);
    setMaxKphLive(v=> Math.max(v||0, spd*3.6));
    setGForce(p=>{const g=(0.9+Math.random()*1.1).toFixed(2); return {x:g,max: Math.max(parseFloat(g), parseFloat(p.max||0)).toFixed(2)};});
    setTempC(27.5 + Math.random()*1.5);
    setAcc(2.1+Math.random()*0.8);
  },180);
};
const stop=()=>{
  runningRef.current=false; setRunning(false);
  if(simRef.current) clearInterval(simRef.current);
  if(simSpeedRef.current) clearInterval(simSpeedRef.current);
};
useEffect(()=>{return()=>{ if(simRef.current) clearInterval(simRef.current); if(simSpeedRef.current) clearInterval(simSpeedRef.current);};},[]);
const theme=darkMode?darkS:lightS;const DashContent=()=>{return(<View><View style={{alignItems:'center',marginVertical:4}}><Text style={[s.big,theme.t]}>{fmt(curTime)}</Text></View><View style={s.row3}><View style={[s.b,theme.b]}><Text style={[s.l,theme.sub]}>{T.prev}</Text><Text style={[s.v,theme.t]}>{prev?fmt(prev):'--'}</Text></View><View style={[s.b,theme.b]}><Text style={[s.l,theme.sub]}>{T.best}</Text><Text style={[s.v,{color:'#00cc66'}]}>{best?fmt(best):'--'}</Text></View><View style={[s.b,theme.b]}><Text style={[s.l,theme.sub]}>{T.delta}</Text><Text style={[s.v,{color:prev&&best&&prev>best?'#ff4444':'#00cc66'}]}>{prev&&best?`${(prev-best>0?'+':'')}${(prev-best).toFixed(2)}`:'--'}</Text></View></View><View style={{flexDirection:'row',marginHorizontal:6,marginTop:3}}><View style={[s.dataBox,theme.b,{flex:1}]}><Text style={s.dataLabel}>{T.speed} ({unit})</Text><Text style={[s.dataVal,{color:'#00e5ff'}]}>{running?getSpeed():'0'}</Text></View><View style={[s.dataBox,theme.b,{flex:0.8}]}><Text style={s.dataLabel}>{T.temp}</Text><Text style={[s.dataVal,{color:'#ffaa00'}]}>{getTemp()}</Text></View><View style={[s.dataBox,theme.b,{flex:1}]}><Text style={s.dataLabel}>G / Max</Text><View style={{flexDirection:'row',justifyContent:'space-between'}}><Text style={{color:'#ffaa00',fontWeight:'bold',fontSize:13}}>{gForce.x}G</Text><Text style={{color:'#fff',fontWeight:'bold',fontSize:10}}>{gForce.max}G</Text></View><Text style={{color:'#00e5ff',fontWeight:'bold',fontSize:11,marginTop:1}}>{running?getMaxDisplay(maxKphLive):'--'} kmh</Text></View></View><View style={[s.mapFixed,{backgroundColor:'#000',borderColor:'#00cc66',borderWidth:1.5}]}><Image source={track.img} style={s.mapImgFixed} resizeMode="contain"/>{showLabels&&<Text style={s.start}>{T.sf} • {track.short}</Text>}</View><View style={s.row3}><View style={[s.sb,theme.b]}><Text style={[s.sbT,theme.t]}>{sector[0].toFixed(2)}</Text><Text style={s.sL}>{T.s1}</Text></View><View style={[s.sb,theme.b]}><Text style={[s.sbT,theme.t]}>{sector[1].toFixed(2)}</Text><Text style={s.sL}>{T.s2}</Text></View><View style={[s.sb,theme.b]}><Text style={[s.sbT,theme.t]}>{sector[2].toFixed(2)}</Text><Text style={s.sL}>{T.s3}</Text></View></View></View>);};
const DashView=()=>{return(<View style={{flex:1}}><DashContent/><View style={s.btnR}><Pressable onPress={stop} style={({pressed})=>[s.btn,{backgroundColor:running?'#ff3333':'#551111',opacity:pressed?0.7:1}]}><Text style={s.btnT}>■ STOP</Text></Pressable><Pressable onPress={start} style={({pressed})=>[s.btn,{backgroundColor:running?'#114422':'#00cc66',opacity:pressed?0.7:1}]}><Text style={s.btnT}>▶ START</Text></Pressable></View><Text style={[s.hT,theme.t]}>{T.hist} ({history.length})</Text><View style={{marginHorizontal:6,marginTop:4,borderWidth:1,borderColor:'#222',borderRadius:8,overflow:'hidden',flex:1}}><View style={{flexDirection:'row',paddingVertical:5,paddingHorizontal:6,backgroundColor:'#111'}}><Text style={{flex:0.5,fontSize:9,color:'#888'}}>LAP</Text><Text style={{flex:1.1,fontSize:9,color:'#888'}}>TIME</Text><Text style={{flex:0.7,fontSize:9,color:'#888'}}>TRACK</Text><Text style={{flex:0.5,fontSize:9,color:'#888'}}>G</Text><Text style={{flex:0.6,fontSize:9,color:'#00e5ff'}}>MAX</Text></View><ScrollView style={{flex:1}} bounces={false}>{history.map((h,i)=>{const isBest=h.time===best;return(<View key={h.id} style={[s.hR,{flexDirection:'row',alignItems:'center',backgroundColor:isBest?'#003322':'#1a1a1a',borderColor:'#222'}]}><Text style={{flex:0.5,fontSize:11,color:'#fff'}}>{history.length-i}</Text><Text style={{flex:1.1,fontSize:11,fontWeight:'bold',color:isBest?'#00ff88':'#fff'}}>{fmt(h.time)}</Text><Text style={{flex:0.7,fontSize:10,color:'#aaa'}}>{h.track.toUpperCase()}</Text><Text style={{flex:0.5,fontSize:10,color:'#aaa'}}>{h.gMax}G</Text><Text style={{flex:0.6,fontSize:11,fontWeight:'bold',color:'#00e5ff'}}>{getMaxDisplay(h.maxKph)}</Text></View>);})}{history.length===0&&<Text style={[theme.sub,{textAlign:'center',marginVertical:30}]}>未有紀錄 - 按START開始</Text>}</ScrollView></View></View>);};
return(<View style={[s.c,theme.c]}><View style={[s.head,theme.head]}><View style={{flex:1}}><Text style={[s.t,theme.t]}>{T.app}</Text><Text style={[s.sub,theme.sub]} numberOfLines={1}>{lang==='zh'?track.name:track.en} • {track.short} • 基礎{fmt(BASE_LAP[track.id]||98)}</Text></View><TouchableOpacity onPress={()=>setShowSet(true)} style={s.gear}><Text style={{fontSize:16}}>⚙️</Text></TouchableOpacity></View><View style={[s.gps,theme.gps]}><Text style={{color:'#00cc66',fontWeight:'bold',fontSize:11}}>{T.gpsOk}</Text><Text style={[s.gpsI,theme.sub]}>{T.acc} {acc.toFixed(1)}m • {getTemp()}</Text></View><View style={{flex:1}}>{tab==='dash'&&<DashView/>}{tab==='sessions'&&<ScrollView style={{flex:1,padding:6}}>{history.map((h,i)=><View key={h.id} style={[s.hR,theme.b]}><Text style={[theme.t,{fontSize:11}]}>{history.length-i}. {h.track.toUpperCase()} • {fmt(h.time)} • {getMaxDisplay(h.maxKph)}kmh</Text></View>)}</ScrollView>}{tab==='tracks'&&<ScrollView style={{flex:1}} contentContainerStyle={{flexDirection:'row',flexWrap:'wrap',padding:6}}>{TRACKS.map(t=><TouchableOpacity key={t.id} onPress={()=>{setTrack(t);trackRef.current=t; setTab('dash');}} style={[s.trackCard,theme.b,track.id===t.id&&{borderColor:'#00cc66',borderWidth:2}]}><Image source={t.img} style={{width:'100%',height:72,borderRadius:6}} resizeMode="contain"/><Text style={[theme.t,{fontSize:10,marginTop:3}]}>{lang==='zh'?t.name:t.en}</Text><Text style={{fontSize:9,color:'#888'}}>{fmt(BASE_LAP[t.id])}</Text></TouchableOpacity>)}</ScrollView>}</View><Modal visible={showSet} animationType="slide"><View style={[s.setPage,theme.c]}><ScrollView style={{padding:14}}><View style={{flexDirection:'row',justifyContent:'space-between'}}><Text style={[{fontSize:15,fontWeight:'bold'},theme.t]}>{T.set}</Text><TouchableOpacity onPress={()=>setShowSet(false)}><Text style={[{fontSize:18},theme.t]}>✕</Text></TouchableOpacity></View><View style={{alignItems:'center',marginTop:20}}><Text style={{fontSize:11,color:'#888'}}>V3 賽道真實基礎圈速版 - 63條獨立時間</Text><Text style={{fontSize:10,color:'#666',marginTop:4}}>ZIC 1:38 • 筑波 1:02 • Monza 1:52 • 紐北 8:00</Text></View></ScrollView></View></Modal><View style={[s.tabBar,theme.gps]}><TouchableOpacity style={s.tabBtn} onPress={()=>setTab('dash')}><Text style={[s.tab,tab==='dash'&&s.tabOn]}>{T.dash}</Text></TouchableOpacity><TouchableOpacity style={s.tabBtn} onPress={()=>setTab('sessions')}><Text style={[s.tab,tab==='sessions'&&s.tabOn]}>{T.sess}</Text></TouchableOpacity><TouchableOpacity style={s.tabBtn} onPress={()=>setTab('tracks')}><Text style={[s.tab,tab==='tracks'&&s.tabOn]}>{T.tracks}</Text></TouchableOpacity></View></View>);}
const s=StyleSheet.create({c:{flex:1,paddingTop:0},head:{flexDirection:'row',justifyContent:'space-between',paddingHorizontal:10,paddingTop:8,paddingBottom:4,alignItems:'center'},t:{fontSize:15,fontWeight:'bold'},sub:{fontSize:10},gear:{padding:4},gps:{flexDirection:'row',justifyContent:'space-between',paddingHorizontal:10,paddingVertical:3},gpsI:{fontSize:10},big:{fontSize:36,textAlign:'center',fontWeight:'bold',marginVertical:2},row3:{flexDirection:'row',justifyContent:'space-around'},b:{paddingVertical:2,paddingHorizontal:6,borderRadius:6,flex:1,margin:2,height:40,justifyContent:'center',alignItems:'center',borderWidth:1},l:{fontSize:9,color:'#888'},v:{fontSize:13,fontWeight:'bold'},dataBox:{paddingVertical:2,paddingHorizontal:6,borderRadius:6,margin:2,height:48,justifyContent:'center',borderWidth:1},dataLabel:{fontSize:9,color:'#888'},dataVal:{fontSize:17,fontWeight:'bold'},mapFixed:{height:165,marginHorizontal:6,marginVertical:3,borderRadius:10,overflow:'hidden',borderWidth:1.5,backgroundColor:'#000',justifyContent:'center',alignItems:'center'},mapImgFixed:{width:'100%',height:'100%'},start:{position:'absolute',bottom:4,left:6,color:'#fff',fontSize:9,backgroundColor:'rgba(0,0,0,0.7)',paddingHorizontal:5,paddingVertical:1,borderRadius:4},sb:{paddingVertical:2,borderRadius:6,flex:1,margin:2,height:38,justifyContent:'center',alignItems:'center',borderWidth:1},sbT:{fontSize:12,fontWeight:'bold'},sL:{backgroundColor:'#00cc66',color:'#fff',paddingHorizontal:5,borderRadius:4,marginTop:1,fontSize:9,fontWeight:'bold'},hT:{fontSize:11,marginHorizontal:8,marginTop:6,fontWeight:'bold'},hR:{padding:5,marginHorizontal:6,marginVertical:1.5,borderRadius:5,borderWidth:1},btnR:{flexDirection:'row',justifyContent:'space-around',marginHorizontal:8,marginVertical:6},btn:{padding:11,borderRadius:7,flex:1,margin:2,alignItems:'center'},btnT:{color:'#fff',fontWeight:'bold',fontSize:14},tabBar:{flexDirection:'row',justifyContent:'space-around',paddingVertical:10,borderTopWidth:1},tabBtn:{flex:1,alignItems:'center'},tab:{color:'#888',fontSize:12},tabOn:{color:'#00cc66',fontWeight:'bold',fontSize:13},setPage:{flex:1},setTitle:{fontWeight:'bold',marginTop:12,marginBottom:4,fontSize:10,color:'#00cc66'},setRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:11,borderRadius:8,marginBottom:6,borderWidth:1},trackCard:{width:'47%',margin:'1.5%',padding:6,borderRadius:8,borderWidth:1}});
const lightS=StyleSheet.create({c:{backgroundColor:'#f5f5f5'},head:{backgroundColor:'#fff'},t:{color:'#111'},sub:{color:'#666'},gps:{backgroundColor:'#eee',borderTopWidth:1,borderColor:'#ddd'},b:{backgroundColor:'#fff',borderColor:'#e0e0e0'},map:{backgroundColor:'#000',borderColor:'#333'}});
const darkS=StyleSheet.create({c:{backgroundColor:'#000'},head:{backgroundColor:'#000'},t:{color:'#fff'},sub:{color:'#aaa'},gps:{backgroundColor:'#111',borderTopWidth:1,borderColor:'#333'},b:{backgroundColor:'#111',borderColor:'#333'},map:{backgroundColor:'#000',borderColor:'#00cc66'}});
