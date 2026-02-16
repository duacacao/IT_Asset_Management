# Đánh giá Plan Database Safe Fix

**Ngày:** 16/02/2026  
**Đánh giá bởi:** Orchestrator (database-architect + backend-specialist + security-auditor)

---

## 📊 So sánh: Plan Gốc vs Live DB Audit

### Những gì Plan gốc **ĐỀ XUẤT SAI** (đã fix trong plan mới)

| # | Plan gốc đề xuất | Live DB thực tế | Kết luận |
|---|---|---|---|
| 1 | Drop+Re-add FK `device_sheets.device_id` (CASCADE) | **Đã là CASCADE** | ❌ Không cần |
| 2 | Drop+Re-add FK `activity_logs.device_id` (SET NULL) | **Đã là SET NULL** | ❌ Không cần |
| 3 | Drop+Re-add FK `device_assignments.device_id` (CASCADE) | **Đã là CASCADE** | ❌ Không cần |
| 4 | Drop+Re-add FK `device_assignments.end_user_id` (CASCADE) | **Đã là CASCADE** | ❌ Không cần |
| 5 | Tạo triggers `updated_at` cho 6 bảng | **5 bảng đã có trigger** | ⚠️ Chỉ thêm 1 |
| 6 | `device_assignments.notes` "đã có" | **Chưa có trong production** | ⚠️ Cần thêm |

### Những gì Plan gốc **ĐỀ XUẤT ĐÚNG**

| # | Đề xuất | Trạng thái | Kết luận |
|---|---|---|---|
| 1 | Thêm FK `device_assignments.user_id → profiles` | Chưa có | ✅ Cần thêm |
| 2 | Fix `activity_logs.user_id` → SET NULL | Hiện NO ACTION | ✅ Cần fix |
| 3 | UNIQUE `device_sheets(device_id, sort_order)` | Chưa có | ✅ Cần thêm |
| 4 | Partial indexes cho soft delete | Chưa có | ✅ Cần thêm |

---

## 🎯 TIER 1 Migration Thực Tế (Sau Audit)

Chỉ **5 thay đổi thực sự**, không phải 9 như plan gốc:

| # | Fix | Loại | Risk |
|---|-----|------|------|
| 1 | ADD FK `device_assignments.user_id → profiles(id)` | New constraint | 🟢 LOW |
| 2 | Fix `activity_logs.user_id` → ON DELETE SET NULL | Re-create constraint | 🟢 LOW |
| 3 | ADD UNIQUE `device_sheets(device_id, sort_order)` | New constraint | 🟢 LOW |
| 4 | ADD trigger + column notes + indexes cho `device_assignments` | New objects | 🟢 LOW |
| 5 | ADD partial indexes cho `devices`, `end_users` | New indexes | 🟢 LOW |

---

## ⚠️ Risk Assessment

### TIER 1 Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| FK add fails (orphaned user_id) | LOW | LOW | Pre-check #2 validates data |
| UNIQUE fails (duplicate sort_order) | LOW | LOW | Pre-check #3 validates data |
| Trigger conflicts | VERY LOW | LOW | Check existing triggers first |

### TIER 2 Risks (Hoãn lại)

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Rename user_id breaks RLS** | **HIGH** | **CRITICAL** | Phải update RLS + code đồng thời |
| Drop device_id breaks types | MEDIUM | MEDIUM | Update TypeScript types trước |

---

## ✅ Đánh giá cuối cùng

| Tiêu chí | Điểm |
|----------|------|
| Tính chính xác (so với live DB) | **9/10** ✅ Đã audit xong |
| Tính an toàn (UI impact) | **10/10** ✅ Zero UI impact |
| Rollback capability | **10/10** ✅ Có rollback.sql |
| Pre-check validation | **10/10** ✅ Có pre-check.sql |
| **TỔNG** | **9.75/10** ⭐ |

**Verdict: READY TO DEPLOY** ✅
