import * as z from 'zod'

import { DEVICE_TYPES } from '@/constants/device'

export const IP_REGEX =
  /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/

export const MAC_REGEX = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/

export const deviceFormSchema = z
  .object({
    name: z.string().min(1, 'Tên thiết bị là bắt buộc'),
    type: z.enum(Object.values(DEVICE_TYPES) as [string, ...string[]]),
    status: z.enum(['active', 'broken', 'inactive'] as const),
    os: z.string().optional(),
    cpu: z.string().optional(),
    ram: z.string().optional(),
    architecture: z.string().optional(),
    ip: z.string().optional(),
    mac: z.string().optional(),
    screenSize: z.string().optional(),
    resolution: z.string().optional(),
    connectionType: z.string().optional(),
    gpu: z.string().optional(),
    storage: z.string().optional(),
    activationStatus: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type !== 'Monitor') {
      if (data.ip && !IP_REGEX.test(data.ip)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Địa chỉ IP không hợp lệ (VD: 192.168.1.1)',
          path: ['ip'],
        })
      }
      if (data.mac && !MAC_REGEX.test(data.mac)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Địa chỉ MAC không hợp lệ (VD: AA:BB:CC:DD:EE:FF)',
          path: ['mac'],
        })
      }
    }
  })

export type DeviceFormValues = z.infer<typeof deviceFormSchema>

export const DEVICE_FORM_INITIAL_VALUES: DeviceFormValues = {
  name: '',
  type: 'PC',
  status: 'inactive',
  os: '',
  cpu: '',
  ram: '',
  architecture: '',
  ip: '',
  mac: '',
  screenSize: '',
  resolution: '',
  connectionType: '',
  gpu: '',
  storage: '',
  activationStatus: '',
}
