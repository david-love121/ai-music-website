import type { RequestHandler } from "@sveltejs/kit";
import fs from "node:fs";
import path from "node:path";

const AUDIO_EXT = new Set([".mp3", ".wav", ".ogg", ".m4a", ".flac"]);

function listDir(
  dir: string,
  toUrl: (name: string) => string,
): { name: string; url: string }[] {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    return entries
      .filter(
        (e) => e.isFile() && AUDIO_EXT.has(path.extname(e.name).toLowerCase()),
      )
      .map((e) => ({ name: e.name, url: toUrl(e.name) }));
  } catch {
    return [];
  }
}

export const GET: RequestHandler = async () => {
  const staticDir = path.join(process.cwd(), "static", "music-dir");
  const rootDir = path.join(process.cwd(), "music-dir");

  const files = [
    // Served as static assets at /music-dir/*
    ...listDir(staticDir, (name) => `/music-dir/${name}`),
    // During dev, use Vite's /@fs/ to read from project-level music-dir.
    // Requires server.fs.allow in vite.config.ts
    ...listDir(rootDir, (name) => `/@fs/${path.join(rootDir, name)}`),
  ];

  return new Response(JSON.stringify(files), {
    headers: { "content-type": "application/json" },
  });
};
