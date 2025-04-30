import { loadFromLocalStorage } from '../localStorageUtils.js';

// 1. localStorage에서 데이터 불러오기
let storedData = loadFromLocalStorage('travelSchedule');
console.log("Loaded Data:", storedData);
console.log("typeof storedData:", typeof storedData);

if (typeof storedData === 'string') {
  // 마크다운 코드블록 제거
  storedData = storedData.replace(/```json|```/g, '').trim();
  storedData = JSON.parse(storedData);
}

if (storedData && storedData.Item && Array.isArray(storedData.Item)) {
  storedData = storedData.Item;
} else {
  console.error("Stored data is not an array");
  storedData = [];
}
console.log("Stored Data:", storedData);

// 4. 카카오맵에 첫 번째 날의 장소들에 핀 추가
function addMarkersToMap(map, places) {
  const ps = new kakao.maps.services.Places();
  const bounds = new kakao.maps.LatLngBounds();
  let completed = 0;

  places.forEach(placeName => {
    ps.keywordSearch(placeName, (data, status, pagination) => {
      if (status === kakao.maps.services.Status.OK) {
        const place = data[0];
        const markerPosition = new kakao.maps.LatLng(place.y, place.x);
        const marker = new kakao.maps.Marker({
          position: markerPosition
        });
        marker.setMap(map);

        // bounds에 좌표 추가
        bounds.extend(markerPosition);

        // data.json에서 정보 찾기
        const info = placeInfoList.find(item => item.placeName === placeName);

        // 인포윈도우 내용 만들기
        let infoContent = '';
        if (info) {
          infoContent = `
            <div style="padding:10px;min-width:200px;">
              <b>${info.placeName}</b><br>
              ${info.description}<br>
              <small>${info.address}</small>
            </div>
          `;
        } else {
          infoContent = `<div style="padding:10px;">${placeName}</div>`;
        }
        const infowindow = new kakao.maps.InfoWindow({ content: infoContent });

        // 마우스 오버/아웃 이벤트 등록
        kakao.maps.event.addListener(marker, 'mouseover', function() {
          infowindow.open(map, marker);
        });
        kakao.maps.event.addListener(marker, 'mouseout', function() {
          infowindow.close();
        });
      }
      completed++;
      if (completed === places.length) {
        map.setBounds(bounds);
      }
    });
  });
}

// 날짜별로 핀을 찍는 함수
function showDayMarkers(dayIndex) {
  if (storedData.length > dayIndex) {
    const dayPlaces = storedData[dayIndex].Places;
    addMarkersToMap(map, dayPlaces);
  } else {
    console.error("해당 날짜의 데이터가 없습니다.");
  }
}

// 아래 한 줄로 날짜 인덱스를 바꿔가며 확인할 수 있습니다.
const dayIndex = 1; // 0: 첫째 날, 1: 둘째 날, 2: 셋째 날 ...
showDayMarkers(dayIndex);

console.log("Final Grouped Data for Kakao Map:", storedData);

// 예시: data.json을 fetch로 불러오기 (비동기)
let placeInfoList = [];
fetch('/AI/src/data.json')
  .then(res => res.json())
  .then(data => {
    placeInfoList = data.items;
  });

