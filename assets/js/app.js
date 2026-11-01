// app.js – TÜİK İl Bazlı Tarımsal Girdi ve Ürün Çıktı Analizi
"use strict";

// --- 81 İL LİSTESİ ---
const cities = [
    "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Amasya", "Ankara", "Antalya", "Artvin", "Aydın", "Balıkesir",
    "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa", "Çanakkale", "Çankırı", "Çorum", "Denizli",
    "Diyarbakır", "Edirne", "Elazığ", "Erzincan", "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkari",
    "Hatay", "Isparta", "Mersin", "İstanbul", "İzmir", "Kars", "Kastamonu", "Kayseri", "Kırklareli", "Kırşehir",
    "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa", "Kahramanmaraş", "Mardin", "Muğla", "Muş", "Nevşehir",
    "Niğde", "Ordu", "Rize", "Sakarya", "Samsun", "Siirt", "Sinop", "Sivas", "Tekirdağ", "Tokat",
    "Trabzon", "Tunceli", "Şanlıurfa", "Uşak", "Van", "Yozgat", "Zonguldak", "Aksaray", "Bayburt", "Karaman",
    "Kırıkkale", "Batman", "Şırnak", "Bartın", "Ardahan", "Iğdır", "Yalova", "Karabük", "Kilis", "Osmaniye", "Düzce"
];

// --- TÜM TARIMSAL & HAYVANSAL ÇIKTILAR VE GİRDİLER TANIM HAVUZU ---
const productDefinitions = [
    // ==========================================
    // 1. FAALİYET ÇIKTISI: TAHILLAR VE BAKLAGİLLER
    // ==========================================
    { code: 'URUN-T01', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_tahil', subtopic: 'Tahıllar', name: 'Ekmeklik Buğday (Anadolu Kırmızı Sert)', basePrice: 11.60, unit: 'TL/Kg', baseIndex: 148.2 },
    { code: 'URUN-T02', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_tahil', subtopic: 'Tahıllar', name: 'Makarnalık (Durum) Buğday', basePrice: 12.40, unit: 'TL/Kg', baseIndex: 152.0 },
    { code: 'URUN-T03', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_tahil', subtopic: 'Tahıllar', name: 'Yemlik Arpa', basePrice: 9.50, unit: 'TL/Kg', baseIndex: 144.5 },
    { code: 'URUN-T04', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_tahil', subtopic: 'Tahıllar', name: 'Tane Mısır (1. Ürün)', basePrice: 9.20, unit: 'TL/Kg', baseIndex: 146.0 },
    { code: 'URUN-T05', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_tahil', subtopic: 'Tahıllar', name: 'Çeltik (Baldo)', basePrice: 28.00, unit: 'TL/Kg', baseIndex: 162.0 },
    { code: 'URUN-T06', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_tahil', subtopic: 'Tahıllar', name: 'Çeltik (Osmancık)', basePrice: 24.00, unit: 'TL/Kg', baseIndex: 158.5 },
    { code: 'URUN-T07', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_tahil', subtopic: 'Tahıllar', name: 'Yulaf', basePrice: 9.80, unit: 'TL/Kg', baseIndex: 143.0 },
    { code: 'URUN-T08', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_tahil', subtopic: 'Tahıllar', name: 'Çavdar', basePrice: 8.90, unit: 'TL/Kg', baseIndex: 140.0 },
    { code: 'URUN-B01', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_tahil', subtopic: 'Baklagiller', name: 'Kırmızı Mercimek (Kabuklu/Ham)', basePrice: 27.50, unit: 'TL/Kg', baseIndex: 165.0 },
    { code: 'URUN-B02', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_tahil', subtopic: 'Baklagiller', name: 'Yeşil Mercimek', basePrice: 32.00, unit: 'TL/Kg', baseIndex: 160.0 },
    { code: 'URUN-B03', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_tahil', subtopic: 'Baklagiller', name: 'Nohut (Koçbaşı 8-9mm)', basePrice: 38.00, unit: 'TL/Kg', baseIndex: 155.0 },
    { code: 'URUN-B04', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_tahil', subtopic: 'Baklagiller', name: 'Kuru Fasulye (Dermason)', basePrice: 52.00, unit: 'TL/Kg', baseIndex: 168.0 },

    // ==========================================
    // 2. FAALİYET ÇIKTISI: ENDÜSTRİ BİTKİLERİ VE YAĞLI TOHUMLAR
    // ==========================================
    { code: 'URUN-E01', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_endustri', subtopic: 'Endüstri Bitkileri', name: 'Kütlü Pamuk (Standart 1 Beyaz)', basePrice: 28.50, unit: 'TL/Kg', baseIndex: 154.0 },
    { code: 'URUN-E02', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_endustri', subtopic: 'Yağlı Tohumlar', name: 'Yağlık Ayçiçeği (%44 Yağ Oranlı)', basePrice: 21.80, unit: 'TL/Kg', baseIndex: 151.2 },
    { code: 'URUN-E03', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_endustri', subtopic: 'Endüstri Bitkileri', name: 'Şeker Pancarı (%16 Polar Şeker)', basePrice: 2.45, unit: 'TL/Kg', baseIndex: 147.0 },
    { code: 'URUN-E04', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_endustri', subtopic: 'Endüstri Bitkileri', name: 'Yaş Çay Yaprağı (Çiftçi Eline Geçen)', basePrice: 21.00, unit: 'TL/Kg', baseIndex: 159.0 },
    { code: 'URUN-E05', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_endustri', subtopic: 'Yağlı Tohumlar', name: 'Soya Fasulyesi', basePrice: 20.50, unit: 'TL/Kg', baseIndex: 149.0 },
    { code: 'URUN-E06', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_endustri', subtopic: 'Yağlı Tohumlar', name: 'Kanola (Kolza)', basePrice: 19.00, unit: 'TL/Kg', baseIndex: 146.0 },
    { code: 'URUN-E07', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_endustri', subtopic: 'Endüstri Bitkileri', name: 'Tütün (Ege / Şark Tipi)', basePrice: 175.00, unit: 'TL/Kg', baseIndex: 164.0 },
    { code: 'URUN-E08', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_endustri', subtopic: 'Endüstri Bitkileri', name: 'Haşhaş Tohumu ve Kapsülü', basePrice: 65.00, unit: 'TL/Kg', baseIndex: 153.0 },

    // ==========================================
    // 3. FAALİYET ÇIKTISI: SEBZELER VE SERA ÜRÜNLERİ
    // ==========================================
    { code: 'URUN-S01', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_sebze', subtopic: 'Tarla Sebzeleri', name: 'Sofralık Tarla Domatesi', basePrice: 16.50, unit: 'TL/Kg', baseIndex: 149.0 },
    { code: 'URUN-S02', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_sebze', subtopic: 'Sera Ürünleri', name: 'Örtüaltı / Sera Domatesi', basePrice: 24.00, unit: 'TL/Kg', baseIndex: 158.0 },
    { code: 'URUN-S03', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_sebze', subtopic: 'Tarla Sebzeleri', name: 'Sanayi Tipi Salçalık Domates', basePrice: 3.90, unit: 'TL/Kg', baseIndex: 142.0 },
    { code: 'URUN-S04', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_sebze', subtopic: 'Tarla Sebzeleri', name: 'Sivri Biber', basePrice: 26.00, unit: 'TL/Kg', baseIndex: 155.0 },
    { code: 'URUN-S05', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_sebze', subtopic: 'Tarla Sebzeleri', name: 'Kapya Kırmızı Biber', basePrice: 24.00, unit: 'TL/Kg', baseIndex: 152.0 },
    { code: 'URUN-S06', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_sebze', subtopic: 'Tarla Sebzeleri', name: 'Kuru Soğan (Yemeklik)', basePrice: 13.50, unit: 'TL/Kg', baseIndex: 145.0 },
    { code: 'URUN-S07', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_sebze', subtopic: 'Tarla Sebzeleri', name: 'Patates (Yemeklik 1. Kalite)', basePrice: 14.00, unit: 'TL/Kg', baseIndex: 144.0 },
    { code: 'URUN-S08', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_sebze', subtopic: 'Tarla Sebzeleri', name: 'Karpuz (Tarla Üretici)', basePrice: 6.80, unit: 'TL/Kg', baseIndex: 138.0 },
    { code: 'URUN-S09', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_sebze', subtopic: 'Tarla Sebzeleri', name: 'Kavun (Kırkağaç vb.)', basePrice: 11.50, unit: 'TL/Kg', baseIndex: 141.0 },
    { code: 'URUN-S10', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_sebze', subtopic: 'Sera Ürünleri', name: 'Sera Hıyar / Salatalık', basePrice: 18.00, unit: 'TL/Kg', baseIndex: 150.0 },
    { code: 'URUN-S11', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_sebze', subtopic: 'Tarla Sebzeleri', name: 'Patlıcan (Tarla/Sera)', basePrice: 19.50, unit: 'TL/Kg', baseIndex: 148.0 },
    { code: 'URUN-S12', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_sebze', subtopic: 'Tarla Sebzeleri', name: 'Taze Fasulye', basePrice: 38.00, unit: 'TL/Kg', baseIndex: 156.0 },

    // ==========================================
    // 4. FAALİYET ÇIKTISI: MEYVELER VE SERT KABUKLULAR
    // ==========================================
    { code: 'URUN-M01', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_meyve', subtopic: 'Sert Kabuklular', name: 'Kabuklu Tombul Fındık (%50 Randıman)', basePrice: 140.00, unit: 'TL/Kg', baseIndex: 168.0 },
    { code: 'URUN-M02', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_meyve', subtopic: 'Zeytin ve Zeytinyağı', name: 'Yağlık Zeytin (Fabrika Teslim)', basePrice: 36.00, unit: 'TL/Kg', baseIndex: 162.0 },
    { code: 'URUN-M03', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_meyve', subtopic: 'Zeytin ve Zeytinyağı', name: 'Sofralık Siyah Zeytin (Gemlik Tipi)', basePrice: 78.00, unit: 'TL/Kg', baseIndex: 165.0 },
    { code: 'URUN-M04', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_meyve', subtopic: 'Sert Kabuklular', name: 'Antep Fıstığı (Kırmızı Kabuklu)', basePrice: 390.00, unit: 'TL/Kg', baseIndex: 175.0 },
    { code: 'URUN-M05', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_meyve', subtopic: 'Kuru Meyveler', name: 'Kuru Kayısı (Malatya Günkurusu)', basePrice: 250.00, unit: 'TL/Kg', baseIndex: 170.0 },
    { code: 'URUN-M06', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_meyve', subtopic: 'Kuru Meyveler', name: 'Kuru İncir (Aydın Dağ İnciri)', basePrice: 280.00, unit: 'TL/Kg', baseIndex: 174.0 },
    { code: 'URUN-M07', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_meyve', subtopic: 'Kuru Meyveler', name: 'Çekirdeksiz Kuru Üzüm (Sultani No:9)', basePrice: 110.00, unit: 'TL/Kg', baseIndex: 160.0 },
    { code: 'URUN-M08', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_meyve', subtopic: 'Taze Meyveler', name: 'Sofralık Elma (Starking/Golden)', basePrice: 23.00, unit: 'TL/Kg', baseIndex: 151.0 },
    { code: 'URUN-M09', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_meyve', subtopic: 'Narenciye', name: 'Portakal (Washington Navel)', basePrice: 15.50, unit: 'TL/Kg', baseIndex: 145.0 },
    { code: 'URUN-M10', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_meyve', subtopic: 'Narenciye', name: 'Limon (Enterdonat / Mayer)', basePrice: 18.00, unit: 'TL/Kg', baseIndex: 147.0 },
    { code: 'URUN-M11', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_meyve', subtopic: 'Narenciye', name: 'Mandalina (Satsuma)', basePrice: 16.00, unit: 'TL/Kg', baseIndex: 146.0 },
    { code: 'URUN-M12', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_meyve', subtopic: 'Taze Meyveler', name: 'Kiraz (0900 Ziraat İhracatlık)', basePrice: 75.00, unit: 'TL/Kg', baseIndex: 164.0 },
    { code: 'URUN-M13', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_meyve', subtopic: 'Sert Kabuklular', name: 'Kabuklu Ceviz (Yerli Çetnır vb.)', basePrice: 160.00, unit: 'TL/Kg', baseIndex: 158.0 },
    { code: 'URUN-M14', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_meyve', subtopic: 'Sert Kabuklular', name: 'Kabuklu Badem (Ferragnes vb.)', basePrice: 145.00, unit: 'TL/Kg', baseIndex: 156.0 },

    // ==========================================
    // 5. FAALİYET ÇIKTISI: CANLI HAYVAN VE KARKAS ET
    // ==========================================
    { code: 'URUN-H01', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_hayvancilik', subtopic: 'Karkas Et', name: 'Dana Karkas Et (Yağsız / Randımanlı)', basePrice: 390.00, unit: 'TL/Kg', baseIndex: 172.0 },
    { code: 'URUN-H02', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_hayvancilik', subtopic: 'Karkas Et', name: 'Kuzu Karkas Et (Kıvırcık/Karaman)', basePrice: 445.00, unit: 'TL/Kg', baseIndex: 176.0 },
    { code: 'URUN-H03', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_hayvancilik', subtopic: 'Canlı Hayvan', name: 'Canlı Besi Danası (Baskül Ağırlık)', basePrice: 225.00, unit: 'TL/Kg', baseIndex: 168.0 },
    { code: 'URUN-H04', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_hayvancilik', subtopic: 'Canlı Hayvan', name: 'Canlı Kasaplık Kuzu / Toklu', basePrice: 240.00, unit: 'TL/Kg', baseIndex: 170.0 },
    { code: 'URUN-H05', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_hayvancilik', subtopic: 'Damızlık Hayvan', name: 'Canlı Damızlık Gebe Düve', basePrice: 95000.00, unit: 'TL/Baş', baseIndex: 165.0 },
    { code: 'URUN-H06', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_hayvancilik', subtopic: 'Damızlık Hayvan', name: 'Canlı Damızlık Koyun / Keçi', basePrice: 11500.00, unit: 'TL/Baş', baseIndex: 162.0 },
    { code: 'URUN-H07', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_hayvancilik', subtopic: 'Kanatlı Hayvan', name: 'Etlik Piliç / Broiler (Canlı Satış)', basePrice: 46.00, unit: 'TL/Kg', baseIndex: 154.0 },

    // ==========================================
    // 6. FAALİYET ÇIKTISI: SÜT, YUMURTA VE ARICILIK
    // ==========================================
    { code: 'URUN-SUT01', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_sut_kumes', subtopic: 'Çiğ Süt', name: 'Soğutulmuş Çiğ İnek Sütü (%3.6 Yağ)', basePrice: 17.00, unit: 'TL/Lt', baseIndex: 158.0 },
    { code: 'URUN-SUT02', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_sut_kumes', subtopic: 'Çiğ Süt', name: 'Çiğ Koyun Sütü', basePrice: 34.00, unit: 'TL/Lt', baseIndex: 164.0 },
    { code: 'URUN-SUT03', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_sut_kumes', subtopic: 'Çiğ Süt', name: 'Çiğ Keçi Sütü', basePrice: 29.50, unit: 'TL/Lt', baseIndex: 162.0 },
    { code: 'URUN-KUM01', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_sut_kumes', subtopic: 'Yumurta', name: 'Sofralık Yumurta (M-L Boy 30\'lu Koli)', basePrice: 138.00, unit: 'TL/Koli', baseIndex: 152.0 },
    { code: 'URUN-ARI01', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_sut_kumes', subtopic: 'Arıcılık Ürünleri', name: 'Doğal Süzme Çiçek Balı (Üretici Toptan)', basePrice: 290.00, unit: 'TL/Kg', baseIndex: 166.0 },
    { code: 'URUN-ARI02', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_sut_kumes', subtopic: 'Arıcılık Ürünleri', name: 'Çam Balı (Muğla Yöresi)', basePrice: 310.00, unit: 'TL/Kg', baseIndex: 168.0 },
    { code: 'URUN-ARI03', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_sut_kumes', subtopic: 'Arıcılık Ürünleri', name: 'Karakovan Petek Balı', basePrice: 420.00, unit: 'TL/Kg', baseIndex: 172.0 },
    { code: 'URUN-ARI04', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_sut_kumes', subtopic: 'Arıcılık Ürünleri', name: 'Doğal Arı Balmumu', basePrice: 260.00, unit: 'TL/Kg', baseIndex: 155.0 },

    // ==========================================
    // 7. TARIMSAL GİRDİLER: GÜBRE VE TOPRAK İYİLEŞTİRİCİLER (TGFE)
    // ==========================================
    { code: 'TGFE-G01', type: 'girdi', typeLabel: 'Girdi / Maliyet', group: 'gubre', subtopic: 'Azotlu Gübreler', name: 'Üre Gübresi (%46 N)', basePrice: 14800.00, unit: 'TL/Ton', baseIndex: 142.5 },
    { code: 'TGFE-G02', type: 'girdi', typeLabel: 'Girdi / Maliyet', group: 'gubre', subtopic: 'Azotlu Gübreler', name: 'Amonyum Sülfat (%21 N)', basePrice: 8900.00, unit: 'TL/Ton', baseIndex: 138.2 },
    { code: 'TGFE-G03', type: 'girdi', typeLabel: 'Girdi / Maliyet', group: 'gubre', subtopic: 'Fosfatlı Gübreler', name: 'DAP Gübresi (18-46-0)', basePrice: 21500.00, unit: 'TL/Ton', baseIndex: 149.0 },
    { code: 'TGFE-G04', type: 'girdi', typeLabel: 'Girdi / Maliyet', group: 'gubre', subtopic: 'Fosfatlı Gübreler', name: 'Kompoze Gübre (15-15-15)', basePrice: 16200.00, unit: 'TL/Ton', baseIndex: 144.1 },
    { code: 'TGFE-G05', type: 'girdi', typeLabel: 'Girdi / Maliyet', group: 'gubre', subtopic: 'Potasyumlu Gübreler', name: 'Potasyum Sülfat Gübresi', basePrice: 26000.00, unit: 'TL/Ton', baseIndex: 151.4 },
    { code: 'TGFE-G06', type: 'girdi', typeLabel: 'Girdi / Maliyet', group: 'gubre', subtopic: 'Kompostlar', name: 'Organik Katı Çiftlik Gübresi / Kompost', basePrice: 1250.00, unit: 'TL/Ton', baseIndex: 130.0 },

    // ==========================================
    // 8. TARIMSAL GİRDİLER: HAYVAN YEMİ (TGFE)
    // ==========================================
    { code: 'TGFE-Y01', type: 'girdi', typeLabel: 'Girdi / Maliyet', group: 'yem', subtopic: 'Büyükbaş Yemleri', name: 'Büyükbaş Besi Yemi (%14 HP)', basePrice: 9.20, unit: 'TL/Kg', baseIndex: 136.4 },
    { code: 'TGFE-Y02', type: 'girdi', typeLabel: 'Girdi / Maliyet', group: 'yem', subtopic: 'Büyükbaş Yemleri', name: 'Büyükbaş Süt Yemi (%19 HP)', basePrice: 10.40, unit: 'TL/Kg', baseIndex: 139.1 },
    { code: 'TGFE-Y03', type: 'girdi', typeLabel: 'Girdi / Maliyet', group: 'yem', subtopic: 'Küçükbaş Yemleri', name: 'Koyun-Kuzu Büyütme Yemi', basePrice: 9.80, unit: 'TL/Kg', baseIndex: 137.0 },
    { code: 'TGFE-Y04', type: 'girdi', typeLabel: 'Girdi / Maliyet', group: 'yem', subtopic: 'Kümes Hayvanı Yemleri', name: 'Yumurtacı Tavuk Yemi', basePrice: 12.50, unit: 'TL/Kg', baseIndex: 141.2 },
    { code: 'TGFE-Y05', type: 'girdi', typeLabel: 'Girdi / Maliyet', group: 'yem', subtopic: 'Silajlık Bitkiler', name: 'Mısır Silajı (Paketli)', basePrice: 2.80, unit: 'TL/Kg', baseIndex: 129.5 },
    { code: 'TGFE-Y06', type: 'girdi', typeLabel: 'Girdi / Maliyet', group: 'yem', subtopic: 'Silajlık Bitkiler', name: 'Yonca Kuru Otu (Balya)', basePrice: 6.50, unit: 'TL/Kg', baseIndex: 133.0 },

    // ==========================================
    // 9. TARIMSAL GİRDİLER: TOHUM VE FİDE (TGFE)
    // ==========================================
    { code: 'TGFE-T01', type: 'girdi', typeLabel: 'Girdi / Maliyet', group: 'tohum', subtopic: 'Tahıl Tohumları', name: 'Sertifikalı Ekmeklik Buğday Tohumu', basePrice: 18.50, unit: 'TL/Kg', baseIndex: 132.8 },
    { code: 'TGFE-T02', type: 'girdi', typeLabel: 'Girdi / Maliyet', group: 'tohum', subtopic: 'Tahıl Tohumları', name: 'Sertifikalı Arpa Tohumu', basePrice: 15.20, unit: 'TL/Kg', baseIndex: 130.4 },
    { code: 'TGFE-T03', type: 'girdi', typeLabel: 'Girdi / Maliyet', group: 'tohum', subtopic: 'Endüstri Bitkileri Tohumları', name: 'Hibrit Mısır Tohumu (50.000 adet)', basePrice: 3450.00, unit: 'TL/Paket', baseIndex: 145.2 },
    { code: 'TGFE-T04', type: 'girdi', typeLabel: 'Girdi / Maliyet', group: 'tohum', subtopic: 'Endüstri Bitkileri Tohumları', name: 'Yağlık Ayçiçeği Tohumu (150.000 adet)', basePrice: 4200.00, unit: 'TL/Paket', baseIndex: 143.0 },
    { code: 'TGFE-T05', type: 'girdi', typeLabel: 'Girdi / Maliyet', group: 'tohum', subtopic: 'Sebze Fideleri', name: 'Aşılı Domates Fidesi', basePrice: 14.50, unit: 'TL/Adet', baseIndex: 148.6 },
    { code: 'TGFE-T06', type: 'girdi', typeLabel: 'Girdi / Maliyet', group: 'tohum', subtopic: 'Meyve Fidanları', name: 'Sertifikalı Zeytin/Meyve Fidanı (Tüplü)', basePrice: 120.00, unit: 'TL/Adet', baseIndex: 138.0 },

    // ==========================================
    // 10. TARIMSAL GİRDİLER: ENERJİ VE YAKITLAR (TGFE)
    // ==========================================
    { code: 'TGFE-E01', type: 'girdi', typeLabel: 'Girdi / Maliyet', group: 'enerji', subtopic: 'Motorin', name: 'Kırsal Motorin (Tarımsal Akaryakıt)', basePrice: 44.80, unit: 'TL/Lt', baseIndex: 154.2 },
    { code: 'TGFE-E02', type: 'girdi', typeLabel: 'Girdi / Maliyet', group: 'enerji', subtopic: 'Benzin', name: 'Kurşunsuz Benzin 95 Oktan', basePrice: 45.20, unit: 'TL/Lt', baseIndex: 152.0 },
    { code: 'TGFE-E03', type: 'girdi', typeLabel: 'Girdi / Maliyet', group: 'enerji', subtopic: 'Elektrik', name: 'Tarımsal Sulama Elektrik Tarifesi', basePrice: 3.10, unit: 'TL/kWh', baseIndex: 146.5 },
    { code: 'TGFE-E04', type: 'girdi', typeLabel: 'Girdi / Maliyet', group: 'enerji', subtopic: 'LPG', name: 'Otogaz / Tarımsal LPG', basePrice: 25.40, unit: 'TL/Lt', baseIndex: 140.8 },
    { code: 'TGFE-E05', type: 'girdi', typeLabel: 'Girdi / Maliyet', group: 'enerji', subtopic: 'Fuel-Oil', name: 'Kalorifer Yakıtı / Fuel-Oil', basePrice: 32.50, unit: 'TL/Kg', baseIndex: 139.0 },

    // ==========================================
    // 11. TARIMSAL GİRDİLER: TARIM İLAÇLARI (TGFE)
    // ==========================================
    { code: 'TGFE-I01', type: 'girdi', typeLabel: 'Girdi / Maliyet', group: 'ilac', subtopic: 'Herbisitler (Yabancı Ot)', name: 'Geniş Yapraklı Yabancı Ot İlacı (Herbisit)', basePrice: 650.00, unit: 'TL/Lt', baseIndex: 144.0 },
    { code: 'TGFE-I02', type: 'girdi', typeLabel: 'Girdi / Maliyet', group: 'ilac', subtopic: 'İnsektisitler (Böcek)', name: 'Zararlı Böcek İlacı (İnsektisit)', basePrice: 850.00, unit: 'TL/Lt', baseIndex: 146.5 },
    { code: 'TGFE-I03', type: 'girdi', typeLabel: 'Girdi / Maliyet', group: 'ilac', subtopic: 'Fungusitler (Mantar)', name: 'Külleme ve Pas İlacı (Fungusit)', basePrice: 920.00, unit: 'TL/Lt', baseIndex: 147.2 },

    // ==========================================
    // 12. TARIMSAL GİRDİLER: TARIM MAKİNE VE TEÇHİZATI (TGFE)
    // ==========================================
    { code: 'TGFE-M01', type: 'girdi', typeLabel: 'Girdi / Maliyet', group: 'makine', subtopic: 'Traktörler', name: '75-90 BG Çift Çeker Traktör Endeksi', basePrice: 1750000.00, unit: 'TL', baseIndex: 158.0 },
    { code: 'TGFE-M02', type: 'girdi', typeLabel: 'Girdi / Maliyet', group: 'makine', subtopic: 'Pulluklar', name: '4 Soklu Döner Kulaklı Pulluk', basePrice: 185000.00, unit: 'TL', baseIndex: 143.5 },
    { code: 'TGFE-M03', type: 'girdi', typeLabel: 'Girdi / Maliyet', group: 'makine', subtopic: 'Mibzerler', name: 'Pnömatik Hassas Ekim Mibzeri', basePrice: 320000.00, unit: 'TL', baseIndex: 147.0 },
    { code: 'TGFE-M04', type: 'girdi', typeLabel: 'Girdi / Maliyet', group: 'makine', subtopic: 'Hasat Makineleri', name: 'Biçerdöver ve Balya Makinesi Endeksi', basePrice: 4200000.00, unit: 'TL', baseIndex: 162.0 },
    { code: 'TGFE-M05', type: 'girdi', typeLabel: 'Girdi / Maliyet', group: 'makine', subtopic: 'Sulama Sistemleri', name: 'Damla Sulama Borusu (100m kangal)', basePrice: 1650.00, unit: 'TL/Rulo', baseIndex: 139.4 },

    // ==========================================
    // 13. TARIMSAL GİRDİLER: HİZMETLER (İŞÇİLİK, KİRA, NAKLİYE)
    // ==========================================
    { code: 'TGFE-H01', type: 'girdi', typeLabel: 'Girdi / Maliyet', group: 'hizmet', subtopic: 'İşçilik Ücretleri', name: 'Tarımsal Vasıfsız İşçi (Günlük Yevmiye)', basePrice: 850.00, unit: 'TL/Gün', baseIndex: 152.0 },
    { code: 'TGFE-H02', type: 'girdi', typeLabel: 'Girdi / Maliyet', group: 'hizmet', subtopic: 'İşçilik Ücretleri', name: 'Traktör Operatörü / Usta İşçilik', basePrice: 1400.00, unit: 'TL/Gün', baseIndex: 155.0 },
    { code: 'TGFE-H03', type: 'girdi', typeLabel: 'Girdi / Maliyet', group: 'hizmet', subtopic: 'Tamirat-Bakım', name: 'Traktör ve Makine Periyodik Bakım-Onarım', basePrice: 4500.00, unit: 'TL/İşlem', baseIndex: 148.0 },
    { code: 'TGFE-H04', type: 'girdi', typeLabel: 'Girdi / Maliyet', group: 'hizmet', subtopic: 'Ulaşım-Nakliye', name: 'Ürün Nakliyesi (İl İçi Ortalama Sefer)', basePrice: 3800.00, unit: 'TL/Sefer', baseIndex: 150.5 },
    { code: 'TGFE-H05', type: 'girdi', typeLabel: 'Girdi / Maliyet', group: 'hizmet', subtopic: 'Arazi Kiraları', name: 'Sulu Tarım Arazisi Kirası (Yıllık Dekar)', basePrice: 2200.00, unit: 'TL/Dekar/Yıl', baseIndex: 140.0 },
    { code: 'TGFE-H06', type: 'girdi', typeLabel: 'Girdi / Maliyet', group: 'hizmet', subtopic: 'Sigorta Primleri', name: 'TARSİM Tarım Sigorta Poliçe Ortalaması', basePrice: 1250.00, unit: 'TL/Poliçe', baseIndex: 137.5 }
];

// Dinamik Alt Kategori Eşleme Haritası
const inputCategories = {};
productDefinitions.forEach(p => {
    if (!inputCategories[p.group]) {
        inputCategories[p.group] = [];
    }
    if (!inputCategories[p.group].includes(p.subtopic)) {
        inputCategories[p.group].push(p.subtopic);
    }
});

// Dönem Katsayıları
const periods = [
    { id: '2026-10', name: 'Ekim 2026', factor: 1.0 },
    { id: '2026-9', name: 'Eylül 2026', factor: 0.978 },
    { id: '2026-8', name: 'Ağustos 2026', factor: 0.955 },
    { id: '2026-all', name: '2026 Ortalaması', factor: 0.942 }
];

// İl ve Ürün bazında yerel tarım/hayvancılık uzmanlaşma katsayıları
function getSpecializationFactor(city, prod) {
    let factor = 1.0;
    
    // Fındık uzmanlık bölgesi (Doğu ve Batı Karadeniz)
    if (prod.name.includes("Fındık")) {
        if (["Giresun", "Ordu", "Trabzon", "Düzce", "Sakarya", "Samsun"].includes(city)) factor = 1.04;
    }
    // Çay uzmanlık bölgesi
    if (prod.name.includes("Çay")) {
        if (["Rize", "Trabzon", "Artvin", "Giresun"].includes(city)) factor = 1.02;
    }
    // Pamuk uzmanlık bölgesi
    if (prod.name.includes("Pamuk")) {
        if (["Şanlıurfa", "Diyarbakır", "Aydın", "Adana", "Hatay"].includes(city)) factor = 1.03;
    }
    // Antep Fıstığı
    if (prod.name.includes("Antep Fıstığı")) {
        if (["Gaziantep", "Şanlıurfa", "Siirt", "Adıyaman"].includes(city)) factor = 1.05;
    }
    // Kayısı
    if (prod.name.includes("Kayısı")) {
        if (["Malatya", "Elazığ", "Iğdır"].includes(city)) factor = 1.06;
    }
    // Zeytin ve Zeytinyağı
    if (prod.name.includes("Zeytin")) {
        if (["Aydın", "İzmir", "Balıkesir", "Manisa", "Çanakkale", "Muğla", "Hatay", "Kilis"].includes(city)) factor = 1.03;
    }
    // Narenciye
    if (prod.group === "cikti_meyve" && ["Portakal", "Limon", "Mandalina"].some(n => prod.name.includes(n))) {
        if (["Antalya", "Mersin", "Adana", "Hatay", "Muğla"].includes(city)) factor = 1.02;
    }
    // Hububat / Tahıl (İç Anadolu ve Çukurova)
    if (prod.group === "cikti_tahil") {
        if (["Konya", "Ankara", "Eskişehir", "Aksaray", "Yozgat", "Sivas", "Tekirdağ", "Edirne"].includes(city)) factor = 1.02;
    }
    // Canlı Hayvan ve Karkas Et (Doğu Anadolu ve İç Ege/Marmara)
    if (prod.group === "cikti_hayvancilik" || prod.group === "cikti_sut_kumes") {
        if (["Erzurum", "Kars", "Ağrı", "Van", "Balıkesir", "Afyonkarahisar", "Konya", "İzmir"].includes(city)) factor = 1.02;
    }

    return factor;
}

// Genel Bölgesel Maliyet Katsayısı (TÜİK İstatistiki Bölge Birimleri baz alınarak)
function getRegionCoefficient(city) {
    if (["Erzurum", "Van", "Hakkari", "Ağrı", "Kars", "Iğdır", "Ardahan", "Muş", "Bitlis", "Şırnak"].includes(city)) return 1.04;
    if (["Konya", "Karaman", "Adana", "Osmaniye", "Mersin", "Aksaray", "Niğde"].includes(city)) return 0.99;
    if (["İzmir", "Manisa", "Aydın", "Bursa", "Tekirdağ", "Kocaeli", "İstanbul"].includes(city)) return 0.98;
    if (["Rize", "Trabzon", "Artvin", "Giresun", "Ordu"].includes(city)) return 1.02;
    return 1.00;
}

// 81 il ve 90'dan fazla ürün çıktısı ve girdi kalemi için kapsamlı veri havuzu
function generateComprehensiveData() {
    const data = [];
    
    cities.forEach(city => {
        const regCoeff = getRegionCoefficient(city);
        
        periods.forEach(p => {
            productDefinitions.forEach(prod => {
                const specFactor = getSpecializationFactor(city, prod);
                
                // Deterministik kontrollü dalgalanma (+/- %3)
                const charCodeSum = (city.charCodeAt(0) * 3 + prod.name.charCodeAt(1) + p.id.charCodeAt(p.id.length - 1)) % 7;
                const variance = ((charCodeSum - 3) / 100); 

                const finalIndex = (prod.baseIndex * regCoeff * specFactor * p.factor * (1 + variance)).toFixed(1);
                const estimatedPrice = (prod.basePrice * regCoeff * specFactor * p.factor * (1 + variance)).toFixed(2);

                data.push({
                    city: city,
                    code: prod.code,
                    type: prod.type,
                    typeLabel: prod.typeLabel,
                    group: prod.group,
                    subtopic: prod.subtopic,
                    name: prod.name,
                    periodId: p.id,
                    periodStr: p.name,
                    index: finalIndex,
                    price: estimatedPrice,
                    unit: prod.unit
                });
            });
        });
    });
    return data;
}

const mockDatabase = generateComprehensiveData();

// --- STATE MANAGEMENT ---
let reportItems = [];
let currentMode = 'structured';

// --- UI INITIALIZATION ---
const citySelect = document.getElementById('sel-city');
if (citySelect) {
    citySelect.innerHTML = '<option value="">Tüm İller (81 İl)</option>';
    cities.slice().sort((a, b) => a.localeCompare(b, 'tr')).forEach(city => {
        const opt = document.createElement('option');
        opt.value = city;
        opt.textContent = city;
        citySelect.appendChild(opt);
    });
}

function switchTab(tab) {
    const btnDash = document.getElementById('btn-dashboard');
    const btnRep = document.getElementById('btn-report');
    if (tab === 'dashboard') {
        btnDash.className = "w-full text-left px-4 py-3 rounded-xl bg-blue-600 text-white font-medium transition-all hover:bg-blue-700 flex items-center gap-3 shadow-md ring-1 ring-blue-500";
        btnRep.className = "w-full text-left px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all flex items-center gap-3";
    } else {
        btnRep.className = "w-full text-left px-4 py-3 rounded-xl bg-blue-600 text-white font-medium transition-all hover:bg-blue-700 flex items-center gap-3 shadow-md ring-1 ring-blue-500";
        btnDash.className = "w-full text-left px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all flex items-center gap-3";
    }
    document.getElementById('view-dashboard').classList.add('hidden');
    document.getElementById('view-report').classList.add('hidden');
    document.getElementById(`view-${tab}`).classList.remove('hidden');
    document.getElementById('page-title').innerHTML = tab === 'dashboard'
        ? '<span class="w-1.5 h-6 bg-blue-600 rounded-full"></span> İl Bazlı Tarımsal Girdi ve Faaliyet Çıktısı Analizi'
        : '<span class="w-1.5 h-6 bg-blue-600 rounded-full"></span> Rapor Düzenleme';
}

function setSearchMode(mode) {
    currentMode = mode;
    const btnStruct = document.getElementById('mode-structured');
    const btnFree = document.getElementById('mode-free');
    const formStruct = document.getElementById('form-structured');
    const formFree = document.getElementById('form-free');
    if (mode === 'structured') {
        btnStruct.className = "px-4 py-1.5 rounded-md text-sm font-medium bg-white shadow-sm text-blue-600 transition-all";
        btnFree.className = "px-4 py-1.5 rounded-md text-sm font-medium text-slate-500 hover:text-slate-700 transition-all";
        formStruct.classList.remove('hidden');
        formFree.classList.add('hidden');
    } else {
        btnFree.className = "px-4 py-1.5 rounded-md text-sm font-medium bg-white shadow-sm text-indigo-600 transition-all";
        btnStruct.className = "px-4 py-1.5 rounded-md text-sm font-medium text-slate-500 hover:text-slate-700 transition-all";
        formFree.classList.remove('hidden');
        formFree.classList.add('hidden');
    }
}

// Ana Grup değiştiğinde alt kategorileri dinamik yükleme
const mainGroupSelect = document.getElementById('sel-main-group');
if (mainGroupSelect) {
    mainGroupSelect.addEventListener('change', e => {
        const subSelect = document.getElementById('sel-subtopic');
        const val = e.target.value;
        subSelect.innerHTML = '<option value="">Tüm Alt Kategoriler</option>';
        if (val && inputCategories[val]) {
            subSelect.disabled = false;
            inputCategories[val].forEach(sub => {
                const opt = document.createElement('option');
                opt.value = sub;
                opt.textContent = sub;
                subSelect.appendChild(opt);
            });
        } else {
            subSelect.disabled = true;
            const opt = document.createElement('option');
            opt.textContent = 'Önce ana grup seçiniz';
            subSelect.appendChild(opt);
        }
    });
}

// --- UTILITIES ---
function debounce(fn, delay = 250) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const msgEl = document.getElementById('toast-msg');
    if (toast && msgEl) {
        msgEl.innerText = message;
        toast.classList.remove('translate-y-20', 'opacity-0');
        setTimeout(() => toast.classList.add('translate-y-20', 'opacity-0'), 3000);
    }
}

// --- SEARCH LOGIC (Tüm filtreleri uygulayan ana sorgu) ---
const performSearch = debounce(() => {
    const btn = document.querySelector('#form-structured button');
    let originalText = '';
    if (btn) {
        originalText = btn.innerHTML;
        btn.innerHTML = '<div class="loader"></div>';
        btn.disabled = true;
    }

    const city = document.getElementById('sel-city').value;
    const mainGroup = document.getElementById('sel-main-group').value;
    const subtopic = document.getElementById('sel-subtopic').value;
    const period = document.getElementById('sel-period').value;

    setTimeout(() => {
        let results = mockDatabase;
        
        // 1. İl Filtresi
        if (city) {
            results = results.filter(item => item.city === city);
        }
        // 2. Ana Grup Filtresi
        if (mainGroup) {
            results = results.filter(item => item.group === mainGroup);
        }
        // 3. Alt Kategori Filtresi
        if (subtopic && subtopic !== 'Tüm Alt Kategoriler' && subtopic !== 'Önce ana grup seçiniz') {
            results = results.filter(item => item.subtopic === subtopic);
        }
        // 4. Dönem Filtresi
        if (period) {
            results = results.filter(item => item.periodId === period);
        }

        renderResults(results);

        if (btn) {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }

        const cityLabel = city ? `${city} ili için` : 'Tüm iller genelinde';
        showToast(`${cityLabel} ${results.length} adet veri listelendi.`);
    }, 350);
});

// --- AI / AKILLI ARAMA LOGIC ---
const performAISearch = debounce(() => {
    const promptInput = document.getElementById('ai-prompt');
    const prompt = promptInput ? promptInput.value.trim().toLocaleLowerCase('tr-TR') : '';
    if (!prompt) return showToast('Lütfen aramak istediğiniz il veya ürün/girdi adını yazınız.', 'error');

    const btn = document.querySelector('#form-free button');
    let originalText = '';
    if (btn) {
        originalText = btn.innerHTML;
        btn.innerHTML = '<div class="loader border-indigo-200 border-t-indigo-600"></div> Analiz...';
        btn.disabled = true;
    }

    setTimeout(() => {
        let results = mockDatabase.filter(item =>
            item.name.toLocaleLowerCase('tr-TR').includes(prompt) ||
            item.city.toLocaleLowerCase('tr-TR').includes(prompt) ||
            item.subtopic.toLocaleLowerCase('tr-TR').includes(prompt) ||
            item.typeLabel.toLocaleLowerCase('tr-TR').includes(prompt) ||
            item.group.toLocaleLowerCase('tr-TR').includes(prompt)
        );

        if (results.some(r => r.periodId === '2026-10')) {
            const currentPeriodResults = results.filter(r => r.periodId === '2026-10');
            if (currentPeriodResults.length > 0) {
                results = currentPeriodResults;
            }
        }

        if (results.length > 100) results = results.slice(0, 100);

        renderResults(results);

        if (btn) {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }

        showToast(`AI araması tamamlandı: ${results.length} kayıt eşleşti.`);
        setSearchMode('structured');
    }, 600);
});

// Sonuçları Tabloya Basma
function renderResults(data) {
    const tbody = document.getElementById('results-body');
    const countBadge = document.getElementById('result-count');
    tbody.innerHTML = '';
    countBadge.innerText = `${data.length} kayıt`;

    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="px-6 py-8 text-center text-slate-400 font-medium">Seçtiğiniz kriterlere uygun veri bulunamadı. Lütfen filtreleri kontrol ediniz.</td></tr>`;
        return;
    }

    const fragment = document.createDocumentFragment();

    data.forEach(item => {
        const isCikti = item.type === 'cikti';
        const typeBadge = isCikti
            ? `<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">🌱 Ürün Çıktısı</span>`
            : `<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">🚜 Girdi / Maliyet</span>`;

        const tr = document.createElement('tr');
        tr.className = "bg-white border-b hover:bg-blue-50/50 transition-colors group";
        tr.innerHTML = `
            <td class="px-6 py-4 font-bold text-slate-700">${item.city}</td>
            <td class="px-6 py-4 whitespace-nowrap">${typeBadge}</td>
            <td class="px-6 py-4 font-medium text-slate-800">
                <span class="block">${item.name}</span>
                <span class="text-xs text-slate-400">${item.subtopic}</span>
            </td>
            <td class="px-6 py-4 text-slate-600 font-medium">${item.periodStr}</td>
            <td class="px-6 py-4 text-right font-bold text-slate-700">${item.index}</td>
            <td class="px-6 py-4 text-right font-bold ${isCikti ? 'text-emerald-600' : 'text-blue-600'}">
                ${Number(item.price).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${item.unit}
            </td>
            <td class="px-6 py-4 text-center">
                <button onclick="addToReport('${item.city}', '${item.name}', '${Number(item.price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ${item.unit}', '${item.periodStr}', '${item.typeLabel}')"
                    class="opacity-0 group-hover:opacity-100 text-blue-600 hover:text-blue-800 font-medium text-xs border border-blue-200 bg-blue-50 px-3 py-1.5 rounded hover:bg-blue-100 transition-all shadow-sm focus:opacity-100"
                    aria-label="${item.name} verisini rapora ekle">
                    + Rapora Ekle
                </button>
            </td>
        `;
        fragment.appendChild(tr);
    });

    tbody.appendChild(fragment);
}

// Excel Dışa Aktarma
function exportToExcel() {
    /* global XLSX */
    if (typeof XLSX === 'undefined') {
        return showToast('Excel kütüphanesi yüklenemedi.', 'error');
    }
    const rows = [];
    const headers = ['İl', 'Tür', 'Ürün / Girdi Kalemi', 'Alt Kategori', 'Dönem', 'Endeks (2021=100)', 'Tahmini Birim Fiyat'];
    rows.push(headers);

    const tbody = document.getElementById('results-body');
    tbody.querySelectorAll('tr').forEach(tr => {
        const cells = tr.querySelectorAll('td');
        if (cells.length < 7) return;
        const namePart = cells[2].innerText.split('\n');
        rows.push([
            cells[0].innerText.trim(),
            cells[1].innerText.trim(),
            namePart[0] ? namePart[0].trim() : '',
            namePart[1] ? namePart[1].trim() : '',
            cells[3].innerText.trim(),
            cells[4].innerText.trim(),
            cells[5].innerText.trim()
        ]);
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, 'TÜİK Tarım Analizi');
    XLSX.writeFile(wb, 'tuik_tarim_ve_girdi_fiyatlari.xlsx');
    showToast('Excel dosyası başarıyla indirildi.');
}

// --- REPORT LOGIC ---
function addToReport(city, title, value, period, typeLabel = 'Tarımsal Veri') {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    reportItems.push({ id, city, title, value, period, typeLabel, date: new Date().toLocaleDateString('tr-TR') });
    updateReportBadge();
    renderReport();
    showToast('Seçilen kalem bilirkişi raporuna eklendi.');
}

function removeFromReport(id) {
    reportItems = reportItems.filter(item => item.id !== id);
    updateReportBadge();
    renderReport();
}

function clearReport() {
    if (reportItems.length > 0 && confirm('Tüm rapor içeriğini silmek istediğinize emin misiniz?')) {
        reportItems = [];
        updateReportBadge();
        renderReport();
        showToast('Rapor taslağı temizlendi.');
    }
}

function updateReportBadge() {
    const badge = document.getElementById('report-badge');
    if (reportItems.length > 0) {
        badge.innerText = reportItems.length;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
}

function renderReport() {
    const container = document.getElementById('report-content');
    const emptyState = document.getElementById('empty-state');
    if (reportItems.length === 0) {
        container.innerHTML = '';
        container.appendChild(emptyState);
        emptyState.style.display = 'block';
        return;
    }
    emptyState.style.display = 'none';
    container.innerHTML = '';
    reportItems.forEach((item, idx) => {
        const isCikti = item.typeLabel === 'Ürün Çıktısı';
        const div = document.createElement('div');
        div.className = "bg-slate-50 border border-slate-200 rounded-lg p-6 relative group hover:border-blue-300 transition-colors shadow-sm break-inside-avoid";
        div.innerHTML = `
            <div class="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity no-print">
                <button onclick="removeFromReport(${item.id})" class="text-red-400 hover:text-red-600 p-2 bg-white rounded-full shadow-sm border border-slate-100" aria-label="Rapor öğesini kaldır">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
            </div>
            <div class="flex items-start gap-4">
                <div class="w-10 h-10 rounded-full ${isCikti ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'} flex items-center justify-center font-bold text-sm shrink-0">${idx + 1}</div>
                <div class="flex-1">
                    <div class="flex justify-between items-center mb-2">
                        <div>
                            <span class="text-xs font-semibold px-2 py-0.5 rounded ${isCikti ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'} mr-2">${item.typeLabel}</span>
                            <h4 class="text-lg font-bold text-slate-800 inline">${item.title}</h4>
                        </div>
                        <span class="text-xs font-bold bg-slate-200 px-2 py-1 rounded text-slate-600">${item.city}</span>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                        <div class="bg-white p-3 rounded border border-slate-100">
                            <span class="text-xs text-slate-400 uppercase tracking-wide block mb-1">Dönem</span>
                            <p class="font-medium text-slate-700">${item.period}</p>
                        </div>
                        <div class="bg-white p-3 rounded border border-slate-100">
                            <span class="text-xs text-slate-400 uppercase tracking-wide block mb-1">Tahmini Birim Fiyat</span>
                            <p class="font-bold ${isCikti ? 'text-emerald-700' : 'text-blue-700'} text-xl">${item.value}</p>
                        </div>
                    </div>
                    <div class="mt-4 pt-3 border-t border-slate-200 text-xs text-slate-400 italic flex justify-between items-center">
                        <span>Kaynak: TÜİK ÇEGF / Tarım-ÜFE & TGFE Uyarlaması</span>
                        <span>Erişim: ${item.date}</span>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(div);
    });
}

function printReport() {
    if (window.jspdf && window.jspdf.jsPDF) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'pt', 'a4');
        const reportEl = document.getElementById('view-report');
        doc.html(reportEl, {
            callback: function (doc) {
                doc.save('bilirkisi_tarim_girdi_ve_cikti_raporu.pdf');
            },
            margin: [20, 20, 20, 20],
            autoPaging: true,
            x: 0,
            y: 0,
            width: 595
        });
    } else {
        window.print();
    }
}

// Başlangıçta tüm illeri listele
document.addEventListener('DOMContentLoaded', () => {
    performSearch();
});
