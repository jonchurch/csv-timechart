#!/usr/bin/env node

const fs = require("fs");
const asciichart = require("asciichart");
const csvParse = require("csv-parse");
const path = require("path");
const yargs = require("yargs");

function displayGraph(filePath, hours) {
  console.log({ filePath });
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const parser = csvParse({ columns: true, cast: true });
  const records = parser.parse(fileContent);

  const startTime = Date.now() - hours * 60 * 60 * 1000;

  const filteredData = records
    .filter(
      (record) =>
        new Date(record.timestamp).getTime() > startTime &&
        record.credits !== null
    )
    .map((record) => parseFloat(record.credits));

  if (filteredData.length > 0) {
    const chart = asciichart.plot(filteredData, { height: 14 });
    console.clear();
    console.log(chart);
  } else {
    console.log("Insufficient data points to plot the graph.");
  }
}

const options = yargs
  .usage("Usage: csv-time-chart <file> [options]")
  .command("file", "CSV file path")
  .option("h", {
    alias: "hours",
    describe: "Number of hours of historical data to display",
    type: "number",
    default: 24,
  })
  .option("r", {
    alias: "refresh",
    describe: "Refresh interval in seconds",
    type: "number",
    default: 10,
  })
  .demandCommand(1)
  .help()
  .alias("help", "h").argv;

const { file: filePath } = options._;
const { hours, refresh } = options;

if (!filePath) {
  console.error("Error: A file path is required.");
  process.exit(1);
}

const absolutePath = path.resolve(filePath);
const refreshInterval = refresh * 1000;

setInterval(() => displayGraph(absolutePath, hours), refreshInterval);
