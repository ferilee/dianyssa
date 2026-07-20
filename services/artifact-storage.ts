import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

export type StoredArtifact = { storageKey: string; sizeBytes: number; checksum: string };
const bucket = process.env.S3_BUCKET;
const client = bucket ? new S3Client({ region: process.env.S3_REGION ?? "ap-southeast-1", endpoint: process.env.S3_ENDPOINT || undefined, credentials: { accessKeyId: process.env.S3_ACCESS_KEY_ID ?? "", secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "" } }) : null;
const keyFor = (id: string, extension: "docx" | "pdf") => `rpp-artifacts/${id}/${crypto.randomUUID()}.${extension}`;

export async function storeArtifact(documentId: string, extension: "docx" | "pdf", data: Buffer): Promise<StoredArtifact> {
  const storageKey = keyFor(documentId, extension);
  if (client && bucket) await client.send(new PutObjectCommand({ Bucket: bucket, Key: storageKey, Body: data }));
  else { const filePath = path.join(process.cwd(), "data", storageKey); await fs.mkdir(path.dirname(filePath), { recursive: true }); await fs.writeFile(filePath, data); }
  return { storageKey, sizeBytes: data.length, checksum: crypto.createHash("sha256").update(data).digest("hex") };
}

export async function readArtifact(storageKey: string): Promise<Buffer> {
  if (client && bucket) { const result = await client.send(new GetObjectCommand({ Bucket: bucket, Key: storageKey })); return Buffer.from(await result.Body!.transformToByteArray()); }
  return fs.readFile(path.join(process.cwd(), "data", storageKey));
}
