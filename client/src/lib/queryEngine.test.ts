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

});
