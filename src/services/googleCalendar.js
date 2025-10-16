class GoogleCalendarService {
  constructor() {}

  simpleAddToCalendar(eventData) {
    const startTime = this.formatGoogleCalendarTime(eventData.start);
    const endTime = this.formatGoogleCalendarTime(eventData.end);

    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: eventData.title,
      dates: `${startTime}/${endTime}`,
      details:
        eventData.description ||
        `Event from Palace Community Events${
          eventData.link ? `\nMore info: ${eventData.link}` : ""
        }`,
      location: eventData.location || "",
      sf: true,
      output: "xml",
    });

    const calendarUrl = `https://calendar.google.com/calendar/render?${params.toString()}`;
    window.open(calendarUrl, "_blank", "noopener,noreferrer");
    return true;
  }

  formatGoogleCalendarTime(date) {
    return (
      date
        .toISOString()
        .replace(/[-:]/g, "")
        .replace(/\.[0-9]{3}/, "") + "Z"
    );
  }

  async addToCalendar(eventData) {
    return this.simpleAddToCalendar(eventData);
  }
}

export const googleCalendarService = new GoogleCalendarService();
