const fs = require('node:fs');
const path = require('node:path');
const { deflateRawSync } = require('node:zlib');
const root = path.resolve(__dirname, '..');
const folder = path.join(root, 'extension');
fs.copyFileSync(
  path.join(root, 'backend/lib/focusPolicy.js'),
  path.join(folder, 'focus-policy.js'),
);
// Small standard ZIP writer; build/download packaging needs no system zip binary or dependency.
function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++)
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}
const local = [],
  central = [];
let offset = 0;
const files = fs
  .readdirSync(folder)
  .filter((name) => /\.(js|json|html|css|md)$/.test(name))
  .sort();
for (const filename of files) {
  const name = Buffer.from(filename),
    bytes = fs.readFileSync(path.join(folder, filename)),
    packed = deflateRawSync(bytes),
    crc = crc32(bytes);
  const header = Buffer.alloc(30);
  header.writeUInt32LE(0x04034b50, 0);
  header.writeUInt16LE(20, 4);
  header.writeUInt16LE(8, 8);
  header.writeUInt16LE(33, 12);
  header.writeUInt32LE(crc, 14);
  header.writeUInt32LE(packed.length, 18);
  header.writeUInt32LE(bytes.length, 22);
  header.writeUInt16LE(name.length, 26);
  local.push(header, name, packed);
  const entry = Buffer.alloc(46);
  entry.writeUInt32LE(0x02014b50, 0);
  entry.writeUInt16LE(20, 4);
  entry.writeUInt16LE(20, 6);
  entry.writeUInt16LE(8, 10);
  entry.writeUInt16LE(33, 14);
  entry.writeUInt32LE(crc, 16);
  entry.writeUInt32LE(packed.length, 20);
  entry.writeUInt32LE(bytes.length, 24);
  entry.writeUInt16LE(name.length, 28);
  entry.writeUInt32LE(offset, 42);
  central.push(entry, name);
  offset += header.length + name.length + packed.length;
}
const directory = Buffer.concat(central),
  end = Buffer.alloc(22);
end.writeUInt32LE(0x06054b50, 0);
end.writeUInt16LE(files.length, 8);
end.writeUInt16LE(files.length, 10);
end.writeUInt32LE(directory.length, 12);
end.writeUInt32LE(offset, 16);
const target = path.join(root, 'frontend/public/downloads');
fs.mkdirSync(target, { recursive: true });
fs.writeFileSync(
  path.join(target, 'bagiya-focus-extension.zip'),
  Buffer.concat([...local, directory, end]),
);
console.log(`Packaged Bagiya Strict Focus (${files.length} files).`);
