# Deployment & DevOps Documentation

## Overview

Dokumentasi ini menjelaskan strategi deployment, CI/CD pipeline, infrastructure management, dan best practices untuk Dentalization App.

## Architecture Deployment

```mermaid
graph TB
    subgraph "Production Environment"
        LB[Load Balancer]
        
        subgraph "Frontend Tier"
            CDN[CDN/CloudFront]
            S3[S3 Static Hosting]
        end
        
        subgraph "Application Tier"
            API1[API Server 1]
            API2[API Server 2]
            API3[API Server 3]
        end
        
        subgraph "Data Tier"
            DB[(PostgreSQL Primary)]
            DBR[(PostgreSQL Replica)]
            REDIS[(Redis Cache)]
        end
        
        subgraph "Storage Tier"
            S3STORAGE[S3 File Storage]
            BACKUP[S3 Backup]
        end
        
        subgraph "Monitoring"
            LOGS[CloudWatch Logs]
            METRICS[CloudWatch Metrics]
            ALERTS[SNS Alerts]
        end
    end
    
    subgraph "External Services"
        AI[AI/ML Service]
        EMAIL[Email Service]
        SMS[SMS Service]
    end
    
    %% Connections
    CDN --> S3
    LB --> API1
    LB --> API2
    LB --> API3
    
    API1 --> DB
    API2 --> DB
    API3 --> DB
    
    API1 --> DBR
    API2 --> DBR
    API3 --> DBR
    
    API1 --> REDIS
    API2 --> REDIS
    API3 --> REDIS
    
    API1 --> S3STORAGE
    API2 --> S3STORAGE
    API3 --> S3STORAGE
    
    DB --> BACKUP
    
    API1 --> AI
    API2 --> AI
    API3 --> AI
    
    API1 --> EMAIL
    API2 --> EMAIL
    API3 --> EMAIL
```

## Environment Configuration

### Development Environment

#### Docker Compose Setup
```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  # Backend API
  api:
    build:
      context: ./backend-api
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://postgres:password@db:5432/dentalization_dev
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=dev_secret_key
      - AWS_ACCESS_KEY_ID=minioadmin
      - AWS_SECRET_ACCESS_KEY=minioadmin
      - AWS_ENDPOINT=http://minio:9000
    volumes:
      - ./backend-api:/app
      - /app/node_modules
    depends_on:
      - db
      - redis
      - minio
    command: npm run dev

  # PostgreSQL Database
  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=dentalization_dev
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql

  # Redis Cache
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  # MinIO (S3 Compatible Storage)
  minio:
    image: minio/minio:latest
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      - MINIO_ROOT_USER=minioadmin
      - MINIO_ROOT_PASSWORD=minioadmin
    volumes:
      - minio_data:/data
    command: server /data --console-address ":9001"

  # React Native Metro Bundler
  metro:
    build:
      context: ./DentalizationApp
      dockerfile: Dockerfile.dev
    ports:
      - "8081:8081"
    volumes:
      - ./DentalizationApp:/app
      - /app/node_modules
    command: npm start

volumes:
  postgres_data:
  redis_data:
  minio_data:
```

#### Environment Variables (.env.development)
```bash
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/dentalization_dev
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your_dev_jwt_secret_key
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_EXPIRES_IN=7d

# AWS/S3
AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=minioadmin
AWS_REGION=us-east-1
AWS_BUCKET_NAME=dentalization-dev
AWS_ENDPOINT=http://localhost:9000

# AI Service
AI_SERVICE_URL=http://localhost:8000
AI_SERVICE_API_KEY=dev_ai_key

# Email
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_mailtrap_user
SMTP_PASS=your_mailtrap_pass

# App Configuration
APP_NAME=Dentalization
APP_URL=http://localhost:3000
FRONTEND_URL=http://localhost:8081

# Logging
LOG_LEVEL=debug
LOG_FORMAT=dev

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Staging Environment

#### Docker Compose Staging
```yaml
# docker-compose.staging.yml
version: '3.8'

services:
  api:
    image: dentalization/api:staging
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=staging
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - JWT_SECRET=${JWT_SECRET}
    deploy:
      replicas: 2
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/staging.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl/certs
    depends_on:
      - api
```

### Production Environment

#### AWS ECS Task Definition
```json
{
  "family": "dentalization-api",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::account:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "dentalization-api",
      "image": "account.dkr.ecr.region.amazonaws.com/dentalization-api:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:dentalization/database-url"
        },
        {
          "name": "JWT_SECRET",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:dentalization/jwt-secret"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/dentalization-api",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:3000/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      }
    }
  ]
}
```

## CI/CD Pipeline

### GitHub Actions Workflow

#### Main CI/CD Pipeline
```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  AWS_REGION: us-east-1
  ECR_REPOSITORY: dentalization-api
  ECS_SERVICE: dentalization-api-service
  ECS_CLUSTER: dentalization-cluster

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
      
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: backend-api/package-lock.json
      
      - name: Install dependencies
        working-directory: backend-api
        run: npm ci
      
      - name: Run linting
        working-directory: backend-api
        run: npm run lint
      
      - name: Run type checking
        working-directory: backend-api
        run: npm run type-check
      
      - name: Run unit tests
        working-directory: backend-api
        run: npm run test:unit
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
          REDIS_URL: redis://localhost:6379
          JWT_SECRET: test_secret
      
      - name: Run integration tests
        working-directory: backend-api
        run: npm run test:integration
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
          REDIS_URL: redis://localhost:6379
          JWT_SECRET: test_secret
      
      - name: Generate test coverage
        working-directory: backend-api
        run: npm run test:coverage
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          file: backend-api/coverage/lcov.info
          flags: backend

  security-scan:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Run security audit
        working-directory: backend-api
        run: npm audit --audit-level high
      
      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high

  build-and-deploy:
    needs: [test, security-scan]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}
      
      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2
      
      - name: Build, tag, and push image to Amazon ECR
        id: build-image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: ${{ github.sha }}
        run: |
          cd backend-api
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
          echo "image=$ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG" >> $GITHUB_OUTPUT
      
      - name: Deploy to Amazon ECS
        uses: aws-actions/amazon-ecs-deploy-task-definition@v1
        with:
          task-definition: .aws/task-definition.json
          service: ${{ env.ECS_SERVICE }}
          cluster: ${{ env.ECS_CLUSTER }}
          wait-for-service-stability: true
      
      - name: Run database migrations
        env:
          DATABASE_URL: ${{ secrets.PRODUCTION_DATABASE_URL }}
        run: |
          cd backend-api
          npx prisma migrate deploy
      
      - name: Notify deployment
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          channel: '#deployments'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
        if: always()
```

#### Mobile App CI/CD
```yaml
# .github/workflows/mobile-ci-cd.yml
name: Mobile CI/CD

on:
  push:
    branches: [main, develop]
    paths: ['DentalizationApp/**']
  pull_request:
    branches: [main]
    paths: ['DentalizationApp/**']

jobs:
  test-mobile:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: DentalizationApp/package-lock.json
      
      - name: Install dependencies
        working-directory: DentalizationApp
        run: npm ci
      
      - name: Run linting
        working-directory: DentalizationApp
        run: npm run lint
      
      - name: Run tests
        working-directory: DentalizationApp
        run: npm test
      
      - name: Build for production
        working-directory: DentalizationApp
        run: npm run build

  build-android:
    needs: test-mobile
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Java
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'
      
      - name: Setup Android SDK
        uses: android-actions/setup-android@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: DentalizationApp/package-lock.json
      
      - name: Install dependencies
        working-directory: DentalizationApp
        run: npm ci
      
      - name: Build Android APK
        working-directory: DentalizationApp
        run: |
          cd android
          ./gradlew assembleRelease
      
      - name: Upload APK to artifacts
        uses: actions/upload-artifact@v4
        with:
          name: android-apk
          path: DentalizationApp/android/app/build/outputs/apk/release/

  build-ios:
    needs: test-mobile
    runs-on: macos-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: DentalizationApp/package-lock.json
      
      - name: Install dependencies
        working-directory: DentalizationApp
        run: npm ci
      
      - name: Install CocoaPods
        working-directory: DentalizationApp/ios
        run: pod install
      
      - name: Build iOS
        working-directory: DentalizationApp
        run: |
          cd ios
          xcodebuild -workspace DentalizationApp.xcworkspace \
                     -scheme DentalizationApp \
                     -configuration Release \
                     -destination generic/platform=iOS \
                     -archivePath DentalizationApp.xcarchive \
                     archive
```

## Infrastructure as Code

### Terraform Configuration

#### Main Infrastructure
```hcl
# infrastructure/main.tf
terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  
  backend "s3" {
    bucket = "dentalization-terraform-state"
    key    = "production/terraform.tfstate"
    region = "us-east-1"
  }
}

provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Project     = "Dentalization"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# VPC Configuration
module "vpc" {
  source = "terraform-aws-modules/vpc/aws"
  
  name = "${var.project_name}-vpc"
  cidr = "10.0.0.0/16"
  
  azs             = ["us-east-1a", "us-east-1b", "us-east-1c"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]
  
  enable_nat_gateway = true
  enable_vpn_gateway = false
  
  tags = {
    Name = "${var.project_name}-vpc"
  }
}

# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "${var.project_name}-cluster"
  
  configuration {
    execute_command_configuration {
      logging = "OVERRIDE"
      
      log_configuration {
        cloud_watch_log_group_name = aws_cloudwatch_log_group.ecs.name
      }
    }
  }
}

# Application Load Balancer
resource "aws_lb" "main" {
  name               = "${var.project_name}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = module.vpc.public_subnets
  
  enable_deletion_protection = var.environment == "production"
}

# RDS PostgreSQL
resource "aws_db_instance" "main" {
  identifier = "${var.project_name}-db"
  
  engine         = "postgres"
  engine_version = "15.4"
  instance_class = var.db_instance_class
  
  allocated_storage     = var.db_allocated_storage
  max_allocated_storage = var.db_max_allocated_storage
  storage_encrypted     = true
  
  db_name  = var.db_name
  username = var.db_username
  password = var.db_password
  
  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name
  
  backup_retention_period = var.environment == "production" ? 7 : 1
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"
  
  skip_final_snapshot = var.environment != "production"
  
  tags = {
    Name = "${var.project_name}-db"
  }
}

# ElastiCache Redis
resource "aws_elasticache_subnet_group" "main" {
  name       = "${var.project_name}-cache-subnet"
  subnet_ids = module.vpc.private_subnets
}

resource "aws_elasticache_cluster" "main" {
  cluster_id           = "${var.project_name}-cache"
  engine               = "redis"
  node_type            = var.redis_node_type
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  port                 = 6379
  subnet_group_name    = aws_elasticache_subnet_group.main.name
  security_group_ids   = [aws_security_group.redis.id]
}

# S3 Buckets
resource "aws_s3_bucket" "app_storage" {
  bucket = "${var.project_name}-storage-${var.environment}"
}

resource "aws_s3_bucket_versioning" "app_storage" {
  bucket = aws_s3_bucket.app_storage.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "app_storage" {
  bucket = aws_s3_bucket.app_storage.id
  
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}
```

#### Variables
```hcl
# infrastructure/variables.tf
variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  validation {
    condition     = contains(["development", "staging", "production"], var.environment)
    error_message = "Environment must be development, staging, or production."
  }
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "dentalization"
}

variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"
}

variable "db_allocated_storage" {
  description = "RDS allocated storage"
  type        = number
  default     = 20
}

variable "db_max_allocated_storage" {
  description = "RDS max allocated storage"
  type        = number
  default     = 100
}

variable "redis_node_type" {
  description = "ElastiCache node type"
  type        = string
  default     = "cache.t3.micro"
}
```

## Monitoring & Logging

### CloudWatch Configuration

#### Log Groups
```hcl
resource "aws_cloudwatch_log_group" "ecs" {
  name              = "/ecs/${var.project_name}"
  retention_in_days = var.environment == "production" ? 30 : 7
}

resource "aws_cloudwatch_log_group" "api" {
  name              = "/aws/ecs/${var.project_name}-api"
  retention_in_days = var.environment == "production" ? 30 : 7
}
```

#### Metrics and Alarms
```hcl
# CPU Utilization Alarm
resource "aws_cloudwatch_metric_alarm" "high_cpu" {
  alarm_name          = "${var.project_name}-high-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = "300"
  statistic           = "Average"
  threshold           = "80"
  alarm_description   = "This metric monitors ecs cpu utilization"
  alarm_actions       = [aws_sns_topic.alerts.arn]
  
  dimensions = {
    ServiceName = aws_ecs_service.api.name
    ClusterName = aws_ecs_cluster.main.name
  }
}

# Memory Utilization Alarm
resource "aws_cloudwatch_metric_alarm" "high_memory" {
  alarm_name          = "${var.project_name}-high-memory"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "MemoryUtilization"
  namespace           = "AWS/ECS"
  period              = "300"
  statistic           = "Average"
  threshold           = "80"
  alarm_description   = "This metric monitors ecs memory utilization"
  alarm_actions       = [aws_sns_topic.alerts.arn]
  
  dimensions = {
    ServiceName = aws_ecs_service.api.name
    ClusterName = aws_ecs_cluster.main.name
  }
}

# Database Connection Alarm
resource "aws_cloudwatch_metric_alarm" "db_connections" {
  alarm_name          = "${var.project_name}-db-connections"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "DatabaseConnections"
  namespace           = "AWS/RDS"
  period              = "300"
  statistic           = "Average"
  threshold           = "80"
  alarm_description   = "This metric monitors RDS connections"
  alarm_actions       = [aws_sns_topic.alerts.arn]
  
  dimensions = {
    DBInstanceIdentifier = aws_db_instance.main.id
  }
}
```

### Application Monitoring

#### Winston Logger Configuration
```javascript
// backend-api/src/utils/logger.js
const winston = require('winston');
const CloudWatchTransport = require('winston-cloudwatch');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'dentalization-api',
    environment: process.env.NODE_ENV
  },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Add CloudWatch transport in production
if (process.env.NODE_ENV === 'production') {
  logger.add(new CloudWatchTransport({
    logGroupName: '/aws/ecs/dentalization-api',
    logStreamName: `${process.env.HOSTNAME || 'unknown'}-${Date.now()}`,
    awsRegion: process.env.AWS_REGION || 'us-east-1'
  }));
}

module.exports = logger;
```

#### Health Check Endpoint
```javascript
// backend-api/src/routes/health.js
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const redis = require('../utils/redis');
const logger = require('../utils/logger');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/health', async (req, res) => {
  const healthCheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
    checks: {
      database: 'unknown',
      redis: 'unknown',
      memory: 'unknown'
    }
  };

  try {
    // Database health check
    await prisma.$queryRaw`SELECT 1`;
    healthCheck.checks.database = 'healthy';
  } catch (error) {
    healthCheck.checks.database = 'unhealthy';
    logger.error('Database health check failed:', error);
  }

  try {
    // Redis health check
    await redis.ping();
    healthCheck.checks.redis = 'healthy';
  } catch (error) {
    healthCheck.checks.redis = 'unhealthy';
    logger.error('Redis health check failed:', error);
  }

  // Memory usage check
  const memUsage = process.memoryUsage();
  const memUsagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
  healthCheck.checks.memory = memUsagePercent < 90 ? 'healthy' : 'warning';
  healthCheck.memoryUsage = {
    used: Math.round(memUsage.heapUsed / 1024 / 1024),
    total: Math.round(memUsage.heapTotal / 1024 / 1024),
    percentage: Math.round(memUsagePercent)
  };

  const isHealthy = Object.values(healthCheck.checks).every(check => 
    check === 'healthy' || check === 'warning'
  );

  res.status(isHealthy ? 200 : 503).json(healthCheck);
});

module.exports = router;
```

## Security Configuration

### SSL/TLS Configuration

#### Nginx SSL Configuration
```nginx
# nginx/production.conf
server {
    listen 80;
    server_name api.dentalization.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.dentalization.com;

    ssl_certificate /etc/ssl/certs/dentalization.crt;
    ssl_certificate_key /etc/ssl/private/dentalization.key;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    client_max_body_size 10M;
    
    location / {
        proxy_pass http://api:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    location /health {
        proxy_pass http://api:3000/health;
        access_log off;
    }
}
```

### WAF Configuration
```hcl
# infrastructure/waf.tf
resource "aws_wafv2_web_acl" "main" {
  name  = "${var.project_name}-waf"
  scope = "REGIONAL"
  
  default_action {
    allow {}
  }
  
  rule {
    name     = "AWSManagedRulesCommonRuleSet"
    priority = 1
    
    override_action {
      none {}
    }
    
    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesCommonRuleSet"
        vendor_name = "AWS"
      }
    }
    
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "CommonRuleSetMetric"
      sampled_requests_enabled   = true
    }
  }
  
  rule {
    name     = "RateLimitRule"
    priority = 2
    
    action {
      block {}
    }
    
    statement {
      rate_based_statement {
        limit              = 2000
        aggregate_key_type = "IP"
      }
    }
    
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "RateLimitMetric"
      sampled_requests_enabled   = true
    }
  }
  
  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "${var.project_name}WAF"
    sampled_requests_enabled   = true
  }
}
```

## Backup & Disaster Recovery

### Database Backup Strategy
```bash
#!/bin/bash
# scripts/backup-database.sh

set -e

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="dentalization_backup_${DATE}"
S3_BUCKET="dentalization-backups"

echo "Starting database backup: ${BACKUP_NAME}"

# Create database dump
pg_dump $DATABASE_URL > /tmp/${BACKUP_NAME}.sql

# Compress backup
gzip /tmp/${BACKUP_NAME}.sql

# Upload to S3
aws s3 cp /tmp/${BACKUP_NAME}.sql.gz s3://${S3_BUCKET}/database/

# Clean up local file
rm /tmp/${BACKUP_NAME}.sql.gz

# Remove old backups (keep last 30 days)
aws s3 ls s3://${S3_BUCKET}/database/ | while read -r line; do
  createDate=$(echo $line | awk '{print $1" "$2}')
  createDate=$(date -d "$createDate" +%s)
  olderThan=$(date -d "30 days ago" +%s)
  if [[ $createDate -lt $olderThan ]]; then
    fileName=$(echo $line | awk '{print $4}')
    if [[ $fileName != "" ]]; then
      aws s3 rm s3://${S3_BUCKET}/database/$fileName
    fi
  fi
done

echo "Database backup completed: ${BACKUP_NAME}.sql.gz"
```

### Disaster Recovery Plan
```yaml
# disaster-recovery.yml
disaster_recovery:
  rto: 4 hours  # Recovery Time Objective
  rpo: 1 hour   # Recovery Point Objective
  
  procedures:
    database_failure:
      - Switch to read replica
      - Promote replica to primary
      - Update application configuration
      - Verify data integrity
      
    application_failure:
      - Scale up healthy instances
      - Deploy to backup region
      - Update DNS records
      - Monitor application health
      
    complete_region_failure:
      - Activate disaster recovery region
      - Restore database from backup
      - Deploy application stack
      - Update DNS to point to DR region
      - Communicate with stakeholders
```

## Performance Optimization

### Auto Scaling Configuration
```hcl
# infrastructure/autoscaling.tf
resource "aws_appautoscaling_target" "ecs_target" {
  max_capacity       = 10
  min_capacity       = 2
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.api.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "ecs_policy_cpu" {
  name               = "${var.project_name}-cpu-scaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.ecs_target.resource_id
  scalable_dimension = aws_appautoscaling_target.ecs_target.scalable_dimension
  service_namespace  = aws_appautoscaling_target.ecs_target.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value = 70.0
  }
}

resource "aws_appautoscaling_policy" "ecs_policy_memory" {
  name               = "${var.project_name}-memory-scaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.ecs_target.resource_id
  scalable_dimension = aws_appautoscaling_target.ecs_target.scalable_dimension
  service_namespace  = aws_appautoscaling_target.ecs_target.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageMemoryUtilization"
    }
    target_value = 80.0
  }
}
```

### CDN Configuration
```hcl
# infrastructure/cloudfront.tf
resource "aws_cloudfront_distribution" "main" {
  origin {
    domain_name = aws_lb.main.dns_name
    origin_id   = "${var.project_name}-api"
    
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }
  
  enabled = true
  
  default_cache_behavior {
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "${var.project_name}-api"
    compress               = true
    viewer_protocol_policy = "redirect-to-https"
    
    forwarded_values {
      query_string = true
      headers      = ["Authorization", "Content-Type"]
      
      cookies {
        forward = "none"
      }
    }
    
    min_ttl     = 0
    default_ttl = 3600
    max_ttl     = 86400
  }
  
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
  
  viewer_certificate {
    acm_certificate_arn = aws_acm_certificate.main.arn
    ssl_support_method  = "sni-only"
  }
}
```

## Deployment Scripts

### Deployment Script
```bash
#!/bin/bash
# scripts/deploy.sh

set -e

ENVIRONMENT=${1:-staging}
IMAGE_TAG=${2:-latest}

echo "Deploying to ${ENVIRONMENT} with image tag ${IMAGE_TAG}"

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(staging|production)$ ]]; then
  echo "Error: Environment must be 'staging' or 'production'"
  exit 1
fi

# Set environment-specific variables
if [ "$ENVIRONMENT" = "production" ]; then
  CLUSTER_NAME="dentalization-cluster"
  SERVICE_NAME="dentalization-api-service"
  TASK_DEFINITION="dentalization-api"
else
  CLUSTER_NAME="dentalization-staging-cluster"
  SERVICE_NAME="dentalization-staging-api-service"
  TASK_DEFINITION="dentalization-staging-api"
fi

# Update task definition with new image
echo "Updating task definition..."
aws ecs describe-task-definition --task-definition $TASK_DEFINITION \
  --query taskDefinition > task-def.json

# Remove unnecessary fields
jq 'del(.taskDefinitionArn, .revision, .status, .requiresAttributes, .placementConstraints, .compatibilities, .registeredAt, .registeredBy)' \
  task-def.json > task-def-clean.json

# Update image tag
jq --arg IMAGE_TAG "$IMAGE_TAG" \
  '.containerDefinitions[0].image = (.containerDefinitions[0].image | split(":")[0] + ":" + $IMAGE_TAG)' \
  task-def-clean.json > task-def-updated.json

# Register new task definition
echo "Registering new task definition..."
aws ecs register-task-definition --cli-input-json file://task-def-updated.json

# Update service
echo "Updating service..."
aws ecs update-service \
  --cluster $CLUSTER_NAME \
  --service $SERVICE_NAME \
  --task-definition $TASK_DEFINITION

# Wait for deployment to complete
echo "Waiting for deployment to complete..."
aws ecs wait services-stable \
  --cluster $CLUSTER_NAME \
  --services $SERVICE_NAME

# Run database migrations
if [ "$ENVIRONMENT" = "production" ]; then
  echo "Running database migrations..."
  aws ecs run-task \
    --cluster $CLUSTER_NAME \
    --task-definition $TASK_DEFINITION \
    --overrides '{
      "containerOverrides": [{
        "name": "dentalization-api",
        "command": ["npm", "run", "migrate"]
      }]
    }'
fi

# Clean up
rm -f task-def.json task-def-clean.json task-def-updated.json

echo "Deployment completed successfully!"
```

### Rollback Script
```bash
#!/bin/bash
# scripts/rollback.sh

set -e

ENVIRONMENT=${1:-staging}
REVISION=${2}

if [ -z "$REVISION" ]; then
  echo "Error: Revision number is required"
  echo "Usage: $0 <environment> <revision>"
  exit 1
fi

echo "Rolling back ${ENVIRONMENT} to revision ${REVISION}"

# Set environment-specific variables
if [ "$ENVIRONMENT" = "production" ]; then
  CLUSTER_NAME="dentalization-cluster"
  SERVICE_NAME="dentalization-api-service"
  TASK_DEFINITION="dentalization-api"
else
  CLUSTER_NAME="dentalization-staging-cluster"
  SERVICE_NAME="dentalization-staging-api-service"
  TASK_DEFINITION="dentalization-staging-api"
fi

# Update service to use previous revision
echo "Rolling back to revision ${REVISION}..."
aws ecs update-service \
  --cluster $CLUSTER_NAME \
  --service $SERVICE_NAME \
  --task-definition "${TASK_DEFINITION}:${REVISION}"

# Wait for rollback to complete
echo "Waiting for rollback to complete..."
aws ecs wait services-stable \
  --cluster $CLUSTER_NAME \
  --services $SERVICE_NAME

echo "Rollback completed successfully!"
```

Dokumentasi ini memberikan panduan lengkap untuk deployment dan DevOps Dentalization App, termasuk konfigurasi environment, CI/CD pipeline, infrastructure as code, monitoring, security, dan disaster recovery.