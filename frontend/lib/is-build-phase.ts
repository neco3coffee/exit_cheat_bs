const BUILD_PHASE_TOKENS = new Set(["true", "1", "phase-production-build"]);

export function isBuildPhase(): boolean {
  const explicit = process.env.IS_BUILD;
  if (explicit) {
    const normalized = explicit.toLowerCase();
    if (BUILD_PHASE_TOKENS.has(normalized)) {
      return true;
    }
  }

  const nextPhase = process.env.NEXT_PHASE;
  if (nextPhase && nextPhase.toLowerCase() === "phase-production-build") {
    return true;
  }

  return false;
}
