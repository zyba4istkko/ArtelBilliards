# Проектирование инфраструктуры Docker и DevOps

🎨🎨🎨 **ENTERING CREATIVE PHASE: DOCKER & DEVOPS INFRASTRUCTURE** 🎨🎨🎨

## Описание компонента

Комплексная DevOps инфраструктура для микросервисной архитектуры бильярдного приложения, включающая containerization strategy, CI/CD pipelines, orchestration с Kubernetes, Infrastructure as Code, environment management, deployment strategies, monitoring integration, security scanning и disaster recovery. Инфраструктура должна обеспечить scalable, secure и cost-effective deployment со 100% automation и zero-downtime deployments.

## Требования и ограничения

### Функциональные требования:
- **Containerization**: Docker containers для всех микросервисов и dependencies
- **Orchestration**: Kubernetes-based orchestration с auto-scaling
- **CI/CD Automation**: Automated testing, building, и deployment pipelines
- **Environment Management**: Isolated dev/staging/production environments
- **Infrastructure as Code**: Declarative infrastructure management
- **Security Scanning**: Automated vulnerability detection и compliance
- **Monitoring Integration**: Seamless integration с observability stack
- **Backup & Recovery**: Automated backup strategies и disaster recovery

### Технические ограничения:
- **Resource Efficiency**: Optimized container images (< 200MB per service)
- **Build Performance**: CI/CD pipeline execution < 15 minutes
- **Deployment Speed**: Zero-downtime deployments < 5 minutes
- **Scalability**: Support для 10x traffic growth
- **Security**: Container security scanning, secrets management
- **Cost Optimization**: Resource utilization > 70%
- **High Availability**: 99.9% uptime target
- **Compliance**: GDPR, security audit requirements

### Архитектурные ограничения:
- **Multi-cloud Support**: Vendor-agnostic infrastructure design
- **Network Security**: Service mesh integration для secure communication
- **Storage**: Persistent volumes для stateful services (databases)
- **Load Balancing**: Intelligent traffic routing и failover
- **Service Discovery**: Automatic service registration и discovery
- **Configuration Management**: Environment-specific configurations
- **Logging & Monitoring**: Centralized observability integration
- **Resource Limits**: CPU и memory constraints для cost control

### Operational требования:
- **GitOps Workflow**: Git-based deployment и configuration management
- **Rollback Capability**: Quick rollback для failed deployments
- **Blue-Green Deployment**: Zero-downtime deployment strategy
- **Canary Releases**: Gradual feature rollout capabilities
- **Database Migrations**: Safe database schema updates
- **Secret Rotation**: Automated credential management
- **Performance Testing**: Load testing integration
- **Documentation**: Comprehensive operational runbooks

## Варианты DevOps архитектуры

### Вариант 1: Traditional Container Orchestration

**Описание**: Классический подход с Docker Swarm или простым Kubernetes setup без дополнительных abstractions.

**Архитектура компонентов**:
```
Git Repository
     ↓
Jenkins/GitLab CI
     ↓
Docker Build
     ↓
Container Registry
     ↓
Kubernetes/Docker Swarm
     ↓
Load Balancer
     ↓
Monitoring (Grafana/Prometheus)
```

**Technology Stack**:
- **Containerization**: Docker + Docker Compose
- **CI/CD**: Jenkins или GitLab CI/CD
- **Orchestration**: Kubernetes или Docker Swarm
- **Registry**: Docker Hub или private registry
- **Infrastructure**: Manual provisioning или Ansible
- **Monitoring**: Prometheus + Grafana integration
- **Storage**: Local volumes или basic persistent volumes

**Преимущества**:
- Simple setup и learning curve
- Good control over configuration
- Mature toolchain с extensive documentation
- Cost-effective для small teams
- Direct container management
- Easy debugging и troubleshooting

**Недостатки**:
- Manual infrastructure management
- Limited auto-scaling capabilities
- No advanced deployment strategies out-of-the-box
- Security scanning requires additional setup
- Infrastructure drift risks
- Limited disaster recovery automation

### Вариант 2: Cloud-Native Kubernetes Platform

**Описание**: Modern cloud-native подход с managed Kubernetes services, GitOps workflows и comprehensive automation.

**Архитектура компонентов**:
```
Git Repository (GitOps)
     ↓
GitHub Actions/GitLab CI
     ↓
Container Build & Security Scan
     ↓
Artifact Registry
     ↓
ArgoCD/Flux (GitOps)
     ↓
Managed Kubernetes (EKS/GKE/AKS)
     ↓
Istio Service Mesh
     ↓
Ingress Controller
     ↓
Applications + Monitoring
```

**Technology Stack**:
- **Containerization**: Docker + multi-stage builds
- **CI/CD**: GitHub Actions или GitLab CI с ArgoCD
- **Orchestration**: Managed Kubernetes (EKS/GKE/AKS)
- **GitOps**: ArgoCD или Flux для declarative deployments
- **Service Mesh**: Istio или Linkerd
- **Infrastructure**: Terraform + Cloud Provider APIs
- **Security**: Falco, Twistlock, container scanning
- **Storage**: Cloud-native storage solutions

**Преимущества**:
- Full automation с GitOps workflows
- Advanced deployment strategies (canary, blue-green)
- Built-in security scanning и compliance
- Auto-scaling и self-healing capabilities
- Service mesh для advanced networking
- Cloud provider integrations

**Недостатки**:
- Higher complexity и learning curve
- Vendor lock-in risks с managed services
- Higher costs для small deployments
- Requires cloud infrastructure expertise
- More moving parts to maintain

### Вариант 3: Hybrid Infrastructure with Edge Computing

**Описание**: Гибридный подход с on-premise infrastructure, cloud bursting и edge computing capabilities.

**Архитектура компонентов**:
```
Multi-Cloud Setup
├── On-Premise Kubernetes
├── Cloud Kubernetes (AWS/GCP/Azure)
└── Edge Locations
     ↓
Hybrid CI/CD Pipeline
     ↓
Multi-Registry Strategy
     ↓
Federation Control Plane
     ↓
Service Mesh (Cross-cluster)
     ↓
Global Load Balancing
     ↓
Distributed Monitoring
```

**Technology Stack**:
- **Multi-cluster**: Kubernetes Federation или Admiralty
- **CI/CD**: Tekton или comprehensive pipeline orchestration
- **Registry**: Multi-region container registries
- **Infrastructure**: Terraform + Crossplane для multi-cloud
- **Networking**: Submariner или similar для cross-cluster communication
- **Storage**: Distributed storage solutions (Rook/Ceph)
- **Monitoring**: Federated Prometheus with global view

**Преимущества**:
- Vendor independence и flexibility
- Global distribution capabilities
- Disaster recovery через geographic distribution
- Cost optimization через resource arbitrage
- Edge computing для improved latency
- Advanced compliance options

**Недостатки**:
- Highest complexity для setup и maintenance
- Networking challenges между environments
- Sophisticated monitoring и debugging requirements
- Higher operational overhead
- Requires expertise в multiple platforms
- Potential consistency challenges

## Анализ вариантов

### Критерии оценки:
1. **Setup Complexity** - initial deployment difficulty
2. **Operational Overhead** - daily maintenance requirements
3. **Scalability** - ability to handle growth
4. **Cost Efficiency** - total cost of ownership
5. **Security & Compliance** - built-in security features
6. **Developer Experience** - ease of development workflow

### Оценка вариантов:

| Критерий | Traditional | Cloud-Native K8s | Hybrid Multi-Cloud |
|----------|-------------|------------------|-------------------|
| **Setup Complexity** | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| **Operational Overhead** | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |
| **Scalability** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Cost Efficiency** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| **Security & Compliance** | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Developer Experience** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |

## Рекомендуемое решение

### **Выбор: Cloud-Native Kubernetes Platform с элементами Hybrid**

**Обоснование**:
1. **Modern DevOps Practices**: GitOps, declarative infrastructure, automation
2. **Scalability Requirements**: Need для rapid scaling based on user growth
3. **Security & Compliance**: Built-in security scanning и compliance tools
4. **Developer Productivity**: Streamlined workflows и reduced complexity
5. **Future-Proof**: Extensible architecture для future requirements
6. **Selective Hybrid**: Edge computing capabilities where needed

### DevOps Architecture Design:

```mermaid
graph TB
    subgraph "Development Workflow"
        Dev[Developer<br/>Local Development]
        Git[Git Repository<br/>Source Code + IaC]
        PR[Pull Request<br/>Code Review]
    end
    
    subgraph "CI Pipeline"
        Trigger[Webhook Trigger]
        Test[Automated Tests<br/>Unit + Integration]
        Build[Container Build<br/>Multi-stage Docker]
        Scan[Security Scan<br/>Vulnerability Assessment]
        Push[Push to Registry<br/>Artifact Repository]
    end
    
    subgraph "GitOps CD Pipeline"
        ArgoCD[ArgoCD<br/>GitOps Controller]
        Helm[Helm Charts<br/>Templating]
        Kustomize[Kustomize<br/>Environment Configs]
        Rollout[Progressive Rollout<br/>Canary/Blue-Green]
    end
    
    subgraph "Kubernetes Cluster"
        Ingress[Ingress Controller<br/>Load Balancing]
        ServiceMesh[Istio<br/>Service Mesh]
        Workloads[Application Pods<br/>Microservices]
        Storage[Persistent Volumes<br/>Database Storage]
    end
    
    subgraph "Infrastructure"
        IaC[Terraform<br/>Infrastructure as Code]
        Cloud[Cloud Provider<br/>AWS/GCP/Azure]
        Registry[Container Registry<br/>Harbor/ECR]
        Secrets[Secret Management<br/>Vault/K8s Secrets]
    end
    
    subgraph "Monitoring & Observability"
        Prometheus[Prometheus<br/>Metrics Collection]
        Grafana[Grafana<br/>Dashboards]
        Loki[Loki<br/>Log Aggregation]
        Jaeger[Jaeger<br/>Distributed Tracing]
        Alerts[AlertManager<br/>Incident Response]
    end
    
    Dev --> Git
    Git --> PR
    PR --> Trigger
    
    Trigger --> Test
    Test --> Build
    Build --> Scan
    Scan --> Push
    
    Push --> ArgoCD
    ArgoCD --> Helm
    Helm --> Kustomize
    Kustomize --> Rollout
    
    Rollout --> Ingress
    Ingress --> ServiceMesh
    ServiceMesh --> Workloads
    Workloads --> Storage
    
    IaC --> Cloud
    Cloud --> Registry
    Cloud --> Secrets
    
    Workloads --> Prometheus
    Prometheus --> Grafana
    Workloads --> Loki
    Workloads --> Jaeger
    Prometheus --> Alerts
    
    style Dev fill:#3b82f6,color:white
    style ArgoCD fill:#06b6d4,color:white
    style Workloads fill:#10b981,color:white
    style Prometheus fill:#f59e0b,color:white
    style IaC fill:#8b5cf6,color:white
```

## Implementation Guidelines

### 1. Container Strategy

**Multi-Stage Dockerfile для FastAPI Services**:
```dockerfile
# Base image with Python runtime
FROM python:3.11-slim as base

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Create app user
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Dependencies stage
FROM base as dependencies

# Copy requirements
COPY requirements.txt /tmp/requirements.txt

# Install Python dependencies
RUN pip install --no-cache-dir -r /tmp/requirements.txt

# Development stage
FROM dependencies as development

WORKDIR /app

# Copy source code
COPY . /app/

# Set ownership
RUN chown -R appuser:appuser /app

USER appuser

# Development command
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

# Production stage
FROM dependencies as production

# Create app directory
WORKDIR /app

# Copy only necessary files
COPY --from=dependencies /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY ./src /app/src
COPY ./alembic /app/alembic
COPY ./alembic.ini /app/alembic.ini
COPY ./requirements.txt /app/requirements.txt

# Set ownership
RUN chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Expose port
EXPOSE 8000

# Production command
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
```

**React App Dockerfile**:
```dockerfile
# Build stage
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine as production

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built app
COPY --from=build /app/dist /usr/share/nginx/html

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:80/health || exit 1

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

**Docker Compose для Local Development**:
```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: artel_billiards
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis Cache
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5

  # RabbitMQ Message Broker
  rabbitmq:
    image: rabbitmq:3-management-alpine
    environment:
      RABBITMQ_DEFAULT_USER: admin
      RABBITMQ_DEFAULT_PASS: admin
    ports:
      - "5672:5672"
      - "15672:15672"
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq
    healthcheck:
      test: ["CMD", "rabbitmq-diagnostics", "ping"]
      interval: 30s
      timeout: 10s
      retries: 5

  # Auth Service
  auth-service:
    build:
      context: ./fast-api-app
      dockerfile: Dockerfile
      target: development
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@postgres:5432/auth_db
      - REDIS_URL=redis://redis:6379/0
      - RABBITMQ_URL=amqp://admin:admin@rabbitmq:5672/
    ports:
      - "8001:8000"
    volumes:
      - ./fast-api-app:/app
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
      rabbitmq:
        condition: service_healthy
    develop:
      watch:
        - action: sync
          path: ./fast-api-app/src
          target: /app/src

  # Game Service
  game-service:
    build:
      context: ./fast-api-app
      dockerfile: Dockerfile
      target: development
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@postgres:5432/game_db
      - REDIS_URL=redis://redis:6379/1
      - RABBITMQ_URL=amqp://admin:admin@rabbitmq:5672/
    ports:
      - "8002:8000"
    volumes:
      - ./fast-api-app:/app
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
      rabbitmq:
        condition: service_healthy

  # React Frontend
  react-app:
    build:
      context: ./react-app
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    volumes:
      - ./react-app:/app
      - /app/node_modules
    environment:
      - REACT_APP_API_URL=http://localhost:8001
      - REACT_APP_WS_URL=ws://localhost:8002
    stdin_open: true
    tty: true

  # Monitoring Stack
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus:/etc/prometheus
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana
      - ./monitoring/grafana:/etc/grafana/provisioning

  loki:
    image: grafana/loki:latest
    ports:
      - "3100:3100"
    volumes:
      - ./monitoring/loki:/etc/loki
    command: -config.file=/etc/loki/local-config.yaml

volumes:
  postgres_data:
  redis_data:
  rabbitmq_data:
  prometheus_data:
  grafana_data:

networks:
  default:
    name: artel_network
```

### 2. CI/CD Pipeline Configuration

**GitHub Actions Workflow**:
```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: artel-billiards

jobs:
  # Code Quality & Testing
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        service: [auth-service, game-service, template-service, stats-service, friends-service]
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Cache Python dependencies
        uses: actions/cache@v3
        with:
          path: ~/.cache/pip
          key: ${{ runner.os }}-pip-${{ hashFiles('**/requirements.txt') }}
      
      - name: Install dependencies
        run: |
          cd fast-api-app
          pip install -r requirements.txt
          pip install -r requirements-dev.txt
      
      - name: Run linting
        run: |
          cd fast-api-app
          black --check .
          flake8 .
          mypy .
      
      - name: Run security scan
        run: |
          cd fast-api-app
          bandit -r src/
          safety check
      
      - name: Run tests
        run: |
          cd fast-api-app
          pytest tests/ -v --cov=src --cov-report=xml
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./fast-api-app/coverage.xml

  # Frontend Testing
  frontend-test:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: react-app/package-lock.json
      
      - name: Install dependencies
        run: |
          cd react-app
          npm ci
      
      - name: Run linting
        run: |
          cd react-app
          npm run lint
      
      - name: Run type checking
        run: |
          cd react-app
          npm run type-check
      
      - name: Run tests
        run: |
          cd react-app
          npm run test -- --coverage --watchAll=false
      
      - name: Run E2E tests
        run: |
          cd react-app
          npm run e2e:ci

  # Security Scanning
  security:
    runs-on: ubuntu-latest
    needs: [test, frontend-test]
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          format: 'sarif'
          output: 'trivy-results.sarif'
      
      - name: Upload Trivy scan results
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-results.sarif'

  # Build & Push Container Images
  build:
    runs-on: ubuntu-latest
    needs: [test, frontend-test, security]
    if: github.event_name == 'push'
    
    strategy:
      matrix:
        component:
          - name: auth-service
            context: ./fast-api-app
            dockerfile: ./fast-api-app/Dockerfile
          - name: game-service
            context: ./fast-api-app
            dockerfile: ./fast-api-app/Dockerfile
          - name: react-app
            context: ./react-app
            dockerfile: ./react-app/Dockerfile
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      
      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/${{ matrix.component.name }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=sha,prefix=sha-
            type=raw,value=latest,enable={{is_default_branch}}
      
      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: ${{ matrix.component.context }}
          file: ${{ matrix.component.dockerfile }}
          target: production
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
      
      - name: Run container security scan
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/${{ matrix.component.name }}:latest
          format: 'table'
          exit-code: '1'
          severity: 'CRITICAL,HIGH'

  # Deploy to Staging
  deploy-staging:
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/develop'
    environment: staging
    
    steps:
      - name: Checkout GitOps repository
        uses: actions/checkout@v4
        with:
          repository: artel-billiards/gitops-config
          token: ${{ secrets.GITOPS_TOKEN }}
          path: gitops
      
      - name: Update staging manifests
        run: |
          cd gitops/environments/staging
          
          # Update image tags in Kustomization
          sed -i "s|newTag:.*|newTag: sha-${{ github.sha }}|g" kustomization.yaml
          
          # Commit changes
          git config user.name "GitHub Actions"
          git config user.email "actions@github.com"
          git add .
          git commit -m "Update staging to ${{ github.sha }}"
          git push

  # Deploy to Production
  deploy-production:
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main'
    environment: production
    
    steps:
      - name: Checkout GitOps repository
        uses: actions/checkout@v4
        with:
          repository: artel-billiards/gitops-config
          token: ${{ secrets.GITOPS_TOKEN }}
          path: gitops
      
      - name: Update production manifests
        run: |
          cd gitops/environments/production
          
          # Update image tags in Kustomization
          sed -i "s|newTag:.*|newTag: sha-${{ github.sha }}|g" kustomization.yaml
          
          # Commit changes
          git config user.name "GitHub Actions"
          git config user.email "actions@github.com"
          git add .
          git commit -m "Deploy to production: ${{ github.sha }}"
          git push

  # Database Migrations
  migrate:
    runs-on: ubuntu-latest
    needs: deploy-staging
    if: github.ref == 'refs/heads/develop'
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Run database migrations
        run: |
          # This would typically connect to staging database
          # and run Alembic migrations
          echo "Running database migrations..."
          # kubectl exec -n staging deployment/auth-service -- alembic upgrade head
```

### 3. Kubernetes Manifests

**Helm Chart для Auth Service**:
```yaml
# helm/auth-service/Chart.yaml
apiVersion: v2
name: auth-service
description: ArtelBilliards Authentication Service
type: application
version: 0.1.0
appVersion: "1.0.0"

dependencies:
  - name: postgresql
    version: 12.x.x
    repository: https://charts.bitnami.com/bitnami
    condition: postgresql.enabled
  - name: redis
    version: 17.x.x
    repository: https://charts.bitnami.com/bitnami
    condition: redis.enabled
```

**Values файл**:
```yaml
# helm/auth-service/values.yaml
replicaCount: 3

image:
  repository: ghcr.io/artel-billiards/auth-service
  pullPolicy: IfNotPresent
  tag: "latest"

service:
  type: ClusterIP
  port: 80
  targetPort: 8000

ingress:
  enabled: true
  className: "nginx"
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
  hosts:
    - host: api.artelbilliards.com
      paths:
        - path: /auth
          pathType: Prefix
  tls:
    - secretName: artel-tls
      hosts:
        - api.artelbilliards.com

resources:
  limits:
    cpu: 500m
    memory: 512Mi
  requests:
    cpu: 250m
    memory: 256Mi

autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 10
  targetCPUUtilizationPercentage: 70
  targetMemoryUtilizationPercentage: 80

postgresql:
  enabled: true
  auth:
    existingSecret: "postgres-secret"
  primary:
    persistence:
      enabled: true
      size: 20Gi
      storageClass: "gp2"

redis:
  enabled: true
  auth:
    existingSecret: "redis-secret"
  master:
    persistence:
      enabled: true
      size: 8Gi

env:
  - name: DATABASE_URL
    valueFrom:
      secretKeyRef:
        name: auth-service-secret
        key: database-url
  - name: REDIS_URL
    valueFrom:
      secretKeyRef:
        name: auth-service-secret
        key: redis-url
  - name: JWT_SECRET
    valueFrom:
      secretKeyRef:
        name: auth-service-secret
        key: jwt-secret

livenessProbe:
  httpGet:
    path: /health/live
    port: 8000
  initialDelaySeconds: 30
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /health/ready
    port: 8000
  initialDelaySeconds: 5
  periodSeconds: 5

podSecurityContext:
  fsGroup: 1000
  runAsNonRoot: true
  runAsUser: 1000

securityContext:
  allowPrivilegeEscalation: false
  capabilities:
    drop:
    - ALL
  readOnlyRootFilesystem: true
  runAsNonRoot: true
  runAsUser: 1000

nodeSelector: {}

tolerations: []

affinity:
  podAntiAffinity:
    preferredDuringSchedulingIgnoredDuringExecution:
    - weight: 100
      podAffinityTerm:
        labelSelector:
          matchExpressions:
          - key: app.kubernetes.io/name
            operator: In
            values:
            - auth-service
        topologyKey: kubernetes.io/hostname
```

**Deployment Template**:
```yaml
# helm/auth-service/templates/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "auth-service.fullname" . }}
  labels:
    {{- include "auth-service.labels" . | nindent 4 }}
spec:
  {{- if not .Values.autoscaling.enabled }}
  replicas: {{ .Values.replicaCount }}
  {{- end }}
  selector:
    matchLabels:
      {{- include "auth-service.selectorLabels" . | nindent 6 }}
  template:
    metadata:
      annotations:
        checksum/config: {{ include (print $.Template.BasePath "/configmap.yaml") . | sha256sum }}
        prometheus.io/scrape: "true"
        prometheus.io/port: "8000"
        prometheus.io/path: "/metrics"
      labels:
        {{- include "auth-service.selectorLabels" . | nindent 8 }}
    spec:
      {{- with .Values.imagePullSecrets }}
      imagePullSecrets:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      serviceAccountName: {{ include "auth-service.serviceAccountName" . }}
      securityContext:
        {{- toYaml .Values.podSecurityContext | nindent 8 }}
      containers:
        - name: {{ .Chart.Name }}
          securityContext:
            {{- toYaml .Values.securityContext | nindent 12 }}
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag | default .Chart.AppVersion }}"
          imagePullPolicy: {{ .Values.image.pullPolicy }}
          ports:
            - name: http
              containerPort: 8000
              protocol: TCP
          livenessProbe:
            {{- toYaml .Values.livenessProbe | nindent 12 }}
          readinessProbe:
            {{- toYaml .Values.readinessProbe | nindent 12 }}
          resources:
            {{- toYaml .Values.resources | nindent 12 }}
          env:
            {{- toYaml .Values.env | nindent 12 }}
          volumeMounts:
            - name: tmp
              mountPath: /tmp
            - name: var-cache
              mountPath: /var/cache
      volumes:
        - name: tmp
          emptyDir: {}
        - name: var-cache
          emptyDir: {}
      {{- with .Values.nodeSelector }}
      nodeSelector:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      {{- with .Values.affinity }}
      affinity:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      {{- with .Values.tolerations }}
      tolerations:
        {{- toYaml . | nindent 8 }}
      {{- end }}
```

### 4. Infrastructure as Code

**Terraform Configuration для AWS EKS**:
```hcl
# terraform/main.tf
terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.20"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.10"
    }
  }
  
  backend "s3" {
    bucket  = "artel-billiards-terraform-state"
    key     = "infrastructure/terraform.tfstate"
    region  = "us-west-2"
    encrypt = true
  }
}

provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Project     = "ArtelBilliards"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# VPC Configuration
module "vpc" {
  source = "terraform-aws-modules/vpc/aws"
  
  name = "${var.project_name}-${var.environment}-vpc"
  cidr = var.vpc_cidr
  
  azs             = var.availability_zones
  private_subnets = var.private_subnet_cidrs
  public_subnets  = var.public_subnet_cidrs
  
  enable_nat_gateway = true
  enable_vpn_gateway = false
  
  enable_dns_hostnames = true
  enable_dns_support   = true
  
  tags = {
    "kubernetes.io/cluster/${var.cluster_name}" = "shared"
  }
  
  public_subnet_tags = {
    "kubernetes.io/cluster/${var.cluster_name}" = "shared"
    "kubernetes.io/role/elb"                    = "1"
  }
  
  private_subnet_tags = {
    "kubernetes.io/cluster/${var.cluster_name}" = "shared"
    "kubernetes.io/role/internal-elb"           = "1"
  }
}

# EKS Cluster
module "eks" {
  source = "terraform-aws-modules/eks/aws"
  
  cluster_name    = var.cluster_name
  cluster_version = var.kubernetes_version
  
  vpc_id                         = module.vpc.vpc_id
  subnet_ids                     = module.vpc.private_subnets
  cluster_endpoint_public_access = true
  
  cluster_addons = {
    coredns = {
      most_recent = true
    }
    kube-proxy = {
      most_recent = true
    }
    vpc-cni = {
      most_recent = true
    }
    aws-ebs-csi-driver = {
      most_recent = true
    }
  }
  
  eks_managed_node_groups = {
    main = {
      min_size     = 2
      max_size     = 10
      desired_size = 3
      
      instance_types = ["t3.medium"]
      capacity_type  = "ON_DEMAND"
      
      labels = {
        Environment = var.environment
        NodeGroup   = "main"
      }
    }
    
    spot = {
      min_size     = 0
      max_size     = 5
      desired_size = 2
      
      instance_types = ["t3.medium", "t3.large"]
      capacity_type  = "SPOT"
      
      labels = {
        Environment = var.environment
        NodeGroup   = "spot"
      }
      
      taints = {
        spot = {
          key    = "spot"
          value  = "true"
          effect = "NO_SCHEDULE"
        }
      }
    }
  }
  
  node_security_group_tags = {
    "kubernetes.io/cluster/${var.cluster_name}" = null
  }
}

# RDS PostgreSQL
resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-${var.environment}-db-subnet-group"
  subnet_ids = module.vpc.private_subnets
  
  tags = {
    Name = "${var.project_name}-${var.environment}-db-subnet-group"
  }
}

resource "aws_security_group" "rds" {
  name_prefix = "${var.project_name}-${var.environment}-rds-"
  vpc_id      = module.vpc.vpc_id
  
  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_db_instance" "main" {
  identifier = "${var.project_name}-${var.environment}-db"
  
  allocated_storage     = 20
  max_allocated_storage = 100
  storage_type          = "gp2"
  storage_encrypted     = true
  
  engine         = "postgres"
  engine_version = "15.4"
  instance_class = "db.t3.micro"
  
  db_name  = "artelbilliards"
  username = "postgres"
  password = var.db_password
  
  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name
  
  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"
  
  skip_final_snapshot = var.environment != "production"
  deletion_protection = var.environment == "production"
  
  performance_insights_enabled = true
  monitoring_interval         = 60
  
  tags = {
    Name = "${var.project_name}-${var.environment}-db"
  }
}

# ElastiCache Redis
resource "aws_elasticache_subnet_group" "main" {
  name       = "${var.project_name}-${var.environment}-cache-subnet"
  subnet_ids = module.vpc.private_subnets
}

resource "aws_security_group" "redis" {
  name_prefix = "${var.project_name}-${var.environment}-redis-"
  vpc_id      = module.vpc.vpc_id
  
  ingress {
    from_port   = 6379
    to_port     = 6379
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
  }
}

resource "aws_elasticache_replication_group" "main" {
  replication_group_id       = "${var.project_name}-${var.environment}-redis"
  description                = "Redis cluster for ${var.project_name} ${var.environment}"
  
  node_type                  = "cache.t3.micro"
  port                       = 6379
  parameter_group_name       = "default.redis7"
  
  num_cache_clusters         = 2
  automatic_failover_enabled = true
  multi_az_enabled          = true
  
  subnet_group_name = aws_elasticache_subnet_group.main.name
  security_group_ids = [aws_security_group.redis.id]
  
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  
  log_delivery_configuration {
    destination      = aws_cloudwatch_log_group.redis.name
    destination_type = "cloudwatch-logs"
    log_format       = "text"
    log_type         = "slow-log"
  }
}

resource "aws_cloudwatch_log_group" "redis" {
  name              = "/aws/elasticache/${var.project_name}-${var.environment}"
  retention_in_days = 7
}

# Application Load Balancer
resource "aws_lb" "main" {
  name               = "${var.project_name}-${var.environment}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = module.vpc.public_subnets
  
  enable_deletion_protection = var.environment == "production"
  
  access_logs {
    bucket  = aws_s3_bucket.alb_logs.id
    prefix  = "alb-logs"
    enabled = true
  }
}

resource "aws_security_group" "alb" {
  name_prefix = "${var.project_name}-${var.environment}-alb-"
  vpc_id      = module.vpc.vpc_id
  
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# S3 Bucket for ALB Logs
resource "aws_s3_bucket" "alb_logs" {
  bucket        = "${var.project_name}-${var.environment}-alb-logs"
  force_destroy = var.environment != "production"
}

resource "aws_s3_bucket_lifecycle_configuration" "alb_logs" {
  bucket = aws_s3_bucket.alb_logs.id
  
  rule {
    id     = "delete_old_logs"
    status = "Enabled"
    
    expiration {
      days = 30
    }
  }
}
```

**Variables файл**:
```hcl
# terraform/variables.tf
variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-west-2"
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "artel-billiards"
}

variable "cluster_name" {
  description = "EKS cluster name"
  type        = string
}

variable "kubernetes_version" {
  description = "Kubernetes version"
  type        = string
  default     = "1.28"
}

variable "vpc_cidr" {
  description = "VPC CIDR block"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "Availability zones"
  type        = list(string)
  default     = ["us-west-2a", "us-west-2b", "us-west-2c"]
}

variable "private_subnet_cidrs" {
  description = "Private subnet CIDR blocks"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
}

variable "public_subnet_cidrs" {
  description = "Public subnet CIDR blocks"
  type        = list(string)
  default     = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}
```

### 5. GitOps Configuration

**ArgoCD Application Definition**:
```yaml
# gitops/applications/auth-service.yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: auth-service-staging
  namespace: argocd
  finalizers:
    - resources-finalizer.argocd.argoproj.io
spec:
  project: artel-billiards
  source:
    repoURL: https://github.com/artel-billiards/gitops-config
    targetRevision: HEAD
    path: environments/staging/auth-service
  destination:
    server: https://kubernetes.default.svc
    namespace: staging
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
      allowEmpty: false
    syncOptions:
      - CreateNamespace=true
      - PrunePropagationPolicy=foreground
      - PruneLast=true
    retry:
      limit: 5
      backoff:
        duration: 5s
        factor: 2
        maxDuration: 3m
```

**Kustomization для Environment-specific Configs**:
```yaml
# gitops/environments/staging/kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

namespace: staging

resources:
  - ../../base/auth-service
  - ../../base/game-service
  - ../../base/template-service
  - ../../base/stats-service
  - ../../base/friends-service
  - ../../base/react-app

images:
  - name: ghcr.io/artel-billiards/auth-service
    newTag: sha-abc123
  - name: ghcr.io/artel-billiards/game-service
    newTag: sha-abc123
  - name: ghcr.io/artel-billiards/react-app
    newTag: sha-abc123

patchesStrategicMerge:
  - auth-service-patch.yaml
  - game-service-patch.yaml

configMapGenerator:
  - name: app-config
    literals:
      - ENVIRONMENT=staging
      - LOG_LEVEL=debug
      - ENABLE_METRICS=true

secretGenerator:
  - name: app-secrets
    envs:
      - secrets.env

replicas:
  - name: auth-service
    count: 2
  - name: game-service
    count: 2
```

**Environment-specific Patches**:
```yaml
# gitops/environments/staging/auth-service-patch.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: auth-service
spec:
  template:
    spec:
      containers:
        - name: auth-service
          resources:
            requests:
              memory: "128Mi"
              cpu: "100m"
            limits:
              memory: "256Mi"
              cpu: "250m"
          env:
            - name: ENVIRONMENT
              value: "staging"
            - name: DEBUG
              value: "true"
```

### 6. Service Mesh Implementation

**Istio Configuration**:
```yaml
# istio/gateway.yaml
apiVersion: networking.istio.io/v1beta1
kind: Gateway
metadata:
  name: artel-gateway
  namespace: istio-system
spec:
  selector:
    istio: ingressgateway
  servers:
    - port:
        number: 80
        name: http
        protocol: HTTP
      hosts:
        - api.artelbilliards.com
        - app.artelbilliards.com
      tls:
        httpsRedirect: true
    - port:
        number: 443
        name: https
        protocol: HTTPS
      tls:
        mode: SIMPLE
        credentialName: artel-tls
      hosts:
        - api.artelbilliards.com
        - app.artelbilliards.com

---
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: artel-api
  namespace: production
spec:
  hosts:
    - api.artelbilliards.com
  gateways:
    - istio-system/artel-gateway
  http:
    - match:
        - uri:
            prefix: /auth
      route:
        - destination:
            host: auth-service
            port:
              number: 80
          weight: 100
      fault:
        delay:
          percentage:
            value: 0.1
          fixedDelay: 5s
      retries:
        attempts: 3
        perTryTimeout: 2s
    
    - match:
        - uri:
            prefix: /game
      route:
        - destination:
            host: game-service
            port:
              number: 80
          weight: 90
        - destination:
            host: game-service-canary
            port:
              number: 80
          weight: 10
      timeout: 30s
    
    - match:
        - uri:
            prefix: /
      route:
        - destination:
            host: react-app
            port:
              number: 80

---
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  name: auth-service
  namespace: production
spec:
  host: auth-service
  trafficPolicy:
    circuitBreaker:
      consecutiveErrors: 3
      interval: 30s
      baseEjectionTime: 30s
      maxEjectionPercent: 50
    loadBalancer:
      simple: LEAST_CONN
    connectionPool:
      tcp:
        maxConnections: 100
      http:
        http1MaxPendingRequests: 50
        maxRequestsPerConnection: 10
  subsets:
    - name: v1
      labels:
        version: v1
    - name: v2
      labels:
        version: v2
```

**Security Policies**:
```yaml
# istio/security-policy.yaml
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: default
  namespace: production
spec:
  mtls:
    mode: STRICT

---
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
  name: auth-service-policy
  namespace: production
spec:
  selector:
    matchLabels:
      app: auth-service
  rules:
    - from:
        - source:
            principals: ["cluster.local/ns/production/sa/frontend-service"]
        - source:
            principals: ["cluster.local/ns/production/sa/game-service"]
      to:
        - operation:
            methods: ["GET", "POST"]
            paths: ["/auth/*", "/users/*"]
    - from:
        - source:
            namespaces: ["istio-system"]
      to:
        - operation:
            methods: ["GET"]
            paths: ["/health/*", "/metrics"]

---
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
  name: deny-all
  namespace: production
spec:
  selector:
    matchLabels:
      app: auth-service
  action: DENY
  rules:
    - from:
        - source:
            notPrincipals: ["cluster.local/ns/production/sa/*"]
```

### 7. Security & Secrets Management

**External Secrets Operator Configuration**:
```yaml
# security/external-secrets.yaml
apiVersion: external-secrets.io/v1beta1
kind: SecretStore
metadata:
  name: vault-backend
  namespace: production
spec:
  provider:
    vault:
      server: "https://vault.company.com"
      path: "kv"
      version: "v2"
      auth:
        kubernetes:
          mountPath: "kubernetes"
          role: "artel-billiards-production"
          serviceAccountRef:
            name: "external-secrets-sa"

---
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: auth-service-secrets
  namespace: production
spec:
  refreshInterval: 15s
  secretStoreRef:
    name: vault-backend
    kind: SecretStore
  target:
    name: auth-service-secret
    creationPolicy: Owner
    template:
      type: Opaque
      data:
        database-url: "postgresql://{{ .username }}:{{ .password }}@{{ .host }}:5432/{{ .database }}"
        jwt-secret: "{{ .jwt_secret }}"
        redis-url: "redis://{{ .redis_password }}@{{ .redis_host }}:6379/0"
  data:
    - secretKey: username
      remoteRef:
        key: database/auth-service
        property: username
    - secretKey: password
      remoteRef:
        key: database/auth-service
        property: password
    - secretKey: host
      remoteRef:
        key: database/auth-service
        property: host
    - secretKey: database
      remoteRef:
        key: database/auth-service
        property: database
    - secretKey: jwt_secret
      remoteRef:
        key: auth/jwt
        property: secret
    - secretKey: redis_password
      remoteRef:
        key: cache/redis
        property: password
    - secretKey: redis_host
      remoteRef:
        key: cache/redis
        property: host
```

**Pod Security Standards**:
```yaml
# security/pod-security-policy.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: production
  labels:
    pod-security.kubernetes.io/enforce: restricted
    pod-security.kubernetes.io/audit: restricted
    pod-security.kubernetes.io/warn: restricted

---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: deny-all
  namespace: production
spec:
  podSelector: {}
  policyTypes:
    - Ingress
    - Egress

---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-auth-service
  namespace: production
spec:
  podSelector:
    matchLabels:
      app: auth-service
  policyTypes:
    - Ingress
    - Egress
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app: game-service
        - podSelector:
            matchLabels:
              app: react-app
        - namespaceSelector:
            matchLabels:
              name: istio-system
      ports:
        - protocol: TCP
          port: 8000
  egress:
    - to:
        - podSelector:
            matchLabels:
              app: postgres
      ports:
        - protocol: TCP
          port: 5432
    - to:
        - podSelector:
            matchLabels:
              app: redis
      ports:
        - protocol: TCP
          port: 6379
    - to: []
      ports:
        - protocol: TCP
          port: 53
        - protocol: UDP
          port: 53
```

**RBAC Configuration**:
```yaml
# security/rbac.yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: auth-service
  namespace: production
  labels:
    app: auth-service
automountServiceAccountToken: true

---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: production
  name: auth-service-role
rules:
  - apiGroups: [""]
    resources: ["secrets", "configmaps"]
    verbs: ["get", "list"]
  - apiGroups: [""]
    resources: ["pods"]
    verbs: ["get", "list"]

---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: auth-service-rolebinding
  namespace: production
subjects:
  - kind: ServiceAccount
    name: auth-service
    namespace: production
roleRef:
  kind: Role
  name: auth-service-role
  apiGroup: rbac.authorization.k8s.io
```

### 8. Backup & Disaster Recovery

**Velero Backup Configuration**:
```yaml
# backup/velero-backup.yaml
apiVersion: velero.io/v1
kind: Schedule
metadata:
  name: daily-backup
  namespace: velero
spec:
  schedule: "0 2 * * *"  # Daily at 2 AM
  template:
    ttl: "720h"  # 30 days
    includedNamespaces:
      - production
      - staging
    excludedResources:
      - events
      - events.events.k8s.io
      - backups.velero.io
      - restores.velero.io
    snapshotVolumes: true
    storageLocation: default
    volumeSnapshotLocations:
      - default

---
apiVersion: velero.io/v1
kind: Schedule
metadata:
  name: weekly-backup
  namespace: velero
spec:
  schedule: "0 3 * * 0"  # Weekly on Sunday at 3 AM
  template:
    ttl: "2160h"  # 90 days
    includeClusterResources: true
    includedNamespaces:
      - production
    snapshotVolumes: true
    storageLocation: default

---
apiVersion: velero.io/v1
kind: BackupStorageLocation
metadata:
  name: default
  namespace: velero
spec:
  provider: aws
  objectStorage:
    bucket: artel-billiards-backups
    prefix: velero
  config:
    region: us-west-2
    s3ForcePathStyle: "false"
```

**Database Backup Scripts**:
```bash
#!/bin/bash
# scripts/backup-database.sh

set -e

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
S3_BUCKET="artel-billiards-db-backups"

# Create backup directory
mkdir -p ${BACKUP_DIR}

# Function to backup a database
backup_database() {
    local db_name=$1
    local backup_file="${BACKUP_DIR}/${db_name}_${TIMESTAMP}.sql"
    
    echo "Creating backup for database: ${db_name}"
    
    pg_dump \
        --host=${DB_HOST} \
        --port=${DB_PORT} \
        --username=${DB_USER} \
        --dbname=${db_name} \
        --no-password \
        --verbose \
        --clean \
        --if-exists \
        --create \
        --format=custom \
        --file=${backup_file}
    
    # Compress backup
    gzip ${backup_file}
    
    # Upload to S3
    aws s3 cp ${backup_file}.gz s3://${S3_BUCKET}/${db_name}/
    
    # Keep only last 7 days locally
    find ${BACKUP_DIR} -name "${db_name}_*.sql.gz" -mtime +7 -delete
    
    echo "Backup completed: ${backup_file}.gz"
}

# Backup all databases
backup_database "auth_db"
backup_database "game_db"
backup_database "template_db"
backup_database "stats_db"
backup_database "friends_db"

# Cleanup old S3 backups (keep 30 days)
aws s3api list-objects-v2 \
    --bucket ${S3_BUCKET} \
    --query 'Contents[?LastModified<=`'$(date -d '30 days ago' --iso-8601)'`].[Key]' \
    --output text | xargs -I {} aws s3 rm s3://${S3_BUCKET}/{}

echo "All database backups completed successfully"
```

**Disaster Recovery Plan**:
```yaml
# disaster-recovery/restore-procedure.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: disaster-recovery-procedure
  namespace: production
data:
  restore-procedure.md: |
    # Disaster Recovery Procedure
    
    ## 1. Assessment Phase (5-10 minutes)
    - [ ] Identify scope of outage
    - [ ] Determine root cause
    - [ ] Estimate recovery time
    - [ ] Notify stakeholders
    
    ## 2. Database Recovery
    ```bash
    # Restore from latest backup
    kubectl create job manual-db-restore --from=cronjob/db-backup
    
    # Verify data integrity
    kubectl exec -it deployment/auth-service -- python -m scripts.verify_db
    ```
    
    ## 3. Application Recovery
    ```bash
    # Restore from Velero backup
    velero restore create --from-backup daily-backup-20231201
    
    # Scale up services
    kubectl scale deployment auth-service --replicas=3
    kubectl scale deployment game-service --replicas=3
    ```
    
    ## 4. Verification
    - [ ] Health checks passing
    - [ ] Database connectivity
    - [ ] API functionality
    - [ ] User authentication
    - [ ] Real-time features
    
    ## 5. Post-Recovery
    - [ ] Monitor for issues
    - [ ] Update stakeholders
    - [ ] Document lessons learned
    - [ ] Review and update procedures
```

### 9. Monitoring Integration

**Prometheus ServiceMonitor**:
```yaml
# monitoring/service-monitor.yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: artel-billiards-apps
  namespace: production
  labels:
    app: artel-billiards
spec:
  selector:
    matchLabels:
      monitoring: enabled
  endpoints:
    - port: http
      path: /metrics
      interval: 30s
      scrapeTimeout: 10s
    - port: http
      path: /health
      interval: 10s
      scrapeTimeout: 5s

---
apiVersion: v1
kind: Service
metadata:
  name: auth-service
  namespace: production
  labels:
    app: auth-service
    monitoring: enabled
spec:
  selector:
    app: auth-service
  ports:
    - name: http
      port: 80
      targetPort: 8000
```

**Grafana Dashboard ConfigMap**:
```yaml
# monitoring/grafana-dashboard.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: kubernetes-dashboard
  namespace: monitoring
  labels:
    grafana_dashboard: "1"
data:
  kubernetes-dashboard.json: |
    {
      "dashboard": {
        "title": "ArtelBilliards Kubernetes Overview",
        "panels": [
          {
            "title": "Pod Status",
            "type": "stat",
            "targets": [
              {
                "expr": "kube_pod_status_phase{namespace=~\"production|staging\"}"
              }
            ]
          },
          {
            "title": "CPU Usage by Pod",
            "type": "graph",
            "targets": [
              {
                "expr": "rate(container_cpu_usage_seconds_total{namespace=~\"production|staging\"}[5m])"
              }
            ]
          },
          {
            "title": "Memory Usage by Pod",
            "type": "graph",
            "targets": [
              {
                "expr": "container_memory_usage_bytes{namespace=~\"production|staging\"}"
              }
            ]
          }
        ]
      }
    }
```

### 10. Cost Optimization

**Vertical Pod Autoscaler**:
```yaml
# optimization/vpa.yaml
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: auth-service-vpa
  namespace: production
spec:
  targetRef:
    apiVersion: "apps/v1"
    kind: Deployment
    name: auth-service
  updatePolicy:
    updateMode: "Auto"
  resourcePolicy:
    containerPolicies:
      - containerName: auth-service
        minAllowed:
          cpu: 100m
          memory: 128Mi
        maxAllowed:
          cpu: 500m
          memory: 512Mi
        controlledResources: ["cpu", "memory"]
        controlledValues: RequestsAndLimits

---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: auth-service-hpa
  namespace: production
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: auth-service
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
        - type: Percent
          value: 10
          periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
        - type: Percent
          value: 50
          periodSeconds: 60
```

**Resource Quotas**:
```yaml
# optimization/resource-quotas.yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: production-quota
  namespace: production
spec:
  hard:
    requests.cpu: "4"
    requests.memory: 8Gi
    limits.cpu: "8"
    limits.memory: 16Gi
    persistentvolumeclaims: "10"
    pods: "50"
    services: "20"

---
apiVersion: v1
kind: LimitRange
metadata:
  name: production-limits
  namespace: production
spec:
  limits:
    - default:
        cpu: "500m"
        memory: "512Mi"
      defaultRequest:
        cpu: "100m"
        memory: "128Mi"
      type: Container
    - max:
        cpu: "2"
        memory: "2Gi"
      min:
        cpu: "50m"
        memory: "64Mi"
      type: Container
```

### 11. Deployment Strategies

**Canary Deployment с Argo Rollouts**:
```yaml
# deployment/canary-rollout.yaml
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: game-service-rollout
  namespace: production
spec:
  replicas: 5
  strategy:
    canary:
      canaryService: game-service-canary
      stableService: game-service-stable
      trafficRouting:
        istio:
          virtualService:
            name: game-service-vs
            routes:
              - primary
          destinationRule:
            name: game-service-dr
            canarySubsetName: canary
            stableSubsetName: stable
      steps:
        - setWeight: 10
        - pause: {duration: 2m}
        - setWeight: 20
        - pause: {duration: 5m}
        - analysis:
            templates:
              - templateName: success-rate
            args:
              - name: service-name
                value: game-service
        - setWeight: 50
        - pause: {duration: 10m}
        - setWeight: 80
        - pause: {duration: 5m}
  selector:
    matchLabels:
      app: game-service
  template:
    metadata:
      labels:
        app: game-service
    spec:
      containers:
        - name: game-service
          image: ghcr.io/artel-billiards/game-service:latest
          ports:
            - containerPort: 8000
          resources:
            requests:
              memory: 256Mi
              cpu: 250m
            limits:
              memory: 512Mi
              cpu: 500m

---
apiVersion: argoproj.io/v1alpha1
kind: AnalysisTemplate
metadata:
  name: success-rate
  namespace: production
spec:
  args:
    - name: service-name
  metrics:
    - name: success-rate
      interval: 2m
      successCondition: result[0] >= 0.95
      failureLimit: 3
      provider:
        prometheus:
          address: http://prometheus.monitoring.svc.cluster.local:9090
          query: |
            sum(rate(http_requests_total{service="{{args.service-name}}",status!~"5.."}[5m])) /
            sum(rate(http_requests_total{service="{{args.service-name}}"}[5m]))
    - name: avg-response-time
      interval: 2m
      successCondition: result[0] <= 500
      failureLimit: 3
      provider:
        prometheus:
          address: http://prometheus.monitoring.svc.cluster.local:9090
          query: |
            histogram_quantile(0.95,
              sum(rate(http_request_duration_seconds_bucket{service="{{args.service-name}}"}[5m])) by (le)
            ) * 1000
```

**Blue-Green Deployment**:
```yaml
# deployment/blue-green.yaml
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: auth-service-rollout
  namespace: production
spec:
  replicas: 3
  strategy:
    blueGreen:
      activeService: auth-service-active
      previewService: auth-service-preview
      autoPromotionEnabled: false
      scaleDownDelaySeconds: 30
      prePromotionAnalysis:
        templates:
          - templateName: auth-service-health
        args:
          - name: service-name
            value: auth-service-preview
      postPromotionAnalysis:
        templates:
          - templateName: auth-service-health
        args:
          - name: service-name
            value: auth-service-active
  selector:
    matchLabels:
      app: auth-service
  template:
    metadata:
      labels:
        app: auth-service
    spec:
      containers:
        - name: auth-service
          image: ghcr.io/artel-billiards/auth-service:latest
          ports:
            - containerPort: 8000

---
apiVersion: v1
kind: Service
metadata:
  name: auth-service-active
  namespace: production
spec:
  selector:
    app: auth-service
  ports:
    - port: 80
      targetPort: 8000

---
apiVersion: v1
kind: Service
metadata:
  name: auth-service-preview
  namespace: production
spec:
  selector:
    app: auth-service
  ports:
    - port: 80
      targetPort: 8000
```

## Verification Checkpoint

### DevOps Infrastructure Verification:

✅ **Container Strategy**:
- Multi-stage Dockerfiles для optimized images
- Security-focused container configuration
- Health checks и non-root user setup
- Development и production targets

✅ **CI/CD Pipeline**:
- Comprehensive GitHub Actions workflow
- Automated testing (unit, integration, E2E, security)
- Container building и vulnerability scanning
- GitOps-based deployment automation

✅ **Kubernetes Orchestration**:
- Helm charts для templated deployments
- Environment-specific configurations с Kustomize
- Resource management и auto-scaling
- Security policies и RBAC

✅ **Infrastructure as Code**:
- Terraform для cloud resource provisioning
- VPC, EKS, RDS, ElastiCache automation
- Security groups и network policies
- Cost-optimized resource configuration

✅ **GitOps Implementation**:
- ArgoCD для declarative deployments
- Environment promotion workflows
- Automated rollback capabilities
- Configuration drift detection

✅ **Service Mesh Integration**:
- Istio для secure service communication
- Traffic routing и load balancing
- Circuit breaker patterns
- mTLS encryption

✅ **Security & Compliance**:
- External Secrets для credential management
- Pod Security Standards enforcement
- Network policies for micro-segmentation
- RBAC и service account management

✅ **Backup & Disaster Recovery**:
- Velero для cluster backup/restore
- Database backup automation
- Multi-tier retention policies
- Documented recovery procedures

✅ **Monitoring Integration**:
- Prometheus ServiceMonitor configuration
- Grafana dashboard automation
- Alert routing integration
- Business metrics tracking

✅ **Cost Optimization**:
- Vertical и Horizontal Pod Autoscaling
- Resource quotas и limits
- Spot instance utilization
- Automated resource rightsizing

✅ **Deployment Strategies**:
- Canary deployments с Argo Rollouts
- Blue-green deployment patterns
- Automated rollback triggers
- Performance-based promotion criteria

✅ **Operational Excellence**:
- Comprehensive health checks
- Troubleshooting documentation
- Runbook automation
- Performance monitoring

🎨🎨🎨 **EXITING CREATIVE PHASE: DOCKER & DEVOPS INFRASTRUCTURE** 🎨🎨🎨