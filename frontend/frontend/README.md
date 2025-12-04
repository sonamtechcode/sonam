# Hospital Management Frontend

Modern React application for the Multi-Hospital Management System.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Features

- ✅ Modern React 18 with Hooks
- ✅ Vite for fast development
- ✅ TailwindCSS for styling
- ✅ React Router for navigation
- ✅ React Query for data fetching
- ✅ Zustand for state management
- ✅ Recharts for data visualization
- ✅ Responsive design
- ✅ Toast notifications

## Project Structure

```
src/
├── components/          # Reusable components
│   ├── Layout.jsx      # Main layout wrapper
│   ├── Header.jsx      # Header with hospital selector
│   └── Sidebar.jsx     # Navigation sidebar
│
├── hooks/              # Custom React hooks
│   ├── useAuth.js      # Authentication hook
│   └── useHospital.js  # Hospital selection hook
│
├── pages/              # Page components
│   ├── Login.jsx
│   ├── Dashboard.jsx
│   ├── Patients.jsx
│   ├── Doctors.jsx
│   ├── Appointments.jsx
│   ├── Departments.jsx
│   ├── Beds.jsx
│   ├── Billing.jsx
│   ├── Pharmacy.jsx
│   ├── Laboratory.jsx
│   ├── Staff.jsx
│   ├── Inventory.jsx
│   ├── Emergency.jsx
│   ├── Reports.jsx
│   └── Settings.jsx
│
├── services/           # API services
│   └── api.js         # Axios instance & interceptors
│
├── App.jsx            # Main app component
├── main.jsx           # Entry point
└── index.css          # Global styles
```

## Key Components

### Layout
Main layout with sidebar navigation and header with hospital selector.

### Header
- Hospital selector dropdown
- User profile display
- Logout button

### Sidebar
- Navigation menu with icons
- Active route highlighting
- Responsive design

## Custom Hooks

### useAuth
Manages authentication state and provides login/logout functions.

```javascript
const { user, isAuthenticated, login, logout } = useAuth()
```

### useHospital
Manages selected hospital state across the application.

```javascript
const { selectedHospital, setSelectedHospital } = useHospital()
```

## Styling

The application uses TailwindCSS with custom utility classes:

```css
.btn-primary      - Primary button style
.btn-secondary    - Secondary button style
.card             - Card container
.input-field      - Form input style
.label            - Form label style
```

## API Integration

All API calls go through the centralized `api.js` service with:
- Automatic token injection
- Error handling
- Response interceptors
- Toast notifications

## State Management

- **Local State:** React useState for component-level state
- **Global State:** Zustand for hospital selection
- **Server State:** React Query for API data

## Routing

Protected routes require authentication. Unauthenticated users are redirected to login.

```javascript
<Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
  <Route index element={<Dashboard />} />
  <Route path="patients" element={<Patients />} />
  // ... more routes
</Route>
```

## Environment Variables

Create `.env` file if needed:
```
VITE_API_URL=http://localhost:5000
```

## Building for Production

```bash
npm run build
```

Output will be in the `dist/` directory.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
