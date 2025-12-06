# Supabase Database Connection Verification

## Issue: Hostname Not Resolving

The hostname `db.blspsttgyxuoqhskpmrg.supabase.co` cannot be resolved. This could mean:

1. **Connection Pooling Required**: Supabase may require using connection pooling
2. **Different Hostname**: The direct connection hostname might be different
3. **Network Restrictions**: Your IP might need to be whitelisted

## Solution: Get Correct Connection String

### Step 1: Get Connection String from Supabase Dashboard

1. Go to **Supabase Dashboard** → **Settings** → **Database**
2. Scroll to **Connection string** section
3. Select **URI** format
4. Copy the **exact** connection string shown

### Step 2: Check Connection Pooling

Supabase offers two connection methods:

**Option A: Direct Connection (Port 5432)**
- For: Admin tasks, migrations
- Hostname format: `db.[project-ref].supabase.co`
- May require IP whitelisting

**Option B: Connection Pooling (Port 6543)**
- For: Application connections
- Hostname format: `aws-0-[region].pooler.supabase.com`
- Better for production

### Step 3: Verify Your Connection String

The connection string should look like one of these:

```
# Direct connection
postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres

# Connection pooling
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

### Step 4: Check IP Whitelisting

If using direct connection (port 5432):
1. Go to **Settings** → **Database** → **Connection Pooling**
2. Check if your IP needs to be whitelisted
3. Or use connection pooling (port 6543) which doesn't require whitelisting

## Alternative: Use Supabase Client (Recommended)

For application code, continue using the Supabase client which handles connections automatically:

```typescript
import { createClient } from '@/lib/supabase/client';
const supabase = createClient();
```

This uses the REST API and doesn't require direct database connections.

## Next Steps

1. **Get the correct connection string** from Supabase Dashboard
2. **Update DATABASE_URL** in `.env.local` with the exact string
3. **Try connection pooling** if direct connection doesn't work
4. **Or use Supabase client** for all application queries (recommended)

