import Papa from 'papaparse';

/**
 * TarımViz Veri Modeli
 * 
 * Zorunlu sütunlar:
 * il, yil, sektor, urun, uretim_miktari, uretim_birimi, kaynak, cografi_duzey
 * 
 * İsteğe bağlı sütunlar:
 * fiyat, fiyat_birimi, toplam_maliyet_tl, maliyet_durumu, donem, veri_durumu
 */

export type SektorType = 'bitkisel' | 'hayvansal';
export type CografiDuzeyType = 'İl' | 'İBBS Düzey 3';
export type MaliyetDurumuType = 'gerceklesen' | 'tahmini' | 'belirtilmemis';
export type VeriDurumuType = 'kesin' | 'gecici' | 'revize' | 'kullanici_beyani';

export interface TarimRecord {
  id: string;
  il: string;
  yil: number;
  sektor: SektorType;
  urun: string;
  uretim_miktari: number;
  uretim_birimi: string;
  kaynak: string;
  cografi_duzey: CografiDuzeyType;

  // İsteğe bağlı alanlar
  fiyat?: number;
  fiyat_birimi?: string;
  toplam_maliyet_tl?: number;
  maliyet_durumu?: MaliyetDurumuType;
  donem?: string;
  veri_durumu?: VeriDurumuType;

  // Hesaplanmış metrikler (Sadece kurallara uyuyorsa türetilir)
  hesaplanan_gelir_tl?: number;
  hesaplanan_brut_marj_tl?: number;
  marj_hesaplanabilir: boolean;
  marj_engeli_sebebi?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  records: TarimRecord[];
}

export interface SummaryKPIs {
  toplamUretimAdet: number;
  toplamGelirTL: number | null;
  toplamMaliyetTL: number | null;
  toplamBrutMarjTL: number | null;
  gelirKapsananUrunSayisi: number;
  maliyetKapsananUrunSayisi: number;
  marjKapsananUrunSayisi: number;
  toplamKayitSayisi: number;
}

/**
 * Birim uyumluluk denetleyicisi:
 * Üretim birimi ile Fiyat birimi arasında uyum kontrolü yapar.
 * Örn: üretim Ton iken fiyat TL/Ton ise uyumludur.
 * Örn: üretim Ton iken fiyat TL/Kg ise (1000 ile çarparak) dönüştürülür.
 */
export function calculateRevenue(miktari: number, birim: string, fiyat?: number, fiyatBirimi?: string): number | null {
  if (fiyat === undefined || fiyat === null || isNaN(fiyat) || fiyat <= 0) {
    return null;
  }

  const uBirimi = birim.trim().toLowerCase();
  const fBirimi = (fiyatBirimi || '').trim().toLowerCase();

  // Fiyat TL veya ₺ cinsinden olmalıdır
  if (fBirimi && !fBirimi.includes('tl') && !fBirimi.includes('₺')) {
    return null;
  }

  // Doğrudan uyum (TL/Ton x Ton, TL/Kg x Kg, TL/Lt x Lt, TL/Adet x Adet)
  if (
    (uBirimi === 'ton' && fBirimi.includes('ton')) ||
    (uBirimi === 'kg' && fBirimi.includes('kg')) ||
    (uBirimi === 'litre' && fBirimi.includes('litre')) ||
    (uBirimi === 'lt' && fBirimi.includes('lt')) ||
    (uBirimi === 'adet' && fBirimi.includes('adet')) ||
    (uBirimi === 'baş' && fBirimi.includes('baş'))
  ) {
    return miktari * fiyat;
  }

  // Ton üretim, TL/Kg fiyat (1 Ton = 1000 Kg)
  if (uBirimi === 'ton' && fBirimi.includes('kg')) {
    return miktari * 1000 * fiyat;
  }

  // Kg üretim, TL/Ton fiyat (1 Kg = 0.001 Ton)
  if (uBirimi === 'kg' && fBirimi.includes('ton')) {
    return (miktari / 1000) * fiyat;
  }

  // Fiyat birimi genel "TL" veya boş ise doğrudan çarpılır
  if (!fBirimi || fBirimi === 'tl' || fBirimi === '₺') {
    return miktari * fiyat;
  }

  // Bilinmeyen / uyuşmayan birim durumunda gelir hesaplanmaz
  return null;
}

/**
 * Brüt Marj Hesaplama Kuralları:
 * 1. Gelir mutlaka hesaplanmış olmalıdır.
 * 2. Maliyet kesinlikle eksik olmamalıdır (null veya undefined olamaz).
 * 3. Maliyet kullanıcı tarafından açıkça "gerceklesen" (doğrudan ölçülmüş) olarak etiketlenmelidir.
 *    Tahmini, endeksten türetilmiş veya doğrulanmamış maliyetler kesinlikle brüt marja dahil edilmez!
 * 4. Maliyetin olmaması "0 TL maliyet" olarak varsayılamaz!
 */
export function evaluateGrossMargin(
  gelir: number | null,
  maliyet?: number,
  maliyetDurumu?: MaliyetDurumuType
): { marj: number | null; canCalculate: boolean; reason?: string } {
  if (gelir === null || gelir === undefined) {
    return { marj: null, canCalculate: false, reason: 'Gelir hesaplanamadı (fiyat eksik veya uyumsuz).' };
  }

  if (maliyet === undefined || maliyet === null || isNaN(maliyet)) {
    return { marj: null, canCalculate: false, reason: 'Maliyet verisi bulunamadı (eksik veri sıfır maliyet kabul edilmez).' };
  }

  if (maliyetDurumu !== 'gerceklesen') {
    return { 
      marj: null, 
      canCalculate: false, 
      reason: `Maliyet durumu "${maliyetDurumu || 'belirtilmemiş'}" olarak işaretlenmiş. Yalnızca gerçekleşen/doğrudan ölçülen maliyetlerle marj hesaplanır.` 
    };
  }

  return { marj: gelir - maliyet, canCalculate: true };
}

/**
 * CSV Metnini Parse ve Şema Doğrulama
 */
export function parseAndValidateCSV(csvText: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const records: TarimRecord[] = [];

  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase().replace(/\s+/g, '_')
  });

  if (parsed.errors && parsed.errors.length > 0) {
    parsed.errors.forEach(err => errors.push(`CSV Ayrıştırma Hatası (Satır ${err.row}): ${err.message}`));
  }

  const requiredFields = [
    'il', 'yil', 'sektor', 'urun', 'uretim_miktari', 'uretim_birimi', 'kaynak', 'cografi_duzey'
  ];

  if (!parsed.data || parsed.data.length === 0) {
    errors.push('Yüklenen CSV dosyası boş veya başlık satırı okunamadı.');
    return { valid: false, errors, warnings, records: [] };
  }

  const headers = Object.keys(parsed.data[0]);
  const missingHeaders = requiredFields.filter(f => !headers.includes(f));
  if (missingHeaders.length > 0) {
    errors.push(`Zorunlu sütunlar eksik: ${missingHeaders.join(', ')}. Şablonu indirip kontrol ediniz.`);
    return { valid: false, errors, warnings, records: [] };
  }

  parsed.data.forEach((row, index) => {
    const lineNum = index + 2;

    const il = (row['il'] || '').trim();
    const yilStr = (row['yil'] || '').trim();
    const sektorRaw = (row['sektor'] || '').trim().toLowerCase();
    const urun = (row['urun'] || '').trim();
    const miktarStr = (row['uretim_miktari'] || '').trim().replace(',', '.');
    const uretimBirimi = (row['uretim_birimi'] || '').trim();
    const kaynak = (row['kaynak'] || '').trim();
    const cografiDuzeyRaw = (row['cografi_duzey'] || '').trim();

    if (!il || !yilStr || !sektorRaw || !urun || !miktarStr || !uretimBirimi || !kaynak || !cografiDuzeyRaw) {
      warnings.push(`Satır ${lineNum}: Zorunlu alanlardan biri boş olduğu için bu satır atlandı.`);
      return;
    }

    const yil = parseInt(yilStr, 10);
    if (isNaN(yil) || yil < 1900 || yil > 2100) {
      warnings.push(`Satır ${lineNum}: Geçersiz yıl "${yilStr}".`);
      return;
    }

    const uretimMiktari = parseFloat(miktarStr);
    if (isNaN(uretimMiktari) || uretimMiktari < 0) {
      warnings.push(`Satır ${lineNum}: Geçersiz üretim miktarı "${miktarStr}".`);
      return;
    }

    // Coğrafi düzey kısıtı: Yalnızca 'İl' veya 'İBBS Düzey 3'
    let cografiDuzey: CografiDuzeyType;
    if (cografiDuzeyRaw.toLowerCase() === 'il' || cografiDuzeyRaw.toLowerCase() === 'i̇l') {
      cografiDuzey = 'İl';
    } else if (cografiDuzeyRaw.toLowerCase().includes('ibbs') || cografiDuzeyRaw.toLowerCase().includes('i̇bbs') || cografiDuzeyRaw.includes('3')) {
      cografiDuzey = 'İBBS Düzey 3';
    } else {
      warnings.push(`Satır ${lineNum}: Geçersiz coğrafi düzey "${cografiDuzeyRaw}". Sadece "İl" veya "İBBS Düzey 3" kabul edilir (ilçe verisi kabul edilmez).`);
      return;
    }

    // Sektör: bitkisel veya hayvansal
    let sektor: SektorType;
    if (sektorRaw.includes('bitki') || sektorRaw === 'tarla' || sektorRaw === 'bahce') {
      sektor = 'bitkisel';
    } else if (sektorRaw.includes('hayvan') || sektorRaw.includes('hayvancilik')) {
      sektor = 'hayvansal';
    } else {
      warnings.push(`Satır ${lineNum}: Geçersiz sektör "${sektorRaw}". "bitkisel" veya "hayvansal" olmalıdır.`);
      return;
    }

    // İsteğe bağlı alanlar
    let fiyat: number | undefined = undefined;
    if (row['fiyat'] && row['fiyat'].trim() !== '') {
      const f = parseFloat(row['fiyat'].trim().replace(',', '.'));
      if (!isNaN(f) && f > 0) fiyat = f;
    }
    const fiyatBirimi = row['fiyat_birimi'] ? row['fiyat_birimi'].trim() : undefined;

    let toplamMaliyetTL: number | undefined = undefined;
    if (row['toplam_maliyet_tl'] && row['toplam_maliyet_tl'].trim() !== '') {
      const m = parseFloat(row['toplam_maliyet_tl'].trim().replace(',', '.'));
      if (!isNaN(m) && m >= 0) toplamMaliyetTL = m;
    }

    let maliyetDurumu: MaliyetDurumuType = 'belirtilmemis';
    const mDurumRaw = (row['maliyet_durumu'] || '').trim().toLowerCase();
    if (mDurumRaw.includes('gercek') || mDurumRaw.includes('ölçülen') || mDurumRaw.includes('olculen')) {
      maliyetDurumu = 'gerceklesen';
    } else if (mDurumRaw.includes('tahmin') || mDurumRaw.includes('endeks')) {
      maliyetDurumu = 'tahmini';
    }

    const donem = row['donem'] ? row['donem'].trim() : undefined;
    
    let veriDurumu: VeriDurumuType = 'kullanici_beyani';
    const vDurumRaw = (row['veri_durumu'] || '').trim().toLowerCase();
    if (vDurumRaw.includes('kesin')) veriDurumu = 'kesin';
    else if (vDurumRaw.includes('gecici')) veriDurumu = 'gecici';
    else if (vDurumRaw.includes('revize')) veriDurumu = 'revize';

    // Gelir ve Marj Hesabı
    const hesaplananGelir = calculateRevenue(uretimMiktari, uretimBirimi, fiyat, fiyatBirimi);
    const marjDegerlendirme = evaluateGrossMargin(hesaplananGelir, toplamMaliyetTL, maliyetDurumu);

    records.push({
      id: `rec-${yil}-${il}-${urun}-${index}`,
      il,
      yil,
      sektor,
      urun,
      uretim_miktari: uretimMiktari,
      uretim_birimi: uretimBirimi,
      kaynak,
      cografi_duzey: cografiDuzey,
      fiyat,
      fiyat_birimi: fiyatBirimi,
      toplam_maliyet_tl: toplamMaliyetTL,
      maliyet_durumu: maliyetDurumu,
      donem,
      veri_durumu: veriDurumu,
      hesaplanan_gelir_tl: hesaplananGelir !== null ? hesaplananGelir : undefined,
      hesaplanan_brut_marj_tl: marjDegerlendirme.marj !== null ? marjDegerlendirme.marj : undefined,
      marj_hesaplanabilir: marjDegerlendirme.canCalculate,
      marj_engeli_sebebi: marjDegerlendirme.reason
    });
  });

  return {
    valid: errors.length === 0 && records.length > 0,
    errors,
    warnings,
    records
  };
}

/**
 * Filtrelenmiş veri setine ait KPI özetini hesaplama
 */
export function computeKPIs(records: TarimRecord[]): SummaryKPIs {
  let toplamGelir: number | null = null;
  let toplamMaliyet: number | null = null;
  let toplamBrutMarj: number | null = null;

  let gelirUrunSayisi = 0;
  let maliyetUrunSayisi = 0;
  let marjUrunSayisi = 0;

  records.forEach(r => {
    if (r.hesaplanan_gelir_tl !== undefined && r.hesaplanan_gelir_tl !== null) {
      toplamGelir = (toplamGelir || 0) + r.hesaplanan_gelir_tl;
      gelirUrunSayisi++;
    }

    if (r.toplam_maliyet_tl !== undefined && r.toplam_maliyet_tl !== null && r.maliyet_durumu === 'gerceklesen') {
      toplamMaliyet = (toplamMaliyet || 0) + r.toplam_maliyet_tl;
      maliyetUrunSayisi++;
    }

    if (r.hesaplanan_brut_marj_tl !== undefined && r.hesaplanan_brut_marj_tl !== null) {
      toplamBrutMarj = (toplamBrutMarj || 0) + r.hesaplanan_brut_marj_tl;
      marjUrunSayisi++;
    }
  });

  return {
    toplamUretimAdet: records.length,
    toplamGelirTL: toplamGelir,
    toplamMaliyetTL: toplamMaliyet,
    toplamBrutMarjTL: toplamBrutMarj,
    gelirKapsananUrunSayisi: gelirUrunSayisi,
    maliyetKapsananUrunSayisi: maliyetUrunSayisi,
    marjKapsananUrunSayisi: marjUrunSayisi,
    toplamKayitSayisi: records.length
  };
}

/**
 * Örnek / Boş Şablon CSV Oluşturucu
 */
export function generateCSVTemplate(): string {
  const headers = [
    'il',
    'yil',
    'sektor',
    'urun',
    'uretim_miktari',
    'uretim_birimi',
    'kaynak',
    'cografi_duzey',
    'fiyat',
    'fiyat_birimi',
    'toplam_maliyet_tl',
    'maliyet_durumu',
    'donem',
    'veri_durumu'
  ];

  const sampleRows = [
    [
      'Konya', '2025', 'bitkisel', 'Ekmeklik Buğday', '1850000', 'Ton',
      'TÜİK Bitkisel Üretim İstatistikleri', 'İl', '11.50', 'TL/Kg', '16250000000', 'gerceklesen', 'Yıllık', 'kesin'
    ],
    [
      'Adana', '2025', 'bitkisel', 'Kütlü Pamuk', '240000', 'Ton',
      'TÜİK Bitkisel Üretim İstatistikleri', 'İl', '28.00', 'TL/Kg', '5200000000', 'gerceklesen', 'Yıllık', 'kesin'
    ],
    [
      'Erzurum', '2025', 'hayvansal', 'Çiğ İnek Sütü', '450000', 'Ton',
      'TÜİK Hayvansal Üretim İstatistikleri', 'İl', '16.50', 'TL/Lt', '5800000000', 'gerceklesen', 'Yıllık', 'kesin'
    ],
    [
      'Giresun', '2025', 'bitkisel', 'Fındık (Kabuklu)', '125000', 'Ton',
      'TÜİK Bitkisel Üretim İstatistikleri', 'İl', '135.00', 'TL/Kg', '', 'belirtilmemis', 'Yıllık', 'kesin'
    ]
  ];

  return [headers.join(','), ...sampleRows.map(r => r.join(','))].join('\n');
}

/**
 * Kayıtları CSV olarak dışa aktarma
 */
export function exportRecordsToCSV(records: TarimRecord[]): string {
  const data = records.map(r => ({
    il: r.il,
    yil: r.yil,
    sektor: r.sektor,
    urun: r.urun,
    uretim_miktari: r.uretim_miktari,
    uretim_birimi: r.uretim_birimi,
    kaynak: r.kaynak,
    cografi_duzey: r.cografi_duzey,
    fiyat: r.fiyat ?? '',
    fiyat_birimi: r.fiyat_birimi ?? '',
    toplam_maliyet_tl: r.toplam_maliyet_tl ?? '',
    maliyet_durumu: r.maliyet_durumu ?? '',
    donem: r.donem ?? '',
    veri_durumu: r.veri_durumu ?? '',
    hesaplanan_gelir_tl: r.hesaplanan_gelir_tl ?? '',
    hesaplanan_brut_marj_tl: r.hesaplanan_brut_marj_tl ?? '',
    marj_durumu: r.marj_hesaplanabilir ? 'Hesaplandı' : (r.marj_engeli_sebebi ?? 'Hesaplanamaz')
  }));

  return Papa.unparse(data);
}
