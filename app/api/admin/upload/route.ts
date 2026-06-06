import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';
import { isAuthed } from '@/lib/auth';

export const runtime = 'nodejs';

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);
const MAX_BYTES = 5 * 1024 * 1024; // 5MB
const EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
};

function cloudinaryConfigured(): boolean {
  return !!(process.env.CLOUDINARY_URL ||
    (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET));
}

function uploadToCloudinary(buffer: Buffer): Promise<UploadApiResponse> {
  if (!process.env.CLOUDINARY_URL) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
  }
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'mali-tactical', resource_type: 'image' },
      (err, result) => (err || !result ? reject(err ?? new Error('Upload failed')) : resolve(result)),
    );
    stream.end(buffer);
  });
}

export async function POST(req: NextRequest) {
  if (!isAuthed(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const form = await req.formData();
  const file = form.get('file');

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json({ error: 'Lloji i skedarit nuk lejohet (JPG, PNG, WEBP, AVIF)' }, { status: 415 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'Skedari është shumë i madh (max 5MB)' }, { status: 413 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // Production: Cloudinary. Dev (no creds): local filesystem fallback.
  if (cloudinaryConfigured()) {
    try {
      const result = await uploadToCloudinary(buffer);
      return NextResponse.json({ url: result.secure_url }, { status: 201 });
    } catch {
      return NextResponse.json({ error: 'Ngarkimi në Cloudinary dështoi' }, { status: 502 });
    }
  }

  const filename = `${randomUUID()}.${EXT[file.type]}`;
  const dir = path.join(process.cwd(), 'public', 'uploads');
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), buffer);
  return NextResponse.json({ url: `/uploads/${filename}` }, { status: 201 });
}
