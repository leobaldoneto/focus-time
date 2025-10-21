// Migrate from Alpine.js version to React version
// This clears old incompatible localStorage data

export const migrateStorage = () => {
  const MIGRATION_KEY = 'react-migration-done';

  // Check if migration already happened
  if (localStorage.getItem(MIGRATION_KEY)) {
    return;
  }

  console.log('Migrating from Alpine.js to React version...');

  // List of keys from Alpine.js that might have incompatible formats
  const oldKeys = [
    'timerState', // Alpine.js stored everything in one object
  ];

  // Remove old incompatible keys
  oldKeys.forEach(key => {
    if (localStorage.getItem(key)) {
      console.log(`Removing old key: ${key}`);
      localStorage.removeItem(key);
    }
  });

  // Validate and fix individual keys
  const pausedTime = localStorage.getItem('pausedTime');
  if (pausedTime) {
    const parsed = parseInt(pausedTime);
    const maxReasonable = 24 * 60 * 60 * 1000; // 24 hours
    if (parsed > maxReasonable || isNaN(parsed)) {
      console.log('Invalid pausedTime, resetting');
      localStorage.setItem('pausedTime', '0');
    }
  }

  const timerStartTime = localStorage.getItem('timerStartTime');
  if (timerStartTime) {
    const parsed = parseInt(timerStartTime);
    if (parsed) {
      const timeSinceStart = Date.now() - parsed;
      const maxValid = 24 * 60 * 60 * 1000;
      if (timeSinceStart > maxValid || timeSinceStart < 0) {
        console.log('Invalid timerStartTime, resetting');
        localStorage.removeItem('timerStartTime');
        localStorage.removeItem('isPaused');
        localStorage.removeItem('isWorking');
      }
    }
  }

  // Mark migration as complete
  localStorage.setItem(MIGRATION_KEY, 'true');
  console.log('Migration complete');
};
