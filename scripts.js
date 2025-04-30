import { saveToLocalStorage } from './localStorageUtils.js';
import { OPENAI_API_KEY } from './config.js';

// filteredItems 배열, 시작일, 종료일, customPrompt(선택)를 받아 OpenAI GPT-4o mini API로 일정 생성
export async function generatePlanFromOpenAI(filteredItems, startDate, endDate, customPrompt) {
    if (!filteredItems || filteredItems.length === 0) {
        document.getElementById('result').textContent = "선택된 장소가 없습니다.";
        return;
    }

    let promptText = customPrompt;
    // OpenAI API Key (환경변수나 안전한 곳에 보관 권장)
    const apiKey = OPENAI_API_KEY; // config.js에서 import

    const apiUrl = "https://api.openai.com/v1/chat/completions";
    const payload = {
        model: "gpt-4o-mini", // 또는 "gpt-4-1106-preview", "gpt-3.5-turbo" 등
        messages: [
            { role: "user", content: promptText }
        ],
        max_tokens: 2048,
        temperature: 0.7
    };

    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`서버 응답 오류: ${response.status}`);
        }

        const data = await response.json();
        const scheduleText = data.choices[0].message.content;
        // =====================[중요: GPT 여행 일정 결과 저장 위치]====================
        // 아래 코드에서 GPT가 생성한 여행 일정 결과(scheduleText)는
        // 반드시 localStorage의 'travelSchedule' 키에 저장됩니다.
        // 다른 기능(예: 지도, 일정 복원, 분석 등)에서 이 값을 꺼내서 사용하세요!
        // ============================================================================
        console.log('여행 일정 결과:', scheduleText);
        localStorage.setItem('travelSchedule', scheduleText);

        // =====================[날짜별 장소 추출 및 테스트용 날짜 조작 코드]====================
        // 아래 한 줄로 원하는 날짜를 바꿔가며 테스트할 수 있습니다.
        let selectedDate = '2025-05-04'; // 예: '2025-05-01'로 지정해서 테스트

        // travelSchedule에서 해당 날짜의 장소 배열만 추출하는 함수
        function getPlacesByDateFromSchedule(scheduleText, dateStr) {
            let cleanText = scheduleText
                .replace(/```json/g, '')
                .replace(/```/g, '')
                .trim();
            let scheduleArr;
            try {
                scheduleArr = JSON.parse(cleanText);
            } catch (e) {
                console.error('travelSchedule 파싱 오류:', e);
                return [];
            }
            if (!Array.isArray(scheduleArr)) return [];
            const dayPlan = scheduleArr.find(item => normalizeDate(item.Date) === normalizeDate(dateStr));
            return dayPlan ? dayPlan.Places : [];
        }

        // 실제 사용 예시 (콘솔 출력)
        const savedSchedule = localStorage.getItem('travelSchedule');
        if (savedSchedule) {
            const places = getPlacesByDateFromSchedule(savedSchedule, selectedDate);
            console.log(`[${selectedDate}]의 장소 배열:`, places);
        }
        // ============================================================================
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

function normalizeDate(dateStr) {
  // '2025-05-04' -> '2025-5-4'
  return dateStr.replace(/^0+/, '').replace(/-0+/g, '-');
}


