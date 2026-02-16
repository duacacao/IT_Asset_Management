import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
    test: {
        environment: 'jsdom',
        alias: {
            '@/test': path.resolve(process.cwd(), './test'),
            '@': path.resolve(process.cwd(), './src'),
        },
        // setupFiles: ['./test/utils/index.ts'],
    },
})
