import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert, Modal, Switch, Share, StatusBar } from 'react-native';
import MapView, { Marker, UrlTile } from 'react-native-maps';
import * as Location from 'expo-location';
import { BannerAd, BannerAdSize, TestIds, MobileAds } from 'react-native-google-mobile-ads';

const AD_BANNER_ID = __DEV__? TestIds.BANNER : 'ca-app-pub-9890149028563226/7083933962';

const TRACKS = [
  { id: 'zic', name: '珠海國際賽道', city: '珠海', lat: 22.378, lng: 113.572, length: '4.3公里' },
  { id: 'gic', name: '廣東國際賽道', city: '肇慶', lat: 23.12, lng: 112.35, length: '2.8公里' },
  { id: 'cong', name: '從化國際賽道', city: '廣州', lat: 23.55, lng: 113.58, length: '1.9公里' },
  { id: 'saj', name: '沙井極速賽道', city: '深圳', lat: 22.72, lng: 113.8, length: '1.2公里' },
  { id: 'jink', name: '金港賽道', city: '北京', lat: 40.12, lng: 116.35, length: '2.4公里' },
  { id: 'fuyong', name: '福永賽道', city: '深圳', lat: 22.67, lng: 113.8, length: '1.1公里' },
];

export default function App() {
  const [track, setTrack] = useState(TRACKS[0]);
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [showSettingModal, setShowSettingModal] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [autoLap, setAutoLap] = useState(true);
  const [vibrate, setVibrate] = useState(true);
  const [laps, setLaps] = useState([]);
  const [running, setRunning] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [bestLap, setBestLap] = useState(null);
  const timerRef = useRef(null);
  const startRef = useRef(0);

  useEffect(() => {
    try { MobileAds().initialize(); } catch(e) {}
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status!== 'granted') Alert.alert('提示', '需要定位權限先可以自動計圈');
    })();
  }, []);

  const formatTime = (ms) => {
    if (ms <= 0) return '--:--.---';
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    const msStr = Math.floor(ms % 1000).toString().padStart(3, '0');
    return `${m > 0? m + ':' : ''}${s.toString().padStart(2, '0')}.${msStr}`;
  };

  const toggleRun = () => {
    if (!running) {
      startRef.current = Date.now() - currentTime;
      setRunning(true);
      timerRef.current = setInterval(() => setCurrentTime(Date.now() - startRef.current), 50);
    } else {
      clearInterval(timerRef.current);
      setRunning(false);
      if (currentTime < 5000) { Alert.alert('提示', '單圈少於5秒，已忽略'); return; }
      if (laps.length >= 5 &&!isPro) {
        Alert.alert('圈數已滿', '免費版最多5圈，升級專業版 $28 無限記錄 + 移除廣告', [{ text: '稍後' }, { text: '立即升級 $28', onPress: () => setIsPro(true) }]);
        return;
      }
      const newLap = { id: Date.now().toString(), time: currentTime, timestamp: new Date().toLocaleTimeString() };
      const newLaps = [newLap,...laps];
      setLaps(newLaps);
      if (!bestLap || newLap.time < bestLap.time) setBestLap(newLap);
      setCurrentTime(0);
    }
  };

  const clearLaps = () => Alert.alert('清空記錄', '確定清空所有圈速？', [{ text: '取消' }, { text: '清空', style: 'destructive', onPress: () => { setLaps([]); setBestLap(null); setCurrentTime(0); } }]);
  const shareLaps = async () => {
    if (laps.length === 0) return;
    const text = `【圈速Go - ${track.name}】\n最快: ${formatTime(bestLap?.time)}\n${laps.map((l, i) => `第${laps.length - i}圈: ${formatTime(l.time)}`).join('\n')}`;
    Share.share({ message: text });
  };
  const avgTime = laps.length > 0? laps.reduce((a, b) => a + b.time, 0) / laps.length : 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <MapView provider={null} style={styles.map} initialRegion={{ latitude: track.lat, longitude: track.lng, latitudeDelta: 0.015, longitudeDelta: 0.015 }} showsUserLocation={true}>
        <UrlTile urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png" maximumZ={19} shouldReplaceMapContent={false} />
        <Marker coordinate={{ latitude: track.lat, longitude: track.lng }} title={track.name} />
      </MapView>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.trackBtn} onPress={() => setShowTrackModal(true)}><Text style={styles.trackBtnText}>📍 {track.name} ⌵</Text></TouchableOpacity>
        <TouchableOpacity style={styles.settingBtn} onPress={() => setShowSettingModal(true)}><Text style={styles.settingBtnText}>⚙️ 設定</Text></TouchableOpacity>
      </View>
      <View style={styles.panel}>
        <View style={styles.statsRow}>
          <View style={styles.statBox}><Text style={styles.statLabel}>最快圈</Text><Text style={styles.statValue}>{formatTime(bestLap?.time)}</Text></View>
          <View style={styles.statBox}><Text style={styles.statLabel}>平均圈</Text><Text style={styles.statValue}>{formatTime(avgTime)}</Text></View>
          <View style={styles.statBox}><Text style={styles.statLabel}>總圈數</Text><Text style={styles.statValue}>{laps.length} 圈</Text></View>
        </View>
        <Text style={styles.timer}>{formatTime(currentTime)}<Text style={styles.timerUnit}> 秒</Text></Text>
        <View style={styles.mainBtnRow}>
          <TouchableOpacity style={styles.secondaryBtn} onPress={clearLaps}><Text style={styles.secondaryBtnText}>清空</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.primaryBtn, running && styles.primaryBtnStop]} onPress={toggleRun}><Text style={styles.primaryBtnText}>{running? '完成此圈' : '開始計時'}</Text></TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} onPress={shareLaps}><Text style={styles.secondaryBtnText}>分享</Text></TouchableOpacity>
        </View>
        <FlatList data={laps} keyExtractor={i => i.id} ListEmptyComponent={<Text style={styles.emptyText}>暫無記錄</Text>}
          renderItem={({ item, index }) => <View style={[styles.lapRow, bestLap && item.id === bestLap.id && styles.lapRowBest]}><Text style={styles.lapIndex}>第 {laps.length - index} 圈</Text><Text style={styles.lapTime}>{formatTime(item.time)}</Text></View>} />
      </View>
      {!isPro && <View style={styles.adContainer}><BannerAd unitId={AD_BANNER_ID} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} /></View>}
      <Modal visible={showTrackModal} transparent animationType="slide"><View style={styles.modalBg}><View style={styles.modalBox}><Text style={styles.modalTitle}>選擇賽道</Text>{TRACKS.map(t => (<TouchableOpacity key={t.id} style={[styles.modalItem, track.id === t.id && styles.modalItemActive]} onPress={() => { setTrack(t); setShowTrackModal(false); }}><Text style={styles.modalItemName}>{t.name}</Text><Text style={styles.modalItemCity}>{t.city}</Text></TouchableOpacity>))}<TouchableOpacity style={styles.modalClose} onPress={() => setShowTrackModal(false)}><Text style={styles.modalCloseText}>關閉</Text></TouchableOpacity></View></View></Modal>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' }, map: { flex: 1 },
  topBar: { position: 'absolute', top: 50, left: 12, right: 12, flexDirection: 'row', justifyContent: 'space-between' },
  trackBtn: { backgroundColor: '#fff', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, elevation: 4 }, trackBtnText: { fontWeight: 'bold' },
  settingBtn: { backgroundColor: '#111', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20 }, settingBtnText: { color: '#fff' },
  panel: { height: 480, backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 16 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' }, statBox: { backgroundColor: '#f2f2f2', flex: 1, margin: 4, padding: 8, borderRadius: 10, alignItems: 'center' }, statLabel: { fontSize: 11, color: '#888' }, statValue: { fontSize: 13, fontWeight: 'bold' },
  timer: { fontSize: 52, fontWeight: '800', textAlign: 'center', marginVertical: 8 }, timerUnit: { fontSize: 20 },
  mainBtnRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 10 }, primaryBtn: { flex: 1, backgroundColor: '#000', marginHorizontal: 10, paddingVertical: 16, borderRadius: 14, alignItems: 'center' }, primaryBtnStop: { backgroundColor: '#e11' }, primaryBtnText: { color: '#fff', fontWeight: 'bold' }, secondaryBtn: { backgroundColor: '#eee', padding: 14, borderRadius: 12 }, secondaryBtnText: { fontWeight: 'bold' },
  lapRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderColor: '#f0f0f0' }, lapRowBest: { backgroundColor: '#fff9db' }, lapIndex: { flex: 1 }, lapTime: { fontWeight: 'bold' }, emptyText: { textAlign: 'center', color: '#aaa', marginTop: 20 },
  adContainer: { backgroundColor: '#fff', alignItems: 'center' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }, modalBox: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 }, modalTitle: { fontSize: 18, fontWeight: 'bold' }, modalItem: { paddingVertical: 14, borderBottomWidth: 1, borderColor: '#eee', flexDirection: 'row', justifyContent: 'space-between' }, modalItemActive: { backgroundColor: '#f6f6f6' }, modalItemName: { fontWeight: 'bold' }, modalItemCity: { color: '#888' }, modalClose: { marginTop: 14, backgroundColor: '#000', padding: 14, borderRadius: 12, alignItems: 'center' }, modalCloseText: { color: '#fff' }
});
