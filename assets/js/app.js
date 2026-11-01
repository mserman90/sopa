// app.js – TÜİK Tarımsal Girdi ve Faaliyet Çıktısı Analizi (Çift Pencereli Mimari)
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

// --- TÜM ÇIKTILAR VE GİRDİLER TANIM HAVUZU ---
const productDefinitions = [
    // ==========================================
    // 1. FAALİYET ÇIKTISI: TAHILLAR VE BAKLAGİLLER
    // ==========================================
    { code: 'URUN-T01', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_tahil', groupName: 'Tahıllar & Baklagiller', subtopic: 'Tahıllar', name: 'Ekmeklik Buğday (Anadolu Kırmızı Sert)', basePrice: 11.60, unit: 'TL/Kg', baseIndex: 148.2 },
    { code: 'URUN-T02', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_tahil', groupName: 'Tahıllar & Baklagiller', subtopic: 'Tahıllar', name: 'Makarnalık (Durum) Buğday', basePrice: 12.40, unit: 'TL/Kg', baseIndex: 152.0 },
    { code: 'URUN-T03', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_tahil', groupName: 'Tahıllar & Baklagiller', subtopic: 'Tahıllar', name: 'Yemlik Arpa', basePrice: 9.50, unit: 'TL/Kg', baseIndex: 144.5 },
    { code: 'URUN-T04', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_tahil', groupName: 'Tahıllar & Baklagiller', subtopic: 'Tahıllar', name: 'Tane Mısır (1. Ürün)', basePrice: 9.20, unit: 'TL/Kg', baseIndex: 146.0 },
    { code: 'URUN-T05', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_tahil', groupName: 'Tahıllar & Baklagiller', subtopic: 'Tahıllar', name: 'Çeltik (Baldo)', basePrice: 28.00, unit: 'TL/Kg', baseIndex: 162.0 },
    { code: 'URUN-T06', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_tahil', groupName: 'Tahıllar & Baklagiller', subtopic: 'Tahıllar', name: 'Çeltik (Osmancık)', basePrice: 24.00, unit: 'TL/Kg', baseIndex: 158.5 },
    { code: 'URUN-T07', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_tahil', groupName: 'Tahıllar & Baklagiller', subtopic: 'Tahıllar', name: 'Yulaf', basePrice: 9.80, unit: 'TL/Kg', baseIndex: 143.0 },
    { code: 'URUN-T08', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_tahil', groupName: 'Tahıllar & Baklagiller', subtopic: 'Tahıllar', name: 'Çavdar', basePrice: 8.90, unit: 'TL/Kg', baseIndex: 140.0 },
    { code: 'URUN-B01', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_tahil', groupName: 'Tahıllar & Baklagiller', subtopic: 'Baklagiller', name: 'Kırmızı Mercimek (Kabuklu/Ham)', basePrice: 27.50, unit: 'TL/Kg', baseIndex: 165.0 },
    { code: 'URUN-B02', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_tahil', groupName: 'Tahıllar & Baklagiller', subtopic: 'Baklagiller', name: 'Yeşil Mercimek', basePrice: 32.00, unit: 'TL/Kg', baseIndex: 160.0 },
    { code: 'URUN-B03', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_tahil', groupName: 'Tahıllar & Baklagiller', subtopic: 'Baklagiller', name: 'Nohut (Koçbaşı 8-9mm)', basePrice: 38.00, unit: 'TL/Kg', baseIndex: 155.0 },
    { code: 'URUN-B04', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_tahil', groupName: 'Tahıllar & Baklagiller', subtopic: 'Baklagiller', name: 'Kuru Fasulye (Dermason)', basePrice: 52.00, unit: 'TL/Kg', baseIndex: 168.0 },

    // ==========================================
    // 2. FAALİYET ÇIKTISI: ENDÜSTRİ BİTKİLERİ VE YAĞLI TOHUMLAR
    // ==========================================
    { code: 'URUN-E01', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_endustri', groupName: 'Endüstri Bitkileri', subtopic: 'Endüstri Bitkileri', name: 'Kütlü Pamuk (Standart 1 Beyaz)', basePrice: 28.50, unit: 'TL/Kg', baseIndex: 154.0 },
    { code: 'URUN-E02', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_endustri', groupName: 'Endüstri Bitkileri', subtopic: 'Yağlı Tohumlar', name: 'Yağlık Ayçiçeği (%44 Yağ Oranlı)', basePrice: 21.80, unit: 'TL/Kg', baseIndex: 151.2 },
    { code: 'URUN-E03', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_endustri', groupName: 'Endüstri Bitkileri', subtopic: 'Endüstri Bitkileri', name: 'Şeker Pancarı (%16 Polar Şeker)', basePrice: 2.45, unit: 'TL/Kg', baseIndex: 147.0 },
    { code: 'URUN-E04', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_endustri', groupName: 'Endüstri Bitkileri', subtopic: 'Endüstri Bitkileri', name: 'Yaş Çay Yaprağı (Çiftçi Eline Geçen)', basePrice: 21.00, unit: 'TL/Kg', baseIndex: 159.0 },
    { code: 'URUN-E05', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_endustri', groupName: 'Endüstri Bitkileri', subtopic: 'Yağlı Tohumlar', name: 'Soya Fasulyesi', basePrice: 20.50, unit: 'TL/Kg', baseIndex: 149.0 },
    { code: 'URUN-E06', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_endustri', groupName: 'Endüstri Bitkileri', subtopic: 'Yağlı Tohumlar', name: 'Kanola (Kolza)', basePrice: 19.00, unit: 'TL/Kg', baseIndex: 146.0 },
    { code: 'URUN-E07', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_endustri', groupName: 'Endüstri Bitkileri', subtopic: 'Endüstri Bitkileri', name: 'Tütün (Ege / Şark Tipi)', basePrice: 175.00, unit: 'TL/Kg', baseIndex: 164.0 },
    { code: 'URUN-E08', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_endustri', groupName: 'Endüstri Bitkileri', subtopic: 'Endüstri Bitkileri', name: 'Haşhaş Tohumu ve Kapsülü', basePrice: 65.00, unit: 'TL/Kg', baseIndex: 153.0 },

    // ==========================================
    // 3. FAALİYET ÇIKTISI: SEBZELER VE SERA ÜRÜNLERİ
    // ==========================================
    { code: 'URUN-S01', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_sebze', groupName: 'Sebzeler & Sera', subtopic: 'Tarla Sebzeleri', name: 'Sofralık Tarla Domatesi', basePrice: 16.50, unit: 'TL/Kg', baseIndex: 149.0 },
    { code: 'URUN-S02', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_sebze', groupName: 'Sebzeler & Sera', subtopic: 'Sera Ürünleri', name: 'Örtüaltı / Sera Domatesi', basePrice: 24.00, unit: 'TL/Kg', baseIndex: 158.0 },
    { code: 'URUN-S03', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_sebze', groupName: 'Sebzeler & Sera', subtopic: 'Tarla Sebzeleri', name: 'Sanayi Tipi Salçalık Domates', basePrice: 3.90, unit: 'TL/Kg', baseIndex: 142.0 },
    { code: 'URUN-S04', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_sebze', groupName: 'Sebzeler & Sera', subtopic: 'Tarla Sebzeleri', name: 'Sivri Biber', basePrice: 26.00, unit: 'TL/Kg', baseIndex: 155.0 },
    { code: 'URUN-S05', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_sebze', groupName: 'Sebzeler & Sera', subtopic: 'Tarla Sebzeleri', name: 'Kapya Kırmızı Biber', basePrice: 24.00, unit: 'TL/Kg', baseIndex: 152.0 },
    { code: 'URUN-S06', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_sebze', groupName: 'Sebzeler & Sera', subtopic: 'Tarla Sebzeleri', name: 'Kuru Soğan (Yemeklik)', basePrice: 13.50, unit: 'TL/Kg', baseIndex: 145.0 },
    { code: 'URUN-S07', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_sebze', groupName: 'Sebzeler & Sera', subtopic: 'Tarla Sebzeleri', name: 'Patates (Yemeklik 1. Kalite)', basePrice: 14.00, unit: 'TL/Kg', baseIndex: 144.0 },
    { code: 'URUN-S08', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_sebze', groupName: 'Sebzeler & Sera', subtopic: 'Tarla Sebzeleri', name: 'Karpuz (Tarla Üretici)', basePrice: 6.80, unit: 'TL/Kg', baseIndex: 138.0 },
    { code: 'URUN-S09', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_sebze', groupName: 'Sebzeler & Sera', subtopic: 'Tarla Sebzeleri', name: 'Kavun (Kırkağaç vb.)', basePrice: 11.50, unit: 'TL/Kg', baseIndex: 141.0 },
    { code: 'URUN-S10', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_sebze', groupName: 'Sebzeler & Sera', subtopic: 'Sera Ürünleri', name: 'Sera Hıyar / Salatalık', basePrice: 18.00, unit: 'TL/Kg', baseIndex: 150.0 },
    { code: 'URUN-S11', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_sebze', groupName: 'Sebzeler & Sera', subtopic: 'Tarla Sebzeleri', name: 'Patlıcan (Tarla/Sera)', basePrice: 19.50, unit: 'TL/Kg', baseIndex: 148.0 },
    { code: 'URUN-S12', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_sebze', groupName: 'Sebzeler & Sera', subtopic: 'Tarla Sebzeleri', name: 'Taze Fasulye', basePrice: 38.00, unit: 'TL/Kg', baseIndex: 156.0 },

    // ==========================================
    // 4. FAALİYET ÇIKTISI: MEYVELER VE SERT KABUKLULAR
    // ==========================================
    { code: 'URUN-M01', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_meyve', groupName: 'Meyveler & Sert Kabuklular', subtopic: 'Sert Kabuklular', name: 'Kabuklu Tombul Fındık (%50 Randıman)', basePrice: 140.00, unit: 'TL/Kg', baseIndex: 168.0 },
    { code: 'URUN-M02', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_meyve', groupName: 'Meyveler & Sert Kabuklular', subtopic: 'Zeytin ve Zeytinyağı', name: 'Yağlık Zeytin (Fabrika Teslim)', basePrice: 36.00, unit: 'TL/Kg', baseIndex: 162.0 },
    { code: 'URUN-M03', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_meyve', groupName: 'Meyveler & Sert Kabuklular', subtopic: 'Zeytin ve Zeytinyağı', name: 'Sofralık Siyah Zeytin (Gemlik Tipi)', basePrice: 78.00, unit: 'TL/Kg', baseIndex: 165.0 },
    { code: 'URUN-M04', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_meyve', groupName: 'Meyveler & Sert Kabuklular', subtopic: 'Sert Kabuklular', name: 'Antep Fıstığı (Kırmızı Kabuklu)', basePrice: 390.00, unit: 'TL/Kg', baseIndex: 175.0 },
    { code: 'URUN-M05', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_meyve', groupName: 'Meyveler & Sert Kabuklular', subtopic: 'Kuru Meyveler', name: 'Kuru Kayısı (Malatya Günkurusu)', basePrice: 250.00, unit: 'TL/Kg', baseIndex: 170.0 },
    { code: 'URUN-M06', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_meyve', groupName: 'Meyveler & Sert Kabuklular', subtopic: 'Kuru Meyveler', name: 'Kuru İncir (Aydın Dağ İnciri)', basePrice: 280.00, unit: 'TL/Kg', baseIndex: 174.0 },
    { code: 'URUN-M07', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_meyve', groupName: 'Meyveler & Sert Kabuklular', subtopic: 'Kuru Meyveler', name: 'Çekirdeksiz Kuru Üzüm (Sultani No:9)', basePrice: 110.00, unit: 'TL/Kg', baseIndex: 160.0 },
    { code: 'URUN-M08', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_meyve', groupName: 'Meyveler & Sert Kabuklular', subtopic: 'Taze Meyveler', name: 'Sofralık Elma (Starking/Golden)', basePrice: 23.00, unit: 'TL/Kg', baseIndex: 151.0 },
    { code: 'URUN-M09', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_meyve', groupName: 'Meyveler & Sert Kabuklular', subtopic: 'Narenciye', name: 'Portakal (Washington Navel)', basePrice: 15.50, unit: 'TL/Kg', baseIndex: 145.0 },
    { code: 'URUN-M10', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_meyve', groupName: 'Meyveler & Sert Kabuklular', subtopic: 'Narenciye', name: 'Limon (Enterdonat / Mayer)', basePrice: 18.00, unit: 'TL/Kg', baseIndex: 147.0 },
    { code: 'URUN-M11', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_meyve', groupName: 'Meyveler & Sert Kabuklular', subtopic: 'Narenciye', name: 'Mandalina (Satsuma)', basePrice: 16.00, unit: 'TL/Kg', baseIndex: 146.0 },
    { code: 'URUN-M12', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_meyve', groupName: 'Meyveler & Sert Kabuklular', subtopic: 'Taze Meyveler', name: 'Kiraz (0900 Ziraat İhracatlık)', basePrice: 75.00, unit: 'TL/Kg', baseIndex: 164.0 },
    { code: 'URUN-M13', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_meyve', groupName: 'Meyveler & Sert Kabuklular', subtopic: 'Sert Kabuklular', name: 'Kabuklu Ceviz (Yerli Çetnır vb.)', basePrice: 160.00, unit: 'TL/Kg', baseIndex: 158.0 },
    { code: 'URUN-M14', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_meyve', groupName: 'Meyveler & Sert Kabuklular', subtopic: 'Sert Kabuklular', name: 'Kabuklu Badem (Ferragnes vb.)', basePrice: 145.00, unit: 'TL/Kg', baseIndex: 156.0 },

    // ==========================================
    // 5. FAALİYET ÇIKTISI: CANLI HAYVAN VE KARKAS ET
    // ==========================================
    { code: 'URUN-H01', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_hayvancilik', groupName: 'Canlı Hayvan & Et', subtopic: 'Karkas Et', name: 'Dana Karkas Et (Yağsız / Randımanlı)', basePrice: 390.00, unit: 'TL/Kg', baseIndex: 172.0 },
    { code: 'URUN-H02', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_hayvancilik', groupName: 'Canlı Hayvan & Et', subtopic: 'Karkas Et', name: 'Kuzu Karkas Et (Kıvırcık/Karaman)', basePrice: 445.00, unit: 'TL/Kg', baseIndex: 176.0 },
    { code: 'URUN-H03', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_hayvancilik', groupName: 'Canlı Hayvan & Et', subtopic: 'Canlı Hayvan', name: 'Canlı Besi Danası (Baskül Ağırlık)', basePrice: 225.00, unit: 'TL/Kg', baseIndex: 168.0 },
    { code: 'URUN-H04', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_hayvancilik', groupName: 'Canlı Hayvan & Et', subtopic: 'Canlı Hayvan', name: 'Canlı Kasaplık Kuzu / Toklu', basePrice: 240.00, unit: 'TL/Kg', baseIndex: 170.0 },
    { code: 'URUN-H05', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_hayvancilik', groupName: 'Canlı Hayvan & Et', subtopic: 'Damızlık Hayvan', name: 'Canlı Damızlık Gebe Düve', basePrice: 95000.00, unit: 'TL/Baş', baseIndex: 165.0 },
    { code: 'URUN-H06', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_hayvancilik', groupName: 'Canlı Hayvan & Et', subtopic: 'Damızlık Hayvan', name: 'Canlı Damızlık Koyun / Keçi', basePrice: 11500.00, unit: 'TL/Baş', baseIndex: 162.0 },
    { code: 'URUN-H07', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_hayvancilik', groupName: 'Canlı Hayvan & Et', subtopic: 'Kanatlı Hayvan', name: 'Etlik Piliç / Broiler (Canlı Satış)', basePrice: 46.00, unit: 'TL/Kg', baseIndex: 154.0 },

    // ==========================================
    // 6. FAALİYET ÇIKTISI: SÜT, YUMURTA VE ARICILIK
    // ==========================================
    { code: 'URUN-SUT01', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_sut_kumes', groupName: 'Süt, Yumurta & Bal', subtopic: 'Çiğ Süt', name: 'Soğutulmuş Çiğ İnek Sütü (%3.6 Yağ)', basePrice: 17.00, unit: 'TL/Lt', baseIndex: 158.0 },
    { code: 'URUN-SUT02', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_sut_kumes', groupName: 'Süt, Yumurta & Bal', subtopic: 'Çiğ Süt', name: 'Çiğ Koyun Sütü', basePrice: 34.00, unit: 'TL/Lt', baseIndex: 164.0 },
    { code: 'URUN-SUT03', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_sut_kumes', groupName: 'Süt, Yumurta & Bal', subtopic: 'Çiğ Süt', name: 'Çiğ Keçi Sütü', basePrice: 29.50, unit: 'TL/Lt', baseIndex: 162.0 },
    { code: 'URUN-KUM01', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_sut_kumes', groupName: 'Süt, Yumurta & Bal', subtopic: 'Yumurta', name: 'Sofralık Yumurta (M-L Boy 30\'lu Koli)', basePrice: 138.00, unit: 'TL/Koli', baseIndex: 152.0 },
    { code: 'URUN-ARI01', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_sut_kumes', groupName: 'Süt, Yumurta & Bal', subtopic: 'Arıcılık Ürünleri', name: 'Doğal Süzme Çiçek Balı (Üretici Toptan)', basePrice: 290.00, unit: 'TL/Kg', baseIndex: 166.0 },
    { code: 'URUN-ARI02', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_sut_kumes', groupName: 'Süt, Yumurta & Bal', subtopic: 'Arıcılık Ürünleri', name: 'Çam Balı (Muğla Yöresi)', basePrice: 310.00, unit: 'TL/Kg', baseIndex: 168.0 },
    { code: 'URUN-ARI03', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_sut_kumes', groupName: 'Süt, Yumurta & Bal', subtopic: 'Arıcılık Ürünleri', name: 'Karakovan Petek Balı', basePrice: 420.00, unit: 'TL/Kg', baseIndex: 172.0 },
    { code: 'URUN-ARI04', type: 'cikti', typeLabel: 'Ürün Çıktısı', group: 'cikti_sut_kumes', groupName: 'Süt, Yumurta & Bal', subtopic: 'Arıcılık Ürünleri', name: 'Doğal Arı Balmumu', basePrice: 260.00, unit: 'TL/Kg', baseIndex: 155.0 },

    // ==========================================
    // 7. TARIMSAL GİRDİLER: GÜBRE VE TOPRAK İYİLEŞTİRİCİLER (TGFE)
    // ==========================================
    { code: 'TGFE-G01', type: 'girdi', typeLabel: 'Girdi / Maliyet', group: 'gubre', groupName: 'Gübre & İyileştiriciler', subtopic: 'Azotlu Gübreler', name: 'Üre Gübresi (%46 N)', basePrice: 14800.00, unit: 'TL/Ton', baseIndex: 142.5 },
    { code: 'TGFE-G02', type: 'girdi', typeLabel: 'Girdi / Maliyet', group: 'gubre', groupName: 'Gübre & İyileştiriciler', subtopic: 'Azotlu Gübreler', name: 'Amonyum Sülfat (%21 N)', basePrice: 8900.00, unit: 'TL/Ton', baseIndex: 138.2 },
    { code: 'TGFE-G03', type: 'girdi', typeLabel: 'Girdi / Maliyet', group: 'gubre', groupName: 'Gübre & İyileştiriciler', subtopic: 'Fosfatlı Gübreler', name: 'DAP Gübresi (18-46-0)', basePrice: 21500.00, unit: 'TL/Ton', baseIndex: 149.0 },
    { code: 'TGFE-G04', type: 'girdi', typeLabel: 'Girdi / Maliyet', group: 'gubre', groupName: 'Gübre & İyileştiriciler', subtopic: 'Fosfatlı Gübreler', name: 'Kompoze Gübre (15-15-15)', basePrice: 16200.00, unit: 'TL/Ton', baseIndex: 144.1 },
    { code: 'TGFE-G05', type: 'girdi', typeLabel: 'Girdi / Maliyet', group: 'gubre', groupName: 'Gübre & İyileştiriciler', subtopic: 'Potasyumlu Gübreler', name: 'Potasyum Sülfat Gübresi', basePrice: 26000.00, unit: 'TL/Ton', baseIndex: 151.4 },
    { code: 'TGFE-G06', type: 'girdi', typeLabel: 'Girdi / Maliyet', group: 'gubre', groupName: 'Gübre & İyileştiriciler', subtopic: 'Kompostlar', name: 'Organik Katı Çiftlik Gübresi / Kompost', basePrice: 1250.00, unit: 'TL/Ton', baseIndex: 130.0 },

    // ==========================================
    // 8. TARIMSAL GİRDİLER: HAYVAN YEMİ (TGFE)
    // ==========================================
    { code: 'TGFE-Y01', type: 'girdi', typeLabel: 'Girdi / Maliyet', group: 'yem', groupName: 'Hayvan Yemi', subtopic: 'Büyükbaş Yemleri', name: 'Büyükbaş Besi Yemi (%14 HP)', basePrice: 9.20, unit: 'TL/Kg', baseIndex: 136.4 },
    { code: 'TGFE-Y02', type: 'girdi', typeLabel: 'Girdi / Maliyet', group: 'yem', groupName: 'Hayvan Yemi', subtopic: 'Büyükbaş Yemleri', name: 'Büyükbaş Süt Yemi (%19 HP)', basePrice: 10.40, unit: 'TL/Kg', baseIndex: 139.1 },
    { code: 'TGFE-Y03', type: 'girdi', typeLabel: 'Girdi / Maliyet', group: 'yem', groupName: 'Hayvan Yemi', subtopic: 'Küçükbaş Yemleri', name: 'Koyun-Kuzu Büyütme Yemi', basePrice: 9.80, unit: 'TL/Kg', baseIndex: 137.0 },
    { code: 'TGFE-Y04', type: 'girdi', typeLabel: 'Girdi / Maliyet', group: 'yem', groupName: 'Hayvan Yemi', subtopic: 'Kümes Hayvanı Yemleri', name: 'Yumurtacı Tavuk Yemi', basePrice: 12.50, unit: 'TL/Kg', baseIndex: 141.2 },
    { code: 'TGFE-Y05', type: 'girdi', typeLabel: 'Girdi / Maliyet', group: 'yem', groupName: 'Hayvan Yemi', subtopic: 'Silajlık Bitkiler', name: 'Mısır Silajı (Paketli)', basePrice: 2.80, unit: 'TL/Kg', baseIndex: 129.5 },
    { code: 'TGFE-Y06', type: 'girdi', typeLabel: 'Girdi / Maliyet', group: 'yem', groupName: 'Hayvan Yemi', subtopic: 'Silajlık Bitkiler', name: 'Yonca Kuru Otu (Balya)', basePrice: 6.50, unit: 'TL/Kg', baseIndex: 133.0 },

    // ==========================================
    // 9. TARIMSAL GİRDİLER: TOHUM VE FİDE (TGFE)
    // ==========================================
    { code: 'TGFE-T01', type: 'girdi', typeLabel: 'Girdi / Maliyet', group: 'tohum', groupName: 'Tohum & Fide', subtopic: 'Tahıl Tohumları', name: 'Sertifikalı Ekmeklik Buğday Tohumu', basePrice: 18.50, unit: 'TL/Kg', baseIndex: 132.8 },
    { code: 'TGFE-T02', type: 'girdi', typeLabel: 'Girdi / Maliyet', group: 'tohum', groupName: 'Tohum & Fide', subtopic: 'Tahıl Tohumları', name: 'Sertifikalı Arpa Tohumu', basePrice: 15.20, unit: 'TL/Kg', baseIndex: 130.4 },
    { code: 'TGFE-T03', type: 'girdi', typeLabel: 'Girdi / Maliyet', group: 'tohum', groupName: 'Tohum & Fide', subtopic: 'Endüstri Bitkileri Tohumları', name: 'Hibrit Mısır Tohumu (50.000 adet)', basePrice: 3450.00, unit: 'TL/Paket', baseIndex: 145.2 },
    { code: 'TGFE-T04', type: 'girdi', typeLabel: 'Girdi / Maliyet', group: 'tohum', groupName: 'Tohum & Fide', subtopic: 'Endüstri Bitkileri Tohumları', name: 'Yağlık Ayçiçeği Tohumu (150.000 adet)', basePrice: 4200.00, unit: 'TL/Paket', baseIndex: 143.0 },
    { code: 'TGFE-T05', type: 'girdi', typeLabel: 'Girdi / Maliyet', group: 'tohum', groupName: 'Tohum & Fide', subtopic: 'Sebze Fideleri', name: 'Aşılı Domates Fidesi', basePrice: 14.50, unit: 'TL/Adet', baseIndex: 148.6 },
    { code: 'TGFE-T06', type: 'girdi', typeLabel: 'Girdi / Maliyet', group: 'tohum', groupName: 'Tohum & Fide', subtopic: 'Meyve Fidanları', name: 'Sertifikalı Zeytin/Meyve Fidanı (Tüplü)', basePrice: 120.00, unit: 'TL/Adet', baseIndex: 138.0 },

    // ==========================================
    // 10. TARIMSAL GİRDİLER: ENERJİ VE YAKITLAR (TGFE)
    // ==========================================
    { code: 'TGFE-E01', type: 'girdi', typeLabel: 'Girdi / Maliyet', group: 'enerji', groupName: 'Enerji & Akaryakıt', subtopic: 'Motorin', name: 'Kırsal Motorin (Tarımsal Akaryakıt)', basePrice: 44.80, unit: 'TL/Lt', baseIndex: 154.2 },
    { code: 'TGFE-E02', type: 'girdi', typeLabel: 'Girdi / Maliyet', group: 'enerji', groupName: 'Enerji & Akaryakıt', subtopic: 'Benzin', name: 'Kurşunsuz Benzin 95 Oktan', basePrice: 45.20, unit: 'TL/Lt', baseIndex: 152.0 },
    { code: 'TGFE-E03', type: 'girdi', typeLabel: 'Girdi / Maliyet', group: 'enerji', groupName: 'Enerji & Akaryakıt', subtopic: 'Elektrik', name: 'Tarımsal Sulama Elektrik Tarifesi', basePrice: 3.10, unit: 'TL/kWh', baseIndex: 146.5 },
    { code: 'TGFE-E04', type: 'girdi', typeLabel: 'Girdi / Maliyet', group: 'enerji', groupName: 'Enerji & Akaryakıt', subtopic: 'LPG', name: 'Otogaz / Tarımsal LPG', basePrice: 25.40, unit: 'TL/Lt', baseIndex: 140.8 },
    { code: 'TGFE-E05', type: 'girdi', typeLabel: 'Girdi / Maliyet', group: 'enerji', groupName: 'Enerji & Akaryakıt', subtopic: 'Fuel-Oil', name: 'Kalorifer Yakıtı / Fuel-Oil', basePrice: 32.50, unit: 'TL/Kg', baseIndex: 139.0 },

    // ==========================================
    // 11. TARIMSAL GİRDİLER: TARIM İLAÇLARI (TGFE)
    // ==========================================
    { code: 'TGFE-I01', type: 'girdi', typeLabel: 'Girdi / Maliyet', group: 'ilac', groupName: 'Tarım İlaçları', subtopic: 'Herbisitler (Yabancı Ot)', name: 'Geniş Yapraklı Yabancı Ot İlacı (Herbisit)', basePrice: 650.00, unit: 'TL/Lt', baseIndex: 144.0 },
    { code: 'TGFE-I02', type: 'girdi', typeLabel: 'Girdi / Maliyet', group: 'ilac', groupName: 'Tarım İlaçları', subtopic: 'İnsektisitler (Böcek)', name: 'Zararlı Böcek İlacı (İnsektisit)', basePrice: 850.00, unit: 'TL/Lt', baseIndex: 146.5 },
    { code: 'TGFE-I03', type: 'girdi', typeLabel: 'Girdi / Maliyet', group: 'ilac', groupName: 'Tarım İlaçları', subtopic: 'Fungusitler (Mantar)', name: 'Külleme ve Pas İlacı (Fungusit)', basePrice: 920.00, unit: 'TL/Lt', baseIndex: 147.2 },

    // ==========================================
    // 12. TARIMSAL GİRDİLER: TARIM MAKİNE VE TEÇHİZATI (TGFE)
    // ==========================================
    { code: 'TGFE-M01', type: 'girdi', typeLabel: 'Girdi / Maliyet', group: 'makine', groupName: 'Makine & Ekipman', subtopic: 'Traktörler', name: '75-90 BG Çift Çeker Traktör Endeksi', basePrice: 1750000.00, unit: 'TL', baseIndex: 158.0 },
    { code: 'TGFE-M02', type: 'girdi', typeLabel: 'Girdi / Maliyet', group: 'makine', groupName: 'Makine & Ekipman', subtopic: 'Pulluklar', name: '4 Soklu Döner Kulaklı Pulluk', basePrice: 185000.00, unit: 'TL', baseIndex: 143.5 },
    { code: 'TGFE-M03', type: 'girdi', typeLabel: 'Girdi / Maliyet', group: 'makine', groupName: 'Makine & Ekipman', subtopic: 'Mibzerler', name: 'Pnömatik Hassas Ekim Mibzeri', basePrice: 320000.00, unit: 'TL', baseIndex: 147.0 },
    { code: 'TGFE-M04', type: 'girdi', typeLabel: 'Girdi / Maliyet', group: 'makine', groupName: 'Makine & Ekipman', subtopic: 'Hasat Makineleri', name: 'Biçerdöver ve Balya Makinesi Endeksi', basePrice: 4200000.00, unit: 'TL', baseIndex: 162.0 },
    { code: 'TGFE-M05', type: 'girdi', typeLabel: 'Girdi / Maliyet', group: 'makine', groupName: 'Makine & Ekipman', subtopic: 'Sulama Sistemleri', name: 'Damla Sulama Borusu (100m kangal)', basePrice: 1650.00, unit: 'TL/Rulo', baseIndex: 139.4 },

    // ==========================================
    // 13. TARIMSAL GİRDİLER: HİZMETLER (İŞÇİLİK, KİRA, NAKLİYE)
    // ==========================================
    { code: 'TGFE-H01', type: 'girdi', typeLabel: 'Girdi / Maliyet', group: 'hizmet', groupName: 'Hizmetler & İşçilik', subtopic: 'İşçilik Ücretleri', name: 'Tarımsal Vasıfsız İşçi (Günlük Yevmiye)', basePrice: 850.00, unit: 'TL/Gün', baseIndex: 152.0 },
    { code: 'TGFE-H02', type: 'girdi', typeLabel: 'Girdi / Maliyet', group: 'hizmet', groupName: 'Hizmetler & İşçilik', subtopic: 'İşçilik Ücretleri', name: 'Traktör Operatörü / Usta İşçilik', basePrice: 1400.00, unit: 'TL/Gün', baseIndex: 155.0 },
    { code: 'TGFE-H03', type: 'girdi', typeLabel: 'Girdi / Maliyet', group: 'hizmet', groupName: 'Hizmetler & İşçilik', subtopic: 'Tamirat-Bakım', name: 'Traktör ve Makine Periyodik Bakım-Onarım', basePrice: 4500.00, unit: 'TL/İşlem', baseIndex: 148.0 },
    { code: 'TGFE-H04', type: 'girdi', typeLabel: 'Girdi / Maliyet', group: 'hizmet', groupName: 'Hizmetler & İşçilik', subtopic: 'Ulaşım-Nakliye', name: 'Ürün Nakliyesi (İl İçi Ortalama Sefer)', basePrice: 3800.00, unit: 'TL/Sefer', baseIndex: 150.5 },
    { code: 'TGFE-H05', type: 'girdi', typeLabel: 'Girdi / Maliyet', group: 'hizmet', groupName: 'Hizmetler & İşçilik', subtopic: 'Arazi Kiraları', name: 'Sulu Tarım Arazisi Kirası (Yıllık Dekar)', basePrice: 2200.00, unit: 'TL/Dekar/Yıl', baseIndex: 140.0 },
    { code: 'TGFE-H06', type: 'girdi', typeLabel: 'Girdi / Maliyet', group: 'hizmet', groupName: 'Hizmetler & İşçilik', subtopic: 'Sigorta Primleri', name: 'TARSİM Tarım Sigorta Poliçe Ortalaması', basePrice: 1250.00, unit: 'TL/Poliçe', baseIndex: 137.5 }
];

// Dinamik Alt Kategori Haritaları
const outputsCategories = {};
const inputsCategories = {};

productDefinitions.forEach(p => {
    if (p.type === 'cikti') {
        if (!outputsCategories[p.group]) outputsCategories[p.group] = [];
        if (!outputsCategories[p.group].includes(p.subtopic)) outputsCategories[p.group].push(p.subtopic);
    } else if (p.type === 'girdi') {
        if (!inputsCategories[p.group]) inputsCategories[p.group] = [];
        if (!inputsCategories[p.group].includes(p.subtopic)) inputsCategories[p.group].push(p.subtopic);
    }
});

// Dönem Katsayıları
const periods = [
    { id: '2026-10', name: 'Ekim 2026', factor: 1.0 },
    { id: '2026-9', name: 'Eylül 2026', factor: 0.978 },
    { id: '2026-8', name: 'Ağustos 2026', factor: 0.955 },
    { id: '2026-all', name: '2026 Ortalaması', factor: 0.942 }
];

// İl ve Ürün bazında yerel tarım uzmanlaşma katsayısı
function getSpecializationFactor(city, prod) {
    let factor = 1.0;
    if (prod.name.includes("Fındık") && ["Giresun", "Ordu", "Trabzon", "Düzce", "Sakarya", "Samsun"].includes(city)) factor = 1.04;
    if (prod.name.includes("Çay") && ["Rize", "Trabzon", "Artvin", "Giresun"].includes(city)) factor = 1.02;
    if (prod.name.includes("Pamuk") && ["Şanlıurfa", "Diyarbakır", "Aydın", "Adana", "Hatay"].includes(city)) factor = 1.03;
    if (prod.name.includes("Antep Fıstığı") && ["Gaziantep", "Şanlıurfa", "Siirt", "Adıyaman"].includes(city)) factor = 1.05;
    if (prod.name.includes("Kayısı") && ["Malatya", "Elazığ", "Iğdır"].includes(city)) factor = 1.06;
    if (prod.name.includes("Zeytin") && ["Aydın", "İzmir", "Balıkesir", "Manisa", "Çanakkale", "Muğla", "Hatay", "Kilis"].includes(city)) factor = 1.03;
    if (prod.group === "cikti_meyve" && ["Portakal", "Limon", "Mandalina"].some(n => prod.name.includes(n)) && ["Antalya", "Mersin", "Adana", "Hatay"].includes(city)) factor = 1.02;
    if (prod.group === "cikti_tahil" && ["Konya", "Ankara", "Eskişehir", "Aksaray", "Yozgat", "Sivas", "Tekirdağ"].includes(city)) factor = 1.02;
    if ((prod.group === "cikti_hayvancilik" || prod.group === "cikti_sut_kumes") && ["Erzurum", "Kars", "Ağrı", "Van", "Balıkesir", "Afyonkarahisar", "Konya"].includes(city)) factor = 1.02;
    return factor;
}

// Genel Bölgesel Maliyet Katsayısı
function getRegionCoefficient(city) {
    if (["Erzurum", "Van", "Hakkari", "Ağrı", "Kars", "Iğdır", "Ardahan", "Muş", "Bitlis", "Şırnak"].includes(city)) return 1.04;
    if (["Konya", "Karaman", "Adana", "Osmaniye", "Mersin", "Aksaray", "Niğde"].includes(city)) return 0.99;
    if (["İzmir", "Manisa", "Aydın", "Bursa", "Tekirdağ", "Kocaeli", "İstanbul"].includes(city)) return 0.98;
    if (["Rize", "Trabzon", "Artvin", "Giresun", "Ordu"].includes(city)) return 1.02;
    return 1.00;
}

// 81 il için 31.752 satırlık deterministik veri tabanı
function generateComprehensiveData() {
    const data = [];
    cities.forEach(city => {
        const regCoeff = getRegionCoefficient(city);
        periods.forEach(p => {
            productDefinitions.forEach(prod => {
                const specFactor = getSpecializationFactor(city, prod);
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
                    groupName: prod.groupName,
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
let currentWindow = 'outputs'; // 'outputs', 'inputs', 'report'
let reportItems = [];

// --- PENCERE DEĞİŞTİRME MANTIĞI (SWITCH WINDOW) ---
function switchWindow(targetWindow) {
    currentWindow = targetWindow;

    // View Elementleri
    const viewOutputs = document.getElementById('view-outputs');
    const viewInputs = document.getElementById('view-inputs');
    const viewReport = document.getElementById('view-report');

    // Sidebar Butonları
    const btnNavOutputs = document.getElementById('btn-nav-outputs');
    const btnNavInputs = document.getElementById('btn-nav-inputs');
    const btnNavReport = document.getElementById('btn-nav-report');

    // Üst Sekme Butonları
    const tabTopOutputs = document.getElementById('tab-top-outputs');
    const tabTopInputs = document.getElementById('tab-top-inputs');
    const tabTopReport = document.getElementById('tab-top-report');

    // Başlık ve Vurgu Çubuğu
    const pageTitle = document.getElementById('page-title');
    const headerAccent = document.getElementById('header-accent');

    // Tüm pencereleri gizle
    viewOutputs.classList.add('hidden');
    viewInputs.classList.add('hidden');
    viewReport.classList.add('hidden');

    // Sidebar buton stillerini sıfırla
    const navInactiveClass = "w-full text-left px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all flex items-center gap-3";
    btnNavOutputs.className = navInactiveClass;
    btnNavInputs.className = navInactiveClass;
    btnNavReport.className = navInactiveClass;

    // Üst sekme stillerini sıfırla
    const tabTopInactive = "px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900 transition-all flex items-center gap-1.5";
    tabTopOutputs.className = tabTopInactive;
    tabTopInputs.className = tabTopInactive;
    tabTopReport.className = tabTopInactive;

    if (targetWindow === 'outputs') {
        viewOutputs.classList.remove('hidden');
        btnNavOutputs.className = "w-full text-left px-4 py-3 rounded-xl bg-emerald-600 text-white font-medium transition-all hover:bg-emerald-700 flex items-center gap-3 shadow-md ring-1 ring-emerald-500";
        tabTopOutputs.className = "px-3.5 py-1.5 rounded-lg text-xs font-bold bg-white text-emerald-700 shadow-sm transition-all flex items-center gap-1.5";
        pageTitle.innerHTML = '🌾 Tarımsal ve Hayvansal Faaliyet Çıktıları Sorgulama';
        if (headerAccent) headerAccent.className = "w-2 h-7 bg-emerald-600 rounded-full";
        performOutputsSearch();
    } else if (targetWindow === 'inputs') {
        viewInputs.classList.remove('hidden');
        btnNavInputs.className = "w-full text-left px-4 py-3 rounded-xl bg-blue-600 text-white font-medium transition-all hover:bg-blue-700 flex items-center gap-3 shadow-md ring-1 ring-blue-500";
        tabTopInputs.className = "px-3.5 py-1.5 rounded-lg text-xs font-bold bg-white text-blue-700 shadow-sm transition-all flex items-center gap-1.5";
        pageTitle.innerHTML = '🚜 Tarımsal Girdiler ve Üretim Maliyetleri Sorgulama';
        if (headerAccent) headerAccent.className = "w-2 h-7 bg-blue-600 rounded-full";
        performInputsSearch();
    } else if (targetWindow === 'report') {
        viewReport.classList.remove('hidden');
        btnNavReport.className = "w-full text-left px-4 py-3 rounded-xl bg-slate-800 text-white font-medium transition-all hover:bg-slate-700 flex items-center gap-3 shadow-md ring-1 ring-slate-600";
        tabTopReport.className = "px-3.5 py-1.5 rounded-lg text-xs font-bold bg-white text-slate-900 shadow-sm transition-all flex items-center gap-1.5";
        pageTitle.innerHTML = '📑 Bilirkişi Rapor Taslağı ve Gelir-Maliyet Cetveli';
        if (headerAccent) headerAccent.className = "w-2 h-7 bg-slate-700 rounded-full";
        renderReport();
    }
}

// Arama Modu Değiştirme (Kategori Ağacı vs Akıllı Arama)
function setSearchMode(windowType, mode) {
    const isOutputs = windowType === 'outputs';
    const formStruct = document.getElementById(isOutputs ? 'outputs-form-structured' : 'inputs-form-structured');
    const formFree = document.getElementById(isOutputs ? 'outputs-form-free' : 'inputs-form-free');
    const btnStruct = document.getElementById(isOutputs ? 'outputs-mode-structured' : 'inputs-mode-structured');
    const btnFree = document.getElementById(isOutputs ? 'outputs-mode-free' : 'inputs-mode-free');
    const accentColor = isOutputs ? 'emerald' : 'blue';

    if (mode === 'structured') {
        btnStruct.className = `px-4 py-1.5 rounded-md text-sm font-medium bg-white shadow-sm text-${accentColor}-600 transition-all`;
        btnFree.className = "px-4 py-1.5 rounded-md text-sm font-medium text-slate-500 hover:text-slate-700 transition-all";
        formStruct.classList.remove('hidden');
        formFree.classList.add('hidden');
    } else {
        btnFree.className = `px-4 py-1.5 rounded-md text-sm font-medium bg-white shadow-sm text-${accentColor}-600 transition-all`;
        btnStruct.className = "px-4 py-1.5 rounded-md text-sm font-medium text-slate-500 hover:text-slate-700 transition-all";
        formFree.classList.remove('hidden');
        formStruct.classList.add('hidden');
    }
}

// --- İL LİSTELERİNİ DOLDURMA VE AKILLI SENKRONİZASYON ---
function populateCities() {
    const selOutCity = document.getElementById('sel-output-city');
    const selInCity = document.getElementById('sel-input-city');

    const sortedCities = cities.slice().sort((a, b) => a.localeCompare(b, 'tr'));

    if (selOutCity) {
        selOutCity.innerHTML = '<option value="">Tüm İller (81 İl)</option>';
        sortedCities.forEach(city => {
            const opt = document.createElement('option');
            opt.value = city;
            opt.textContent = city;
            selOutCity.appendChild(opt);
        });
    }

    if (selInCity) {
        selInCity.innerHTML = '<option value="">Tüm İller (81 İl)</option>';
        sortedCities.forEach(city => {
            const opt = document.createElement('option');
            opt.value = city;
            opt.textContent = city;
            selInCity.appendChild(opt);
        });
    }

    // İl Senkronizasyonu (Birinde seçilen il diğerine de otomatik aktarılır)
    if (selOutCity && selInCity) {
        selOutCity.addEventListener('change', () => {
            selInCity.value = selOutCity.value;
            performOutputsSearch();
        });
        selInCity.addEventListener('change', () => {
            selOutCity.value = selInCity.value;
            performInputsSearch();
        });
    }
}

// --- ALT KATEGORİLERİ DİNAMİK DOLDURMA ---
function populateOutputsSubtopics(selectedGroup = '') {
    const sel = document.getElementById('sel-output-subtopic');
    if (!sel) return;
    const prev = sel.value;
    sel.innerHTML = '<option value="">Tüm Alt Gruplar</option>';

    if (selectedGroup && outputsCategories[selectedGroup]) {
        outputsCategories[selectedGroup].forEach(sub => {
            const opt = document.createElement('option');
            opt.value = sub;
            opt.textContent = sub;
            sel.appendChild(opt);
        });
    } else {
        const subs = new Set();
        productDefinitions.filter(p => p.type === 'cikti').forEach(p => subs.add(p.subtopic));
        Array.from(subs).sort((a, b) => a.localeCompare(b, 'tr')).forEach(sub => {
            const opt = document.createElement('option');
            opt.value = sub;
            opt.textContent = sub;
            sel.appendChild(opt);
        });
    }
    if (prev && Array.from(sel.options).some(o => o.value === prev)) sel.value = prev;
}

function populateInputsSubtopics(selectedGroup = '') {
    const sel = document.getElementById('sel-input-subtopic');
    if (!sel) return;
    const prev = sel.value;
    sel.innerHTML = '<option value="">Tüm Alt Gruplar</option>';

    if (selectedGroup && inputsCategories[selectedGroup]) {
        inputsCategories[selectedGroup].forEach(sub => {
            const opt = document.createElement('option');
            opt.value = sub;
            opt.textContent = sub;
            sel.appendChild(opt);
        });
    } else {
        const subs = new Set();
        productDefinitions.filter(p => p.type === 'girdi').forEach(p => subs.add(p.subtopic));
        Array.from(subs).sort((a, b) => a.localeCompare(b, 'tr')).forEach(sub => {
            const opt = document.createElement('option');
            opt.value = sub;
            opt.textContent = sub;
            sel.appendChild(opt);
        });
    }
    if (prev && Array.from(sel.options).some(o => o.value === prev)) sel.value = prev;
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

// --- PENCERE 1: ÇIKTI SORGULAMA MANTIĞI ---
const performOutputsSearch = debounce(() => {
    const btn = document.querySelector('#outputs-form-structured button');
    let originalText = '';
    if (btn) {
        originalText = btn.innerHTML;
        btn.innerHTML = '<div class="loader border-emerald-200 border-t-emerald-600"></div>';
        btn.disabled = true;
    }

    const city = document.getElementById('sel-output-city').value;
    const group = document.getElementById('sel-output-group').value;
    const subtopic = document.getElementById('sel-output-subtopic').value;
    const period = document.getElementById('sel-output-period').value;

    setTimeout(() => {
        let results = mockDatabase.filter(item => item.type === 'cikti');

        if (city) results = results.filter(item => item.city === city);
        if (group) results = results.filter(item => item.group === group);
        if (subtopic) results = results.filter(item => item.subtopic === subtopic);
        if (period) results = results.filter(item => item.periodId === period);

        renderOutputsResults(results);

        if (btn) {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }

        const cityLabel = city ? `${city} ili için` : 'Tüm illerde';
        showToast(`${cityLabel} ${results.length} adet tarımsal faaliyet çıktısı listelendi.`);
    }, 250);
});

// Çıktı AI Arama
const performAIOutputsSearch = debounce(() => {
    const promptInput = document.getElementById('ai-outputs-prompt');
    const prompt = promptInput ? promptInput.value.trim().toLocaleLowerCase('tr-TR') : '';
    if (!prompt) return showToast('Lütfen aramak istediğiniz il veya mahsul adını yazınız.', 'error');

    let results = mockDatabase.filter(item =>
        item.type === 'cikti' && (
            item.name.toLocaleLowerCase('tr-TR').includes(prompt) ||
            item.city.toLocaleLowerCase('tr-TR').includes(prompt) ||
            item.subtopic.toLocaleLowerCase('tr-TR').includes(prompt) ||
            item.groupName.toLocaleLowerCase('tr-TR').includes(prompt)
        )
    );

    if (results.some(r => r.periodId === '2026-10')) {
        const currentPeriodResults = results.filter(r => r.periodId === '2026-10');
        if (currentPeriodResults.length > 0) results = currentPeriodResults;
    }

    if (results.length > 100) results = results.slice(0, 100);
    renderOutputsResults(results);
    showToast(`AI Çıktı Analizi: ${results.length} kayıt eşleşti.`);
    setSearchMode('outputs', 'structured');
});

function renderOutputsResults(data) {
    const tbody = document.getElementById('outputs-results-body');
    const countBadge = document.getElementById('outputs-result-count');
    tbody.innerHTML = '';
    countBadge.innerText = `${data.length} kayıt`;

    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="px-6 py-8 text-center text-slate-400 font-medium">Seçtiğiniz kriterlere uygun tarımsal çıktı verisi bulunamadı.</td></tr>`;
        return;
    }

    const fragment = document.createDocumentFragment();
    data.forEach(item => {
        const tr = document.createElement('tr');
        tr.className = "bg-white border-b hover:bg-emerald-50/40 transition-colors group";
        tr.innerHTML = `
            <td class="px-6 py-4 font-bold text-slate-800">${item.city}</td>
            <td class="px-6 py-4">
                <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    ${item.groupName}
                </span>
            </td>
            <td class="px-6 py-4 font-medium text-slate-800">
                <span class="block font-bold">${item.name}</span>
                <span class="text-xs text-slate-400">${item.subtopic}</span>
            </td>
            <td class="px-6 py-4 text-slate-600 font-medium">${item.periodStr}</td>
            <td class="px-6 py-4 text-right font-bold text-slate-700">${item.index}</td>
            <td class="px-6 py-4 text-right font-bold text-emerald-600 text-base">
                ${Number(item.price).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${item.unit}
            </td>
            <td class="px-6 py-4 text-center">
                <button onclick="addToReport('${item.city}', '${item.name}', '${Number(item.price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ${item.unit}', '${item.periodStr}', 'Ürün Çıktısı')"
                    class="opacity-0 group-hover:opacity-100 text-emerald-700 hover:text-emerald-900 font-medium text-xs border border-emerald-300 bg-emerald-50 px-3 py-1.5 rounded hover:bg-emerald-100 transition-all shadow-sm focus:opacity-100"
                    aria-label="${item.name} mahsulünü rapora ekle">
                    + Rapora Ekle
                </button>
            </td>
        `;
        fragment.appendChild(tr);
    });
    tbody.appendChild(fragment);
}

// --- PENCERE 2: GİRDİ SORGULAMA MANTIĞI ---
const performInputsSearch = debounce(() => {
    const btn = document.querySelector('#inputs-form-structured button');
    let originalText = '';
    if (btn) {
        originalText = btn.innerHTML;
        btn.innerHTML = '<div class="loader border-blue-200 border-t-blue-600"></div>';
        btn.disabled = true;
    }

    const city = document.getElementById('sel-input-city').value;
    const group = document.getElementById('sel-input-group').value;
    const subtopic = document.getElementById('sel-input-subtopic').value;
    const period = document.getElementById('sel-input-period').value;

    setTimeout(() => {
        let results = mockDatabase.filter(item => item.type === 'girdi');

        if (city) results = results.filter(item => item.city === city);
        if (group) results = results.filter(item => item.group === group);
        if (subtopic) results = results.filter(item => item.subtopic === subtopic);
        if (period) results = results.filter(item => item.periodId === period);

        renderInputsResults(results);

        if (btn) {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }

        const cityLabel = city ? `${city} ili için` : 'Tüm illerde';
        showToast(`${cityLabel} ${results.length} adet tarımsal girdi maliyeti listelendi.`);
    }, 250);
});

// Girdi AI Arama
const performAIInputsSearch = debounce(() => {
    const promptInput = document.getElementById('ai-inputs-prompt');
    const prompt = promptInput ? promptInput.value.trim().toLocaleLowerCase('tr-TR') : '';
    if (!prompt) return showToast('Lütfen aramak istediğiniz il veya girdi adını yazınız.', 'error');

    let results = mockDatabase.filter(item =>
        item.type === 'girdi' && (
            item.name.toLocaleLowerCase('tr-TR').includes(prompt) ||
            item.city.toLocaleLowerCase('tr-TR').includes(prompt) ||
            item.subtopic.toLocaleLowerCase('tr-TR').includes(prompt) ||
            item.groupName.toLocaleLowerCase('tr-TR').includes(prompt)
        )
    );

    if (results.some(r => r.periodId === '2026-10')) {
        const currentPeriodResults = results.filter(r => r.periodId === '2026-10');
        if (currentPeriodResults.length > 0) results = currentPeriodResults;
    }

    if (results.length > 100) results = results.slice(0, 100);
    renderInputsResults(results);
    showToast(`AI Girdi Analizi: ${results.length} kayıt eşleşti.`);
    setSearchMode('inputs', 'structured');
});

function renderInputsResults(data) {
    const tbody = document.getElementById('inputs-results-body');
    const countBadge = document.getElementById('inputs-result-count');
    tbody.innerHTML = '';
    countBadge.innerText = `${data.length} kayıt`;

    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="px-6 py-8 text-center text-slate-400 font-medium">Seçtiğiniz kriterlere uygun tarımsal girdi verisi bulunamadı.</td></tr>`;
        return;
    }

    const fragment = document.createDocumentFragment();
    data.forEach(item => {
        const tr = document.createElement('tr');
        tr.className = "bg-white border-b hover:bg-blue-50/40 transition-colors group";
        tr.innerHTML = `
            <td class="px-6 py-4 font-bold text-slate-800">${item.city}</td>
            <td class="px-6 py-4">
                <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                    ${item.groupName}
                </span>
            </td>
            <td class="px-6 py-4 font-medium text-slate-800">
                <span class="block font-bold">${item.name}</span>
                <span class="text-xs text-slate-400">${item.subtopic}</span>
            </td>
            <td class="px-6 py-4 text-slate-600 font-medium">${item.periodStr}</td>
            <td class="px-6 py-4 text-right font-bold text-slate-700">${item.index}</td>
            <td class="px-6 py-4 text-right font-bold text-blue-600 text-base">
                ${Number(item.price).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${item.unit}
            </td>
            <td class="px-6 py-4 text-center">
                <button onclick="addToReport('${item.city}', '${item.name}', '${Number(item.price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ${item.unit}', '${item.periodStr}', 'Girdi / Maliyet')"
                    class="opacity-0 group-hover:opacity-100 text-blue-700 hover:text-blue-900 font-medium text-xs border border-blue-300 bg-blue-50 px-3 py-1.5 rounded hover:bg-blue-100 transition-all shadow-sm focus:opacity-100"
                    aria-label="${item.name} girdisini rapora ekle">
                    + Rapora Ekle
                </button>
            </td>
        `;
        fragment.appendChild(tr);
    });
    tbody.appendChild(fragment);
}

// --- EXCEL DIŞA AKTARMA ---
function exportOutputsToExcel() {
    exportGenericToExcel('outputs-results-body', 'Tarımsal Çıktı Fiyatları', 'tuik_tarimsal_ciktilar.xlsx');
}

function exportInputsToExcel() {
    exportGenericToExcel('inputs-results-body', 'Tarımsal Girdi Maliyetleri', 'tuik_tarimsal_girdiler.xlsx');
}

function exportGenericToExcel(tbodyId, sheetName, fileName) {
    /* global XLSX */
    if (typeof XLSX === 'undefined') return showToast('Excel kütüphanesi yüklenemedi.', 'error');
    const rows = [];
    rows.push(['İl', 'Kategori Grubu', 'Kalem Adı', 'Alt Kategori', 'Dönem', 'TÜİK Endeks', 'Birim Fiyat / Maliyet']);

    const tbody = document.getElementById(tbodyId);
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
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, fileName);
    showToast('Excel dosyası başarıyla indirildi.');
}

// --- PENCERE 3: BİLİRKİŞİ RAPORU YÖNETİMİ ---
function addToReport(city, title, value, period, typeLabel) {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    reportItems.push({ id, city, title, value, period, typeLabel, date: new Date().toLocaleDateString('tr-TR') });
    updateReportBadge();
    showToast(`${title} (${typeLabel}) bilirkişi raporuna eklendi.`);
}

function removeFromReport(id) {
    reportItems = reportItems.filter(item => item.id !== id);
    updateReportBadge();
    renderReport();
}

function clearReport() {
    if (reportItems.length > 0 && confirm('Tüm rapor içeriğini temizlemek istediğinize emin misiniz?')) {
        reportItems = [];
        updateReportBadge();
        renderReport();
        showToast('Rapor taslağı temizlendi.');
    }
}

function updateReportBadge() {
    const badge = document.getElementById('report-badge');
    if (badge) {
        if (reportItems.length > 0) {
            badge.innerText = reportItems.length;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }
}

function renderReport() {
    const container = document.getElementById('report-content');
    const emptyState = document.getElementById('empty-state');
    if (!container) return;

    if (reportItems.length === 0) {
        container.innerHTML = '';
        if (emptyState) {
            container.appendChild(emptyState);
            emptyState.style.display = 'block';
        }
        return;
    }

    if (emptyState) emptyState.style.display = 'none';
    container.innerHTML = '';

    // İki alt bölüme ayır: Çıktılar ve Girdiler
    const ciktilar = reportItems.filter(i => i.typeLabel === 'Ürün Çıktısı');
    const girdiler = reportItems.filter(i => i.typeLabel === 'Girdi / Maliyet');

    // Özet Bilgi Başlığı
    const summaryCard = document.createElement('div');
    summaryCard.className = "grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-100 border border-slate-200 mb-6";
    summaryCard.innerHTML = `
        <div class="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
            <span class="text-xs text-slate-500 font-bold uppercase block">Toplam Kalem</span>
            <span class="text-2xl font-black text-slate-800">${reportItems.length} Kalem</span>
        </div>
        <div class="bg-white p-4 rounded-lg shadow-sm border border-emerald-200">
            <span class="text-xs text-emerald-600 font-bold uppercase block">🌾 Ürün Çıktıları</span>
            <span class="text-2xl font-black text-emerald-700">${ciktilar.length} Kalem</span>
        </div>
        <div class="bg-white p-4 rounded-lg shadow-sm border border-blue-200">
            <span class="text-xs text-blue-600 font-bold uppercase block">🚜 Girdi Maliyetleri</span>
            <span class="text-2xl font-black text-blue-700">${girdiler.length} Kalem</span>
        </div>
    `;
    container.appendChild(summaryCard);

    // Çıktılar Bölümü
    if (ciktilar.length > 0) {
        const ciktiHeader = document.createElement('h4');
        ciktiHeader.className = "text-lg font-bold text-emerald-800 flex items-center gap-2 border-b-2 border-emerald-200 pb-2 mb-4 mt-6";
        ciktiHeader.innerHTML = `<span>🌾</span> 1. Tarımsal ve Hayvansal Faaliyet Çıktıları (Mahsul Fiyatları)`;
        container.appendChild(ciktiHeader);

        ciktilar.forEach((item, idx) => {
            container.appendChild(createReportCard(item, idx + 1, true));
        });
    }

    // Girdiler Bölümü
    if (girdiler.length > 0) {
        const girdiHeader = document.createElement('h4');
        girdiHeader.className = "text-lg font-bold text-blue-800 flex items-center gap-2 border-b-2 border-blue-200 pb-2 mb-4 mt-8";
        girdiHeader.innerHTML = `<span>🚜</span> 2. Tarımsal Girdi ve Üretim Maliyetleri (Gider Cetveli)`;
        container.appendChild(girdiHeader);

        girdiler.forEach((item, idx) => {
            container.appendChild(createReportCard(item, idx + 1, false));
        });
    }
}

function createReportCard(item, index, isCikti) {
    const div = document.createElement('div');
    div.className = "bg-slate-50 border border-slate-200 rounded-lg p-5 relative group hover:border-slate-300 transition-colors shadow-sm break-inside-avoid";
    div.innerHTML = `
        <div class="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity no-print">
            <button onclick="removeFromReport(${item.id})" class="text-red-400 hover:text-red-600 p-2 bg-white rounded-full shadow-sm border border-slate-100" aria-label="Rapor öğesini kaldır">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
        </div>
        <div class="flex items-start gap-4">
            <div class="w-8 h-8 rounded-full ${isCikti ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'} flex items-center justify-center font-bold text-xs shrink-0">${index}</div>
            <div class="flex-1">
                <div class="flex justify-between items-center mb-1">
                    <h5 class="text-base font-bold text-slate-800">${item.title}</h5>
                    <span class="text-xs font-bold bg-slate-200 px-2 py-0.5 rounded text-slate-700">${item.city}</span>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                    <div class="bg-white p-2.5 rounded border border-slate-100">
                        <span class="text-[11px] text-slate-400 uppercase tracking-wide block">Dönem</span>
                        <p class="font-medium text-slate-700 text-sm">${item.period}</p>
                    </div>
                    <div class="bg-white p-2.5 rounded border border-slate-100">
                        <span class="text-[11px] text-slate-400 uppercase tracking-wide block">${isCikti ? 'Tahmini Çiftçi Satış Fiyatı' : 'Tahmini Birim Maliyet'}</span>
                        <p class="font-bold ${isCikti ? 'text-emerald-700' : 'text-blue-700'} text-lg">${item.value}</p>
                    </div>
                </div>
                <div class="mt-3 pt-2 border-t border-slate-200 text-[11px] text-slate-400 italic flex justify-between items-center">
                    <span>${isCikti ? 'Kaynak: TÜİK ÇEGF / Tarım-ÜFE' : 'Kaynak: TÜİK TGFE / Bölgesel Endeks'}</span>
                    <span>Tarih: ${item.date}</span>
                </div>
            </div>
        </div>
    `;
    return div;
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

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    populateCities();
    populateOutputsSubtopics();
    populateInputsSubtopics();

    // Çıktı filtrelerinde canlı değişim dinleyicileri
    ['sel-output-group', 'sel-output-subtopic', 'sel-output-period'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('change', () => {
                if (id === 'sel-output-group') populateOutputsSubtopics(el.value);
                performOutputsSearch();
            });
        }
    });

    // Girdi filtrelerinde canlı değişim dinleyicileri
    ['sel-input-group', 'sel-input-subtopic', 'sel-input-period'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('change', () => {
                if (id === 'sel-input-group') populateInputsSubtopics(el.value);
                performInputsSearch();
            });
        }
    });

    // İlk açılışta çıktıları listele
    performOutputsSearch();
});
