# TarımViz — Geliştirme Yol Haritası (TODO.md)

## [x] Tamamlanan Görevler
- [x] React 19, TypeScript, Vite ve Tailwind v4 altyapısının kurulması.
- [x] CSV şeması ayrıştırıcı (`parseAndValidateCSV`) ve zorunlu/isteğe bağlı sütun denetimleri.
- [x] Coğrafi düzey kısıtı: Yalnızca "İl" ve "İBBS Düzey 3" doğrulaması.
- [x] Gelir hesaplama (`calculateRevenue`) ve birim uyumluluk mantığı (Ton, Kg, Litre dönüşümleri).
- [x] Brüt marj koruması (`evaluateGrossMargin`): Eksik maliyeti 0 TL saymama ve yalnızca "gerceklesen" maliyetlerle hesaplama.
- [x] 12 adet kapsamlı regresyon ve birim testi (`analysis.test.ts`).
- [x] Anadolu Veri Atlası tasarım sistemi: Toprak ve zeytin atlası renkleri (`#5B6B32`, `#C47A3A`, `#FBF9F4`), Noto Sans tipografisi, dar gezinme rayı.
- [x] Sektör (Bitkisel/Hayvansal), İl, Yıl ve Ürün filtreleme şeritleri.
- [x] Recharts ile İl Karşılaştırma Çubuk Grafiği ve Yıllık Eğilim Çizgi Grafiği.
- [x] TÜİK Resmî Kaynak Kataloğu (`sourceCatalog.ts`) ve metadata paneli.
- [x] Boş durum (Empty State) karşılama ekranı (ölçülmemiş sahte veri göstermeme ilkesi).
- [x] CSV şablonu indirme ve analiz sonuçlarını CSV olarak dışa aktarma.
- [x] Tarayıcı yerel depolama (`localStorage`) entegrasyonu.

## [ ] Gelecek Sürümler (Backlog)
- [ ] İBBS Düzey 1 ve Düzey 2 bölgesel toplulaştırma görünümleri.
- [ ] TÜİK SDMX REST API entegrasyonu için güvenli istemci tarafı API anahtarı girişi ve dataflow sorgulayıcı.
- [ ] Harita modülü (GeoJSON / TopoJSON il bazlı kloroplet harita renklendirmesi).
