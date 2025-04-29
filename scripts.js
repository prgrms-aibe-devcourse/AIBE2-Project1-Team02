import { saveToLocalStorage } from './localStorageUtils.js';

// filteredItems 배열, 시작일, 종료일, customPrompt(선택)를 받아 Gemini API로 일정 생성
export async function generatePlanFromGemini(filteredItems, startDate, endDate, customPrompt) {
    if (!filteredItems || filteredItems.length === 0) {
        document.getElementById('result').textContent = "선택된 장소가 없습니다.";
        return;
    }

    let promptText;
    if (customPrompt) {
        promptText = customPrompt;
    } else {
        const places = filteredItems.map(item => item.placeName).join(', ');
        promptText = `날짜: ${startDate} ~ ${endDate}\n장소: ${places}\n위의 장소들을 포함하여 여행 일정을 작성해 주세요. 운영시간과 위치를 고려해서 최적의 동선으로 짜줘. 하루에 갈 수 있는 최대치의 장소를 시간을 고려해서 짜야해. 현재 테스트중이니 하루에 5개의 장소만 표기해 결과는 [\n   Item: [\n{\n    Date: ${startDate}\n    Places: [N서울 타워, 경복궁, 광장시장, 남대문 시장, 롯데월드타워]\n    Date: ...\n    Places: [...]\n}\n    ]이러한 형식의 json 포맷으로 반환해 주세요. 나머지 부연설명은 필요없이 딱 내가 원하는것만 전시해줘`;
    }

    const apiKey = "AIzaSyA0utBpWrVDX4rYPm1FF9PePzXOaUn1PnE"; // Gemini API Key
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  
    const payload = {
        contents: [
            {
                role: "user",
                parts: [
                    { text: promptText }
                ]
            }
        ]
    };
  
    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });
  
        if (!response.ok) {
            throw new Error(`서버 응답 오류: ${response.status}`);
        }
  
        const data = await response.json();
        const scheduleText = data.candidates[0].content.parts[0].text;
        console.log("받은 응답:", scheduleText);
        document.getElementById('result').textContent = scheduleText;
        // saveToLocalStorage('travelSchedule', scheduleText); // 삭제
    } catch (error) {
        console.error("에러 발생:", error);
        document.getElementById('result').textContent = `에러: ${error.message}`;
    }
}

async function generateSchedule(selectedIds) {
    const items = await loadJsonData();
    const selectedItems = items.filter(item => selectedIds.includes(item.id));

    if (selectedItems.length === 0) {
        document.getElementById('result').textContent = "선택된 ID에 해당하는 장소가 없습니다.";
        return;
    }

    // Assume start and end dates are provided in the data.json
    const startDate = new Date('2025-05-01'); // Example start date
    const endDate = new Date('2025-05-07'); // Example end date
    const totalDays = (endDate - startDate) / (1000 * 60 * 60 * 24) + 1;

    const schedule = {};
    let dayIndex = 0;

    // Sort selected items by some optimal route logic (e.g., by address proximity)
    selectedItems.sort((a, b) => a.address.localeCompare(b.address));

    selectedItems.forEach(item => {
        const currentDay = new Date(startDate);
        currentDay.setDate(startDate.getDate() + dayIndex);
        const dayString = currentDay.toISOString().split('T')[0];

        if (!schedule[dayString]) {
            schedule[dayString] = [];
        }
        schedule[dayString].push({
            순서: schedule[dayString].length + 1,
            원본idx: item.id
        });

        if (schedule[dayString].length >= Math.ceil(selectedItems.length / totalDays)) {
            dayIndex++;
        }
    });

    // Create a Blob from the schedule object
    const blob = new Blob([JSON.stringify(schedule, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    // Create a link element to download the file
    const a = document.createElement('a');
    a.href = url;
    a.download = 'schedule.json';
    a.textContent = '일정 다운로드';
    document.body.appendChild(a);

    // Display schedule in Korean
    let scheduleText = "생성된 일정:\n";
    for (const [day, plans] of Object.entries(schedule)) {
        scheduleText += `${day} 일정:\n`;
        plans.forEach(plan => {
            const place = items.find(item => item.id === plan.원본idx);
            scheduleText += `  ${plan.순서}. ${place.placeName}\n`;
        });
    }
    document.getElementById('result').textContent = scheduleText;
}

// 버튼 클릭 연결
document.getElementById('generateBtn').addEventListener('click', generatePlanFromGemini);


