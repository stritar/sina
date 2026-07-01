import { EmulatorShell } from "./(emulator)/_components/EmulatorShell";

/**
 * The SINA Emulator — Phase 4's governed-agent sandbox. Left: a chat whose
 * replies mount only after the constitution clears them. Right: the interception
 * console (the X-ray). `?scenario=<id>` deep-links a canned stream.
 */
export default async function PlaygroundPage({
  searchParams,
}: {
  searchParams: Promise<{ scenario?: string }>;
}) {
  const { scenario } = await searchParams;
  return <EmulatorShell initialScenarioId={scenario} />;
}
