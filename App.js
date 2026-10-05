import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable, Alert, Image, Modal, Switch, ScrollView } from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
let BannerAd, BannerAdSize, MobileAds;
try{ const A=require('react-native-google-mobile-ads'); BannerAd=A.BannerAd; BannerAdSize=A.BannerAdSize; MobileAds=A.MobileAds; }catch(e){}
const BANNER_ID = __DEV__? "ca-app-pub-3940256099942544/6300978111" : (Constants.expoConfig?.extra?.adUnitId || "ca-app-pub-9890149028563226/7083933962");const TRACKS=[ // 你原本63條賽道keep晒，唔貼喇，太長，你保留
{id:'zic',name:'珠海國際賽車場',en:'Zhuhai Circuit',short:'ZIC • ZHUHAI • 14T',lat:22.3598,lng:113.5678,r1:0.30,r2:0.32,img:require('./assets/tracks/zic.jpg')},
//... 中間你嗰61條keep住...
{id:'hungaroring',name:'Hungaroring',en:'Hungaroring',short:'HUNGARORING • 14T',lat:47.58,lng:19.25,r1:0.32,r2:0.33,img:require('./assets/tracks/hungaroring.jpg')},
];
const LANG={zh:{app:'圈速go',gpsOk:'● GPS已鎖定',gpsNo:'○ 搜尋中...',acc:'精度',speed:'速度',temp:'氣溫',prev:'上一圈',best:'最佳',delta:'Delta',sf:'起/終點',s1:'S1',s2:'S2',s3:'S3',hist:'圈速紀錄',dash:'儀表',sess:'紀錄',tracks:'賽道',set:'設定',timer:'--- 計時 ---',disp:'--- 顯示 ---',sys:'--- 系統 ---',proF:'--- Pro功能',night:'夜間模式',unit:'速度單位',tempUnit:'溫度單位',timeFmt:'時間制式',dot:'即時紅點',langTitle:'語言',ghost:'幽靈線透明度',clear:'清除紀錄',ver:'v1.0',proFree:'免費版，圈速紀錄30圈 +基本功能',proOn:'Pro大佬已啟用 (30日)',proDesc:'解鎖Pro,圈速紀錄100圈，Gps即時紅點+幽靈線',upgrade:'升級 Pro',calib:'起/終點校準',minTrig:'最低觸發',autoLap:'自動計圈',needPro:'不日推出',needProDesc:'敬請期待🤣',gpsHz:'GPS頻率',accFilt:'精度過濾',labels:'賽道標籤',about:'--- 關於 ---',disclaimer:'免責聲明',privacy:'私隱政策',contact:'聯絡我',disTxt:'本App僅供賽道日及訓練參考，公共道路請遵守限速。熄屏會暫停計時，屬前台定位設計。',priTxt:'本App不會收集個人位置數據，僅前景使用GPS。',conTxt:'問題反饋: fungfung1984@gmail.com'},en:{app:'LapGo',gpsOk:'● GPS Locked',gpsNo:'○ Searching...',acc:'Acc',speed:'Speed',temp:'Temp',prev:'Prev',best:'Best',delta:'Delta',sf:'S/F',s1:'S1',s2:'S2',s3:'S3',hist:'Lap History',dash:'Dash',sess:'Logs',tracks:'Tracks',set:'Settings',timer:'--- Timer ---',disp:'--- Display ---',sys:'--- System ---',proF:'--- Pro ---',night:'Night Mode',unit:'Speed Unit',tempUnit:'Temp Unit',timeFmt:'Time Format',dot:'Live Dot',langTitle:'Language',ghost:'Ghost Opacity',clear:'Clear All',ver:'v1.0',proFree:'Free: 30 Laps + Basic',proOn:'Pro Active (30d)',proDesc:'Unlock Pro: 100 Laps, Live Dot + Ghost',upgrade:'Upgrade Pro',calib:'S/F Calib',minTrig:'Min Trigger',autoLap:'Auto Lap',needPro:'Coming Soon',needProDesc:'Stay tuned 🤣',gpsHz:'GPS Rate',accFilt:'Accuracy Filter',labels:'Track Labels',about:'--- About ---',disclaimer:'Disclaimer',privacy:'Privacy',contact:'Contact',disTxt:'For track day only. Foreground GPS only, pause when screen off.',priTxt:'No data collected. Foreground GPS only.',conTxt:'Feedback: fungfung1984@gmail.com'}};
function dist(a,b,c,d){const R=6371000;const dLat=(c-a)*Math.PI/180;const dLng=(d-b)*Math.PI/180;const x=Math.sin(dLat/2)**2+Math.cos(a*Math.PI/180)*Math.cos(c*Math.PI/180)*Math.sin(dLng/2)**2;return R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x));}function TimerText({startRef, running, timeFmt, style, lastRef}){
  const [,force]=useState(0);
  useEffect(()=>{ if(!running) return; const id=setInterval(()=>force(v=>v+1),80); return()=>clearInterval(id); },[running]);
  const sec = running? (Date.now()-startRef.current)/1000 : (lastRef.current||0);
  if(running) lastRef.current=sec;
  const fmt=s=>{ if(!s||s<=0) return '0:00.00'; if(timeFmt==='ss') return `${s.toFixed(2)}s`; const mm=Math.floor(s/60); return `${mm}:${(s%60).toFixed(2).padStart(5,'0')}`; };
  return <Text style={style}>{fmt(sec)}</Text>;
}
const AdBar = React.memo(({theme, insets})=>{
  const shellStyle = [{width:'100%',height:60 + (insets?.bottom||0)/2,borderTopWidth:1,alignItems:'center',justifyContent:'center',paddingBottom: insets?.bottom? insets.bottom/2 : 0}, theme.gps, {borderColor: theme.gps.borderColor||'#222'}];
  if(!BannerAd){ return <View style={shellStyle} />; }
  return(
    <View style={shellStyle}>
      <BannerAd unitId={BANNER_ID} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />
    </View>
  );
});function AppContent(){
const [track,setTrack]=useState(TRACKS[0]);const [locked,setLocked]=useState(false);const [acc,setAcc]=useState(0);const [speedMs,setSpeedMs]=useState(0);
const [running,setRunning]=useState(false);const [best,setBest]=useState(null);const [prev,setPrev]=useState(null);const [delta,setDelta]=useState(null);
const [sector,setSector]=useState([0,0,0]);const [history,setHistory]=useState([]);const [isPro,setIsPro]=useState(false);
const [tab,setTab]=useState('dash');const [showSet,setShowSet]=useState(false);const [darkMode,setDarkMode]=useState(true);const [lang,setLang]=useState('zh');
const [ready,setReady]=useState(false);
const [calibDist,setCalibDist]=useState(25);const [minTrigger,setMinTrigger]=useState(15);const [autoLap,setAutoLap]=useState(true);const [unit,setUnit]=useState('kmh');const [tempU,setTempU]=useState('C');const [tempC,setTempC]=useState(null);const [timeFmt,setTimeFmt]=useState('mm:ss');const [ghostOp,setGhostOp]=useState(0.5);const [gForce,setGForce]=useState({x:'0.00',max:'0.00'});const [gpsHz,setGpsHz]=useState(1);const [accFilt,setAccFilt]=useState(20);const [showLabels,setShowLabels]=useState(true);
const [maxKphLive,setMaxKphLive]=useState(0);
const startRef=useRef(0);const lastTimeRef=useRef(0);const subRef=useRef(null);const trackRef=useRef(TRACKS[0]);const runningRef=useRef(false);const maxSpeedLapRef=useRef(0);const finishLapRef=useRef(null);const lastSpeed=useRef(0);const lastGTime=useRef(Date.now());const lastManualTrack=useRef(0);const gpsHzRef=useRef(1);const accFiltRef=useRef(20);const lockedRef=useRef(false);const histScrollRef=useRef(null);
const insets = useSafeAreaInsets();
const T=LANG[lang];
//...你原本所有useEffect, start, stop, finishLap全部keep原樣，唔重貼喇，太長...
// 只係最底return要改：if(!ready) return <View style={{flex:1,backgroundColor:'#121212',paddingTop:insets.top}} />;
return(
<View style={[s.c,theme.c,{paddingTop:insets.top}]}>
<View style={[s.head,theme.head]}><View style={{flex:1}}><Text style={[s.t,theme.t]}>{T.app}</Text><Text style={[s.sub,theme.sub]} numberOfLines={1}>{lang==='zh'?track.name:track.en} • {track.short}</Text></View><TouchableOpacity onPress={()=>setShowSet(true)} style={s.gear}><Text style={{fontSize:16}}>⚙️</Text></TouchableOpacity></View>
<View style={[s.gps,theme.gps]}><Text style={{color:locked?'#00cc66':'#ff4444',fontWeight:'bold',fontSize:11}}>{locked?T.gpsOk:T.gpsNo}</Text><Text style={[s.gpsI,theme.sub]}>{T.acc} {acc.toFixed(1)}m • {getTemp()} • {gpsHz}Hz</Text></View>
{/*...你原本DashView, sessions, tracks嗰堆全部keep... */}
<AdBar theme={theme} insets={insets} />
<View style={[s.tabBar,theme.gps,{height:56+insets.bottom, paddingBottom:insets.bottom}]}>
<TouchableOpacity style={s.tabBtn} onPress={()=>setTab('dash')}><Text style={[s.tab,tab==='dash'&&s.tabOn]}>{T.dash}</Text></TouchableOpacity>
<TouchableOpacity style={s.tabBtn} onPress={()=>setTab('sessions')}><Text style={[s.tab,tab==='sessions'&&s.tabOn]}>{T.sess}</Text></TouchableOpacity>
<TouchableOpacity style={s.tabBtn} onPress={()=>setTab('tracks')}><Text style={[s.tab,tab==='tracks'&&s.tabOn]}>{T.tracks}</Text></TouchableOpacity>
</View>
</View>);
}
export default function App(){ return <SafeAreaProvider><AppContent/></SafeAreaProvider>; }
// s, lightS, darkS 全部原封不動keep
const s=StyleSheet.create({c:{flex:1,paddingTop:0},head:{flexDirection:'row',justifyContent:'space-between',paddingHorizontal:10,paddingTop:8,paddingBottom:4,alignItems:'center'},t:{fontSize:15,fontWeight:'bold'},sub:{fontSize:10},gear:{padding:4},proCard:{backgroundColor:'#fff3cd',padding:8,borderRadius:8,marginTop:6,borderWidth:1,borderColor:'#ffaa00'},upBtn:{backgroundColor:'#111',padding:7,borderRadius:6,marginTop:5},gps:{flexDirection:'row',justifyContent:'space-between',paddingHorizontal:10,paddingVertical:3},gpsI:{fontSize:10},big:{fontSize:36,textAlign:'center',fontWeight:'bold',marginVertical:2},row3:{flexDirection:'row',justifyContent:'space-around'},b:{paddingVertical:2,paddingHorizontal:6,borderRadius:6,flex:1,margin:2,height:40,justifyContent:'center',alignItems:'center',borderWidth:1},l:{fontSize:9,color:'#888'},v:{fontSize:13,fontWeight:'bold'},dataBox:{paddingVertical:2,paddingHorizontal:6,borderRadius:6,margin:2,height:48,justifyContent:'center',borderWidth:1},dataLabel:{fontSize:9,color:'#888'},dataVal:{fontSize:17,fontWeight:'bold'},mapFixed:{height:135,marginHorizontal:6,marginVertical:3,borderRadius:10,overflow:'hidden',borderWidth:1.5,backgroundColor:'#000',justifyContent:'center',alignItems:'center'},mapImgFixed:{width:'100%',height:'100%'},start:{position:'absolute',bottom:4,left:6,color:'#fff',fontSize:9,backgroundColor:'rgba(0,0,0,0.7)',paddingHorizontal:5,paddingVertical:1,borderRadius:4},sb:{paddingVertical:2,borderRadius:6,flex:1,margin:2,height:38,justifyContent:'center',alignItems:'center',borderWidth:1},sbT:{fontSize:12,fontWeight:'bold'},sL:{backgroundColor:'#00cc66',color:'#fff',paddingHorizontal:5,borderRadius:4,marginTop:1,fontSize:9,fontWeight:'bold'},hT:{fontSize:11,marginHorizontal:8,marginTop:6,fontWeight:'bold'},hR:{padding:5,marginHorizontal:6,marginVertical:1.5,borderRadius:5,borderWidth:1},btnR:{flexDirection:'row',justifyContent:'space-around',marginHorizontal:8,marginVertical:6},btn:{padding:11,borderRadius:7,flex:1,margin:2,alignItems:'center'},btnT:{color:'#fff',fontWeight:'bold',fontSize:14},tabBar:{flexDirection:'row',justifyContent:'space-around',paddingTop:10,borderTopWidth:1},tabBtn:{flex:1,alignItems:'center'},tab:{color:'#888',fontSize:12},tabOn:{color:'#00cc66',fontWeight:'bold',fontSize:13},setPage:{flex:1},setTitle:{fontWeight:'bold',marginTop:12,marginBottom:4,fontSize:10,color:'#00cc66'},setRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:11,borderRadius:8,marginBottom:6,borderWidth:1},trackCard:{width:'48.8%',margin:'0.6%',paddingTop:8,paddingBottom:4,paddingHorizontal:4,borderRadius:12,borderWidth:1,height:120,overflow:'hidden',alignItems:'center',justifyContent:'flex-start'}});
const lightS=StyleSheet.create({c:{backgroundColor:'#f5f5f5'},head:{backgroundColor:'#fff'},t:{color:'#111'},sub:{color:'#666'},gps:{backgroundColor:'#eee',borderTopWidth:1,borderColor:'#ddd'},b:{backgroundColor:'#fff',borderColor:'#e0e0e0'},map:{backgroundColor:'#000',borderColor:'#333'}});
const darkS=StyleSheet.create({c:{backgroundColor:'#000'},head:{backgroundColor:'#000'},t:{color:'#fff'},sub:{color:'#aaa'},gps:{backgroundColor:'#111',borderTopWidth:1,borderColor:'#333'},b:{backgroundColor:'#111',borderColor:'#333'},map:{backgroundColor:'#000',borderColor:'#00cc66'}});
