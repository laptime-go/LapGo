import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';

export default function App() {
  const [laps, setLaps] = useState([]);
  const [running, setRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [best, setBest] = useState(null);

  useEffect(() => {
    let t;
    if (running) t = setInterval(() => setTime(v => v + 50), 50);
    return () => clearInterval(t);
  }, [running]);

  const format = (ms) => {
    if (!ms) return '00:00.000';
    const s = Math.floor(ms/1000); const m = Math.floor(s/60);
    return `${String(m).padStart(2,'0')}:${String(s%60).padStart(2,'0')}.${String(ms%1000).padStart(3,'0')}`;
  };

  const toggle = () => {
    if (!running) { setTime(0); setRunning(true); }
    else {
      setRunning(false);
      if (time > 3000) {
        const lap = { id: Date.now().toString(), time };
        setLaps([lap,...laps]);
        if (!best || time < best.time) setBest(lap);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>圈速Go V2 求生版</Text>
      <Text style={styles.bigTime}>{format(time)}</Text>
      <Text style={styles.best}>最快: {best?format(best.time):'--:--.---'}</Text>

      <TouchableOpacity style={[styles.btn, running&&{backgroundColor:'#e11'}]} onPress={toggle}>
        <Text style={styles.btnText}>{running?'完成':'開始'}</Text>
      </TouchableOpacity>

      <FlatList data={laps} keyExtractor={i=>i.id}
        renderItem={({item,i})=> <Text style={styles.row}>L{laps.length-i} - {format(item.time)}</Text>}
        style={{marginTop:20}}
      />
      <Text style={styles.note}>此版已移除地圖/GPS，保證唔閃退。入到先再加廣告ID</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container:{flex:1,backgroundColor:'#000',paddingTop:60,padding:16},
  title:{color:'#fff',fontSize:22,fontWeight:'900',textAlign:'center'},
  bigTime:{color:'#fff',fontSize:48,fontWeight:'900',textAlign:'center',marginTop:20,fontVariant:['tabular-nums']},
  best:{color:'#0f8',textAlign:'center',marginTop:8},
  btn:{backgroundColor:'#fff',padding:20,borderRadius:16,alignItems:'center',marginTop:30},
  btnText:{fontWeight:'900',fontSize:18},
  row:{color:'#fff',paddingVertical:8,borderBottomWidth:1,borderColor:'#222'},
  note:{color:'#666',fontSize:11,textAlign:'center',marginTop:20}
});
