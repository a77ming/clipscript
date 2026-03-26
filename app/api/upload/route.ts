import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { writeFile } from 'fs/promises';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

const getUploadDir = () => process.env.UPLOAD_DIR || path.join(/* turbopackIgnore: true */ process.cwd(), 'uploads');
const getOutputDir = () => process.env.OUTPUT_DIR || path.join(/* turbopackIgnore: true */ process.cwd(), 'outputs');

export async function POST(request: NextRequest) {
  try {
    const uploadDir = getUploadDir();
    const outputDir = getOutputDir();

    await fs.mkdir(uploadDir, { recursive: true });
    await fs.mkdir(outputDir, { recursive: true });

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
    const filePath = path.join(uploadDir, fileName);

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
