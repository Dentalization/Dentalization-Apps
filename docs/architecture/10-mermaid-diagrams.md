# Mermaid Diagrams Overview

This document collects key system diagrams expressed in [Mermaid](https://mermaid.js.org/) syntax. Each section focuses on a major repository area.

## Repository Structure
```mermaid
graph TD
    root[Project Root]
    root --> app[DentalizationApp]
    root --> api[backend-api]
    root --> shared
    root --> docs
    root --> compose[docker-compose.yml]
    root --> readme[README.md]
```

## Mobile App Directory
```mermaid
graph TD
    app[DentalizationApp/src]
    app --> comps[components]
    comps --> c1[common]
    comps --> c2[forms]
    app --> nav[navigation]
    app --> screens[screens]
    screens --> s1[auth]
    screens --> s2[doctor]
    screens --> s3[patient]
    screens --> s4[shared]
    app --> services[services]
    app --> store[store]
    store --> slices[slices]
    app --> constants[constants]
    app --> utils[utils]
    app --> tests[tests]
```

### Mobile Components
```mermaid
graph TD
    components[components]
    components --> common
    common --> ac[AnimatedCard.js]
    common --> ab[AnimatedButton.js]
    common --> ai[AnimatedInput.js]
    common --> ag[AnimatedGradient.js]
    common --> al[AnimatedLottie.js]
    common --> btn[Button.js]
    common --> input[Input.js]
    common --> card[Card.js]
    common --> spb[StepProgressBar.js]
    common --> tp[ThemeProvider.js]
    common --> cindex[index.js]
    components --> forms
    forms --> ci[ControlledInput.js]
    forms --> form[Form.js]
    forms --> findex[index.js]
```

### Mobile Screens
```mermaid
graph TD
    mscreens[screens]
    mscreens --> auth
    mscreens --> doctor
    mscreens --> patient
    mscreens --> shared
    mscreens --> examples
```

### Mobile Services
```mermaid
graph TD
    services[services]
    services --> apiClient[apiClient.js]
    services --> apiService[apiService.js]
    services --> authService[authService.js]
    services --> appointmentService[appointmentService.js]
    services --> aiService[aiService.js]
    services --> aiHistory[aiDiagnosisHistoryService.js]
    services --> profileService[profileService.js]
    services --> biometricService[biometricService.js]
```

### Mobile Store
```mermaid
graph TD
    store[store]
    store --> sindex[index.js]
    store --> slices[slices]
    slices --> authSlice[authSlice.js]
    slices --> appointmentSlice[appointmentSlice.js]
    slices --> chatSlice[chatSlice.js]
    slices --> userSlice[userSlice.js]
```

## Backend API Directory
```mermaid
graph TD
    api[backend-api/src]
    api --> controllers[controllers]
    api --> routes[routes]
    api --> middleware[middleware]
    api --> prisma[../prisma]
    prisma --> schema[schema.prisma]
    prisma --> migrations[migrations]
```

### Backend Controllers
```mermaid
graph TD
    controllers[controllers]
    controllers --> authController[authController.js]
    controllers --> patientController[patientController.js]
    controllers --> doctorController[doctorController.js]
    controllers --> aiDiagnosisController[aiDiagnosisController.js]
    controllers --> sharedController[sharedController.js]
```

### Backend Routes
```mermaid
graph TD
    routes[routes]
    routes --> authDir[auth]
    routes --> authFile[auth.js]
    routes --> doctors[doctors]
    routes --> patients[patients]
    routes --> shared[shared]
    routes --> aiDiagnosis[aiDiagnosis.js]
    routes --> profile[profile.js]
```

### Backend Middleware
```mermaid
graph TD
    middleware[middleware]
    middleware --> authMW[auth.js]
    middleware --> validation[validation.js]
    middleware --> rateLimiter[rateLimiter.js]
```

### Prisma Resources
```mermaid
graph TD
    prisma[prisma]
    prisma --> schema[schema.prisma]
    prisma --> migrations[migrations]
    prisma --> seed[seed.js]
```

## Shared Utilities
```mermaid
graph TD
    shared[shared]
    shared --> constants[constants]
```

### Shared Constants
```mermaid
graph TD
    constants[constants]
    constants --> colors[colors.js]
    constants --> roles[roles.js]
    constants --> cindex[index.js]
```

## Documentation Structure
```mermaid
graph TD
    docs[docs]
    docs --> architecture
    docs --> apiDoc[API_DOCUMENTATION.md]
    docs --> qsa[QUICK_START_AUTHENTICATION.md]
    docs --> qsb[QUICK_START_BACKEND.md]
    docs --> tailwind[TAILWIND_STYLING.md]
    docs --> styling[STYLING_REFACTOR_SUMMARY.md]
    docs --> phase4[PHASE2_WEEK4_COMPLETE.md]
    docs --> phase5[PHASE2_WEEK5_IMPLEMENTATION.md]
    docs --> week4[WEEK4_AUTHENTICATION_IMPLEMENTATION.md]
    architecture --> o1[01-overview.md]
    architecture --> o2[02-frontend-architecture.md]
    architecture --> o3[03-backend-architecture.md]
    architecture --> o4[04-database-schema.md]
    architecture --> o5[05-api-endpoints.md]
    architecture --> o6[06-deployment-devops.md]
    architecture --> o7[07-security-best-practices.md]
    architecture --> o8[08-testing-strategy.md]
    architecture --> o9[09-system-diagrams.md]
```

## Database Entity Relationship Diagram
```mermaid
erDiagram
    User {
        STRING id PK
        STRING email
        STRING password
        UserRole role
        UserStatus status
    }
    PatientProfile {
        STRING id PK
        STRING userId FK
        STRING firstName
        STRING lastName
    }
    DoctorProfile {
        STRING id PK
        STRING userId FK
        STRING firstName
        STRING lastName
        STRING licenseNumber
    }
    Session {
        STRING id PK
        STRING userId FK
        STRING token
        DATETIME expiresAt
    }
    ChatMessage {
        STRING id PK
        STRING senderId FK
        STRING receiverId FK
        STRING message
    }
    Appointment {
        STRING id PK
        STRING patientId FK
        STRING doctorId FK
        DATETIME scheduledAt
        AppointmentStatus status
    }
    DentalPhoto {
        STRING id PK
        STRING patientId FK
        STRING imageUrl
    }
    MedicalRecord {
        STRING id PK
        STRING patientId FK
        STRING title
    }
    Notification {
        STRING id PK
        STRING userId FK
        STRING title
    }
    AiDiagnosis {
        STRING id PK
        STRING userId FK
        STRING patientId FK
        STRING detectionResult
    }

    User ||--|| PatientProfile : has
    User ||--|| DoctorProfile : has
    User ||--o{ Session : creates
    User ||--o{ Notification : receives
    User ||--o{ ChatMessage : sends
    User ||--o{ ChatMessage : receives
    User ||--o{ Appointment : patient
    User ||--o{ Appointment : doctor
    User ||--o{ AiDiagnosis : requests

    PatientProfile ||--o{ DentalPhoto : uploads
    PatientProfile ||--o{ MedicalRecord : owns
    PatientProfile ||--o{ Appointment : books
    PatientProfile ||--o{ AiDiagnosis : subject

    DoctorProfile ||--o{ Appointment : attends
    AiDiagnosis }o--|| PatientProfile : refers
```
