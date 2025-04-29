// 데이터 저장
export function saveToLocalStorage(key, data) {
    const jsonData = JSON.stringify(data);
    localStorage.setItem(key, jsonData);
    console.log(`Data saved to localStorage with key: ${key}`);
}

// 데이터 불러오기
export function loadFromLocalStorage(key) {
    const jsonData = localStorage.getItem(key);
    if (jsonData) {
        console.log(`Data loaded from localStorage with key: ${key}`);
        return JSON.parse(jsonData);
    } else {
        console.log(`No data found in localStorage with key: ${key}`);
        return null;
    }
}
