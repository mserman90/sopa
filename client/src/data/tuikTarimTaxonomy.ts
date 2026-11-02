/**
 * TarımViz — TÜİK Veri Portalı "Tarım" İstatistiki Temalar ve Tablolar Taksonomisi
 * 
 * Kaynak: TÜİK Veri Portalı (veriportali.tuik.gov.tr) Resmî "İstatistiki Temalar > Tarım" Ağacı
 * Toplu Veri İndirme: https://veriportali.tuik.gov.tr/tr/bulk-download
 */

export interface TuikTarimTableItem {
  id: string;
  baslik: string;
  tur: 'tablo' | 'veritabani' | 'bulten';
  medasKn?: string;
  aciklama?: string;
  sdmxDataflow?: string;
  portalUrl?: string;
}

export interface TuikTarimSubGroup {
  id: string;
  baslik: string;
  tablolar: TuikTarimTableItem[];
}

export interface TuikTarimTheme {
  id: string;
  baslik: string;
  kod: string;
  aciklama: string;
  altGruplar: TuikTarimSubGroup[];
}

export const TUIK_TARIM_TAXONOMY: TuikTarimTheme[] = [
  // ==========================================================================
  // 1. BİTKİSEL ÜRETİM İSTATİSTİKLERİ
  // ==========================================================================
  {
    id: 'bitkisel-uretim',
    kod: 'BUİ',
    baslik: 'Bitkisel Üretim İstatistikleri',
    aciklama: 'Tarla bitkileri, sebzeler, meyveler, içecek ve baharat bitkileri ile örtü altı alanları ve rekolte istatistikleri.',
    altGruplar: [
      {
        id: 'bui-meyveler',
        baslik: 'Meyveler, İçecek ve Baharat Bitkileri',
        tablolar: [
          { id: 'bui-meyve-baharat', baslik: 'Baharat Bitkileri', tur: 'tablo', medasKn: 'kn=92' },
          { id: 'bui-meyve-cay', baslik: 'Çay Üretimi', tur: 'tablo', medasKn: 'kn=92' },
          { id: 'bui-meyve-diger', baslik: 'Diğer Meyveler', tur: 'tablo', medasKn: 'kn=92' },
          { id: 'bui-meyve-secilmis', baslik: 'Meyveler, İçecek ve Baharat Bitkilerin Üretim Miktarları (Seçilmiş Ürünlerde)', tur: 'tablo', medasKn: 'kn=92' },
          { id: 'bui-meyve-tropik', baslik: 'Muz, Kivi, Avakado, İncir', tur: 'tablo', medasKn: 'kn=92' },
          { id: 'bui-meyve-sert-kabuk', baslik: 'Sert Kabuklu Meyveler (Fındık, Ceviz, Antep Fıstığı vb.)', tur: 'tablo', medasKn: 'kn=92' },
          { id: 'bui-meyve-tas-cekirdek', baslik: 'Taş Çekirdekli Meyveler (Kayısı, Şeftali, Kiraz vb.)', tur: 'tablo', medasKn: 'kn=92' },
          { id: 'bui-meyve-turuncgil', baslik: 'Turunçgiller (Portakal, Mandalina, Limon)', tur: 'tablo', medasKn: 'kn=92' },
          { id: 'bui-meyve-uzum', baslik: 'Üzüm Üretimi (Sofralık, Şaraplık, Kurutmalık)', tur: 'tablo', medasKn: 'kn=92' },
          { id: 'bui-meyve-yumusak-cekirdek', baslik: 'Yumuşak Çekirdekli Meyveler (Elma, Armut, Ayva)', tur: 'tablo', medasKn: 'kn=92' },
          { id: 'bui-meyve-zeytin', baslik: 'Zeytin Üretimi (Yağlık ve Sofralık)', tur: 'tablo', medasKn: 'kn=92' }
        ]
      },
      {
        id: 'bui-ortu-alti',
        baslik: 'Örtü Altı Üretim (Sera)',
        tablolar: [
          { id: 'bui-sera-sebze-meyve', baslik: 'Örtü Altı Sebze ve Meyve Üretimi', tur: 'tablo', medasKn: 'kn=92' },
          { id: 'bui-sera-sus-bitkileri', baslik: 'Örtü Altı Süs Bitkileri Üretimi', tur: 'tablo', medasKn: 'kn=92' },
          { id: 'bui-sera-alan', baslik: 'Örtü Altı Tarım Alanları (Cam, Plastik Sera vb.)', tur: 'tablo', medasKn: 'kn=92' }
        ]
      },
      {
        id: 'bui-sebzeler',
        baslik: 'Sebzeler',
        tablolar: [
          { id: 'bui-sebze-meyveli', baslik: 'Meyvesi İçin Yetiştirilen Sebzeler (Domates, Biber, Hıyar vb.)', tur: 'tablo', medasKn: 'kn=92' },
          { id: 'bui-sebze-yumru-kok', baslik: 'Yumru ve Kök Sebzeler (Havuç, Kuru Soğan, Sarımsak)', tur: 'tablo', medasKn: 'kn=92' },
          { id: 'bui-sebze-secilmis', baslik: 'Sebzelerin Üretim Miktarları (Seçilmiş Ürünlerde)', tur: 'tablo', medasKn: 'kn=92' },
          { id: 'bui-sebze-diger', baslik: 'Başka Yerde Sınıflandırılmamış Diğer Sebzeler', tur: 'tablo', medasKn: 'kn=92' }
        ]
      },
      {
        id: 'bui-tahillar',
        baslik: 'Tahıllar ve Diğer Bitkisel Ürünler',
        tablolar: [
          { id: 'bui-tahillar-hububat', baslik: 'Tahıllar (Buğday, Arpa, Mısır, Çeltik, Çavdar, Yulaf)', tur: 'tablo', medasKn: 'kn=92', sdmxDataflow: 'DF_BITKISEL_URETIM' },
          { id: 'bui-tahillar-baklagil', baslik: 'Kuru Baklagiller (Nohut, Kuru Fasulye, Kırmızı/Yeşil Mercimek)', tur: 'tablo', medasKn: 'kn=92' },
          { id: 'bui-tahillar-yagli-tohum', baslik: 'Yağlı Tohumlar (Ayçiçeği, Soya, Kanola, Aspir)', tur: 'tablo', medasKn: 'kn=92' },
          { id: 'bui-tahillar-tekstil', baslik: 'Tekstilde Kullanılan Bitkiler (Kütlü Pamuk vb.)', tur: 'tablo', medasKn: 'kn=92' },
          { id: 'bui-tahillar-yem', baslik: 'Yem Bitkileri (Yonca, Korunga, Silajlık Mısır)', tur: 'tablo', medasKn: 'kn=92' },
          { id: 'bui-tahillar-tibbi', baslik: 'Parfümeri, Eczacılık ve Benzeri Alanlarda Kullanılan Bitkiler, Yem Bitkileri Tohumu', tur: 'tablo', medasKn: 'kn=92' },
          { id: 'bui-tahillar-kok-yumru', baslik: 'Diğer Bitkisel Ürünler; Yenilebilir Kök ve Yumrular (Patates, Şeker Pancarı)', tur: 'tablo', medasKn: 'kn=92' }
        ]
      },
      {
        id: 'bui-arazi',
        baslik: 'Tarım ve Orman Alanları',
        tablolar: [
          { id: 'bui-arazi-iller', baslik: 'İllere Göre Tarım Alanları (Ekilen, Nadas, Meyve/Sebze Alanı)', tur: 'tablo', medasKn: 'kn=92' },
          { id: 'bui-arazi-toplam', baslik: 'Tarım ve Orman Alanları Genel Dağılımı', tur: 'tablo', medasKn: 'kn=92' }
        ]
      },
      {
        id: 'bui-db',
        baslik: 'Resmî Veritabanları ve Bültenler',
        tablolar: [
          { id: 'bui-bulten', baslik: 'Bitkisel Üretim Haber Bültenleri (1., 2. ve Son Tahminler)', tur: 'bulten', portalUrl: 'https://data.tuik.gov.tr' },
          { id: 'bui-medas-db', baslik: 'Bitkisel Üretim İstatistikleri Veritabanı (MEDAS kn=92)', tur: 'veritabani', medasKn: 'kn=92', sdmxDataflow: 'DF_BITKISEL_URETIM' }
        ]
      }
    ]
  },

  // ==========================================================================
  // 2. BİTKİSEL ÜRÜN DENGE TABLOLARI
  // ==========================================================================
  {
    id: 'bitkisel-denge',
    kod: 'DENGE',
    baslik: 'Bitkisel Ürün Denge Tabloları',
    aciklama: 'Üretim, yurt içi kullanım, ithalat, ihracat, kişi başı tüketim (kg) ve yeterlilik derecesi (%) arz-talep dengesi.',
    altGruplar: [
      {
        id: 'denge-tablolari',
        baslik: 'Ürün Denge Tabloları ve Yeterlilik Dereceleri (%)',
        tablolar: [
          { id: 'denge-tahillar', baslik: 'Tahıllar ve Diğer Bitkisel Ürünler Denge Tabloları (Buğday, Arpa, Mısır)', tur: 'tablo', medasKn: 'kn=104' },
          { id: 'denge-sebzeler', baslik: 'Sebzeler Denge Tabloları', tur: 'tablo', medasKn: 'kn=104' },
          { id: 'denge-meyveler', baslik: 'Meyveler, Sert Kabuklular ve İçecek Bitkileri Denge Tabloları', tur: 'tablo', medasKn: 'kn=104' },
          { id: 'denge-bulten', baslik: 'Bitkisel Ürün Denge Tabloları Resmî Haber Bülteni', tur: 'bulten' },
          { id: 'denge-db', baslik: 'Bitkisel Ürün Denge Tabloları Veritabanı (MEDAS kn=104)', tur: 'veritabani', medasKn: 'kn=104', sdmxDataflow: 'DF_BITKISEL_DENGE' }
        ]
      }
    ]
  },

  // ==========================================================================
  // 3. TARIM - ÇEVRE İSTATİSTİKLERİ
  // ==========================================================================
  {
    id: 'tarim-cevre',
    kod: 'ÇEVRE',
    baslik: 'Tarım - Çevre İstatistikleri',
    aciklama: 'Kimyasal gübre ve tarımsal ilaç (pestisit) kullanımı, organik tarım ve azot/fosfor (N-P) besin maddesi dengesi.',
    altGruplar: [
      {
        id: 'cevre-gubre-ilac',
        baslik: 'Girdi Kullanımı ve Besin Dengeleri',
        tablolar: [
          { id: 'cevre-gubre', baslik: 'Kimyasal Gübre Kullanımı (Azotlu, Fosfatlı, Potasyumlu Ton)', tur: 'tablo', aciklama: 'Tarım-GFE Girdi 1 gübre serilerinin tüketim boyutunu tamamlar.' },
          { id: 'cevre-ilac', baslik: 'Tarımsal İlaç Kullanımı (Fungusit, Herbisit, İnsektisit Ton)', tur: 'tablo', aciklama: 'Bitki koruma ürünleri fiili tonaj kullanımı.' },
          { id: 'cevre-organik', baslik: 'Organik Bitkisel Üretim ve Yüzde Değişimi', tur: 'tablo' },
          { id: 'cevre-azot-dengesi', baslik: 'Brüt Azot (Nitrojen) Dengesi', tur: 'tablo' },
          { id: 'cevre-fosfor-dengesi', baslik: 'Brüt Fosfor Dengesi', tur: 'tablo' }
        ]
      }
    ]
  },

  // ==========================================================================
  // 4. HAYVANSAL ÜRETİM İSTATİSTİKLERİ
  // ==========================================================================
  {
    id: 'hayvansal-uretim',
    kod: 'HÜİ',
    baslik: 'Hayvansal Üretim İstatistikleri',
    aciklama: 'Büyükbaş, küçükbaş ve kümes hayvan sayıları; çiğ süt, kırmızı et, yumurta, bal ve yün üretim miktarları.',
    altGruplar: [
      {
        id: 'hui-hayvan-sayilari',
        baslik: 'Tür ve Irklarına Göre Hayvan Sayıları (Stok Varlığı)',
        tablolar: [
          { id: 'hui-buyukbas', baslik: 'Büyükbaş Hayvan Sayıları (Kültür, Melez, Yerli Sığır, Manda)', tur: 'tablo', medasKn: 'kn=101' },
          { id: 'hui-kucukbas', baslik: 'Küçükbaş Hayvan Sayıları (Koyun [Merinos/Yerli], Keçi [Kıl/Tiftik])', tur: 'tablo', medasKn: 'kn=101' },
          { id: 'hui-kumes-sayi', baslik: 'Türlerine Göre Kümes Hayvan Sayıları (Etlik Piliç, Yumurtacı Tavuk, Hindi, Kaz, Ördek)', tur: 'tablo', medasKn: 'kn=101' },
          { id: 'hui-diger-hayvan', baslik: 'Diğer Hayvan Sayıları (At, Katır, Eşek, Deve)', tur: 'tablo', medasKn: 'kn=101' }
        ]
      },
      {
        id: 'hui-urunler',
        baslik: 'Hayvansal Ürünler ve Verim',
        tablolar: [
          { id: 'hui-sut-uretimi', baslik: 'Çiğ Süt Üretim Miktarı 2020 ve Sonrası (İnek, Koyun, Keçi, Manda Sütü)', tur: 'tablo', medasKn: 'kn=101', sdmxDataflow: 'DF_HAYVANSAL_URETIM' },
          { id: 'hui-et-kesim', baslik: 'Kesilen Hayvan Sayısı ve Et Üretim Miktarı (Kırmızı Et)', tur: 'tablo', medasKn: 'kn=101' },
          { id: 'hui-yumurta', baslik: 'Tavuk Yumurtası Üretim Sayısı', tur: 'tablo', medasKn: 'kn=101' },
          { id: 'hui-aricilik', baslik: 'Arıcılık (Kovan Sayısı, Bal ve Balmumu Üretimi)', tur: 'tablo', medasKn: 'kn=101' },
          { id: 'hui-yun-kil', baslik: 'Kırkılan Hayvan Sayısı ve Yün, Kıl, Tiftik Miktarı', tur: 'tablo', medasKn: 'kn=101' },
          { id: 'hui-deri', baslik: 'Deri Üretim Miktarı (Büyükbaş ve Küçükbaş)', tur: 'tablo', medasKn: 'kn=101' },
          { id: 'hui-ipekbocegi', baslik: 'İpekböcekçiliği (Kutu Sayısı ve Yaş Koza Üretimi)', tur: 'tablo', medasKn: 'kn=101' }
        ]
      },
      {
        id: 'hui-db',
        baslik: 'Hayvancılık Veritabanları ve Bültenleri',
        tablolar: [
          { id: 'hui-medas-db', baslik: 'Hayvancılık İstatistikleri Veritabanı (MEDAS kn=101)', tur: 'veritabani', medasKn: 'kn=101' },
          { id: 'hui-et-db', baslik: 'Kırmızı Et Üretimi İstatistikleri', tur: 'veritabani' },
          { id: 'hui-kumes-db', baslik: 'Kümes Hayvancılığı Üretimi İstatistikleri', tur: 'veritabani' },
          { id: 'hui-sut-db', baslik: 'Süt ve Süt Ürünleri Üretimi İstatistikleri (Sanayiye Aktarılan Çiğ Süt)', tur: 'veritabani' }
        ]
      }
    ]
  },

  // ==========================================================================
  // 5. TARIMSAL ALET VE MAKİNE İSTATİSTİKLERİ
  // ==========================================================================
  {
    id: 'tarimsal-makine',
    kod: 'MAKİNE',
    baslik: 'Tarımsal Alet ve Makine İstatistikleri',
    aciklama: 'Tarım-GFE Girdi 2 (%11,13 yatırım) kapsamındaki traktör, biçerdöver ve zirai alet-makine varlığı.',
    altGruplar: [
      {
        id: 'makine-varligi',
        baslik: 'Traktör, Biçerdöver ve Zirai Ekipman Parkı',
        tablolar: [
          { id: 'makine-traktor-bg', baslik: 'Traktör Sayısı (Beygir Gücüne Göre Dağılım)', tur: 'tablo', aciklama: '2WD/4WD ve HP dilimlerine göre il bazında traktör sayısı.' },
          { id: 'makine-traktor-toplam', baslik: 'İllere Göre Traktör Sayısı', tur: 'tablo' },
          { id: 'makine-bicerdover-yas', baslik: 'Biçerdöver Sayısı (Yaş Grubuna Göre)', tur: 'tablo' },
          { id: 'makine-bicerdover-toplam', baslik: 'Biçerdöver Sayısı (İl Bazında)', tur: 'tablo' },
          { id: 'makine-ekipman-secilmis', baslik: 'Tarımsal Alet ve Makine Sayıları (Mibzer, Pulluk, Balya vb.)', tur: 'tablo' },
          { id: 'makine-db', baslik: 'Tarımsal Alet ve Makine İstatistikleri Veritabanı', tur: 'veritabani' }
        ]
      }
    ]
  },

  // ==========================================================================
  // 6. TARIM ÜRÜNLERİ ÜRETİCİ FİYATLARI (ÇEGF & TARIM-ÜFE)
  // ==========================================================================
  {
    id: 'tarim-fiyatlari',
    kod: 'ÇEGF',
    baslik: 'Tarım Ürünleri Üretici Fiyatları ve Üretim Değerleri',
    aciklama: 'Çiftçinin eline geçen fiyatlar (ÇEGF), brüt ve net tarımsal üretim değerleri ile Tarım-ÜFE serileri.',
    altGruplar: [
      {
        id: 'cegf-fiyat-listesi',
        baslik: 'Çiftçinin Eline Geçen Birim Fiyatlar (TL/Kg, TL/Ton, TL/Baş)',
        tablolar: [
          { id: 'cegf-tahil-fiyat', baslik: 'Tahıl ve Diğer Bitkisel Ürün Fiyatları (Buğday, Arpa, Mısır, Baklagil)', tur: 'tablo', medasKn: 'kn=83' },
          { id: 'cegf-meyve-fiyat', baslik: 'Meyve Fiyatları (Zeytin, Fındık, Narenciye, Elma)', tur: 'tablo', medasKn: 'kn=83' },
          { id: 'cegf-sebze-fiyat', baslik: 'Sebze Fiyatları (Tarla ve Örtü Altı)', tur: 'tablo', medasKn: 'kn=83' },
          { id: 'cegf-canli-hayvan-fiyat', baslik: 'Canlı Hayvan Fiyatları (Büyükbaş, Küçükbaş, Kümes Hayvanı Başına TL)', tur: 'tablo', medasKn: 'kn=83' },
          { id: 'cegf-hayvansal-urun-fiyat', baslik: 'Hayvansal Ürün Fiyatları (Çiğ Süt, Yumurta, Bal, Yün TL Fiyatları)', tur: 'tablo', medasKn: 'kn=83' },
          { id: 'cegf-uretim-degeri', baslik: 'Bitkisel ve Hayvansal Üretim Değerleri (Cari Fiyatlarla Milyon TL)', tur: 'tablo', medasKn: 'kn=83' },
          { id: 'cegf-db', baslik: 'Tarımsal Ürün Fiyatları ve Üretim Değerleri Veritabanı (MEDAS kn=83)', tur: 'veritabani', medasKn: 'kn=83', sdmxDataflow: 'DF_CEGF' }
        ]
      }
    ]
  },

  // ==========================================================================
  // 7. TARIMSAL İŞLETME YAPI VE İŞGÜCÜ ÜCRET İSTATİSTİKLERİ
  // ==========================================================================
  {
    id: 'isletme-isgucu',
    kod: 'İŞGÜCÜ',
    baslik: 'Tarımsal İşletme Yapı ve İşgücü Ücret İstatistikleri',
    aciklama: 'Tarım-GFE Girdi 1 işçilik maliyetlerinin temelini oluşturan mevsimlik ve sürekli işçi yevmiyeleri ile tarım sayımları.',
    altGruplar: [
      {
        id: 'isgucu-ucretler',
        baslik: 'Tarımsal İşletmelerde (Hanehalkı) Ücret Yapısı Anketi Sonuçları',
        tablolar: [
          { id: 'isgucu-faaliyet-gundelik', baslik: 'Faaliyet Türlerine Göre Mevsimlik İşçilere Ödenen Ortalama Gündelik Ücretler (TL)', tur: 'tablo', aciklama: 'Çapa, hasat, budama ve ilaçlama işçiliği günlük yevmiyeleri.' },
          { id: 'isgucu-parcabasi-ucret', baslik: 'Faaliyet Türlerine Göre Mevsimlik İşçilere Ödenen Parçabaşı Ücret Karşılığı Ortalama Gündelik Ücretler', tur: 'tablo' },
          { id: 'isgucu-il-bazli-ucret', baslik: 'İllere Göre Mevsimlik İşçilere Ödenen Ortalama Gündelik Ücretler ile Sürekli İşçilere Ödenen Ortalama Aylık Ücretler', tur: 'tablo' },
          { id: 'isgucu-urun-secilmis', baslik: 'Ürünlere ve Seçilmiş Faaliyet Türlerine Göre Mevsimlik İşçilere Ödenen Ortalama Gündelik Ücretler', tur: 'tablo' },
          { id: 'isgucu-bulten', baslik: 'Tarımsal İşletme İşgücü Ücret Yapısı Resmî Haber Bülteni', tur: 'bulten' }
        ]
      },
      {
        id: 'isletme-arastirma',
        baslik: 'Tarımsal İşletme Yapı Araştırmaları ve Genel Tarım Sayımı',
        tablolar: [
          { id: 'sayim-arazi-sulama', baslik: 'Arazi Kullanımına Göre Sulanan ve Sulanmayan Arazi Dağılımı (2016 Araştırması)', tur: 'tablo' },
          { id: 'sayim-hayvan-buyuklugu', baslik: 'İşletme Büyüklüğüne Göre Hayvan Varlığı Dağılımı (2016)', tur: 'tablo' },
          { id: 'sayim-2001-genel', baslik: 'Genel Tarım Sayımı Köy Genel Bilgi Anketi Sonuçları (2001)', tur: 'tablo' }
        ]
      }
    ]
  },

  // ==========================================================================
  // 8. BALIKÇILIK VE SU ÜRÜNLERİ İSTATİSTİKLERİ
  // ==========================================================================
  {
    id: 'balikcilik',
    kod: 'SU',
    baslik: 'Balıkçılık ve Su Ürünleri İstatistikleri',
    aciklama: 'Deniz ve iç su balıkları avcılığı, yetiştiricilik (kültür balıkçılığı) ve karaya çıkış verileri.',
    altGruplar: [
      {
        id: 'su-urunleri-avcilik',
        baslik: 'Avcılık ve Yetiştiricilik Miktarları',
        tablolar: [
          { id: 'su-deniz-baligi', baslik: 'Avlanan Deniz Balıkları Miktarı (Hamsi, Palamut, İstavrit vb.)', tur: 'tablo' },
          { id: 'su-kultur-baligi', baslik: 'Kültür Balıkları Üretim Miktarı (Levrek, Çipura, Alabalık)', tur: 'tablo' },
          { id: 'su-tatlisu', baslik: 'Avlanan Tatlısu Ürünleri Miktarı', tur: 'tablo' },
          { id: 'su-bulten', baslik: 'Su Ürünleri İstatistikleri Resmî Haber Bülteni', tur: 'bulten' },
          { id: 'su-db', baslik: 'Su Ürünleri İstatistikleri Veritabanı', tur: 'veritabani' }
        ]
      }
    ]
  }
];

/**
 * Taksonomi Arama Fonksiyonu
 */
export function searchTuikTarimTaxonomy(query: string): TuikTarimTableItem[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  const results: TuikTarimTableItem[] = [];
  for (const theme of TUIK_TARIM_TAXONOMY) {
    for (const group of theme.altGruplar) {
      for (const table of group.tablolar) {
        if (
          table.baslik.toLowerCase().includes(q) ||
          theme.baslik.toLowerCase().includes(q) ||
          group.baslik.toLowerCase().includes(q) ||
          (table.medasKn && table.medasKn.toLowerCase().includes(q))
        ) {
          results.push(table);
        }
      }
    }
  }
  return results;
}
