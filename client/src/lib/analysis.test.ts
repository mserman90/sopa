import { describe, it, expect } from 'vitest';
import {
  calculateRevenue,
  evaluateGrossMargin,
  parseAndValidateCSV,
  computeKPIs,
  getPreloadedMedasKn92Records
} from './analysis.ts';

describe('TarımViz - Analiz ve Doğrulama Kuralları', () => {

  describe('1. Gelir Hesaplama ve Birim Dönüşümü', () => {
    it('Ton üretim ve TL/Kg fiyatında 1000 katsayısı ile doğru gelir hesaplamalıdır', () => {
      // 100 Ton buğday x 10 TL/Kg = 100 * 1000 * 10 = 1.000.000 TL
      const revenue = calculateRevenue(100, 'Ton', 10, 'TL/Kg');
      expect(revenue).toBe(1000000);
    });

    it('Aynı birimlerde (TL/Kg x Kg) doğrudan çarpmalıdır', () => {
      const revenue = calculateRevenue(500, 'Kg', 15, 'TL/Kg');
      expect(revenue).toBe(7500);
    });

    it('Fiyat girilmemişse veya sıfır/negatifse gelir null dönmelidir', () => {
      expect(calculateRevenue(100, 'Ton', undefined, 'TL/Kg')).toBeNull();
      expect(calculateRevenue(100, 'Ton', 0, 'TL/Kg')).toBeNull();
      expect(calculateRevenue(100, 'Ton', -5, 'TL/Kg')).toBeNull();
    });

    it('Fiyat para birimi TL veya ₺ değilse (örn. USD) gelir hesaplanmamalıdır', () => {
      expect(calculateRevenue(100, 'Ton', 250, 'USD/Ton')).toBeNull();
    });
  });

  describe('2. Brüt Marj ve Maliyet Uygunluğu Kuralları', () => {
    it('Yalnızca maliyet_durumu "gerceklesen" olduğunda brüt marj hesaplanmalıdır', () => {
      const res = evaluateGrossMargin(1000000, 700000, 'gerceklesen');
      expect(res.canCalculate).toBe(true);
      expect(res.marj).toBe(300000);
    });

    it('Maliyet "tahmini" olarak işaretlenmişse brüt marj hesaplanmamalıdır (dışarıda bırakılmalıdır)', () => {
      const res = evaluateGrossMargin(1000000, 700000, 'tahmini');
      expect(res.canCalculate).toBe(false);
      expect(res.marj).toBeNull();
      expect(res.reason).toContain('tahmini');
    });

    it('Maliyet eksikse (undefined veya null), "0 TL" kabul EDİLMEMELİ ve marj hesaplanmamalıdır', () => {
      const res = evaluateGrossMargin(1000000, undefined, 'gerceklesen');
      expect(res.canCalculate).toBe(false);
      expect(res.marj).toBeNull();
      expect(res.reason).toContain('Maliyet verisi bulunamadı');
    });

    it('Gelir yoksa marj hesaplanamaz', () => {
      const res = evaluateGrossMargin(null, 500000, 'gerceklesen');
      expect(res.canCalculate).toBe(false);
      expect(res.marj).toBeNull();
    });
  });

  describe('3. CSV Şema ve Coğrafi Düzey Doğrulama', () => {
    it('Zorunlu sütunlar eksikse hata döndürmelidir', () => {
      const badCsv = 'il,yil,sektor\nKonya,2025,bitkisel';
      const result = parseAndValidateCSV(badCsv);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('Zorunlu sütunlar eksik');
    });

    it('Sadece "İl" veya "İBBS Düzey 3" coğrafi düzeyini kabul etmeli, ilçe düzeyini reddetmelidir', () => {
      const csvWithDistrict = `il,yil,sektor,urun,uretim_miktari,uretim_birimi,kaynak,cografi_duzey
Çumra,2025,bitkisel,Buğday,50000,Ton,TÜİK,İlçe`;
      const result = parseAndValidateCSV(csvWithDistrict);
      expect(result.records.length).toBe(0);
      expect(result.warnings.some(w => w.includes('Geçersiz coğrafi düzey'))).toBe(true);
    });

    it('Geçerli bir CSV satırını doğru parse etmeli ve gelir/marj durumunu işlemelidir', () => {
      const validCsv = `il,yil,sektor,urun,uretim_miktari,uretim_birimi,kaynak,cografi_duzey,fiyat,fiyat_birimi,toplam_maliyet_tl,maliyet_durumu,donem,veri_durumu
Konya,2025,bitkisel,Ekmeklik Buğday,1000,Ton,TÜİK BÜİ,İl,11.50,TL/Kg,8000000,gerceklesen,Yıllık,kesin`;
      const result = parseAndValidateCSV(validCsv);
      expect(result.valid).toBe(true);
      expect(result.records.length).toBe(1);

      const record = result.records[0];
      expect(record.il).toBe('Konya');
      // 1000 Ton * 1000 * 11.50 TL = 11.500.000 TL
      expect(record.hesaplanan_gelir_tl).toBe(11500000);
      // 11.500.000 - 8.000.000 = 3.500.000 TL
      expect(record.hesaplanan_brut_marj_tl).toBe(3500000);
      expect(record.marj_hesaplanabilir).toBe(true);
    });

    it('TÜİK MEDAS (kn=92) doğrudan başlık formatını (il_adi, urun_adi, uretim_(ton)) başarıyla tanımalıdır', () => {
      const medasCsv = `il_adi,yil,urun_adi,uretim_(ton)
Konya,2025,Sert Buğday (Durum),150000
Ankara,2025,Arpa,85000`;
      const result = parseAndValidateCSV(medasCsv);
      expect(result.valid).toBe(true);
      expect(result.records.length).toBe(2);
      expect(result.records[0].il).toBe('Konya');
      expect(result.records[0].urun).toBe('Sert Buğday (Durum)');
      expect(result.records[0].uretim_miktari).toBe(150000);
      expect(result.records[0].sektor).toBe('bitkisel');
      expect(result.records[0].uretim_birimi).toBe('Ton');
      expect(result.records[0].kaynak).toContain('TÜİK MEDAS');
    });
  });

  describe('4. KPI ve Metrik Toplulaştırma', () => {
    it('Maliyeti veya fiyatı olmayan ürünleri içeren karışık sette KPI ları doğru toplamalıdır', () => {
      const validCsv = `il,yil,sektor,urun,uretim_miktari,uretim_birimi,kaynak,cografi_duzey,fiyat,fiyat_birimi,toplam_maliyet_tl,maliyet_durumu,donem,veri_durumu
Konya,2025,bitkisel,Ekmeklik Buğday,1000,Ton,TÜİK BÜİ,İl,10,TL/Kg,6000000,gerceklesen,Yıllık,kesin
Adana,2025,bitkisel,Mısır,500,Ton,TÜİK BÜİ,İl,8,TL/Kg,,belirtilmemis,Yıllık,kesin`;
      const result = parseAndValidateCSV(validCsv);
      const kpis = computeKPIs(result.records);

      // Konya Gelir: 1000 * 1000 * 10 = 10.000.000
      // Adana Gelir: 500 * 1000 * 8 = 4.000.000
      // Toplam Gelir = 14.000.000
      expect(kpis.toplamGelirTL).toBe(14000000);
      expect(kpis.gelirKapsananUrunSayisi).toBe(2);

      // Yalnızca Konya'nın maliyeti gerçek ve mevcut: 6.000.000
      expect(kpis.toplamMaliyetTL).toBe(6000000);
      expect(kpis.maliyetKapsananUrunSayisi).toBe(1);

      // Yalnızca Konya için marj hesaplanabilir: 10.000.000 - 6.000.000 = 4.000.000
      expect(kpis.toplamBrutMarjTL).toBe(4000000);
      expect(kpis.marjKapsananUrunSayisi).toBe(1);
    });

    it('getPreloadedMedasKn92Records geçerli TÜİK MEDAS kn=92 kayıtları üretmeli ve hesaplamaları doğrulamalıdır', () => {
      const records = getPreloadedMedasKn92Records();
      expect(records.length).toBe(10);
      records.forEach(r => {
        expect(r.kaynak).toContain('TÜİK MEDAS (kn=92');
        expect(r.sektor).toBe('bitkisel');
        expect(r.uretim_miktari).toBeGreaterThan(0);
        expect(r.uretim_birimi).toBe('Ton');
        expect(r.fiyat).toBeGreaterThan(0);
        expect(r.fiyat_birimi).toBe('TL/Kg');
        expect(r.marj_hesaplanabilir).toBe(true);
        expect(r.taorba2008_2).toBeDefined();
        expect(r.cpa2008).toBeDefined();
      });

      const kpis = computeKPIs(records);
      expect(kpis.toplamUretimAdet).toBe(10);
      expect(kpis.toplamGelirTL).toBeGreaterThan(0);
      expect(kpis.toplamMaliyetTL).toBeGreaterThan(0);
      expect(kpis.toplamBrutMarjTL).toBeGreaterThan(0);
    });
  });

});
