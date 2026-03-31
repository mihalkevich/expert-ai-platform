import { Queue } from 'bullmq'
import { redis } from '@/lib/redis'

export interface RepurposeJobData {
  repurposeJobId: string
}

export const repurposeQueue = new Queue<RepurposeJobData>('repurpose', {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5_000,
    },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
  },
})
