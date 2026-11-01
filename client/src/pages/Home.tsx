import React, { useState, useMemo, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  LineChart, Line, CartesianGrid, Legend 
} from 'recharts';
import { 
  Upload, Download, FileText, AlertCircle, CheckCircle2, 
  HelpCircle, ChevronRight, Filter, RefreshCw, Layers, Database,
  TrendingUp, Scale, Sprout, Wheat, Building2
} from 'lucide-react';
import { 
  TarimRecord, SektorType, parseAndValidateCSV, 
  computeKPIs, generateCSVTemplate, exportRecordsToCSV 
} from '../lib/analysis.ts';
import { sourceCatalog } from '../data/sourceCatalog.ts';

const STORAGE_KEY = 'tarimviz_user_records_v1';

export const Home: React.FC = () => {
  // State
  const [records, setRecords] = useState<TarimRecord[]>([]);
  const [selectedSektor, setSelectedSektor] = useState<'all' | SektorType>('all');
  const [selectedIl, setSelectedIl] = useState<string>('all');
  const [selectedYil, setSelectedYil] = useState<string>('all');
  const [selectedUrun, setSelectedUrun] = useState<string>('all');
  const [validationAlert, setValidationAlert] = useState<{ errors: string[]; warnings: string[] } | null>(null);
  const [activeCatalogModal, setActiveCatalogModal] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'table' | 'sources'>('overview');

  // Tarayıcı yerel depolamasından (localStorage) kayıtları yükleme
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRecords(parsed);
        }
      }
    } catch (e) {
      console.error('LocalStorage okuma hatası:', e);
    }
  }, []);

  // Kayıtlar değiştikçe localStorage'a kaydetme
  const saveRecords = (newRecords: TarimRecord[]) => {
    setRecords(newRecords);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newRecords));
    } catch (e) {
      console.error('LocalStorage yazma hatası:', e);
    }
  };

  // CSV Yükleme İşleyicisi
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const res = parseAndValidateCSV(text);

      if (res.valid) {
        saveRecords(res.records);
        setValidationAlert({
          errors: [],
          warnings: res.warnings
        });
      } else {
        setValidationAlert({
          errors: res.errors,
          warnings: res.warnings
        });
      }
    };
    reader.readAsText(file, 'utf-8');
    event.target.value = '';
  };

  // Veriyi Sıfırlama
  const handleClearData = () => {
    if (confirm('Yüklenen tüm verileri temizlemek istediğinize emin misiniz?')) {
      setRecords([]);
      localStorage.removeItem(STORAGE_KEY);
      setValidationAlert(null);
    }
  };

  // Şablon İndirme
  const handleDownloadTemplate = () => {
    const template = generateCSVTemplate();
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'tarimviz_veri_sablonu.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Mevcut Veriyi Dışa Aktarma
  const handleExportData = () => {
    if (filteredRecords.length === 0) return;
    const csvStr = exportRecordsToCSV(filteredRecords);
    const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `tarimviz_analiz_${selectedIl}_${selectedYil}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Benzersiz Filtre Seçenekleri
  const availableIller = useMemo(() => {
    const set = new Set(records.map(r => r.il));
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'tr'));
  }, [records]);

  const availableYillar = useMemo(() => {
    const set = new Set(records.map(r => r.yil));
    return Array.from(set).sort((a, b) => b - a);
  }, [records]);

  const availableUrunler = useMemo(() => {
    let subset = records;
    if (selectedSektor !== 'all') {
      subset = subset.filter(r => r.sektor === selectedSektor);
    }
    const set = new Set(subset.map(r => r.urun));
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'tr'));
  }, [records, selectedSektor]);

  // Filtrelenmiş Kayıtlar
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      if (selectedSektor !== 'all' && r.sektor !== selectedSektor) return false;
      if (selectedIl !== 'all' && r.il !== selectedIl) return false;
      if (selectedYil !== 'all' && r.yil !== parseInt(selectedYil, 10)) return false;
      if (selectedUrun !== 'all' && r.urun !== selectedUrun) return false;
      return true;
    });
  }, [records, selectedSektor, selectedIl, selectedYil, selectedUrun]);

  // KPI Hesaplamaları
  const kpis = useMemo(() => computeKPIs(filteredRecords), [filteredRecords]);

  // İl Karşılaştırma Grafiği Verisi (En yüksek üretim veya gelir hacmine göre)
  const ilBarChartData = useMemo(() => {
    const map: Record<string, { il: string; gelir: number; maliyet: number; marj: number; count: number }> = {};
    
    filteredRecords.forEach(r => {
      if (!map[r.il]) {
        map[r.il] = { il: r.il, gelir: 0, maliyet: 0, marj: 0, count: 0 };
      }
      if (r.hesaplanan_gelir_tl) map[r.il].gelir += r.hesaplanan_gelir_tl;
      if (r.toplam_maliyet_tl && r.maliyet_durumu === 'gerceklesen') map[r.il].maliyet += r.toplam_maliyet_tl;
      if (r.hesaplanan_brut_marj_tl) map[r.il].marj += r.hesaplanan_brut_marj_tl;
      map[r.il].count++;
    });

    return Object.values(map)
      .sort((a, b) => b.gelir - a.gelir)
      .slice(0, 10);
  }, [filteredRecords]);

  // Yıllık Eğilim Grafiği Verisi
  const yearlyTrendData = useMemo(() => {
    const map: Record<number, { yil: string; gelir: number; maliyet: number; marj: number; recordCount: number }> = {};
    filteredRecords.forEach(r => {
      if (!map[r.yil]) {
        map[r.yil] = { yil: r.yil.toString(), gelir: 0, maliyet: 0, marj: 0, recordCount: 0 };
      }
      if (r.hesaplanan_gelir_tl) map[r.yil].gelir += r.hesaplanan_gelir_tl;
      if (r.toplam_maliyet_tl && r.maliyet_durumu === 'gerceklesen') map[r.yil].maliyet += r.toplam_maliyet_tl;
      if (r.hesaplanan_brut_marj_tl) map[r.yil].marj += r.hesaplanan_brut_marj_tl;
      map[r.yil].recordCount++;
    });

    return Object.values(map).sort((a, b) => parseInt(a.yil) - parseInt(b.yil));
  }, [filteredRecords]);

  // Para Biçimlendirme
  const formatTL = (val: number | null): string => {
    if (val === null || val === undefined) return 'Hesaplanamadı';
    if (Math.abs(val) >= 1_000_000_000) {
      return `${(val / 1_000_000_000).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Milyar ₺`;
    }
    if (Math.abs(val) >= 1_000_000) {
      return `${(val / 1_000_000).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Milyon ₺`;
    }
    return `${val.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺`;
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#FBF9F4] text-[#1C2418]">
      
      {/* Sol Sabit Gezinme Rayı (Narrow Navigation Rail) */}
      <aside className="w-16 md:w-60 bg-[#1C2418] text-[#F0EDE4] flex flex-col justify-between border-r border-[#D8D2C2] z-20 shrink-0">
        <div>
          {/* Logo / Wordmark */}
          <div className="h-16 flex items-center px-4 border-b border-white/10 gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#5B6B32] flex items-center justify-center text-white font-bold shrink-0 shadow-sm border border-white/20">
              <Sprout className="w-5 h-5 text-[#FBF9F4]" />
            </div>
            <div className="hidden md:block">
              <div className="font-bold text-base tracking-wide text-white leading-none">TarımViz</div>
              <div className="text-[11px] text-[#D8D2C2] mt-0.5">Anadolu Veri Atlası</div>
            </div>
          </div>

          {/* Menü Öğeleri */}
          <nav className="p-2 space-y-1 mt-3">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'overview' 
                  ? 'bg-[#5B6B32] text-white shadow-sm' 
                  : 'text-[#D8D2C2] hover:bg-white/5 hover:text-white'
              }`}
              title="Gösterge Paneli"
            >
              <TrendingUp className="w-5 h-5 shrink-0" />
              <span className="hidden md:inline">Analiz Panosu</span>
            </button>

            <button
              onClick={() => setActiveTab('table')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'table' 
                  ? 'bg-[#5B6B32] text-white shadow-sm' 
                  : 'text-[#D8D2C2] hover:bg-white/5 hover:text-white'
              }`}
              title="Ayrıntı Tablosu"
            >
              <Layers className="w-5 h-5 shrink-0" />
              <span className="hidden md:inline">Veri Çizelgesi</span>
            </button>

            <button
              onClick={() => setActiveTab('sources')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'sources' 
                  ? 'bg-[#5B6B32] text-white shadow-sm' 
                  : 'text-[#D8D2C2] hover:bg-white/5 hover:text-white'
              }`}
              title="Resmî Kaynak Kataloğu"
            >
              <Database className="w-5 h-5 shrink-0" />
              <span className="hidden md:inline">TÜİK Kaynakları</span>
            </button>
          </nav>
        </div>

        {/* Alt Bilgi & Veri Yükleme Durumu */}
        <div className="p-3 border-t border-white/10 hidden md:block">
          <div className="text-xs text-[#D8D2C2] mb-1 font-semibold">Yerel Depolama</div>
          <div className="text-[11px] text-[#A6AC9A] leading-relaxed">
            {records.length > 0 
              ? `${records.length} kayıt bu tarayıcıda saklanıyor.` 
              : 'Henüz veri yüklenmedi.'}
          </div>
          <div className="mt-2 text-[10px] text-[#7E8870]">
            Veriler sunucuya gönderilmez, cihazınızda işlenir.
          </div>
        </div>
      </aside>

      {/* Ana Çalışma Alanı */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Üst Kapsam ve Filtre Şeridi */}
        <header className="bg-white border-b border-[#D8D2C2] px-6 py-3.5 z-10 shrink-0">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Sol: Sektör ve Başlık */}
            <div className="flex items-center gap-3">
              <div className="flex bg-[#F0EDE4] p-1 rounded-lg border border-[#D8D2C2]">
                <button
                  onClick={() => setSelectedSektor('all')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                    selectedSektor === 'all' 
                      ? 'bg-white text-[#1C2418] shadow-sm' 
                      : 'text-[#6B7260] hover:text-[#1C2418]'
                  }`}
                >
                  Tüm Sektörler
                </button>
                <button
                  onClick={() => setSelectedSektor('bitkisel')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                    selectedSektor === 'bitkisel' 
                      ? 'bg-[#5B6B32] text-white shadow-sm' 
                      : 'text-[#6B7260] hover:text-[#1C2418]'
                  }`}
                >
                  <Wheat className="w-3.5 h-3.5" /> Bitkisel
                </button>
                <button
                  onClick={() => setSelectedSektor('hayvansal')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                    selectedSektor === 'hayvansal' 
                      ? 'bg-[#C47A3A] text-white shadow-sm' 
                      : 'text-[#6B7260] hover:text-[#1C2418]'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" /> Hayvansal
                </button>
              </div>

              <div className="h-5 w-px bg-[#D8D2C2] hidden sm:block" />

              <span className="text-xs text-[#6B7260] font-medium hidden sm:inline">
                Coğrafya: <strong className="text-[#1C2418]">İl / İBBS-3</strong>
              </span>
            </div>

            {/* Sağ: Veri İçe/Dışa Aktarma Aksiyonları */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={handleDownloadTemplate}
                className="px-3 py-1.5 text-xs font-semibold text-[#5B6B32] bg-[#EFF2E6] hover:bg-[#E3E8D3] border border-[#BDC8A3] rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
                title="TÜİK eşleştirme CSV şablonunu indirin"
              >
                <Download className="w-3.5 h-3.5" /> Şablon İndir
              </button>

              <label className="px-3 py-1.5 text-xs font-semibold text-white bg-[#5B6B32] hover:bg-[#4E5C2A] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs">
                <Upload className="w-3.5 h-3.5" /> TÜİK CSV İçe Aktar
                <input
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>

              {records.length > 0 && (
                <>
                  <button
                    onClick={handleExportData}
                    className="px-3 py-1.5 text-xs font-semibold text-[#1C2418] bg-white hover:bg-[#F0EDE4] border border-[#D8D2C2] rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
                    title="Filtrelenmiş analizi CSV olarak dışa aktar"
                  >
                    <FileText className="w-3.5 h-3.5" /> Dışa Aktar
                  </button>
                  <button
                    onClick={handleClearData}
                    className="p-1.5 text-xs text-[#A6AC9A] hover:text-red-600 rounded-lg transition-colors"
                    title="Yüklü verileri temizle"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* İkincil Filtre Şeridi (İl, Yıl, Ürün) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 pt-3 border-t border-[#F0EDE4]">
            {/* İl Filtresi */}
            <div>
              <label className="block text-[11px] font-bold text-[#6B7260] uppercase mb-1">
                İl / İBBS-3 Seçimi
              </label>
              <select
                value={selectedIl}
                onChange={(e) => setSelectedIl(e.target.value)}
                disabled={records.length === 0}
                className="w-full text-xs bg-white border border-[#D8D2C2] rounded-md px-2.5 py-1.5 outline-none focus:border-[#5B6B32] disabled:bg-[#F0EDE4] disabled:text-[#A6AC9A]"
              >
                <option value="all">Tüm İller ({availableIller.length})</option>
                {availableIller.map(il => (
                  <option key={il} value={il}>{il}</option>
                ))}
              </select>
            </div>

            {/* Yıl Filtresi */}
            <div>
              <label className="block text-[11px] font-bold text-[#6B7260] uppercase mb-1">
                Yıl
              </label>
              <select
                value={selectedYil}
                onChange={(e) => setSelectedYil(e.target.value)}
                disabled={records.length === 0}
                className="w-full text-xs bg-white border border-[#D8D2C2] rounded-md px-2.5 py-1.5 outline-none focus:border-[#5B6B32] disabled:bg-[#F0EDE4] disabled:text-[#A6AC9A]"
              >
                <option value="all">Tüm Yıllar ({availableYillar.length})</option>
                {availableYillar.map(yil => (
                  <option key={yil} value={yil}>{yil}</option>
                ))}
              </select>
            </div>

            {/* Ürün Filtresi */}
            <div>
              <label className="block text-[11px] font-bold text-[#6B7260] uppercase mb-1">
                Ürün / Hayvan Türü
              </label>
              <select
                value={selectedUrun}
                onChange={(e) => setSelectedUrun(e.target.value)}
                disabled={records.length === 0}
                className="w-full text-xs bg-white border border-[#D8D2C2] rounded-md px-2.5 py-1.5 outline-none focus:border-[#5B6B32] disabled:bg-[#F0EDE4] disabled:text-[#A6AC9A]"
              >
                <option value="all">Tüm Ürünler ({availableUrunler.length})</option>
                {availableUrunler.map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>
        </header>

        {/* İçerik Alanı */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          
          {/* Doğrulama / Uyarı Mesajları */}
          {validationAlert && (validationAlert.errors.length > 0 || validationAlert.warnings.length > 0) && (
            <div className={`p-4 rounded-xl border ${
              validationAlert.errors.length > 0 ? 'bg-red-50 border-red-200 text-red-900' : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}>
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  {validationAlert.errors.map((err, i) => (
                    <div key={i} className="font-semibold">{err}</div>
                  ))}
                  {validationAlert.warnings.slice(0, 3).map((warn, i) => (
                    <div key={i} className="text-amber-800">{warn}</div>
                  ))}
                  {validationAlert.warnings.length > 3 && (
                    <div className="text-[11px] text-amber-700 italic">...ve {validationAlert.warnings.length - 3} uyarı daha.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SIFIR DURUM (EMPTY STATE) - Kullanıcı henüz CSV yüklememişse */}
          {records.length === 0 ? (
            <div className="max-w-3xl mx-auto py-12 px-6 bg-white border border-[#D8D2C2] rounded-2xl shadow-sm text-center space-y-6">
              <div className="w-16 h-16 bg-[#EFF2E6] text-[#5B6B32] rounded-2xl flex items-center justify-center mx-auto border border-[#BDC8A3]">
                <Wheat className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-[#1C2418]">
                  TarımViz: Anadolu Tarım ve Hayvancılık Veri Atlası
                </h3>
                <p className="text-sm text-[#6B7260] max-w-xl mx-auto mt-2 leading-relaxed">
                  Bu sistem, ölçülmemiş hayali tahminler yerine <strong>doğrulanabilir resmî verileri</strong> esas alır. 
                  Analize başlamak için lütfen TÜİK portalından indirdiğiniz veya hazırladığınız analiz CSV dosyasını içe aktarınız.
                </p>
              </div>

              {/* Kurallar ve Kısıtlar Bildirimi */}
              <div className="bg-[#FBF9F4] border border-[#D8D2C2] rounded-xl p-4 text-left max-w-xl mx-auto text-xs space-y-2 text-[#6B7260]">
                <div className="font-bold text-[#1C2418] flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-[#5B6B32]" />
                  Veri ve Hesaplama İlkeleri
                </div>
                <ul className="list-disc list-inside space-y-1 leading-relaxed">
                  <li><strong>Yalnızca İl veya İBBS-3:</strong> İlçe verileri kabul edilmez, ile toplulaştırılmış olmalıdır.</li>
                  <li><strong>Gelir Hesabı:</strong> Üretim miktarıyla uyumlu birim TL fiyatı varsa hesaplanır.</li>
                  <li><strong>Brüt Marj Güvencesi:</strong> Eksik maliyet 0 TL kabul edilmez; tahmini değil, yalnızca <em>gerçekleşen</em> maliyetle marj hesaplanır.</li>
                  <li><strong>Veri Güvenliği:</strong> Yüklenen dosya sunuculara gitmez, tarayıcınızın yerel depolama alanında saklanır.</li>
                </ul>
              </div>

              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <button
                  onClick={handleDownloadTemplate}
                  className="px-4 py-2.5 text-xs font-bold text-[#5B6B32] bg-[#EFF2E6] hover:bg-[#E3E8D3] border border-[#BDC8A3] rounded-lg transition-all flex items-center gap-2 shadow-2xs"
                >
                  <Download className="w-4 h-4" /> Eşleştirme Şablonunu İndir
                </button>
                <label className="px-5 py-2.5 text-xs font-bold text-white bg-[#5B6B32] hover:bg-[#4E5C2A] rounded-lg transition-all flex items-center gap-2 cursor-pointer shadow-md">
                  <Upload className="w-4 h-4" /> CSV Dosyası Yükle
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>
            </div>
          ) : (
            <>
              {/* TAB 1: ANALİZ PANOSU (OVERVIEW) */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  
                  {/* KPI Kartları (Gelir, Maliyet, Brüt Marj) */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    
                    {/* Toplam Gelir */}
                    <div className="atlas-card atlas-card-copper p-5 rounded-xl">
                      <div className="flex items-center justify-between text-xs font-bold text-[#925320] uppercase tracking-wider">
                        <span>Toplam Ürün Geliri</span>
                        <span className="atlas-badge atlas-badge-copper">
                          {kpis.gelirKapsananUrunSayisi} / {kpis.toplamKayitSayisi} Ürün
                        </span>
                      </div>
                      <div className="text-2xl lg:text-3xl font-extrabold text-[#1C2418] mt-2 tabular-numbers">
                        {formatTL(kpis.toplamGelirTL)}
                      </div>
                      <p className="text-[11px] text-[#6B7260] mt-2 leading-relaxed">
                        Yalnızca üretim miktarıyla uyumlu birim TL satış fiyatı olan kayıtların toplamıdır.
                      </p>
                    </div>

                    {/* Toplam Gerçekleşen Maliyet */}
                    <div className="atlas-card p-5 rounded-xl border-l-4 border-l-[#6B7260]">
                      <div className="flex items-center justify-between text-xs font-bold text-[#6B7260] uppercase tracking-wider">
                        <span>Ölçülen Doğrudan Maliyet</span>
                        <span className="atlas-badge">
                          {kpis.maliyetKapsananUrunSayisi} / {kpis.toplamKayitSayisi} Kalem
                        </span>
                      </div>
                      <div className="text-2xl lg:text-3xl font-extrabold text-[#1C2418] mt-2 tabular-numbers">
                        {formatTL(kpis.toplamMaliyetTL)}
                      </div>
                      <p className="text-[11px] text-[#6B7260] mt-2 leading-relaxed">
                        Yalnızca kullanıcının gerçekleşen/ölçülmüş olarak beyan ettiği maliyetlerdir (tahminler hariçtir).
                      </p>
                    </div>

                    {/* Brüt Marj (Katma Değer) */}
                    <div className="atlas-card atlas-card-olive p-5 rounded-xl">
                      <div className="flex items-center justify-between text-xs font-bold text-[#404E20] uppercase tracking-wider">
                        <span>Hesaplanan Brüt Marj</span>
                        <span className="atlas-badge atlas-badge-olive">
                          {kpis.marjKapsananUrunSayisi} Ürün Uygun
                        </span>
                      </div>
                      <div className={`text-2xl lg:text-3xl font-extrabold mt-2 tabular-numbers ${
                        (kpis.toplamBrutMarjTL ?? 0) >= 0 ? 'text-[#5B6B32]' : 'text-red-700'
                      }`}>
                        {formatTL(kpis.toplamBrutMarjTL)}
                      </div>
                      <p className="text-[11px] text-[#6B7260] mt-2 leading-relaxed">
                        Geliri ve gerçekleşen maliyeti eksiksiz olan ürünlerin (Gelir - Maliyet) net farkıdır.
                      </p>
                    </div>
                  </div>

                  {/* Grafikler Bölümü */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* İl Karşılaştırma Çubuk Grafiği */}
                    <div className="atlas-card p-5 rounded-xl">
                      <div className="flex items-center justify-between mb-4 border-b border-[#F0EDE4] pb-3">
                        <div>
                          <h4 className="font-bold text-sm text-[#1C2418]">İller Arası Karşılaştırma</h4>
                          <p className="text-xs text-[#6B7260]">Gelir ve maliyet hacmi en yüksek iller (İlk 10)</p>
                        </div>
                        <span className="text-[11px] font-semibold text-[#5B6B32] bg-[#EFF2E6] px-2 py-0.5 rounded">
                          TL Hacmi
                        </span>
                      </div>

                      {ilBarChartData.length === 0 ? (
                        <div className="h-64 flex items-center justify-center text-xs text-[#A6AC9A]">
                          Gelir veya maliyet verisi bulunan il eşleşmesi yok.
                        </div>
                      ) : (
                        <div className="h-72">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={ilBarChartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#F0EDE4" />
                              <XAxis dataKey="il" tick={{ fontSize: 11 }} interval={0} angle={-25} textAnchor="end" />
                              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}M`} />
                              <Tooltip 
                                formatter={(value: any) => [`${Number(value).toLocaleString('tr-TR')} ₺`]}
                                contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#D8D2C2', fontSize: '12px' }}
                              />
                              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                              <Bar dataKey="gelir" name="Gelir (TL)" fill="#C47A3A" radius={[4, 4, 0, 0]} />
                              <Bar dataKey="maliyet" name="Gerçekleşen Maliyet (TL)" fill="#6B7260" radius={[4, 4, 0, 0]} />
                              <Bar dataKey="marj" name="Brüt Marj (TL)" fill="#5B6B32" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </div>

                    {/* Yıllık Eğilim Grafiği */}
                    <div className="atlas-card p-5 rounded-xl">
                      <div className="flex items-center justify-between mb-4 border-b border-[#F0EDE4] pb-3">
                        <div>
                          <h4 className="font-bold text-sm text-[#1C2418]">Yıllık Gelişim Eğilimi</h4>
                          <p className="text-xs text-[#6B7260]">Yıllar itibarıyla toplam gelir ve brüt marj seyri</p>
                        </div>
                        <span className="text-[11px] font-semibold text-[#C47A3A] bg-[#FBF1E8] px-2 py-0.5 rounded">
                          Yıllık Seri
                        </span>
                      </div>

                      {yearlyTrendData.length === 0 ? (
                        <div className="h-64 flex items-center justify-center text-xs text-[#A6AC9A]">
                          Zaman serisi grafiği için yeterli yıllık veri bulunmuyor.
                        </div>
                      ) : (
                        <div className="h-72">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={yearlyTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#F0EDE4" />
                              <XAxis dataKey="yil" tick={{ fontSize: 11 }} />
                              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}M`} />
                              <Tooltip 
                                formatter={(value: any) => [`${Number(value).toLocaleString('tr-TR')} ₺`]}
                                contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#D8D2C2', fontSize: '12px' }}
                              />
                              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                              <Line type="monotone" dataKey="gelir" name="Gelir (TL)" stroke="#C47A3A" strokeWidth={2.5} dot={{ r: 4 }} />
                              <Line type="monotone" dataKey="maliyet" name="Maliyet (TL)" stroke="#6B7260" strokeWidth={2} dot={{ r: 3 }} />
                              <Line type="monotone" dataKey="marj" name="Brüt Marj (TL)" stroke="#5B6B32" strokeWidth={2.5} dot={{ r: 4 }} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Metodolojik Dipnot Bildirimi */}
                  <div className="p-4 rounded-xl bg-[#F0EDE4] border border-[#D8D2C2] text-xs text-[#6B7260] space-y-1">
                    <div className="font-bold text-[#1C2418]">Denetlenebilirlik ve Sorumluluk Notu:</div>
                    <p>
                      Gösterilen değerler kullanıcının TÜİK portalından indirerek eşleştirdiği CSV beyanına dayanır.
                      Uygulama bu verileri harici doğrulamadan geçirmez veya kendiğinden gerçek TÜİK verisi olarak tasdik etmez.
                      Maliyeti belirtilmemiş ürünlerde marj hesaplanmaz, sıfır maliyet varsayımı yapılmaz.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 2: AYRINTILI VERİ TABLOSU */}
              {activeTab === 'table' && (
                <div className="atlas-card rounded-xl overflow-hidden">
                  <div className="p-4 border-b border-[#D8D2C2] flex flex-wrap justify-between items-center gap-3 bg-[#F0EDE4]/50">
                    <div>
                      <h4 className="font-bold text-sm text-[#1C2418]">Kayıt Düzeyi Analiz Tablosu</h4>
                      <p className="text-xs text-[#6B7260]">
                        Toplam {filteredRecords.length} kayıt listeleniyor.
                      </p>
                    </div>

                    <button
                      onClick={handleExportData}
                      className="px-3 py-1.5 text-xs font-semibold text-[#1C2418] bg-white border border-[#D8D2C2] rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-2xs"
                    >
                      <Download className="w-3.5 h-3.5" /> CSV İndir
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-[#F0EDE4] text-[#1C2418] uppercase tracking-wider font-bold border-b border-[#D8D2C2]">
                        <tr>
                          <th className="px-4 py-3">İl</th>
                          <th className="px-3 py-3">Yıl</th>
                          <th className="px-3 py-3">Sektör</th>
                          <th className="px-4 py-3">Ürün / Tür</th>
                          <th className="px-4 py-3 text-right">Üretim Miktarı</th>
                          <th className="px-3 py-3">Birim</th>
                          <th className="px-4 py-3 text-right">Birim Fiyat</th>
                          <th className="px-4 py-3 text-right">Hesaplanan Gelir</th>
                          <th className="px-4 py-3 text-right">Maliyet (TL)</th>
                          <th className="px-4 py-3 text-right">Brüt Marj</th>
                          <th className="px-3 py-3">Kaynak</th>
                          <th className="px-3 py-3">Coğrafya</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#D8D2C2] bg-white">
                        {filteredRecords.map((r) => (
                          <tr key={r.id} className="hover:bg-[#FBF9F4] transition-colors">
                            <td className="px-4 py-3 font-bold text-[#1C2418]">{r.il}</td>
                            <td className="px-3 py-3 tabular-numbers text-[#6B7260]">{r.yil}</td>
                            <td className="px-3 py-3">
                              <span className={`atlas-badge ${r.sektor === 'bitkisel' ? 'atlas-badge-olive' : 'atlas-badge-copper'}`}>
                                {r.sektor}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-medium text-[#1C2418]">{r.urun}</td>
                            <td className="px-4 py-3 text-right tabular-numbers font-semibold">
                              {r.uretim_miktari.toLocaleString('tr-TR')}
                            </td>
                            <td className="px-3 py-3 text-[#6B7260]">{r.uretim_birimi}</td>
                            <td className="px-4 py-3 text-right tabular-numbers">
                              {r.fiyat !== undefined ? `${r.fiyat.toLocaleString('tr-TR')} ${r.fiyat_birimi || 'TL'}` : '-'}
                            </td>
                            <td className="px-4 py-3 text-right tabular-numbers font-bold text-[#C47A3A]">
                              {r.hesaplanan_gelir_tl !== undefined ? `${r.hesaplanan_gelir_tl.toLocaleString('tr-TR')} ₺` : '-'}
                            </td>
                            <td className="px-4 py-3 text-right tabular-numbers">
                              {r.toplam_maliyet_tl !== undefined ? (
                                <div>
                                  <span className="font-medium text-[#1C2418]">{r.toplam_maliyet_tl.toLocaleString('tr-TR')} ₺</span>
                                  <span className="block text-[10px] text-[#6B7260] font-normal">{r.maliyet_durumu}</span>
                                </div>
                              ) : '-'}
                            </td>
                            <td className="px-4 py-3 text-right tabular-numbers">
                              {r.marj_hesaplanabilir && r.hesaplanan_brut_marj_tl !== undefined ? (
                                <span className={`font-bold ${r.hesaplanan_brut_marj_tl >= 0 ? 'text-[#5B6B32]' : 'text-red-700'}`}>
                                  {r.hesaplanan_brut_marj_tl.toLocaleString('tr-TR')} ₺
                                </span>
                              ) : (
                                <span className="text-[10px] text-[#A6AC9A] italic" title={r.marj_engeli_sebebi}>
                                  Hesaplanamadı
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-3 text-[11px] text-[#6B7260] truncate max-w-[120px]" title={r.kaynak}>
                              {r.kaynak}
                            </td>
                            <td className="px-3 py-3 text-[11px] text-[#6B7260]">
                              {r.cografi_duzey}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 3: RESMÎ TÜİK KAYNAK KATALOĞU */}
              {activeTab === 'sources' && (
                <div className="space-y-6">
                  <div className="atlas-card p-6 rounded-xl border-l-4 border-l-[#5B6B32]">
                    <h3 className="text-lg font-bold text-[#1C2418]">TÜİK Resmî Veri Kaynakları ve Metadata</h3>
                    <p className="text-xs text-[#6B7260] mt-1">
                      TarımViz sisteminde eşleştirme amacıyla kullanılan resmî veri serileri ve teknik kısıtlar.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sourceCatalog.map((src) => (
                      <div key={src.id} className="atlas-card p-5 rounded-xl space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-[#5B6B32] tracking-wider block">
                              {src.institution}
                            </span>
                            <h4 className="font-bold text-sm text-[#1C2418]">{src.name}</h4>
                          </div>
                          {src.sdmxAvailable && (
                            <span className="atlas-badge text-[10px]">SDMX Destekli</span>
                          )}
                        </div>

                        <p className="text-xs text-[#6B7260] leading-relaxed">
                          {src.description}
                        </p>

                        <div className="pt-2 border-t border-[#F0EDE4] grid grid-cols-2 gap-2 text-[11px] text-[#6B7260]">
                          <div><strong>Sıklık:</strong> {src.frequency}</div>
                          <div><strong>Kapsam:</strong> {src.coverage}</div>
                        </div>

                        <div className="p-2.5 rounded-lg bg-[#FBF9F4] border border-[#D8D2C2] text-[11px] text-[#6B7260] italic">
                          <strong>Kısıt / Not:</strong> {src.notes}
                        </div>

                        <div className="pt-1">
                          <a
                            href={src.officialUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-semibold text-[#5B6B32] hover:underline inline-flex items-center gap-1"
                          >
                            Resmî Portala Git <ChevronRight className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

        </main>
      </div>

    </div>
  );
};
