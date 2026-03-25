import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { writeFile } from 'fs/promises';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

const projectRoot = process.cwd();
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(projectRoot, 'uploads');
const OUTPUT_DIR = process.env.OUTPUT_DIR || path.join(projectRoot, 'outputs');

export async function POST(request: NextRequest) {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    await fs.mkdir(OUTPUT_DIR, { recursive: true });

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file was provided.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const timestamp = Date.now();
    const ext = path.extname(file.name);
    const safeName = file.name.replace(ext, '').replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `${safeName}_${timestamp}${ext}`;
    const filePath = path.join(UPLOAD_DIR, fileName);

    await writeFile(filePath, buffer);

    return NextResponse.json({
      success: true,
      fileName: file.name,
      savedName: fileName,
      filePath: `/api/download/${fileName}`,
    });
  } catch (error: any) {
    console.error('Upload failed:', error);
    return NextResponse.json({ error: `Upload failed: ${error.message}` }, { status: 500 });
  }
}
