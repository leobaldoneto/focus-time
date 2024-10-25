# Focus Time

Focus Time is an open-source web application designed to help users manage their time using the Pomodoro Technique. This app allows users to set focus sessions, take short or long breaks, track their progress, and manage their daily goals efficiently.

## About

This application was developed with the assistance of AI, specifically using GPT-01 by OpenAI. The application includes features like:

- **Focus Time Sessions**: Track and time your focus periods using the Pomodoro technique.
- **Break Sessions**: Short and long breaks are available for recovery between focus periods.
- **Daily Goals & Streaks**: Set daily goals, and track your progress and streaks over time.
- **Dark Mode**: Toggle dark mode for a more comfortable experience during nighttime use.
- **Notifications**: Desktop notifications to remind users of session completions and break starts.
- **Manual Record Deletion**: Manage history records with manual deletion options.
- **Accessibility Features**: ARIA attributes and keyboard navigation support for accessibility.

## Features

- **Dark Mode**: Toggle dark mode for night-time use.
- **Streak Management**: Track your progress over multiple days.
- **Accessibility**: The app includes ARIA attributes and supports keyboard navigation.
- **Language Support**: English and Portuguese translations are included.
- **Webhook Integration**: Configure webhooks to send data about session completion and status updates.

## Hosted Version

All the code works offline, no data is sent to external services, except for the webhook that you can setup to an custom URL.
- **URL**: https://leobaldoneto.github.io/focus-time/

## Installation

To run this application locally:

1. Clone the repository:
```bash
git clone https://github.com/yourusername/focus-time.git
```

2. Navigate to the project directory:
```bash
cd focus-time
```

3. Open `index.html` in your preferred web browser.

This app does not require any server or database setup as it relies on `localStorage` for saving session data.

## Usage

1. **Start a Focus Session**: Click the **Start** button to begin timing your focus session.
2. **Take a Break**: After completing a session, take either a short or long break as needed.
3. **Track Your Progress**: Monitor your progress with the daily goal tracker and streak indicator.
4. **Delete Records**: Manually delete records in the history table by clicking the trash icon. A confirmation prompt will appear before deletion.

## Technologies Used

- **HTML**: Structure and layout of the application.
- **CSS (TailwindCSS)**: Styling and responsiveness.
- **JavaScript**: Core functionality and logic, including timer management, dark mode, and notifications.
- **Font Awesome**: Icons for user interface elements.

## Contributions

Focus Time is open-source, and contributions are welcome! If you'd like to contribute:

1. Fork the repository.
2. Create a new branch for your feature (`git checkout -b feature-branch`).
3. Make your changes and commit them (`git commit -m 'Add new feature'`).
4. Push your changes (`git push origin feature-branch`).
5. Open a pull request and describe your changes.

## License

Focus Time is open-source software licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

## Credits

Focus Time was created with the assistance of GPT-01 by OpenAI.

## Support

If you encounter any issues or have suggestions for improvements, please open an issue in the [GitHub repository](https://github.com/yourusername/focus-time/issues).

Happy focusing!