"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  createRequestSchema,
  type CreateRequestInput,
} from "@/lib/validation/request";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function NewRequestPage() {
  const router = useRouter();
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateRequestInput>({ resolver: zodResolver(createRequestSchema) });

  const onSubmit = async (data: CreateRequestInput) => {
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
        toast.error(body?.error ?? "Foto konnte nicht hochgeladen werden.");
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
      toast.error("Anfrage konnte nicht erstellt werden.");
      return;
    }

    const created = await res.json();
    router.push(`/requests/${created.id}`);
    router.refresh();
  };

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Neue Anfrage</CardTitle>
          <CardDescription>
            Beschreibe kurz, was du dir leihen möchtest.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="text">Beschreibung</Label>
              <Textarea
                id="text"
                placeholder="z.B. Hey, ich brauche eine Bohrmaschine für Samstag"
                rows={4}
                {...register("text")}
              />
              {errors.text && (
                <p className="text-sm text-destructive">{errors.text.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="photo">Foto (optional)</Label>
              <input
                id="photo"
                type="file"
                accept="image/*"
                onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
                className="text-sm text-muted-foreground file:mr-3 file:rounded-md file:border file:border-input file:bg-transparent file:px-3 file:py-1.5 file:text-sm file:font-medium"
              />
            </div>
            <Button type="submit" disabled={isSubmitting || uploading} className="mt-2">
              {uploading ? "Foto wird hochgeladen…" : "Absenden"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
