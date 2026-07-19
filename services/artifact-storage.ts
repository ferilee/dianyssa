import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

export type StoredArtifact = {
  storageKey: string;
  sizeBytes: number;
  checksum: string;
};

export async function storeArtifact(
  documentId: string,
  extension: "docx" | "pdf",
  data: Buffer,
): Promise<StoredArtifact> {
  const storageKey = path.join("rpp-artifacts", documentId, `${crypto.randomUUID()}.${extension}`);
  const absolutePath = path.join(process.cwd(), "data", storageKey);
  await fs.mkdir(path.dirname(absolutePath), { recursive: true });
  await fs.writeFile(absolutePath, data);

  return {
    storageKey,
    sizeBytes: data.length,
    checksum: crypto.createHash("sha256").update(data).digest("hex"),
  };
}
