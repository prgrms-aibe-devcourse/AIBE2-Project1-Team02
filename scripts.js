window.onload = function () {
	kakao.maps.load(function () {
		var container = document.getElementById('map');
		var mapOption = { 
			center: new kakao.maps.LatLng(37.5563, 126.9237), // 홍대입구역 좌표
			level: 3
		};

		var map = new kakao.maps.Map(container, mapOption);

		// 장소 검색 객체를 생성합니다
		var ps = new kakao.maps.services.Places();

		// 검색 결과 목록이나 마커를 클릭했을 때 장소명을 표출할 인포윈도우를 생성합니다
		var infowindow = new kakao.maps.InfoWindow({zIndex:1});

		var startMarker, endMarker, line;
		var markers = [];

		// 주소 데이터를 배열로 관리
		var addressData = [
			{ name: "홍대입구역", query: "홍대입구역", url: "https://i.postimg.cc/vmrw1k8J/IMG-3471.jpg" },
			{ name: "서울역", query: "서울역", url: "https://example.com/image2.jpg" },
			// 추가적인 테스트 데이터
		];

		// 검색창을 통해 입력된 키워드로 주소를 검색하고 지도에 핀을 표시
		document.getElementById('addDestination').addEventListener('click', function() {
			var keyword = document.getElementById('destinationSearchBox').value;
			
			// 입력된 키워드를 객체로 만들어 배열에 추가, 웹 URL 포함
			var newAddress = { 
				name: keyword, 
				query: keyword,
				url: `https://example.com/${encodeURIComponent(keyword)}`
			};
			
			// 배열에 새로운 주소 데이터 추가
			addressData.push(newAddress);

			ps.keywordSearch(newAddress.query, function(data, status) {
				if (status === kakao.maps.services.Status.OK) {
					var position = new kakao.maps.LatLng(data[0].y, data[0].x);
					var marker = new kakao.maps.Marker({
						map: map,
						position: position,
						title: newAddress.name
					});
					markers.push(marker);

					// 배열에서 이미지 URL 가져오기
					var imageUrl = addressData.find(addr => addr.name === newAddress.name).url;

					var content = `<div style="padding:5px;">
								 <img src="${imageUrl}" alt="${newAddress.name}" style="width:100px;"/>
								 <p>${newAddress.name}</p>
							   </div>`;
					var infowindow = new kakao.maps.InfoWindow({
						content: content
					});

					kakao.maps.event.addListener(marker, 'mouseover', function () {
						infowindow.open(map, marker);
					});

					kakao.maps.event.addListener(marker, 'mouseout', function () {
						infowindow.close();
					});

					var listItem = document.createElement('li');
					listItem.textContent = newAddress.name;
					document.getElementById('destinationList').appendChild(listItem);

					listItem.addEventListener('click', function() {
						listItem.remove();
						marker.setMap(null);
						markers = markers.filter(m => m !== marker);
					});
				} else {
					alert("주소를 찾을 수 없습니다.");
				}
			});
		});

		document.getElementById('findRoute').addEventListener('click', function() {
			if (markers.length < 2) return;

			var linePath = markers.map(marker => marker.getPosition());
			var polyline = new kakao.maps.Polyline({
				path: linePath,
				strokeWeight: 5,
				strokeColor: '#FF0000',
				strokeOpacity: 0.7,
				strokeStyle: 'solid'
			});
			polyline.setMap(map);

			// 거리 계산
			var totalDistance = 0;
			for (var i = 0; i < linePath.length - 1; i++) {
				totalDistance += kakao.maps.geometry.spherical.computeDistanceBetween(linePath[i], linePath[i + 1]);
			}
			document.getElementById('totalDistance').innerText = (totalDistance / 1000).toFixed(2) + ' km';
		});

		function updateInfo() {
			if (startMarker) {
				var startPos = startMarker.getPosition();
				document.getElementById('startCoords').innerText = startPos.getLat() + ', ' + startPos.getLng();
			}
			if (endMarker) {
				var endPos = endMarker.getPosition();
				document.getElementById('endCoords').innerText = endPos.getLat() + ', ' + endPos.getLng();
			}
			if (startMarker && endMarker) {
				var distance = kakao.maps.geometry.spherical.computeDistanceBetween(startMarker.getPosition(), endMarker.getPosition());
				document.getElementById('distance').innerText = (distance / 1000).toFixed(2) + ' km';
			}
		}

		function drawLine() {
			if (startMarker && endMarker) {
				if (line) line.setMap(null);
				var linePath = [
					startMarker.getPosition(),
					endMarker.getPosition()
				];
				line = new kakao.maps.Polyline({
					path: linePath,
					strokeWeight: 5,
					strokeColor: '#FF0000',
					strokeOpacity: 0.7,
					strokeStyle: 'solid'
				});
				line.setMap(map);
				updateInfo();
			}
		}

		function updateRoute() {
			const start = document.getElementById('startSearchBox').value;
			const end = document.getElementById('destinationSearchBox').value;
			const iframe = document.getElementById('kakao-route');
			const url = `https://map.kakao.com/?sName=${encodeURIComponent(start)}&eName=${encodeURIComponent(end)}`;
			iframe.src = url;
		}

		// 지도에 클릭 이벤트를 등록합니다
		// kakao.maps.event.addListener(map, 'click', function(mouseEvent) {
		//     // 클릭한 위치의 좌표입니다
		//     var latlng = mouseEvent.latLng;

		//     // 커스텀 오버레이에 표시할 내용입니다
		//     var content = '<div style="padding:5px;">' +
		//                   '<img src="https://via.placeholder.com/150" alt="클릭 이미지" style="width:100%;"/>' +
		//                   '</div>';

		//     // 커스텀 오버레이를 생성합니다
		//     var overlay = new kakao.maps.CustomOverlay({
		//         content: content,
		//         map: map,
		//         position: latlng
		//     });

		//     // 클릭한 위치에 커스텀 오버레이를 표시합니다
		//     overlay.setMap(map);
		// });
	});
}; 