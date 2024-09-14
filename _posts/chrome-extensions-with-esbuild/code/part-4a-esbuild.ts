import * as esbuild from "esbuild";

esbuild.build({
  entryPoints: ["src/content.ts", "src/manifest.json"],
  bundle: true,
  outdir: "dist",
  logLevel: "info",
});
