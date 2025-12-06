#!/usr/bin/env python3
import psycopg2
import os

# Connection details
configs = [
    {
        'name': 'Direct (IPv6)',
        'host': 'db.blspsttgyxuoqhskpmrg.supabase.co',
        'port': 5432,
        'user': 'postgres',
        'password': 'DrSgD9tC6D1ZilAZ',
        'dbname': 'postgres',
        'sslmode': 'require'
    },
    {
        'name': 'Session Pooler',
        'host': 'aws-0-us-east-1.pooler.supabase.com',
        'port': 5432,
        'user': 'postgres.blspsttgyxuoqhskpmrg',
        'password': 'DrSgD9tC6D1ZilAZ',
        'dbname': 'postgres',
        'sslmode': 'require'
    }
]

# Read migration SQL
script_dir = os.path.dirname(os.path.abspath(__file__))
migration_path = os.path.join(script_dir, '..', 'supabase', 'migrations', '006_optimized.sql')
with open(migration_path, 'r') as f:
    sql = f.read()

for config in configs:
    print(f"\n🔌 Trying {config['name']}...")
    try:
        conn = psycopg2.connect(
            host=config['host'],
            port=config['port'],
            user=config['user'],
            password=config['password'],
            dbname=config['dbname'],
            sslmode=config['sslmode'],
            connect_timeout=30
        )
        conn.autocommit = True
        print("✅ Connected!")
        
        cur = conn.cursor()
        print("📄 Running migration...")
        cur.execute(sql)
        print("✅ Migration complete!")
        
        # Verify tables
        cur.execute("""
            SELECT table_name FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('organizations', 'events', 'player_settings', 'conversations', 'messages')
            ORDER BY table_name;
        """)
        
        print("\n📊 Tables verified:")
        for row in cur.fetchall():
            print(f"   ✅ {row[0]}")
        
        cur.close()
        conn.close()
        print("\n🎉 Success!")
        exit(0)
        
    except Exception as e:
        print(f"   ❌ {str(e)[:100]}")

print("\n⚠️ All connection methods failed")
exit(1)

