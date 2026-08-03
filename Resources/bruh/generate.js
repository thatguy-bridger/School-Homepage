const fs = require('fs');

const API_URL = "https://api.vegaevents.com/public/v2/events/organization/ittDkE5rnVVQv7UtANIr/public?q=*&limit=100000&offset=0&from=2026-01-01T02%3A16%3A51.106Z";

function formatICSDate(dateString) {
    if (!dateString) return '';
    const d = new Date(dateString);
    return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

async function generateICS() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        const eventsArray = data.items || [];

        let icsContent = "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//AltaHighEvents//GitHubActions//EN\r\n";

        eventsArray.forEach(event => {
            const summary = event.name || "Untitled Event";
            const start = formatICSDate(event.startTime);
            const end = formatICSDate(event.endTime);
            const description = event.description || "";

            if (start) {
                icsContent += "BEGIN:VEVENT\r\n";
                icsContent += `DTSTART:${start}\r\n`;
                if (end) icsContent += `DTEND:${end}\r\n`;
                icsContent += `SUMMARY:${summary.replace(/,/g, '\\,')}\r\n`;
                if (description) {
                    icsContent += `DESCRIPTION:${description.replace(/\n/g, '\\n').replace(/,/g, '\\,')}\r\n`;
                }
                icsContent += "END:VEVENT\r\n";
            }
        });

        icsContent += "END:VCALENDAR";

        fs.writeFileSync('alta_events.ics', icsContent);
        console.log("Successfully generated alta_events.ics");
    } catch (error) {
        console.error("Error generating ICS:", error);
        process.exit(1);
    }
}

generateICS();
