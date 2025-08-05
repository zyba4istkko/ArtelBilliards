# 🚀 Migration Plan: Python 3.13 + PostgreSQL 17

## 📋 Current Updates Applied

✅ **Python 3.11 → 3.13**
- Updated `shared-libs/python/Dockerfile.base`
- Updated `services/auth-service/Dockerfile`

✅ **PostgreSQL 14 → 17**  
- Updated `docker-compose.base.yml`

## ⚠️ Compatibility Risks & Testing Plan

### 🐍 **Python 3.13 Compatibility Checks**

#### **HIGH PRIORITY - Test These First:**
| Package | Current Version | Python 3.13 Status | Risk Level |
|---------|----------------|-------------------|------------|
| fastapi | 0.104.1 | ✅ Supported | 🟢 Low |
| uvicorn | 0.24.0 | ✅ Supported | 🟢 Low |
| sqlalchemy | 2.0.23 | ✅ Supported | 🟢 Low |
| pydantic | 2.5.0 | ✅ Supported | 🟢 Low |
| asyncpg | 0.29.0 | ⚠️ **Need to test** | 🟡 Medium |
| psycopg2-binary | 2.9.9 | ⚠️ **May need update** | 🟡 Medium |
| aio-pika | 9.3.1 | ⚠️ **Need to test** | 🟡 Medium |
| cryptography | 41.0.7 | ⚠️ **C extensions risk** | 🟠 High |

#### **MEDIUM PRIORITY:**
| Package | Current Version | Risk | Action |
|---------|----------------|------|--------|
| prometheus-client | 0.19.0 | 🟡 Medium | Test metrics collection |
| redis | 5.0.1 | 🟡 Medium | Test Redis connections |
| pytest | 7.4.3 | 🟢 Low | Should work fine |
| loguru | 0.7.2 | 🟢 Low | Pure Python |

### 🐘 **PostgreSQL 17 New Features & Changes**

#### **Benefits:**
- 🚀 **Performance**: Better query optimization
- 📊 **JSON**: Enhanced JSON/JSONB performance  
- 🔒 **Security**: Improved authentication
- 🎯 **Monitoring**: Better observability

#### **Breaking Changes to Watch:**
- Extension compatibility
- Connection pooling changes
- New default settings

## 🧪 **Step-by-Step Testing Plan**

### **Phase 1: Infrastructure Testing**
```bash
# 1. Test PostgreSQL 17 startup
docker-compose -f docker-compose.base.yml up postgres

# 2. Check database initialization
docker exec artel_postgres psql -U postgres -c "SELECT version();"

# 3. Test our init script
docker exec artel_postgres psql -U postgres -c "\l"
```

### **Phase 2: Python 3.13 Dependencies**
```bash
# 1. Build base image
docker build -f shared-libs/python/Dockerfile.base -t artel-base .

# 2. Test key imports
docker run artel-base python -c "
import fastapi
import sqlalchemy
import asyncpg
import aio_pika
print('✅ All imports successful')
"

# 3. Check for C extension issues
docker run artel-base python -c "
import cryptography
import psycopg2
print('✅ C extensions working')
"
```

### **Phase 3: Service Testing**
```bash
# 1. Build Auth Service
docker-compose -f docker-compose.base.yml -f docker-compose.dev.yml build auth-service

# 2. Test startup
docker-compose -f docker-compose.base.yml -f docker-compose.dev.yml up auth-service

# 3. Health check
curl http://localhost:8001/health
```

## 🔧 **Potential Issues & Solutions**

### **Python 3.13 Issues:**

#### **Issue 1: C Extensions Not Compatible**
```bash
# Solution: Update to newer versions
pip install --upgrade psycopg2-binary
pip install --upgrade cryptography
```

#### **Issue 2: asyncpg Connection Issues**
```bash
# Solution: Test and potentially upgrade
pip install --upgrade asyncpg
```

#### **Issue 3: Build Failures**
```dockerfile
# Add build dependencies if needed
RUN apt-get update && apt-get install -y \
    build-essential \
    gcc \
    g++ \
    libpq-dev \
    libffi-dev \
    libssl-dev
```

### **PostgreSQL 17 Issues:**

#### **Issue 1: Extension Compatibility**
```sql
-- Check extensions after upgrade
SELECT * FROM pg_available_extensions 
WHERE name IN ('uuid-ossp', 'pgcrypto', 'pg_trgm');
```

#### **Issue 2: Connection String Changes**
```python
# May need to update connection parameters
DATABASE_URL = "postgresql://postgres:password@postgres:5432/auth_db?application_name=artel-auth"
```

## 📊 **Rollback Plan**

### **If Python 3.13 Fails:**
```dockerfile
# Revert to Python 3.11
FROM python:3.11-slim as builder
FROM python:3.11-slim
```

### **If PostgreSQL 17 Fails:**
```yaml
# Revert to PostgreSQL 14
postgres:
  image: postgres:14
```

## ✅ **Success Criteria**

- [ ] All Docker images build successfully
- [ ] PostgreSQL 17 starts and creates databases
- [ ] Python 3.13 imports all dependencies
- [ ] Auth Service starts and responds to /health
- [ ] Database connections work
- [ ] Tests pass
- [ ] No performance regression

## 🚀 **Next Steps**

1. **Test the current setup** - Run the testing commands above
2. **Fix any compatibility issues** - Update packages as needed
3. **Run full test suite** - Ensure everything works
4. **Update documentation** - Note any changes needed
5. **Deploy and monitor** - Watch for issues in production

## 📞 **Contact for Issues**

If you encounter problems:
1. Check this migration plan
2. Test with older versions first
3. Update package versions gradually
4. Document any new incompatibilities found