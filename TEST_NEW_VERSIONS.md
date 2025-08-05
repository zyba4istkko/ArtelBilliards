# 🧪 Testing Plan for Python 3.13 + PostgreSQL 17

## ⚠️ CRITICAL: Test Before Using in Production!

### 🚨 **Phase 1: Quick Compatibility Check**

```bash
# 1. Test PostgreSQL 17 startup
docker-compose -f docker-compose.base.yml up postgres
# Expected: Container starts without errors

# 2. Check PostgreSQL version
docker exec artel_postgres psql -U postgres -c "SELECT version();"
# Expected: PostgreSQL 17.x

# 3. Test database creation
docker exec artel_postgres psql -U postgres -c "\l"
# Expected: See auth_db, game_db, etc.
```

### 🐍 **Phase 2: Python 3.13 Dependencies**

```bash
# 1. Build base image (may take time)
docker build -f shared-libs/python/Dockerfile.base -t artel-test .

# 2. Test critical imports
docker run artel-test python -c "
import fastapi
import sqlalchemy  
import asyncpg
import pydantic
print('✅ Core packages work!')
"

# 3. Test database drivers
docker run artel-test python -c "
import psycopg2
import asyncpg
print('✅ DB drivers work!')
"

# 4. Test messaging
docker run artel-test python -c "
import aio_pika
print('✅ RabbitMQ driver works!')
"
```

### 🔧 **Phase 3: Service Integration**

```bash
# 1. Build Auth Service
docker-compose -f docker-compose.base.yml -f docker-compose.dev.yml build auth-service

# 2. Start full dev stack
docker-compose -f docker-compose.base.yml -f docker-compose.dev.yml up

# 3. Test health endpoints
curl http://localhost:8001/health
curl http://localhost:8000/health  # API Gateway
```

## 🚨 **Common Issues & Solutions**

### **If Python 3.13 build fails:**
```dockerfile
# Add more build dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    gcc \
    g++ \
    libpq-dev \
    libffi-dev \
    libssl-dev \
    python3.13-dev
```

### **If psycopg2 fails:**
```bash
# Try newer version
pip install psycopg2-binary==2.9.10  # or latest
```

### **If asyncpg fails:**
```bash
# Update to latest
pip install asyncpg==0.30.0  # or latest compatible
```

## ✅ **Success Criteria**

- [ ] PostgreSQL 17 starts successfully
- [ ] All Python packages import without errors  
- [ ] Auth Service starts and responds to /health
- [ ] Database connections work
- [ ] No critical warnings in logs

## 🔄 **Rollback Plan if Issues**

If testing reveals critical issues:

```bash
# Rollback Python
git checkout -- shared-libs/python/Dockerfile.base
git checkout -- services/auth-service/Dockerfile

# Rollback PostgreSQL  
git checkout -- docker-compose.base.yml

# Or manually edit:
# Python: 3.13 → 3.11
# PostgreSQL: 17 → 14
```

## 📞 **Next Steps After Testing**

1. ✅ **If tests pass** → Continue with development
2. ⚠️ **If minor issues** → Fix and document in MIGRATION_PLAN.md  
3. 🚨 **If major issues** → Rollback and research compatibility
4. 📝 **Document results** → Update this file with findings