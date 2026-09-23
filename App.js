import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Image, Modal, Switch } from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
let BannerAd, BannerAdSize, MobileAds;
try{ const Ads=require('react-native-google-mobile-ads'); BannerAd=Ads.BannerAd; BannerAdSize=Ads.BannerAdSize; MobileAds=Ads.MobileAds; }catch(e){}
const BANNER_ID="ca-app-pub-9890149028563226/7083933962";

const TRACKS=[
  {id:'zic',name:'珠海國際賽車場',en:'Zhuhai Circuit',short:'ZIC • ZHUHAI • 14T',lat:22.3598,lng:113.5678,img:require('./assets/tracks/zic.jpg'),imgDark:require('./assets/tracks/zic.jpg')},
  {id:'gic',name:'廣東國際賽車場',en:'Guangdong Circuit',short:'GIC • 13T',lat:23.1216,lng:112.559,img:require('./assets/tracks/gic.jpg'),imgDark:require('./assets/tracks/gic.jpg')},
  {id:'fuji',name:'富士賽道',en:'Fuji Speedway',short:'FUJI • 16T',lat:35.3717,lng:138.927,img:require('./assets/tracks/fuji.jpg'),imgDark:require('./assets/tracks/fuji.jpg')},
  {id:'suzuka',name:'鈴鹿賽道',en:'Suzuka Circuit',short:'SUZUKA • 18T',lat:34.8431,lng:136.5409,img:require('./assets/tracks/suzuka.jpg'),imgDark:require('./assets/tracks/suzuka.jpg')},
  {id:'tsukuba',name:'筑波賽道',en:'Tsukuba Circuit',short:'TSUKUBA • 9T',lat:36.083,lng:140.075,img:require('./assets/tracks/tsukuba.jpg'),imgDark:require('./assets/tracks/tsukuba.jpg')},
  {id:'okayama',name:'岡山國際賽道',en:'Okayama Circuit',short:'OKAYAMA • 11T',lat:34.915,lng:134.212,img:require('./assets/tracks/okayama.jpg'),imgDark:require('./assets/tracks/okayama.jpg')},
  {id:'buriram',name:'武里南賽道',en:'Buriram Circuit',short:'BURIRAM • 12T',lat:14.966,lng:103.095,img:require('./assets/tracks/buriram.jpg'),imgDark:require('./assets/tracks/buriram.jpg')},
  {id:'sepang',name:'雪邦賽道',en:'Sepang Circuit',short:'SEPANG • 15T',lat:2.7606,lng:101.738,img:require('./assets/tracks/sepang.jpg'),imgDark:require('./assets/tracks/sepang.jpg')},
  {id:'zhuzhou',name:'株洲國際賽道',en:'Zhuzhou Circuit',short:'ZHUZHOU • 14T',lat:27.85,lng:113.15,img:require('./assets/tracks/zhuzhou.jpg'),imgDark:require('./assets/tracks/zhuzhou.jpg')},
  {id:'ningbo',name:'寧波國際賽道',en:'Ningbo Circuit',short:'NINGBO • 22T',lat:30.33,lng:121.45,img:require('./assets/tracks/ningbo.jpg'),imgDark:require('./assets/tracks/ningbo.jpg')},
  {id:'guia',name:'東望洋賽道',en:'Guia Circuit',short:'GUIA • MACAU • 22T',lat:22.197,lng:113.555,img:require('./assets/tracks/guia.jpg'),imgDark:require('./assets/tracks/guia.jpg')},
];

const LANG = {
  zh: {
    app:'圈速go', gpsOk:'● GPS已鎖定', gpsNo:'○ 搜尋中...', acc:'精度',
    prev:'上一圈', best:'最佳圈', delta:'Delta', live:'即時位置 LIVE', sf:'起/終點',
    s1:'段1', s2:'段2', s3:'段3', hist:'圈速紀錄', dash:'儀表', sess:'紀錄', tracks:'賽道',
    set:'設定', timer:'--- 計時 Timer ---', disp:'--- 顯示 Display ---', sys:'--- 系統 System ---', proF:'--- Pro功能',
    night:'🌙 夜間螢光模式', nightSub:'夜版/日版', unit:'單位 km/h', keep:'螢幕常亮', voice:'語音播報 每圈', dot:'即時紅點',
    langTitle:'🌐 語言 / Language', langSub:'繁中', export:'📤 匯出CSV/GPX', ghost:'幽靈線透明度 50%', clear:'🗑️ 清除所有紀錄', ver:'版本 v2.1 11賽道夜版 中英版',
    proFree:'免費版', proOn:'已啟用', proDesc:'免費10圈自動拆最舊 • Pro100圈 • 有/無幽靈綠線 • 無廣告 • 匯出CSV', upgrade:'升級 Pro $38 買斷', restore:'還原購買 Restore'
  },
  en: {
    app:'LapGo', gpsOk:'● GPS Locked', gpsNo:'○ Searching...', acc:'Acc',
    prev:'Previous', best:'Best', delta:'Delta', live:'LIVE Position', sf:'START/FINISH',
    s1:'S1', s2:'S2', s3:'S3', hist:'Lap History', dash:'Dash', sess:'Sessions', tracks:'Tracks',
    set:'Settings', timer:'--- Timer ---', disp:'--- Display ---', sys:'--- System ---', proF:'--- Pro Features',
    night:'🌙 Neon Night Mode', nightSub:'Night/Day', unit:'Units km/h', keep:'Keep Screen On', voice:'Voice per Lap', dot:'Live Dot',
    langTitle:'🌐 Language', langSub:'English', export:'📤 Export CSV/GPX', ghost:'Ghost Opacity 50%', clear:'🗑️ Clear All History', ver:'Version v2.1 11 Tracks Night EN/ZH',
    proFree:'Free', proOn:'Active', proDesc:'Free 10 laps auto-remove oldest • Pro 100 laps • Ghost line • No Ads • Export CSV', upgrade:'Upgrade Pro $38', restore:'Restore Purchase'
  }
};

function dist(a,b,c,d){const R=6371000;const dLat=(c-a)*Math.PI/180;const dLng=(d-b)*Math.PI/180;const x=Math.sin(dLat/2)**2+Math.cos(a*Math.PI/180)*Math.cos(c*Math.PI/180)*Math.sin(dLng/2)**2;return R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x));}

export default function App(){
  const [track,setTrack]=useState(TRACKS[0]);const [locked,setLocked]=useState(false);const [acc,setAcc]=useState(0);
  const [running,setRunning]=useState(false);const [cur,setCur]=useState(0);const [best,setBest]=useState(null);const [prev,setPrev]=useState(null);
  const [sector,setSector]=useState([0,0,0]);const [history,setHistory]=useState([]);const [isPro,setIsPro]=useState(false);const [progress,setProgress]=useState(0);const [tab,setTab]=useState('dash');
  const [showSet,setShowSet]=useState(false);
  const [keepOn,setKeepOn]=useState(true); const [voice,setVoice]=useState(false); const [darkMode,setDarkMode]=useState(true);
  const [lang,setLang]=useState('zh');
  const startRef=useRef(0);const timerRef=useRef(null);const subRef=useRef(null);
  const T = LANG[lang];

  useEffect(()=>{(async()=>{try{if(MobileAds)await MobileAds().initialize();}catch(e){}
    const {status}=await Location.requestForegroundPermissionsAsync();if(status!=='granted')return;
    await Location.requestBackgroundPermissionsAsync();
    const h=await AsyncStorage.getItem('lap_history');if(h)setHistory(JSON.parse(h));
    const p=await AsyncStorage.getItem('isPro');if(p)setIsPro(true);
    const dm=await AsyncStorage.getItem('darkMode');if(dm!==null)setDarkMode(dm==='1');
    const lg=await AsyncStorage.getItem('lang');if(lg) setLang(lg);
    subRef.current=await Location.watchPositionAsync({accuracy:Location.Accuracy.BestForNavigation,distanceInterval:1,timeInterval:500},loc=>{
      setAcc(loc.coords.accuracy||0);setLocked(true);
      let near=TRACKS[0],min=Infinity;TRACKS.forEach(t=>{const d=dist(loc.coords.latitude,loc.coords.longitude,t.lat,t.lng);if(d<min){min=d;near=t;}});
      if(min<50000&&!running&&near.id!==track.id)setTrack(near);
      if(running){const el=(Date.now()-startRef.current)/1000;setProgress((el%92)/92);if(dist(loc.coords.latitude,loc.coords.longitude,track.lat,track.lng)<25&&Date.now()-startRef.current>15000)finish();}});
  })();return()=>{if(subRef.current)subRef.current.remove();if(timerRef.current)clearInterval(timerRef.current);};},[track,running]);

  const toggleDark = async (v)=>{setDarkMode(v);await AsyncStorage.setItem('darkMode',v?'1':'0');}
  const toggleLang = async (v)=>{const nl=v?'en':'zh'; setLang(nl); await AsyncStorage.setItem('lang',nl);}
  const fmt=s=>{if(!s)return '--:--.--';const m=Math.floor(s/60);const r=(s%60).toFixed(2);return `${m}:${r.padStart(5,'0')}`;};
  const start=()=>{startRef.current=Date.now();setRunning(true);timerRef.current=setInterval(()=>setCur((Date.now()-startRef.current)/1000),100);};
  const stop=()=>{setRunning(false);clearInterval(timerRef.current);};
  const finish=async()=>{const t=(Date.now()-startRef.current)/1000;const s1=t*0.35,s2=t*0.34,s3=t*0.31;const lap={id:Date.now(),time:t,s1,s2,s3,track:track.id,date:new Date().toISOString()};let nh=[lap,...history];if(!isPro&&nh.length>10)nh=nh.slice(0,10);if(isPro&&nh.length>100)nh=nh.slice(0,100);setHistory(nh);await AsyncStorage.setItem('lap_history',JSON.stringify(nh));setPrev(t);if(!best||t<best)setBest(t);setSector([s1,s2,s3]);startRef.current=Date.now();};
  const theme = darkMode? darkS : lightS;
  const currentImg = darkMode? (track.imgDark||track.img) : (track.img||track.imgDark);

  return(
    <View style={[s.c, theme.c]}>
      <View style={[s.head, theme.head]}><View><Text style={[s.t, theme.t]}>{T.app}</Text><Text style={[s.sub, theme.sub]}>{lang==='zh'?track.name:track.en} • {track.short}</Text></View><TouchableOpacity onPress={()=>setShowSet(true)} style={s.gear}><Text style={{fontSize:24}}>⚙️</Text></TouchableOpacity></View>
      <View style={[s.gps, theme.gps]}><Text style={{color:locked?'#00cc66':'#ff4444',fontWeight:'bold'}}>{locked?T.gpsOk:T.gpsNo}</Text><Text style={[s.gpsI, theme.sub]}>{T.acc} {acc.toFixed(1)}m • {track.short} • {darkMode?T.nightSub.split('/')[0]:T.nightSub.split('/')[1]||T.nightSub}</Text></View>

      {tab==='dash'&&<ScrollView>
        <Text style={[s.big, theme.t]}>{fmt(cur)}</Text>
        <View style={s.row}><View style={[s.b, theme.b]}><Text style={[s.l, theme.sub]}>{T.prev}</Text><Text style={[s.v, theme.t]}>{prev?fmt(prev):'--'}</Text></View><View style={[s.b, theme.b]}><Text style={[s.l, theme.sub]}>{T.best}</Text><Text style={[s.v,{color:'#00cc66'}]}>{best?fmt(best):'--'}</Text></View><View style={[s.b, theme.b]}><Text style={[s.l, theme.sub]}>{T.delta}</Text><Text style={[s.v,{color:'#00cc66'}]}>{prev&&best?`${(prev-best).toFixed(2)}s`:'--'}</Text></View></View>
        <View style={[s.map, theme.map]}><Image source={currentImg} style={s.mapImg} resizeMode="contain"/>{isPro&&<View style={[s.ghost,{left:`${18+progress*65}%`,top:`${35+Math.sin(progress*6)*18}%`}]} /> }<View style={[s.dot,{left:`${15+progress*70}%`,top:`${30+Math.sin(progress*6)*20}%`}]} /><Text style={s.live}>{T.live} {isPro?' + Ghost':''}</Text><Text style={[s.start, theme.t]}>{T.sf}</Text></View>
        <View style={s.row}><View style={[s.sb, theme.b]}><Text style={[s.sbT, theme.t]}>S1 {sector[0].toFixed(2)}</Text><Text style={s.sL}>{T.s1}</Text></View><View style={[s.sb, theme.b]}><Text style={[s.sbT, theme.t]}>S2 {sector[1].toFixed(2)}</Text><Text style={s.sL}>{T.s2}</Text></View><View style={[s.sb, theme.b]}><Text style={[s.sbT, theme.t]}>S3 {sector[2].toFixed(2)}</Text><Text style={s.sL}>{T.s3}</Text></View></View>

        <Text style={[s.hT, theme.t]}>{T.hist}</Text>
        {history.slice(0,5).map((h,i)=>{
          const isBest = best && Math.abs(h.time - best) < 0.01;
          const dlt = best? (h.time - best) : 0;
          return (
            <View key={h.id} style={[s.hR, theme.b, i===0&&{backgroundColor:darkMode?'#003311':'#d4edda', borderColor:'#00cc66'}]}>
              <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
                <Text style={[{fontWeight:'bold', width:22}, theme.t]}>{i+1}</Text>
                <Text style={[theme.t, {flex:1}]}>{lang==='zh'?'圈':'Lap'} {history.length-i} • {fmt(h.time)} • {h.track.toUpperCase()} • S1 {h.s1.toFixed(2)} S2 {h.s2.toFixed(2)} S3 {h.s3.toFixed(2)}</Text>
                <Text style={{color:isBest?'#00cc66': dlt>0?'#ffaa00':'#00cc66', fontSize:11, fontWeight:'bold', marginLeft:4}}>{isBest?'☆ Best':(dlt>0?`+${dlt.toFixed(2)}s`:`${dlt.toFixed(2)}s`)}</Text>
              </View>
            </View>
          );
        })}

        <View style={s.btnR}><TouchableOpacity style={[s.btn,{backgroundColor:'#ff3333'}]} onPress={stop}><Text style={s.btnT}>{T.hist.includes('圈')?'■ STOP':'■ STOP'}</Text></TouchableOpacity><TouchableOpacity style={[s.btn,{backgroundColor:'#00cc66'}]} onPress={start}><Text style={s.btnT}>{lang==='zh'?'▶ START 開始':'▶ START'}</Text></TouchableOpacity></View>
        {!isPro&&BannerAd&&<BannerAd unitId={BANNER_ID} size={BannerAdSize.BANNER} />}</ScrollView>}

      {tab==='tracks'&&<ScrollView>{TRACKS.map(t=><TouchableOpacity key={t.id} style={[s.tCard, theme.b,track.id===t.id&&{borderColor:'#00cc66',borderWidth:2}]} onPress={()=>setTrack(t)}><Image source={darkMode?(t.imgDark||t.img):(t.img||t.imgDark)} style={{width:'100%',height:140, backgroundColor:darkMode?'#000':'#fff'}} resizeMode="contain"/><Text style={[s.tN, theme.t]}>{t.short} - {lang==='zh'?t.name:t.en} {track.id===t.id?'●':''}</Text></TouchableOpacity>)}</ScrollView>}
      {tab==='sessions'&&<ScrollView style={{padding:10}}><Text style={[s.hT, theme.t]}>{T.sess} {history.length}/{isPro?100:10}</Text>{history.map(h=><View key={h.id} style={[s.hR, theme.b]}><Text style={theme.t}>{new Date(h.date).toLocaleString()} | {h.track.toUpperCase()} | {fmt(h.time)}</Text></View>)}</ScrollView>}

      <Modal visible={showSet} animationType="slide"><View style={[s.setPage, theme.c]}><ScrollView style={{padding:16,marginTop:30}}>
        <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}><Text style={[{fontSize:22,fontWeight:'bold'}, theme.t]}>{T.set}</Text><TouchableOpacity onPress={()=>setShowSet(false)}><Text style={[{fontSize:22}, theme.t]}>✕</Text></TouchableOpacity></View>
        <View style={[s.proCard,isPro&&{backgroundColor:'#111'}]}><Text style={{fontWeight:'bold',color:isPro?'#ffaa00':'#111',fontSize:16}}>👑 {T.pro} {isPro?T.proOn:T.proFree}</Text><Text style={{fontSize:12,color:isPro?'#fff':'#666',marginTop:4}}>{T.proDesc}</Text>{!isPro&&<TouchableOpacity style={s.upBtn} onPress={async()=>{setIsPro(true);await AsyncStorage.setItem('isPro','1');Alert.alert(lang==='zh'?'已升級Pro':'Upgraded Pro');}}><Text style={{color:'#fff',fontWeight:'bold',textAlign:'center'}}>{T.upgrade}</Text></TouchableOpacity>}<TouchableOpacity onPress={()=>Alert.alert(T.restore)} style={{marginTop:8}}><Text style={{textAlign:'center',color:'#888'}}>{T.restore}</Text></TouchableOpacity></View>

        <Text style={[s.setTitle, theme.t]}>{T.timer}</Text><View style={[s.setRow, theme.b]}><Text style={theme.t}>起/終點校準 ±25m / Start/Finish ±25m</Text><Text style={theme.sub}>＞</Text></View><View style={[s.setRow, theme.b]}><Text style={theme.t}>最低觸發 15秒 / Min 15s</Text><Text style={theme.sub}>＞</Text></View><View style={[s.setRow, theme.b]}><Text style={theme.t}>自動計圈 / Auto Lap</Text><Switch value={true}/></View>

        <Text style={[s.setTitle, theme.t]}>{T.disp}</Text>
        <View style={[s.setRow, theme.b]}><Text style={theme.t}>{T.langTitle} - {T.langSub}</Text><Switch value={lang==='en'} onValueChange={toggleLang}/></View>
        <View style={[s.setRow, theme.b]}><Text style={theme.t}>{T.night}</Text><Switch value={darkMode} onValueChange={toggleDark}/></View>
        <View style={[s.setRow, theme.b]}><Text style={theme.t}>{T.unit}</Text><Text style={theme.sub}>＞</Text></View><View style={[s.setRow, theme.b]}><Text style={theme.t}>{T.keep}</Text><Switch value={keepOn} onValueChange={setKeepOn}/></View><View style={[s.setRow, theme.b]}><Text style={theme.t}>{T.voice}</Text><Switch value={voice} onValueChange={setVoice}/></View><View style={[s.setRow, theme.b]}><Text style={theme.t}>{T.dot}</Text><Switch value={true}/></View>

        <Text style={[s.setTitle, theme.t]}>{T.proF} {isPro?'':'🔒'}</Text><TouchableOpacity style={[s.setRow, theme.b]} onPress={()=>!isPro&&Alert.alert(lang==='zh'?'請升級Pro':'Upgrade to Pro')}><Text style={theme.t}>{T.export} {isPro?'':'🔒'}</Text><Text style={theme.sub}>＞</Text></TouchableOpacity><View style={[s.setRow, theme.b]}><Text style={theme.t}>{T.ghost} {isPro?'':'🔒'}</Text><Text style={theme.sub}>＞</Text></View>
        <Text style={[s.setTitle, theme.t]}>{T.sys}</Text><TouchableOpacity style={[s.setRow, theme.b]} onPress={async()=>{await AsyncStorage.removeItem('lap_history');setHistory([]);Alert.alert(lang==='zh'?'已清除':'Cleared');}}><Text style={theme.t}>{T.clear}</Text></TouchableOpacity><View style={[s.setRow, theme.b]}><Text style={theme.t}>{T.ver}</Text></View><View style={{height:100}}/>
      </ScrollView></View></Modal>

      <View style={[s.tabBar, theme.gps]}><TouchableOpacity onPress={()=>setTab('dash')}><Text style={[s.tab,tab==='dash'&&s.tabOn]}>{T.dash}</Text></TouchableOpacity><TouchableOpacity onPress={()=>setTab('sessions')}><Text style={[s.tab,tab==='sessions'&&s.tabOn]}>{T.sess}</Text></TouchableOpacity><TouchableOpacity onPress={()=>setTab('tracks')}><Text style={[s.tab,tab==='tracks'&&s.tabOn]}>{T.tracks} ({TRACKS.length})</Text></TouchableOpacity></View>
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
const lightS=StyleSheet.create({c:{backgroundColor:'#fff'},head:{backgroundColor:'#fff'},t:{color:'#111'},sub:{color:'#666'},gps:{backgroundColor:'#f2f2f2'},b:{backgroundColor:'#f5f5f5',borderColor:'#eee'},map:{backgroundColor:'#fff',borderColor:'#ddd'}});
const darkS=StyleSheet.create({c:{backgroundColor:'#000'},head:{backgroundColor:'#000'},t:{color:'#fff'},sub:{color:'#aaa'},gps:{backgroundColor:'#111'},b:{backgroundColor:'#111',borderColor:'#333'},map:{backgroundColor:'#000',borderColor:'#333'}});
