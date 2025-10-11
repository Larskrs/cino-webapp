import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir, stat } from "fs/promises";
import path from "path";
import { db } from "@/server/db";
import * as fs from "fs"
import type { NextApiResponse } from "next";
import { fileTypeFromBuffer, fileTypeFromFile, type FileTypeResult } from "file-type";

import { customAlphabet } from "nanoid";
import { auth } from "@/server/auth";
const nanoid = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 12);

async function detectMime(buffer: Buffer): Promise<FileTypeResult | undefined> {
  const type = await fileTypeFromBuffer(buffer);
  return type || undefined
}

// This API will receive a multipart/form-data POST request
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Obtain user
    const session = await auth()
    if (!session) {
      console.error("Upload failed:", "Not authenticated attempt to upload file");
      return NextResponse.json({ error: "Upload failed, could not authenticate you" }, { status: 500 });
    }
    session?.user.id

    // Ensure the uploads directory exists
    const uploadsDir = path.join(process.cwd(), "/uploads");
    await mkdir(uploadsDir, { recursive: true });

    const createdAt: Date = new Date()

    // Ensure destination directory exists
    const year = String(createdAt.getFullYear());
    const month = String(createdAt.getMonth() + 1).padStart(2, "0"); // month is 0-based
    const day = String(createdAt.getDate()).padStart(2, "0");
    const destinationDir = path.join(uploadsDir, year, month, day) // address = 25/09/17    year month day
    await mkdir(destinationDir, { recursive: true });

    // Create randomizedIdentity
    const id = nanoid(); // e.g. "a1b2c3d4e5f6"
    
    //TODO: Check for already existing id's

    // Convert file into Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Obtain extension
    const type = await detectMime(buffer)
    if (type == undefined) { 
      console.error("Upload failed:", "Unable to obtain file-type");
      return NextResponse.json({ error: "Upload failed" }, { status: 400 }); 
    }
    const { ext, mime } = type

    // Give the file a unique name
    const filePath = path.join(destinationDir, id + "." + ext);
    await writeFile(filePath, buffer);

    const data = await db.file.create({
      data: {
        id: id,
        name: file.name,
        storage: filePath,
        size: buffer.byteLength,
        createdBy: { 
          connect: {
            id: session.user.id
          }
        }
      }
    })

    // Create a public URL
    const url = `/api/v1/files?fid=${id}`;

    return NextResponse.json({
      url,
      data: {
        ...data,
        size: data.size.toString(),
      },
    });
  } catch (error) {
    console.error("Upload failed:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

async function GetDBFile(fileId: string) {
  return db.file.findUnique({
    where: { id: fileId },
  });
}


export async function GET(req: NextRequest) {
  const fileId = req.nextUrl.searchParams.get("fid")?.replace("/", "");
  if (!fileId) {
    return NextResponse.json({ error: "No file-id provided" }, { status: 400 });
  }

  const dbFile = await GetDBFile(fileId);
  if (!dbFile) {
    return NextResponse.json({ error: `File '${fileId}' not found` }, { status: 404 });
  }

  const filePath = dbFile.storage;
  let fileStat;

  try {
    fileStat = await stat(filePath);
  } catch (err) {
    console.error("Stat error:", err);
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  // Detect mimetype dynamically
  const type = await fileTypeFromFile(filePath);
  const mimeType = type?.mime || "application/octet-stream";

  const fileSize = fileStat.size;
  const range = req.headers.get("range");

  if (range) {
    const [startStr, endStr] = range.replace(/bytes=/, "").split("-");
    const start = parseInt(startStr||"", 10);
    const end = endStr ? parseInt(endStr, 10) : fileSize - 1;

    if (start >= fileSize || end >= fileSize) {
      return new Response(null, {
        status: 416,
        headers: {
          "Content-Range": `bytes */${fileSize}`,
        },
      });
    }

    const chunkSize = end - start + 1;
    const stream = fs.createReadStream(filePath, { start, end });

    return new Response(stream as any, {
      status: 206,
      headers: {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunkSize.toString(),
        "Content-Type": mimeType,
        "Content-Disposition": `inline; filename="${dbFile.name}"`,
      },
    });
  }

  // No range → return full file
  const stream = fs.createReadStream(filePath);
  return new Response(stream as any, {
    headers: {
      "Content-Length": fileSize.toString(),
      "Content-Type": mimeType,
      "Content-Disposition": `inline; filename="${dbFile.name}"`,
    },
  });
}