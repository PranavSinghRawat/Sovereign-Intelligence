import { PIIType } from "../../lib/middleware/PIIRegistry";
import { PIIBenchmarkCase } from "../types";

const seedAdversarialBenchmarkCases: PIIBenchmarkCase[] = [
  {
    id: "adv-lowercase-name-location",
    category: "adversarial-casing",
    input: "my name is pranav rawat and i live in seattle with asthma.",
    expectedTypes: [PIIType.NAME, PIIType.LOCATION, PIIType.MEDICAL],
    shouldPrune: true,
    mustNotContain: ["pranav rawat", "seattle", "asthma"],
  },
  {
    id: "adv-spaced-email",
    category: "adversarial-obfuscation",
    input: "My email is pranav [at] example [dot] com and my password is BlueLamp77.",
    expectedTypes: [PIIType.EMAIL, PIIType.CREDENTIAL],
    shouldPrune: true,
    mustNotContain: ["pranav [at] example [dot] com", "BlueLamp77"],
  },
  {
    id: "adv-phone-words",
    category: "adversarial-obfuscation",
    input: "My phone is four one five five five five one two zero zero and my address is 12 Maple Street.",
    expectedTypes: [PIIType.PHONE, PIIType.ADDRESS],
    shouldPrune: true,
    mustNotContain: ["four one five", "12 Maple Street"],
  },
  {
    id: "adv-medical-synonym",
    category: "adversarial-medical",
    input: "I struggle with high blood pressure and moved to Austin.",
    expectedTypes: [PIIType.MEDICAL, PIIType.LOCATION],
    shouldPrune: true,
    mustNotContain: ["high blood pressure", "Austin"],
  },
  {
    id: "adv-secret-without-trigger",
    category: "adversarial-secret",
    input: "For recovery, remember blue-lamp-77.",
    expectedTypes: [PIIType.SENSITIVE_FIELD],
    shouldPrune: true,
    mustNotContain: ["blue-lamp-77"],
  },
  {
    id: "adv-card-with-dots",
    category: "adversarial-financial",
    input: "My card is 4111.1111.1111.1111 and my name is Maya Singh.",
    expectedTypes: [PIIType.FINANCIAL, PIIType.NAME],
    shouldPrune: true,
    mustNotContain: ["4111.1111.1111.1111", "Maya Singh"],
  },
  {
    id: "adv-aadhaar-spaced",
    category: "adversarial-identity",
    input: "My aadhaar number is 1234 5678 9012 and my phone is +1 415 555 1200.",
    expectedTypes: [PIIType.ID, PIIType.PHONE],
    shouldPrune: true,
    mustNotContain: ["1234 5678 9012", "+1 415 555 1200"],
  },
  {
    id: "adv-json-code-preservation",
    category: "adversarial-developer",
    input: "Use this JSON: `{\"email\":\"user@example.com\"}`. My private code is north-window.",
    expectedTypes: [PIIType.SENSITIVE_FIELD],
    shouldPrune: true,
    mustContain: ["`{\"email\":\"user@example.com\"}`"],
    mustNotContain: ["north-window"],
  },
  {
    id: "adv-multilingual-spanish",
    category: "adversarial-multilingual",
    input: "Mi nombre es Sofia Garcia y vivo en Austin. Tengo diabetes.",
    expectedTypes: [PIIType.NAME, PIIType.LOCATION, PIIType.MEDICAL],
    shouldPrune: true,
    mustNotContain: ["Sofia Garcia", "Austin", "diabetes"],
  },
  {
    id: "adv-multilingual-hindi-english",
    category: "adversarial-multilingual",
    input: "Mera naam Aarav Mehta hai, email aarav@example.com, aur password Secret123.",
    expectedTypes: [PIIType.NAME, PIIType.EMAIL, PIIType.CREDENTIAL],
    shouldPrune: true,
    mustNotContain: ["Aarav Mehta", "aarav@example.com", "Secret123"],
  },
  {
    id: "adv-benign-capitalized-topic",
    category: "adversarial-benign",
    input: "Explain public health resources in General Terms.",
    expectedTypes: [],
    shouldPrune: false,
    mustNotContain: [],
  },
  {
    id: "adv-benign-fake-password-code",
    category: "adversarial-benign",
    input: "In documentation, show `password = \"example\"` as a mock value.",
    expectedTypes: [],
    shouldPrune: false,
    mustContain: ["`password = \"example\"`"],
    mustNotContain: [],
  },
  {
    id: "adv-credential-api-key",
    category: "adversarial-credential",
    input: "My api key: sk-test-123456789 and my backup label is silver-door.",
    expectedTypes: [PIIType.CREDENTIAL, PIIType.SENSITIVE_FIELD],
    shouldPrune: true,
    mustNotContain: ["sk-test-123456789", "silver-door"],
  },
  {
    id: "adv-address-no-label",
    category: "adversarial-address",
    input: "Send the package to 44 Cedar Road, Seattle before Friday.",
    expectedTypes: [PIIType.ADDRESS],
    shouldPrune: true,
    mustNotContain: ["44 Cedar Road", "Seattle"],
  },
  {
    id: "adv-age-profession-lowercase",
    category: "adversarial-quasi",
    input: "i am 71 and work as a pharmacist in Boston.",
    expectedTypes: [PIIType.AGE, PIIType.PROFESSION, PIIType.LOCATION],
    shouldPrune: true,
    mustNotContain: ["71", "pharmacist", "Boston"],
  },
  {
    id: "adv-email-plus-secret",
    category: "adversarial-mixed",
    input: "Reach me at helper+urgent@example.org; the phrase we use for recovery is quiet harbor.",
    expectedTypes: [PIIType.EMAIL, PIIType.SENSITIVE_FIELD],
    shouldPrune: true,
    mustNotContain: ["helper+urgent@example.org", "quiet harbor"],
  },
  {
    id: "adv-medical-abbreviation",
    category: "adversarial-medical",
    input: "I have HTN and my phone is 212-555-8844.",
    expectedTypes: [PIIType.MEDICAL, PIIType.PHONE],
    shouldPrune: true,
    mustNotContain: ["HTN", "212-555-8844"],
  },
  {
    id: "adv-ssn-dashes",
    category: "adversarial-identity",
    input: "My ssn number is 123-45-6789 and my email is user@example.com.",
    expectedTypes: [PIIType.ID, PIIType.EMAIL],
    shouldPrune: true,
    mustNotContain: ["123-45-6789", "user@example.com"],
  },
  {
    id: "adv-banking-natural",
    category: "adversarial-financial",
    input: "The account I use for rent ends with 7788 and my private note is landlord bridge.",
    expectedTypes: [PIIType.FINANCIAL, PIIType.SENSITIVE_FIELD],
    shouldPrune: true,
    mustNotContain: ["7788", "landlord bridge"],
  },
  {
    id: "adv-location-lowercase",
    category: "adversarial-casing",
    input: "I moved to phoenix and my phone is 602-555-3399.",
    expectedTypes: [PIIType.LOCATION, PIIType.PHONE],
    shouldPrune: true,
    mustNotContain: ["phoenix", "602-555-3399"],
  },
];

const lowercasePeople = [
  ["aarav mehta", "mumbai", "diabetes"],
  ["maya singh", "delhi", "asthma"],
  ["john carter", "seattle", "anxiety"],
  ["sofia garcia", "austin", "migraine"],
  ["liam johnson", "boston", "hypertension"],
  ["emma wilson", "denver", "insomnia"],
  ["noah brown", "chicago", "arthritis"],
  ["olivia davis", "portland", "depression"],
  ["ethan miller", "phoenix", "thyroid"],
  ["ava martin", "atlanta", "epilepsy"],
] as const;

const obfuscatedEmails = [
  ["aarav [at] example [dot] com", "Secret100"],
  ["maya [at] aid [dot] org", "Secret101"],
  ["john [at] clinic [dot] net", "Secret102"],
  ["sofia [at] housing [dot] org", "Secret103"],
  ["liam [at] pantry [dot] org", "Secret104"],
  ["emma [at] support [dot] net", "Secret105"],
  ["noah [at] care [dot] org", "Secret106"],
  ["olivia [at] help [dot] org", "Secret107"],
  ["ethan [at] local [dot] net", "Secret108"],
  ["ava [at] route [dot] org", "Secret109"],
] as const;

const dottedCards = [
  "4111.1111.1111.1001",
  "4111.1111.1111.1002",
  "4111.1111.1111.1003",
  "4111.1111.1111.1004",
  "4111.1111.1111.1005",
  "4111.1111.1111.1006",
  "4111.1111.1111.1007",
  "4111.1111.1111.1008",
  "4111.1111.1111.1009",
  "4111.1111.1111.1010",
] as const;

const wordPhones = [
  "four one five five five five one two zero zero",
  "two one two five five five eight eight four four",
  "three zero three five five five nine one eight two",
  "six one seven five five five two two zero nine",
  "two zero six five five five four four one zero",
  "three one two five five five seven seven eight eight",
  "five zero three five five five six four zero zero",
  "four zero four five five five one zero one zero",
  "six zero two five five five three three nine nine",
  "two one four five five five six six seven seven",
] as const;

const noisyAddresses = [
  "12 Maple Street, Boston",
  "44 Cedar Road, Seattle",
  "901 Pine Avenue, Denver",
  "77 Market Street, San Francisco",
  "188 Lake View Drive, Chicago",
  "26 Hill Lane, Austin",
  "310 River Road, Portland",
  "62 Park Avenue, Atlanta",
  "9 Sunset Boulevard, Phoenix",
  "55 Oak Street, Dallas",
] as const;

const secrets = [
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

export const adversarialBenchmarkCases = buildAdversarialBenchmarkCases();

function buildAdversarialBenchmarkCases(): PIIBenchmarkCase[] {
  const generated: PIIBenchmarkCase[] = [];

  for (const [index, [name, city, condition]] of lowercasePeople.entries()) {
    generated.push({
      id: `adv-generated-lowercase-${index + 1}`,
      category: "adversarial-casing",
      input: `my name is ${name} and i live in ${city} with ${condition}.`,
      expectedTypes: [PIIType.NAME, PIIType.LOCATION, PIIType.MEDICAL],
      shouldPrune: true,
      mustNotContain: [name, city, condition],
    });
  }

  for (const [index, [email, password]] of obfuscatedEmails.entries()) {
    generated.push({
      id: `adv-generated-obfuscated-email-${index + 1}`,
      category: "adversarial-obfuscation",
      input: `My email is ${email} and my password ${password}.`,
      expectedTypes: [PIIType.EMAIL, PIIType.CREDENTIAL],
      shouldPrune: true,
      mustNotContain: [email, password],
    });
  }

  for (const [index, card] of dottedCards.entries()) {
    const [name] = lowercasePeople[index];
    generated.push({
      id: `adv-generated-dotted-card-${index + 1}`,
      category: "adversarial-financial",
      input: `My card is ${card} and my name is ${name}.`,
      expectedTypes: [PIIType.FINANCIAL, PIIType.NAME],
      shouldPrune: true,
      mustNotContain: [card, name],
    });
  }

  for (const [index, phone] of wordPhones.entries()) {
    const address = noisyAddresses[index];
    generated.push({
      id: `adv-generated-word-phone-${index + 1}`,
      category: "adversarial-obfuscation",
      input: `My phone is ${phone} and my address is ${address}.`,
      expectedTypes: [PIIType.PHONE, PIIType.ADDRESS],
      shouldPrune: true,
      mustNotContain: [phone, address],
    });
  }

  for (const [index, [name, city, condition]] of lowercasePeople.entries()) {
    const titleName = toTitleCase(name);
    generated.push({
      id: `adv-generated-spanish-${index + 1}`,
      category: "adversarial-multilingual",
      input: `Mi nombre es ${titleName} y vivo en ${toTitleCase(city)}. Tengo ${condition}.`,
      expectedTypes: [PIIType.NAME, PIIType.LOCATION, PIIType.MEDICAL],
      shouldPrune: true,
      mustNotContain: [titleName, toTitleCase(city), condition],
    });
  }

  for (const [index, [name]] of lowercasePeople.entries()) {
    const titleName = toTitleCase(name);
    const email = `${name.split(" ")[0]}@example.com`;
    const password = `HindiSecret${index + 1}`;
    generated.push({
      id: `adv-generated-hindi-english-${index + 1}`,
      category: "adversarial-multilingual",
      input: `Mera naam ${titleName} hai, email ${email}, aur password ${password}.`,
      expectedTypes: [PIIType.NAME, PIIType.EMAIL, PIIType.CREDENTIAL],
      shouldPrune: true,
      mustNotContain: [titleName, email, password],
    });
  }

  for (const [index, secret] of secrets.entries()) {
    generated.push({
      id: `adv-generated-code-preservation-${index + 1}`,
      category: "adversarial-developer",
      input: `Keep this test fixture: \`{"password":"${secret}"}\`. My private code is ${secrets[(index + 1) % secrets.length]}.`,
      expectedTypes: [PIIType.SENSITIVE_FIELD],
      shouldPrune: true,
      mustContain: [`\`{"password":"${secret}"}\``],
      mustNotContain: [secrets[(index + 1) % secrets.length]],
    });
  }

  for (const [index, secret] of secrets.entries()) {
    generated.push({
      id: `adv-generated-recovery-secret-${index + 1}`,
      category: "adversarial-secret",
      input: `For recovery, remember ${secret}.`,
      expectedTypes: [PIIType.SENSITIVE_FIELD],
      shouldPrune: true,
      mustNotContain: [secret],
    });
  }

  return [...seedAdversarialBenchmarkCases, ...generated].slice(0, 100);
}

function toTitleCase(value: string): string {
  return value.replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
}
