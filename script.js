async function loadConfig() {
    const response = await fetch('config.txt');
    const value = await response.text();
    let result = value.replace(/\n/g, '');
    return result;
}

document.addEventListener('DOMContentLoaded', async function() {  // async 추가
    var calendarEl = document.getElementById('calendar');
    const today = new Date();
    const year = today.getFullYear();
    
    var calendar = new FullCalendar.Calendar(calendarEl, {
        initialDate: `${year}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`,
        locale: 'en',
        editable: false,
        selectable: true,
        dayMaxEvents: true,
        events: []
    });
    
    const school_list = [
        "9010121", "9111043", "9010432", "9010480", "9010332"
    ];
    
    const schoolColors = {
        "9010121": "#FF5733",
        "9111043": "#33FF57",
        "9010432": "#3357FF",
        "9010480": "#FF33A1",
        "9010332": "#A133FF"
    };
    
    async function fetchEventsForSchool(schoolCode, year, month) {
        const startDate = `${year}${String(month).padStart(2, '0')}01`;
        const endDate = `${year}${String(month).padStart(2, '0')}31`;
        const apiKey = await loadConfig();  // 비동기 호출로 API 키 로드
        
        const url = `https://open.neis.go.kr/hub/SchoolSchedule?KEY=${apiKey}&Type=xml&ATPT_OFCDC_SC_CODE=S10&SD_SCHUL_CODE=${schoolCode}&AA_FROM_YMD=${startDate}&AA_TO_YMD=${endDate}`;
        
        fetch(url)
            .then(response => response.text())
            .then(str => {
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(str, "text/xml");
        
                var rows = xmlDoc.getElementsByTagName("row");
                let events = [];
        
                for (var i = 0; i < rows.length; i++) {
                    var eventTitle = rows[i].getElementsByTagName("EVENT_NM")[0].textContent;
                    if (eventTitle === "토요휴업일") {
                        continue;
                    }
                    var eventDate = rows[i].getElementsByTagName("AA_YMD")[0].textContent;
        
                    events.push({
                        title: eventTitle,
                        start: eventDate,
                        color: schoolColors[schoolCode] || "#000000"
                    });
                }
                
                calendar.addEventSource(events);
                calendar.render();
            });
    }
  
    school_list.forEach(schoolCode => {
        for (let month = 1; month <= 12; month++) {
            fetchEventsForSchool(schoolCode, year, month);
        }
    });
});
