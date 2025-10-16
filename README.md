# 🏛️ Palace Community Events

Palace Community Events is a platform where local businesses can create and share events with community members. Community members can discover events, RSVP to attend, and add events directly to their Google Calendar. Staff members have special permissions to create and manage events for the community.

**Live site:** _[Your deployed URL will go here]_

## ✨ Features

**For Community Members:**

- Browse events in a beautiful calendar view
- RSVP to events you want to attend
- Add events directly to your Google Calendar
- View and manage your RSVP'd events in a personal profile
- Import events from Ticketmaster

**For Staff Members:**

- Create and manage community events
- Import events from Ticketmaster API
- Special staff access with registration codes

**Event Management:**

- Real-time calendar with month navigation
- Event categorization by genre
- Multi-day event support
- Event descriptions, locations, and external links
- RSVP tracking and attendance counts

## 🛠️ Tech Stack

**Frontend**

- React – Component-based user interface
- Vite – Fast development build tool
- React Router – Single page application navigation
- CSS3 – Custom responsive styling

**Backend & Services**

- **Firebase**
  - Authentication – User sign-in and sign-up
  - Firestore – Real-time NoSQL database
  - Hosting – Production deployment
- **Google Calendar API** – Add events to user calendars
- **Ticketmaster API** – Import external events

**Development Tools**

- JavaScript ES6+
- Firebase Security Rules
- Environment variables for configuration

## 🚀 Development

### Install Dependencies

```bash
npm install
```

### Run Locally

```bash
npm run dev
```

### Production Build

```bash
npm run build
```

### Deploy to Firebase

```bash
firebase deploy
```

## 🔧 Environment Setup

Create a `.env` file in the root directory:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_TICKETMASTER_API_KEY=your_ticketmaster_key
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── CalendarButton.jsx
│   ├── AttendButton.jsx
│   └── GenreCard.jsx
├── pages/              # Main application pages
│   ├── CalendarPage.jsx
│   ├── ProfilePage.jsx
│   ├── CreateEventPage.jsx
│   └── GenreDayPage.jsx
├── services/           # External API integrations
│   ├── googleCalendar.js
│   └── firebase/
├── contexts/           # React context for state management
├── css/               # Stylesheets
└── utils/             # Helper functions
```

## 🔐 User Roles

**Community Members:**

- Can browse and RSVP to events
- Can add events to Google Calendar
- Can view personal event dashboard

**Staff Members:**

- All community member features
- Can create and manage events
- Can import events from Ticketmaster
- Access granted via staff registration code

## 🎯 Key Features Explained

**Calendar System**

- Monthly view with event indicators
- Click days to view events
- Genre-based event categorization
- Real-time Firestore updates

**RSVP System**

- Track event attendance
- User profiles show all RSVP'd events
- Remove RSVPs at any time
- See how many people are attending each event

**Google Calendar Integration**

- One-click add to Google Calendar
- Pre-filled event details
- Opens in new tab for user confirmation

## 🌟 Upcoming Features

- [ ] Payment integration for paid events
- [ ] Email reminders for upcoming events
- [ ] Event sharing on social media
- [ ] Advanced event filtering and search
- [ ] Recurring events support

---

_This project was built by Nelson Holtz as a community events platform solution._
