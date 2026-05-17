export function calcularComissao(
  valorMensal: number,
  percentual: number
): number {
  return parseFloat(((valorMensal * percentual) / 100).toFixed(2));
}

// Faixas etárias ANS para cálculo de cotação
export const FAIXAS_ANS = [
  { label: "0 a 18 anos", min: 0, max: 18, fator: 1.0 },
  { label: "19 a 23 anos", min: 19, max: 23, fator: 1.0 },
  { label: "24 a 28 anos", min: 24, max: 28, fator: 1.17 },
  { label: "29 a 33 anos", min: 29, max: 33, fator: 1.31 },
  { label: "34 a 38 anos", min: 34, max: 38, fator: 1.48 },
  { label: "39 a 43 anos", min: 39, max: 43, fator: 1.71 },
  { label: "44 a 48 anos", min: 44, max: 48, fator: 2.0 },
  { label: "49 a 53 anos", min: 49, max: 53, fator: 2.34 },
  { label: "54 a 58 anos", min: 54, max: 58, fator: 2.86 },
  { label: "59 anos ou mais", min: 59, max: 999, fator: 3.0 },
];

export function calcularIdade(dataNascimento: Date): number {
  const hoje = new Date();
  let idade = hoje.getFullYear() - dataNascimento.getFullYear();
  const m = hoje.getMonth() - dataNascimento.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < dataNascimento.getDate())) {
    idade--;
  }
  return idade;
}

export function getFaixaANS(dataNascimento: Date) {
  const idade = calcularIdade(dataNascimento);
  return FAIXAS_ANS.find((f) => idade >= f.min && idade <= f.max) ?? FAIXAS_ANS[FAIXAS_ANS.length - 1];
}
