export async function uploadMedia(file: File, kind: "projects" | "designs" | "site") {
  const form = new FormData();
  form.set("file", file);
  form.set("kind", kind);
  const response = await fetch("/api/uploads/sign", { method: "POST", body: form });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error ?? "Could not upload file");
  return result.publicUrl as string;
}

export async function uploadMediaFiles(files: FileList | File[], kind: "projects" | "designs" | "site") {
  const urls: string[] = [];
  for (const file of Array.from(files)) urls.push(await uploadMedia(file, kind));
  return urls;
}
