import { describe, it, expect } from 'vitest';
import { 
  executeAgriQuery, 
  findRegionForCity, 
  getSeasonalityFactor,
  calculateItemPriceIndex,
  calculateGroupPriceIndices,
  EU_HANDBOOK_2020_GROUPS,
  MASTER_AGRI_CATALOG 
} from './queryEngine.ts';

describe('TarımViz Akıllı Sorgulama ve Endeks Hesaplama Motoru Doğrulaması', () => {

  it('1. Her zaman en alt kırılıma inmeli ve spesifikasyon içermelidir', () => {
    const results = executeAgriQuery({
      il: 'Konya',
      tur: 'cikti',
      yil: 2026,
      ay: 10
    });

    expect(results.length).toBeGreaterThan(0);
    results.forEach(r => {
      expect(r.spesifikasyon).toBeTruthy();
      expect(r.spesifikasyon.length).toBeGreaterThan(10);
      expect(r.hesaplananFiyat).toBeGreaterThan(0);
    });

    const bugday = results.find(r => r.urunAdi.includes('Ekmeklik Buğday'));
    expect(bugday).toBeDefined();
    expect(bugday?.spesifikasyon).toContain('Protein');
  });

  it('2. Üçlü kaynak çapraz kontrolü yapmalı (TÜİK + EMB + Hal) ve güven skoru üretmelidir', () => {
    const results = executeAgriQuery({
      il: 'Adana',
      tur: 'hepsi',
      yil: 2026,
      ay: 9
    });

    const sample = results[0];
    expect(sample.kaynakCaprazKontrol).toBeDefined();
    expect(sample.kaynakCaprazKontrol.tuikFiyati).toBeGreaterThan(0);
    expect(sample.kaynakCaprazKontrol.embBorsaFiyati).toBeGreaterThan(0);
    expect(sample.kaynakCaprazKontrol.halFiyati).toBeGreaterThan(0);
    expect(sample.kaynakCaprazKontrol.guvenSkoru).toBeGreaterThanOrEqual(85);
  });

  it('3. Bölge katsayıları mutlaka uygulanmalı ve İBBS-2 kodu eşleşmelidir', () => {
    const konyaRegion = findRegionForCity('Konya');
    expect(konyaRegion.kod).toBe('TR52');
    expect(konyaRegion.girdiKatsayisi).toBeLessThan(1.0);

    const trabzonRegion = findRegionForCity('Trabzon');
    expect(trabzonRegion.kod).toBe('TR90');
    expect(trabzonRegion.girdiKatsayisi).toBeGreaterThan(1.0);

    const konyaResults = executeAgriQuery({ il: 'Konya', tur: 'girdi', yil: 2026, ay: 10 });
    const trabzonResults = executeAgriQuery({ il: 'Trabzon', tur: 'girdi', yil: 2026, ay: 10 });

    const konyaMazot = konyaResults.find(r => r.urunAdi.includes('Motorin'));
    const trabzonMazot = trabzonResults.find(r => r.urunAdi.includes('Motorin'));

    expect(konyaMazot?.bolgeBilgisi.uygulananBolgeKatsayisi).not.toBe(trabzonMazot?.bolgeBilgisi.uygulananBolgeKatsayisi);
  });

  it('4. Mevsimsellik katsayısı yaz ve kış aylarında anlamlı şekilde farklılaşmalıdır', () => {
    const winterFactor = getSeasonalityFactor('Sofralık Domates', 1);
    const summerFactor = getSeasonalityFactor('Sofralık Domates', 7);

    expect(winterFactor).toBeGreaterThan(summerFactor);
    expect(winterFactor).toBeGreaterThan(1.2);
    expect(summerFactor).toBeLessThan(0.85);
  });

  it('5. Veri doğrudan ilde yoksa bir üst seviye fallback kullanılmalıdır', () => {
    const ankaraResults = executeAgriQuery({ il: 'Ankara', tur: 'cikti', yil: 2026, ay: 10 });
    const ankaraFindik = ankaraResults.find(r => r.urunAdi.includes('Fındık'));

    expect(ankaraFindik).toBeDefined();
    expect(ankaraFindik?.fallbackSeviyesi).not.toBe('il_dogrudan');
    expect(ankaraFindik?.fallbackAciklamasi.includes('İBBS-2') || ankaraFindik?.fallbackAciklamasi.includes('Türkiye')).toBe(true);
  });

  it('6. Her sorgu için kaynakça ve erişim tarihi kaydedilmelidir', () => {
    const results = executeAgriQuery({ il: 'Gaziantep', tur: 'hepsi', yil: 2026, ay: 10 });
    results.forEach(r => {
      expect(r.kaynakca).toBeTruthy();
      expect(r.kaynakca).toContain('TÜİK');
      expect(r.kaynakca).toContain('TAORBA');
      expect(r.kaynakca).toContain('CPA');
      expect(r.erisimTarihi).toBeTruthy();
    });
  });

  // ==========================================================================
  // YENİ GEREKSİNİMLERİN TESTLERİ (AB EL KİTABI 2020 & TAORBA 2008_2 & CPA 2008)
  // ==========================================================================

  it('7. AB Tarımsal Fiyat İstatistikleri El Kitabı 2020 sınıflama yapısını doğru uygulamalıdır', () => {
    expect(EU_HANDBOOK_2020_GROUPS.length).toBeGreaterThan(8);
    
    // Çıktı grupları
    const cerealGroup = EU_HANDBOOK_2020_GROUPS.find(g => g.kod === '01.1');
    expect(cerealGroup).toBeDefined();
    expect(cerealGroup?.anaGrupAdi).toContain('Bitkisel Ürünler');
    expect(cerealGroup?.endeksTuru).toBe('Tarım-ÜFE');

    // Hayvansal gruplar
    const milkGroup = EU_HANDBOOK_2020_GROUPS.find(g => g.kod === '02.3');
    expect(milkGroup).toBeDefined();
    expect(milkGroup?.anaGrupAdi).toContain('Hayvanlar');

    // Girdi grupları
    const fertilizerGroup = EU_HANDBOOK_2020_GROUPS.find(g => g.kod === '01.3_G');
    expect(fertilizerGroup).toBeDefined();
    expect(fertilizerGroup?.endeksTuru).toBe('Tarım-GFE');

    // Katalogdaki tüm maddelerin AB sınıflaması tam olmalıdır
    MASTER_AGRI_CATALOG.forEach(item => {
      expect(item.abElKitabi2020).toBeDefined();
      expect(item.abElKitabi2020.anaGrupKod).toMatch(/01|02/);
      expect(item.abElKitabi2020.altGrupKod).toBeTruthy();
    });
  });

  it('8. Madde düzeyinde TAORBA 2008_2 (10 hane) ve CPA 2008 (6 hane) sınıflamalarını taşımalıdır', () => {
    const results = executeAgriQuery({ il: 'Konya', tur: 'hepsi', yil: 2026, ay: 10 });
    
    results.forEach(r => {
      // TAORBA 2008_2 10 haneli format kontrolü (XX.XX.XX.XX.XX)
      expect(r.taorba2008_2).toMatch(/^\d{2}\.\d{2}\.\d{2}\.\d{2}\.\d{2}$/);

      // CPA 2008 6 haneli format kontrolü (XX.XX.XX)
      expect(r.cpa2008).toMatch(/^\d{2}\.\d{2}\.\d{2}$/);
    });

    const bugday = results.find(r => r.urunAdi.includes('Ekmeklik Buğday'));
    expect(bugday?.taorba2008_2).toBe('01.11.12.00.00');
    expect(bugday?.cpa2008).toBe('01.11.12');

    const uregubre = results.find(r => r.urunAdi.includes('Üre Gübresi'));
    expect(uregubre?.taorba2008_2).toBe('20.15.31.00.00');
    expect(uregubre?.cpa2008).toBe('20.15.31');

    const motorin = results.find(r => r.urunAdi.includes('Motorin'));
    expect(motorin?.taorba2008_2).toBe('19.20.26.00.00');
    expect(motorin?.cpa2008).toBe('19.20.26');
  });

  it('9. 2020=100 Madde Fiyat Endeksi ve Ağırlıklı Grup Endeksleri doğru hesaplanmalıdır', () => {
    // Madde endeksi matematik formülü kontrolü
    const testIndex = calculateItemPriceIndex(11.60, 1.68);
    expect(testIndex).toBeCloseTo(690.48, 1);

    const results = executeAgriQuery({ il: 'Konya', tur: 'hepsi', yil: 2026, ay: 10 });
    results.forEach(r => {
      expect(r.endeksBilgisi.bazYil).toBe('2020=100');
      expect(r.endeksBilgisi.bazFiyat2020).toBeGreaterThan(0);
      expect(r.endeksBilgisi.maddeFiyatEndeksi).toBeGreaterThan(100); // 2020'den bugüne fiyat artışı
    });

    // Grup endeksleri hesaplama
    const groupSummaries = calculateGroupPriceIndices(results);
    expect(groupSummaries.length).toBeGreaterThan(3);

    const tahilOzet = groupSummaries.find(g => g.altGrupKod === '01.1');
    expect(tahilOzet).toBeDefined();
    expect(tahilOzet?.agirlikliGrupEndeksi).toBeGreaterThan(500);
    expect(tahilOzet?.toplamAgirlikPromil).toBeGreaterThan(100);
  });

  it('10. 2020=100 Tarım-GFE Resmî Ağırlık Şeması (%88,87 Girdi 1 ve %11,13 Girdi 2) uygulanmalıdır', async () => {
    // 1. Metodolojik sabitler doğrulanmalı
    const { TUIK_TGFE_METHODOLOGY, calculateCompositeTGFE } = await import('./queryEngine.ts');
    expect(TUIK_TGFE_METHODOLOGY.anaGruplar.girdi1.agirlikYuzde).toBe(88.87);
    expect(TUIK_TGFE_METHODOLOGY.anaGruplar.girdi2.agirlikYuzde).toBe(11.13);
    expect(TUIK_TGFE_METHODOLOGY.anaGruplar.girdi1.agirlikYuzde + TUIK_TGFE_METHODOLOGY.anaGruplar.girdi2.agirlikYuzde).toBe(100.00);

    // 2. Girdi sorgusunda Girdi 1 (Ara tüketim) ve Girdi 2 (Yatırım: Traktör/Makine) bulunmalı
    const results = executeAgriQuery({ il: 'Konya', tur: 'girdi', yil: 2026, ay: 10 });
    const traktor = results.find(r => r.urunAdi.includes('Traktör'));
    expect(traktor).toBeDefined();
    expect(traktor?.abElKitabi2020.anaGrupKod).toBe('02');
    expect(traktor?.cpa2008).toBe('28.30.22');

    const gubre = results.find(r => r.urunAdi.includes('Üre'));
    expect(gubre).toBeDefined();
    expect(gubre?.abElKitabi2020.anaGrupKod).toBe('01');

    // 3. Bileşik Tarım-GFE Endeksi: 0.8887 * G1 + 0.1113 * G2 formülü ile hesaplanmalı
    const composite = calculateCompositeTGFE(results);
    expect(composite.girdi1Endeksi).toBeGreaterThan(0);
    expect(composite.girdi2Endeksi).toBeGreaterThan(0);
    expect(composite.genelTGFEEndeksi).toBeCloseTo(
      Number(((0.8887 * composite.girdi1Endeksi) + (0.1113 * composite.girdi2Endeksi)).toFixed(2)),
      1
    );
  });

  it('11. TÜİK 4 Ayaklı Veri Kaynakları Mimarisi (Soru Formu, TÜİK Diğer, İdari Kayıt, Veri Kazıma) eksiksiz tanımlanmalıdır', async () => {
    const { TUIK_TGFE_METHODOLOGY } = await import('./queryEngine.ts');
    
    // 1. Dört kanalın varlığı ve başlıkları
    expect(TUIK_TGFE_METHODOLOGY.veriKaynaklari).toBeDefined();
    expect(TUIK_TGFE_METHODOLOGY.veriKaynaklari.soruFormlari.kaynaklar).toContain('Tarımsal Girdi İstatistikleri Aylık Soru Formu');
    expect(TUIK_TGFE_METHODOLOGY.veriKaynaklari.soruFormlari.kaynaklar).toContain('Tarımsal Fiyatlar Çiftçinin Ödediği Hizmetler Fiyat Derleme Formu');
    expect(TUIK_TGFE_METHODOLOGY.veriKaynaklari.tuikDigerCalismalar.kaynaklar).toContain('İnşaat Maliyet Endeksi (İME)');
    expect(TUIK_TGFE_METHODOLOGY.veriKaynaklari.idariKayitlar.kaynaklar).toContain('TOB Devlet Su İşleri Genel Müdürlüğü');
    expect(TUIK_TGFE_METHODOLOGY.veriKaynaklari.idariKayitlar.kaynaklar).toContain('Enerji Piyasası Düzenleme Kurulu (EPDK)');
    expect(TUIK_TGFE_METHODOLOGY.veriKaynaklari.idariKayitlar.kaynaklar).toContain('Türkiye Tarım Kredi Kooperatifleri');
    expect(TUIK_TGFE_METHODOLOGY.veriKaynaklari.idariKayitlar.kaynaklar).toContain('Pancar Ekicileri Kooperatifleri Birliği (PANKOBİRLİK)');
    expect(TUIK_TGFE_METHODOLOGY.veriKaynaklari.idariKayitlar.kaynaklar).toContain('Türk Veteriner Hekimleri Birliği');
    expect(TUIK_TGFE_METHODOLOGY.veriKaynaklari.veriKazima.kaynaklar).toContain('Traktör ve Makine Satışı Yapan Bayiler');

    // 2. Girdi sorgusundaki kalemlerin 4 kanala dağılımı
    const results = executeAgriQuery({ il: 'Konya', tur: 'girdi', yil: 2026, ay: 10 });

    // Soru formu örneği (Üre Gübresi / Yem)
    const soruFormuItem = results.find(r => r.tuikVeriKaynagi?.kanalKodu === 'soru_formlari');
    expect(soruFormuItem).toBeDefined();

    // İdari Kayıt örneği (Sulama Suyu / EPDK Motorin / Tarımsal Elektrik / TVHB)
    const dsiItem = results.find(r => r.urunAdi.includes('Sulama Suyu'));
    expect(dsiItem?.tuikVeriKaynagi?.kanalKodu).toBe('idari_kayitlar');
    expect(dsiItem?.tuikVeriKaynagi?.kurumVeDokuman).toContain('Devlet Su İşleri');

    const epdkItem = results.find(r => r.urunAdi.includes('Elektrik Enerjisi'));
    expect(epdkItem?.tuikVeriKaynagi?.kanalKodu).toBe('idari_kayitlar');
    expect(epdkItem?.tuikVeriKaynagi?.kurumVeDokuman).toContain('EPDK');

    const veterinerItem = results.find(r => r.urunAdi.includes('Veterinerlik'));
    expect(veterinerItem?.tuikVeriKaynagi?.kanalKodu).toBe('idari_kayitlar');
    expect(veterinerItem?.tuikVeriKaynagi?.kurumVeDokuman).toContain('Türk Veteriner Hekimleri Birliği');

    // TÜİK Diğer Çalışmalar örneği (İME Sera Yapı)
    const imeItem = results.find(r => r.urunAdi.includes('Sera Bakım'));
    expect(imeItem?.tuikVeriKaynagi?.kanalKodu).toBe('tuik_diger_calismalar');
    expect(imeItem?.tuikVeriKaynagi?.kurumVeDokuman).toContain('İnşaat Maliyet Endeksi');

    // Veri Kazıma örneği (Traktör / Mibzer)
    const traktorItem = results.find(r => r.urunAdi.includes('Traktör'));
    expect(traktorItem?.tuikVeriKaynagi?.kanalKodu).toBe('veri_kazima');
    expect(traktorItem?.tuikVeriKaynagi?.kurumVeDokuman).toContain('Traktör ve Makine Satışı Yapan Bayiler');
  });

  it('12. Sorgulanan ürünler UTOBÜS 2021 (TAORBA 2021) 10-haneli kodu ve resmî ölçü birimiyle eşleşmelidir', () => {
    const results = executeAgriQuery({ il: 'Konya', tur: 'cikti', yil: 2026, ay: 10 });
    
    // Ekmeklik Buğday
    const bugday = results.find(r => r.urunAdi.includes('Ekmeklik Buğday'));
    expect(bugday?.utobus2021).toBeDefined();
    expect(bugday?.utobus2021?.kod).toBe('01.11.12.00.00');
    expect(bugday?.utobus2021?.olcuBirimi).toBe('Ton');
    expect(bugday?.utobus2021?.olcuBirimKodu).toBe('3002');
    expect(bugday?.kaynakca).toContain('UTOBÜS 2021: 01.11.12.00.00');

    // Makarnalık Buğday
    const makarnalik = results.find(r => r.urunAdi.includes('Makarnalık'));
    expect(makarnalik?.utobus2021).toBeDefined();
    expect(makarnalik?.utobus2021?.kod).toBe('01.11.11.00.00');
    expect(makarnalik?.utobus2021?.olcuBirimKodu).toBe('3002');

    // Hayvansal Çıktı: Çiğ Süt
    const hayvansalResults = executeAgriQuery({ il: 'İzmir', tur: 'cikti', yil: 2026, ay: 10 });
    const sut = hayvansalResults.find(r => r.urunAdi.includes('Süt'));
    expect(sut?.utobus2021).toBeDefined();
    expect(sut?.utobus2021?.olcuBirimi).toBe('Ton');
    expect(sut?.utobus2021?.olcuBirimKodu).toBe('3002');
  });

});
