import { Router } from "express";
import { prisma } from "../db";
import { FlagCreateSchema, FlagUpdateSchema, EvaluateSchema } from "@openlaunch/shared";
import { z } from "zod";
import { inRolloutPercent } from "@openlaunch/shared";
import { broadcast } from "../sse";

export const router = Router();

router.get("/", async (_req, res) => {
  const flags = await prisma.flag.findMany({ include: { environment: true } });
  res.json(flags);
});

router.post("/", async (req, res) => {
  const data = FlagCreateSchema.parse(req.body);
  const created = await prisma.flag.create({ data });
  await prisma.auditLog.create({ data: { flagId: created.id, message: "created" } });
  broadcast({ type: "flag_update", key: created.key });
  res.status(201).json(created);
});

router.put("/:id", async (req, res) => {
  const data = FlagUpdateSchema.parse({ ...req.body, id: req.params.id });
  const { id, ...updates } = data;
  const updated = await prisma.flag.update({ where: { id }, data: updates });
  await prisma.auditLog.create({ data: { flagId: id, message: "updated" } });
  broadcast({ type: "flag_update", key: updated.key });
  res.json(updated);
});

router.delete("/:id", async (req, res) => {
  const id = z.string().parse(req.params.id);
  const f = await prisma.flag.delete({ where: { id } });
  await prisma.auditLog.create({ data: { flagId: f.id, message: "deleted" } });
  broadcast({ type: "flag_update", key: f.key });
  res.status(204).end();
});

router.post("/evaluate", async (req, res) => {
  const { userId, environmentId, flagKey } = EvaluateSchema.parse(req.body);
  const env = await prisma.environment.findUnique({ where: { id: environmentId } });
  if (!env) return res.status(404).json({ error: "environment not found" });

  const flag = await prisma.flag.findFirst({ where: { key: flagKey, environmentId }, include: { segments: true } });
  if (!flag) return res.status(404).json({ error: "flag not found" });

  const on = flag.enabled && inRolloutPercent(userId, flag.percentage);
  res.json({ on, variant: on ? flag.variantJson ?? null : null });
});
