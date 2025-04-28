const places = {
    "items": [
        {
            "id": 1,
            "placeName": "서울타워",
            "category": 1,
            "address": "서울특별시 용산구 남산공원길 105",
            "description": "서울의 랜드마크인 남산서울타워는 아름다운 경치를 자랑하는 명소로, 다양한 문화 행사와 전시가 열리는 곳입니다.",
            "operationHours": "매일 10:00 - 22:00",
            "contact": "+82 2-3455-9277",
            "reviews": [
                {
                    "rating": 5,
                    "comment": "정말 멋진 경치를 감상할 수 있어요! 꼭 가봐야 할 곳입니다.",
                    "author": "김민수",
                    "date": "2025-04-28"
                },
                {
                    "rating": 4,
                    "comment": "저녁에 가면 야경이 정말 아름다워요. 다만, 사람이 많아서 조금 불편했어요.",
                    "author": "이소영",
                    "date": "2025-04-20"
                }
            ],
            "likes": 1200,
            "images": [
                "https://storage.googleapis.com/my-bucket/seoul_tower_1.jpg",
                "https://storage.googleapis.com/my-bucket/seoul_tower_2.jpg",
                "https://storage.googleapis.com/my-bucket/seoul_tower_3.jpg"
            ]
        },
        {
            "id": 2,
            "placeName": "카페 별빛",
            "category": 3,
            "address": "서울특별시 강남구 논현로 123",
            "description": "카페 별빛은 따뜻하고 아늑한 분위기의 카페로, 다양한 커피와 디저트를 제공합니다. 특히 별빛처럼 반짝이는 조명이 특징입니다.",
            "operationHours": "매일 08:00 - 22:00",
            "contact": "+82 2-555-1234",
            "reviews": [
                {
                    "rating": 5,
                    "comment": "분위기 최고! 커피도 맛있고, 디저트도 훌륭해요. 주말에 가기 좋아요.",
                    "author": "박지연",
                    "date": "2025-04-25"
                },
                {
                    "rating": 3,
                    "comment": "커피 맛은 괜찮았는데, 테이블이 좁아서 불편했어요. 사람이 많아서 소란스러웠어요.",
                    "author": "최현우",
                    "date": "2025-04-18"
                }
            ],
            "likes": 800,
            "images": [
                "https://storage.googleapis.com/my-bucket/cafe_star_1.jpg",
                "https://storage.googleapis.com/my-bucket/cafe_star_2.jpg",
                "https://storage.googleapis.com/my-bucket/cafe_star_3.jpg"
            ]
        }
    ]
};

document.querySelectorAll('.tab').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tabContent').forEach(c => c.style.display = 'none');
        const target = document.getElementById(btn.dataset.tab);
        target.style.display = 'block';
    });
});

let startDt = new Date('2025-04-26');
let endDt = new Date('2025-04-30');

getScheduleItem(startDt, endDt);
function getScheduleItem(startDt, endDt) {
    const diffMs = endDt.getTime() - startDt.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    let scheduleItems = document.querySelector('#scheduleItems');
    let placeSearchBox = document.querySelector('#placeSearchBox');
    let selectedPlaceBox = document.querySelector('#selectedPlaceBox');
    for (let i = 0; i <= diffDays; i++) {

        // li 추가
        const newLi = document.createElement('li');
        newLi.className = 'scheduleItem';
        newLi.dataset.index = i;
        newLi.dataset.subtab1 = 'placeList' + i;
        newLi.dataset.subtab2 = 'selectedPlaceList' + i;

        const year = startDt.getFullYear();
        const month = String(startDt.getMonth() + 1).padStart(2, '0'); // 0부터 시작하니까 +1, 두 자리로 만들기
        const day = String(startDt.getDate()).padStart(2, '0');        // 두 자리로 만들기

        const formattedDate = `${year}-${month}-${day}`;
        newLi.innerHTML = `<div>${i + 1} 일차</div>
                        <div>${formattedDate}</div>`;
        scheduleItems.appendChild(newLi);

        // ul 추가
        const newUl1 = document.createElement('ul');
        newUl1.id = 'placeList' + i;
        newUl1.className = 'placeList';
        if(i != 0) {
            newUl1.style.display = 'none';
        }
        places.items.forEach(item => {
           let placeLi = document.createElement('li');
           placeLi.className = 'placeItem';
           placeLi.innerHTML = `<img class="placeImg" src="${item.images[0]}">
                                <div>${item.placeName}</div>
                                <div>${item.address}</div>
                                <button>+</button>`;
           newUl1.appendChild(placeLi);

        });


        placeSearchBox.appendChild(newUl1);

        // ul 추가
        const newUl2 = document.createElement('ul');
        newUl2.id = 'selectedPlaceList' + i;
        newUl2.className = 'selectedPlaceList';
        if(i != 0) {
            newUl2.style.display = 'none';
        }
        selectedPlaceBox.appendChild(newUl2);

        document.querySelectorAll('.scheduleItem').forEach(item => {
            item.addEventListener('click', () => {
                document.querySelectorAll('.placeList').forEach(pl => pl.style.display = 'none');
                const target1 = document.getElementById(item.dataset.subtab1);
                target1.style.display = 'block';

                document.querySelectorAll('.selectedPlaceList').forEach(spl => spl.style.display = 'none');
                const target2 = document.getElementById(item.dataset.subtab2);
                target2.style.display = 'block';
            });
        });


        startDt.setDate(startDt.getDate() + 1);
    }
}

function liClickEvent(li, f) {
    li.addEventListener("click", (e) => {

        if (e.target.classList.contains('addPlace')) {
            e.stopPropagation();
            const selectedPlaces = document.getElementById('selectedPlaces');

            // 현재 클릭된 버튼이 속한 placeItem
            const placeItem = e.target.closest('.placeItem');


            // 이미지 src, title, description 추출
            const imgSrc = placeItem.querySelector('img').src;
            const title = placeItem.querySelectorAll('p')[0].innerHTML;


            // 새로운 li 생성
            const newLi = document.createElement('li');
            newLi.className = 'placeItem';

            // HTML 구조 삽입
            newLi.innerHTML = ` <div class="placeInfo">
                                    <div class="placeImg">
                                        <img src="${imgSrc}">
                                    </div>
                                    <div class="placeDesc">
                                        <p>${title}</p>
                                    </div>
                                </div>
                                <button class="deletePlace">-</button>`;

            selectedPlaces.appendChild(newLi);

            // deleteBtn
            const deleteBtn = newLi.querySelector('.deletePlace');
            deleteBtn.addEventListener('click', () => {
                newLi.remove();
            });

            return;

        }

        if(e.target.closest('li')) {
            const imageUrl = f.firstimage || f.firstimage2;
            const title = f.title || "";
            const tel = f.tel || "";
            const addr = f.addr1 + " " + f.addr2 || "";
            const contentId = f.contentid || "";
            const contentTypeId = f.contenttypeid || "";
            const eventStartDate = f.eventstartdate || "";
            const eventEndDate = f.eventenddate || "";
            const latitude = f.mapy || "";
            const longitude = f.mapx || "";

            li.dataset.title = title;
            li.dataset.tel = tel;
            li.dataset.addr = addr;
            li.dataset.start = eventStartDate;
            li.dataset.end = eventEndDate;
            li.dataset.lat = latitude;
            li.dataset.lng = longitude;
            li.dataset.image = imageUrl;
            li.dataset.contentId = contentId;
            li.dataset.contentTypeId = contentTypeId;

            handleLocationDetail({
                title,
                tel,
                addr,
                start: eventStartDate,
                end: eventEndDate,
                lat: latitude,
                lng: longitude,
                image: imageUrl,
                contentId,
                contentTypeId,
            });
        }
    });
}
