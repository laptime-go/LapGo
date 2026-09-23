import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Image, Modal, Switch } from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
let BannerAd, BannerAdSize, MobileAds;
try{ const Ads=require('react-native-google-mobile-ads'); BannerAd=Ads.BannerAd; BannerAdSize=Ads.BannerAdSize; MobileAds=Ads.MobileAds; }catch(e){}
const BANNER_ID="ca-app-pub-9890149028563226/7083933962";

// === TRACKS 更新 11條 ===
const TRACKS=[
  {id:'zic',name:'珠海國際賽車場',en:'Zhuhai Circuit',short:'ZIC • ZHUHAI • 14T',lat:22.3598,lng:113.5678,
   img:require('./assets/tracks/zic.jpg'), imgDark:require('./assets/tracks/zic.jpg')},
  {id:'okayama',name:'岡山國際賽道',en:'Okayama Circuit',short:'OKAYAMA • 11T',lat:34.915,lng:134.212,
   img:require('./assets/tracks/okayama.jpg'), imgDark:require('./assets/tracks/okayama.jpg')},
  {id:'buriram',name:'武里南賽道',en:'Buriram Circuit',short:'BURIRAM • 12T',lat:14.966,lng:103.095,
   img:require('./assets/tracks/buriram.jpg'), imgDark:require('./assets/tracks/buriram.jpg')},
  {id:'sepang',name:'雪邦賽道',en:'Sepang Circuit',short:'SEPANG • 15T',lat:2.7606,lng:101.738,
   img:require('./assets/tracks/sepang.jpg'), imgDark:require('./assets/tracks/sepang.jpg')},
  {id:'zhuzhou',name:'株洲國際賽道',en:'Zhuzhou Circuit',short:'ZHUZHOU • 14T',lat:27.85,lng:113.15,
   img:require('./assets/tracks/zhuzhou.jpg'), imgDark:require('./assets/tracks/zhuzhou.jpg')},
  {id:'ningbo',name:'寧波國際賽道',en:'Ningbo Circuit',short:'NINGBO • 22T',lat:30.33,lng:121.45,
   img:require('./assets/tracks/ningbo.jpg'), imgDark:require('./assets/tracks/ningbo.jpg')},
  {id:'guia',name:'東望洋賽道',en:'Guia Circuit',short:'GUIA • MACAU • 22T',lat:22.197,lng:113.555,
   img:require('./assets/tracks/guia.jpg'), imgDark:require('./assets/tracks/guia.jpg')},
  // 原有保留
  {id:'gic',name:'廣東國際賽車場',en:'Guangdong Circuit',short:'GIC • 13T',lat:23.1216,lng:112.559,img:require('./assets/tracks/gic.jpg'), imgDark:require('./assets/tracks/gic.jpg')},
  {id:'fuji',name:'富士賽道',en:'Fuji Speedway',short:'FUJI • 16T',lat:35.3717,lng:138.927,img:require('./assets/tracks/fuji.jpg'), imgDark:require('./assets/tracks/fuji.jpg')},
  {id:'suzuka',name:'鈴鹿賽道',en:'Suzuka Circuit',short:'SUZUKA • 18T',lat:34.8431,lng:136.5409,img:require('./assets/tracks/suzuka.jpg'), imgDark:require('./assets/tracks/suzuka.jpg')},
  {id:'tsukuba',name:'筑波賽道',en:'Tsukuba Circuit',short:'TSUKUBA • 9T',lat:36.083,lng:140.075,img:require('./assets/tracks/tsukuba.jpg'), imgDark:require('./assets/tracks/tsukuba.jpg')},
];

function dist(a,b,c,d){const R=6371000;const dLat=(c-a)*Math.PI/180;const dLng=(d-b)*Math.PI/180;const x=Math.sin(dLat/2)**2+Math.cos(a*Math.PI/180)*Math.cos(c*Math.PI/180)*Math.sin(dLng/2)**2;return R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x));}

export default function App(){
  const [track,setTrack]=useState(TRACKS[0]);const [locked,setLocked]=useState(false);const [acc,setAcc]=useState(0);
  const [running,setRunning]=useState(false);const [cur,setCur]=useState(0);const [best,setBest]=useState(null);const [prev,setPrev]=useState(null);
  const [sector,setSector]=useState([0,0,0]);const [history,setHistory]=useState([]);const [isPro,setIsPro]=useState(false);const [progress,setProgress]=useState(0);const [tab,setTab]=useState('dash');
  const [showSet,setShowSet]=useState(false);
  const [keepOn,setKeepOn]=useState(true); const [voice,setVoice]=useState(false);
  const [darkMode,setDarkMode]=useState(true); // 預設夜版 黑底螢光靚仔
  const startRef=useRef(0);const timerRef=useRef(null);const subRef=useRef(null);

  useEffect(()=>{(async()=>{try{if(MobileAds)await MobileAds().initialize();}catch(e){}
    const {status}=await Location.requestForegroundPermissionsAsync();if(status!=='granted')return;
    await Location.requestBackgroundPermissionsAsync();
    const h=await AsyncStorage.getItem('lap_history');if(h)setHistory(JSON.parse(h));
    const p=await AsyncStorage.getItem('isPro');if(p)setIsPro(true);
    const dm=await AsyncStorage.getItem('darkMode');if(dm!==null)setDarkMode(dm==='1');
    subRef.current=await Location.watchPositionAsync({accuracy:Location.Accuracy.BestForNavigation,distanceInterval:1,timeInterval:500},loc=>{
      setAcc(loc.coords.accuracy||0);setLocked(true);
      let near=TRACKS[0],min=Infinity;TRACKS.forEach(t=>{const d=dist(loc.coords.latitude,loc.coords.longitude,t.lat,t.lng);if(d<min){min=d;near=t;}});
      if(min<50000&&!running&&near.id!==track.id)setTrack(near);
      if(running){const el=(Date.now()-startRef.current)/1000;setProgress((el%92)/92);if(dist(loc.coords.latitude,loc.coords.longitude,track.lat,track.lng)<25&&Date.now()-startRef.current>15000)finish();}});
  })();return()=>{if(subRef.current)subRef.current.remove();if(timerRef.current)clearInterval(timerRef.current);};},[track,running]);

  const toggleDark = async (v)=>{setDarkMode(v);await AsyncStorage.setItem('darkMode',v?'1':'0');}
  const fmt=s=>{if(!s)return '--:--.--';const m=Math.floor(s/60);const r=(s%60).toFixed(2);return `${m}:${r.padStart(5,'0')}`;};
  const start=()=>{startRef.current=Date.now();setRunning(true);timerRef.current=setInterval(()=>setCur((Date.now()-startRef.current)/1000),100);};
  const stop=()=>{setRunning(false);clearInterval(timerRef.current);};
  const finish=async()=>{const t=(Date.now()-startRef.current)/1000;const s1=t*0.35,s2=t*0.34,s3=t*0.31;const lap={id:Date.now(),time:t,s1,s2,s3,track:track.id,date:new Date().toISOString()};let nh=[lap,...history];if(!isPro&&nh.length>10)nh=nh.slice(0,10);if(isPro&&nh.length>100)nh=nh.slice(0,100);setHistory(nh);await AsyncStorage.setItem('lap_history',JSON.stringify(nh));setPrev(t);if(!best||t<best)setBest(t);setSector([s1,s2,s3]);startRef.current=Date.now();};

  const theme = darkMode? darkS : lightS;
  const currentImg = darkMode? (track.imgDark||track.img) : (track.img||track.imgDark);

  return(
    <View style={[s.c, theme.c]}>
      <View style={[s.head, theme.head]}><View><Text style={[s.t, theme.t]}>圈速go / LapGo</Text><Text style={[s.sub, theme.sub]}>{track.name} • {track.en}</Text></View><TouchableOpacity onPress={()=>setShowSet(true)} style={s.gear}><Text style={{fontSize:24}}>⚙️</Text></TouchableOpacity></View>
      <View style={[s.gps, theme.gps]}><Text style={{color:locked?'#00cc66':'#ff4444',fontWeight:'bold'}}>{locked?'● GPS已鎖定 / GPS Locked':'○ 搜尋中...'}</Text><Text style={[s.gpsI, theme.sub]}>精度 {acc.toFixed(1)}m • {track.short} • {darkMode?'夜版 NIGHT':'日版 DAY'}</Text></View>

      {tab==='dash'&&<ScrollView><Text style={[s.big, theme.t]}>{fmt(cur)}</Text><View style={s.row}><View style={[s.b, theme.b]}><Text style={[s.l, theme.sub]}>上一圈 Previous</Text><Text style={[s.v, theme.t]}>{prev?fmt(prev):'--'}</Text></View><View style={[s.b, theme.b]}><Text style={[s.l, theme.sub]}>最佳圈 Best</Text><Text style={[s.v,{color:'#00cc66'}]}>{best?fmt(best):'--'}</Text></View><View style={[s.b, theme.b]}><Text style={[s.l, theme.sub]}>Delta</Text><Text style={[s.v,{color:'#00cc66'}]}>{prev&&best?`${(prev-best).toFixed(2)}s`:'--'}</Text></View></View>
      <View style={[s.map, theme.map]}><Image source={currentImg} style={s.mapImg} resizeMode="contain"/>{isPro&&<View style={[s.ghost,{left:`${18+progress*65}%`,top:`${35+Math.sin(progress*6)*18}%`}]} /> }<View style={[s.dot,{left:`${15+progress*70}%`,top:`${30+Math.sin(progress*6)*20}%`}]} /><Text style={s.live}>LIVE {isPro?'Ghost 綠點':''}</Text><Text style={[s.start, theme.t]}>START/FINISH</Text></View>
      <View style={s.row}><View style={[s.sb, theme.b]}><Text style={[s.sbT, theme.t]}>S1 {sector[0].toFixed(2)}</Text><Text style={s.sL}>段1</Text></View><View style={[s.sb, theme.b]}><Text style={[s.sbT, theme.t]}>S2 {sector[1].toFixed(2)}</Text><Text style={s.sL}>段2</Text></View><View style={[s.sb, theme.b]}><Text style={[s.sbT, theme.t]}>S3 {sector[2].toFixed(2)}</Text><Text style={s.sL}>段3</Text></View></View>
      <Text style={[s.hT, theme.t]}>圈速紀錄 / Lap History</Text>{history.slice(0,5).map((h,i)=><View key={h.id} style={[s.hR, theme.b]}><Text style={theme.t}>圈 {history.length-i} • {fmt(h.time)} • {h.track.toUpperCase()} • S1 {h.s1.toFixed(2)} S2 {h.s2.toFixed(2)} S3 {h.s3.toFixed(2)}</Text></View>)}
      <View style={s.btnR}><TouchableOpacity style={[s.btn,{backgroundColor:'#ff3333'}]} onPress={stop}><Text style={s.btnT}>■ STOP / 停止</Text></TouchableOpacity><TouchableOpacity style={[s.btn,{backgroundColor:'#00cc66'}]} onPress={start}><Text style={s.btnT}>▶ START / 開始</Text></TouchableOpacity></View>
      {!isPro&&BannerAd&&<BannerAd unitId={BANNER_ID} size={BannerAdSize.BANNER} />}</ScrollView>}

      {tab==='tracks'&&<ScrollView>{TRACKS.map(t=><TouchableOpacity key={t.id} style={[s.tCard, theme.b, track.id===t.id&&{borderColor:'#00cc66',borderWidth:2}]} onPress={()=>setTrack(t)}><Image source={darkMode?(t.imgDark||t.img):(t.img||t.imgDark)} style={{width:'100%',height:140, backgroundColor:darkMode?'#000':'#fff'}} resizeMode="contain"/><Text style={[s.tN, theme.t]}>{t.short} - {t.name} {track.id===t.id?'●預設':''}</Text></TouchableOpacity>)}</ScrollView>}
      {tab==='sessions'&&<ScrollView style={{padding:10}}><Text style={[s.hT, theme.t]}>紀錄 Sessions {history.length}/{isPro?100:10}</Text>{history.map(h=><View key={h.id} style={[s.hR, theme.b]}><Text style={theme.t}>{new Date(h.date).toLocaleString()} | {h.track.toUpperCase()} | {fmt(h.time)}</Text></View>)}</ScrollView>}

      <Modal visible={showSet} animationType="slide"><View style={[s.setPage, theme.c]}><ScrollView style={{padding:16,marginTop:30}}>
        <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}><Text style={[{fontSize:22,fontWeight:'bold'}, theme.t]}>設定 / Settings</Text><TouchableOpacity onPress={()=>setShowSet(false)}><Text style={[{fontSize:22}, theme.t]}>✕</Text></TouchableOpacity></View>
        <View style={[s.proCard, isPro&&{backgroundColor:'#111'}]}><Text style={{fontWeight:'bold',color:isPro?'#ffaa00':'#111',fontSize:16}}>👑 LapGo Pro {isPro?'已啟用':'免費版'}</Text><Text style={{fontSize:12,color:isPro?'#fff':'#666',marginTop:4}}>免費10圈自動拆最舊 • Pro100圈 • {isPro?'有':'無'}幽靈綠線 • 無廣告</Text>{!isPro&&<TouchableOpacity style={s.upBtn} onPress={async()=>{setIsPro(true);await AsyncStorage.setItem('isPro','1');Alert.alert('已升級Pro');}}><Text style={{color:'#fff',fontWeight:'bold',textAlign:'center'}}>升級 Pro $38 買斷</Text></TouchableOpacity>}</View>

        <Text style={[s.setTitle, theme.t]}>--- 顯示 Display ---</Text>
        <View style={[s.setRow, theme.b]}><Text style={theme.t}>🌙 夜間螢光模式 / Night Neon (黑底)</Text><Switch value={darkMode} onValueChange={toggleDark}/></View>
        <View style={[s.setRow, theme.b]}><Text style={theme.t}>螢幕常亮</Text><Switch value={keepOn} onValueChange={setKeepOn}/></View><View style={[s.setRow, theme.b]}><Text style={theme.t}>語音播報</Text><Switch value={voice} onValueChange={setVoice}/></View>

        <Text style={[s.setTitle, theme.t]}>--- 賽道 Tracks ({TRACKS.length}) ---</Text>
        {TRACKS.map(t=><View key={t.id} style={[s.setRow, theme.b]}><Text style={theme.t}>{t.short}</Text><Text style={{color:track.id===t.id?'#00cc66':'#888'}}>{track.id===t.id?'●':''}</Text></View>)}

        <Text style={[s.setTitle, theme.t]}>--- 系統 ---</Text><TouchableOpacity style={[s.setRow, theme.b]} onPress={async()=>{await AsyncStorage.removeItem('lap_history');setHistory([]);Alert.alert('已清除');}}><Text style={theme.t}>🗑️ 清除所有紀錄</Text></TouchableOpacity><View style={{height:100}}/></ScrollView></View></Modal>

      <View style={[s.tabBar, theme.gps]}><TouchableOpacity onPress={()=>setTab('dash')}><Text style={[s.tab,tab==='dash'&&s.tabOn]}>儀表 Dash</Text></TouchableOpacity><TouchableOpacity onPress={()=>setTab('sessions')}><Text style={[s.tab,tab==='sessions'&&s.tabOn]}>紀錄 Sessions</Text></TouchableOpacity><TouchableOpacity onPress={()=>setTab('tracks')}><Text style={[s.tab,tab==='tracks'&&s.tabOn]}>賽道 Tracks ({TRACKS.length})</Text></TouchableOpacity></View>
    </View>
  );
}

const s=StyleSheet.create({
  c:{flex:1,paddingTop:40},head:{flexDirection:'row',justifyContent:'space-between',padding:10,alignItems:'center'},t:{fontSize:22,fontWeight:'bold'},sub:{fontSize:11},gear:{padding:8},proCard:{backgroundColor:'#fff3cd',padding:16,borderRadius:12,marginTop:12,borderWidth:1,borderColor:'#ffaa00'},upBtn:{backgroundColor:'#111',padding:12,borderRadius:8,marginTop:10},
  gps:{flexDirection:'row',justifyContent:'space-between',padding:8},gpsI:{fontSize:11},
  big:{fontSize:64,textAlign:'center',fontWeight:'bold',marginVertical:10},
  row:{flexDirection:'row',justifyContent:'space-around'},b:{padding:10,borderRadius:8,flex:1,margin:4,alignItems:'center',borderWidth:1},l:{fontSize:10},v:{fontSize:18,fontWeight:'bold'},
  map:{height:260,margin:10,borderRadius:10,overflow:'hidden',borderWidth:1,justifyContent:'center'},mapImg:{width:'100%',height:'100%'},dot:{position:'absolute',width:12,height:12,borderRadius:6,backgroundColor:'red',borderWidth:2,borderColor:'#fff'},ghost:{position:'absolute',width:10,height:10,borderRadius:5,backgroundColor:'#00ff88',borderWidth:2,borderColor:'#fff'},live:{position:'absolute',right:8,top:8,color:'red',fontSize:10,backgroundColor:'#fff',padding:4,borderRadius:4},start:{position:'absolute',bottom:8,left:'50%',fontSize:10},
  sb:{padding:10,borderRadius:8,flex:1,margin:4,alignItems:'center',borderWidth:1},sbT:{},sL:{backgroundColor:'#00cc66',color:'#fff',paddingHorizontal:12,borderRadius:6,marginTop:4},
  hT:{fontSize:16,margin:10,fontWeight:'bold'},hR:{padding:10,margin:4,borderRadius:6,borderWidth:1},
  btnR:{flexDirection:'row',justifyContent:'space-around',margin:20},btn:{padding:16,borderRadius:12,flex:1,margin:5,alignItems:'center'},btnT:{color:'#fff',fontWeight:'bold'},
  tabBar:{flexDirection:'row',justifyContent:'space-around',padding:12,borderTopWidth:1},tab:{color:'#888'},tabOn:{color:'#00cc66',fontWeight:'bold'},
  tCard:{margin:8,borderRadius:10,padding:6,borderWidth:1},tN:{textAlign:'center',marginTop:4},
  setPage:{flex:1},setTitle:{fontWeight:'bold',marginTop:20,marginBottom:6},setRow:{flexDirection:'row',justifyContent:'space-between',padding:14,borderRadius:8,marginBottom:8,borderWidth:1}
});
const lightS=StyleSheet.create({
  c:{backgroundColor:'#fff'}, head:{backgroundColor:'#fff'}, t:{color:'#111'}, sub:{color:'#666'}, gps:{backgroundColor:'#f2f2f2'}, b:{backgroundColor:'#f5f5f5',borderColor:'#eee'}, map:{backgroundColor:'#fff',borderColor:'#ddd'},
});
const darkS=StyleSheet.create({
  c:{backgroundColor:'#000'}, head:{backgroundColor:'#000'}, t:{color:'#fff'}, sub:{color:'#aaa'}, gps:{backgroundColor:'#111'}, b:{backgroundColor:'#111',borderColor:'#333'}, map:{backgroundColor:'#000',borderColor:'#333'},
});
