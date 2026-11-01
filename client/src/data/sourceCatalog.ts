export interface SourceMetadata {
  id: string;
  name: string;
  institution: string;
  description: string;
  frequency: string;
  coverage: string;
  officialUrl: string;
  sdmxAvailable: boolean;
  notes: string;
}

export const sourceCatalog: SourceMetadata[] = [
  {
    id: 'tuik-bitkisel',
    name: 'Bitkisel Üretim İstatistikleri (BÜİ)',
    institution: 'Türkiye İstatistik Kurumu (TÜİK)',
    description: 'Tarla ürünleri, sebze ve meyvelere ilişkin ekilen/hasat edilen alan ve üretim miktarı göstergeleri.',
    frequency: 'Yıllık (Geçici/Kesinleşmiş)',
    coverage: 'İl / İBBS Düzey 3 (İlçeler toplulaştırılmış)',
    officialUrl: 'https://data.tuik.gov.tr/Kategori/GetKategori?p=Tarim-111',
    sdmxAvailable: true,
    notes: 'TÜİK portalından indirilen CSV formatında il ve ürün eşleştirmesi gerektirir.'
  },
  {
    id: 'tuik-hayvansal',
    name: 'Hayvansal Üretim İstatistikleri (HÜİ)',
    institution: 'Türkiye İstatistik Kurumu (TÜİK)',
    description: 'Büyükbaş, küçükbaş ve kümes hayvanı sayıları ile sağılan hayvan ve süt/yün/bal üretim miktarları.',
    frequency: '6 Aylık / Yıllık',
    coverage: 'İl / İBBS Düzey 3',
    officialUrl: 'https://data.tuik.gov.tr/Kategori/GetKategori?p=Tarim-111',
    sdmxAvailable: true,
    notes: 'Hayvan stoku (mevcut varlık) satılan/kesilen adet ile karıştırılmamalıdır.'
  },
  {
    id: 'tuik-cegf',
    name: 'Çiftçinin Eline Geçen Fiyatlar (ÇEGF)',
    institution: 'Türkiye İstatistik Kurumu (TÜİK)',
    description: 'Çiftçilerin doğrudan toptan veya perakende sattıkları bitkisel ve hayvansal ürünlerin eline geçen birim fiyatları.',
    frequency: 'Aylık / Yıllık Ortalama',
    coverage: 'Bölgesel ve İl Düzeyi',
    officialUrl: 'https://data.tuik.gov.tr/Kategori/GetKategori?p=Tarim-111',
    sdmxAvailable: true,
    notes: 'Gelir hesaplamasında yalnızca üretim miktarıyla doğrudan uyumlu TL birim fiyatları geçerli sayılır.'
  },
  {
    id: 'tuik-tarim-ufe',
    name: 'Tarım Ürünleri Üretici Fiyat Endeksi (Tarım-ÜFE)',
    institution: 'Türkiye İstatistik Kurumu (TÜİK)',
    description: 'Tarımsal üretim faaliyet çıktılarının ulusal düzeyde fiyat değişimlerini ölçen genel endeks (2020=100).',
    frequency: 'Aylık',
    coverage: 'Ulusal (Türkiye Geneli)',
    officialUrl: 'https://data.tuik.gov.tr/Bulten/Index?p=Tarim-Urunleri-Uretici-Fiyat-Endeksi',
    sdmxAvailable: true,
    notes: 'Kısıt: Ulusal endeks serileri doğrudan il bazlı çiftçi satış fiyatı olarak kullanılamaz.'
  },
  {
    id: 'tuik-tgfe',
    name: 'Tarımsal Girdi Fiyat Endeksi (Tarım-GFE)',
    institution: 'Türkiye İstatistik Kurumu (TÜİK)',
    description: 'Tarımsal üretimde kullanılan mal ve hizmetlerin (gübre, mazot, tohum, yem, veteriner vb.) maliyet endeksi.',
    frequency: 'Aylık',
    coverage: 'Ulusal (Türkiye Geneli)',
    officialUrl: 'https://data.tuik.gov.tr/Bulten/Index?p=Tarimsal-Girdi-Fiyat-Endeksi',
    sdmxAvailable: true,
    notes: 'Kısıt: Ulusal girdi endeksleri tek başına il bazında doğrudan gerçekleşen maliyet kabul edilmez; kullanıcı ölçümü gerekir.'
  }
];
