# Bulb - Social Ideas Platform

A modern Progressive Web App (PWA) built with React, TypeScript, Vite, and Material-UI. Bulb is designed with mobile-first principles to provide an excellent user experience across all devices.

## 🚀 Features

- **Progressive Web App**: Installable, offline-capable, and fast
- **Mobile-First Design**: Optimized for mobile devices with responsive layouts
- **Material-UI Components**: Modern, accessible, and consistent design system
- **TypeScript**: Type-safe development experience
- **Vite**: Fast development and build tooling
- **Service Worker**: Automatic caching and offline functionality

## 🛠️ Tech Stack

- **Frontend**: React 19.1.0
- **Language**: TypeScript
- **Build Tool**: Vite 7.0.0
- **UI Framework**: Material-UI (MUI) 7.2.0
- **PWA**: Vite PWA Plugin with Workbox
- **Icons**: Material Icons

## 📱 Mobile-First Features

- Touch-friendly interface with minimum 44px touch targets
- Responsive design that works on all screen sizes
- Optimized for mobile gestures and interactions
- Safe area support for devices with notches
- Proper viewport settings for mobile browsers
- Pull-to-refresh prevention for better UX

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Navigate to the client directory
```bash
cd client
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 📦 PWA Features

### Installation
- Users can install the app from their browser
- Works on iOS, Android, and desktop browsers
- Adds to home screen with custom icon

### Offline Support
- Service worker caches essential resources
- App works offline for previously visited content
- Smart caching strategies for different content types

### Performance
- Fast loading with resource caching
- Optimized bundle size
- Lazy loading for better performance

## 🎨 Design System

The app uses Material-UI with a custom theme optimized for mobile:

- **Primary Color**: Blue (#1976d2)
- **Secondary Color**: Orange (#ffa726)
- **Typography**: Roboto font family
- **Spacing**: 8px base unit
- **Breakpoints**: Mobile-first responsive design

## 📁 Project Structure

```
src/
├── components/
│   ├── Layout.tsx          # Main app layout with navigation
│   └── HomePage.tsx        # Home page with idea cards
├── theme.ts               # Material-UI theme configuration
├── App.tsx               # Main app component
├── main.tsx              # App entry point with PWA registration
└── index.css             # Global styles and mobile optimizations
```

## 🔧 Configuration

### PWA Manifest
The app includes a web manifest with:
- App name and short name
- Theme colors
- Display mode (standalone)
- Orientation preferences
- Icon specifications

### Service Worker
Configured with Workbox for:
- Precaching of static assets
- Runtime caching strategies
- Image caching with expiration
- Document caching with network-first strategy

## 🚧 Development

### Code Style
- TypeScript for type safety
- ESLint for code quality
- Consistent component structure

### Mobile Testing
Test the app on various devices:
- Use browser developer tools device simulation
- Test on actual mobile devices
- Verify touch interactions and responsive design
- Check PWA installation flow

## 🔮 Future Enhancements

- User authentication
- Real-time idea sharing
- Push notifications
- Offline idea creation
- Social features (likes, comments, sharing)
- Search and filtering
- Categories and tags
- User profiles

Built with ❤️ for the innovative community
