# TarımViz — Anadolu Tarım ve Hayvancılık Veri Atlası

**TarımViz**, bitkisel ve hayvansal üretim verilerini il, yıl ve ürün/hayvan türüne göre inceleyen; veri bulunabildiği ölçüde gelir, maliyet ve brüt marjı hesaplayan Türkçe analiz masasıdır.

- **Teknoloji Yığını:** React 19, TypeScript, Vite, Recharts, Papaparse, Tailwind CSS (v4).
- **Tasarım Dili:** Anadolu Veri Atlası (Zeytin yeşili `#5B6B32`, Sıcak bakır `#C47A3A`, Keten zemin `#FBF9F4`).

---

## 📌 Temel İlkeler ve Metodolojik Kısıtlar

1. **Ölçülmemiş Değer Gösterilmez:**
   İlk açılışta veya veri eksikliğinde hayali örnek değerler üretilmez; boş durum (empty state) mesajıyla kullanıcı karşılanır.
2. **Kullanıcı Beyanı ve Yerel İşleme:**
   Yüklenen CSV dosyaları harici sunuculara veya ortak veritabanına aktarılmaz; tamamen kullanıcının tarayıcısında (`localStorage`) işlenir.
3. **Coğrafi Düzey Sınırı:**
   Yalnızca `İl` veya `İBBS Düzey 3` kabul edilir. İlçe verileri kabul edilmez (önceden ile toplulaştırılmış olmalıdır).
4. **Gelir Hesabı:**
   Yalnızca üretim miktarı ile uyumlu birim TL satış fiyatı (ÇEGF) varsa hesaplanır.
5. **Brüt Marj Güvencesi:**
   Maliyet eksikliği **asla 0 TL kabul edilmez**. Yalnızca kullanıcı tarafından açıkça `gerceklesen` (doğrudan ölçülmüş) olarak sınıflandırılan maliyetlerle brüt marj hesaplanır; tahmini maliyetler dışarıda bırakılır.
6. **Ulusal Endeksler İl Fiyatı Değildir:**
   TÜİK Tarım-ÜFE ve Tarım-GFE ulusal serileri il ölçümü yerine kullanılamaz.

---

## 📊 CSV İçe Aktarma Şeması

| Sütun Adı | Zorunluluk | Tip | Açıklama |
|---|---|---|---|
| `il` | **Zorunlu** | Metin | 81 ilden biri |
| `yil` | **Zorunlu** | Sayı | Örn: `2025` |
| `sektor` | **Zorunlu** | `bitkisel` \| `hayvansal` | Üretim sektörü |
| `urun` | **Zorunlu** | Metin | Ürün veya hayvan türü |
| `uretim_miktari` | **Zorunlu** | Sayı | Üretim miktarı |
| `uretim_birimi` | **Zorunlu** | Metin | `Ton`, `Kg`, `Litre`, `Adet`, `Baş` |
| `kaynak` | **Zorunlu** | Metin | Örn: `TÜİK Bitkisel Üretim İstatistikleri` |
| `cografi_duzey` | **Zorunlu** | `İl` \| `İBBS Düzey 3` | Coğrafi çözünürlük |
| `fiyat` | İsteğe Bağlı | Sayı | Çiftçi birim satış fiyatı |
| `fiyat_birimi` | İsteğe Bağlı | Metin | `TL/Kg`, `TL/Ton`, `TL/Lt` |
| `toplam_maliyet_tl` | İsteğe Bağlı | Sayı | Toplam üretim maliyeti |
| `maliyet_durumu` | İsteğe Bağlı | `gerceklesen` \| `tahmini` | Maliyet ölçüm niteliği |
| `donem` | İsteğe Bağlı | Metin | Örn: `Yıllık`, `Ekim` |
| `veri_durumu` | İsteğe Bağlı | `kesin` \| `gecici` \| `revize` | İstatistik durumu |

---

## 🚀 Kurulum ve Çalıştırma

```bash
# Bağımlılıkları yükleyin
npm install

# Testleri çalıştırın (Vitest)
npm test

# Geliştirme sunucusunu başlatın
npm run dev

# Üretim derlemesi (Build)
npm run build
```
