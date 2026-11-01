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
    id: 'tuik-denge-104',
    name: 'Bitkisel Ürün Denge Tabloları (TÜİK MEDAS kn=104)',
    institution: 'Türkiye İstatistik Kurumu (TÜİK)',
    description: 'Tarımsal ürünlerin arz ve kullanım dengesi; üretim, yurt içi tüketim, tohumluk/yemlik/endüstriyel kullanım, ithalat, ihracat, stok değişimi, kişi başına tüketim (kg) ve yeterlilik derecesi (%) göstergeleri (MEDAS kn=104).',
    frequency: 'Yıllık / Tarımsal Pazarlama Yılı',
    coverage: 'Türkiye Geneli / Ürün Düzeyi',
    officialUrl: 'https://biruni.tuik.gov.tr/medas/?kn=104&locale=tr',
    sdmxAvailable: true,
    notes: 'TÜİK MEDAS kn=104 doğrudan Bitkisel Ürün Denge Tablosudur. Ürün arz-talep ve gıda arz güvenliği (yeterlilik derecesi) analizlerinde esastır.'
  },
  {
    id: 'tuik-bitkisel-92',
    name: 'Bitkisel Üretim İstatistikleri (BÜİ — MEDAS kn=92)',
    institution: 'Türkiye İstatistik Kurumu (TÜİK)',
    description: 'Tarla ürünleri, sebze ve meyvelere ilişkin ekilen/hasat edilen alan, verim ve üretim miktarı zaman serisi tablosu (MEDAS kn=92).',
    frequency: 'Yıllık (Geçici / Kesinleşmiş)',
    coverage: 'İl / İBBS Düzey 3 (81 İl Düzeyi)',
    officialUrl: 'https://biruni.tuik.gov.tr/medas/?kn=92&locale=tr',
    sdmxAvailable: true,
    notes: 'TÜİK MEDAS kn=92 doğrudan bitkisel üretim ve rekolte sorgulama tablosudur.'
  },
  {
    id: 'tuik-fiyat-83',
    name: 'Tarımsal Ürün Fiyatları ve Üretim Değerleri (ÇEGF — MEDAS kn=83)',
    institution: 'Türkiye İstatistik Kurumu (TÜİK)',
    description: 'Çiftçinin eline geçen birim fiyatlar (ÇEGF), brüt ve net tarımsal üretim değerleri (MEDAS kn=83).',
    frequency: 'Aylık / Yıllık',
    coverage: 'Bölgesel ve İl Düzeyi',
    officialUrl: 'https://biruni.tuik.gov.tr/medas/?kn=83&locale=tr',
    sdmxAvailable: true,
    notes: 'TÜİK MEDAS kn=83 çiftçi satış fiyatları tablosudur.'
  },
  {
    id: 'tuik-hayvansal',
    name: 'Hayvansal Üretim İstatistikleri (HÜİ — MEDAS kn=101)',
    institution: 'Türkiye İstatistik Kurumu (TÜİK)',
    description: 'Büyükbaş, küçükbaş ve kümes hayvanı sayıları ile sağılan hayvan ve süt/yün/bal üretim miktarları (MEDAS Tablo Kodu: kn=101).',
    frequency: '6 Aylık / Yıllık',
    coverage: 'İl / İBBS Düzey 3',
    officialUrl: 'https://biruni.tuik.gov.tr/medas/?kn=101&locale=tr',
    sdmxAvailable: true,
    notes: 'TÜİK MEDAS kn=101 doğrudan hayvansal üretim tablosudur. Hayvan stoku satılan/kesilen adet ile karıştırılmamalıdır.'
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
    name: 'Tarımsal Girdi Fiyat Endeksi (Tarım-GFE / TGFE — 2020=100)',
    institution: 'Türkiye İstatistik Kurumu (TÜİK) — Tarım İstatistikleri Dairesi',
    description: 'Tarımsal üretimde kullanılan mal ve hizmetler (Girdi 1: %88,87 ara tüketim) ile tarımsal yatırıma katkı sağlayan mal ve hizmetlerin (Girdi 2: %11,13 sermaye/traktör/alet-makine) fiyat değişimlerini ölçen bileşik endeks.',
    frequency: 'Aylık (Her ayın 1\'i ile 31\'i arası çiftçi alış fiyatları)',
    coverage: 'Ulusal ve Bölgesel Düzey (2020=100 Temel Yıllı)',
    officialUrl: 'https://biruni.tuik.gov.tr/medas/?kn=82&locale=tr',
    sdmxAvailable: true,
    notes: 'Resmî Ağırlık Şeması: Girdi 1: %88,87; Girdi 2: %11,13. Cari ağırlıklar temel yıldan bir önceki yıl (2019), temel yıl (2020) ve bir sonraki yıl (2021) 3 yıllık ekonomik hesaplar ortalamasıdır.'
  },
  {
    id: 'tgfe-kaynak-soru-formu',
    name: 'Tarım-GFE Veri Kaynağı 1: Soru Formları',
    institution: 'TÜİK Tarım İstatistikleri Dairesi',
    description: 'Tarımsal Girdi İstatistikleri Aylık Soru Formu ve Tarımsal Fiyatlar Çiftçinin Ödediği Hizmetler Fiyat Derleme Formu vasıtasıyla girdi bayilerinden (gübre, yem, tohum, ilaç) ve hizmet sağlayıcılardan toplanan doğrudan anket formları.',
    frequency: 'Aylık (Her ayın 1\'i ile 31\'i arası)',
    coverage: '81 İl / Seçilmiş Girdi Bayi Örneklemi',
    officialUrl: 'https://biruni.tuik.gov.tr/medas/?kn=82&locale=tr',
    sdmxAvailable: true,
    notes: 'Gübre, karma yem, tohum, zirai mücadele ilaçları ve tarımsal işçilik/hizmet fiyatları derlenir.'
  },
  {
    id: 'tgfe-kaynak-diger-calismalar',
    name: 'Tarım-GFE Veri Kaynağı 2: TÜİK Tarafından Yapılan Diğer Çalışmalar',
    institution: 'TÜİK Fiyat İstatistikleri ve İnşaat Daireleri',
    description: 'Tüketici Fiyat Endeksi (TÜFE), Yurt İçi Üretici Fiyat Endeksi (Yİ-ÜFE), Hizmet Üretici Fiyat Endeksi (H-ÜFE) ve İnşaat Maliyet Endeksi (İME) çalışmalarından tarımsal faaliyetlere aktarılan fiyat endeksi serileri.',
    frequency: 'Aylık',
    coverage: 'Ulusal ve Sektörel Düzey',
    officialUrl: 'https://data.tuik.gov.tr/Kategori/GetKategori?p=Enflasyon-ve-Fiyat-106',
    sdmxAvailable: true,
    notes: 'Elektrik, akaryakıt, bakım-onarım malzemesi, tarımsal yapı demir-çelik profilleri ve genel hizmetler bu serilerden beslenir.'
  },
  {
    id: 'tgfe-kaynak-idari-kayitlar',
    name: 'Tarım-GFE Veri Kaynağı 3: İdari Kayıtlar',
    institution: 'DSİ, EPDK, Tarım Kredi Kooperatifleri, PANKOBİRLİK, TVHB',
    description: 'TOB Devlet Su İşleri Genel Müdürlüğü sulama ücretleri, Enerji Piyasası Düzenleme Kurulu (EPDK) akaryakıt/elektrik tarifeleri, Türkiye Tarım Kredi Kooperatifleri ve Pancar Ekicileri Kooperatifleri Birliği (PANKOBİRLİK) tescil satış fiyatları ile Türk Veteriner Hekimleri Birliği asgari ücret tarifeleri.',
    frequency: 'Aylık / Sezonluk Tarife Güncellemeleri',
    coverage: 'Bölgesel ve Birlik/Kooperatif Şube Düzeyi',
    officialUrl: 'https://www.dsi.gov.tr',
    sdmxAvailable: false,
    notes: 'Kamu kurumları ve tarımsal üretici/meslek birliklerinin resmî idari kayıtları doğrudan endeks hesaplamasında kullanılır.'
  },
  {
    id: 'tgfe-kaynak-veri-kazima',
    name: 'Tarım-GFE Veri Kaynağı 4: Veri Kazıma (Web Scraping)',
    institution: 'Traktör ve Makine Satışı Yapan Bayiler & Otomotiv/Makine Portalları',
    description: 'Traktör ve tarımsal alet-makine satışı yapan yetkili bayi ağları ile distribütörlerin internet sitelerinden web kazıma (web scraping) yöntemiyle toplanan fiili piyasa satış fiyatları.',
    frequency: 'Aylık Otomatik Kazıma',
    coverage: 'Ulusal Bayi Ağları / Marka ve Model Bazında',
    officialUrl: 'https://data.tuik.gov.tr',
    sdmxAvailable: false,
    notes: 'Tarımsal yatırıma katkı sağlayan sermaye malları (traktör, mibzer, pulluk, römork vb.) için modern veri kazıma teknikleri uygulanır.'
  }
];
