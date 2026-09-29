import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable, Alert, Image, Modal, Switch, ScrollView } from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
const DEMO_SIM = true;
let BannerAd, BannerAdSize, MobileAds;
try{ const A=require('react-native-google-mobile-ads'); BannerAd=A.BannerAd; BannerAdSize=A.BannerAdSize; MobileAds=A.MobileAds; }catch(e){}
const BANNER_ID = __DEV__? "ca-app-pub-3940256099942544/6300978111" : (Constants.expoConfig?.extra?.adUnitId || "ca-app-pub-9890149028563226/7083933962");
const TRACKS=[
{id:'zic',name:'珠海國際賽車場',en:'Zhuhai Circuit',short:'ZIC • ZHUHAI • 14T',lat:22.3598,lng:113.5678,r1:0.30,r2:0.32,img:require('./assets/tracks/zic.jpg'),baseLap:98.8},
{id:'gic',name:'廣東國際賽車場',en:'Guangdong Circuit',short:'GIC • 13T',lat:23.1216,lng:112.559,r1:0.33,r2:0.30,img:require('./assets/tracks/gic.jpg'),baseLap:96.2},
{id:'guia',name:'東望洋賽道',en:'Guia Circuit',short:'GUIA • MACAU • 22T',lat:22.197,lng:113.555,r1:0.35,r2:0.28,img:require('./assets/tracks/guia.jpg'),baseLap:142.5},
{id:'sic',name:'上海國際賽道',en:'Shanghai Circuit',short:'SIC • 16T',lat:31.339,lng:121.221,r1:0.32,r2:0.34,img:require('./assets/tracks/sic.jpg'),baseLap:121.4},
{id:'tianma',name:'上海天馬',en:'Shanghai Tianma',short:'TIANMA • 14T',lat:31.076,lng:121.131,r1:0.31,r2:0.33,img:require('./assets/tracks/tianma.jpg'),baseLap:68.5},
{id:'ningbo',name:'寧波國際',en:'Ningbo Circuit',short:'NINGBO • 22T',lat:30.33,lng:121.45,r1:0.29,r2:0.35,img:require('./assets/tracks/ningbo.jpg'),baseLap:112.3},
{id:'zhuzhou',name:'株洲國際',en:'Zhuzhou Circuit',short:'ZHUZHOU • 14T',lat:27.85,lng:113.15,r1:0.30,r2:0.32,img:require('./assets/tracks/zhuzhou.jpg'),baseLap:98.1},
{id:'fuji',name:'富士賽道',en:'Fuji Speedway',short:'FUJI • 16T',lat:35.3717,lng:138.927,r1:0.34,r2:0.29,img:require('./assets/tracks/fuji.jpg'),baseLap:102.5},
{id:'suzuka',name:'鈴鹿賽道',en:'Suzuka Circuit',short:'SUZUKA • 18T',lat:34.8431,lng:136.5409,r1:0.32,r2:0.33,img:require('./assets/tracks/suzuka.jpg'),baseLap:132.8},
{id:'sepang',name:'雪邦賽道',en:'Sepang Circuit',short:'SEPANG • 15T',lat:2.7606,lng:101.738,r1:0.30,r2:0.34,img:require('./assets/tracks/sepang.jpg'),baseLap:126.2},
];
const LANG={zh:{app:'圈速go',gpsOk:'● GPS已鎖定',gpsNo:'○ 搜尋中...',acc:'精度',speed:'速度',temp:'氣溫',prev:'上一圈',best:'最佳',delta:'Delta',sf:'起/終點',s1:'S1',s2:'S2',s3:'S3',hist:'圈速紀錄 可滾動',dash:'儀表',sess:'紀錄',tracks:'賽道',set:'設定'},en:{app:'LapGo',gpsOk:'● GPS Locked',gpsNo:'○ Searching...',acc:'Acc',speed:'Speed',temp:'Temp',prev:'Prev',best:'Best',delta:'Delta',sf:'S/F',s1:'S1',s2:'S2',s3:'S3',hist:'Lap History',dash:'Dash',sess:'Logs',tracks:'Tracks',set:'Settings'}};
function dist(a,b,c,d){const R=6371000;const dLat=(c-a)*Math.PI/180;const dLng=(d-b)*Math.PI/180;const x=Math.sin(dLat/2)**2+Math.cos(a*Math.PI/180)*Math.cos(c*Math.PI/180)*Math.sin(dLng/2)**2;return R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x));}
const AdBar = React.memo(({theme})=>{
  const shellStyle = [{width:'100%',height:60,borderTopWidth:1,backgroundColor:'#080808'}, theme.gps, {borderColor:'#222'}];
  return <View style={shellStyle} />;
});function TimerText({startRef, running, timeFmt, style, lastRef}){
  const [,force]=useState(0);
  useEffect(()=>{ if(!running) return; const id=setInterval(()=>force(v=>v+1),80); return()=>clearInterval(id); },[running]);
  const sec = running? (Date.now()-startRef.current)/1000 : (lastRef.current||0);
  if(running) lastRef.current=sec;
  const fmt=s=>{ if(!s||s<=0) return '0:00.00'; if(timeFmt==='ss') return `${s.toFixed(2)}s`; const mm=Math.floor(s/60); return `${mm}:${(s%60).toFixed(2).padStart(5,'0')}`; };
  return <Text style={style}>{fmt(sec)}</Text>;
}
export default function App(){
const [track,setTrack]=useState(TRACKS[0]);const [locked,setLocked]=useState(true);
const [acc,setAcc]=useState(2.8);const [speedMs,setSpeedMs]=useState(0);
const [running,setRunning]=useState(false);const [best,setBest]=useState(null);const [prev,setPrev]=useState(null);
const [sector,setSector]=useState([0,0,0]);const [history,setHistory]=useState([]);const [tab,setTab]=useState('dash');const [showSet,setShowSet]=useState(false);const [darkMode,setDarkMode]=useState(true);const [lang,setLang]=useState('zh');const [ready,setReady]=useState(true);
const [calibDist,setCalibDist]=useState(25);const [minTrigger,setMinTrigger]=useState(15);const [autoLap,setAutoLap]=useState(true);const [unit,setUnit]=useState('kmh');const [tempC,setTempC]=useState(32);const [timeFmt,setTimeFmt]=useState('mm:ss');const [gForce,setGForce]=useState({x:'0.00',max:'0.00'});const [maxKphLive,setMaxKphLive]=useState(0);
const startRef=useRef(0);const lastTimeRef=useRef(0);const trackRef=useRef(TRACKS[0]);const runningRef=useRef(false);const maxSpeedLapRef=useRef(0);const finishLapRef=useRef(null);const histScrollRef=useRef(null);
const simSpeedRef=useRef(75);const simProgressRef=useRef(0);
const T=LANG[lang];
useEffect(()=>{trackRef.current=track;},[track]);
useEffect(()=>{
  let id=setInterval(()=>{
    if(!runningRef.current) return;
    simProgressRef.current += 0.006 + Math.random()*0.002;
    if(simProgressRef.current>1) simProgressRef.current=0;
    const p=simProgressRef.current;
    let targetKmh;
    if(p<0.18) targetKmh=85+p*850;
    else if(p<0.32) targetKmh=205-Math.sin((p-0.18)*22)*85;
    else if(p<0.48) targetKmh=155+p*180;
    else if(p<0.65) targetKmh=235-Math.sin((p-0.48)*19)*120;
    else if(p<0.82) targetKmh=105+p*90;
    else targetKmh=255-Math.sin((p-0.82)*20)*70;
    targetKmh+=(Math.random()-0.5)*4;
    simSpeedRef.current = simSpeedRef.current*0.90 + targetKmh*0.10;
    setSpeedMs(simSpeedRef.current/3.6);
    if(simSpeedRef.current>maxSpeedLapRef.current){ maxSpeedLapRef.current=simSpeedRef.current; setMaxKphLive(simSpeedRef.current); }
    const g = Math.abs(Math.sin(p*28))*1.1 + Math.random()*0.25;
    setGForce(prev=>({x:g.toFixed(2), max: Math.max(g, parseFloat(prev.max)||0).toFixed(2)}));
    if(p>0.985 && Date.now()-startRef.current>minTrigger*1000){
      if(finishLapRef.current) finishLapRef.current();
      simProgressRef.current=0;
    }
  },100);
  return()=>clearInterval(id);
},[minTrigger]);const fmt=s=>{if(!s||s<=0)return '--:--.--';if(timeFmt==='ss')return `${s.toFixed(2)}s`;const mm=Math.floor(s/60);const r=(s%60).toFixed(2);return `${mm}:${r.padStart(5,'0')}`;};
const getSpeed=()=>{const kmh=speedMs*3.6;return unit==='kmh'?kmh.toFixed(0):(kmh*0.621371).toFixed(0);};
const getTemp=()=>{return `32.0°C`;};
const getMaxDisplay=(kph)=>{if(!kph||kph<1) return '--'; const v=parseFloat(kph); return v.toFixed(1);};
const start=()=>{ if(running) return; startRef.current=Date.now(); lastTimeRef.current=0; maxSpeedLapRef.current=simSpeedRef.current||70; setMaxKphLive(maxSpeedLapRef.current); runningRef.current=true; setRunning(true); setGForce({x:'0.00',max:'0.00'}); simProgressRef.current=0; };
const stop=()=>{ runningRef.current=false; setRunning(false); };
const handleTrack=(t)=>{ runningRef.current=false; setRunning(false); lastTimeRef.current=0; startRef.current=0; setSector([0,0,0]); setPrev(null); setMaxKphLive(0); maxSpeedLapRef.current=0; simSpeedRef.current=80; simProgressRef.current=0; setTrack(t); trackRef.current=t; setTab('dash'); };
const finishLap=async()=>{
  const raw=(Date.now()-startRef.current)/1000; if(raw<minTrigger) return;
  const tr=trackRef.current; const base=tr.baseLap||100;
  const jitter=(Math.random()-0.5)*1.2;
  const finalTime = Math.max(base+jitter, minTrigger+1);
  const r1=tr.r1; const r2=tr.r2; const r3=1-r1-r2;
  const s1=finalTime*r1; const s2=finalTime*r2; const s3=finalTime*r3;
  const maxKphRaw=maxSpeedLapRef.current||210+Math.random()*25; maxSpeedLapRef.current=0; setMaxKphLive(0);
  const lap={id:Date.now(),time:finalTime,s1,s2,s3,track:trackRef.current.id,date:new Date().toISOString(),maxKph:maxKphRaw,gMax:gForce.max};
  let nh=[lap,...history]; if(nh.length>100) nh=nh.slice(0,100);
  setHistory(nh); setPrev(finalTime); if(!best||finalTime<best) setBest(finalTime); setSector([s1,s2,s3]); startRef.current=Date.now(); lastTimeRef.current=0;
  setTimeout(()=>{histScrollRef.current?.scrollTo({y:0,animated:true});},80);
};
useEffect(()=>{finishLapRef.current=finishLap;},[history,best,gForce,minTrigger]);
const theme=darkMode?darkS:lightS;const DashContent=()=>{return(<View><View style={{alignItems:'center',marginVertical:4}}><TimerText startRef={startRef} running={running} timeFmt={timeFmt} lastRef={lastTimeRef} style={[s.big,theme.t]} /></View><View style={s.row3}><View style={[s.b,theme.b]}><Text style={[s.l,theme.sub]}>{T.prev}</Text><Text style={[s.v,theme.t]}>{prev?fmt(prev):'--'}</Text></View><View style={[s.b,theme.b]}><Text style={[s.l,theme.sub]}>{T.best}</Text><Text style={[s.v,{color:'#00cc66'}]}>{best?fmt(best):'--'}</Text></View><View style={[s.b,theme.b]}><Text style={[s.l,theme.sub]}>Delta</Text><Text style={[s.v,{color: prev&&best&&prev>best?'#ff4444':'#00cc66'}]}>{prev&&best?`${(prev-best>0?'+':'')}${(prev-best).toFixed(2)}`:'--'}</Text></View></View><View style={{flexDirection:'row',marginHorizontal:6,marginTop:3}}><View style={[s.dataBox,theme.b,{flex:1}]}><Text style={s.dataLabel}>{T.speed} ({unit})</Text><Text style={[s.dataVal,{color:'#00e5ff'}]}>{getSpeed()}</Text></View><View style={[s.dataBox,theme.b,{flex:0.8}]}><Text style={s.dataLabel}>{T.temp}</Text><Text style={[s.dataVal,{color:'#ffaa00'}]}>{getTemp()}</Text></View><View style={[s.dataBox,theme.b,{flex:1}]}><Text style={s.dataLabel}>G / Max</Text><View style={{flexDirection:'row',justifyContent:'space-between'}}><Text style={{color:'#ffaa00',fontWeight:'bold',fontSize:13}}>{gForce.x}G</Text><Text style={[theme.t,{fontWeight:'bold',fontSize:10}]}>{gForce.max}G</Text></View><Text style={{color:'#00e5ff',fontWeight:'bold',fontSize:11,marginTop:1}}>{getMaxDisplay(maxKphLive)} {unit}</Text></View></View><View style={[s.mapFixed,{backgroundColor:'#000',borderColor:'#00cc66',borderWidth:1.5}]}><Image source={track.img} style={s.mapImgFixed} resizeMode="contain"/><Text style={s.start}>{T.sf} • {track.short}</Text></View><View style={s.row3}><View style={[s.sb,theme.b]}><Text style={[s.sbT,theme.t]}>{sector[0].toFixed(2)}</Text><Text style={s.sL}>{T.s1}</Text></View><View style={[s.sb,theme.b]}><Text style={[s.sbT,theme.t]}>{sector[1].toFixed(2)}</Text><Text style={s.sL}>{T.s2}</Text></View><View style={[s.sb,theme.b]}><Text style={[s.sbT,theme.t]}>{sector[2].toFixed(2)}</Text><Text style={s.sL}>{T.s3}</Text></View></View></View>);};
const DashView=()=>{ return(<View style={{flex:1}}><DashContent/><View style={s.btnR}><Pressable onPress={stop} style={({pressed})=>[s.btn,{backgroundColor:running?'#ff3333':'#551111',opacity:pressed?0.7:1}]}><Text style={s.btnT}>■ STOP</Text></Pressable><Pressable onPress={start} style={({pressed})=>[s.btn,{backgroundColor:running?'#114422':'#00cc66',opacity:pressed?0.7:1}]}><Text style={s.btnT}>▶ START</Text></Pressable></View><Text style={[s.hT,theme.t]}>{T.hist} ({history.length})</Text><View style={{marginHorizontal:6,marginTop:4,borderWidth:1,borderColor:'#222',borderRadius:8,overflow:'hidden',height:260}}><View style={{flexDirection:'row',paddingVertical:5,paddingHorizontal:6,backgroundColor:'#111'}}><Text style={{flex:0.5,fontSize:9,color:'#888'}}>LAP</Text><Text style={{flex:1.1,fontSize:9,color:'#888'}}>TIME</Text><Text style={{flex:0.7,fontSize:9,color:'#888'}}>TRACK</Text><Text style={{flex:0.5,fontSize:9,color:'#888'}}>G</Text><Text style={{flex:0.6,fontSize:9,color:'#00e5ff'}}>MAX</Text></View><ScrollView ref={histScrollRef} style={{flex:1}} bounces={true} showsVerticalScrollIndicator={true}>{history.map((h,i)=>{const isBest=h.time===best;return(<View key={h.id} style={[s.hR,{flexDirection:'row',alignItems:'center',backgroundColor:isBest?'#003322':'#1a1a1a',borderColor:'#222'}]}><Text style={{flex:0.5,fontSize:11,color:'#fff'}}>{history.length-i}</Text><Text style={{flex:1.1,fontSize:11,fontWeight:'bold',color:isBest?'#00ff88':'#fff'}}>{fmt(h.time)}</Text><Text style={{flex:0.7,fontSize:10,color:'#aaa'}}>{h.track.toUpperCase()}</Text><Text style={{flex:0.5,fontSize:10,color:'#aaa'}}>{h.gMax||0}G</Text><Text style={{flex:0.6,fontSize:11,fontWeight:'bold',color:'#00e5ff'}}>{getMaxDisplay(h.maxKph)}</Text></View>);})}{history.length===0&&<Text style={[theme.sub,{textAlign:'center',marginVertical:30}]}>未有紀錄 - 按START開始</Text>}</ScrollView></View></View>);};
return(<View style={[s.c,theme.c]}><View style={[s.head,theme.head]}><View style={{flex:1}}><Text style={[s.t,theme.t]}>{T.app}</Text><Text style={[s.sub,theme.sub]} numberOfLines={1}>{track.name} • {track.short}</Text></View><TouchableOpacity onPress={()=>setShowSet(true)} style={s.gear}><Text style={{fontSize:16}}>⚙️</Text></TouchableOpacity></View><View style={[s.gps,theme.gps]}><Text style={{color:'#00cc66',fontWeight:'bold',fontSize:11}}>{T.gpsOk}</Text><Text style={[s.gpsI,theme.sub]}>{T.acc} {acc.toFixed(1)}m • 32.0°C • 1Hz</Text></View><View style={{flex:1}}>{tab==='dash'&&<DashView/>}{tab==='tracks'&&<ScrollView style={{flex:1}} contentContainerStyle={{flexDirection:'row',flexWrap:'wrap',padding:6}}>{TRACKS.map(t=><TouchableOpacity key={t.id} onPress={()=>handleTrack(t)} style={[s.trackCard,theme.b,track.id===t.id&&{borderColor:'#00cc66',borderWidth:2}]}><Image source={t.img} style={{width:'100%',height:72,borderRadius:6}} resizeMode="contain"/><Text style={[theme.t,{fontSize:10,marginTop:3}]}>{t.name}</Text></TouchableOpacity>)}</ScrollView>}</View><AdBar theme={theme}/><View style={[s.tabBar,theme.gps]}><TouchableOpacity style={s.tabBtn} onPress={()=>setTab('dash')}><Text style={[s.tab,tab==='dash'&&s.tabOn]}>{T.dash}</Text></TouchableOpacity><TouchableOpacity style={s.tabBtn} onPress={()=>setTab('tracks')}><Text style={[s.tab,tab==='tracks'&&s.tabOn]}>{T.tracks}</Text></TouchableOpacity></View></View>);}
const s=StyleSheet.create({c:{flex:1,paddingTop:0},head:{flexDirection:'row',justifyContent:'space-between',paddingHorizontal:10,paddingTop:8,paddingBottom:4,alignItems:'center'},t:{fontSize:15,fontWeight:'bold'},sub:{fontSize:10},gear:{padding:4},gps:{flexDirection:'row',justifyContent:'space-between',paddingHorizontal:10,paddingVertical:3},gpsI:{fontSize:10},big:{fontSize:36,textAlign:'center',fontWeight:'bold',marginVertical:2,letterSpacing:1},row3:{flexDirection:'row',justifyContent:'space-around'},b:{paddingVertical:2,paddingHorizontal:6,borderRadius:6,flex:1,margin:2,height:40,justifyContent:'center',alignItems:'center',borderWidth:1},l:{fontSize:9,color:'#888'},v:{fontSize:13,fontWeight:'bold'},dataBox:{paddingVertical:2,paddingHorizontal:6,borderRadius:6,margin:2,height:48,justifyContent:'center',borderWidth:1},dataLabel:{fontSize:9,color:'#888'},dataVal:{fontSize:17,fontWeight:'bold'},mapFixed:{height:135,marginHorizontal:6,marginVertical:3,borderRadius:10,overflow:'hidden',borderWidth:1.5,backgroundColor:'#000',justifyContent:'center',alignItems:'center'},mapImgFixed:{width:'100%',height:'100%'},start:{position:'absolute',bottom:4,left:6,color:'#fff',fontSize:9,backgroundColor:'rgba(0,0,0,0.7)',paddingHorizontal:5,paddingVertical:1,borderRadius:4},sb:{paddingVertical:2,borderRadius:6,flex:1,margin:2,height:38,justifyContent:'center',alignItems:'center',borderWidth:1},sbT:{fontSize:12,fontWeight:'bold'},sL:{backgroundColor:'#00cc66',color:'#fff',paddingHorizontal:5,borderRadius:4,marginTop:1,fontSize:9,fontWeight:'bold'},hT:{fontSize:11,marginHorizontal:8,marginTop:6,fontWeight:'bold'},hR:{padding:5,marginHorizontal:6,marginVertical:1.5,borderRadius:5,borderWidth:1},btnR:{flexDirection:'row',justifyContent:'space-around',marginHorizontal:8,marginVertical:6},btn:{padding:11,borderRadius:7,flex:1,margin:2,alignItems:'center'},btnT:{color:'#fff',fontWeight:'bold',fontSize:14},tabBar:{flexDirection:'row',justifyContent:'space-around',paddingVertical:10,borderTopWidth:1},tabBtn:{flex:1,alignItems:'center'},tab:{color:'#888',fontSize:12},tabOn:{color:'#00cc66',fontWeight:'bold',fontSize:13},trackCard:{width:'47%',margin:'1.5%',padding:6,borderRadius:8,borderWidth:1}});
const lightS=StyleSheet.create({c:{backgroundColor:'#f5f5f5'},head:{backgroundColor:'#fff'},t:{color:'#111'},sub:{color:'#666'},gps:{backgroundColor:'#eee',borderTopWidth:1,borderColor:'#ddd'},b:{backgroundColor:'#fff',borderColor:'#e0e0e0'}});
const darkS=StyleSheet.create({c:{backgroundColor:'#000'},head:{backgroundColor:'#000'},t:{color:'#fff'},sub:{color:'#aaa'},gps:{backgroundColor:'#111',borderTopWidth:1,borderColor:'#333'},b:{backgroundColor:'#111',borderColor:'#333'}});
