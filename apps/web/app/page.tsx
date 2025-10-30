"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Flag = {
  id: string;
  key: string;
  description?: string;
  enabled: boolean;
  percentage: number;
  variantJson: any | null;
  environmentId: string;
};

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function Home() {
  const [flags, setFlags] = useState<Flag[]>([]);
  const [userId, setUserId] = useState("user-123");
  const [envId, setEnvId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const sseRef = useRef<EventSource | null>(null);

  async function load() {
    const res = await fetch(`${API}/flags`);
    const data = await res.json();
    setFlags(data);
    if (!envId && data[0]?.environmentId) setEnvId(data[0].environmentId);
  }

  useEffect(() => {
    load();
    const es = new EventSource(`${API}/events`);
    sseRef.current = es;
    es.onmessage = () => load();
    return () => es.close();
  }, []);

  async function saveFlag(f: Partial<Flag>) {
    setLoading(true);
    try {
      const res = await fetch(`${API}/flags${f.id ? `/${f.id}` : ""}`, {
        method: f.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(f),
      });
      if (!res.ok) throw new Error("save failed");
      await load();
    } finally {
      setLoading(false);
    }
  }

  async function evaluate(flagKey: string) {
    const res = await fetch(`${API}/flags/evaluate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, environmentId: envId, flagKey }),
    });
    return res.json();
  }

  return (
    <main>
      <h1>OpenLaunch</h1>
      <p>Simple flags for demos. No fluff.</p>

      <div style={{ display: "flex", gap: 20, marginTop: 20 }}>
        <label>
          User ID:{" "}
          <input value={userId} onChange={e => setUserId(e.target.value)} />
        </label>
        <label>
          Environment ID:{" "}
          <input value={envId} onChange={e => setEnvId(e.target.value)} />
        </label>
      </div>

      <div style={{ marginTop: 30 }}>
        <button onClick={() => saveFlag({
          key: "new_feature",
          description: "example",
          enabled: true,
          percentage: 20,
          environmentId: envId || flags[0]?.environmentId
        })} disabled={loading}>
          Create example flag
        </button>
      </div>

      <ul style={{ marginTop: 30, padding: 0, listStyle: "none" }}>
        {flags.map(f => (
          <li key={f.id} style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8, marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <strong>{f.key}</strong>
              <span>{f.enabled ? "enabled" : "disabled"} · {f.percentage}%</span>
            </div>
            <div style={{ marginTop: 8, display: "flex", gap: 10, alignItems: "center" }}>
              <button onClick={() => saveFlag({ id: f.id, enabled: !f.enabled })} disabled={loading}>
                Toggle
              </button>
              <button onClick={() => saveFlag({ id: f.id, percentage: Math.min(100, f.percentage + 5) })} disabled={loading}>
                +5%
              </button>
              <button onClick={() => saveFlag({ id: f.id, percentage: Math.max(0, f.percentage - 5) })} disabled={loading}>
                -5%
              </button>
              <button onClick={async () => {
                const r = await evaluate(f.key);
                alert(JSON.stringify(r));
              }}>
                Preview for user
              </button>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
