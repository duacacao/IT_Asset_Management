// ============================================
// END USERS REACT QUERY HOOKS - Export Index
// ============================================

export { queryKeys } from "./queries/queryKeys"

// Queries
export {
  useEndUsersQuery,
  useEndUserQuery,
  useDepartmentsQuery,
  usePositionsQuery,
  useAvailableDevicesQuery,
} from "./queries/endUserQueries"

// Mutations
export {
  // End Users
  useCreateEndUserMutation,
  useUpdateEndUserMutation,
  useDeleteEndUserMutation,
  // Departments
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
  // Positions
  useCreatePositionMutation,
  useUpdatePositionMutation,
  useDeletePositionMutation,
} from "./mutations/endUserMutations"
