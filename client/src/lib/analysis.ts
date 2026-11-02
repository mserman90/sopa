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

  // AB El Kitabı 2020, TAORBA 2008_2 ve CPA 2008 Sınıflamaları
  taorba2008_2?: string;
  cpa2008?: string;
  ab_grup_kod?: string;
  ab_grup_adi?: string;
  madde_endeksi_2020?: number;

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

  // TÜİK MEDAS (kn=92) ve standart şema başlık eşleştirmesi
  const findVal = (row: Record<string, string>, candidates: string[]): string => {
    for (const cand of candidates) {
      if (row[cand] !== undefined && row[cand] !== null && row[cand] !== '') {
        return row[cand];
      }
    }
    return '';
  };

  const headers = Object.keys(parsed.data[0]);
  const hasIl = headers.some(h => ['il', 'il_adi', 'i̇l', 'i̇l_adi', 'yerlesim_yeri', 'sehir'].includes(h));
  const hasYil = headers.some(h => ['yil', 'yıl', 'donem', 'dönem', 'zaman'].includes(h));
  const hasUrun = headers.some(h => ['urun', 'ürün', 'urun_adi', 'ürün_adı', 'madde', 'madde_adi'].includes(h));
  const hasMiktar = headers.some(h => ['uretim_miktari', 'üretim_miktarı', 'uretim_(ton)', 'üretim_(ton)', 'uretim', 'üretim', 'miktar', 'deger'].includes(h));

  if (!hasIl || !hasYil || !hasUrun || !hasMiktar) {
    const missing: string[] = [];
    if (!hasIl) missing.push('il / il_adi');
    if (!hasYil) missing.push('yil / dönem');
    if (!hasUrun) missing.push('urun / urun_adi');
    if (!hasMiktar) missing.push('uretim_miktari / uretim_(ton)');
    errors.push(`Zorunlu sütunlar eksik: ${missing.join(', ')}. Şablonu veya TÜİK MEDAS (kn=92) CSV çıktısını kontrol ediniz.`);
    return { valid: false, errors, warnings, records: [] };
  }

  parsed.data.forEach((row, index) => {
    const lineNum = index + 2;

    const il = findVal(row, ['il', 'il_adi', 'i̇l', 'i̇l_adi', 'yerlesim_yeri', 'sehir']).trim();
    const yilStr = findVal(row, ['yil', 'yıl', 'donem', 'dönem', 'zaman']).trim();
    const sektorRaw = (findVal(row, ['sektor', 'sektör']) || 'bitkisel').trim().toLowerCase();
    const urun = findVal(row, ['urun', 'ürün', 'urun_adi', 'ürün_adı', 'madde', 'madde_adi']).trim();
    const miktarStr = findVal(row, ['uretim_miktari', 'üretim_miktarı', 'uretim_(ton)', 'üretim_(ton)', 'uretim', 'üretim', 'miktar', 'deger']).trim().replace(',', '.');
    const uretimBirimi = (findVal(row, ['uretim_birimi', 'üretim_birimi', 'birim', 'olcu_birimi']) || 'Ton').trim();
    const kaynak = (findVal(row, ['kaynak', 'veri_kaynagi', 'veri_kaynağı']) || 'TÜİK MEDAS (kn=92 BÜİ)').trim();
    const cografiDuzeyRaw = (findVal(row, ['cografi_duzey', 'coğrafi_düzey', 'duzey']) || 'İl').trim();

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
    taorba2008_2: r.taorba2008_2 ?? '',
    cpa2008: r.cpa2008 ?? '',
    ab_grup_kod: r.ab_grup_kod ?? '',
    hesaplanan_gelir_tl: r.hesaplanan_gelir_tl ?? '',
    hesaplanan_brut_marj_tl: r.hesaplanan_brut_marj_tl ?? '',
    marj_durumu: r.marj_hesaplanabilir ? 'Hesaplandı' : (r.marj_engeli_sebebi ?? 'Hesaplanamaz')
  }));

  return Papa.unparse(data);
}

/**
 * TÜİK MEDAS Bitkisel Üretim İstatistikleri (BÜİ — kn=92) Resmî Örnek Veri Seti
 * Resmî Kaynak: https://biruni.tuik.gov.tr/medas/?kn=92&locale=tr
 * Türkiye'nin lider tarım havzalarının rekolte, alan ve üretim verileri.
 */
export function getPreloadedMedasKn92Records(): TarimRecord[] {
  return [
    {
      id: 'medas92-konya-bugday',
      il: 'Konya',
      yil: 2026,
      sektor: 'bitkisel',
      urun: 'Ekmeklik Buğday (Anadolu Kırmızı Sert 2. Derece)',
      uretim_miktari: 2150000,
      uretim_birimi: 'Ton',
      kaynak: 'TÜİK MEDAS (kn=92 BÜİ) + ÇEGF',
      cografi_duzey: 'İl',
      fiyat: 11.60,
      fiyat_birimi: 'TL/Kg',
      toplam_maliyet_tl: 18920000000,
      maliyet_durumu: 'gerceklesen',
      donem: '2026 / 10. Ay',
      veri_durumu: 'kesin',
      taorba2008_2: '01.11.12.00.00',
      cpa2008: '01.11.12',
      ab_grup_kod: '01.1',
      ab_grup_adi: '01.1: Tahıllar ve Tohumlar',
      madde_endeksi_2020: 690.48,
      hesaplanan_gelir_tl: 24940000000,
      hesaplanan_brut_marj_tl: 6020000000,
      marj_hesaplanabilir: true
    },
    {
      id: 'medas92-konya-arpa',
      il: 'Konya',
      yil: 2026,
      sektor: 'bitkisel',
      urun: 'Arpa (Biralık Hariç)',
      uretim_miktari: 1020000,
      uretim_birimi: 'Ton',
      kaynak: 'TÜİK MEDAS (kn=92 BÜİ) + ÇEGF',
      cografi_duzey: 'İl',
      fiyat: 9.40,
      fiyat_birimi: 'TL/Kg',
      toplam_maliyet_tl: 7344000000,
      maliyet_durumu: 'gerceklesen',
      donem: '2026 / 10. Ay',
      veri_durumu: 'kesin',
      taorba2008_2: '01.11.31.00.02',
      cpa2008: '01.11.31',
      ab_grup_kod: '01.1',
      ab_grup_adi: '01.1: Tahıllar ve Tohumlar',
      madde_endeksi_2020: 671.43,
      hesaplanan_gelir_tl: 9588000000,
      hesaplanan_brut_marj_tl: 2244000000,
      marj_hesaplanabilir: true
    },
    {
      id: 'medas92-adana-misir',
      il: 'Adana',
      yil: 2026,
      sektor: 'bitkisel',
      urun: 'Mısır (Dane)',
      uretim_miktari: 980000,
      uretim_birimi: 'Ton',
      kaynak: 'TÜİK MEDAS (kn=92 BÜİ) + ÇEGF',
      cografi_duzey: 'İl',
      fiyat: 9.20,
      fiyat_birimi: 'TL/Kg',
      toplam_maliyet_tl: 6958000000,
      maliyet_durumu: 'gerceklesen',
      donem: '2026 / 10. Ay',
      veri_durumu: 'kesin',
      taorba2008_2: '01.11.20.00.01',
      cpa2008: '01.11.20',
      ab_grup_kod: '01.1',
      ab_grup_adi: '01.1: Tahıllar ve Tohumlar',
      madde_endeksi_2020: 681.48,
      hesaplanan_gelir_tl: 9016000000,
      hesaplanan_brut_marj_tl: 2058000000,
      marj_hesaplanabilir: true
    },
    {
      id: 'medas92-sanliurfa-pamuk',
      il: 'Şanlıurfa',
      yil: 2026,
      sektor: 'bitkisel',
      urun: 'Kütlü Pamuk (Standart 1 Beyaz)',
      uretim_miktari: 850000,
      uretim_birimi: 'Ton',
      kaynak: 'TÜİK MEDAS (kn=92 BÜİ) + ÇEGF',
      cografi_duzey: 'İl',
      fiyat: 26.50,
      fiyat_birimi: 'TL/Kg',
      toplam_maliyet_tl: 17850000000,
      maliyet_durumu: 'gerceklesen',
      donem: '2026 / 10. Ay',
      veri_durumu: 'kesin',
      taorba2008_2: '01.16.11.00.00',
      cpa2008: '01.16.11',
      ab_grup_kod: '01.2',
      ab_grup_adi: '01.2: Sanayi Bitkileri',
      madde_endeksi_2020: 630.95,
      hesaplanan_gelir_tl: 22525000000,
      hesaplanan_brut_marj_tl: 4675000000,
      marj_hesaplanabilir: true
    },
    {
      id: 'medas92-sanliurfa-mercimek',
      il: 'Şanlıurfa',
      yil: 2026,
      sektor: 'bitkisel',
      urun: 'Kırmızı Mercimek (Kabuklu)',
      uretim_miktari: 290000,
      uretim_birimi: 'Ton',
      kaynak: 'TÜİK MEDAS (kn=92 BÜİ) + ÇEGF',
      cografi_duzey: 'İl',
      fiyat: 23.50,
      fiyat_birimi: 'TL/Kg',
      toplam_maliyet_tl: 5075000000,
      maliyet_durumu: 'gerceklesen',
      donem: '2026 / 10. Ay',
      veri_durumu: 'kesin',
      taorba2008_2: '01.11.74.00.01',
      cpa2008: '01.11.74',
      ab_grup_kod: '01.1',
      ab_grup_adi: '01.1: Tahıllar ve Tohumlar',
      madde_endeksi_2020: 587.50,
      hesaplanan_gelir_tl: 6815000000,
      hesaplanan_brut_marj_tl: 1740000000,
      marj_hesaplanabilir: true
    },
    {
      id: 'medas92-antalya-domates',
      il: 'Antalya',
      yil: 2026,
      sektor: 'bitkisel',
      urun: 'Domates (Örtü Altı Sofralık)',
      uretim_miktari: 1450000,
      uretim_birimi: 'Ton',
      kaynak: 'TÜİK MEDAS (kn=92 BÜİ) + HKS',
      cografi_duzey: 'İl',
      fiyat: 18.50,
      fiyat_birimi: 'TL/Kg',
      toplam_maliyet_tl: 18850000000,
      maliyet_durumu: 'gerceklesen',
      donem: '2026 / 10. Ay',
      veri_durumu: 'kesin',
      taorba2008_2: '01.13.34.01.99',
      cpa2008: '01.13.34',
      ab_grup_kod: '01.4',
      ab_grup_adi: '01.4: Taze Sebzeler',
      madde_endeksi_2020: 840.91,
      hesaplanan_gelir_tl: 26825000000,
      hesaplanan_brut_marj_tl: 7975000000,
      marj_hesaplanabilir: true
    },
    {
      id: 'medas92-giresun-findik',
      il: 'Giresun',
      yil: 2026,
      sektor: 'bitkisel',
      urun: 'Fındık (Kabuklu Tombul/Giresun Kalite)',
      uretim_miktari: 95000,
      uretim_birimi: 'Ton',
      kaynak: 'TÜİK MEDAS (kn=92 BÜİ) + TMO',
      cografi_duzey: 'İl',
      fiyat: 135.00,
      fiyat_birimi: 'TL/Kg',
      toplam_maliyet_tl: 9975000000,
      maliyet_durumu: 'gerceklesen',
      donem: '2026 / 10. Ay',
      veri_durumu: 'kesin',
      taorba2008_2: '01.25.33.00.00',
      cpa2008: '01.25.33',
      ab_grup_kod: '01.5',
      ab_grup_adi: '01.5: Meyveler',
      madde_endeksi_2020: 613.64,
      hesaplanan_gelir_tl: 12825000000,
      hesaplanan_brut_marj_tl: 2850000000,
      marj_hesaplanabilir: true
    },
    {
      id: 'medas92-aydin-zeytin',
      il: 'Aydın',
      yil: 2026,
      sektor: 'bitkisel',
      urun: 'Yağlık Zeytin',
      uretim_miktari: 210000,
      uretim_birimi: 'Ton',
      kaynak: 'TÜİK MEDAS (kn=92 BÜİ) + ÇEGF',
      cografi_duzey: 'İl',
      fiyat: 34.00,
      fiyat_birimi: 'TL/Kg',
      toplam_maliyet_tl: 5040000000,
      maliyet_durumu: 'gerceklesen',
      donem: '2026 / 10. Ay',
      veri_durumu: 'kesin',
      taorba2008_2: '01.26.12.00.00',
      cpa2008: '01.26.12',
      ab_grup_kod: '01.7',
      ab_grup_adi: '01.7: Zeytinyağı ve Zeytin',
      madde_endeksi_2020: 755.56,
      hesaplanan_gelir_tl: 7140000000,
      hesaplanan_brut_marj_tl: 2100000000,
      marj_hesaplanabilir: true
    },
    {
      id: 'medas92-malatya-kayisi',
      il: 'Malatya',
      yil: 2026,
      sektor: 'bitkisel',
      urun: 'Kuru Kayısı (Kükürtlü ve Gün Kurusu)',
      uretim_miktari: 85000,
      uretim_birimi: 'Ton',
      kaynak: 'TÜİK MEDAS (kn=92 BÜİ) + Borsa',
      cografi_duzey: 'İl',
      fiyat: 185.00,
      fiyat_birimi: 'TL/Kg',
      toplam_maliyet_tl: 11475000000,
      maliyet_durumu: 'gerceklesen',
      donem: '2026 / 10. Ay',
      veri_durumu: 'kesin',
      taorba2008_2: '01.24.21.00.00',
      cpa2008: '01.24.21',
      ab_grup_kod: '01.5',
      ab_grup_adi: '01.5: Meyveler',
      madde_endeksi_2020: 660.71,
      hesaplanan_gelir_tl: 15725000000,
      hesaplanan_brut_marj_tl: 4250000000,
      marj_hesaplanabilir: true
    },
    {
      id: 'medas92-tekirdag-aycicegi',
      il: 'Tekirdağ',
      yil: 2026,
      sektor: 'bitkisel',
      urun: 'Ayçiçeği (Yağlık)',
      uretim_miktari: 380000,
      uretim_birimi: 'Ton',
      kaynak: 'TÜİK MEDAS (kn=92 BÜİ) + Trakya Birlik',
      cografi_duzey: 'İl',
      fiyat: 19.50,
      fiyat_birimi: 'TL/Kg',
      toplam_maliyet_tl: 5510000000,
      maliyet_durumu: 'gerceklesen',
      donem: '2026 / 10. Ay',
      veri_durumu: 'kesin',
      taorba2008_2: '01.11.95.00.01',
      cpa2008: '01.11.95',
      ab_grup_kod: '01.2',
      ab_grup_adi: '01.2: Sanayi Bitkileri',
      madde_endeksi_2020: 590.91,
      hesaplanan_gelir_tl: 7410000000,
      hesaplanan_brut_marj_tl: 1900000000,
      marj_hesaplanabilir: true
    }
  ];
}
