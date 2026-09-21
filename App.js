import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import MapView, { Polyline, Marker, UrlTile } from 'react-native-maps';
import * as Location from 'expo-location';

const AD_BANNER = "ca-app-pub-9890149028563226/7083933962";

const TRACKS = [
  { id:'zic', name:'珠海ZIC 4.32km 14彎', lat:22.3933, lng:113.9588 },
  { id:'gic', name:'肇慶GIC 2.82km', lat:23.1005, lng:112.5200 },
  { id:'conghua', name:'廣州從化', lat:23.5477, lng:113.5731 },
  { id:'shajing', name:'深圳沙井', lat:22.7311, lng:113.8156 },
  { id:'jingang', name:'北京金港', lat:40.1120, lng:116.5230 },
  { id:'fugang', name:'惠州福岡', lat:23.0894, lng:114.3980 },
];

const ZIC_SHAPE = [
  {latitude:22.3955, longitude:113.9580},{latitude:22.3958, longitude:113.9605},{latitude:22.3948, longitude:113.9620},{latitude:22.3930, longitude:113.9625},{latitude:22.3915, longitude:113.9615},{latitude:22.3910, longitude:113.9595},{latitude:22.3915, longitude:113.9575},{latitude:22.3928, longitude:113.9565},{latitude:22.3945, longitude:113.9568},{latitude:22.3955, longitude:113.9580},
];

export default function App() {
  const [tab, setTab] = useState('賽道');
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);
  const [laps, setLaps] = useState([]);
  const [track, setTrack] = useState(TRACKS[0]);
  const [isPro, setIsPro] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const timerRef = useRef(null);
  const startRef = useRef(0);

  useEffect(()=>{
    (async()=>{
      await Location.requestForegroundPermissionsAsync();
      setTimeout(()=>setMapReady(true), 600);
    })();
  },[]);

  const start = () => { setRunning(true); startRef.current = Date.now() - time; timerRef.current = setInterval(()=>setTime(Date.now()-startRef.current), 50); };
  const stop = () => { setRunning(false); clearInterval(timerRef.current); };
  const lap = () => { setLaps([...laps, time]); startRef.current = Date.now(); setTime(0); };
  const reset = () => { setLaps([]); setTime(0); setRunning(false); clearInterval(timerRef.current); };
  const fmt = (ms) => { const s = ms/1000; const m = Math.floor(s/60); const sec = (s%60).toFixed(2).padStart(5,'0'); return `${m}:${sec}`; };
  const best = laps.length? Math.min(...laps) : null;

  return (
    <View style={s.container}>
      <View style={s.header}><Text style={s.headerTitle}>LapGo-Timer OSM版</Text><TouchableOpacity onPress={()=>setIsPro(!isPro)} style={s.proBtn}><Text style={s.proText}>{isPro?'Pro已去廣告':'升級Pro'}</Text></TouchableOpacity></View>

      {tab==='賽道' && (
        <View style={{flex:1}}>
          <Text style={s.bigTime}>{fmt(time)}</Text>
          <Text style={s.sub}>最佳 {best?fmt(best):'--'} | {track.name}</Text>

          <View style={s.mapBox}>
            {mapReady? (
              <MapView
                key={track.id}
                style={s.map}
                initialRegion={{latitude:track.lat, longitude:track.lng, latitudeDelta:0.01, longitudeDelta:0.01}}
              >
                {/* 呢個就係唔洗Key，中港都用到嘅 OSM */}
                <UrlTile urlTemplate="https://a.tile.openstreetmap.org/{z}/{x}/{y}.png" maximumZ={19} flipY={false} tileSize={256} />
                <Polyline coordinates={ZIC_SHAPE} strokeColor="#FF0000" strokeWidth={4} />
                <Marker coordinate={{latitude:track.lat, longitude:track.lng}} />
              </MapView>
            ) : <View style={[s.map,{justifyContent:'center',alignItems:'center'}]}><Text style={{color:'#999'}}>地圖載入中...</Text></View>}
          </View>

          <View style={s.btnRow}>
            {!running? <TouchableOpacity style={s.start} onPress={start}><Text style={s.btnTxt}>開始</Text></TouchableOpacity> :
            <><TouchableOpacity style={s.lapBtn} onPress={lap}><Text style={s.btnTxt}>手動計圈</Text></TouchableOpacity><TouchableOpacity style={s.stop} onPress={stop}><Text style={s.btnTxt}>停止</Text></TouchableOpacity></>}
            <TouchableOpacity onPress={reset}><Text style={s.reset}>重設</Text></TouchableOpacity>
          </View>
          {!isPro && <View style={s.ad}><Text style={s.adTxt}>OSM地圖 - 無需Google Key | {AD_BANNER}</Text></View>}
        </View>
      )}
      {tab==='紀錄' && <ScrollView style={{flex:1, padding:15}}>{laps.map((l,i)=><View key={i} style={s.lapRow}><Text>Lap {i+1}: {fmt(l)}</Text></View>)}</ScrollView>}
      {tab==='設定' && <ScrollView style={{flex:1, padding:15}}><Text>Pro: {isPro?'已買':'未買'}</Text></ScrollView>}
      <View style={s.tabs}>{['賽道','紀錄','設定'].map(t=><TouchableOpacity key={t} onPress={()=>setTab(t)} style={[s.tab, tab===t&&s.tabOn]}><Text style={tab===t?{color:'#fff'}:{}}>{t}</Text></TouchableOpacity>)}</View>
    </View>
  );
}
const s = StyleSheet.create({
  container:{flex:1, paddingTop:35, backgroundColor:'#fff'}, header:{flexDirection:'row', justifyContent:'space-between', padding:12}, headerTitle:{fontWeight:'bold', fontSize:18}, proBtn:{borderWidth:1, borderColor:'#007AFF', padding:4, borderRadius:6}, proText:{fontSize:10, color:'#007AFF'},
  bigTime:{fontSize:72, fontWeight:'900', textAlign:'center'}, sub:{textAlign:'center', color:'#666', marginBottom:6},
  mapBox:{height:280, margin:10, borderRadius:12, overflow:'hidden', backgroundColor:'#eee'}, map:{flex:1},
  btnRow:{flexDirection:'row', justifyContent:'center', gap:15, marginTop:10}, start:{backgroundColor:'#2ecc71', padding:18, borderRadius:30, width:120, alignItems:'center'}, lapBtn:{backgroundColor:'#007AFF', padding:18, borderRadius:30, width:120, alignItems:'center'}, stop:{backgroundColor:'#e74c3c', padding:14, borderRadius:26, width:90, alignItems:'center'}, btnTxt:{color:'#fff', fontWeight:'bold'}, reset:{color:'#999', marginLeft:10},
  ad:{backgroundColor:'#f2f2f2', padding:6, alignItems:'center', marginTop:8}, adTxt:{fontSize:8, color:'#aaa'},
  lapRow:{padding:10, borderBottomWidth:1, borderColor:'#eee'}, tabs:{flexDirection:'row', height:56, borderTopWidth:1, borderColor:'#eee'}, tab:{flex:1, alignItems:'center', justifyContent:'center'}, tabOn:{backgroundColor:'#000'}
});
