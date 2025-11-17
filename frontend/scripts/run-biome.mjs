#!/usr/bin/env node
// @ts-nocheck

async function run() {
  const args = process.argv.slice(2);

  const { createRequire } = await import("node:module");
  const require = createRequire(import.meta.url);

  const platformMap = {
    win32: "win32",
    darwin: "darwin",
    linux: "linux",
  };
  const archMap = {
    x64: "x64",
    arm64: "arm64",
  };

  const platform = platformMap[process.platform];
  const arch = archMap[process.arch];
  let hasNativeCli = false;

  if (platform && arch) {
    const nativePackage = `@biomejs/cli-${platform}-${arch}`;
    try {
      require.resolve(nativePackage);
      hasNativeCli = true;
    } catch (error) {
      if (error?.code !== "MODULE_NOT_FOUND") {
        console.warn(`Biome native CLI resolution failed: ${String(error)}`);
      }
    }
  }

  if (hasNativeCli) {
    const { spawnSync } = await import("node:child_process");
    const { fileURLToPath } = await import("node:url");
    const { resolve } = await import("node:path");

    const binUrl = new URL(
      "../node_modules/@biomejs/biome/bin/biome",
      import.meta.url,
    );
    const binPath = resolve(fileURLToPath(binUrl));
    const result = spawnSync(process.execPath, [binPath, ...args], {
      stdio: "inherit",
    });

    if (result.error) {
      console.error(result.error);
      process.exit(typeof result.status === "number" ? result.status : 1);
      return;
    }

    process.exit(typeof result.status === "number" ? result.status : 0);
    return;
  }

  // Fallback: use wasm build.
  const originalArgv = [...process.argv];
  try {
    process.argv = [process.argv[0], "biome", ...args];
    await import("@biomejs/wasm-nodejs");
  } catch (error) {
    console.error("Failed to run Biome CLI using native or wasm builds.");
    console.error(error);
    process.exit(1);
  } finally {
    process.argv = originalArgv;
  }
}

run();
