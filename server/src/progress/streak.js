function dateKey(date, timezone) {
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(date);
    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    return `${values.year}-${values.month}-${values.day}`;
}
function previousDay(day) {
    const [year, month, date] = day.split("-").map(Number);
    return new Date(Date.UTC(year, month - 1, date) - 86_400_000)
        .toISOString()
        .slice(0, 10);
}
export function getLocalDateKey(date, timezone) {
    return dateKey(date, timezone);
}
export function calculateStreak(activityDates, timezone, now = new Date()) {
    const activeDays = new Set(activityDates.map((date) => dateKey(date, timezone)));
    const today = dateKey(now, timezone);
    let currentDay = activeDays.has(today) ? today : previousDay(today);
    if (!activeDays.has(currentDay))
        return 0;
    let streak = 0;
    while (activeDays.has(currentDay)) {
        streak += 1;
        currentDay = previousDay(currentDay);
    }
    return streak;
}
