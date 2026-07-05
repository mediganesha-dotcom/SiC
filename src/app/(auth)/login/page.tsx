"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { loginSchema, type LoginInput } from "@/lib/validation/auth";

export default function LoginPage() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginInput) => {
    setFormError(null);
    const result = await signIn("credentials", { ...data, redirect: false });
    if (result?.error) {
      setFormError("E-Mail oder Passwort ist falsch.");
      return;
    }
    router.push("/requests");
    router.refresh();
  };

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col justify-center gap-4 p-6">
      <h1 className="text-2xl font-semibold">Anmelden</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
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
        {formError && <p className="text-sm text-red-600">{formError}</p>}
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded bg-black px-3 py-2 text-white disabled:opacity-50"
        >
          Anmelden
        </button>
      </form>
      <p className="text-sm">
        Noch kein Konto?{" "}
        <Link href="/register" className="underline">
          Registrieren
        </Link>
      </p>
    </div>
  );
}
