import { describe, it, expect } from 'vitest';
import { TUIK_TARIM_TAXONOMY, searchTuikTarimTaxonomy } from './tuikTarimTaxonomy.ts';

describe('TÜİK Veri Portalı Tarım Taksonomisi ve Tablo Ağacı', () => {

  it('1. TÜİK Veri Portalı resmî 8 ana tarımsal teması eksiksiz tanımlı olmalıdır', () => {
    expect(TUIK_TARIM_TAXONOMY.length).toBe(8);
    const themeTitles = TUIK_TARIM_TAXONOMY.map(t => t.baslik);
    
    expect(themeTitles).toContain('Bitkisel Üretim İstatistikleri');
    expect(themeTitles).toContain('Bitkisel Ürün Denge Tabloları');
    expect(themeTitles).toContain('Tarım - Çevre İstatistikleri');
    expect(themeTitles).toContain('Hayvansal Üretim İstatistikleri');
    expect(themeTitles).toContain('Tarımsal Alet ve Makine İstatistikleri');
    expect(themeTitles).toContain('Tarım Ürünleri Üretici Fiyatları ve Üretim Değerleri');
    expect(themeTitles).toContain('Tarımsal İşletme Yapı ve İşgücü Ücret İstatistikleri');
    expect(themeTitles).toContain('Balıkçılık ve Su Ürünleri İstatistikleri');
  });

  it('2. Dokümanda yer alan kritik girdi ve maliyet tabloları bulunmalıdır', () => {
    // Gübre ve İlaç (Tarım-GFE Girdi 1)
    const gubreResults = searchTuikTarimTaxonomy('Kimyasal Gübre Kullanımı');
    expect(gubreResults.length).toBeGreaterThan(0);
    expect(gubreResults[0].baslik).toContain('Kimyasal Gübre Kullanımı');

    const ilacResults = searchTuikTarimTaxonomy('Tarımsal İlaç Kullanımı');
    expect(ilacResults.length).toBeGreaterThan(0);

    // İşgücü Ücreti (Tarım-GFE Girdi 1 İşçilik)
    const isgucuResults = searchTuikTarimTaxonomy('Mevsimlik İşçilere Ödenen');
    expect(isgucuResults.length).toBeGreaterThan(0);

    // Traktör ve Makine (Tarım-GFE Girdi 2 Yatırım)
    const traktorResults = searchTuikTarimTaxonomy('Beygir Gücüne Göre');
    expect(traktorResults.length).toBeGreaterThan(0);
    expect(traktorResults[0].baslik).toContain('Traktör Sayısı (Beygir Gücüne Göre');
  });

  it('3. Ürün denge tabloları (kn=104) ve BÜİ (kn=92) tabloları haritalanmalıdır', () => {
    const dengeResults = searchTuikTarimTaxonomy('Denge Tabloları');
    expect(dengeResults.length).toBeGreaterThanOrEqual(3);

    const buiResults = searchTuikTarimTaxonomy('kn=92');
    expect(buiResults.length).toBeGreaterThan(5);
  });

  it('4. Taksonomi arama motoru büyük/küçük harf duyarsız ve doğru sonuç üretmelidir', () => {
    const sut = searchTuikTarimTaxonomy('çiğ süt');
    expect(sut.length).toBeGreaterThan(0);

    const bos = searchTuikTarimTaxonomy('');
    expect(bos.length).toBe(0);
  });

});
