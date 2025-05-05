import { saveToLocalStorage } from './localStorageUtils.js';
import { OPENAI_API_KEY } from './config.js';

// filteredItems 배열, 시작일, 종료일, customPrompt(선택)를 받아 OpenAI GPT-4o mini API로 일정 생성
export async function generatePlanFromOpenAI(filteredItems, startDate, endDate, customPrompt) {
    // 편집모드에서는 filteredItems가 비어있어도 실행되도록 아래 if문을 주석 처리하거나 삭제
    /*
    if (!filteredItems || filteredItems.length === 0) {
        const el = document.getElementById('result');
        if (el) {
            el.textContent = "선택된 장소가 없습니다.";
        }
        return null;
    }
    */

    let promptText = customPrompt;
    const apiKey = OPENAI_API_KEY;
    const apiUrl = "https://api.openai.com/v1/chat/completions";
    const payload = {
        model: "gpt-4o-mini",
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
        console.log('여행 일정 결과:', scheduleText);
        localStorage.setItem('travelSchedule', scheduleText);

        let cleanText = scheduleText
            .replace(/```json/g, '')
            .replace(/```/g, '')
            .trim();

        let scheduleArr;
        try {
            scheduleArr = JSON.parse(cleanText);
            console.log('파싱된 scheduleArr:', scheduleArr);
        } catch (e) {
            console.error('travelSchedule 파싱 오류:', e);
            return null;
        }
        return scheduleArr;
    } catch (error) {
        console.error("에러 발생:", error);
        const el = document.getElementById('result');
        if (el) {
            el.textContent = `에러: ${error.message}`;
        }
        return null;
    }
}

async function generateSchedule(selectedIds) {
    const items = await loadJsonData();
    const selectedItems = items.filter(item => selectedIds.includes(item.id));

    if (selectedItems.length === 0) {
        const el = document.getElementById('result');
        if (el) {
            el.textContent = "선택된 ID에 해당하는 장소가 없습니다.";
        }
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
    const el = document.getElementById('result');
    if (el) {
        el.textContent = scheduleText;
    }
}

function normalizeDate(dateStr) {
  // '2025-05-04' -> '2025-5-4'
  return dateStr.replace(/^0+/, '').replace(/-0+/g, '-');
}


