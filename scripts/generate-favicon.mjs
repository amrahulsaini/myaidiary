import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import pngToIco from "png-to-ico";

const root = process.cwd();
const svgPath = path.join(root, "public", "brand.svg");
const outIcoPath = path.join(root, "app", "favicon.ico");

const sizes = [16, 32, 48, 64, 128, 256];

async function main() {
  const svg = await fs.readFile(svgPath);

  const pngBuffers = await Promise.all(
    sizes.map((size) =>
      sharp(svg, { density: 300 })
        .resize(size, size)
        .png({ compressionLevel: 9, adaptiveFiltering: true })
        .toBuffer()
    )
  );

  const ico = await pngToIco(pngBuffers);
  await fs.writeFile(outIcoPath, ico);

  console.log(`Wrote ${outIcoPath} from ${svgPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
