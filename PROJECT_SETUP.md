# 🦷 Dentalization Apps - Development Setup

Welcome to the Dentalization Apps repository! This monorepo contains all components of the Dentalization dental care platform.

## 📁 Project Structure

```
Dentalization-Apps/
├── mobile-app/          # React Native app (Patient + Doctor)
├── backend-api/         # Node.js Express API + PostgreSQL
├── web-admin/          # Next.js Admin Panel (Future)
├── shared/             # Shared utilities and constants
└── docs/               # Documentation
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- PostgreSQL database
- React Native development environment
- Git

### 1. Clone Repository

```bash
git clone <repository-url>
cd Dentalization-Apps
```

### 2. Backend Setup

```bash
cd backend-api
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run db:push
npm run dev
```

### 3. Mobile App Setup

```bash
cd mobile-app
npm install
npx react-native run-android  # For Android
# or
npx react-native run-ios      # For iOS
```

## 🗄️ Database Setup

1. Install PostgreSQL
2. Create a database named `dentalization_db`
3. Update `DATABASE_URL` in backend-api/.env
4. Run database migrations:

```bash
cd backend-api
npm run db:push
npm run db:seed  # Optional: seed with sample data
```

## 🎨 Design System

The app uses a unified design system defined in `shared/constants/colors.js`:

- **Primary Color**: `#483AA0` (Professional purple)
- **Accent Color**: `#A08A48` (Warm gold)
- **Patient Theme**: Blue tones
- **Doctor Theme**: Green tones

## 🏗️ Architecture Overview

### Single App Approach
- **One React Native app** serves both patients and doctors
- **Role-based navigation** switches interface based on user role
- **Shared components** reduce development time
- **Real-time communication** between patients and doctors

### Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| Mobile App | React Native | Cross-platform mobile app |
| Backend API | Node.js + Express | REST API server |
| Database | PostgreSQL + Prisma | Data storage and ORM |
| State Management | Redux Toolkit | App state management |
| Authentication | JWT | Secure user authentication |
| Real-time | Socket.IO | Chat and notifications |

## 🔐 Authentication Flow

1. User opens app → Role-based interface detection
2. Login/Register → JWT token generation
3. Role verification → Navigate to appropriate interface
4. Persistent session → Auto-login on app restart

## 📱 App Features

### Patient Features
- 📸 Smart dental photo capture
- 📅 Appointment booking
- 💬 Chat with doctors
- 📊 Health history tracking
- 🔔 Medication reminders

### Doctor Features
- 👥 Patient management
- 🗓️ Schedule management
- 🤖 AI-assisted diagnosis
- 💬 Patient communication
- 📈 Analytics dashboard

### Shared Features
- 🔐 Secure authentication
- 🌙 Dark/Light mode
- 🌐 Multi-language support
- 📱 Push notifications
- 💾 Offline capabilities

## 🧪 Testing

```bash
# Backend tests
cd backend-api
npm test

# Mobile app tests
cd mobile-app
npm test
```

## 📦 Deployment

### Backend
```bash
cd backend-api
npm run build
npm start
```

### Mobile App
```bash
cd mobile-app
# Android
npm run build:android

# iOS
npm run build:ios
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📋 Development Roadmap

- [x] **Week 1**: Project structure setup
- [ ] **Week 2**: Role-based navigation & UI
- [ ] **Week 3**: Backend + Database setup
- [ ] **Week 4-6**: Authentication system
- [ ] **Week 7-14**: Core features development
- [ ] **Week 15-22**: Advanced features
- [ ] **Week 23-30**: Optimization & launch

## 🐛 Troubleshooting

### Common Issues

1. **Database connection error**
   - Check PostgreSQL is running
   - Verify DATABASE_URL in .env

2. **React Native build issues**
   - Clean build: `npx react-native clean`
   - Reset Metro cache: `npx react-native start --reset-cache`

3. **Metro bundler issues**
   - Clear watchman: `watchman watch-del-all`
   - Clear npm cache: `npm start -- --reset-cache`

## 📞 Support

For questions or issues, please:
1. Check existing issues in GitHub
2. Create a new issue with detailed description
3. Contact development team

## 📄 License

This project is proprietary and confidential.

---

**Happy coding! 🚀**
