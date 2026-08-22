"use client";

import { useState } from "react";
import { Button } from "@/components/primitives/button";
import { Input } from "@/components/primitives/input";
import { Select } from "@/components/primitives/select";
import { Textarea } from "@/components/primitives/textarea";

const methods = ["GET", "POST", "PATCH", "DELETE"].map((value) => ({
  value,
  label: value,
}));

export function ApiPlayground({ initialKey }: { initialKey: string }) {
  const [method, setMethod] = useState("GET");
  const [path, setPath] = useState("/api/v1/memories");
  const [key, setKey] = useState(initialKey);
  const [body, setBody] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  async function send() {
    setLoading(true);
    try {
      const res = await fetch(path, {
        method,
        headers: {
          Authorization: `Bearer ${key}`,
          ...(body && method !== "GET" && method !== "DELETE"
            ? { "Content-Type": "application/json" }
            : {}),
        },
        body:
          body && method !== "GET" && method !== "DELETE" ? body : undefined,
      });
      const text = await res.text();
      let pretty = text;
      try {
        pretty = JSON.stringify(JSON.parse(text), null, 2);
      } catch {
        pretty = text || `(${res.status})`;
      }
      setResponse(`${res.status}\n${pretty}`);
    } catch (error) {
      setResponse(error instanceof Error ? error.message : "Request failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row">
          <Select
            label="Method"
            value={method}
            onChange={(event) => setMethod(event.target.value)}
            options={methods}
          />
          <div className="flex-1">
            <Input
              label="Path"
              value={path}
              onChange={(event) => setPath(event.target.value)}
              className="font-mono"
            />
          </div>
        </div>
        <Input
          label="API key"
          value={key}
          onChange={(event) => setKey(event.target.value)}
          className="font-mono"
          placeholder="mein_…"
        />
        {method !== "GET" && method !== "DELETE" ? (
          <Textarea
            label="Body"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            className="font-mono"
            placeholder='{ "type": "paste", "content": "hello" }'
          />
        ) : null}
        <Button loading={loading} onClick={() => void send()}>
          Send
        </Button>
      </div>
      <pre className="min-h-48 flex-1 overflow-auto rounded-md border border-line bg-elevated p-4 font-mono text-xs text-muted">
        {response || "Response will land here."}
      </pre>
    </div>
  );
}
