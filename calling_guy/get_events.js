import { google } from "googleapis";
import readline from "readline";
import fs from "fs/promises";

const SCOPES = ["https://www.googleapis.com/auth/calendar"];
const TOKEN_PATH = "token.json";
const CREDENTIALS_PATH = "credentials.json";

async function authorize() {
  const content = await fs.readFile(CREDENTIALS_PATH, "utf8");
  const credentials = JSON.parse(content);

  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  try {
    const token = await fs.readFile(TOKEN_PATH, "utf8");
    oAuth2Client.setCredentials(JSON.parse(token));
    return oAuth2Client;
  } catch {
    return getNewToken(oAuth2Client);
  }
}

function getNewToken(oAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });
  console.log("Authorize this app by visiting:", authUrl);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question("Enter the code from that page: ", async (code) => {
      rl.close();
      const { tokens } = await oAuth2Client.getToken(code);
      oAuth2Client.setCredentials(tokens);
      await fs.writeFile(TOKEN_PATH, JSON.stringify(tokens));
      resolve(oAuth2Client);
    });
  });
}

async function listEvents(auth) {
  const calendar = google.calendar({ version: "v3", auth });
  const res = await calendar.events.list({
    calendarId: "primary",
    timeMin: new Date().toISOString(),
    maxResults: 5,
    singleEvents: true,
    orderBy: "startTime",
  });

  const events = res.data.items;
  console.log("Raw events from Google Calendar:", events);
  
  if (!events || events.length === 0) {
    return "No upcoming events found.";
  } else {
    const eventList = events.map((event) => {
      const isAllDay = !!event.start?.date && !event.start?.dateTime;
      let eventDescription = '';
      
      if (isAllDay) {
        // All-day event
        const startDate = new Date(event.start.date + 'T00:00:00');
        const endDate = event.end?.date ? new Date(event.end.date + 'T00:00:00') : null;
        
        const formattedStart = startDate.toLocaleString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
        
        // Check if it's a multi-day event
        if (endDate && endDate.getTime() - startDate.getTime() > 86400000) {
          endDate.setDate(endDate.getDate() - 1); // End date is exclusive in all-day events
          const formattedEnd = endDate.toLocaleString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          });
          eventDescription = `${event.summary || 'No title'} - All day from ${formattedStart} to ${formattedEnd}`;
        } else {
          eventDescription = `${event.summary || 'No title'} - All day on ${formattedStart}`;
        }
      } else {
        // Timed event
        const startDate = new Date(event.start.dateTime);
        const endDate = event.end?.dateTime ? new Date(event.end.dateTime) : null;
        
        const formattedStart = startDate.toLocaleString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
        
        if (endDate) {
          const formattedEnd = endDate.toLocaleString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          });
          
          // If event spans multiple days, include the end date
          if (startDate.toDateString() !== endDate.toDateString()) {
            const formattedEndDate = endDate.toLocaleString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            });
            eventDescription = `${event.summary || 'No title'} - ${formattedStart} to ${formattedEndDate}`;
          } else {
            eventDescription = `${event.summary || 'No title'} - ${formattedStart} to ${formattedEnd}`;
          }
        } else {
          eventDescription = `${event.summary || 'No title'} - ${formattedStart}`;
        }
      }
      
      return eventDescription;
    }).join('\n');
    
    const response = `You have ${events.length} upcoming events:\n${eventList}`;
    console.log("Returning formatted response:", response);
    return response;
  }
}

async function createEvent(auth, eventDetails) {
  const calendar = google.calendar({ version: "v3", auth });
  
  // Parse event details
  const { title, date, time, duration, description } = eventDetails;
  
  let event = {
    summary: title || "New Event",
    description: description || "",
  };
  
  // Handle date/time
  if (time) {
    // Timed event
    const startDateTime = new Date(`${date} ${time}`);
    const endDateTime = new Date(startDateTime);
    
    // Default duration is 1 hour if not specified
    const durationHours = duration || 1;
    endDateTime.setHours(endDateTime.getHours() + durationHours);
    
    event.start = {
      dateTime: startDateTime.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
    event.end = {
      dateTime: endDateTime.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  } else {
    // All-day event
    const eventDate = new Date(date);
    const nextDay = new Date(eventDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    event.start = {
      date: eventDate.toISOString().split('T')[0],
    };
    event.end = {
      date: nextDay.toISOString().split('T')[0],
    };
  }
  
  try {
    const response = await calendar.events.insert({
      calendarId: "primary",
      resource: event,
    });
    
    console.log("Event created:", response.data);
    return `Event "${event.summary}" has been added to your calendar on ${date}${time ? ` at ${time}` : ' (all day)'}`;
  } catch (error) {
    console.error("Error creating event:", error);
    throw error;
  }
}

export { authorize, listEvents, createEvent };

// Only run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  authorize().then(listEvents).catch(console.error);
}
