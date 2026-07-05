"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createRequestSchema,
  type CreateRequestInput,
} from "@/lib/validation/request";

export default function NewRequestPage() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateRequestInput>({ resolver: zodResolver(createRequestSchema) });

  const onSubmit = async (data: CreateRequestInput) => {
    setFormError(null);
    let photoUrl: string | undefined;

    if (photoFile) {
      setUploading(true);
      const uploadForm = new FormData();
      uploadForm.append("file", photoFile);
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: uploadForm,
      });
      setUploading(false);
      if (!uploadRes.ok) {
        const body = await uploadRes.json().catch(() => null);
        setFormError(body?.error ?? "Foto konnte nicht hochgeladen werden.");
        return;
      }
      const uploadBody = await uploadRes.json();
      photoUrl = uploadBody.url;
    }

    const res = await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, photoUrl }),
    });

    if (!res.ok) {
      setFormError("Anfrage konnte nicht erstellt werden.");
      return;
    }

    const created = await res.json();
    router.push(`/requests/${created.id}`);
    router.refresh();
  };

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-4">
      <h1 className="text-xl font-semibold">Neue Anfrage</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <textarea
            placeholder="z.B. Hey, ich brauche eine Bohrmaschine für Samstag"
            rows={4}
            {...register("text")}
            className="rounded border px-3 py-2"
          />
          {errors.text && (
            <p className="text-sm text-red-600">{errors.text.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-600">Foto (optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
            className="text-sm"
          />
        </div>
        {formError && <p className="text-sm text-red-600">{formError}</p>}
        <button
          type="submit"
          disabled={isSubmitting || uploading}
          className="rounded bg-black px-3 py-2 text-white disabled:opacity-50"
        >
          {uploading ? "Foto wird hochgeladen…" : "Absenden"}
        </button>
      </form>
    </div>
  );
}
