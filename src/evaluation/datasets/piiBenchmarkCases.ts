import { PIIType } from "../../lib/middleware/PIIRegistry";
import seedCases from "./pii-benchmark.json";
import { PIIBenchmarkCase } from "../types";

const TARGET_CASE_COUNT = 100;

const people = [
  ["Aarav Mehta", "Mumbai", "diabetes"],
  ["Maya Singh", "Delhi", "asthma"],
  ["John Carter", "Seattle", "anxiety"],
  ["Sofia Garcia", "Austin", "migraine"],
  ["Liam Johnson", "Boston", "hypertension"],
  ["Emma Wilson", "Denver", "insomnia"],
  ["Noah Brown", "Chicago", "arthritis"],
  ["Olivia Davis", "Portland", "depression"],
  ["Ethan Miller", "Phoenix", "thyroid"],
  ["Ava Martin", "Atlanta", "epilepsy"],
] as const;

const addresses = [
  "12 Maple Street Apartment 2A, Boston",
  "44 Cedar Road, Seattle",
  "901 Pine Avenue Unit 5, Denver",
  "77 Market Street, San Francisco",
  "188 Lake View Drive, Chicago",
  "26 Hill Lane, Austin",
  "310 River Road, Portland",
  "62 Park Avenue, Atlanta",
  "9 Sunset Boulevard, Phoenix",
  "55 Oak Street, Dallas",
] as const;

const phoneNumbers = [
  "415-555-1200",
  "212-555-8844",
  "303-555-9182",
  "617-555-2209",
  "206-555-4410",
  "312-555-7788",
  "503-555-6400",
  "404-555-1010",
  "602-555-3399",
  "214-555-6677",
] as const;

const secretValues = [
  "blue-lamp-77",
  "north-window",
  "silver-door",
  "delta-forest-19",
  "orange-moon",
  "river-stone-42",
  "hidden-bridge",
  "winter-key-08",
  "quiet-harbor",
  "green-vault-6",
] as const;

const benignPrompts = [
  "Where can I find a food bank near the downtown area?",
  "Summarize how browser local storage works.",
  "Write a JavaScript function that validates a form field.",
  "Explain the history of community clinics.",
  "What should a privacy policy include?",
  "Compare local inference and cloud inference at a high level.",
  "List common accessibility checks for a web app.",
  "Help me outline a README for a software project.",
  "Explain why caching improves web performance.",
  "What is WebRTC used for?",
] as const;

export const piiBenchmarkCases = buildBenchmarkCases();

function buildBenchmarkCases(): PIIBenchmarkCase[] {
  const cases: PIIBenchmarkCase[] = [...(seedCases as PIIBenchmarkCase[])];

  for (const [index, [name, city, condition]] of people.entries()) {
    cases.push({
      id: `generated-medical-${index + 1}`,
      category: "medical",
      input: `My name is ${name}. I live in ${city} and have ${condition}.`,
      expectedTypes: [PIIType.NAME, PIIType.LOCATION, PIIType.MEDICAL],
      shouldPrune: true,
      mustNotContain: [name, city, condition],
    });
  }

  for (const [index, address] of addresses.entries()) {
    const email = `resident${index + 1}@example.com`;
    cases.push({
      id: `generated-address-${index + 1}`,
      category: "address",
      input: `My address is ${address} and my email is ${email}.`,
      expectedTypes: [PIIType.ADDRESS, PIIType.EMAIL],
      shouldPrune: true,
      mustNotContain: [address, email],
    });
  }

  for (const [index, phone] of phoneNumbers.entries()) {
    const [name] = people[index];
    cases.push({
      id: `generated-phone-${index + 1}`,
      category: "contact",
      input: `Call me ${name}. My phone is ${phone}.`,
      expectedTypes: [PIIType.NAME, PIIType.PHONE],
      shouldPrune: true,
      mustNotContain: [name, phone],
    });
  }

  for (const [index, secret] of secretValues.entries()) {
    cases.push({
      id: `generated-secret-${index + 1}`,
      category: "sensitive-field",
      input: `The thing I use to unlock my account is ${secret}.`,
      expectedTypes: [PIIType.SENSITIVE_FIELD],
      shouldPrune: true,
      mustNotContain: [secret],
    });
  }

  for (let index = 0; index < 10; index++) {
    const card = `4111 1111 1111 ${String(1000 + index).padStart(4, "0")}`;
    cases.push({
      id: `generated-financial-${index + 1}`,
      category: "financial",
      input: `My credit card number is ${card} and I need help with a bill.`,
      expectedTypes: [PIIType.FINANCIAL],
      shouldPrune: true,
      mustNotContain: [card],
    });
  }

  for (let index = 0; index < 10; index++) {
    const passport = `P${index + 1}A${index + 3}B${index + 5}C`;
    const phone = phoneNumbers[index];
    cases.push({
      id: `generated-id-${index + 1}`,
      category: "identity",
      input: `My passport number is ${passport} and my phone is ${phone}.`,
      expectedTypes: [PIIType.ID, PIIType.PHONE],
      shouldPrune: true,
      mustNotContain: [passport, phone],
    });
  }

  for (const [index, prompt] of benignPrompts.entries()) {
    cases.push({
      id: `generated-benign-${index + 1}`,
      category: "benign",
      input: prompt,
      expectedTypes: [],
      shouldPrune: false,
      mustNotContain: [],
    });
  }

  for (let index = 0; index < 8; index++) {
    const secret = secretValues[index];
    cases.push({
      id: `generated-code-preservation-${index + 1}`,
      category: "developer-workflow",
      input: `Use this fixture only in tests: \`const password = "${secret}"\`. My private note is ${secretValues[index + 1]}.`,
      expectedTypes: [PIIType.SENSITIVE_FIELD],
      shouldPrune: true,
      mustContain: [`\`const password = "${secret}"\``],
      mustNotContain: [secretValues[index + 1]],
    });
  }

  for (let index = 0; index < 6; index++) {
    const age = String(68 + index);
    cases.push({
      id: `generated-quasi-${index + 1}`,
      category: "quasi-identifiers",
      input: `I am ${age} years old and I am a pharmacist looking for transportation aid.`,
      expectedTypes: [PIIType.AGE, PIIType.PROFESSION],
      shouldPrune: false,
      mustNotContain: [],
    });
  }

  return cases.slice(0, TARGET_CASE_COUNT);
}

