"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/primitives/button";
import { Input } from "@/components/primitives/input";
import { useToast } from "@/components/primitives/toast";

type FieldErrors = Partial<Record<"name" | "email" | "password", string>>;

export function SetupForm() {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  async function onSubmit(formData: FormData) {
    setLoading(true);
    setErrors({});
    try {
      const res = await fetch("/api/auth/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: String(formData.get("name") ?? ""),
          email: String(formData.get("email") ?? ""),
          password: String(formData.get("password") ?? ""),
        }),
      });
      const payload: unknown = await res.json();
      if (!res.ok) {
        const error = parseApiError(payload);
        if (error.fieldErrors) {
          setErrors(error.fieldErrors);
        } else {
          toast.push("error", error.message);
        }
        return;
      }
      router.push("/library");
      router.refresh();
    } catch {
      toast.push("error", "Could not reach Mein.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        void onSubmit(new FormData(event.currentTarget));
      }}
    >
      <Input name="name" label="Name" autoComplete="name" error={errors.name} />
      <Input
        name="email"
        label="Email"
        type="email"
        autoComplete="email"
        error={errors.email}
      />
      <Input
        name="password"
        label="Password"
        type="password"
        autoComplete="new-password"
        error={errors.password}
      />
      <Button type="submit" loading={loading}>
        Create owner
      </Button>
    </form>
  );
}

function parseApiError(payload: unknown): {
  message: string;
  fieldErrors?: FieldErrors;
} {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "error" in payload &&
    typeof payload.error === "object" &&
    payload.error !== null
  ) {
    const error = payload.error as {
      message?: unknown;
      details?: { fieldErrors?: Record<string, string[] | undefined> };
    };
    const fieldErrors: FieldErrors = {};
    const raw = error.details?.fieldErrors;
    if (raw) {
      for (const key of ["name", "email", "password"] as const) {
        const first = raw[key]?.[0];
        if (first) {
          fieldErrors[key] = first;
        }
      }
    }
    return {
      message:
        typeof error.message === "string" ? error.message : "Setup failed.",
      fieldErrors: Object.keys(fieldErrors).length ? fieldErrors : undefined,
    };
  }
  return { message: "Setup failed." };
}
