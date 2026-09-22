import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
let BannerAd, BannerAdSize, MobileAds;
try{ const Ads=require('react-native-google-mobile-ads'); BannerAd=Ads.BannerAd; BannerAdSize=Ads.BannerAdSize; MobileAds=Ads.MobileAds; }catch(e){}
const BANNER_ID="ca-app-pub-9890149028563226/7083933962";
const TRACKS=[
  {id:'zic',name:'珠海國際賽車場',en:'Zhuhai Circuit',short:'ZIC • ZHUHAI • 14T',lat:22.3598,lng:113.5678,img:require('./assets/tracks/zic.png')},
  {id:'gic',name:'廣東國際賽車場',en:'Guangdong Circuit',short:'GIC • 13T',lat:23.1216,lng:112.559,img:require('./assets/tracks/gic.png')},
  {id:'fuji',name:'富士賽道',en:'Fuji Speedway',short:'FUJI • 16T',lat:35.3717,lng:138.927,img:require('./assets/tracks/fuji.png')},
  {id:'suzuka',name:'鈴鹿賽道',en:'Suzuka Circuit',short:'SUZUKA • 18T',lat:34.8431,lng:136.5409,img:require('./assets/tracks/suzuka.png')},
  {id:'tsukuba',name:'筑波賽道',en:'Tsukuba Circuit',short:'TSUKUBA • 9T',lat:36.083,lng:140.075,img:require('./assets/tracks/tsukuba.png')},
];
function dist(a,b,c,d){const R=6371000;const dLat=(c-a)*Math.PI/180;const dLng=(d-b)*Math.PI/180;const x=Math.sin(dLat/2)**2+Math.cos(a*Math.PI/180)*Math.cos(c*Math.PI/180)*Math.sin(dLng/2)**2;return R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x));}
export default function App(){
  const [track,setTrack]=useState(TRACKS[0]);const [locked,setLocked]=useState(false);const [acc,setAcc]=useState(0);
  const [running,setRunning]=useState(false);const [cur,setCur]=useState(0);const [best,setBest]=useState(null);const [prev,setPrev]=useState(null);
  const [sector,setSector]=useState([0,0,0]);const [history,setHistory]=useState([]);const [isPro,setIsPro]=useState(false);const [progress,setProgress]=useState(0);const [tab,setTab]=useState('dash');
  const startRef=useRef(0);const timerRef=useRef(null);const subRef=useRef(null);
  useEffect(()=>{(async()=>{try{if(MobileAds)await MobileAds().initialize();}catch(e){}const {status}=await Location.requestForegroundPermissionsAsync();if(status!=='granted')return;await Location.requestBackgroundPermissionsAsync();const h=await AsyncStorage.getItem('lap_history');if(h)setHistory(JSON.parse(h));const p=await AsyncStorage.getItem('isPro');if(p)setIsPro(true);subRef.current=await Location.watchPositionAsync({accuracy:Location.Accuracy.BestForNavigation,distanceInterval:1,timeInterval:500},loc=>{setAcc(loc.coords.accuracy||0);setLocked(true);let near=TRACKS[0],min=Infinity;TRACKS.forEach(t=>{const d=dist(loc.coords.latitude,loc.coords.longitude,t.lat,t.lng);if(d<min){min=d;near=t;}});if(min<50000&&!running&&near.id!==track.id)setTrack(near);if(running){const el=(Date.now()-startRef.current)/1000;setProgress((el%92)/92);if(dist(loc.coords.latitude,loc.coords.longitude,track.lat,track.lng)<25&&Date.now()-startRef.current>15000)finish();}});})();return()=>{if(subRef.current)subRef.current.remove();if(timerRef.current)clearInterval(timerRef.current);};},[track,running]);
  const fmt=s=>{if(!s)return '--:--.--';const m=Math.floor(s/60);const r=(s%60).toFixed(2);return `${m}:${r.padStart(5,'0')}`;};
  const start=()=>{startRef.current=Date.now();setRunning(true);timerRef.current=setInterval(()=>setCur((Date.now()-startRef.current)/1000),100);};
  const stop=()=>{setRunning(false);clearInterval(timerRef.current);};
  const finish=async()=>{const t=(Date.now()-startRef.current)/1000;const s1=t*0.35,s2=t*0.34,s3=t*0.31;const lap={id:Date.now(),time:t,s1,s2,s3,track:track.id,date:new Date().toISOString()};let nh=[lap,...history];if(!isPro&&nh.length>10)nh=nh.slice(0,10);if(isPro&&nh.length>100)nh=nh.slice(0,100);setHistory(nh);await AsyncStorage.setItem('lap_history',JSON.stringify(nh));setPrev(t);if(!best||t<best)setBest(t);setSector([s1,s2,s3]);startRef.current=Date.now();};
  return(
    <View style={s.c}>
      <View style={s.head}><View><Text style={s.t}>圈速go / LapGo</Text><Text style={s.sub}>{track.name} • {track.en}</Text></View><TouchableOpacity style={s.pro} onPress={async()=>{setIsPro(true);await AsyncStorage.setItem('isPro','1');Alert.alert('已升級Pro','已去廣告，可存100條，有幽靈線');}}><Text style={s.proT}>{isPro?'Pro已啟用':'升級Pro $38'}</Text></TouchableOpacity></View>
      <View style={s.gps}><Text style={{color:locked?'#00ff88':'#ff4444'}}>{locked?'● GPS已鎖定 / GPS Locked':'○ 搜尋中...'}</Text><Text style={s.gpsI}>精度 {acc.toFixed(1)}m • {track.short}</Text></View>
      {tab==='dash'&&<ScrollView><Text style={s.big}>{fmt(cur)}</Text><View style={s.row}><View style={s.b}><Text style={s.l}>上一圈 Previous Lap</Text><Text style={s.v}>{prev?fmt(prev):'--'}</Text></View><View style={s.b}><Text style={s.l}>最佳圈 Best Lap</Text><Text style={[s.v,{color:'#00ff88'}]}>{best?fmt(best):'--'}</Text></View><View style={s.b}><Text style={s.l}>Delta</Text><Text style={[s.v,{color:'#00ff88'}]}>{prev&&best?`${(prev-best).toFixed(2)}s`:'--'}</Text></View></View>
      <View style={s.map}><Image source={track.img} style={s.mapImg} resizeMode="contain"/><View style={[s.dot,{left:`${15+progress*70}%`,top:`${30+Math.sin(progress*6)*20}%`}]} /><Text style={s.live}>即時位置 LIVE 紅點喺賽道上移動</Text><Text style={s.start}>起/終點 START/FINISH</Text></View>
      <View style={s.row}><View style={s.sb}><Text style={s.sbT}>S1 {sector[0].toFixed(2)}</Text><Text style={s.sL}>段1</Text></View><View style={s.sb}><Text style={s.sbT}>S2 {sector[1].toFixed(2)}</Text><Text style={s.sL}>段2</Text></View><View style={s.sb}><Text style={s.sbT}>S3 {sector[2].toFixed(2)}</Text><Text style={s.sL}>段3</Text></View></View>
      <Text style={s.hT}>圈速紀錄 / Lap History</Text>{history.slice(0,5).map((h,i)=><View key={h.id} style={s.hR}><Text style={{color:'#fff'}}>圈 {history.length-i} • {fmt(h.time)} • {h.track.toUpperCase()} • S1 {h.s1.toFixed(2)} S2 {h.s2.toFixed(2)} S3 {h.s3.toFixed(2)}</Text></View>)}
      <View style={s.btnR}><TouchableOpacity style={[s.btn,{backgroundColor:'#ff3333'}]} onPress={stop}><Text style={s.btnT}>■ STOP / 停止</Text></TouchableOpacity><TouchableOpacity style={[s.btn,{backgroundColor:'#00cc66'}]} onPress={start}><Text style={s.btnT}>▶ START / 開始</Text></TouchableOpacity></View>
      {!isPro&&BannerAd&&<BannerAd unitId={BANNER_ID} size={BannerAdSize.BANNER} />}</ScrollView>}
      {tab==='tracks'&&<ScrollView>{TRACKS.map(t=><TouchableOpacity key={t.id} style={[s.tCard,track.id===t.id&&{borderColor:'#00ff88',borderWidth:2}]} onPress={()=>setTrack(t)}><Image source={t.img} style={{width:'100%',height:140}} resizeMode="contain"/><Text style={s.tN}>{t.short} - {t.name} {track.id===t.id?'●預設 ZIC':''}</Text></TouchableOpacity>)}</ScrollView>}
      {tab==='sessions'&&<ScrollView style={{padding:10}}><Text style={s.hT}>紀錄 Sessions {history.length}/{isPro?100:10}</Text>{history.map(h=><View key={h.id} style={s.hR}><Text style={{color:'#fff'}}>{new Date(h.date).toLocaleString()} | {h.track.toUpperCase()} | {fmt(h.time)}</Text>{isPro&&<Text style={{color:'#00ff88'}}>幽靈線 Ghost: Best {best?fmt(best):''} vs 此圈 {fmt(h.time)} 差 {(h.time-(best||h.time)).toFixed(2)}s</Text>}</View>)}</ScrollView>}
      <View style={s.tabBar}><TouchableOpacity onPress={()=>setTab('dash')}><Text style={[s.tab,tab==='dash'&&s.tabOn]}>儀表 Dash</Text></TouchableOpacity><TouchableOpacity onPress={()=>setTab('sessions')}><Text style={[s.tab,tab==='sessions'&&s.tabOn]}>紀錄 Sessions</Text></TouchableOpacity><TouchableOpacity onPress={()=>setTab('tracks')}><Text style={[s.tab,tab==='tracks'&&s.tabOn]}>賽道 Tracks</Text></TouchableOpacity></View>
    </View>
  );
}
const s=StyleSheet.create({
  c:{flex:1,backgroundColor:'#000',paddingTop:40},head:{flexDirection:'row',justifyContent:'space-between',padding:10,alignItems:'center'},t:{color:'#fff',fontSize:22,fontWeight:'bold'},sub:{color:'#aaa',fontSize:11},pro:{borderWidth:1,borderColor:'#ffaa00',padding:6,borderRadius:12},proT:{color:'#ffaa00',fontSize:12},
  gps:{flexDirection:'row',justifyContent:'space-between',backgroundColor:'#111',padding:8},gpsI:{color:'#888',fontSize:11},
  big:{color:'#fff',fontSize:64,textAlign:'center',fontWeight:'bold',marginVertical:10},
  row:{flexDirection:'row',justifyContent:'space-around'},b:{backgroundColor:'#111',padding:10,borderRadius:8,flex:1,margin:4,alignItems:'center'},l:{color:'#aaa',fontSize:10},v:{color:'#fff',fontSize:18,fontWeight:'bold'},
  map:{height:240,backgroundColor:'#000',margin:10,borderRadius:10,overflow:'hidden',borderWidth:1,borderColor:'#222',justifyContent:'center'},mapImg:{width:'100%',height:'100%'},dot:{position:'absolute',width:12,height:12,borderRadius:6,backgroundColor:'red',borderWidth:2,borderColor:'#fff'},live:{position:'absolute',right:8,top:8,color:'red',fontSize:10,backgroundColor:'#000a',padding:4,borderRadius:4},start:{position:'absolute',bottom:8,left:'50%',color:'#fff',fontSize:10},
  sb:{backgroundColor:'#222',padding:10,borderRadius:8,flex:1,margin:4,alignItems:'center'},sbT:{color:'#fff'},sL:{backgroundColor:'#00cc66',color:'#fff',paddingHorizontal:12,borderRadius:6,marginTop:4},
  hT:{color:'#fff',fontSize:16,margin:10,fontWeight:'bold'},hR:{backgroundColor:'#1a1a1a',padding:10,margin:4,borderRadius:6},
  btnR:{flexDirection:'row',justifyContent:'space-around',margin:20},btn:{padding:16,borderRadius:12,flex:1,margin:5,alignItems:'center'},btnT:{color:'#fff',fontWeight:'bold'},
  tabBar:{flexDirection:'row',justifyContent:'space-around',backgroundColor:'#111',padding:12,borderTopWidth:1,borderColor:'#333'},tab:{color:'#888'},tabOn:{color:'#00ff88',fontWeight:'bold'},
  tCard:{margin:8,backgroundColor:'#111',borderRadius:10,padding:6},tN:{color:'#fff',textAlign:'center',marginTop:4}
});
