# Focus Time

Focus Time is a web-based Flowmodoro timer designed to help you manage your work sessions using the Flowmodoro technique, boosting focus and productivity.

## Features

- Focus and break sessions with visual and audio cues.
- Dark mode support for comfortable usage.
- Daily goal tracking with progress bar.
- Streak tracking for consecutive focus days.
- Task logging and history management.
- Optional alarm sound when breaks end (default: `alarm.mp3`).
- Browser notifications when sessions end.
- Local storage for persistent settings and timer state.

## Hosted Version

All the code works offline, no data is sent to external services, except for the webhook that you can setup to an custom URL.
- **URL**: https://leobaldoneto.github.io/focus-time/

## Usage

1. **Start a Session**: Click the **Play** button.
2. **Pause/Stop**: Use the **Pause** or **Stop** buttons as needed.
3. **Dark Mode**: Click the **Moon** icon to toggle modes.
4. **Settings**: Click the **Settings** icon to adjust:
   - Break multiplier
   - Daily focus goal
   - Webhooks and alarm sound
   - Reset app or clear history
5. **Notifications**: Allow browser notifications for session alerts.

## Configuration

- **Break Multiplier**: Set the ratio for work and break times.
- **Daily Focus Goal**: Set the number of focus minutes per day.
- **Enable Webhooks**: Send POST requests with session status.
- **Enable Alarm Sound**: Toggle the alarm sound for breaks. Default sound file: `alarm.mp3`.

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
