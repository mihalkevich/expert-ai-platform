import { createRepurposeWorker } from '@/services/queue/repurpose.worker'

console.log('[worker] Starting repurpose worker...')

const worker = createRepurposeWorker()

console.log('[worker] Repurpose worker is running and waiting for jobs')

async function shutdown(signal: string): Promise<void> {
  console.log(`[worker] Received ${signal}, shutting down gracefully...`)
  try {
    await worker.close()
    console.log('[worker] Worker closed successfully')
    process.exit(0)
  } catch (error) {
    console.error('[worker] Error during shutdown:', error)
    process.exit(1)
  }
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))

process.on('unhandledRejection', (reason) => {
  console.error('[worker] Unhandled rejection:', reason)
})

process.on('uncaughtException', (error) => {
  console.error('[worker] Uncaught exception:', error)
  process.exit(1)
})
