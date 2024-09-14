import * as esbuild from "esbuild";
import fs from "node:fs/promises";
import packageJson from "../../package.json";

function isKey(key: string): key is keyof typeof packageJson {
  return key in packageJson;
}

export const manifestPlugin: () => esbuild.Plugin = () => ({
  name: "manifest",
  setup(build) {
    build.onLoad({ filter: /manifest\.json$/ }, async (args) => {
      const content = JSON.parse(await fs.readFile(args.path, "utf8"));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updatedManifest: any = Object.entries(content)
        .map(([key, value]) => {
          if (isKey(key)) {
            return [key, packageJson[key]] as const;
          }
          return [key, value] as const;
        })
        .reduce(
          (acc, [key, value]) => ({ ...acc, [key]: value }),
          {} as Record<string, unknown>
        );

      return {
        contents: JSON.stringify(updatedManifest),
        loader: "copy",
      };
    });
  },
});
