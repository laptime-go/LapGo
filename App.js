import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert, Modal, Share, StatusBar } from 'react-native';
import * as Location from 'expo-location';

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
  const [laps, setLaps] = useState([]);
  const [running, setRunning] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [bestLap, setBestLap] = useState(null);
  const timerRef = useRef(null);
  const startRef = useRef(0);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status!== 'granted') Alert.alert('提示', '需要定位權限先可以自動計圈');
    })();
  }, []);

  const formatTime = (ms) => {
    if (ms <= 0) return '--:--.---';
    const m = Math.floor(ms
