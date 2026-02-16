#!/bin/bash
# ============================================================
# BACKUP SCRIPT: Tạo backup trước khi chạy migration
# ============================================================
# Ngày: 16/02/2026
# Project: IT Assets Management - Device Dashboard
#
# CÁCH DÙNG:
#   chmod +x docs/backup.sh
#   ./docs/backup.sh
#
# LƯU Ý: Script này dùng cho Supabase hosted DB.
# Nếu dùng Docker local, xem phần DOCKER BACKUP ở cuối.
# ============================================================

set -e  # Dừng ngay nếu có lỗi

# ── Cấu hình ──
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/backup_before_migration_${TIMESTAMP}.sql"

# ── Tạo thư mục backup ──
mkdir -p "$BACKUP_DIR"
echo "📁 Backup directory: $BACKUP_DIR"

# ============================================================
# OPTION 1: Supabase Hosted (Production)
# ============================================================
# Supabase cung cấp daily automatic backups trên Pro plan.
# Để tạo manual backup:
#
# 1. Vào Supabase Dashboard → Project Settings → Database
# 2. Copy connection string
# 3. Chạy:
#
#   SUPABASE_DB_URL="postgresql://postgres.[ref]:[password]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres"
#
#   pg_dump "$SUPABASE_DB_URL" \
#     --no-owner \
#     --no-privileges \
#     --schema=public \
#     -f "$BACKUP_FILE"
#
# Hoặc chỉ backup các bảng bị ảnh hưởng:
#
#   pg_dump "$SUPABASE_DB_URL" \
#     --no-owner \
#     --no-privileges \
#     -t device_assignments \
#     -t device_sheets \
#     -t activity_logs \
#     -t devices \
#     -t end_users \
#     -f "$BACKUP_FILE"
#
echo "──────────────────────────────────────────"
echo "📋 BACKUP CHECKLIST (Supabase Hosted)"
echo "──────────────────────────────────────────"
echo ""
echo "  Option A: Dùng Supabase Dashboard"
echo "  → Project Settings → Database → Backups"
echo "  → Verify daily backup exists for today"
echo ""
echo "  Option B: Manual pg_dump"
echo "  → Set SUPABASE_DB_URL environment variable"
echo "  → Run: pg_dump \$SUPABASE_DB_URL --schema=public -f $BACKUP_FILE"
echo ""
echo "  Option C: Supabase CLI"
echo "  → supabase db dump -f $BACKUP_FILE --project-ref xwkrexdvgjcdvlveynga"
echo ""

# ============================================================
# OPTION 2: Snapshot Row Counts (Luôn chạy được)
# ============================================================
# Tạo snapshot nhẹ: đếm rows mỗi bảng trước migration
# Dùng để verify sau migration không mất data
#

SNAPSHOT_FILE="${BACKUP_DIR}/snapshot_${TIMESTAMP}.txt"

echo "──────────────────────────────────────────"
echo "📊 Tạo Row Count Snapshot..."
echo "──────────────────────────────────────────"

cat > "$SNAPSHOT_FILE" << 'EOF'
-- ============================================================
-- ROW COUNT SNAPSHOT
-- Chạy query này trên Supabase SQL Editor trước migration
-- Lưu kết quả để so sánh sau migration
-- ============================================================

SELECT 'devices' AS table_name, COUNT(*) AS row_count FROM devices
UNION ALL SELECT 'end_users', COUNT(*) FROM end_users
UNION ALL SELECT 'device_assignments', COUNT(*) FROM device_assignments
UNION ALL SELECT 'device_sheets', COUNT(*) FROM device_sheets
UNION ALL SELECT 'activity_logs', COUNT(*) FROM activity_logs
UNION ALL SELECT 'departments', COUNT(*) FROM departments
UNION ALL SELECT 'positions', COUNT(*) FROM positions
UNION ALL SELECT 'profiles', COUNT(*) FROM profiles
ORDER BY table_name;

-- FK Constraints snapshot
SELECT 
    tc.table_name,
    tc.constraint_name,
    rc.delete_rule
FROM information_schema.table_constraints tc
JOIN information_schema.referential_constraints rc 
    ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'
ORDER BY tc.table_name;
EOF

echo "✅ Snapshot query saved: $SNAPSHOT_FILE"
echo ""

# ============================================================
# OPTION 3: Docker Local Backup
# ============================================================
echo "──────────────────────────────────────────"
echo "🐳 DOCKER BACKUP (nếu dùng Docker local)"
echo "──────────────────────────────────────────"
echo ""
echo "  docker exec -t supabase-db pg_dumpall -U postgres > $BACKUP_FILE"
echo ""

echo "══════════════════════════════════════════"
echo "✅ BACKUP PREPARATION COMPLETE"
echo "══════════════════════════════════════════"
echo ""
echo "  Snapshot: $SNAPSHOT_FILE"
echo "  Backup:   Chọn 1 trong 3 options ở trên"
echo ""
echo "  ⚠️  SAU KHI BACKUP XONG:"
echo "  1. Chạy sql/pre-check.sql"
echo "  2. Verify tất cả checks PASS"
echo "  3. Chạy sql/007_safe_database_fixes.sql"
echo "  4. Verify bằng queries trong DEPLOYMENT-GUIDE.md"
echo ""
