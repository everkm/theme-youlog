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

// ==================== 配置和工具函数 ====================

// 检查是否处于开发模式
const isDev = process.argv.includes("--dev");
const isWatch = process.argv.includes("--watch") || isDev;
const isDevMode = isDev || process.env.NODE_ENV !== "production";
const isSSR = process.argv.includes("--ssr") || process.env.SSR === "true";

let basePrefix = trimSlash(
  process.env.BASE_PREFIX ? `${process.env.BASE_PREFIX}` : ""
);
// 构建输出目录
const distBaseDir = trimSlash(`./dist/${basePrefix}`);
const distDir = `${distBaseDir}/assets`;
console.log(
  `Building with esbuild in ${
    isDevMode ? "development" : "production"
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
            if (isDevMode) {
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

// 客户端构建配置
function getClientBuildOptions() {
  return {
    target: "es2020",
    platform: "browser",
    format: "iife",
    entryPoints: Object.fromEntries(
      entryPoints.map((entry) => [entry.out, entry.in])
    ),
    bundle: true,
    outdir: distDir,
    entryNames: isDevMode ? "[name]" : "[name].[hash]",
    assetNames: isDevMode ? "[name]" : "[name].[hash]",
    metafile: true,
    minify: !isDevMode,
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
        isDevMode ? "development" : "production"
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
        output: isDevMode ? `${distDir}/[name].css` : `${distDir}/[name].[hash].css`,
      }),
    ],
  };
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
        isDevMode ? "development" : "production"
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

// ==================== Watch 模式工具函数 ====================

// 监听文件变化的路径
const WATCH_PATHS = [
  "src/**/*.{js,jsx,ts,tsx}",
  "src/**/*.{css,scss}",
];

// 设置文件监听
function setupFileWatcher(onChange) {
  console.log("Watching for changes in:");
  WATCH_PATHS.forEach((watchPath) => console.log(`- ${watchPath}`));

  const watcher = chokidar.watch(WATCH_PATHS, {
    persistent: true,
    ignoreInitial: true,
  });

  watcher.on("all", async (event, filePath) => {
    console.log(`File ${filePath} changed (${event}), rebuilding...`);
    await onChange(event, filePath);
  });

  return watcher;
}

// ==================== 客户端 Bundle 构建 ====================

/**
 * 构建客户端 bundle（普通 bundle）
 */
async function buildClientBundle() {
  const buildOptions = getClientBuildOptions();

  if (isWatch) {
    // Watch 模式
    const ctx = await esbuild.context(buildOptions);
    
    // 初始构建
    try {
      await ctx.rebuild();
      console.log("Client bundle: Initial build succeeded (manifest generated)");
    } catch (error) {
      console.error("Client bundle: Initial build failed:", error);
    }

    // 设置文件监听
    // 注意：只使用 chokidar 监听，不启动 esbuild watch，避免重复触发
    setupFileWatcher(async () => {
      try {
        await ctx.rebuild();
        console.log("Client bundle: Rebuild succeeded");
      } catch (error) {
        console.error("Client bundle: Rebuild failed:", error);
      }
    });

    // 不启动 esbuild watch，因为已经使用 chokidar 手动触发 rebuild
    // 这样可以避免重复触发导致 manifest 被写入两次
    console.log("Client bundle: Watching for changes (using chokidar)...");
    
    return ctx;
  } else {
    // 生产模式：一次性构建
    const result = await esbuild.build(buildOptions);
    // analyzeBundle(result.metafile)
    console.log("Client bundle: Build completed successfully!");
    return null;
  }
}

// ==================== SSR Bundle 构建 ====================

/**
 * 构建 SSR bundle
 */
async function buildSSRBundle() {
  // 确保输出目录存在
  const ssrDir = path.dirname(`${distBaseDir}/../templates/${ssrEntryPoint.out}.js`);
  mkdirSync(ssrDir, { recursive: true });

  const ssrOptions = getSSRBuildOptions();

  if (isWatch) {
    // Watch 模式
    const ssrCtx = await esbuild.context(ssrOptions);

    // 初始构建
    try {
      await ssrCtx.rebuild();
      console.log("SSR bundle: Initial build succeeded");
      console.log("SSR Output:", ssrOptions.outfile);
    } catch (error) {
      console.error("SSR bundle: Initial build failed:", error);
    }

    // 设置文件监听
    // 注意：只使用 chokidar 监听，不启动 esbuild watch，避免重复触发
    setupFileWatcher(async () => {
      try {
        await ssrCtx.rebuild();
        console.log("SSR bundle: Rebuild succeeded");
      } catch (error) {
        console.error("SSR bundle: Rebuild failed:", error);
      }
    });

    // 不启动 esbuild watch，因为已经使用 chokidar 手动触发 rebuild
    // 这样可以避免重复触发
    console.log("SSR bundle: Watching for changes (using chokidar)...");
    
    return ssrCtx;
  } else {
    // 生产模式：一次性构建
    const result = await esbuild.build(ssrOptions);
    console.log("SSR bundle: Build completed successfully!");
    console.log("SSR Output:", ssrOptions.outfile);
    return null;
  }
}

// ==================== 主函数 ====================

/**
 * 主构建函数
 */
async function main() {
  try {
    if (isSSR) {
      // SSR 模式：同时构建客户端和 SSR bundle
      console.log("Building SSR bundle...");
      
      if (isWatch) {
        // Watch 模式：同时监听两个构建
        const clientCtx = await esbuild.context(getClientBuildOptions());
        const ssrCtx = await esbuild.context(getSSRBuildOptions());

        // 初始构建
        try {
          await Promise.all([clientCtx.rebuild(), ssrCtx.rebuild()]);
          console.log("Initial build succeeded (both client and SSR)");
          console.log("SSR Output:", getSSRBuildOptions().outfile);
        } catch (error) {
          console.error("Initial build failed:", error);
        }

        // 设置文件监听（同时触发两个构建）
        // 注意：只使用 chokidar 监听，不启动 esbuild watch，避免重复触发
        setupFileWatcher(async () => {
          try {
            await Promise.all([clientCtx.rebuild(), ssrCtx.rebuild()]);
            console.log("Rebuild succeeded (both client and SSR)");
          } catch (error) {
            console.error("Rebuild failed:", error);
          }
        });

        // 不启动 esbuild watch，因为已经使用 chokidar 手动触发 rebuild
        // 这样可以避免重复触发导致 manifest 被写入两次
        console.log("Watching for changes (using chokidar)...");
      } else {
        // 生产模式：一次性构建
        await Promise.all([
          esbuild.build(getClientBuildOptions()),
          esbuild.build(getSSRBuildOptions())
        ]);
        console.log("Build completed successfully (both client and SSR)!");
        console.log("SSR Output:", getSSRBuildOptions().outfile);
        process.exit(0);
      }
    } else {
      // 普通模式：只构建客户端 bundle
      console.log("Building client bundle (not SSR)...");
      await buildClientBundle();
      
      if (!isWatch) {
        process.exit(0);
      }
    }
  } catch (error) {
    console.error("Build failed:", error);
    process.exit(1);
  }
}

// 启动构建
main().catch((error) => {
  console.error("Build failed:", error);
  process.exit(1);
});
