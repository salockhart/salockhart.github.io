import * as esbuild from "esbuild";
import minimist from "minimist";
import { extReloadPlugin } from "./plugins/extReloadPlugin";
import { manifestPlugin } from "./plugins/manifestPlugin";

const buildOptions = ({ debug, plugins }) => ({
  entryPoints: ["src/content.ts", "src/manifest.json"],
  bundle: true,
  minify: !debug,
  sourcemap: debug,
  outdir: "dist",
  logLevel: "info",
  plugins: [manifestPlugin(), ...(plugins || [])],
});

async function watch() {
  const ctx = await esbuild.context(
    buildOptions({ debug: true, plugins: [extReloadPlugin()] })
  );
  await ctx.watch();
}

async function build() {
  await esbuild.build(buildOptions({ debug: false, plugins: [] }));
}

const argv = minimist(process.argv.slice(2));
if (argv.watch) {
  watch();
} else {
  build();
}
