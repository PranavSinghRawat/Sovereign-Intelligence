import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { runAllBenchmarks } from "./campBenchmark";
import { renderMarkdownReport, renderSummaryCsv } from "./metrics";

async function main(): Promise<void> {
  const reports = await runAllBenchmarks();

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
  await writeFile(
    path.join(outputDir, "camp-summary.csv"),
    renderSummaryCsv(reports)
  );

  const campSummary = reports[0].summary;
  console.log(`Benchmark complete: ${reports.length} reports generated.`);
  console.log(`Clean CAMP: ${campSummary.caseCount} cases, precision ${(campSummary.precision * 100).toFixed(1)}%, recall ${(campSummary.recall * 100).toFixed(1)}%, F1 ${(campSummary.f1 * 100).toFixed(1)}%.`);
  console.log(`Adversarial CAMP: ${reports[2].summary.caseCount} cases, precision ${(reports[2].summary.precision * 100).toFixed(1)}%, recall ${(reports[2].summary.recall * 100).toFixed(1)}%, F1 ${(reports[2].summary.f1 * 100).toFixed(1)}%.`);
  console.log("Wrote evaluation-results/camp-results.json, camp-summary.md, and camp-summary.csv");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
