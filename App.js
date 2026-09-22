import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);
  const timerRef = useRef(null);

  const start = () => {
    if (running) return;
    setRunning(true);
    timerRef.current = setInterval(() => setTime(t => t + 0.01), 10);
  };
  const stop = () => {
    setRunning(false);
    clearInterval(timerRef.current);
  };
  const reset = () => {
    stop();
    setTime(0);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <Text style={styles.title}>圈速Go - 求生版</Text>
      <Text style={styles.time}>{time.toFixed(2)}s</Text>
      <View style={styles.row}>
        <TouchableOpacity style={styles.btn} onPress={start}><Text style={styles.btnText}>開始</Text></TouchableOpacity>
        <TouchableOpacity style={styles.btn} onPress={stop}><Text style={styles.btnText}>停止</Text></TouchableOpacity>
        <TouchableOpacity style={styles.btn} onPress={reset}><Text style={styles.btnText}>重設</Text></TouchableOpacity>
      </View>
      <Text style={{marginTop:20, color:'#888'}}>呢個版一定入到，唔會閃退</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'#000' },
  title: { color:'#fff', fontSize:24, marginBottom:20, fontWeight:'bold' },
  time: { color:'#00ff00', fontSize:60, fontFamily:'monospace', marginBottom:30 },
  row: { flexDirection:'row', gap:10 },
  btn: { backgroundColor:'#333', padding:15, paddingHorizontal:25, borderRadius:10, margin:5 },
  btnText: { color:'#fff', fontSize:18 }
});
