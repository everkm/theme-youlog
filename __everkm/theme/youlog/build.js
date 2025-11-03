import * as esbuild from "esbuild";
import stylePlugin from "esbuild-style-plugin";
import { solidPlugin } from "esbuild-plugin-solid";
import path from "path";
import postcssImport from "postcss-import";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";
import tailwindcssNesting from "tailwindcss/nesting/index.js";
import { writeFileSync, mkdirSync } from "fs";
import chokidar from "chokidar";

// 检查是否处于开发模式
const isWatch = process.argv.includes("--watch");
const isDev = process.env.NODE_ENV !== "production";

let basePrefix = trimSlash(
  process.env.BASE_PREFIX ? `${process.env.BASE_PREFIX}` : ""
);
// 构建输出目录
const distBaseDir = trimSlash(`./dist/${basePrefix}`);
const distDir = `${distBaseDir}/assets`;
console.log(
  `Building with esbuild in ${
    isDev ? "watch" : "production"
  } mode, distDir: ${distDir}`
);

// Manifest 文件路径
const manifestPath = path.resolve(process.cwd(), "assets-manifest.json");

function trimSlash(str) {
  return str.replace(/^\/+|\/+$/g, "");
}

// manifest 插件
const manifestPlugin = {
  name: "manifest",
  setup(build) {
    const manifest = {
      entrypoints: {},
    };

    build.onEnd(async (result) => {
      if (result.errors.length > 0) return;

      // 获取输出文件列表
      const outputFiles = result.metafile.outputs;

      // 更新 manifest
      Object.entries(outputFiles).forEach(([filepath, info]) => {
        const filename = path.basename(filepath);

        // 从 entryPoints 配置中获取原始名称映射
        const getOriginalName = (filename) => {
          const entryPointsMap = Object.fromEntries(
            entryPoints.map((entry) => [entry.out, entry.out])
          );

          for (const [entryName, originalName] of Object.entries(
            entryPointsMap
          )) {
            if (isDev) {
              if (
                filename === originalName + ".js" ||
                filename === originalName + ".css"
              ) {
                return originalName;
              }
            } else {
              // 修改匹配逻辑，使用更宽松的匹配方式
              const baseName = filename.split(".")[0];
              if (baseName.startsWith(originalName)) {
                return originalName;
              }
            }
          }
          return null;
        };

        const originalName = getOriginalName(filename);
        if (!originalName) return;

        // 确保 entrypoint 对象存在
        if (!manifest.entrypoints[originalName]) {
          manifest.entrypoints[originalName] = {
            assets: {
              js: [],
              css: [],
            },
          };
        }

        // 根据文件类型记录
        const assetPath = path.relative("dist", filepath);
        if (filename.endsWith(".js")) {
          manifest.entrypoints[originalName].assets.js.push(assetPath);
        } else if (filename.endsWith(".css")) {
          manifest.entrypoints[originalName].assets.css.push(assetPath);
        }
      });

      // 写入 manifest 文件
      writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
      console.log("Manifest file generated:", manifestPath);
    });

    build.onStart(() => {
      // 清空 manifest
      manifest.entrypoints = {};
    });
  },
};

// 多入口点配置
const entryPoints = [
  {
    in: "src/index.ts",
    out: "youlog",
  },
  {
    in: "src/plugins/in_search/index.ts",
    out: "plugin-in-search",
  },
];

// SSR 入口点配置
const ssrEntryPoint = {
  in: "src/js_render/index.tsx",
  out: "everkm-render",
};

// 构建配置
const buildOptions = {
  target: "es2020",
  platform: "browser",
  format: "iife",
  entryPoints: Object.fromEntries(
    entryPoints.map((entry) => [entry.out, entry.in])
  ),
  bundle: true,
  outdir: distDir,
  entryNames: isDev ? "[name]" : "[name].[hash]",
  assetNames: isDev ? "[name]" : "[name].[hash]",
  metafile: true,
  minify: !isDev,
  sourcemap: false,
  loader: {
    ".js": "jsx",
    ".jsx": "jsx",
    ".ts": "tsx",
    ".tsx": "tsx",
  },
  jsx: "preserve",
  jsxImportSource: "solid-js",
  define: {
    "process.env.NODE_ENV": JSON.stringify(
      isDev ? "development" : "production"
    ),
  },
  plugins: [
    manifestPlugin,
    solidPlugin({
      solid: {
        generate: "dom",
        hydratable: true,
      },
    }),
    stylePlugin({
      postcss: {
        plugins: [
          postcssImport,
          tailwindcssNesting,
          tailwindcss({
            config: path.resolve(process.cwd(), "tailwind.config.js"),
          }),
          autoprefixer,
        ],
      },
      cssModules: false,
      extract: true,
      output: isDev ? `${distDir}/[name].css` : `${distDir}/[name].[hash].css`,
    }),
  ],
};

// 添加分析构建产物的函数
function analyzeBundle(metafile) {
  console.log("\n📊 依赖大小分析:");
  const outputs = metafile.outputs;

  for (const [outFile, info] of Object.entries(outputs)) {
    if (!outFile.endsWith(".js")) continue;

    console.log(`\n文件: ${path.basename(outFile)}`);
    console.log(`总大小: ${(info.bytes / 1024).toFixed(2)} KB`);

    if (info.inputs) {
      console.log("\n依赖分析:");
      const deps = Object.entries(info.inputs)
        .map(([name, data]) => ({
          name: name
            .replace(/^node_modules\/\.pnpm\//, "")
            .replace(/\/node_modules\//, "/")
            .replace(/\/dist\/.*$/, ""),
          size: data.bytesInOutput,
        }))
        .filter((dep) => dep.size > 0)
        .sort((a, b) => b.size - a.size);

      deps.forEach((dep) => {
        console.log(`  - ${dep.name}: ${(dep.size / 1024).toFixed(2)} KB`);
      });
    }
  }

  // 将分析结果写入文件
  const analysisPath = path.join(
    path.dirname(manifestPath),
    "bundle-analysis.json"
  );
  writeFileSync(analysisPath, JSON.stringify(metafile, null, 2));
  console.log(`\n详细分析已保存到: ${analysisPath}`);
}

// SSR 构建配置
function getSSRBuildOptions() {
  return {
    entryPoints: {
      [ssrEntryPoint.out]: ssrEntryPoint.in,
    },
    bundle: true,
    outfile: `${distBaseDir}/../templates/${ssrEntryPoint.out}.js`,
    metafile: true,
    minify: false,
    sourcemap: false,
    format: "esm",
    platform: "node",
    target: "es2020",
    define: {
      "process.env.NODE_ENV": JSON.stringify(
        isDev ? "development" : "production"
      ),
      global: "globalThis",
    },
    loader: {
      ".js": "jsx",
      ".jsx": "jsx",
      ".ts": "tsx",
      ".tsx": "tsx",
    },
    jsx: "preserve",
    jsxImportSource: "solid-js",
    plugins: [
      solidPlugin({
        solid: {
          generate: "ssr",
          hydratable: false,
        },
      }),
    ],
  };
}

async function build() {
  if (isWatch) {
    // 开发模式：使用 context API 进行监听
    const ctx = await esbuild.context(buildOptions);
    // 启动时先执行一次构建以生成 manifest
    try {
      await ctx.rebuild();
      console.log("Initial build succeeded (manifest generated)");
    } catch (error) {
      console.error("Initial build failed:", error);
    }

    // 使用 chokidar 监听额外的文件
    const watchPaths = [
      "src/**/*.{js,jsx,ts,tsx}",
      "src/**/*.{css,scss}",
      "templates/**/*.{html,md}",
      "tailwind.config.js",
    ];

    console.log("Watching for changes in:");
    watchPaths.forEach((watchPath) => console.log(`- ${watchPath}`));

    // 添加 chokidar 监听
    const watcher = chokidar.watch(watchPaths, {
      persistent: true,
      ignoreInitial: true,
    });

    watcher.on("all", async (event, filePath) => {
      console.log(`File ${filePath} changed (${event}), rebuilding...`);
      try {
        // 触发重新构建
        await ctx.rebuild();
        console.log("Rebuild succeeded");
      } catch (error) {
        console.error("Rebuild failed:", error);
      }
    });

    // 让 esbuild 也保持监听状态
    await ctx.watch();
    console.log("esbuild watching for changes...");
  } else {
    // 生产模式：一次性构建
    const result = await esbuild.build(buildOptions);
    // analyzeBundle(result.metafile)
    console.log("Build completed successfully!");
    process.exit(0);
  }
}

// SSR 构建函数
async function buildSSR() {
  const isSSR = process.argv.includes("--ssr") || process.env.SSR === "true";

  if (!isSSR) {
    console.log("Building regular bundle (not SSR)...");
    await build();
    return;
  }

  console.log("Building SSR bundle...");

  try {
    // 确保输出目录存在
    const ssrDir = path.dirname(`${distBaseDir}/ssr/${ssrEntryPoint.out}.js`);
    mkdirSync(ssrDir, { recursive: true });

    // 获取 SSR 构建配置
    const ssrOptions = getSSRBuildOptions();

    const result = await esbuild.build(ssrOptions);
    console.log("SSR build completed successfully!");
    console.log("Output:", ssrOptions.outfile);
    process.exit(0);
  } catch (error) {
    console.error("SSR build failed:", error);
    process.exit(1);
  }
}

buildSSR().catch((error) => {
  console.error("Build failed:", error);
  process.exit(1);
});
