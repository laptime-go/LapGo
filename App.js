import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import MapView, { Marker, Polyline, UrlTile } from 'react-native-maps';
import * as Location from 'expo-location';
import { BannerAd, BannerAdSize, TestIds, MobileAds } from 'react-native-google-mobile-ads';

const AD_BANNER = __DEV__? TestIds.BANNER : 'ca-app-pub-9890149028563226/7083933962';

const TRACKS = [
  { id: 'zic', name: '珠海 ZIC', lat: 22.335, lng: 113.55, radius: 15 },
  { id: 'gic', name: '肇慶 GIC', lat: 23.12, lng: 112.35, radius: 15 },
  { id: 'cong', name: '從化賽道', lat: 23.55, lng: 113.58, radius: 15 },
  { id: 'saj', name: '沙井賽道', lat: 22.72, lng: 113.80, radius: 15 },
  { id: 'jink', name: '北京金港', lat: 40.12, lng: 116.35, radius: 15 },
  { id: 'fug', name: '福岡賽道', lat: 22.58, lng: 113.92, radius: 15 },
];

export default function App() {
  const [track, setTrack] = useState(TRACKS[0]);
  const [isPro, setIsPro] = useState(false);
  const [laps, setLaps] = useState([]);
  const [running, setRunning] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const locationSub = useRef(null);

  useEffect(() => {
    MobileAds().initialize();
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status!== 'granted') Alert.alert('需要定位權限先計到圈速');
    })();
  }, []);

  const toggleRun = () => {
    if(!running){
      const start = Date.now();
      setRunning(true);
      const id = setInterval(()=> setCurrentTime(Date.now() - start), 100);
      locationSub.current = id;
    } else {
      clearInterval(locationSub.current);
      setRunning(false);
      if(laps.length < 5 || isPro){
        setLaps(prev => [{ id: Date.now().toString(), time: currentTime },...prev]);
      } else {
        Alert.alert('升級 Pro 解鎖無限圈數 + 去廣告','Pro $48 一次性買斷');
      }
      setCurrentTime(0);
    }
  }

  return (
    <View style={styles.container}>
      <MapView style={styles.map}
        initialRegion={{ latitude: track.lat, longitude: track.lng, latitudeDelta: 0.02, longitudeDelta: 0.02 }}>
        <UrlTile urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png" maximumZ={19} />
        <Marker coordinate={{ latitude: track.lat, longitude: track.lng }} title={track.name} />
      </MapView>

      <View style={styles.panel}>
        <Text style={styles.title}>圈速Go - {track.name}</Text>
        <Text style={styles.timer}>{(currentTime/1000).toFixed(2)}s</Text>
        <TouchableOpacity style={[styles.btn, running && styles.btnStop]} onPress={toggleRun}>
          <Text style={styles.btnText}>{running? '完成此圈' : '開始計時'}</Text>
        </TouchableOpacity>

        <FlatList data={laps} keyExtractor={i=>i.id}
          renderItem={({item,index})=> <Text style={styles.lap}>第 {laps.length-index} 圈 - {(item.time/1000).toFixed(2)}s</Text>} />

        {!isPro && (
          <TouchableOpacity style={styles.proBtn} onPress={()=> setIsPro(true)}>
            <Text style={styles.proText}>升級 Pro $48 去廣告 + 無限圈數</Text>
          </TouchableOpacity>
        )}
      </View>

      {!isPro && (
        <BannerAd unitId={AD_BANNER} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} requestOptions={{}} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  panel: { height: 320, backgroundColor: '#fff', padding: 12 },
  title: { fontSize: 18, fontWeight: 'bold' },
  timer: { fontSize: 42, fontWeight: 'bold', textAlign: 'center', marginVertical: 10 },
  btn: { backgroundColor: '#000', padding: 14, borderRadius: 10, alignItems: 'center' },
  btnStop: { backgroundColor: '#d00' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  lap: { fontSize: 14, paddingVertical: 4 },
  proBtn: { marginTop: 10, backgroundColor: '#ffcc00', padding: 10, borderRadius: 8, alignItems: 'center' },
  proText: { fontWeight: 'bold' }
});
