import { Request, Response } from "express";

type Client = { res: Response };
const clients: Client[] = [];

export function sseHandler(req: Request, res: Response) {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();
  res.write("retry: 10000\n\n");

  // Track this client so we can push updates later
  const client = { res };
  clients.push(client);

  req.on("close", () => {
    const i = clients.indexOf(client);
    if (i >= 0) clients.splice(i, 1);
  });
}

// Send an event to all connected clients
export function broadcast(data: any) {
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  clients.forEach(c => c.res.write(payload));
}
