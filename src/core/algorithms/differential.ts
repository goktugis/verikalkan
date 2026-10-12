/**
 * Diferansiyel Gizlilik (Differential Privacy) & Veri Bozulumu (Perturbation) Motoru
 * 
 * Sayısal (maaş, bakiye, yaş, tutar) ve tarihsel alanlara Laplace / Gauss gürültüsü
 * ekleyerek bireysel kimliği gizler, ancak veri kümesinin genel istatistiksel
 * dağılımını ve ortalamasını korur.
 */

/**
 * Laplace Gürültüsü Üreticisi
 * @param sensitivity Veri kümesinin hassasiyeti (Delta f)
 * @param epsilon Gizlilik bütçesi (Epsilon - küçüldükçe gizlilik artar, gürültü büyür)
 */
export function sampleLaplaceNoise(sensitivity: number = 1.0, epsilon: number = 1.0): number {
  const safeEpsilon = Math.max(0.01, epsilon);
  const scale = sensitivity / safeEpsilon;
  
  // Uniform [-0.5, 0.5)
  const u = Math.random() - 0.5;
  const sgn = u < 0 ? -1 : 1;
  
  return -scale * sgn * Math.log(1 - 2 * Math.abs(u));
}

/**
 * Sayısal değere Diferansiyel Gizlilik gürültüsü uygular
 */
export function perturbNumeric(
  value: number,
  epsilon: number = 1.0,
  minVal?: number,
  maxVal?: number,
  round: boolean = true
): number {
  const noise = sampleLaplaceNoise(Math.abs(value) * 0.1, epsilon);
  let perturbed = value + noise;

  if (minVal !== undefined && perturbed < minVal) perturbed = minVal;
  if (maxVal !== undefined && perturbed > maxVal) perturbed = maxVal;

  return round ? Math.round(perturbed) : Math.round(perturbed * 100) / 100;
}

/**
 * Tarih verisine kontrollü jitter (sapma) ekler (Örn: +/- 15 gün)
 */
export function perturbDate(dateStr: string, maxJitterDays: number = 14): string {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;

    const jitterDays = Math.floor((Math.random() * 2 - 1) * maxJitterDays);
    date.setDate(date.getDate() + jitterDays);

    return date.toISOString().split('T')[0];
  } catch {
    return dateStr;
  }
}
