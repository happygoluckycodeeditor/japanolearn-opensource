# Onboarding Feature Documentation

## Overview
The onboarding feature provides new users with a guided tour of the JapanoLearn application using react-joyride. The tour automatically triggers when a user first sets up the application and highlights key features of the dashboard.

## Implementation Details

### Dependencies
- `react-joyride`: Library for creating interactive tours
- `@types/react-joyride`: TypeScript definitions

### Database Schema Changes
- Added `onboarding_completed` column to the `users` table (BOOLEAN, default: 0)

### Backend Handlers (userHandlers.ts)
- `get-onboarding-status`: Retrieves onboarding completion status for a user
- `complete-onboarding`: Marks onboarding as completed for a user  
- `reset-onboarding`: Resets onboarding status (development only)

### Frontend Implementation (Dashboard.tsx)

#### Tour Steps
The onboarding tour includes 6 steps:
1. **Welcome Message**: Introduces the dashboard
2. **Lessons**: Explains the lesson system
3. **Kana Learning**: Highlights hiragana/katakana features
4. **Dictionary**: Shows dictionary functionality
5. **Exercises**: Demonstrates quiz system
6. **Profile**: Explains progress tracking

#### Tour Configuration
- **Continuous**: Users can navigate through steps sequentially
- **Progress Indicator**: Shows current step and total steps
- **Skip Option**: Users can skip the tour at any time
- **Custom Styling**: Branded with JapanoLearn colors

### Key Features

#### Automatic Triggering
- The onboarding tour automatically appears for new users who haven't completed it
- Checks onboarding status when the Dashboard component mounts
- Uses userId=1 (hardcoded for now, can be made dynamic later)

#### Tour Control
- Users can navigate forward/backward through steps
- Tour can be closed or skipped at any time
- Completion is automatically saved to prevent re-triggering

#### Data Attributes
Each highlighted element has a `data-tour` attribute:
- `data-tour="lessons"`: Lesson card
- `data-tour="kana-lesson"`: Kana learning card
- `data-tour="dictionary"`: Dictionary card
- `data-tour="exercises"`: Exercise card
- `data-tour="profile"`: Profile card
- `.dashboard-greeting`: Welcome section

## Development & Testing

### Testing the Onboarding
1. **Automatic**: Create a new user account (onboarding will trigger automatically)
2. **Manual Reset**: Use keyboard shortcut `Cmd+Shift+O` (Mac) or `Ctrl+Shift+O` (Windows/Linux) to reset and retrigger the tour

### Customization

#### Adding New Steps
```typescript
const newStep: Step = {
  target: '[data-tour="new-feature"]',
  content: 'Description of the new feature',
  placement: 'bottom' // 'top', 'bottom', 'left', 'right'
}
```

#### Styling
Tour appearance can be customized via the `styles` prop in the Joyride component:
```typescript
styles={{
  options: {
    primaryColor: '#3b82f6',      // Button colors
    backgroundColor: '#ffffff',   // Tooltip background
    textColor: '#374151',         // Text color
    overlayColor: 'rgba(0, 0, 0, 0.4)', // Background overlay
    arrowColor: '#ffffff',        // Tooltip arrow
    zIndex: 1000                  // Layer priority
  }
}}
```

## File Structure
```
src/
├── main/
│   ├── database/
│   │   └── setup.ts                    # Database schema updates
│   └── handlers/
│       └── userHandlers.ts             # Onboarding IPC handlers
├── renderer/src/
│   ├── components/
│   │   └── Dashboard.tsx               # Main implementation
│   └── types/
│       └── database.ts                 # Type definitions
```

## Future Enhancements
1. **Multi-step Onboarding**: Add separate tours for different sections
2. **User Preferences**: Allow users to replay tours from settings
3. **Contextual Help**: Trigger mini-tours for specific features
4. **Analytics**: Track tour completion rates and drop-off points
5. **Dynamic Content**: Personalize tour content based on user level/progress

## Best Practices
- Keep tour steps concise and focused
- Use clear, action-oriented language
- Ensure data attributes are consistently applied
- Test tour flow on different screen sizes
- Provide easy exit/skip options
- Save completion state to prevent repeated tours