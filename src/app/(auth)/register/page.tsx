"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { registerSchema, type RegisterInput } from "@/lib/validation/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterInput) => {
    setFormError(null);
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      const message =
        body?.error?.email?.[0] ?? "Registrierung fehlgeschlagen.";
      setFormError(message);
      return;
    }

    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });
    if (result?.error) {
      setFormError("Konto erstellt, Anmeldung fehlgeschlagen. Bitte melde dich manuell an.");
      return;
    }
    router.push("/requests");
    router.refresh();
  };

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col justify-center gap-4 p-6">
      <h1 className="text-2xl font-semibold">Registrieren</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <input
            placeholder="Name"
            {...register("name")}
            className="rounded border px-3 py-2"
          />
          {errors.name && (
            <p className="text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <input
            type="email"
            placeholder="E-Mail"
            {...register("email")}
            className="rounded border px-3 py-2"
          />
          {errors.email && (
            <p className="text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <input
            type="password"
            placeholder="Passwort"
            {...register("password")}
            className="rounded border px-3 py-2"
          />
          {errors.password && (
            <p className="text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>
        <div className="flex gap-3">
          <div className="flex flex-1 flex-col gap-1">
            <input
              placeholder="Stadt"
              {...register("city")}
              className="rounded border px-3 py-2"
            />
            {errors.city && (
              <p className="text-sm text-red-600">{errors.city.message}</p>
            )}
          </div>
          <div className="flex flex-1 flex-col gap-1">
            <input
              placeholder="PLZ"
              {...register("postalCode")}
              className="rounded border px-3 py-2"
            />
            {errors.postalCode && (
              <p className="text-sm text-red-600">
                {errors.postalCode.message}
              </p>
            )}
          </div>
        </div>
        {formError && <p className="text-sm text-red-600">{formError}</p>}
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded bg-black px-3 py-2 text-white disabled:opacity-50"
        >
          Registrieren
        </button>
      </form>
      <p className="text-sm">
        Schon ein Konto?{" "}
        <Link href="/login" className="underline">
          Anmelden
        </Link>
      </p>
    </div>
  );
}
