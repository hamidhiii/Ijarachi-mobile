import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { Colors } from '../constants/Colors';

// Получите бесплатный ключ на https://developer.tech.yandex.ru
// Без ключа карты работают в демо-режиме с баннером
const YANDEX_API_KEY = 'bb929b7d-820a-49e4-a1fa-520953f02b37';

const MAP_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
  <style>
    * { margin:0; padding:0; box-sizing:border-box; -webkit-tap-highlight-color:transparent; }
    html, body, #map { width:100%; height:100%; overflow:hidden; }
    #search-wrap {
      position:absolute; top:12px; left:12px; right:12px; z-index:200;
      display:flex; gap:8px; align-items:center;
    }
    #search {
      flex:1; background:white; border-radius:14px; padding:12px 14px;
      font-size:14px; border:none; outline:none;
      box-shadow:0 2px 12px rgba(0,0,0,0.18);
    }
    #search-btn {
      background:#1A7A4A; border:none; border-radius:12px;
      width:42px; height:42px; display:flex; align-items:center; justify-content:center;
      box-shadow:0 2px 8px rgba(0,0,0,0.18);
    }
    #pin {
      position:absolute; top:50%; left:50%;
      transform: translate(-50%, -100%);
      z-index:100; pointer-events:none;
      font-size:36px; line-height:1;
    }
    #address-banner {
      position:absolute; bottom:80px; left:14px; right:14px; z-index:200;
      background:white; border-radius:16px; padding:14px 16px;
      box-shadow:0 2px 16px rgba(0,0,0,0.15);
    }
    #address-label { font-size:11px; color:#64748B; margin-bottom:3px; font-weight:600; letter-spacing:0.4px; text-transform:uppercase; }
    #address-text { font-size:14px; color:#1E293B; font-weight:700; line-height:1.4; }
    #confirm-btn {
      position:absolute; bottom:16px; left:14px; right:14px; z-index:200;
      background:#1A7A4A; color:white; border:none; padding:16px;
      border-radius:16px; font-size:16px; font-weight:700;
      box-shadow:0 4px 16px rgba(26,122,74,0.35);
    }
    .ymap-copyright { display:none !important; }
  </style>
</head>
<body>
  <div id="search-wrap">
    <input id="search" type="text" placeholder="Поиск адреса..." />
    <button id="search-btn" onclick="doSearch()">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
    </button>
  </div>
  <div id="map"></div>
  <div id="pin">📍</div>
  <div id="address-banner">
    <div id="address-label">Адрес доставки</div>
    <div id="address-text">Перемещайте карту для выбора точки</div>
  </div>
  <button id="confirm-btn" onclick="confirmAddr()">Подтвердить адрес</button>

  <script src="https://api-maps.yandex.ru/2.1/?lang=ru_RU&apikey=${YANDEX_API_KEY}"></script>
  <script>
    var map, currentAddress = '', currentCoords = null, geocodeTimer;

    ymaps.ready(function() {
      map = new ymaps.Map('map', {
        center: [41.2995, 69.2401],
        zoom: 13,
        controls: ['zoomControl']
      }, { suppressMapOpenBlock: true });

      // Сразу фиксируем координаты центра — кнопка работает даже до геокодирования
      currentCoords = map.getCenter();

      function updateAddress(coords) {
        currentCoords = coords;
        clearTimeout(geocodeTimer);
        geocodeTimer = setTimeout(function() {
          ymaps.geocode(coords, { results: 1 }).then(function(res) {
            var obj = res.geoObjects.get(0);
            currentAddress = obj ? obj.getAddressLine() : coords[0].toFixed(5) + ', ' + coords[1].toFixed(5);
            document.getElementById('address-text').textContent = currentAddress;
          });
        }, 400);
      }

      updateAddress(map.getCenter());

      map.events.add('actionend', function() {
        updateAddress(map.getCenter());
      });

      document.getElementById('search').addEventListener('keydown', function(e) {
        if (e.keyCode === 13) doSearch();
      });
    });

    function doSearch() {
      var q = document.getElementById('search').value.trim();
      if (!q) return;
      ymaps.geocode(q, { results: 1 }).then(function(res) {
        var obj = res.geoObjects.get(0);
        if (obj) {
          map.setCenter(obj.geometry.getCoordinates(), 15, { duration: 300 });
        }
      });
    }

    function confirmAddr() {
      var coords = currentCoords || map.getCenter();
      var addr = currentAddress || (coords[0].toFixed(5) + ', ' + coords[1].toFixed(5));
      window.ReactNativeWebView.postMessage(JSON.stringify({
        address: addr,
        lat: coords[0],
        lng: coords[1]
      }));
    }
  </script>
</body>
</html>
`;

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelect: (address: string, coords: { lat: number; lng: number }) => void;
  initialAddress?: string;
}

export default function YandexMapPicker({ visible, onClose, onSelect, initialAddress }: Props) {
  const insets = useSafeAreaInsets();
  const webViewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      onSelect(data.address, { lat: data.lat, lng: data.lng });
      onClose();
    } catch {}
  };

  return (
    <Modal visible={visible} animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="close" size={26} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Адрес доставки</Text>
          <View style={{ width: 26 }} />
        </View>

        <View style={styles.mapWrap}>
          {loading && (
            <View style={styles.loader}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loaderText}>Загрузка карты...</Text>
            </View>
          )}
          <WebView
            ref={webViewRef}
            source={{ html: MAP_HTML }}
            style={styles.webview}
            onMessage={handleMessage}
            onLoadEnd={() => setLoading(false)}
            javaScriptEnabled
            domStorageEnabled
            geolocationEnabled
            mixedContentMode="compatibility"
            originWhitelist={['*']}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.text },
  mapWrap: { flex: 1, position: 'relative' },
  webview: { flex: 1 },
  loader: {
    ...StyleSheet.absoluteFillObject, zIndex: 10,
    backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', gap: 12,
  },
  loaderText: { fontSize: 14, color: '#64748B' },
});
