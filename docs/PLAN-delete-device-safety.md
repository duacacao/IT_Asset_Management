# PLAN: Safe Device Deletion with Assignment Handling

> **Approach:** Option C — Return Assignment + Confirm Dialog
> **Created:** 2026-02-16
> **Status:** 📋 Planning

---

## 📊 Context & Problem

### Hiện trạng

Khi xóa **end-user** đang có thiết bị bàn giao:

- ✅ `deleteEndUser()` **đã xử lý**: gọi `returnDevice()` trước khi soft delete
- ✅ Thiết bị được giải phóng, end-user khác có thể được gán

Khi xóa **device** đang được bàn giao cho end-user:

- ❌ `deleteDevice()` **KHÔNG xử lý assignment**: chỉ soft delete `devices.deleted_at`
- ❌ `device_assignments` record vẫn active (`returned_at = NULL`)
- ❌ End-user vẫn hiển thị đang dùng thiết bị "ma" (đã bị xóa)
- ❌ End-user không thể được gán thiết bị mới (cũ vẫn "active")

### Nguyên nhân gốc

- `deleteDevice()` trong `src/app/actions/devices.ts` (line 199-219) chỉ `UPDATE devices SET deleted_at = NOW()`
- FK constraint `device_assignments.device_id → devices ON DELETE CASCADE` không trigger vì dùng **soft delete** (UPDATE, không phải DELETE)
- Frontend `DeviceList.tsx` confirm dialog (line 303-336) chỉ hiện generic warning, không kiểm tra assignment

### Impact

| Severity | Description |
|----------|-------------|
| 🔴 High | End-user bị kẹt — không thể gán thiết bị mới |
| 🟡 Medium | Data inconsistency — orphaned assignment records |
| 🟡 Medium | UI confusion — end-user hiển thị thiết bị không tồn tại |

---

## 🎯 Goal

1. **Backend**: Tự động trả thiết bị (return assignment) trước khi soft delete device
2. **Frontend**: Hiển thị confirm dialog cảnh báo nếu device đang bàn giao
3. **Consistency**: Áp dụng cùng pattern với `deleteEndUser()`

---

## 📁 Files cần thay đổi

### Backend (Server Actions)

| File | Thay đổi | Priority |
|------|----------|----------|
| `src/app/actions/devices.ts` | Thêm logic check & return assignment trong `deleteDevice()` | 🔴 Critical |
| `src/app/actions/devices.ts` | Thêm hàm `checkDeviceAssignment(deviceId)` trả về thông tin end-user đang dùng | 🔴 Critical |

### Frontend (UI)

| File | Thay đổi | Priority |
|------|----------|----------|
| `src/components/dashboard/DeviceList.tsx` | Cập nhật confirm dialog hiển thị warning nếu device đang bàn giao | 🟡 Medium |
| `src/app/(dashboard)/devices/page.tsx` | Cập nhật `handleDeleteDevice` để check assignment trước | 🟡 Medium |
| `src/hooks/mutations/deviceMutations.ts` | Invalidate `endUsers` query sau khi delete device | 🟡 Medium |

---

## 🔧 Implementation Plan

### Phase 1: Backend — Server Action (Critical)

#### Task 1.1: Thêm hàm `checkDeviceAssignment()`

**File:** `src/app/actions/devices.ts`

**Logic:**

```
Input: deviceId (string)
Output: { hasAssignment: boolean, endUserName: string | null, assignmentId: string | null }

1. Query device_assignments WHERE device_id = deviceId AND returned_at IS NULL
2. Nếu có → join end_users lấy full_name
3. Return kết quả
```

**Mục đích:** Frontend gọi hàm này trước khi hiện confirm dialog để biết device có đang bàn giao không.

#### Task 1.2: Cập nhật `deleteDevice()`

**File:** `src/app/actions/devices.ts`

**Logic mới:**

```
deleteDevice(deviceId):
  1. Auth check (giữ nguyên)
  2. [MỚI] Tìm tất cả active assignments của device này
  3. [MỚI] forEach assignment → gọi returnDevice(assignment.id)
  4. [MỚI] Nếu returnDevice lỗi → log warning, vẫn tiếp tục
  5. Soft delete device (giữ nguyên)
  6. [MỚI] Revalidate cả '/end-user' ngoài '/devices'
```

**Lý do:**

- Pattern nhất quán với `deleteEndUser()` (đã hoạt động tốt)
- Xử lý ở backend đảm bảo an toàn ngay cả khi frontend bị bypass
- Dùng `returnDevice()` có sẵn → tái sử dụng code, ghi activity log tự động

---

### Phase 2: Frontend — Confirm Dialog (Medium)

#### Task 2.1: Cập nhật `handleDeleteDevice` trong page.tsx

**File:** `src/app/(dashboard)/devices/page.tsx`

**Logic mới:**

```
handleDeleteDevice(deviceId):
  1. Gọi checkDeviceAssignment(deviceId)
  2. Nếu có assignment:
     → Set state: assignmentWarning = { endUserName, deviceId }
     → Hiện enhanced confirm dialog
  3. Nếu không có assignment:
     → Hiện confirm dialog thường (như hiện tại)
```

**Lưu ý:** Có 2 điểm gọi delete:

- `DeviceList.tsx` (table row action + bulk delete)
- `DeviceDetailModal` (detail view)

**Approach chọn:**

- Xử lý check assignment ở `DeviceList.tsx` level (vì đó là nơi có confirm dialog)
- `DeviceDetailModal` truyền callback, DeviceList xử lý logic

#### Task 2.2: Enhanced Confirm Dialog trong DeviceList.tsx

**File:** `src/components/dashboard/DeviceList.tsx`

**UI thay đổi:**

Khi device **KHÔNG** có assignment (giữ nguyên):

```
Title: "Bạn có chắc chắn muốn xóa?"
Description: "Hành động này không thể hoàn tác. Thiết bị và toàn bộ dữ liệu sẽ bị xóa vĩnh viễn."
```

Khi device **CÓ** assignment (mới):

```
Title: "⚠️ Thiết bị đang được sử dụng"
Description: "Thiết bị này đang được bàn giao cho [Nguyễn Văn A].
             Nếu xóa, thiết bị sẽ tự động được thu hồi và end-user sẽ không còn thiết bị."
Button: "Thu hồi & Xóa" (thay vì "Xóa")
```

#### Task 2.3: Invalidate endUsers query

**File:** `src/hooks/mutations/deviceMutations.ts`

**Thay đổi:** Trong `useDeleteDeviceMutation.onSuccess()`, thêm:

```typescript
queryClient.invalidateQueries({ queryKey: queryKeys.endUsers.list() })
queryClient.invalidateQueries({ queryKey: queryKeys.availableDevices.list() })
```

**Lý do:** Sau khi xóa device, danh sách end-user cần refresh (assignment đã bị return).

---

### Phase 3: Xử lý Bulk Delete (Bonus)

#### Task 3.1: Bulk delete với mixed assignments

**File:** `src/components/dashboard/DeviceList.tsx`

**Logic:**

```
Khi bulk delete N thiết bị:
  1. Check tất cả N thiết bị → tìm ra X thiết bị đang bàn giao
  2. Nếu X > 0:
     Dialog: "X trong N thiết bị đang được sử dụng bởi end-user.
              Tất cả sẽ tự động được thu hồi nếu bạn xóa."
  3. Nếu X = 0:
     Dialog thường (như hiện tại)
```

---

## 🧪 Verification Checklist

### Backend Tests

- [ ] `deleteDevice()` với device **KHÔNG** có assignment → xóa bình thường
- [ ] `deleteDevice()` với device **CÓ** assignment → assignment được return trước, device bị soft delete
- [ ] Sau delete: end-user không còn hiển thị thiết bị đã xóa
- [ ] Sau delete: end-user có thể được gán thiết bị mới
- [ ] Activity log ghi đầy đủ: "Trả thiết bị" + "Xóa thiết bị"

### Frontend Tests

- [ ] Click delete device không có assignment → confirm dialog thường
- [ ] Click delete device có assignment → enhanced dialog với tên end-user
- [ ] Bulk delete mixed → dialog hiển thị số lượng thiết bị đang dùng
- [ ] Sau delete: trang end-user auto refresh, không còn thiết bị "ma"
- [ ] Sau delete: dropdown "thiết bị khả dụng" được cập nhật

### Edge Cases

- [ ] Delete device khi end-user đã bị soft delete → assignment vẫn return OK
- [ ] Delete device khi returnDevice() fail → device vẫn bị soft delete (log warning)
- [ ] Network error khi check assignment → fallback về dialog thường (an toàn)

---

## ⏱️ Estimated Effort

| Phase | Effort | Est. Time |
|-------|--------|-----------|
| Phase 1: Backend | Low | ~10 phút |
| Phase 2: Frontend | Medium | ~20 phút |
| Phase 3: Bulk delete | Low | ~10 phút |
| **Total** | **Medium** | **~40 phút** |

---

## 🔄 Rollback Plan

Nếu cần rollback:

1. Revert `deleteDevice()` về version cũ (chỉ soft delete)
2. Frontend confirm dialog quay về generic message
3. Không cần DB rollback (không có schema change)

---

## 📋 Dependencies

- ✅ `returnDevice()` function đã tồn tại và hoạt động
- ✅ `device_assignments` table đã có schema chuẩn
- ✅ `AlertDialog` component đã được sử dụng
- ✅ `queryKeys.endUsers` và `queryKeys.availableDevices` đã có

---

## 📌 Notes

- Pattern này **nhất quán** với `deleteEndUser()` đã implement
- Không cần thay đổi database schema
- Activity log sẽ tự động ghi nhờ `returnDevice()` có sẵn logic log
