import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  runCampBenchmark,
  runSimpleRegexBenchmark,
} from "./campBenchmark";
import { renderMarkdownReport } from "./metrics";

async function main(): Promise<void> {
  const reports = [
    await runCampBenchmark(),
    await runSimpleRegexBenchmark(),
  ];

  const outputDir = path.join(process.cwd(), "evaluation-results");
  await mkdir(outputDir, { recursive: true });
  await writeFile(
    path.join(outputDir, "camp-results.json"),
    `${JSON.stringify(reports, null, 2)}\n`
  );
  await writeFile(
    path.join(outputDir, "camp-summary.md"),
    renderMarkdownReport(reports)
  );

  const campSummary = reports[0].summary;
  console.log(
    `CAMP benchmark complete: ${campSummary.caseCount} cases, precision ${(campSummary.precision * 100).toFixed(1)}%, recall ${(campSummary.recall * 100).toFixed(1)}%, F1 ${(campSummary.f1 * 100).toFixed(1)}%.`
  );
  console.log("Wrote evaluation-results/camp-results.json and evaluation-results/camp-summary.md");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});

