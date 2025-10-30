import { Queue, Worker, QueueEvents, JobsOptions } from "bullmq";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const redis = process.env.REDIS_URL;
const prisma = new PrismaClient();

if (!redis) {
  console.log("worker: no REDIS_URL set. Running in no-op mode.");
  setInterval(() => {}, 1 << 30);
} else {
  const connection = { connection: { url: redis } };
  const rollupQueue = new Queue("rollup", connection);
  const events = new QueueEvents("rollup", connection);
  new Worker("rollup", async job => {
    const { environmentId, flagKey, date } = job.data as { environmentId: string; flagKey: string; date: string };
    const day = new Date(date);
    const count = await prisma.evaluationEvent.count({
      where: { environmentId, flagKey, createdAt: { gte: day, lt: new Date(day.getTime() + 86400000) } }
    });
    await prisma.dailyRollup.upsert({
      where: { environmentId_flagKey_date: { environmentId, flagKey, date: day } },
      update: { evaluations: count },
      create: { environmentId, flagKey, date: day, evaluations: count }
    });
  }, connection);

  // schedule
  setInterval(async () => {
    const today = new Date();
    const date = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())).toISOString();
    const jobs: JobsOptions = { removeOnComplete: 50, removeOnFail: 50 };

    await rollupQueue.add("daily", { environmentId: "all", flagKey: "new_homepage", date }, jobs);
  }, 60_000);

  events.on("completed", ({ jobId }) => console.log("rollup completed", jobId));
}
