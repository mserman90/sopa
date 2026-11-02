/**
 * Ulusal Tarım, Ormancılık ve Balıkçılık Ürünleri Sınıflaması, 2021 (UTOBÜS 2021 / TAORBA 2021)
 * 
 * Resmî Kaynak:
 * - TÜİK (Türkiye İstatistik Kurumu) Ulusal Tarım, Ormancılık ve Balıkçılık Ürünleri Sınıflaması 2021 El Kitabı (126 sayfa)
 * - 10 Haneli Resmî Madde Kodları (01.XX.XX.XX.XX)
 * - Resmî Ölçü Birimleri ve Birim Kodları:
 *   * 3002: Ton (Tahıllar, baklagiller, sebze, meyve, süt, karkas et vb.)
 *   * 4135: Baş (Canlı hayvanlar: tosun, düve, kuzu, koyun vb.)
 *   * 2600: Adet sayısı (Yumurta, kümes hayvanları, kesme çiçekler, fideler vb.)
 *   * 3000: Türk Lirası (Tarımsal hizmetler: sürüm, çapalama, hasat vb.)
 *   * 2400: Metreküp (Ormancılık, tomruk, endüstriyel odun vb.)
 *   * 2000: Litre (Sıvı ürünler, dondurma vb.)
 */

import rawItems from './utobus2021.json';

export interface UtobusItem {
  kod: string;           // '01.11.11.00.00'
  tanim: string;         // 'Durum buğdayı'
  olcuBirimi: string;    // 'Ton'
  olcuBirimKodu: string; // '3002'
}

export interface UtobusUnitMeta {
  kod: string;
  ad: string;
  sembol: string;
  ornekUrunler: string;
}

export const UTOBUS_UNITS: Record<string, UtobusUnitMeta> = {
  '3002': {
    kod: '3002',
    ad: 'Ton',
    sembol: 'Ton',
    ornekUrunler: 'Tahıllar, Baklagiller, Meyveler, Sebzeler, Karkas Et, Çiğ Süt'
  },
  '4135': {
    kod: '4135',
    ad: 'Baş',
    sembol: 'Baş',
    ornekUrunler: 'Canlı Sığır, Tosun, Düve, Koyun, Kuzu, Manda, Keçi'
  },
  '2600': {
    kod: '2600',
    ad: 'Adet sayısı',
    sembol: 'Adet',
    ornekUrunler: 'Tavuk Yumurtası, Çiçekler, Canlı Kümes Hayvanları, Fide/Fidan'
  },
  '3000': {
    kod: '3000',
    ad: 'Türk Lirası',
    sembol: 'TL',
    ornekUrunler: 'Tarımsal Hizmetler (Tarla Sürme, Hasat, Budama, İlaçlama vb.)'
  },
  '2400': {
    kod: '2400',
    ad: 'Metreküp',
    sembol: 'm³',
    ornekUrunler: 'Ormancılık Ürünleri (Endüstriyel Odun, Tomruk, Yakacak Odun)'
  },
  '2000': {
    kod: '2000',
    ad: 'Litre',
    sembol: 'Lt',
    ornekUrunler: 'Sıvı Süt Ürünleri, Dondurma vb.'
  }
};

export const UTOBUS_CHAPTERS: { kod: string; ad: string; aciklama: string }[] = [
  { kod: '01.1', ad: 'Tek Yıllık Bitkisel Ürünler', aciklama: 'Tahıllar, baklagiller, yağlı tohumlar, sebzeler ve yem bitkileri' },
  { kod: '01.2', ad: 'Çok Yıllık Bitkisel Ürünler', aciklama: 'Üzüm, meyveler, sert kabuklular, zeytin ve narenciye' },
  { kod: '01.3', ad: 'Dikim Materyalleri', aciklama: 'Fide, fidan, süs bitkileri ve tohumluklar' },
  { kod: '01.4', ad: 'Canlı Hayvanlar ve Hayvansal Ürünler', aciklama: 'Sığır, manda, koyun, keçi, kümes hayvanları, çiğ süt, yumurta ve bal' },
  { kod: '01.6', ad: 'Tarımsal Destek ve Hizmet Faaliyetleri', aciklama: 'Toprak sürme, ekim, çapa, ilaçlama, budama ve hasat hizmetleri (TL)' },
  { kod: '02', ad: 'Ormancılık ve Tomrukçuluk', aciklama: 'Endüstriyel odun, yakacak odun ve orman ürünleri (m³)' },
  { kod: '03', ad: 'Balıkçılık ve Su Ürünleri', aciklama: 'Deniz ve iç su balıkları, kabuklular ve yumuşakçalar (Ton)' },
  { kod: '10', ad: 'İşlenmiş Tarımsal Gıdalar', aciklama: 'Karkas etler, süt ürünleri ve katı yağlar' },
  { kod: '12', ad: 'Tütün Ürünleri', aciklama: 'Kurutulmuş yaprak tütün' }
];

export const UTOBUS_2021_ITEMS: UtobusItem[] = rawItems as UtobusItem[];

// Hızlı kod araması için Map indeksi
const utobusByCodeMap = new Map<string, UtobusItem>();
for (const item of UTOBUS_2021_ITEMS) {
  utobusByCodeMap.set(item.kod, item);
}

/**
 * 10 haneli resmî koda göre UTOBÜS 2021 kaydı getirir.
 */
export function getUtobusByCode(kod: string): UtobusItem | undefined {
  if (!kod) return undefined;
  const clean = kod.trim();
  return utobusByCodeMap.get(clean);
}

/**
 * Arama metnine, birim koduna veya bölüme göre UTOBÜS 2021 kataloğunda filtreleme yapar.
 */
export function searchUtobus2021(options: {
  query?: string;
  unitCode?: string;
  chapter?: string;
  limit?: number;
}): UtobusItem[] {
  const { query, unitCode, chapter, limit = 50 } = options;
  const qClean = query ? query.toLowerCase().trim() : '';

  const results: UtobusItem[] = [];

  for (const item of UTOBUS_2021_ITEMS) {
    if (unitCode && item.olcuBirimKodu !== unitCode) {
      continue;
    }
    if (chapter && !item.kod.startsWith(chapter)) {
      continue;
    }
    if (qClean) {
      const matchName = item.tanim.toLowerCase().includes(qClean);
      const matchCode = item.kod.includes(qClean);
      if (!matchName && !matchCode) {
        continue;
      }
    }

    results.push(item);
    if (results.length >= limit) {
      break;
    }
  }

  return results;
}

/**
 * Ürün adına göre en uygun UTOBÜS 2021 kaydını bulur.
 */
export function findBestUtobusMatch(productName: string): UtobusItem | undefined {
  if (!productName) return undefined;
  const pLower = productName.toLowerCase();

  // 1. Doğrudan veya güçlü eşleşme kuralları
  const rules: [RegExp, string][] = [
    [/durum|makarna.*buğday/i, '01.11.11.00.00'], // Durum buğdayı
    [/ekmek.*buğday|kırmızı sert.*buğday|buğday/i, '01.11.12.00.00'], // Ekmeklik Buğday
    [/cin mısır/i, '01.11.20.00.02'],
    [/mısır/i, '01.11.20.00.01'],
    [/biralık arpa/i, '01.11.31.00.01'],
    [/arpa/i, '01.11.31.00.02'],
    [/çavdar/i, '01.11.32.00.00'],
    [/yulaf/i, '01.11.33.00.00'],
    [/çeltik/i, '01.12.10.00.00'],
    [/ayçiçek/i, '01.11.95.00.01'],
    [/soya/i, '01.11.80.00.00'],
    [/kuru fasulye|fasulye.*kuru/i, '01.11.71.00.01'],
    [/nohut/i, '01.11.73.00.00'],
    [/kırmızı mercimek|mercimek/i, '01.11.74.00.01'],
    [/salçalık domates/i, '01.13.34.02.00'],
    [/sofralık domates|domates/i, '01.13.34.01.99'],
    [/sofralık zeytin/i, '01.26.11.00.00'],
    [/yağlık zeytin|zeytin/i, '01.26.12.00.00'],
    [/çekirdeksiz.*üzüm|üzüm/i, '01.21.11.00.02'],
    [/fındık/i, '01.25.33.00.00'],
    [/antep fıstı/i, '01.25.32.00.00'],
    [/kuru incir|incir/i, '01.22.13.00.00'],
    [/kuru kayısı|kayısı/i, '01.24.21.00.00'],
    [/inek sütü|çiğ süt|süt/i, '01.41.20.00.01'],
    [/koyun sütü/i, '01.45.21.00.00'],
    [/tosun|besi sığır/i, '01.42.11.01.03'],
    [/düve|damızlık sığır/i, '01.41.10.01.02'],
    [/kuzu|koyun/i, '01.45.11.01.01'],
    [/yumurta/i, '01.47.21.00.00'],
    [/dana karkas|sığır karkas/i, '10.11.11.40.01'],
    [/kuzu karkas/i, '10.11.12.40.01'],
    [/tarla sür/i, '01.61.10.01.04'],
    [/çapa/i, '01.61.10.02.04'],
    [/hasat/i, '01.61.10.04.00'],
    [/ilaçlama/i, '01.61.10.03.01']
  ];

  for (const [regex, code] of rules) {
    if (regex.test(pLower)) {
      const found = getUtobusByCode(code);
      if (found) return found;
    }
  }

  // 2. Basit metin içerik araması
  const searchResults = searchUtobus2021({ query: productName.split(' ')[0], limit: 1 });
  return searchResults[0];
}

/**
 * UTOBÜS 2021 kataloğuna ait özet istatistikler
 */
export function getUtobusStats() {
  const unitBreakdown: Record<string, number> = {};
  const chapters: Record<string, number> = {};

  for (const item of UTOBUS_2021_ITEMS) {
    const uKey = item.olcuBirimKodu || 'belirtilmemis';
    unitBreakdown[uKey] = (unitBreakdown[uKey] || 0) + 1;

    const chap = item.kod.slice(0, 4);
    chapters[chap] = (chapters[chap] || 0) + 1;
  }

  return {
    totalItems: UTOBUS_2021_ITEMS.length,
    unitBreakdown,
    chapters
  };
}
