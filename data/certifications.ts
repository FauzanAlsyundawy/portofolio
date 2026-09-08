import { type Certification } from "./types";

export const certifications: Certification[] = [
  {
    name: "CCNP Enterprise",
    issuer: "Cisco",
    credentialId: "CSCO12345678",
    issueDate: "2023-06",
    expiryDate: "2026-06",
    verifyUrl: "https://www.credly.com/badges/...",
  },
  {
    name: "MTCRE — MikroTik Certified Routing Engineer",
    issuer: "MikroTik",
    credentialId: "MT-RE-2023-001",
    issueDate: "2023-03",
    expiryDate: undefined,
    verifyUrl: "https://www.mikrotik.com/...",
  },
  {
    name: "MTCNA — MikroTik Certified Network Associate",
    issuer: "MikroTik",
    credentialId: "MT-NA-2022-005",
    issueDate: "2022-09",
    expiryDate: undefined,
    verifyUrl: "https://www.mikrotik.com/...",
  },
  {
    name: "APNIC Routing Security (RPKI & IRR)",
    issuer: "APNIC",
    credentialId: "APNIC-2024-RPKI",
    issueDate: "2024-02",
    expiryDate: undefined,
    verifyUrl: "https://www.apnic.net/...",
  },
];
