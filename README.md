# Focus Time - React + Jotai

Focus Time is a web-based Flowmodoro timer designed to help you manage your work sessions using the Flowmodoro technique, boosting focus and productivity.

**Now built with React and Jotai** for better performance, cleaner code, and automatic state persistence!

## Features

- Focus and break sessions with visual and audio cues.
- Modern dark theme with high contrast design.
- Daily goal tracking with progress bar.
- Streak tracking for consecutive focus days (with weekend grace period).
- Task logging and history management.
- Optional alarm sound when breaks end (default: `alarm.mp3`).
- Browser notifications when sessions end.
- Automatic localStorage persistence via Jotai.
- Webhook integration for external notifications.

## Tech Stack

- **React 18**: Modern UI library with hooks
- **Jotai**: Atomic state management with built-in localStorage persistence
- **Vite**: Fast build tool and dev server
- **Font Awesome**: Icons

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Hosted Version

All the code works offline, no data is sent to external services, except for the webhook that you can setup to an custom URL.
- **URL**: https://leobaldoneto.github.io/focus-time/

## Usage

1. **Start a Session**: Click the **Play** button.
2. **Pause/Stop**: Use the **Pause** or **Stop** buttons as needed.
3. **Settings**: Click the **Settings** icon to adjust:
   - Break multiplier (default: 0.2 = 20%)
   - Daily focus goal (default: 120 minutes)
   - Webhooks and alarm sound
   - Reset app or clear history
4. **Notifications**: Allow browser notifications for session alerts.

## Configuration

- **Break Multiplier**: Set the ratio for work and break times.
- **Daily Focus Goal**: Set the number of focus minutes per day.
- **Enable Webhooks**: Send POST requests with session status.
- **Enable Alarm Sound**: Toggle the alarm sound for breaks. Default sound file: `alarm.mp3`.

## Code Structure

```
src/
  atoms/           # Jotai atoms with localStorage persistence
    timerAtoms.js
    settingsAtoms.js
    historyAtoms.js
  hooks/           # Custom React hooks
    useTimer.js
    useWebhook.js
    useNotification.js
    useStreak.js
  components/      # React components
    Timer.jsx
    Controls.jsx
    History.jsx
    Settings.jsx
    ConfirmDialog.jsx
    Notification.jsx
  App.jsx          # Main app component
  main.jsx         # Entry point
  index.css        # Styles
```

## Key Improvements Over Alpine.js Version

- **~30% less code**: React + Jotai eliminates boilerplate for state management
- **Automatic persistence**: `atomWithStorage` handles localStorage automatically
- **Better separation of concerns**: Hooks for logic, components for UI
- **Type-safe state**: Better IDE support and error prevention
- **No DOM manipulation**: Declarative React rendering
- **Better performance**: React's virtual DOM and Jotai's atomic updates

## Notes

- Make sure to allow notifications and audio in your browser.
- Some browsers may block autoplay of the alarm sound unless the user interacts with the page.

## Contributing

1. Fork the repo.
2. Create your feature branch: `git checkout -b feature-branch-name`
3. Commit your changes: `git commit -m 'Add new feature'`
4. Push the branch: `git push origin feature-branch-name`
5. Open a pull request.

## License

Licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.

---

Enjoy your productive sessions with Focus Time!
