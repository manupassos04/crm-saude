/**
 * Seed das tabelas de preços extraídas das planilhas:
 * - Cotador Wallau - 02.04.2026.xls
 * - ORÇAMENTO UNIMED_VENDAS PJ v. 01.04.2026.xlsx
 *
 * Roda com: npx tsx prisma/seed-tabela-precos.ts <organizationId>
 */
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  ssl: { rejectUnauthorized: false },
  max: 1,
});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const FAIXAS = ["0-18", "19-23", "24-28", "29-33", "34-38", "39-43", "44-48", "49-53", "54-58", "59+"] as const;

type Faixa = typeof FAIXAS[number];
type Linha = Record<Faixa, number>;

function linha(vals: number[]): Linha {
  return Object.fromEntries(FAIXAS.map((f, i) => [f, vals[i]])) as Linha;
}

// ────────────────────────────────────────────
// AMIL (MEI - 2 vidas)
// ────────────────────────────────────────────
const AMIL: { plano: string; acomodacao: string; coparticipacao: boolean; valores: Linha }[] = [
  { plano: "Prata", acomodacao: "SEMI_PRIVATIVO", coparticipacao: false, valores: linha([421.74, 493.44, 602.00, 722.40, 758.52, 834.37, 1042.96, 1147.26, 1434.08, 2509.64]) },
  { plano: "Prata", acomodacao: "PRIVATIVO", coparticipacao: false, valores: linha([468.12, 547.70, 668.19, 801.83, 841.92, 926.11, 1157.64, 1273.40, 1591.75, 2785.56]) },
  { plano: "Prata", acomodacao: "SEMI_PRIVATIVO", coparticipacao: true, valores: linha([463.91, 542.77, 662.18, 794.62, 834.36, 917.79, 1147.24, 1261.96, 1577.45, 2760.54]) },
  { plano: "Prata", acomodacao: "PRIVATIVO", coparticipacao: true, valores: linha([514.93, 602.47, 735.01, 882.01, 926.11, 1018.72, 1273.40, 1400.74, 1750.93, 3064.13]) },
  { plano: "Ouro", acomodacao: "SEMI_PRIVATIVO", coparticipacao: false, valores: linha([479.57, 561.10, 684.54, 821.45, 862.52, 948.77, 1185.96, 1304.56, 1630.70, 2853.73]) },
  { plano: "Ouro", acomodacao: "PRIVATIVO", coparticipacao: false, valores: linha([532.32, 622.81, 759.83, 911.80, 957.39, 1053.13, 1316.41, 1448.05, 1810.06, 3167.61]) },
  { plano: "Ouro", acomodacao: "SEMI_PRIVATIVO", coparticipacao: true, valores: linha([527.53, 617.21, 753.00, 903.60, 948.78, 1043.66, 1304.58, 1435.04, 1793.80, 3139.15]) },
  { plano: "Ouro", acomodacao: "PRIVATIVO", coparticipacao: true, valores: linha([585.56, 685.11, 835.83, 1003.00, 1053.15, 1158.47, 1448.09, 1592.90, 1991.13, 3484.48]) },
  { plano: "S-380", acomodacao: "SEMI_PRIVATIVO", coparticipacao: false, valores: linha([482.43, 564.44, 688.62, 826.34, 867.66, 954.43, 1193.04, 1312.34, 1640.43, 2870.75]) },
  { plano: "S-380", acomodacao: "PRIVATIVO", coparticipacao: false, valores: linha([521.01, 609.58, 743.69, 892.43, 937.05, 1030.76, 1288.45, 1417.30, 1771.63, 3100.35]) },
  { plano: "S-380", acomodacao: "SEMI_PRIVATIVO", coparticipacao: true, valores: linha([327.76, 383.48, 467.85, 561.42, 589.49, 648.44, 810.55, 891.61, 1114.51, 1950.39]) },
  { plano: "S-380", acomodacao: "PRIVATIVO", coparticipacao: true, valores: linha([353.97, 414.14, 505.25, 606.30, 636.62, 700.28, 875.35, 962.89, 1203.61, 2106.32]) },
  { plano: "S-450", acomodacao: "SEMI_PRIVATIVO", coparticipacao: false, valores: linha([548.57, 641.83, 783.03, 939.64, 986.62, 1085.28, 1356.60, 1492.26, 1865.33, 3264.33]) },
  { plano: "S-450", acomodacao: "PRIVATIVO", coparticipacao: false, valores: linha([592.47, 693.19, 845.69, 1014.83, 1065.57, 1172.13, 1465.16, 1611.68, 2014.60, 3525.55]) },
  { plano: "S-450", acomodacao: "SEMI_PRIVATIVO", coparticipacao: true, valores: linha([372.70, 436.06, 531.99, 638.39, 670.31, 737.34, 921.68, 1013.85, 1267.31, 2217.79]) },
  { plano: "S-450", acomodacao: "PRIVATIVO", coparticipacao: true, valores: linha([402.52, 470.95, 574.56, 689.47, 723.94, 796.33, 995.41, 1094.95, 1368.69, 2395.21]) },
  { plano: "S-750 R1", acomodacao: "SEMI_PRIVATIVO", coparticipacao: false, valores: linha([629.40, 736.40, 898.41, 1078.09, 1131.99, 1245.19, 1556.49, 1712.14, 2140.18, 3745.32]) },
  { plano: "S-750 R1", acomodacao: "SEMI_PRIVATIVO", coparticipacao: true, valores: linha([427.61, 500.30, 610.37, 732.44, 769.06, 845.97, 1057.46, 1163.21, 1454.01, 2544.52]) },
];

// ────────────────────────────────────────────
// SUL AMÉRICA (FLEX/MEI/Individual)
// ────────────────────────────────────────────
const SUL_AMERICA: { plano: string; acomodacao: string; coparticipacao: boolean; valores: Linha }[] = [
  { plano: "Exato", acomodacao: "SEMI_PRIVATIVO", coparticipacao: false, valores: linha([471.99, 589.98, 731.58, 812.06, 868.90, 1007.94, 1204.90, 1412.14, 1681.16, 2831.93]) },
  { plano: "Exato", acomodacao: "PRIVATIVO", coparticipacao: false, valores: linha([495.55, 619.43, 768.10, 852.60, 912.27, 1058.25, 1265.04, 1482.63, 1765.08, 2973.29]) },
  { plano: "Exato", acomodacao: "SEMI_PRIVATIVO", coparticipacao: true, valores: linha([330.40, 412.99, 512.11, 568.45, 608.24, 705.56, 843.44, 988.51, 1176.82, 1982.37]) },
  { plano: "Exato", acomodacao: "PRIVATIVO", coparticipacao: true, valores: linha([346.89, 433.60, 537.67, 596.82, 638.60, 740.78, 885.54, 1037.85, 1235.57, 2081.32]) },
  { plano: "Especial RC", acomodacao: "PRIVATIVO", coparticipacao: false, valores: linha([528.86, 661.07, 819.73, 909.90, 973.59, 1129.38, 1350.05, 1582.25, 1883.67, 3173.03]) },
  { plano: "Especial 100 R1", acomodacao: "PRIVATIVO", coparticipacao: false, valores: linha([556.69, 695.86, 862.87, 957.79, 1024.83, 1188.82, 1421.10, 1665.52, 1982.80, 3340.02]) },
  { plano: "Especial RC", acomodacao: "PRIVATIVO", coparticipacao: true, valores: linha([396.64, 495.80, 614.79, 682.42, 730.19, 847.03, 1012.53, 1186.68, 1412.75, 2379.76]) },
  { plano: "Especial 100 R1", acomodacao: "PRIVATIVO", coparticipacao: true, valores: linha([417.52, 521.89, 647.15, 718.34, 768.62, 891.61, 1065.82, 1249.13, 1487.09, 2505.00]) },
];

// ────────────────────────────────────────────
// BRADESCO (MEI - 3 vidas ou 1 titular)
// ────────────────────────────────────────────
const BRADESCO: { plano: string; acomodacao: string; coparticipacao: boolean; valores: Linha }[] = [
  { plano: "Flex", acomodacao: "SEMI_PRIVATIVO", coparticipacao: false, valores: linha([549.36, 648.24, 784.37, 941.25, 1073.01, 1105.20, 1345.66, 1582.76, 1883.49, 3295.92]) },
  { plano: "Flex", acomodacao: "PRIVATIVO", coparticipacao: false, valores: linha([574.87, 678.34, 820.79, 984.96, 1122.84, 1156.52, 1408.15, 1656.26, 1970.95, 3448.97]) },
  { plano: "Flex", acomodacao: "SEMI_PRIVATIVO", coparticipacao: true, valores: linha([439.49, 518.59, 627.50, 753.00, 858.41, 884.16, 1076.53, 1266.21, 1506.80, 2636.75]) },
  { plano: "Flex", acomodacao: "PRIVATIVO", coparticipacao: true, valores: linha([459.90, 542.68, 656.64, 787.97, 898.27, 925.22, 1126.52, 1325.01, 1576.77, 2759.19]) },
  { plano: "Top Nacional", acomodacao: "SEMI_PRIVATIVO", coparticipacao: false, valores: linha([560.55, 661.45, 800.34, 960.42, 1094.87, 1127.72, 1373.06, 1614.99, 1921.84, 3363.02]) },
  { plano: "Top Nacional", acomodacao: "PRIVATIVO", coparticipacao: false, valores: linha([586.58, 692.16, 837.50, 1005.02, 1145.71, 1180.09, 1436.82, 1689.98, 2011.08, 3519.18]) },
  { plano: "Top Nacional", acomodacao: "SEMI_PRIVATIVO", coparticipacao: true, valores: linha([448.44, 529.16, 640.27, 768.34, 875.90, 902.18, 1098.45, 1292.00, 1537.48, 2690.43]) },
  { plano: "Top Nacional", acomodacao: "PRIVATIVO", coparticipacao: true, valores: linha([469.27, 553.73, 670.01, 804.02, 916.57, 944.07, 1149.46, 1351.99, 1608.87, 2815.36]) },
  { plano: "Nacional 2", acomodacao: "PRIVATIVO", coparticipacao: false, valores: linha([615.94, 726.81, 879.42, 1055.32, 1203.06, 1239.15, 1508.74, 1774.57, 2111.74, 3695.33]) },
  { plano: "Nacional 2", acomodacao: "PRIVATIVO", coparticipacao: true, valores: linha([492.75, 581.45, 703.54, 844.26, 962.45, 991.33, 1207.00, 1419.66, 1689.40, 2956.28]) },
  { plano: "Nacional 3", acomodacao: "PRIVATIVO", coparticipacao: false, valores: linha([665.22, 784.96, 949.79, 1139.76, 1299.31, 1338.30, 1629.45, 1916.55, 2280.70, 3990.99]) },
  { plano: "Nacional 3", acomodacao: "PRIVATIVO", coparticipacao: true, valores: linha([532.18, 627.97, 759.83, 911.81, 1039.45, 1070.64, 1303.56, 1533.25, 1824.57, 3192.80]) },
];

// ────────────────────────────────────────────
// DOCTOR CLIN — Ambulatorial (Porte I: 2-5 vidas)
// ────────────────────────────────────────────
const DOCTOR_CLIN: { plano: string; acomodacao: string; coparticipacao: boolean; valores: Linha }[] = [
  { plano: "Saúde-1", acomodacao: "SEM_ACOMODACAO", coparticipacao: true, valores: linha([71.41, 84.44, 89.90, 98.02, 108.22, 125.50, 161.12, 177.82, 264.83, 361.91]) },
  { plano: "Just-1", acomodacao: "SEM_ACOMODACAO", coparticipacao: true, valores: linha([102.67, 120.88, 128.68, 140.33, 154.91, 179.64, 230.66, 254.56, 379.11, 518.07]) },
  { plano: "Just-2", acomodacao: "SEM_ACOMODACAO", coparticipacao: false, valores: linha([112.53, 132.52, 141.06, 153.85, 169.81, 196.89, 252.86, 279.06, 415.56, 567.91]) },
  { plano: "Max", acomodacao: "SEM_ACOMODACAO", coparticipacao: true, valores: linha([140.99, 166.00, 176.75, 192.72, 212.76, 246.68, 316.76, 349.57, 520.62, 711.50]) },
  { plano: "Bem", acomodacao: "SEM_ACOMODACAO", coparticipacao: true, valores: linha([61.88, 72.85, 77.56, 84.56, 93.37, 108.27, 139.02, 153.41, 228.48, 312.24]) },
  // Porte II: 6-29 vidas
  { plano: "Saúde-1 (6-29v)", acomodacao: "SEM_ACOMODACAO", coparticipacao: true, valores: linha([64.56, 76.00, 80.91, 88.22, 97.40, 112.95, 145.01, 160.04, 238.34, 325.71]) },
  { plano: "Just-1 (6-29v)", acomodacao: "SEM_ACOMODACAO", coparticipacao: true, valores: linha([92.40, 108.81, 115.82, 126.31, 139.43, 161.66, 207.60, 229.12, 341.19, 466.26]) },
  { plano: "Max (6-29v)", acomodacao: "SEM_ACOMODACAO", coparticipacao: true, valores: linha([126.89, 149.40, 159.08, 173.45, 191.48, 222.01, 285.10, 314.62, 468.56, 640.34]) },
  { plano: "Bem (6-29v)", acomodacao: "SEM_ACOMODACAO", coparticipacao: true, valores: linha([55.68, 65.57, 69.81, 76.10, 84.03, 97.43, 125.11, 138.08, 205.64, 281.01]) },
];

// ────────────────────────────────────────────
// ONMED (1-29 vidas)
// ────────────────────────────────────────────
const ONMED: { plano: string; acomodacao: string; coparticipacao: boolean; valores: Linha }[] = [
  { plano: "Slim", acomodacao: "SEM_ACOMODACAO", coparticipacao: false, valores: linha([68.03, 80.21, 89.03, 99.36, 108.80, 125.77, 159.35, 188.67, 266.02, 372.43]) },
  { plano: "Slim", acomodacao: "SEM_ACOMODACAO", coparticipacao: true, valores: linha([43.28, 51.02, 56.63, 63.20, 69.20, 80.00, 101.36, 120.01, 169.21, 236.90]) },
  { plano: "Select c/Obs", acomodacao: "SEMI_PRIVATIVO", coparticipacao: false, valores: linha([152.74, 186.04, 203.90, 222.26, 271.37, 309.63, 423.27, 502.84, 816.10, 916.44]) },
  { plano: "Select c/Obs", acomodacao: "PRIVATIVO", coparticipacao: false, valores: linha([196.78, 239.68, 262.68, 286.32, 349.61, 398.90, 545.30, 647.82, 1051.40, 1180.68]) },
  { plano: "Select c/Obs", acomodacao: "SEMI_PRIVATIVO", coparticipacao: true, valores: linha([118.16, 143.91, 157.73, 171.92, 209.93, 239.52, 327.43, 388.99, 631.33, 708.96]) },
  { plano: "Select c/Obs", acomodacao: "PRIVATIVO", coparticipacao: true, valores: linha([153.79, 187.30, 205.28, 223.75, 273.20, 311.72, 426.13, 506.24, 821.62, 922.68]) },
  { plano: "Select s/Obs", acomodacao: "SEMI_PRIVATIVO", coparticipacao: false, valores: linha([118.03, 143.76, 157.56, 171.74, 209.70, 239.27, 327.09, 388.57, 630.64, 708.18]) },
  { plano: "Select s/Obs", acomodacao: "PRIVATIVO", coparticipacao: false, valores: linha([152.06, 185.21, 202.99, 221.26, 270.16, 308.25, 421.37, 500.59, 812.45, 912.36]) },
  { plano: "Select s/Obs", acomodacao: "SEMI_PRIVATIVO", coparticipacao: true, valores: linha([91.30, 111.20, 121.87, 132.84, 162.20, 185.07, 252.99, 300.55, 487.79, 547.80]) },
  { plano: "Select s/Obs", acomodacao: "PRIVATIVO", coparticipacao: true, valores: linha([118.83, 144.73, 158.62, 172.90, 211.11, 240.88, 329.29, 391.20, 634.91, 712.98]) },
  { plano: "Comfort c/Obs", acomodacao: "SEMI_PRIVATIVO", coparticipacao: false, valores: linha([226.30, 275.63, 302.08, 329.27, 402.05, 458.74, 627.10, 744.99, 1209.11, 1357.78]) },
  { plano: "Comfort c/Obs", acomodacao: "PRIVATIVO", coparticipacao: false, valores: linha([175.65, 213.95, 234.49, 255.60, 312.08, 356.07, 486.76, 578.27, 938.52, 1053.91]) },
  { plano: "Comfort c/Obs", acomodacao: "SEMI_PRIVATIVO", coparticipacao: true, valores: linha([176.86, 215.40, 236.07, 257.31, 314.18, 358.48, 490.05, 582.18, 944.86, 1061.08]) },
  { plano: "Comfort c/Obs", acomodacao: "PRIVATIVO", coparticipacao: true, valores: linha([135.88, 165.50, 181.39, 197.71, 241.42, 275.45, 376.54, 447.34, 726.03, 815.30]) },
  { plano: "Comfort s/Obs", acomodacao: "SEMI_PRIVATIVO", coparticipacao: false, valores: linha([135.73, 165.32, 181.19, 197.50, 241.16, 275.16, 376.15, 446.86, 725.24, 814.41]) },
  { plano: "Comfort s/Obs", acomodacao: "PRIVATIVO", coparticipacao: false, valores: linha([174.87, 212.99, 233.44, 254.45, 310.68, 354.49, 484.58, 575.68, 934.32, 1049.21]) },
  { plano: "Comfort s/Obs", acomodacao: "SEMI_PRIVATIVO", coparticipacao: true, valores: linha([105.00, 127.88, 140.15, 152.77, 186.53, 212.83, 290.94, 345.63, 560.96, 629.97]) },
  { plano: "Comfort s/Obs", acomodacao: "PRIVATIVO", coparticipacao: true, valores: linha([136.65, 166.44, 182.41, 198.84, 242.78, 277.01, 378.68, 449.88, 730.15, 819.93]) },
];

// ────────────────────────────────────────────
// UNIMED VALE DO SINOS (2-99 vidas)
// ────────────────────────────────────────────
const UNIMED_VS: { plano: string; acomodacao: string; coparticipacao: boolean; valores: Linha }[] = [
  // Hospitalar Vale do Sinos
  { plano: "JRM2 - Acesso Integral Regional", acomodacao: "SEMI_PRIVATIVO", coparticipacao: true, valores: linha([199.50, 219.45, 239.40, 299.25, 339.15, 399.00, 498.75, 638.40, 897.75, 1195.01]) },
  { plano: "JRC2 - Completo Regional", acomodacao: "SEMI_PRIVATIVO", coparticipacao: true, valores: linha([284.17, 312.59, 341.00, 426.26, 483.09, 568.34, 710.43, 909.34, 1278.77, 1702.18]) },
  { plano: "JRX2 - Semi-Privativo Regional", acomodacao: "SEMI_PRIVATIVO", coparticipacao: true, valores: linha([183.11, 201.42, 219.73, 274.67, 311.29, 366.22, 457.78, 585.95, 824.00, 1096.83]) },
  // Hospitalar Nacional
  { plano: "JNM2 - Acesso Integral Nacional", acomodacao: "SEMI_PRIVATIVO", coparticipacao: true, valores: linha([277.42, 305.16, 332.90, 416.13, 471.61, 554.84, 693.55, 887.74, 1248.39, 1661.75]) },
  { plano: "JNC2 - Completo Nacional", acomodacao: "SEMI_PRIVATIVO", coparticipacao: true, valores: linha([444.20, 488.62, 533.04, 666.30, 755.14, 888.40, 1110.50, 1421.44, 1998.90, 2660.76]) },
  { plano: "JNC1 - Completo Nacional Privativo", acomodacao: "PRIVATIVO", coparticipacao: true, valores: linha([485.72, 534.29, 582.86, 728.58, 825.72, 971.44, 1214.30, 1554.30, 2185.74, 2909.46]) },
  // Ambulatorial (1 vida - tabela base)
  { plano: "JRX - Essencial Ambulatorial", acomodacao: "SEM_ACOMODACAO", coparticipacao: true, valores: linha([73.87, 73.87, 73.87, 73.87, 73.87, 73.87, 73.87, 73.87, 73.87, 73.87]) },
  { plano: "JRM - Básico Regional Ambulatorial", acomodacao: "SEM_ACOMODACAO", coparticipacao: true, valores: linha([188.63, 188.63, 188.63, 188.63, 188.63, 188.63, 188.63, 188.63, 188.63, 188.63]) },
];

// ────────────────────────────────────────────
// UNIMED EMPRESARIAL PJ (da planilha de orçamento)
// ────────────────────────────────────────────
const UNIMED_PJ: { plano: string; acomodacao: string; coparticipacao: boolean; valores: Linha }[] = [
  // Preços base da aba Base: 1 vida / 2+ vidas
  { plano: "Essencial Empresa (JRX)", acomodacao: "SEM_ACOMODACAO", coparticipacao: false, valores: linha([82.42, 82.42, 82.42, 82.42, 82.42, 82.42, 82.42, 82.42, 82.42, 82.42]) },
  { plano: "Básico Regional (JRM)", acomodacao: "SEM_ACOMODACAO", coparticipacao: false, valores: linha([188.63, 188.63, 188.63, 188.63, 188.63, 188.63, 188.63, 188.63, 188.63, 188.63]) },
  { plano: "Básico Estadual (JEM)", acomodacao: "SEM_ACOMODACAO", coparticipacao: false, valores: linha([208.27, 208.27, 208.27, 208.27, 208.27, 208.27, 208.27, 208.27, 208.27, 208.27]) },
  { plano: "Básico Nacional (EANT)", acomodacao: "SEM_ACOMODACAO", coparticipacao: false, valores: linha([289.69, 289.69, 289.69, 289.69, 289.69, 289.69, 289.69, 289.69, 289.69, 289.69]) },
  { plano: "Acesso Integral Regional (JRM2)", acomodacao: "SEMI_PRIVATIVO", coparticipacao: true, valores: linha([190.44, 190.44, 190.44, 190.44, 190.44, 190.44, 190.44, 190.44, 190.44, 190.44]) },
  { plano: "Completo Regional (JRC2)", acomodacao: "SEMI_PRIVATIVO", coparticipacao: true, valores: linha([291.33, 291.33, 291.33, 291.33, 291.33, 291.33, 291.33, 291.33, 291.33, 291.33]) },
  { plano: "Acesso Integral Nacional (JNM2)", acomodacao: "SEMI_PRIVATIVO", coparticipacao: true, valores: linha([291.23, 291.23, 291.23, 291.23, 291.23, 291.23, 291.23, 291.23, 291.23, 291.23]) },
  { plano: "Completo Nacional (JNC2)", acomodacao: "SEMI_PRIVATIVO", coparticipacao: true, valores: linha([438.09, 438.09, 438.09, 438.09, 438.09, 438.09, 438.09, 438.09, 438.09, 438.09]) },
  { plano: "Master (JNM1)", acomodacao: "PRIVATIVO", coparticipacao: false, valores: linha([910.33, 910.33, 910.33, 910.33, 910.33, 910.33, 910.33, 910.33, 910.33, 910.33]) },
];

async function seed(organizationId: string) {
  console.log(`\nSeedando tabela de preços para org: ${organizationId}\n`);

  const grupos = [
    { operadora: "AMIL", planos: AMIL },
    { operadora: "Sul América", planos: SUL_AMERICA },
    { operadora: "Bradesco", planos: BRADESCO },
    { operadora: "Doctor Clin", planos: DOCTOR_CLIN },
    { operadora: "OnMed", planos: ONMED },
    { operadora: "UNIMED Vale do Sinos", planos: UNIMED_VS },
    { operadora: "UNIMED Empresarial", planos: UNIMED_PJ },
  ];

  let total = 0;
  for (const { operadora, planos } of grupos) {
    for (const item of planos) {
      for (const faixa of FAIXAS) {
        const valor = item.valores[faixa];
        await prisma.tabelaPreco.upsert({
          where: {
            organizationId_operadora_plano_faixaEtaria_acomodacao_coparticipacao: {
              organizationId,
              operadora,
              plano: item.plano,
              faixaEtaria: faixa,
              acomodacao: item.acomodacao,
              coparticipacao: item.coparticipacao,
            },
          },
          update: { valor },
          create: {
            organizationId,
            operadora,
            plano: item.plano,
            faixaEtaria: faixa,
            acomodacao: item.acomodacao,
            coparticipacao: item.coparticipacao,
            valor,
          },
        });
        total++;
      }
    }
    console.log(`  ✓ ${operadora} (${planos.length} planos)`);
  }

  console.log(`\nTotal: ${total} registros inseridos/atualizados.`);
  await prisma.$disconnect();
  await pool.end();
}

const orgId = process.argv[2];
if (!orgId) {
  console.error("Uso: npx tsx prisma/seed-tabela-precos.ts <organizationId>");
  process.exit(1);
}

seed(orgId).catch((e) => { console.error(e); process.exit(1); });
