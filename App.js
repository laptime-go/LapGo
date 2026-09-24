import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable, Alert, Image, Modal, Switch, ScrollView } from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
let BannerAd, BannerAdSize, MobileAds;
try{ const A=require('react-native-google-mobile-ads'); BannerAd=A.BannerAd; BannerAdSize=A.BannerAdSize; MobileAds=A.MobileAds; }catch(e){}
const BANNER_ID = __DEV__? "ca-app-pub-3940256099942544/6300978111" : "ca-app-pub-9890149028563226/7083933962";
const TRACKS=[{id:'zic',name:'珠海國際賽車場',en:'Zhuhai Circuit',short:'ZIC • ZHUHAI • 14T',lat:22.3598,lng:113.5678,img:require('./assets/tracks/zic.jpg')},{id:'gic',name:'廣東國際賽車場',en:'Guangdong Circuit',short:'GIC • 13T',lat:23.1216,lng:112.559,img:require('./assets/tracks/gic.jpg')},{id:'fuji',name:'富士賽道',en:'Fuji Speedway',short:'FUJI • 16T',lat:35.3717,lng:138.927,img:require('./assets/tracks/fuji.jpg')},{id:'suzuka',name:'鈴鹿賽道',en:'Suzuka Circuit',short:'SUZUKA • 18T',lat:34.8431,lng:136.5409,img:require('./assets/tracks/suzuka.jpg')},{id:'tsukuba',name:'筑波賽道',en:'Tsukuba Circuit',short:'TSUKUBA • 9T',lat:36.083,lng:140.075,img:require('./assets/tracks/tsukuba.jpg')},{id:'okayama',name:'岡山國際賽道',en:'Okayama Circuit',short:'OKAYAMA • 11T',lat:34.915,lng:134.212,img:require('./assets/tracks/okayama.jpg')},{id:'buriram',name:'武里南賽道',en:'Buriram Circuit',short:'BURIRAM • 12T',lat:14.966,lng:103.095,img:require('./assets/tracks/buriram.jpg')},{id:'sepang',name:'雪邦賽道',en:'Sepang Circuit',short:'SEPANG • 15T',lat:2.7606,lng:101.738,img:require('./assets/tracks/sepang.jpg')},{id:'zhuzhou',name:'株洲國際賽道',en:'Zhuzhou Circuit',short:'ZHUZHOU • 14T',lat:27.85,lng:113.15,img:require('./assets/tracks/zhuzhou.jpg')},{id:'ningbo',name:'寧波國際賽道',en:'Ningbo Circuit',short:'NINGBO • 22T',lat:30.33,lng:121.45,img:require('./assets/tracks/ningbo.jpg')},{id:'guia',name:'東望洋賽道',en:'Guia Circuit',short:'GUIA • MACAU • 22T',lat:22.197,lng:113.555,img:require('./assets/tracks/guia.jpg')},{id:'tmn',name:'屯門公路 (荃灣→屯門)',en:'Tuen Mun Rd (TW→TM)',short:'TMR • 荃→屯 • 限速70',lat:22.3905,lng:113.9768,img:require('./assets/tracks/tuenmun-north.jpg')},{id:'tms',name:'屯門公路 (屯門→荃灣)',en:'Tuen Mun Rd (TM→TW)',short:'TMR • 屯→荃 • 限速70',lat:22.3741,lng:113.9585,img:require('./assets/tracks/tuenmun-south.jpg')}];
const LANG={zh:{app:'圈速go',gpsOk:'● GPS已鎖定',gpsNo:'○ 搜尋中...',acc:'精度',speed:'速度',temp:'氣溫',prev:'上一圈',best:'最佳',delta:'Delta',sf:'起/終點',s1:'S1',s2:'S2',s3:'S3',hist:'圈速紀錄',dash:'儀表',sess:'紀錄',tracks:'賽道',set:'設定',timer:'--- 計時 ---',disp:'--- 顯示 ---',sys:'--- 系統 ---',proF:'--- Pro功能',night:'夜間模式',unit:'速度單位',tempUnit:'溫度單位',timeFmt:'時間制式',dot:'即時紅點',langTitle:'語言',ghost:'幽靈線透明度',clear:'清除紀錄',ver:'v1.0',proFree:'免費版',proOn:'Pro已啟用 (30日)',proDesc:'免費版30圈 • 升級Pro無廣告 • 解鎖100圈紀錄',upgrade:'訂閱 Pro $38/月',calib:'起/終點校準',minTrig:'最低觸發',autoLap:'自動計圈',needPro:'即將推出',needProDesc:'更多Pro功能即將推出，敬請期待',gpsHz:'GPS頻率',accFilt:'精度過濾',labels:'賽道標籤',safeMode:'安全模式',safeOn:'已啟用',safeOff:'已關閉',about:'--- 關於 ---',disclaimer:'免責聲明',privacy:'私隱政策',contact:'聯絡我',disTxt:'本App僅供賽道日及訓練參考，屯門公路等公共道路請遵守限速70，安全駕駛。',priTxt:'本App不會收集個人位置數據，GPS僅用於本地計時。氣溫來自open-meteo免費API。',conTxt:'問題反饋: fungfung842@gmail.com'},en:{app:'LapGo',gpsOk:'● GPS Locked',gpsNo:'○ Searching...',acc:'Acc',speed:'Speed',temp:'Temp',prev:'Prev',best:'Best',delta:'Delta',sf:'S/F',s1:'S1',s2:'S2',s3:'S3',hist:'Lap History',dash:'Dash',sess:'Logs',tracks:'Tracks',set:'Settings',timer:'--- Timer ---',disp:'--- Display ---',sys:'--- System ---',proF:'--- Pro ---',night:'Night Mode',unit:'Speed Unit',tempUnit:'Temp Unit',timeFmt:'Time Format',dot:'Live Dot',langTitle:'Language',ghost:'Ghost Opacity',clear:'Clear All',ver:'v1.0',proFree:'Free',proOn:'Pro Active (30d)',proDesc:'Free 30 laps • Pro No Ads • Unlock 100 laps',upgrade:'Subscribe Pro $38/mo',calib:'S/F Calib',minTrig:'Min Trigger',autoLap:'Auto Lap',needPro:'Coming Soon',needProDesc:'More Pro features coming soon',gpsHz:'GPS Rate',accFilt:'Accuracy Filter',labels:'Track Labels',safeMode:'Safe Mode',safeOn:'On',safeOff:'Off',about:'--- About ---',disclaimer:'Disclaimer',privacy:'Privacy',contact:'Contact',disTxt:'For track day training only. Observe 70km/h limit on public roads.',priTxt:'No location data collected. Temp from open-meteo free API.',conTxt:'Feedback: fungfung842@gmail.com'}};
function dist(a,b,c,d){const R=6371000;const dLat=(c-a)*Math.PI/180;const dLng=(d-b)*Math.PI/180;const x=Math.sin(dLat/2)**2+Math.cos(a*Math.PI/180)*Math.cos(c*Math.PI/180)*Math.sin(dLng/2)**2;return R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x));}
function bearing(a,b,c,d){const y=Math.sin((d-b)*Math.PI/180)*Math.cos(c*Math.PI/180);const x=Math.cos(a*Math.PI/180)*Math.sin(c*Math.PI/180)-Math.sin(a*Math.PI/180)*Math.cos(c*Math.PI/180)*Math.cos((d-b)*Math.PI/180);return (Math.atan2(y,x)*180/Math.PI+360)%360;}
export default function App(){
const [track,setTrack]=useState(TRACKS[0]);const [locked,setLocked]=useState(false);const [acc,setAcc]=useState(0);const [speedMs,setSpeedMs]=useState(0);
const [running,setRunning]=useState(false);const [cur,setCur]=useState(0);const [best,setBest]=useState(null);const [prev,setPrev]=useState(null);
const [sector,setSector]=useState([0,0,0]);const [history,setHistory]=useState([]);const [isPro,setIsPro]=useState(false);const [proExp,setProExp]=useState(null);
const [tab,setTab]=useState('dash');const [showSet,setShowSet]=useState(false);const [darkMode,setDarkMode]=useState(true);const [lang,setLang]=useState('zh');
const [calibDist,setCalibDist]=useState(25);const [minTrigger,setMinTrigger]=useState(15);const [autoLap,setAutoLap]=useState(true);const [unit,setUnit]=useState('kmh');const [tempU,setTempU]=useState('C');const [tempC,setTempC]=useState(null);const [timeFmt,setTimeFmt]=useState('mm:ss');const [liveDot,setLiveDot]=useState(false);const [ghostOp,setGhostOp]=useState(0.5);const [gForce,setGForce]=useState({x:0,max:0});const [gpsHz,setGpsHz]=useState(1);const [accFilt,setAccFilt]=useState(10);const [showLabels,setShowLabels]=useState(true);const [safeMode,setSafeMode]=useState(true);
const [isAdsReady,setIsAdsReady]=useState(false);
const startRef=useRef(0);const timerRef=useRef(null);const subRef=useRef(null);const trackRef=useRef(TRACKS[0]);const runningRef=useRef(false);const maxSpeedLapRef=useRef(0);const finishLapRef=useRef(null);const lastSpeed=useRef(0);const lastManualTrack=useRef(0);const lastPos=useRef(null);const T=LANG[lang];
useEffect(()=>{trackRef.current=track;},[track]);
useEffect(()=>{(async()=>{
try{if(MobileAds){await MobileAds().initialize();setIsAdsReady(true);}}catch(e){setIsAdsReady(true);}
const {status}=await Location.requestForegroundPermissionsAsync();if(status!=='granted')return;
const vals=await AsyncStorage.multiGet(['lap_history','isPro','pro_exp','darkMode','lang','calib','minTrig','autoLap','unit','tempU','timeFmt','gpsHz','accFilt','showLabels','safeMode']);const m=Object.fromEntries(vals);
if(m.lap_history)try{setHistory(JSON.parse(m.lap_history));}catch(e){};if(m.isPro && m.pro_exp){const exp=parseInt(m.pro_exp);if(Date.now()<exp){setIsPro(true);setProExp(exp);}else{setIsPro(false);await AsyncStorage.multiRemove(['isPro','pro_exp']);}}if(m.darkMode!==null)setDarkMode(m.darkMode==='1');if(m.lang)setLang(m.lang);if(m.calib)setCalibDist(parseInt(m.calib));if(m.minTrig)setMinTrigger(parseInt(m.minTrig));if(m.autoLap!==null)setAutoLap(m.autoLap==='1');if(m.unit)setUnit(m.unit);if(m.tempU)setTempU(m.tempU);if(m.timeFmt)setTimeFmt(m.timeFmt);if(m.gpsHz)setGpsHz(parseInt(m.gpsHz));if(m.accFilt)setAccFilt(parseInt(m.accFilt));if(m.showLabels!==null)setShowLabels(m.showLabels==='1');if(m.safeMode!==null)setSafeMode(m.safeMode==='1');
if(subRef.current) subRef.current.remove();
subRef.current=await Location.watchPositionAsync({accuracy:Location.Accuracy.BestForNavigation,distanceInterval:1,timeInterval:1000},loc=>{
try{
const lat=loc.coords.latitude, lng=loc.coords.longitude, accu=loc.coords.accuracy||99, spd=loc.coords.speed||0;
if(Date.now()-lastManualTrack.current>15000){
 let near=trackRef.current, minD=Infinity; TRACKS.forEach(t=>{const d=dist(lat,lng,t.lat,t.lng); if(d<minD){minD=d; near=t;}});
 if(minD<50000 && near){
  if(near.id==='tmn'||near.id==='tms'){
   if(lastPos.current && spd>1){
    const h=loc.coords.heading!=null?loc.coords.heading:bearing(lastPos.current.lat,lastPos.current.lng,lat,lng);
    if(!isNaN(h)){ near = h>=0&&h<180? TRACKS.find(t=>t.id==='tmn') : TRACKS.find(t=>t.id==='tms'); }
   }
  }
  if(near && near.id!==trackRef.current.id){ trackRef.current=near; setTrack(near); }
 }
 lastPos.current={lat,lng};
}
setAcc(accu); if(accu<100) setLocked(true); setSpeedMs(spd);
const kmhNow=spd*3.6; if(runningRef.current && kmhNow>maxSpeedLapRef.current) maxSpeedLapRef.current=kmhNow;
const g=Math.abs(spd-lastSpeed.current)*0.8; lastSpeed.current=spd; setGForce(p=>({x:g.toFixed(2),max:Math.max(g,p.max).toFixed(2)}));
if(runningRef.current&&autoLap&&finishLapRef.current){if(dist(lat,lng,trackRef.current.lat,trackRef.current.lng)<calibDist&&Date.now()-startRef.current>minTrigger*1000)finishLapRef.current();}
}catch(e){}
});
})();return()=>{if(subRef.current)subRef.current.remove();if(timerRef.current)clearInterval(timerRef.current);};},[]);
const formatTime=(ms)=>{
const m=Math.floor(ms/60000), s=Math.floor((ms%60000)/1000), cs=Math.floor((ms%1000)/10);
if(timeFmt==='ss.ms')return `${s}.${cs<10?'0':''}${cs}`;
return `${m}:${s<10?'0':''}${s}.${cs<10?'0':''}${cs}`;
};
const fetchTemp=async()=>{try{const r=await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${track.lat}&longitude=${track.lng}&current=temperature_2m`);const d=await r.json();let t=d.current.temperature_2m;if(tempU==='F')t=t*9/5+32;setTempC(Math.round(t));}catch(e){setTempC(null);}};
useEffect(()=>{fetchTemp();const iv=setInterval(fetchTemp,60000);return()=>clearInterval(iv);},[track,tempU]);

const startLap=()=>{
startRef.current=Date.now(); runningRef.current=true; setRunning(true); maxSpeedLapRef.current=0;
if(timerRef.current)clearInterval(timerRef.current);
timerRef.current=setInterval(()=>{const now=Date.now(), d=now-startRef.current; setCur(d);
if(finishLapRef.current&&finishLapRef.current()){
 finishLapRef.current=null;
 const l=d; setPrev(l); setBest(b=>b===null?l:Math.min(b,l));
 const newH=[{time:l,date:new Date().toLocaleDateString(),maxSpeed:Math.round(maxSpeedLapRef.current*3.6),track:track.name},...history].slice(0,isPro?100:30);
 setHistory(newH); AsyncStorage.setItem('lap_history',JSON.stringify(newH));
 startRef.current=now; maxSpeedLapRef.current=0;
}
},50);
finishLapRef.current=()=>true;
};

const stopLap=()=>{
runningRef.current=false; setRunning(false); if(timerRef.current)clearInterval(timerRef.current); setCur(0);
};

const triggerManualLap=()=>{
if(!runningRef.current)return;
const d=Date.now()-startRef.current;
if(d<minTrigger*1000)return;
const l=d; setPrev(l); setBest(b=>b===null?l:Math.min(b,l));
const newH=[{time:l,date:new Date().toLocaleDateString(),maxSpeed:Math.round(maxSpeedLapRef.current*3.6),track:track.name},...history].slice(0,isPro?100:30);
setHistory(newH); AsyncStorage.setItem('lap_history',JSON.stringify(newH));
startRef.current=Date.now(); maxSpeedLapRef.current=0;
};
const DashContent=()=>{
return(
<View>
<View style={[s.btnR,{marginHorizontal:6,marginTop:2,marginBottom:4}]}><TouchableOpacity onPress={stopLap} style={[s.btn,{backgroundColor:running?'#ff3333':'#551111'}]}><Text style={s.btnT}>■ STOP</Text></TouchableOpacity><TouchableOpacity onPress={startLap} style={[s.btn,{backgroundColor:running?'#114422':'#00cc66'}]}><Text style={s.btnT}>▶ START</Text></TouchableOpacity></View>
<Text style={[s.big,darkMode?{color:'#fff'}:{color:'#111'}]}>{formatTime(cur)}</Text>
<View style={s.row3}><View style={[s.b,darkMode?darkS.b:lightS.b]}><Text style={[s.l,darkMode?darkS.sub:lightS.sub]}>上一圈</Text><Text style={[s.v,darkMode?{color:'#fff'}:{color:'#111'}]}>{prev?formatTime(prev):'--'}</Text></View><View style={[s.b,darkMode?darkS.b:lightS.b]}><Text style={[s.l,darkMode?darkS.sub:lightS.sub]}>最佳</Text><Text style={[s.v,{color:'#00cc66'}]}>{best?formatTime(best):'--'}</Text></View><View style={[s.b,darkMode?darkS.b:lightS.b]}><Text style={[s.l,darkMode?darkS.sub:lightS.sub]}>Delta</Text><Text style={[s.v,{color:'#00cc66'}]}>--</Text></View></View>
<View style={{flexDirection:'row',marginHorizontal:6,marginTop:4}}><View style={[s.dataBox,darkMode?darkS.b:lightS.b,{flex:1}]}><Text style={s.dataLabel}>速度 ({unit.toUpperCase()})</Text><Text style={[s.dataVal,{color:'#00e5ff'}]}>{Math.round(speedMs*3.6*(unit==='mph'?0.621371:1))}</Text></View><View style={[s.dataBox,darkMode?darkS.b:lightS.b,{flex:0.8}]}><Text style={s.dataLabel}>氣溫</Text><Text style={[s.dataVal,{color:'#ffaa00',fontSize:14}]}>{tempC!==null?`${tempC}°${tempU}`:'--'}</Text></View><View style={[s.dataBox,darkMode?darkS.b:lightS.b,{flex:1}]}><Text style={s.dataLabel}>G-Force</Text><View style={{flexDirection:'row',justifyContent:'space-around'}}><Text style={{color:'#ffaa00',fontWeight:'bold',fontSize:10}}>{gForce.x}G</Text><Text style={{color:'#fff',fontWeight:'bold',fontSize:10}}>{gForce.max}G</Text></View><Text style={[s.dataLabel,{marginTop:2}]}>Max</Text><Text style={{color:'#00e5ff',fontWeight:'bold',fontSize:12}}>{Math.round(maxSpeedLapRef.current*(unit==='mph'?0.621371:1))}</Text></View></View>
<View style={[s.mapFixed,{backgroundColor:'#000',borderColor:'#00cc66',borderWidth:1.5}]}><Image source={track.img} style={s.mapImgFixed} resizeMode="contain"/>{showLabels&&<Text style={s.start}>起/終點 • {track.short}</Text>}</View>
<View style={s.row3}><View style={[s.sb,darkMode?darkS.b:lightS.b]}><Text style={[s.sbT,darkMode?{color:'#fff'}:{color:'#111'}]}>0.00</Text><Text style={s.sL}>S1</Text></View><View style={[s.sb,darkMode?darkS.b:lightS.b]}><Text style={[s.sbT,darkMode?{color:'#fff'}:{color:'#111'}]}>0.00</Text><Text style={s.sL}>S2</Text></View><View style={[s.sb,darkMode?darkS.b:lightS.b]}><Text style={[s.sbT,darkMode?{color:'#fff'}:{color:'#111'}]}>0.00</Text><Text style={s.sL}>S3</Text></View></View>
</View>);};

const DashView=()=>{
return(
<ScrollView style={{flex:1}} contentContainerStyle={{paddingBottom:20}} showsVerticalScrollIndicator={false}>
<DashContent/>
<Text style={[s.hT,darkMode?{color:'#fff'}:{color:'#111'}]}>圈速紀錄 ({history.length})</Text>
<View style={{minHeight:120,maxHeight:200,marginHorizontal:6,marginTop:4,borderWidth:1,borderColor:'#222',borderRadius:8,overflow:'hidden'}}>
<View style={{flexDirection:'row',paddingVertical:5,paddingHorizontal:6,backgroundColor:'#111'}}><Text style={{flex:0.5,fontSize:8,color:'#888'}}>LAP</Text><Text style={{flex:1.1,fontSize:8,color:'#888'}}>TIME</Text><Text style={{flex:0.7,fontSize:8,color:'#888'}}>TRACK</Text><Text style={{flex:0.5,fontSize:8,color:'#888'}}>G</Text><Text style={{flex:0.6,fontSize:8,color:'#00e5ff'}}>MAX</Text></View>
<ScrollView nestedScrollEnabled showsVerticalScrollIndicator={true}>{history.map((h,i)=>{const isBest=h.time===best;return(<View key={i} style={[s.hR,{flexDirection:'row',alignItems:'center',backgroundColor:isBest?'#003322':'#1a1a1a',borderColor:'#222'}]}><Text style={{flex:0.5,fontSize:10,color:'#fff'}}>{history.length-i}</Text><Text style={{flex:1.1,fontSize:10,fontWeight:'bold',color:isBest?'#00ff88':'#fff'}}>{formatTime(h.time)}</Text><Text style={{flex:0.7,fontSize:9,color:'#aaa'}}>{h.track}</Text><Text style={{flex:0.5,fontSize:9,color:'#aaa'}}>{h.maxSpeed||0}</Text><Text style={{flex:0.6,fontSize:10,fontWeight:'bold',color:'#00e5ff'}}>{h.maxSpeed||0}</Text></View>);})}{history.length===0&&<Text style={[{textAlign:'center',marginTop:10},darkMode?darkS.sub:lightS.sub]}>未有紀錄</Text>}</ScrollView></View>
</ScrollView>);};
return(
<View style={[s.c,darkMode?darkS.c:lightS.c]}>
<View style={[s.head,darkMode?darkS.head:lightS.head]}><View style={{flex:1}}><Text style={[s.t,darkMode?darkS.t:lightS.t]}>圈速go</Text><Text style={[s.sub,darkMode?darkS.sub:lightS.sub]} numberOfLines={1}>{track.name} • {track.short}</Text></View><TouchableOpacity onPress={()=>setShowSet(true)} style={s.gear}><Text style={{fontSize:16}}>⚙️</Text></TouchableOpacity></View>
<View style={[s.gps,darkMode?darkS.gps:lightS.gps]}><Text style={{color:locked?'#00cc66':'#ff4444',fontWeight:'bold',fontSize:10}}>{locked?'● GPS已鎖定':'○ 搜尋中...'}</Text><Text style={[s.gpsI,darkMode?darkS.sub:lightS.sub]}>精度 {acc.toFixed(1)}m • {tempC!==null?`${tempC}°${tempU}`:'--'}</Text></View>
<View style={{flex:1,marginBottom:isPro?0:50}}>
{tab==='dash'&&<DashView/>}
{tab==='sessions'&&<ScrollView style={{flex:1,padding:6}}>{history.map((h,i)=><View key={i} style={[s.hR,darkMode?darkS.b:lightS.b]}><Text style={[darkMode?darkS.t:lightS.t,{fontSize:10}]}>{history.length-i}. {h.track} • {formatTime(h.time)} • {h.maxSpeed||0}{unit.toUpperCase()}</Text></View>)}</ScrollView>}
{tab==='tracks'&&<ScrollView style={{flex:1}} contentContainerStyle={{flexDirection:'row',flexWrap:'wrap',padding:6}}>{TRACKS.map(t=><TouchableOpacity key={t.id} onPress={()=>{setTrack(t);setTab('dash');}} style={[s.trackCard,darkMode?darkS.b:lightS.b,track.id===t.id&&{borderColor:'#00cc66',borderWidth:2}]}><Image source={t.img} style={{width:'100%',height:72,borderRadius:6}} resizeMode="contain"/><Text style={[darkMode?darkS.t:lightS.t,{fontSize:9,marginTop:3}]}>{t.name}</Text></TouchableOpacity>)}</ScrollView>}
</View>
{!isPro&&BannerAd&&isAdsReady&&<View style={{position:'absolute',bottom:48,left:0,right:0,height:50,backgroundColor:'#000',justifyContent:'center',alignItems:'center',borderTopWidth:1,borderColor:'#222'}}><BannerAd unitId={BANNER_ID} size={BannerAdSize.BANNER} /></View>}
<View style={{flexDirection:'row',height:48,backgroundColor:darkMode?'#141414':'#e6e6e6',borderTopWidth:1,borderTopColor:darkMode?'#222':'#ccc',position:'absolute',bottom:0,left:0,right:0}}>
<TouchableOpacity onPress={()=>setTab('dash')} style={{flex:1,justifyContent:'center',alignItems:'center'}}><Text style={{color:tab==='dash'?'#00cc66':(darkMode?'#888':'#666'),fontSize:11,fontWeight:'bold'}}>儀表</Text></TouchableOpacity>
<TouchableOpacity onPress={()=>setTab('sessions')} style={{flex:1,justifyContent:'center',alignItems:'center'}}><Text style={{color:tab==='sessions'?'#00cc66':(darkMode?'#888':'#666'),fontSize:11,fontWeight:'bold'}}>紀錄</Text></TouchableOpacity>
<TouchableOpacity onPress={()=>setTab('tracks')} style={{flex:1,justifyContent:'center',alignItems:'center'}}><Text style={{color:tab==='tracks'?'#00cc66':(darkMode?'#888':'#666'),fontSize:11,fontWeight:'bold'}}>賽道</Text></TouchableOpacity>
</View>

<Modal visible={showSet} animationType="slide"><View style={[s.setPage,darkMode?darkS.c:lightS.c]}><ScrollView style={{padding:14,paddingTop:8}}><View style={{flexDirection:'row',justifyContent:'space-between',marginBottom:8,marginTop:4}}><Text style={[{fontSize:15,fontWeight:'bold'},darkMode?darkS.t:lightS.t]}>設定</Text><TouchableOpacity onPress={()=>setShowSet(false)}><Text style={[{fontSize:18},darkMode?darkS.t:lightS.t]}>✕</Text></TouchableOpacity></View>
<View style={[s.proCard,isPro&&{backgroundColor:'#111'}]}><Text style={{fontWeight:'bold',color:isPro?'#ffaa00':'#111',fontSize:12}}>👑 {isPro?'Pro已啟用':'免費版'}</Text><Text style={{fontSize:9,color:isPro?'#fff':'#666',marginTop:2}}>免費版30圈 • 升級Pro無廣告</Text>{!isPro&&<TouchableOpacity style={s.upBtn} onPress={()=>{setIsPro(true);Alert.alert('已升級Pro','');}}><Text style={{color:'#fff',fontWeight:'bold',textAlign:'center',fontSize:11}}>升級 Pro $38/月</Text></TouchableOpacity>}</View>
<Text style={[s.setTitle,darkMode?darkS.t:lightS.t]}>--- 計時 ---</Text>
<TouchableOpacity style={[s.setRow,darkMode?darkS.b:lightS.b]} onPress={()=>setMinTrigger(m=>(m>=30?5:m+5))}><Text style={darkMode?darkS.t:lightS.t}>最低觸發 {minTrigger}s</Text><Text style={darkMode?darkS.sub:lightS.sub}>{minTrigger}s ＞</Text></TouchableOpacity>
<View style={[s.setRow,darkMode?darkS.b:lightS.b]}><Text style={darkMode?darkS.t:lightS.t}>自動計圈</Text><Switch value={autoLap} onValueChange={setAutoLap}/></View>
<View style={[s.setRow,darkMode?darkS.b:lightS.b]}><Text style={darkMode?darkS.t:lightS.t}>賽道標籤</Text><Switch value={showLabels} onValueChange={setShowLabels}/></View>
<View style={[s.setRow,darkMode?darkS.b:lightS.b]}><Text style={darkMode?darkS.t:lightS.t}>安全模式</Text><Switch value={safeMode} onValueChange={setSafeMode}/></View>

<Text style={[s.setTitle,darkMode?darkS.t:lightS.t]}>--- 顯示 ---</Text>
<TouchableOpacity style={[s.setRow,darkMode?darkS.b:lightS.b]} onPress={()=>setDarkMode(!darkMode)}><Text style={darkMode?darkS.t:lightS.t}>夜間模式</Text><Switch value={darkMode} onValueChange={setDarkMode}/></TouchableOpacity>
<TouchableOpacity style={[s.setRow,darkMode?darkS.b:lightS.b]} onPress={()=>setUnit(u=>u==='kmh'?'mph':'kmh')}><Text style={darkMode?darkS.t:lightS.t}>速度單位</Text><Text style={darkMode?darkS.sub:lightS.sub}>{unit.toUpperCase()} ＞</Text></TouchableOpacity>
<TouchableOpacity style={[s.setRow,darkMode?darkS.b:lightS.b]} onPress={()=>setTempU(t=>t==='C'?'F':'C')}><Text style={darkMode?darkS.t:lightS.t}>溫度單位</Text><Text style={darkMode?darkS.sub:lightS.sub}>{tempU} ＞</Text></TouchableOpacity>
<TouchableOpacity style={[s.setRow,darkMode?darkS.b:lightS.b]} onPress={()=>setTimeFmt(f=>f==='mm:ss.ms'?'ss.ms':'mm:ss.ms')}><Text style={darkMode?darkS.t:lightS.t}>時間制式</Text><Text style={darkMode?darkS.sub:lightS.sub}>{timeFmt} ＞</Text></TouchableOpacity>

<TouchableOpacity style={[s.setRow,darkMode?darkS.b:lightS.b,{marginTop:12,backgroundColor:darkMode?'#221111':'#ffdddd'}]} onPress={()=>{setHistory([]);setBest(null);setPrev(null);AsyncStorage.removeItem('lap_history');}}><Text style={{color:'#ff4444',fontWeight:'bold'}}>清除紀錄</Text></TouchableOpacity>
</ScrollView></View></Modal>
</View>);
}

const darkS=StyleSheet.create({c:{backgroundColor:'#0a0a0a'},head:{backgroundColor:'#141414',borderBottomColor:'#222'},t:{color:'#fff'},sub:{color:'#888'},gps:{backgroundColor:'#111',borderBottomColor:'#222'},b:{backgroundColor:'#161616',borderColor:'#222'}});
const lightS=StyleSheet.create({c:{backgroundColor:'#f2f2f2'},head:{backgroundColor:'#e6e6e6',borderBottomColor:'#ccc'},t:{color:'#111'},sub:{color:'#666'},gps:{backgroundColor:'#e0e0e0',borderBottomColor:'#ccc'},b:{backgroundColor:'#fff',borderColor:'#ccc'}});
const s=StyleSheet.create({
c:{flex:1},head:{flexDirection:'row',alignItems:'center',paddingHorizontal:12,paddingTop:36,paddingBottom:8,borderBottomWidth:1},
gear:{padding:4},gps:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingHorizontal:12,paddingVertical:4,borderBottomWidth:1},
gpsI:{fontSize:9},big:{fontSize:36,fontWeight:'bold',textAlign:'center',marginVertical:2},
row3:{flexDirection:'row',marginHorizontal:6,marginBottom:4},
b:{flex:1,marginHorizontal:2,padding:6,borderRadius:6,borderWidth:1,alignItems:'center'},
l:{fontSize:8},v:{fontSize:14,fontWeight:'bold',marginTop:1},
dataBox:{marginHorizontal:2,padding:6,borderRadius:6,borderWidth:1,alignItems:'center'},
dataLabel:{fontSize:8,color:'#888'},dataVal:{fontSize:15,fontWeight:'bold',marginTop:1},
mapFixed:{height:130,marginHorizontal:6,marginVertical:2,borderRadius:8,overflow:'hidden',justifyContent:'center',alignItems:'center'},
mapImgFixed:{width:'100%',height:'100%'},
start:{position:'absolute',top:4,left:6,backgroundColor:'rgba(0,0,0,0.7)',color:'#00ff88',fontSize:9,paddingHorizontal:4,paddingVertical:2,borderRadius:4},
sb:{flex:1,marginHorizontal:2,padding:4,borderRadius:4,borderWidth:1,alignItems:'center'},
sbT:{fontSize:11,fontWeight:'bold'},sL:{fontSize:7,color:'#888',marginTop:1},
hT:{fontSize:11,fontWeight:'bold',marginHorizontal:8,marginTop:6},
hR:{paddingVertical:6,paddingHorizontal:8,borderBottomWidth:1,marginHorizontal:6,borderRadius:4,marginVertical:1},
trackCard:{width:'31%',margin:'1.1%',padding:4,borderRadius:6,borderWidth:1,alignItems:'center'},
setPage:{flex:1,paddingTop:16},setTitle:{fontSize:11,fontWeight:'bold',marginTop:10,marginBottom:4,color:'#888'},
setRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:10,borderRadius:6,borderWidth:1,marginVertical:2},
proCard:{backgroundColor:'#f0f0f0',padding:10,borderRadius:8,marginVertical:4,borderWidth:1,borderColor:'#333'},
upBtn:{backgroundColor:'#00cc66',padding:6,borderRadius:6,marginTop:6},
btnR:{flexDirection:'row',justifyContent:'space-between'},
btn:{flex:1,marginHorizontal:2,padding:8,borderRadius:6,alignItems:'center'},
btnT:{color:'#fff',fontWeight:'bold',fontSize:12}
});
