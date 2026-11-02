import { describe, it, expect } from 'vitest';
import {
  UTOBUS_2021_ITEMS,
  UTOBUS_UNITS,
  UTOBUS_CHAPTERS,
  getUtobusByCode,
  searchUtobus2021,
  findBestUtobusMatch,
  getUtobusStats
} from './utobus2021Catalog';

describe('UTOBÜS 2021 Kataloğu ve Ölçü Birimleri (TAORBA 2021)', () => {
  it('tüm 1382 resmî TÜİK madde kaydını eksiksiz yüklemelidir', () => {
    expect(UTOBUS_2021_ITEMS.length).toBe(1382);
  });

  it('resmî ölçü birimleri ve birim kodları tanımlı olmalıdır', () => {
    expect(UTOBUS_UNITS['3002'].ad).toBe('Ton');
    expect(UTOBUS_UNITS['4135'].ad).toBe('Baş');
    expect(UTOBUS_UNITS['2600'].ad).toBe('Adet sayısı');
    expect(UTOBUS_UNITS['3000'].ad).toBe('Türk Lirası');
    expect(UTOBUS_UNITS['2400'].ad).toBe('Metreküp');
    expect(UTOBUS_UNITS['2000'].ad).toBe('Litre');
  });

  it('kritik tarımsal maddeleri doğru 10-haneli kod ve ölçü birimiyle getirmelidir', () => {
    // Durum buğdayı (Ton - 3002)
    const durum = getUtobusByCode('01.11.11.00.00');
    expect(durum).toBeDefined();
    expect(durum?.tanim).toContain('Durum buğdayı');
    expect(durum?.olcuBirimi).toBe('Ton');
    expect(durum?.olcuBirimKodu).toBe('3002');

    // Mısır (Ton - 3002)
    const misir = getUtobusByCode('01.11.20.00.01');
    expect(misir?.tanim).toContain('Mısır');
    expect(misir?.olcuBirimKodu).toBe('3002');

    // Çiğ Süt (Ton - 3002)
    const sut = getUtobusByCode('01.41.20.00.01');
    expect(sut?.tanim).toContain('Süt');
    expect(sut?.olcuBirimKodu).toBe('3002');

    // Canlı Kültür Düve (Baş - 4135)
    const duve = getUtobusByCode('01.41.10.01.02');
    expect(duve?.tanim).toContain('düve');
    expect(duve?.olcuBirimi).toBe('Baş');
    expect(duve?.olcuBirimKodu).toBe('4135');

    // Tavuk Yumurtası (Adet sayısı - 2600)
    const yumurta = getUtobusByCode('01.47.21.00.00');
    expect(yumurta?.tanim).toContain('yumurtası');
    expect(yumurta?.olcuBirimi).toBe('Adet sayısı');
    expect(yumurta?.olcuBirimKodu).toBe('2600');

    // Çapalama hizmetleri (Türk Lirası - 3000)
    const capa = getUtobusByCode('01.61.10.02.04');
    expect(capa?.tanim).toContain('Çapalama hizmetleri');
    expect(capa?.olcuBirimi).toBe('Türk Lirası');
    expect(capa?.olcuBirimKodu).toBe('3000');
  });

  it('arama ve filtreleme fonksiyonu birim kodu ve bölüm filtresine göre doğru sonuç vermelidir', () => {
    // 3000 (TL) birim kodlu tarımsal hizmetler
    const services = searchUtobus2021({ unitCode: '3000', limit: 100 });
    expect(services.length).toBeGreaterThan(10);
    services.forEach(s => expect(s.olcuBirimKodu).toBe('3000'));

    // 'zeytin' araması
    const zeytinler = searchUtobus2021({ query: 'zeytin' });
    expect(zeytinler.length).toBeGreaterThan(0);
    expect(zeytinler.some(z => z.tanim.toLowerCase().includes('zeytin'))).toBe(true);
  });

  it('findBestUtobusMatch metin tabanlı sorgularda doğru resmî kodu eşleştirmelidir', () => {
    const bugday = findBestUtobusMatch('Ekmeklik Buğday Anadolu Kırmızı Sert');
    expect(bugday?.kod).toBe('01.11.12.00.00');

    const tosun = findBestUtobusMatch('Besi Tosunu Canlı');
    expect(tosun?.kod).toBe('01.42.11.01.03');

    const sut = findBestUtobusMatch('Çiğ İnek Sütü');
    expect(sut?.kod).toBe('01.41.20.00.01');
  });

  it('katalog istatistikleri geçerli birim dağılımı üretmelidir', () => {
    const stats = getUtobusStats();
    expect(stats.totalItems).toBe(1382);
    expect(stats.unitBreakdown['3002']).toBeGreaterThan(900); // Ton
    expect(stats.unitBreakdown['2600']).toBeGreaterThan(200); // Adet sayısı
    expect(stats.unitBreakdown['3000']).toBeGreaterThan(70);  // Türk Lirası
    expect(stats.unitBreakdown['4135']).toBeGreaterThan(40);  // Baş
  });
});
