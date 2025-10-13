const DATA_URI_REGEX = /^data:([\w/-]+);base64,(.+)$/;

let sharpModule: typeof import('sharp') | null = null;

async function getSharp() {
  if (!sharpModule) {
    const mod = await import('sharp');
    sharpModule = mod.default;
  }
  return sharpModule!;
}

function parseDataUri(dataUri: string) {
  const match = DATA_URI_REGEX.exec(dataUri);
  if (!match) return null;
  const [, mime, data] = match;
  return { mime, data };
}

export async function compressDataUri(input: string, width = 512): Promise<string> {
  const parsed = parseDataUri(input);
  if (!parsed) return input;

  try {
    const buffer = Buffer.from(parsed.data, 'base64');
    const sharp = await getSharp();
    const processed = await sharp(buffer)
      .resize({ width, withoutEnlargement: true })
      .jpeg({ quality: 70 })
      .toBuffer();
    return `data:image/jpeg;base64,${processed.toString('base64')}`;
  } catch (error) {
    console.error('compressDataUri failed:', error);
    return input;
  }
}
