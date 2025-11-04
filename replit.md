# Babyrons - Baby Tracking App

## Project Overview
Babyrons is a React Native/Expo application designed to help parents track their babies' activities, especially for parents of twins and triplets. The app allows tracking of bottles, sleep, diapers, medications, and growth.

**Version**: 1.0.0  
**Last Updated**: November 4, 2025  
**Status**: Development - Web version running on Replit

## Key Features
- Multi-baby tracking (unlimited)
- Bottle feeding tracker (time, quantity, type)
- Sleep/nap monitoring
- Medication/Vitamin D tracking
- Diaper changes
- Growth tracking (weight, height, head circumference)
- Activity history
- Statistics
- Settings management

### Free vs Pro Features
- **Free**: All core tracking features
- **Pro** (€2): PDF export, Cloud sync, Custom themes

## Tech Stack

### Frontend
- **React Native** + **Expo 54**
- **TypeScript**
- **React Navigation** (bottom tabs)
- **Expo Router** (file-based routing)
- React 19.1.0
- React Native 0.81.5

### Planned Backend (Pro version)
- Firebase or Supabase for authentication and cloud sync
- Cloud Storage for baby photos

## Project Structure

```
Babyrons/
├── app/                          # Expo Router file-based routing
│   ├── _layout.tsx              # Root layout with navigation
│   ├── (tabs)/                  # Tab-based navigation
│   │   ├── _layout.tsx         # Tab bar configuration
│   │   ├── index.tsx           # Home/Dashboard
│   │   ├── history.tsx         # Activity history
│   │   ├── stats.tsx           # Statistics view
│   │   └── settings.tsx        # Settings
│   └── modals/                  # Modal screens
│       ├── add-event.tsx       # Add event modal (bottle/sleep/etc.)
│       └── manage-baby.tsx     # Add/edit/delete babies
├── src/
│   ├── components/              # Reusable UI components
│   │   ├── BabyCard.tsx        # Baby display card
│   │   └── EventCard.tsx       # Event display card
│   ├── data/
│   │   └── types.ts            # TypeScript types & interfaces
│   ├── lib/
│   │   └── storage.ts          # MMKV/localStorage wrapper
│   ├── state/
│   │   └── useBabyStore.ts     # Zustand store (babies/events/settings)
│   └── theme/
│       ├── colors.ts           # Color palette
│       └── spacing.ts          # Layout constants
├── assets/                      # Images and icons
├── metro.config.js             # Metro bundler configuration
├── package.json                # Dependencies and scripts
└── tsconfig.json               # TypeScript configuration
```

## Development Setup

### Scripts
- `npm run dev` - Start development server on port 5000 (Replit-configured)
- `npm start` - Start Expo dev server
- `npm run web` - Start web version
- `npm run android` - Start Android version
- `npm run ios` - Start iOS version
- `npm run lint` - Run ESLint

### Replit Configuration
- **Workflow**: "web" - Runs `npm run dev`
- **Port**: 5000 (configured for webview)
- **Environment**: Node.js 20.19.3 with Expo

## Recent Changes

### November 4, 2025 - Complete Rebuild ✅
**Project Setup & Structure:**
- ✅ Created complete src/ structure (components/, state/, lib/, data/, theme/)
- ✅ Installed core dependencies: Zustand, MMKV, React Navigation
- ✅ Configured workflow to run on port 5000
- ✅ Deployment configuration added (autoscale)

**Core Features Implemented:**
- ✅ Zustand store with CRUD operations for babies and events
- ✅ Auto-hydration: Store loads data from localStorage/MMKV on creation
- ✅ Storage wrapper with MMKV (native) and localStorage (web) fallback
- ✅ BabyCard and EventCard reusable components
- ✅ Add-event modal with service validation
- ✅ Manage-baby modal (add/edit/delete)
- ✅ History page with chronological event list
- ✅ Stats page with event counters
- ✅ Settings page with service toggles

**Bug Fixes & Validations:**
- ✅ Fixed data persistence across all pages (History, Stats, Settings)
- ✅ Prevented creating events for disabled services
- ✅ Added validation when all services are disabled
- ✅ Disabled save button when no service/baby selected
- ✅ Auto-reset eventType when service gets disabled

**Architecture Decisions:**
- Auto-hydration at store creation ensures all routes have persisted data
- Service validation at multiple levels prevents inconsistent state
- Clean separation: UI (app/) vs Logic (src/)
- Pastel theme throughout for baby-friendly aesthetic

## Known Issues & Warnings

### Deprecation Warnings (Non-critical)
- `props.pointerEvents` - Use `style.pointerEvents` instead
- `shadow*` style props - Use `boxShadow` instead

These are React Native Web compatibility warnings and don't affect functionality.

## User Preferences
None documented yet.

## Architecture Notes

### State Management
- **Zustand** for global state (babies, events, settings)
- Auto-hydration on store creation (loads from storage automatically)
- `saveToStorage()` called after every mutation
- Persisted to MMKV (native) or localStorage (web)

### Navigation
- **Expo Router** with file-based routing
- Bottom tab navigation with 4 main screens (Home, History, Stats, Settings)
- Modal presentation for add-event and manage-baby
- Tab bar height: 70px for easy touch access

### Storage Strategy
- **MMKV** for iOS/Android (fast, synchronous)
- **localStorage** fallback for web (Replit compatibility)
- Wrapper in `src/lib/storage.ts` handles platform detection
- Keys: `babyrons_babies`, `babyrons_events`, `babyrons_settings`

### Service Validation
- Settings control which services are enabled (bottle/sleep/med/diaper/growth)
- Add-event modal only shows enabled services
- Auto-resets eventType if current service gets disabled
- Blocks saving when no services or no baby selected

### Theme
- Pastel color scheme (mint green #98FFC1 primary)
- Active tab: #65C387 (mint green)
- Inactive tab: #B0C4DE (light blue-gray)
- Baby colors rotate: pink, blue, mint, yellow, lavender
- Soft shadows for card elevation

## Future Development

### Roadmap
- S1-S2: ✅ Design + Navigation + Zustand + CRUD babies
- S3: ✅ All services (bottle/sleep/med/diaper/growth) + Local history + Stats
- S4: ⏳ Enhanced stats with charts and analytics
- S5: ⏳ Custom themes + PDF export (Pro)
- S6: ⏳ Firebase Sync (Pro) + In-App Purchase
- S7: ⏳ Tests + Optimizations
- S8: ⏳ Play Store / App Store publication

## Dependencies

### Main Dependencies
- expo: ~54.0.22
- react: 19.1.0
- react-native: 0.81.5
- expo-router: ~6.0.14
- @react-navigation/bottom-tabs: ^7.4.0
- @expo/vector-icons: ^15.0.3
- zustand: ^5.0.3 (state management)
- react-native-mmkv: ^3.1.0 (native storage)

### Dev Dependencies
- typescript: ~5.9.2
- @types/react: ~19.1.0
- eslint: ^9.25.0

## Contact
- **Authors**: Andreas Arnolfo & Matthieu Gallice
- **License**: MIT
