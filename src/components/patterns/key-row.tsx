"use client";

import { Button } from "@/components/primitives/button";
import type { ApiKeyDto } from "@/lib/domain/keys";

export function KeyRow({
  apiKey,
  onRevoke,
}: {
  apiKey: ApiKeyDto;
  onRevoke: (id: string) => void;
}) {
  const revoked = Boolean(apiKey.revokedAt);
  return (
    <tr className="border-b border-subtle text-sm">
      <td className="py-3 pr-4 text-fg">{apiKey.name}</td>
      <td className="py-3 pr-4 font-mono text-muted">{apiKey.keyPrefix}…</td>
      <td className="py-3 pr-4 text-faint">
        {new Date(apiKey.createdAt).toLocaleDateString()}
      </td>
      <td className="py-3 pr-4 text-faint">
        {apiKey.lastUsedAt
          ? new Date(apiKey.lastUsedAt).toLocaleString()
          : "never"}
      </td>
      <td className="py-3 text-right">
        {revoked ? (
          <span className="text-faint">revoked</span>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRevoke(apiKey.id)}
          >
            Revoke
          </Button>
        )}
      </td>
    </tr>
  );
}
