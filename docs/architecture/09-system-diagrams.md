# System Diagrams - Dentalization App

Dokumen ini berisi berbagai diagram sistem yang melengkapi dokumentasi arsitektur Dentalization App, termasuk use case diagram, sequence diagram, activity diagram, dan diagram lainnya.

## 📋 Daftar Diagram

1. [Use Case Diagram](#use-case-diagram)
2. [Sequence Diagrams](#sequence-diagrams)
3. [Activity Diagrams](#activity-diagrams)
4. [State Diagrams](#state-diagrams)
5. [Component Interaction Diagram](#component-interaction-diagram)
6. [Data Flow Diagram](#data-flow-diagram)
7. [Network Architecture Diagram](#network-architecture-diagram)

---

## Use Case Diagram

### Overview
Diagram use case menunjukkan interaksi antara aktor (pengguna) dengan sistem Dentalization App.

```mermaid
graph TB
    subgraph "Dentalization App System"
        subgraph "Authentication"
            UC1["Register Account"]
            UC2["Login"]
            UC3["Logout"]
            UC4["Reset Password"]
        end
        
        subgraph "Profile Management"
            UC5["View Profile"]
            UC6["Update Profile"]
            UC7["Upload Avatar"]
        end
        
        subgraph "AI Diagnosis"
            UC8["Upload Dental Photo"]
            UC9["Get AI Diagnosis"]
            UC10["View Diagnosis History"]
            UC11["Share Diagnosis"]
        end
        
        subgraph "Doctor Features"
            UC12["Review Diagnosis"]
            UC13["Approve/Reject Diagnosis"]
            UC14["View Patient List"]
            UC15["View Dashboard Stats"]
            UC16["Send Recommendations"]
        end
        
        subgraph "Patient Features"
            UC17["View Dashboard"]
            UC18["Book Appointment"]
            UC19["View Medical Records"]
            UC20["Receive Notifications"]
        end
        
        subgraph "Admin Features"
            UC21["Manage Users"]
            UC22["View System Analytics"]
            UC23["Manage AI Model"]
            UC24["System Configuration"]
        end
    end
    
    %% Actors
    Patient(("👤 Patient"))
    Doctor(("👨‍⚕️ Doctor"))
    Admin(("👨‍💼 Admin"))
    AISystem(("🤖 AI System"))
    
    %% Patient Use Cases
    Patient --> UC1
    Patient --> UC2
    Patient --> UC3
    Patient --> UC4
    Patient --> UC5
    Patient --> UC6
    Patient --> UC7
    Patient --> UC8
    Patient --> UC9
    Patient --> UC10
    Patient --> UC11
    Patient --> UC17
    Patient --> UC18
    Patient --> UC19
    Patient --> UC20
    
    %% Doctor Use Cases
    Doctor --> UC1
    Doctor --> UC2
    Doctor --> UC3
    Doctor --> UC4
    Doctor --> UC5
    Doctor --> UC6
    Doctor --> UC7
    Doctor --> UC12
    Doctor --> UC13
    Doctor --> UC14
    Doctor --> UC15
    Doctor --> UC16
    
    %% Admin Use Cases
    Admin --> UC1
    Admin --> UC2
    Admin --> UC3
    Admin --> UC21
    Admin --> UC22
    Admin --> UC23
    Admin --> UC24
    
    %% AI System
    AISystem --> UC9
    AISystem --> UC23
```

---

## Sequence Diagrams

### 1. User Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant App as Mobile App
    participant API as Backend API
    participant DB as Database
    participant Redis as Redis Cache
    
    Note over U,Redis: User Login Process
    
    U->>App: Enter credentials
    App->>API: POST /auth/login
    API->>DB: Validate user credentials
    DB-->>API: User data
    
    alt Valid credentials
        API->>API: Generate JWT tokens
        API->>Redis: Store refresh token
        API-->>App: Access & refresh tokens
        App->>App: Store tokens securely
        App-->>U: Login successful
    else Invalid credentials
        API-->>App: Error: Invalid credentials
        App-->>U: Show error message
    end
```

### 2. AI Diagnosis Process

```mermaid
sequenceDiagram
    participant P as Patient
    participant App as Mobile App
    participant API as Backend API
    participant AI as AI Service
    participant DB as Database
    participant D as Doctor
    
    Note over P,D: AI Diagnosis Workflow
    
    P->>App: Upload dental photo
    App->>API: POST /diagnosis/analyze
    API->>API: Validate image
    API->>AI: Send image for analysis
    AI->>AI: Process image with ML model
    AI-->>API: Diagnosis result
    
    API->>DB: Save diagnosis
    DB-->>API: Diagnosis ID
    API-->>App: Diagnosis result
    App-->>P: Show diagnosis
    
    Note over P,D: Doctor Review Process
    
    API->>D: Notify new diagnosis (push notification)
    D->>App: Open diagnosis review
    App->>API: GET /diagnosis/:id
    API->>DB: Fetch diagnosis details
    DB-->>API: Diagnosis data
    API-->>App: Diagnosis details
    
    D->>App: Review and approve/reject
    App->>API: PUT /diagnosis/:id/review
    API->>DB: Update diagnosis status
    API->>P: Notify review result (push notification)
```

### 3. File Upload Process

```mermaid
sequenceDiagram
    participant U as User
    participant App as Mobile App
    participant API as Backend API
    participant Storage as File Storage
    participant DB as Database
    
    Note over U,DB: File Upload Workflow
    
    U->>App: Select image
    App->>App: Validate file (size, type)
    App->>API: POST /upload (multipart/form-data)
    
    API->>API: Validate file
    API->>API: Process image (resize, compress)
    API->>Storage: Upload processed image
    Storage-->>API: File URL
    
    API->>DB: Save file metadata
    DB-->>API: File record
    API-->>App: File URL and metadata
    App-->>U: Upload successful
```

---

## Activity Diagrams

### 1. Patient Registration Flow

```mermaid
flowchart TD
    Start(["Start Registration"]) --> ValidateInput{"Validate Input"}
    
    ValidateInput -->|Invalid| ShowError["Show Validation Error"]
    ShowError --> EnterInfo["Enter Registration Info"]
    
    ValidateInput -->|Valid| CheckEmail{"Check Email Exists"}
    CheckEmail -->|Exists| ShowEmailError["Show Email Exists Error"]
    ShowEmailError --> EnterInfo
    
    CheckEmail -->|New Email| CreateAccount["Create User Account"]
    CreateAccount --> SendVerification["Send Verification Email"]
    SendVerification --> ShowSuccess["Show Success Message"]
    ShowSuccess --> WaitVerification["Wait for Email Verification"]
    
    WaitVerification --> CheckVerification{"Email Verified?"}
    CheckVerification -->|No| ResendEmail["Resend Verification"]
    ResendEmail --> WaitVerification
    
    CheckVerification -->|Yes| ActivateAccount["Activate Account"]
    ActivateAccount --> CreateProfile["Create User Profile"]
    CreateProfile --> LoginUser["Auto Login User"]
    LoginUser --> End(["Registration Complete"])
    
    EnterInfo --> ValidateInput
```

### 2. AI Diagnosis Workflow

```mermaid
flowchart TD
    Start(["Start Diagnosis"]) --> SelectPhoto["Select Dental Photo"]
    SelectPhoto --> ValidatePhoto{"Validate Photo"}
    
    ValidatePhoto -->|Invalid| ShowPhotoError["Show Photo Error"]
    ShowPhotoError --> SelectPhoto
    
    ValidatePhoto -->|Valid| UploadPhoto["Upload Photo"]
    UploadPhoto --> ProcessImage["Process Image"]
    ProcessImage --> AIAnalysis["AI Analysis"]
    
    AIAnalysis --> GenerateResult["Generate Diagnosis"]
    GenerateResult --> SaveDiagnosis["Save to Database"]
    SaveDiagnosis --> NotifyDoctor["Notify Doctor"]
    
    NotifyDoctor --> ShowResult["Show Result to Patient"]
    ShowResult --> WaitReview["Wait for Doctor Review"]
    
    WaitReview --> CheckReview{"Doctor Reviewed?"}
    CheckReview -->|No| WaitReview
    
    CheckReview -->|Approved| UpdateStatus["Update Status: Confirmed"]
    CheckReview -->|Rejected| UpdateRejected["Update Status: Rejected"]
    
    UpdateStatus --> NotifyPatient["Notify Patient"]
    UpdateRejected --> NotifyPatient
    NotifyPatient --> End(["Diagnosis Complete"])
```

---

## State Diagrams

### 1. User Authentication State

```mermaid
stateDiagram-v2
    [*] --> Unauthenticated
    
    Unauthenticated --> Authenticating : login()
    Authenticating --> Authenticated : success
    Authenticating --> Unauthenticated : failure
    
    Authenticated --> Refreshing : token_expired
    Refreshing --> Authenticated : refresh_success
    Refreshing --> Unauthenticated : refresh_failed
    
    Authenticated --> Unauthenticated : logout()
    
    state Authenticated {
        [*] --> Active
        Active --> Idle : no_activity
        Idle --> Active : user_action
    }
```

### 2. Diagnosis Status State

```mermaid
stateDiagram-v2
    [*] --> Uploading
    
    Uploading --> Processing : upload_complete
    Uploading --> Failed : upload_error
    
    Processing --> Pending : analysis_complete
    Processing --> Failed : analysis_error
    
    Pending --> Under_Review : doctor_assigned
    Pending --> Expired : timeout
    
    Under_Review --> Confirmed : doctor_approved
    Under_Review --> Rejected : doctor_rejected
    Under_Review --> Pending : need_more_info
    
    Confirmed --> Archived : after_30_days
    Rejected --> Archived : after_30_days
    Failed --> [*] : cleanup
    Expired --> [*] : cleanup
    Archived --> [*] : cleanup
```

---

## Component Interaction Diagram

```mermaid
graph TB
    subgraph "Frontend Layer"
        UI["UI Components"]
        Nav["Navigation"]
        State["State Management"]
        Services["API Services"]
    end
    
    subgraph "API Gateway"
        Gateway["API Gateway"]
        Auth["Auth Middleware"]
        RateLimit["Rate Limiting"]
        CORS["CORS Handler"]
    end
    
    subgraph "Business Logic Layer"
        Controllers["Controllers"]
        BusinessLogic["Business Services"]
        Validation["Validation Layer"]
    end
    
    subgraph "Data Access Layer"
        ORM["Prisma ORM"]
        Cache["Redis Cache"]
        FileStorage["File Storage"]
    end
    
    subgraph "External Services"
        AI["AI/ML Service"]
        Email["Email Service"]
        Push["Push Notifications"]
        Analytics["Analytics"]
    end
    
    subgraph "Database Layer"
        PostgreSQL[("PostgreSQL")]
        Redis[("Redis")]
        S3[("File Storage")]
    end
    
    %% Frontend interactions
    UI --> Nav
    UI --> State
    State --> Services
    Services --> Gateway
    
    %% API Gateway flow
    Gateway --> Auth
    Auth --> RateLimit
    RateLimit --> CORS
    CORS --> Controllers
    
    %% Business logic flow
    Controllers --> Validation
    Validation --> BusinessLogic
    BusinessLogic --> ORM
    BusinessLogic --> Cache
    BusinessLogic --> FileStorage
    
    %% External service interactions
    BusinessLogic --> AI
    BusinessLogic --> Email
    BusinessLogic --> Push
    BusinessLogic --> Analytics
    
    %% Data layer
    ORM --> PostgreSQL
    Cache --> Redis
    FileStorage --> S3
```

---

## Data Flow Diagram

### Level 0 - Context Diagram

```mermaid
flowchart TB
    Patient(("Patient"))
    Doctor(("Doctor"))
    Admin(("Admin"))
    
    System["Dentalization App System"]
    
    AIService["AI/ML Service"]
    EmailService["Email Service"]
    PushService["Push Notification Service"]
    
    Patient <--> System
    Doctor <--> System
    Admin <--> System
    
    System <--> AIService
    System <--> EmailService
    System <--> PushService
```

### Level 1 - System Breakdown

```mermaid
flowchart TB
    subgraph "External Entities"
        Patient(("Patient"))
        Doctor(("Doctor"))
        Admin(("Admin"))
        AIService["AI Service"]
    end
    
    subgraph "Dentalization System"
        P1["1.0<br/>Authentication<br/>Process"]
        P2["2.0<br/>Profile<br/>Management"]
        P3["3.0<br/>Diagnosis<br/>Process"]
        P4["4.0<br/>Review<br/>Process"]
        P5["5.0<br/>Notification<br/>Process"]
    end
    
    subgraph "Data Stores"
        D1[("D1: Users")]
        D2[("D2: Profiles")]
        D3[("D3: Diagnoses")]
        D4[("D4: Files")]
        D5[("D5: Sessions")]
    end
    
    %% Patient flows
    Patient -->|"credentials"| P1
    P1 -->|"auth tokens"| Patient
    Patient -->|"profile data"| P2
    P2 -->|"profile info"| Patient
    Patient -->|"dental photos"| P3
    P3 -->|"diagnosis results"| Patient
    
    %% Doctor flows
    Doctor -->|"credentials"| P1
    P1 -->|"auth tokens"| Doctor
    Doctor -->|"review data"| P4
    P4 -->|"review results"| Doctor
    
    %% Admin flows
    Admin -->|"admin commands"| P1
    Admin -->|"system config"| P2
    
    %% AI Service
    P3 -->|"image data"| AIService
    AIService -->|"analysis results"| P3
    
    %% Data store interactions
    P1 <--> D1
    P1 <--> D5
    P2 <--> D2
    P3 <--> D3
    P3 <--> D4
    P4 <--> D3
    P5 <--> D1
    P5 <--> D3
```

---

## Network Architecture Diagram

```mermaid
graph TB
    subgraph "Client Devices"
        iOS["📱 iOS App"]
        Android["📱 Android App"]
        Web["💻 Web Admin"]
    end
    
    subgraph "CDN & Load Balancer"
        CDN["🌐 CloudFront CDN"]
        ALB["⚖️ Application Load Balancer"]
    end
    
    subgraph "Public Subnet"
        NAT["🔄 NAT Gateway"]
        Bastion["🔒 Bastion Host"]
    end
    
    subgraph "Private Subnet - App Tier"
        API1["🔧 API Server 1"]
        API2["🔧 API Server 2"]
        API3["🔧 API Server 3"]
    end
    
    subgraph "Private Subnet - Data Tier"
        RDS["🗄️ RDS PostgreSQL"]
        Redis["⚡ ElastiCache Redis"]
        S3["📁 S3 Bucket"]
    end
    
    subgraph "External Services"
        AI["🤖 AI/ML Service"]
        Email["📧 SES Email"]
        Push["📲 FCM/APNS"]
    end
    
    subgraph "Monitoring & Logging"
        CloudWatch["📊 CloudWatch"]
        Logs["📝 CloudWatch Logs"]
    end
    
    %% Client connections
    iOS --> CDN
    Android --> CDN
    Web --> CDN
    
    %% CDN and Load Balancer
    CDN --> ALB
    ALB --> API1
    ALB --> API2
    ALB --> API3
    
    %% API to Data connections
    API1 --> RDS
    API1 --> Redis
    API1 --> S3
    API2 --> RDS
    API2 --> Redis
    API2 --> S3
    API3 --> RDS
    API3 --> Redis
    API3 --> S3
    
    %% External service connections
    API1 --> AI
    API1 --> Email
    API1 --> Push
    API2 --> AI
    API2 --> Email
    API2 --> Push
    API3 --> AI
    API3 --> Email
    API3 --> Push
    
    %% Monitoring
    API1 --> CloudWatch
    API2 --> CloudWatch
    API3 --> CloudWatch
    RDS --> CloudWatch
    Redis --> CloudWatch
    
    API1 --> Logs
    API2 --> Logs
    API3 --> Logs
    
    %% Admin access
    Bastion -.-> API1
    Bastion -.-> API2
    Bastion -.-> API3
    Bastion -.-> RDS
```

---

## Diagram Usage Guidelines

### 1. Use Case Diagram
- **Tujuan**: Memahami fungsionalitas sistem dari perspektif pengguna
- **Audience**: Product managers, stakeholders, developers
- **Update**: Saat ada fitur baru atau perubahan requirement

### 2. Sequence Diagrams
- **Tujuan**: Memahami alur interaksi antar komponen
- **Audience**: Developers, system architects
- **Update**: Saat ada perubahan API atau business logic

### 3. Activity Diagrams
- **Tujuan**: Memahami alur proses bisnis
- **Audience**: Business analysts, QA engineers
- **Update**: Saat ada perubahan workflow atau business rules

### 4. State Diagrams
- **Tujuan**: Memahami status dan transisi objek
- **Audience**: Developers, testers
- **Update**: Saat ada perubahan state management

### 5. Component Interaction
- **Tujuan**: Memahami arsitektur dan dependencies
- **Audience**: System architects, senior developers
- **Update**: Saat ada perubahan arsitektur

### 6. Data Flow Diagram
- **Tujuan**: Memahami alur data dalam sistem
- **Audience**: Data architects, security engineers
- **Update**: Saat ada perubahan data flow atau security requirements

### 7. Network Architecture
- **Tujuan**: Memahami infrastruktur dan deployment
- **Audience**: DevOps engineers, infrastructure team
- **Update**: Saat ada perubahan infrastruktur atau deployment strategy

---

**Catatan**: Semua diagram ini harus diupdate secara berkala seiring dengan evolusi sistem dan dijaga konsistensinya dengan implementasi aktual.