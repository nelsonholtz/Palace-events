# 🏛️ Palace Community Events

A community events platform where local organizations can create and share events, and community members can discover, RSVP, and add events to their calendars.

**Live Site:** [https://palacecommunityevents.netlify.app](https://palacecommunityevents.netlify.app)  
**GitHub Repository:** [https://github.com/nelsonholtz/Palace-events](https://github.com/nelsonholtz/Palace-events)

## 🎯 Project Overview

Palace Community Events solves the problem of event information getting lost in chat apps like Telegram and WhatsApp by providing a centralized calendar platform. Community organizations can create events, and members can easily discover and track upcoming activities in a beautiful calendar interface.

### MVP Deliverables ✅

- ✅ **Event Creation** - Staff members can create and manage community events
- ✅ **Event Discovery** - Community members can browse events in an intuitive calendar view
- ✅ **RSVP System** - Users can sign up for events they want to attend
- ✅ **Google Calendar Integration** - One-click addition of events to personal Google Calendar
- ✅ **Ticketmaster Import** - Import external events from Ticketmaster API

## 🚀 Quick Start

### Demo Access

**Staff Account (Event Creation):**

- Email: `staff@palacecommunity.com`
- Password: `staff123`

**Community Account (Event Browsing):**

- Email: `member@palacecommunity.com`
- Password: `member123`

### Local Development

```bash
# Clone the repository
git clone https://github.com/nelsonholtz/Palace-events.git
cd palace-events

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your Firebase and Ticketmaster API keys to .env

# Run development server
npm run dev
```

### Production Build

```bash
npm run build
```

## 🛠️ Technology Stack

### Frontend

- **React 18** - Component-based UI
- **Vite** - Fast build tool and dev server
- **React Router** - Client-side navigation
- **CSS3** - Custom responsive styling

### Backend & APIs

- **Firebase**
  - Authentication (Email/Password & Google OAuth)
  - Firestore Database - Real-time data storage
  - Security Rules - Protected data access
- **Google Calendar API** - Personal calendar integration
- **Ticketmaster Discovery API** - External event imports

### Deployment

- **Netlify** - Production hosting with CI/CD
- **Environment Variables** - Secure configuration management

## 📋 Core Features

### For Community Members

- **Calendar View** - Monthly overview with event indicators
- **Event Discovery** - Browse events by date and category
- **RSVP Management** - Track events you're attending
- **Google Calendar Integration** - Add events to personal calendar
- **Ticketmaster Imports** - Discover external events

### For Staff Members

- **Event Creation** - Create and manage community events
- **Event Management** - Edit and delete events
- **Ticketmaster Integration** - Import events from external API
- **Staff Authentication** - Protected admin features

## 🔐 Authentication & Security

- **Firebase Authentication** - Secure user management
- **Role-based Access** - Staff vs Community member permissions
- **Environment Variables** - Protected API keys
- **Firestore Security Rules** - Data protection

## 🎨 Design & UX

- **Responsive Design** - Mobile-first approach
- **Accessibility** - Keyboard navigation and screen reader support
- **Intuitive Calendar** - Clear event visualization
- **Genre Color Coding** - Visual event categorization

### Firebase Services

- **Authentication** - User signup/login
- **Firestore** - Real-time event data
- **Security Rules** - Data protection

### External APIs

- **Google Calendar API** - Add events to user calendars
- **Ticketmaster Discovery API** - Import external events

## 🚀 Deployment

The application is deployed on **Netlify**

## 🔮 Future Enhancements

- [ ] Payment integration for paid events
- [ ] Email reminders for upcoming events
- [ ] Event sharing on social media
- [ ] Advanced filtering and search
- [ ] Recurring events support
- [ ] Push notifications
