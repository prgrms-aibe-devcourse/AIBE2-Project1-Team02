document.querySelectorAll('.tab').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tabContent').forEach(c => c.style.display = 'none');
        const target = document.getElementById(btn.dataset.tab);
        target.style.display = 'block';
    });
});

document.querySelectorAll('.addPlace').forEach(btn => {
    btn.addEventListener('click', () => {
        const selectedPlaces = document.getElementById('selectedPlaces');

// 현재 클릭된 버튼이 속한 placeItem
        const placeItem = btn.closest('.placeItem');

        // 이미지 src, title, description 추출
        const imgSrc = placeItem.querySelector('img').src;
        const title = placeItem.querySelectorAll('p')[0].textContent;
        const description = placeItem.querySelectorAll('p')[1].textContent;

        // 새로운 li 생성
        const newLi = document.createElement('li');
        newLi.className = 'placeItem';

        // HTML 구조 삽입
        newLi.innerHTML = `
            <div class="placeImg">
                <img src="${imgSrc}">
            </div>
            <div class="placeDesc">
                <p>${title}</p>
                <p>${description}</p>
            </div>
            <button class="deletePlace">-</button>
        `;

        selectedPlaces.appendChild(newLi);

        // deleteBtn
        const deleteBtn = newLi.querySelector('.deletePlace');
        deleteBtn.addEventListener('click', () => {
            newLi.remove();
        });

    });
});
