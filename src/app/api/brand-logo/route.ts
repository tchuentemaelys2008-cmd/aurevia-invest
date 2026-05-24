import { NextResponse } from "next/server";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

export const dynamic = "force-dynamic";

const IMAGE_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

const ROOT_IMAGE_PATTERN = /^(logo|icon|favicon|aurevia|brand|image|photo|img|capture|screenshot)/i;

export async function GET() {
  const files = await readdir(process.cwd(), { withFileTypes: true });
  const image = files
    .filter((file) => file.isFile())
    .map((file) => {
      const ext = path.extname(file.name).toLowerCase();
      return { name: file.name, ext, contentType: IMAGE_TYPES[ext] };
    })
    .filter((file) => file.contentType)
    .sort((a, b) => {
      const aPreferred = ROOT_IMAGE_PATTERN.test(a.name) ? 0 : 1;
      const bPreferred = ROOT_IMAGE_PATTERN.test(b.name) ? 0 : 1;
      return aPreferred - bPreferred || a.name.localeCompare(b.name);
    })[0];

  if (!image) {
    return NextResponse.json({ error: "No root logo image found" }, { status: 404 });
  }

  const buffer = await readFile(path.join(process.cwd(), image.name));

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": image.contentType,
      "Cache-Control": "public, max-age=3600, must-revalidate",
    },
  });
}
