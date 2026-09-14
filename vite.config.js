import { defineConfig } from "vite";
import fs from "node:fs";
import { fileURLToPath, URL } from "node:url";
import path from "node:path";

const dataDirectory = fileURLToPath(new URL("./data", import.meta.url));

function copyDataFiles() {
  return {
    name: "copy-data-files",
    writeBundle({ dir }) {
      const outputDataDirectory = path.join(dir, "data");
      fs.mkdirSync(outputDataDirectory, { recursive: true });
      for (const fileName of fs.readdirSync(dataDirectory)) {
        fs.copyFileSync(
          path.join(dataDirectory, fileName),
          path.join(outputDataDirectory, fileName)
        );
      }
    },
  };
}

export default defineConfig({
  plugins: [copyDataFiles()],
  server: {
    port: 5173,
    open: true,
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@data": fileURLToPath(new URL("./data", import.meta.url)),
      "@assets": fileURLToPath(new URL("./assets", import.meta.url)),
      "@js": fileURLToPath(new URL("./js", import.meta.url)),
    },
  },
});
