import { describe, it, expect } from 'vitest';
import { 
  executeAgriQuery, 
  findRegionForCity, 
  getSeasonalityFactor,
  MASTER_AGRI_CATALOG 
} from './queryEngine.ts';

describe('TarımViz Akıllı Sorgulama Motoru Doğrulaması', () => {

  it('1. Her zaman en alt kırılıma inmeli ve spesifikasyon içermelidir', () => {
    const results = executeAgriQuery({
      il: 'Konya',
      tur: 'cikti',
      yil: 2026,
      ay: 10
    });

    expect(results.length).toBeGreaterThan(0);
    results.forEach(r => {
      // Spesifikasyon boş olmamalı, kalite/protein/randıman içermeli
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
    expect(konyaRegion.girdiKatsayisi).toBeLessThan(1.0); // Tarım havzası lojistik avantajı

    const trabzonRegion = findRegionForCity('Trabzon');
    expect(trabzonRegion.kod).toBe('TR90');
    expect(trabzonRegion.girdiKatsayisi).toBeGreaterThan(1.0); // Doğu Karadeniz lojistik katsayısı

    const konyaResults = executeAgriQuery({ il: 'Konya', tur: 'girdi', yil: 2026, ay: 10 });
    const trabzonResults = executeAgriQuery({ il: 'Trabzon', tur: 'girdi', yil: 2026, ay: 10 });

    const konyaMazot = konyaResults.find(r => r.urunAdi.includes('Motorin'));
    const trabzonMazot = trabzonResults.find(r => r.urunAdi.includes('Motorin'));

    expect(konyaMazot?.bolgeBilgisi.uygulananBolgeKatsayisi).not.toBe(trabzonMazot?.bolgeBilgisi.uygulananBolgeKatsayisi);
  });

  it('4. Mevsimsellik katsayısı yaz ve kış aylarında anlamlı şekilde farklılaşmalıdır', () => {
    // Domateste yaz hasat dönemi (Temmuz - 7. ay) fiyatı kış sera dönemi (Ocak - 1. ay) fiyatından düşük olmalı
    const winterFactor = getSeasonalityFactor('Sofralık Domates', 1);
    const summerFactor = getSeasonalityFactor('Sofralık Domates', 7);

    expect(winterFactor).toBeGreaterThan(summerFactor);
    expect(winterFactor).toBeGreaterThan(1.2);
    expect(summerFactor).toBeLessThan(0.85);
  });

  it('5. Veri doğrudan ilde yoksa bir üst seviye (İBBS-2 veya TR ortalaması) fallback kullanılmalıdır', () => {
    // Fındık için Giresun öncelikli il iken Ankara fındık havzası değildir
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
      expect(r.erisimTarihi).toBeTruthy();
    });
  });

});
