import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import MapView, { Polyline, Marker, UrlTile } from 'react-native-maps';
import * as Location from 'expo-location';

const AD_BANNER = "ca-app-pub-9890149028563226/7083933962";
const PRO_ID = "pro_upgrade_38";

// 6條真賽道 - 中心點
const TRACKS = [
  { id:'zic', name:'珠海ZIC 4.32km 14彎', lat:22.3933, lng:113.9588, len:'4.32km' },
  { id:'gic', name:'肇慶GIC 2.82km', lat:23.1005, lng:112.5200, len:'2.82km' },
  { id:'conghua', name:'廣州從化', lat:23.5477, lng:113.5731, len:'1.9km' },
  { id:'shajing', name:'深圳沙井', lat:22.7311, lng:113.8156, len:'1.2km' },
  { id:'jingang', name:'北京金港', lat:40.1120, lng:116.5230, len:'2.39km' },
  { id:'fugang', name:'惠州福岡', lat:23.0894, lng:114.3980, len:'1.8km' },
];
// ZIC真實形狀簡化白線 (14彎)
const ZIC_SHAPE = [
  {latitude:22.3955, longitude:113.9580},{latitude:22.3958, longitude:113.9605},{latitude:22.3948, longitude:113.9620},{latitude:22.3930, longitude:113.9625},{latitude:22.3915, longitude:113.9615},{latitude:22.3910, longitude:113.9595},{latitude:22.3915, longitude:113.9575},{latitude:22.3928, longitude:113.9565},{latitude:22.3945, longitude:113.9568},{latitude:22.3955, longitude:113.9580},
];

export default function App() {
  const [tab, setTab] = useState('賽道');
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);
  const [laps, setLaps] = useState([]);
  const [track, setTrack] = useState(TRACKS[0]);
  const [gpsPath, setGpsPath] = useState([]);
  const [isPro, setIsPro] = useState(false);
  const timerRef = useRef(null);
  const startRef = useRef(0);

  useEffect(()=>{ (async()=>{ await Location.requestForegroundPermissionsAsync(); })(); },[]);

  const start = () => {
    setRunning(true);
    startRef.current = Date.now() - time;
    timerRef.current = setInterval(()=>setTime(Date.now()-startRef.current), 50);
  };
  const stop = () => { setRunning(false); clearInterval(timerRef.current); };
  const lap = () => {
    const newLaps = [...laps, time];
    setLaps(newLaps);
    startRef.current = Date.now();
    setTime(0);
  };
  const reset = () => { setLaps([]); setTime(0); setRunning(false); clearInterval(timerRef.current); setGpsPath([]); };
  const fmt = (ms) => {
    const s = ms/1000;
    const m = Math.floor(s/60);
    const sec = (s%60).toFixed(2).padStart(5,'0');
    return `${m}:${sec}`;
  };
  const best = laps.length? Math.min(...laps) : null;

  return (
    <View style={s.container}>
      {/* 頂 */}
      <View style={s.header}>
        <Text style={s.headerTitle}>LapGo-Timer</Text>
        <TouchableOpacity onPress={()=>setIsPro(!isPro)} style={s.proBtn}><Text style={s.proText}>{isPro?'Pro已去廣告':'升級Pro'}</Text></TouchableOpacity>
      </View>

      {tab==='賽道' && (
        <View style={{flex:1}}>
          <Text style={s.bigTime}>{fmt(time)}<Text style={{fontSize:18}}> s</Text></Text>
          <Text style={s.sub}>最佳 {best?fmt(best):'--'} | {track.name} | {isPro?'Pro':'等待開始'}</Text>

          <View style={s.mapBox}>
            <MapView style={s.map} initialRegion={{latitude:track.lat, longitude:track.lng, latitudeDelta:0.01, longitudeDelta:0.01}}>
              <UrlTile urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png" maximumZ={19} />
              <Polyline coordinates={ZIC_SHAPE} strokeColor="#FFFFFF" strokeWidth={4} />
              <Polyline coordinates={gpsPath.length?gpsPath:ZIC_SHAPE.slice(0,3)} strokeColor="#FF0000" strokeWidth={3} lineDashPattern={[5,5]} />
              <Marker coordinate={{latitude:track.lat, longitude:track.lng}} pinColor="blue" />
            </MapView>
          </View>

          <View style={s.btnRow}>
            {!running? <TouchableOpacity style={s.start} onPress={start}><Text style={s.btnTxt}>開始</Text></TouchableOpacity> :
            <>
              <TouchableOpacity style={s.lapBtn} onPress={lap}><Text style={s.btnTxt}>手動計圈</Text></TouchableOpacity>
              <TouchableOpacity style={s.stop} onPress={stop}><Text style={s.btnTxt}>停止</Text></TouchableOpacity>
            </>}
            <TouchableOpacity onPress={reset}><Text style={s.reset}>重設</Text></TouchableOpacity>
          </View>

          {!isPro && <View style={s.ad}><Text style={s.adTxt}>AD {AD_BANNER} | Free版廣告</Text></View>}
        </View>
      )}

      {tab==='紀錄' && (
        <ScrollView style={{flex:1, padding:15}}>
          <View style={s.bestCard}><Text style={s.bestTitle}>最佳單圈</Text><Text style={s.bestTime}>{best?fmt(best):'1:23.203'}</Text><Text>{track.name} · 2024-11-20</Text></View>
          {laps.map((l,i)=><View key={i} style={s.lapRow}><Text>Lap {i+1}: {fmt(l)} {l===best?'⭐最快':''}</Text><Text style={{color:'#999'}}>{new Date().toLocaleTimeString()}</Text></View>)}
          {laps.length===0 && <Text style={{marginTop:10, color:'#999'}}>第12圈 1:23.203 最快有金標... 暫無紀錄，開始跑圈後顯示</Text>}
        </ScrollView>
      )}

      {tab==='設定' && (
        <ScrollView style={{flex:1, padding:15}}>
          <Text style={s.sec}>賽道管理</Text>
          {TRACKS.map(t=><TouchableOpacity key={t.id} onPress={()=>setTrack(t)} style={[s.item, track.id===t.id&&{backgroundColor:'#e3f2fd'}]}><Text>{t.name} {track.id===t.id?'●':''}</Text><Text style={s.small}>{t.len}</Text></TouchableOpacity>)}
          <Text style={s.sec}>計時設定</Text>
          <Text style={s.item}>起點校準 ±5m</Text><Text style={s.item}>自動開始 10/20km/h</Text><Text style={s.item}>GPS精度 高</Text><Text style={s.item}>背景運行 熄屏都計</Text>
          <Text style={s.sec}>顯示與Pro</Text>
          <Text style={s.item}>單位 公里</Text><Text style={s.item}>Pro狀態: {isPro?'已購買 $38 終身':'未購買'}</Text>
          <TouchableOpacity style={s.buy} onPress={()=>setIsPro(true)}><Text style={s.btnTxt}>升級Pro $38 - {PRO_ID}</Text></TouchableOpacity>
          <Text style={s.item}>恢復購買</Text><Text style={s.item}>版本 1.0.0(20)</Text>
          <Text style={s.small}>Package: com.lapgo.timer | {AD_BANNER}</Text>
        </ScrollView>
      )}

      <View style={s.tabs}>
        {['賽道','紀錄','設定'].map(t=><TouchableOpacity key={t} onPress={()=>setTab(t)} style={[s.tab, tab===t&&s.tabOn]}><Text style={tab===t?{color:'#fff'}:{}}>{t}</Text></TouchableOpacity>)}
      </View>
    </View>
  );
}
const s = StyleSheet.create({
  container:{flex:1, paddingTop:35, backgroundColor:'#fff'},
  header:{flexDirection:'row', justifyContent:'space-between', padding:12, alignItems:'center'},
  headerTitle:{fontWeight:'bold', fontSize:18}, proBtn:{borderWidth:1, borderColor:'#007AFF', padding:4, borderRadius:6}, proText:{fontSize:10, color:'#007AFF'},
  bigTime:{fontSize:86, fontWeight:'900', textAlign:'center', marginTop:5, letterSpacing:-2}, sub:{textAlign:'center', color:'#666', marginBottom:6},
  mapBox:{height:260, margin:10, borderRadius:12, overflow:'hidden', backgroundColor:'#eee'}, map:{flex:1},
  btnRow:{flexDirection:'row', justifyContent:'center', alignItems:'center', gap:15, marginTop:10},
  start:{backgroundColor:'#2ecc71', padding:18, borderRadius:30, width:120, alignItems:'center'}, lapBtn:{backgroundColor:'#007AFF', padding:18, borderRadius:30, width:120, alignItems:'center'}, stop:{backgroundColor:'#e74c3c', padding:14, borderRadius:26, width:90, alignItems:'center'}, btnTxt:{color:'#fff', fontWeight:'bold'}, reset:{color:'#999', marginLeft:10},
  ad:{backgroundColor:'#f2f2f2', padding:6, alignItems:'center', marginTop:8}, adTxt:{fontSize:8, color:'#aaa'},
  bestCard:{backgroundColor:'#fffbe6', padding:15, borderRadius:12, borderWidth:1, borderColor:'#ffe58f'}, bestTitle:{fontSize:12}, bestTime:{fontSize:32, fontWeight:'bold'},
  lapRow:{flexDirection:'row', justifyContent:'space-between', padding:10, borderBottomWidth:1, borderColor:'#eee'},
  sec:{marginTop:18, fontWeight:'bold', backgroundColor:'#f5f5f5', padding:6}, item:{padding:12, borderBottomWidth:1, borderColor:'#eee'}, small:{fontSize:10, color:'#999'},
  buy:{backgroundColor:'#000', padding:14, borderRadius:10, marginTop:12, alignItems:'center'},
  tabs:{flexDirection:'row', height:56, borderTopWidth:1, borderColor:'#eee'}, tab:{flex:1, alignItems:'center', justifyContent:'center'}, tabOn:{backgroundColor:'#000'}
});