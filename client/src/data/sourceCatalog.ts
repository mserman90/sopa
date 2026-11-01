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
    id: 'eurostat-handbook-2020',
    name: 'AB Tarımsal Fiyat İstatistikleri El Kitabı, 2020',
    institution: 'Avrupa Birliği İstatistik Ofisi (Eurostat)',
    description: 'Tarımsal çıktı (Tarım-ÜFE) ve girdi (Tarım-GFE) fiyat endekslerinin hiyerarşik sınıflandırma ve metodolojik hesaplama rehberi.',
    frequency: 'Sürekli / 5 Yıllık Baz Yıl Güncellemesi (2020=100)',
    coverage: 'AB Üye Ülkeleri ve Aday Ülkeler (TÜİK Uyumlu)',
    officialUrl: 'https://ec.europa.eu/eurostat/web/agriculture/data/database',
    sdmxAvailable: true,
    notes: 'Çıktılarda 01 Bitkisel / 02 Hayvansal; Girdilerde 01 Ara Tüketim / 02 Yatırım Mal ve Hizmetleri ana ve alt gruplarını tanımlar.'
  },
  {
    id: 'tuik-taorba-2008_2',
    name: 'TAORBA 2008_2 Ürün Sınıflaması',
    institution: 'Türkiye İstatistik Kurumu (TÜİK)',
    description: 'Tarım, Ormancılık ve Balıkçılık Ürünleri Ulusal Sınıflaması. Tarım-ÜFE ve ÇEGF madde düzeyindeki 10 haneli resmî kodlama.',
    frequency: 'Sürekli Güncel Madde Listesi',
    coverage: 'Türkiye Geneli / 81 İl Madde Düzeyi',
    officialUrl: 'https://data.tuik.gov.tr/Kategori/GetKategori?p=Tarim-111',
    sdmxAvailable: true,
    notes: 'Tüm tarımsal çıktılar ve girdiler madde düzeyinde 10 haneli TAORBA kodu ile tekilleştirilir.'
  },
  {
    id: 'cpa-2008',
    name: 'CPA 2008 (Faaliyete Göre Ürün Sınıflaması)',
    institution: 'Avrupa Ekonomik Topluluğu (EEC) / Eurostat',
    description: 'Tarımsal girdi ve çıktı maddelerinin uluslararası düzeyde karşılaştırılabilmesini sağlayan 6 basamaklı ekonomik ürün sınıflaması.',
    frequency: 'Uluslararası Standart Sınıflama',
    coverage: 'Avrupa Topluluğu ve TÜİK Veri Altyapısı',
    officialUrl: 'https://ec.europa.eu/eurostat/ramon/nomenclatures/',
    sdmxAvailable: true,
    notes: 'Girdi tarafında gübre (20.15), motorin (19.20), yem (10.91); Çıktı tarafında buğday (01.11), süt (01.41) vb. kodlanır.'
  },
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
