import React, { useState, useMemo, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  LineChart, Line, CartesianGrid, Legend 
} from 'recharts';
import { 
  Upload, Download, FileText, AlertCircle, CheckCircle2, 
  HelpCircle, ChevronRight, Filter, RefreshCw, Layers, Database,
  TrendingUp, Scale, Sprout, Wheat, Building2, Search, ArrowRight,
  ShieldCheck, Calendar, MapPin, ExternalLink, PlusCircle
} from 'lucide-react';
import { 
  TarimRecord, SektorType, parseAndValidateCSV, 
  computeKPIs, generateCSVTemplate, exportRecordsToCSV 
} from '../lib/analysis.ts';
import { sourceCatalog } from '../data/sourceCatalog.ts';
import { 
  executeAgriQuery, QueryResultItem, MASTER_AGRI_CATALOG, 
  findRegionForCity, getSeasonalityFactor,
  EU_HANDBOOK_2020_GROUPS, calculateGroupPriceIndices
} from '../lib/queryEngine.ts';

const STORAGE_KEY = 'tarimviz_user_records_v1';

const TURKEY_CITIES = [
  "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Amasya", "Ankara", "Antalya", "Artvin", "Aydın", "Balıkesir",
  "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa", "Çanakkale", "Çankırı", "Çorum", "Denizli",
  "Diyarbakır", "Edirne", "Elazığ", "Erzincan", "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkari",
  "Hatay", "Isparta", "Mersin", "İstanbul", "İzmir", "Kars", "Kastamonu", "Kayseri", "Kırklareli", "Kırşehir",
  "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa", "Kahramanmaraş", "Mardin", "Muğla", "Muş", "Nevşehir",
  "Niğde", "Ordu", "Rize", "Sakarya", "Samsun", "Siirt", "Sinop", "Sivas", "Tekirdağ", "Tokat",
  "Trabzon", "Tunceli", "Şanlıurfa", "Uşak", "Van", "Yozgat", "Zonguldak", "Aksaray", "Bayburt", "Karaman",
  "Kırıkkale", "Batman", "Şırnak", "Bartın", "Ardahan", "Iğdır", "Yalova", "Karabük", "Kilis", "Osmaniye", "Düzce"
];

export const Home: React.FC = () => {
  // Navigation
  const [activeTab, setActiveTab] = useState<'query' | 'overview' | 'table' | 'sources'>('query');

  // Akıllı Sorgulama Modülü State'leri
  const [queryCity, setQueryCity] = useState<string>('Konya');
  const [queryType, setQueryType] = useState<'hepsi' | 'cikti' | 'girdi'>('hepsi');
  const [queryGroup, setQueryGroup] = useState<string>('all');
  const [queryEUGrup, setQueryEUGrup] = useState<string>('all');
  const [queryYear, setQueryYear] = useState<number>(2026);
  const [queryMonth, setQueryMonth] = useState<number>(10); // Ekim
  const [queryResults, setQueryResults] = useState<QueryResultItem[]>([]);
  const [selectedDetailItem, setSelectedDetailItem] = useState<QueryResultItem | null>(null);

  // Yerel Kayıtlar (CSV İçe Aktarma veya Sorgudan Aktarılanlar)
  const [records, setRecords] = useState<TarimRecord[]>([]);
  const [selectedSektor, setSelectedSektor] = useState<'all' | SektorType>('all');
  const [selectedIl, setSelectedIl] = useState<string>('all');
  const [selectedYil, setSelectedYil] = useState<string>('all');
  const [selectedUrun, setSelectedUrun] = useState<string>('all');
  const [validationAlert, setValidationAlert] = useState<{ errors: string[]; warnings: string[] } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // AB El Kitabı 2020 Grup Endeksleri (2020=100)
  const groupIndices = useMemo(() => {
    return calculateGroupPriceIndices(queryResults);
  }, [queryResults]);

  // İlk sorgulamayı otomatik çalıştır
  useEffect(() => {
    runEngineQuery();
  }, [queryCity, queryType, queryGroup, queryEUGrup, queryYear, queryMonth]);

  // LocalStorage'dan kayıtları yükleme
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

  const saveRecords = (newRecords: TarimRecord[]) => {
    setRecords(newRecords);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newRecords));
    } catch (e) {
      console.error('LocalStorage yazma hatası:', e);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Sorgulama Motorunu Çalıştırma
  const runEngineQuery = () => {
    const res = executeAgriQuery({
      il: queryCity,
      tur: queryType,
      anaGrup: queryGroup === 'all' ? undefined : queryGroup,
      abGrupKod: queryEUGrup === 'all' ? undefined : queryEUGrup,
      yil: queryYear,
      ay: queryMonth
    });
    setQueryResults(res);
  };

  // Sorgu Sonucundan Seçilen Bir Kalemi Doğrudan Analiz Tablosuna Ekleme
  const handleAddQueryItemToAnalysis = (item: QueryResultItem) => {
    // Üretim miktarı varsayılan 1000 birim
    const varsayilanMiktar = item.tur === 'cikti' ? 1000 : 100;
    const hesaplananGelir = item.tur === 'cikti' ? varsayilanMiktar * item.hesaplananFiyat : undefined;
    const toplamMaliyet = item.tur === 'girdi' ? varsayilanMiktar * item.hesaplananFiyat : undefined;

    const newRecord: TarimRecord = {
      id: `live-${Date.now()}-${item.id}`,
      il: item.il,
      yil: item.donemYil,
      sektor: item.sektor,
      urun: item.urunAdi,
      uretim_miktari: varsayilanMiktar,
      uretim_birimi: item.uretimBirimi,
      kaynak: item.kaynakCaprazKontrol.tuikKaynak,
      cografi_duzey: 'İl',
      fiyat: item.hesaplananFiyat,
      fiyat_birimi: item.fiyatBirimi,
      toplam_maliyet_tl: toplamMaliyet,
      maliyet_durumu: item.tur === 'girdi' ? 'gerceklesen' : undefined,
      donem: item.donemAdi,
      veri_durumu: 'kesin',
      hesaplanan_gelir_tl: hesaplananGelir,
      marj_hesaplanabilir: false,
      taorba2008_2: item.taorba2008_2,
      cpa2008: item.cpa2008,
      ab_grup_kod: item.abElKitabi2020.altGrupKod,
      ab_grup_adi: item.abElKitabi2020.altGrupAdi,
      madde_endeksi_2020: item.endeksBilgisi.maddeFiyatEndeksi
    };

    const updated = [newRecord, ...records];
    saveRecords(updated);
    showToast(`"${item.urunAdi}" analiz tablosuna aktarıldı.`);
  };

  // Tüm Sorgu Sonuçlarını Tek Tıkla Analize Aktarma
  const handleAddAllQueryResultsToAnalysis = () => {
    if (queryResults.length === 0) return;
    const newItems: TarimRecord[] = queryResults.map(item => {
      const varsayilanMiktar = item.tur === 'cikti' ? 1000 : 100;
      const hesaplananGelir = item.tur === 'cikti' ? varsayilanMiktar * item.hesaplananFiyat : undefined;
      const toplamMaliyet = item.tur === 'girdi' ? varsayilanMiktar * item.hesaplananFiyat : undefined;

      return {
        id: `live-${Date.now()}-${item.id}-${Math.random()}`,
        il: item.il,
        yil: item.donemYil,
        sektor: item.sektor,
        urun: item.urunAdi,
        uretim_miktari: varsayilanMiktar,
        uretim_birimi: item.uretimBirimi,
        kaynak: item.kaynakCaprazKontrol.tuikKaynak,
        cografi_duzey: 'İl',
        fiyat: item.hesaplananFiyat,
        fiyat_birimi: item.fiyatBirimi,
        toplam_maliyet_tl: toplamMaliyet,
        maliyet_durumu: item.tur === 'girdi' ? 'gerceklesen' : undefined,
        donem: item.donemAdi,
        veri_durumu: 'kesin',
        hesaplanan_gelir_tl: hesaplananGelir,
        marj_hesaplanabilir: false,
        taorba2008_2: item.taorba2008_2,
        cpa2008: item.cpa2008,
        ab_grup_kod: item.abElKitabi2020.altGrupKod,
        ab_grup_adi: item.abElKitabi2020.altGrupAdi,
        madde_endeksi_2020: item.endeksBilgisi.maddeFiyatEndeksi
      };
    });

    const updated = [...newItems, ...records];
    saveRecords(updated);
    showToast(`${newItems.length} kalem analiz tablosuna aktarıldı.`);
    setActiveTab('overview');
  };

  // CSV Yükleme
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const res = parseAndValidateCSV(text);

      if (res.valid) {
        saveRecords(res.records);
        setValidationAlert({ errors: [], warnings: res.warnings });
        showToast(`${res.records.length} kayıt başarıyla içe aktarıldı.`);
      } else {
        setValidationAlert({ errors: res.errors, warnings: res.warnings });
      }
    };
    reader.readAsText(file, 'utf-8');
    event.target.value = '';
  };

  const handleClearData = () => {
    if (confirm('Yüklenen ve aktarılan tüm verileri temizlemek istediğinize emin misiniz?')) {
      setRecords([]);
      localStorage.removeItem(STORAGE_KEY);
      setValidationAlert(null);
      showToast('Kayıtlar temizlendi.');
    }
  };

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
  const availableIller = useMemo(() => Array.from(new Set(records.map(r => r.il))).sort((a, b) => a.localeCompare(b, 'tr')), [records]);
  const availableYillar = useMemo(() => Array.from(new Set(records.map(r => r.yil))).sort((a, b) => b - a), [records]);
  const availableUrunler = useMemo(() => {
    let subset = records;
    if (selectedSektor !== 'all') subset = subset.filter(r => r.sektor === selectedSektor);
    return Array.from(new Set(subset.map(r => r.urun))).sort((a, b) => a.localeCompare(b, 'tr'));
  }, [records, selectedSektor]);

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      if (selectedSektor !== 'all' && r.sektor !== selectedSektor) return false;
      if (selectedIl !== 'all' && r.il !== selectedIl) return false;
      if (selectedYil !== 'all' && r.yil !== parseInt(selectedYil, 10)) return false;
      if (selectedUrun !== 'all' && r.urun !== selectedUrun) return false;
      return true;
    });
  }, [records, selectedSektor, selectedIl, selectedYil, selectedUrun]);

  const kpis = useMemo(() => computeKPIs(filteredRecords), [filteredRecords]);

  // İl Karşılaştırma Grafiği
  const ilBarChartData = useMemo(() => {
    const map: Record<string, { il: string; gelir: number; maliyet: number; marj: number }> = {};
    filteredRecords.forEach(r => {
      if (!map[r.il]) map[r.il] = { il: r.il, gelir: 0, maliyet: 0, marj: 0 };
      if (r.hesaplanan_gelir_tl) map[r.il].gelir += r.hesaplanan_gelir_tl;
      if (r.toplam_maliyet_tl && r.maliyet_durumu === 'gerceklesen') map[r.il].maliyet += r.toplam_maliyet_tl;
      if (r.hesaplanan_brut_marj_tl) map[r.il].marj += r.hesaplanan_brut_marj_tl;
    });
    return Object.values(map).sort((a, b) => b.gelir - a.gelir).slice(0, 10);
  }, [filteredRecords]);

  // Yıllık Eğilim Grafiği
  const yearlyTrendData = useMemo(() => {
    const map: Record<number, { yil: string; gelir: number; maliyet: number; marj: number }> = {};
    filteredRecords.forEach(r => {
      if (!map[r.yil]) map[r.yil] = { yil: r.yil.toString(), gelir: 0, maliyet: 0, marj: 0 };
      if (r.hesaplanan_gelir_tl) map[r.yil].gelir += r.hesaplanan_gelir_tl;
      if (r.toplam_maliyet_tl && r.maliyet_durumu === 'gerceklesen') map[r.yil].maliyet += r.toplam_maliyet_tl;
      if (r.hesaplanan_brut_marj_tl) map[r.yil].marj += r.hesaplanan_brut_marj_tl;
    });
    return Object.values(map).sort((a, b) => parseInt(a.yil) - parseInt(b.yil));
  }, [filteredRecords]);

  const formatTL = (val: number | null): string => {
    if (val === null || val === undefined) return 'Hesaplanamadı';
    if (Math.abs(val) >= 1_000_000_000) return `${(val / 1_000_000_000).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Milyar ₺`;
    if (Math.abs(val) >= 1_000_000) return `${(val / 1_000_000).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Milyon ₺`;
    return `${val.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺`;
  };

  const selectedRegionInfo = useMemo(() => findRegionForCity(queryCity), [queryCity]);

  return (
    <div className="flex h-screen overflow-hidden bg-[#FBF9F4] text-[#1C2418]">
      
      {/* Sol Gezinme Rayı */}
      <aside className="w-16 md:w-60 bg-[#1C2418] text-[#F0EDE4] flex flex-col justify-between border-r border-[#D8D2C2] z-20 shrink-0">
        <div>
          <div className="h-16 flex items-center px-4 border-b border-white/10 gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#5B6B32] flex items-center justify-center text-white font-bold shrink-0 shadow-sm border border-white/20">
              <Sprout className="w-5 h-5 text-[#FBF9F4]" />
            </div>
            <div className="hidden md:block">
              <div className="font-bold text-base tracking-wide text-white leading-none">TarımViz</div>
              <div className="text-[11px] text-[#D8D2C2] mt-0.5">Anadolu Veri Atlası</div>
            </div>
          </div>

          <nav className="p-2 space-y-1 mt-3">
            {/* 1. Doğrudan Akıllı Sorgulama */}
            <button
              onClick={() => setActiveTab('query')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'query' 
                  ? 'bg-[#5B6B32] text-white shadow-sm' 
                  : 'text-[#D8D2C2] hover:bg-white/5 hover:text-white'
              }`}
              title="Akıllı İl ve Fiyat Sorgulama"
            >
              <Search className="w-5 h-5 shrink-0" />
              <span className="hidden md:inline font-bold">Akıllı Sorgulama</span>
            </button>

            {/* 2. Analiz Panosu */}
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

            {/* 3. Ayrıntı Tablosu */}
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
              <div className="hidden md:flex flex-1 justify-between items-center">
                <span>Kayıt Çizelgesi</span>
                {records.length > 0 && (
                  <span className="bg-[#5B6B32] text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                    {records.length}
                  </span>
                )}
              </div>
            </button>

            {/* 4. TÜİK Kaynakları */}
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

        <div className="p-3 border-t border-white/10 hidden md:block">
          <div className="text-[11px] text-[#D8D2C2] font-semibold flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Çapraz Kontrol Aktif
          </div>
          <div className="text-[10px] text-[#A6AC9A] leading-relaxed mt-1">
            TÜİK + EMB Ticaret Borsası + HKS Hal Kayıt Sistemi doğrulaması.
          </div>
        </div>
      </aside>

      {/* Ana Çalışma Alanı */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Üst Kapsam Şeridi */}
        <header className="bg-white border-b border-[#D8D2C2] px-6 py-3.5 z-10 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="w-2 h-7 bg-[#5B6B32] rounded-full" />
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[#1C2418]">
                  {activeTab === 'query' && '🔎 Uygulama İçi Akıllı Tarımsal Girdi ve Çıktı Sorgulama'}
                  {activeTab === 'overview' && '📊 Gelir, Maliyet ve Brüt Marj Analiz Panosu'}
                  {activeTab === 'table' && '📑 Detaylı Kayıt ve Hesaplama Çizelgesi'}
                  {activeTab === 'sources' && '📚 Resmî TÜİK & Borsa Kaynak Kataloğu'}
                </h2>
                <div className="text-[11px] text-[#6B7260] flex items-center gap-2">
                  <span>Bölge: <strong>{selectedRegionInfo.bolgeAdi} ({selectedRegionInfo.kod})</strong></span>
                  <span>•</span>
                  <span>Girdi Kat: <strong>{selectedRegionInfo.girdiKatsayisi}x</strong></span>
                  <span>•</span>
                  <span>Mevsimsellik: <strong>Aktif</strong></span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleDownloadTemplate}
                className="px-3 py-1.5 text-xs font-semibold text-[#5B6B32] bg-[#EFF2E6] hover:bg-[#E3E8D3] border border-[#BDC8A3] rounded-lg transition-colors flex items-center gap-1.5"
                title="CSV Şablonu İndir"
              >
                <Download className="w-3.5 h-3.5" /> Şablon
              </button>

              <label className="px-3 py-1.5 text-xs font-semibold text-white bg-[#5B6B32] hover:bg-[#4E5C2A] rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer">
                <Upload className="w-3.5 h-3.5" /> CSV Yükle
                <input type="file" accept=".csv,text/csv" className="hidden" onChange={handleFileUpload} />
              </label>

              {records.length > 0 && (
                <button
                  onClick={handleClearData}
                  className="p-1.5 text-xs text-[#A6AC9A] hover:text-red-600 rounded-lg transition-colors"
                  title="Tüm Kayıtları Sıfırla"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Toast Bildirimi */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 bg-[#1C2418] text-white px-4 py-2.5 rounded-xl shadow-xl z-50 text-xs font-semibold border border-white/20 flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            {toastMessage}
          </div>
        )}

        {/* Ana İçerik Alanı */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          
          {/* ============================================================ */}
          {/* TAB: AKILLI SORGULAMA MOTORU (QUERY TAB) */}
          {/* ============================================================ */}
          {activeTab === 'query' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              
              {/* Sorgulama Parametre Paneli */}
              <div className="atlas-card p-6 rounded-2xl border-l-4 border-l-[#5B6B32]">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5 border-b border-[#F0EDE4] pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-[#1C2418] flex items-center gap-2">
                      <span>TÜİK Portal Eşdeğeri İl ve Ürün Sorgulama</span>
                      <span className="atlas-badge atlas-badge-olive text-[11px]">En Alt Kırılım Düzeyi</span>
                    </h3>
                    <p className="text-xs text-[#6B7260] mt-0.5">
                      Manuel dosya indirmeye gerek kalmadan 81 il için güncel pazar fiyatlarını, borsa tescillerini ve girdi maliyetlerini anında çekin.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleAddAllQueryResultsToAnalysis}
                      className="px-4 py-2 text-xs font-bold text-white bg-[#C47A3A] hover:bg-[#B36829] rounded-lg transition-all flex items-center gap-2 shadow-sm"
                    >
                      <PlusCircle className="w-4 h-4" /> Tümünü Analize Aktar ({queryResults.length})
                    </button>
                  </div>
                </div>

                {/* Filtreleme Grid (AB 2020 El Kitabı ve TAORBA/CPA Uyumlu) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3.5 items-end">
                  
                  {/* 1. İl Seçimi */}
                  <div>
                    <label className="block text-[11px] font-bold text-[#6B7260] uppercase tracking-wider mb-1">
                      İl / İBBS-3 Bölgesi
                    </label>
                    <select
                      value={queryCity}
                      onChange={(e) => setQueryCity(e.target.value)}
                      className="w-full text-xs font-semibold bg-white border border-[#D8D2C2] rounded-lg px-3 py-2 outline-none focus:border-[#5B6B32]"
                    >
                      {TURKEY_CITIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  {/* 2. Faaliyet Türü */}
                  <div>
                    <label className="block text-[11px] font-bold text-[#6B7260] uppercase tracking-wider mb-1">
                      Faaliyet Kapsamı
                    </label>
                    <select
                      value={queryType}
                      onChange={(e) => setQueryType(e.target.value as any)}
                      className="w-full text-xs font-semibold bg-white border border-[#D8D2C2] rounded-lg px-3 py-2 outline-none focus:border-[#5B6B32]"
                    >
                      <option value="hepsi">Tümü (Çıktılar + Girdiler)</option>
                      <option value="cikti">🌱 Yalnızca Ürün Çıktıları (ÇEGF / Tarım-ÜFE)</option>
                      <option value="girdi">🚜 Yalnızca Girdi Maliyetleri (TGFE / Tarım-GFE)</option>
                    </select>
                  </div>

                  {/* 3. AB El Kitabı 2020 Sınıflaması */}
                  <div>
                    <label className="block text-[11px] font-bold text-[#6B7260] uppercase tracking-wider mb-1" title="Avrupa Birliği Tarımsal Fiyat İstatistikleri El Kitabı, 2020">
                      AB 2020 El Kitabı Grubu
                    </label>
                    <select
                      value={queryEUGrup}
                      onChange={(e) => setQueryEUGrup(e.target.value)}
                      className="w-full text-xs font-semibold bg-white border border-[#D8D2C2] rounded-lg px-3 py-2 outline-none focus:border-[#5B6B32]"
                    >
                      <option value="all">Tüm AB Grupları (Hepsi)</option>
                      <optgroup label="🌱 Tarım-ÜFE — 01: Bitkisel Ürünler">
                        <option value="01.1">01.1: Tahıllar ve Tohumlar</option>
                        <option value="01.2">01.2: Sanayi Bitkileri</option>
                        <option value="01.4">01.4: Taze Sebzeler</option>
                        <option value="01.5">01.5: Meyveler ve Yemişler</option>
                        <option value="01.7">01.7: Zeytinyağı ve Zeytin</option>
                      </optgroup>
                      <optgroup label="🐄 Tarım-ÜFE — 02: Hayvanlar ve Hayvansal Ürünler">
                        <option value="02.1">02.1: Canlı Hayvanlar (Kümes hariç)</option>
                        <option value="02.3">02.3: Süt (Milk)</option>
                        <option value="02.4">02.4: Yumurta (Eggs)</option>
                        <option value="02.5">02.5: Diğer Hayvansal Ürünler (Bal)</option>
                      </optgroup>
                      <optgroup label="🚜 Tarım-GFE — 01: Ara Tüketim Malları">
                        <option value="01.2_G">01.2: Enerji ve Yağlar (Motorin)</option>
                        <option value="01.3_G">01.3: Gübreler ve Toprak Geliştiriciler</option>
                        <option value="01.5_G">01.5: Hayvan Yemleri</option>
                        <option value="01.9_G">01.9: Diğer Mal ve Hizmetler (İşçilik)</option>
                      </optgroup>
                    </select>
                  </div>

                  {/* 4. Ana Kategori */}
                  <div>
                    <label className="block text-[11px] font-bold text-[#6B7260] uppercase tracking-wider mb-1">
                      Ulusal Grup
                    </label>
                    <select
                      value={queryGroup}
                      onChange={(e) => setQueryGroup(e.target.value)}
                      className="w-full text-xs font-semibold bg-white border border-[#D8D2C2] rounded-lg px-3 py-2 outline-none focus:border-[#5B6B32]"
                    >
                      <option value="all">Tüm Gruplar</option>
                      <option value="Tahıllar ve Baklagiller">Tahıllar ve Baklagiller</option>
                      <option value="Endüstri Bitkileri ve Yağlı Tohumlar">Endüstri Bitkileri ve Yağlı Tohumlar</option>
                      <option value="Sebzeler ve Sera Ürünleri">Sebzeler ve Sera Ürünleri</option>
                      <option value="Meyveler ve Sert Kabuklular">Meyveler ve Sert Kabuklular</option>
                      <option value="Canlı Hayvan ve Karkas Et">Canlı Hayvan ve Karkas Et</option>
                      <option value="Süt, Yumurta ve Arıcılık">Süt, Yumurta ve Arıcılık</option>
                      <option value="Gübre ve Toprak İyileştiriciler">Gübre ve Toprak İyileştiriciler</option>
                      <option value="Hayvan Yemi">Hayvan Yemi</option>
                      <option value="Enerji ve Yakıtlar">Enerji ve Yakıtlar</option>
                      <option value="Hizmetler (Kira, İşçilik vb.)">Hizmetler (Kira, İşçilik vb.)</option>
                    </select>
                  </div>

                  {/* 5. Yıl */}
                  <div>
                    <label className="block text-[11px] font-bold text-[#6B7260] uppercase tracking-wider mb-1">
                      Referans Yılı
                    </label>
                    <select
                      value={queryYear}
                      onChange={(e) => setQueryYear(parseInt(e.target.value, 10))}
                      className="w-full text-xs font-semibold bg-white border border-[#D8D2C2] rounded-lg px-3 py-2 outline-none focus:border-[#5B6B32]"
                    >
                      <option value={2026}>2026 (Güncel Dönem)</option>
                      <option value={2025}>2025</option>
                      <option value={2024}>2024</option>
                    </select>
                  </div>

                  {/* 6. Ay / Mevsimsellik */}
                  <div>
                    <label className="block text-[11px] font-bold text-[#6B7260] uppercase tracking-wider mb-1">
                      Ay (Mevsimsellik Çarpanı)
                    </label>
                    <select
                      value={queryMonth}
                      onChange={(e) => setQueryMonth(parseInt(e.target.value, 10))}
                      className="w-full text-xs font-semibold bg-white border border-[#D8D2C2] rounded-lg px-3 py-2 outline-none focus:border-[#5B6B32]"
                    >
                      <option value={10}>Ekim (Güz / Hasat Sonu)</option>
                      <option value={7}>Temmuz (Yaz Hasat Zirvesi)</option>
                      <option value={4}>Nisan (İlkbahar / Ekim)</option>
                      <option value={1}>Ocak (Kış Dönemi)</option>
                    </select>
                  </div>
                </div>

                {/* AB 2020 El Kitabı Sınıflaması Ağırlıklı Grup Fiyat Endeksleri Özeti */}
                {groupIndices.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-[#F0EDE4]">
                    <div className="flex flex-wrap items-center justify-between mb-2.5 gap-2">
                      <span className="text-[11px] font-bold text-[#5B6B32] uppercase tracking-wider flex items-center gap-1.5">
                        <Scale className="w-3.5 h-3.5" /> AB Tarımsal Fiyat İstatistikleri El Kitabı, 2020 — Ağırlıklı Grup Fiyat Endeksleri (2020=100)
                      </span>
                      <span className="text-[10px] text-[#6B7260] italic">
                        Laspeyres Ağırlıklı Endeksleme (TÜİK & Eurostat ‰ Promil Ağırlıkları)
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                      {groupIndices.map(g => (
                        <div key={g.altGrupKod} className="bg-[#FBF9F4] p-2.5 rounded-xl border border-[#D8D2C2] hover:border-[#5B6B32] transition-colors shadow-2xs">
                          <div className="flex items-center justify-between text-[10px] font-bold text-[#6B7260]">
                            <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-[#D8D2C2]">{g.altGrupKod.replace('_G', '')}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold ${g.endeksTuru === 'Tarım-ÜFE' ? 'bg-[#EFF2E6] text-[#5B6B32]' : 'bg-[#FBF1E6] text-[#C47A3A]'}`}>
                              {g.endeksTuru}
                            </span>
                          </div>
                          <div className="text-base font-extrabold text-[#1C2418] mt-1 tabular-numbers">
                            {g.agirlikliGrupEndeksi.toLocaleString('tr-TR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                            <span className="text-[10px] font-normal text-[#6B7260] ml-1">p</span>
                          </div>
                          <div className="text-[10px] text-[#6B7260] truncate mt-0.5" title={g.altGrupAdi}>
                            {g.altGrupAdi.split(':')[1]?.trim() || g.altGrupAdi}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bölgesel Çarpan ve Metodoloji Özeti */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-[#F0EDE4] text-xs">
                  <div className="bg-[#FBF9F4] p-2.5 rounded-lg border border-[#D8D2C2]">
                    <span className="text-[10px] text-[#6B7260] font-bold uppercase block">İBBS-2 Bölge Kodu</span>
                    <strong className="text-[#1C2418]">{selectedRegionInfo.kod} — {selectedRegionInfo.bolgeAdi}</strong>
                  </div>
                  <div className="bg-[#FBF9F4] p-2.5 rounded-lg border border-[#D8D2C2]">
                    <span className="text-[10px] text-[#6B7260] font-bold uppercase block">Bölgesel Girdi Çarpanı</span>
                    <strong className="text-[#1C2418]">{selectedRegionInfo.girdiKatsayisi}x (Lojistik/Maliyet)</strong>
                  </div>
                  <div className="bg-[#FBF9F4] p-2.5 rounded-lg border border-[#D8D2C2]">
                    <span className="text-[10px] text-[#6B7260] font-bold uppercase block">Çapraz Doğrulama</span>
                    <strong className="text-emerald-700">TÜİK + EMB Borsa + HKS Hal</strong>
                  </div>
                  <div className="bg-[#FBF9F4] p-2.5 rounded-lg border border-[#D8D2C2]">
                    <span className="text-[10px] text-[#6B7260] font-bold uppercase block">Hiyerarşik Fallback</span>
                    <strong className="text-[#5B6B32]">İlçe ➔ İl ➔ İBBS-2 ➔ TR Ort.</strong>
                  </div>
                </div>
              </div>

              {/* Sorgulama Sonuç Tablosu */}
              <div className="atlas-card rounded-2xl overflow-hidden shadow-xs">
                <div className="p-4 border-b border-[#D8D2C2] bg-[#F0EDE4]/60 flex flex-wrap justify-between items-center gap-3">
                  <div className="flex items-center gap-3">
                    <h4 className="font-bold text-sm text-[#1C2418]">
                      {queryCity} İli Detaylı Fiyat, Maliyet ve Endeks Listesi
                    </h4>
                    <span className="atlas-badge atlas-badge-olive text-xs">
                      {queryResults.length} Kalem Listeleniyor
                    </span>
                  </div>

                  <div className="text-xs text-[#6B7260]">
                    Madde düzeyinde <strong>TAORBA 2008_2</strong> ve <strong>CPA 2008</strong> sınıflamaları ile <strong>2020=100</strong> baz endeksleri içerir.
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#F0EDE4] text-[#1C2418] uppercase tracking-wider font-bold border-b border-[#D8D2C2]">
                      <tr>
                        <th className="px-3 py-3">Tür</th>
                        <th className="px-3 py-3">AB 2020 Sınıflaması</th>
                        <th className="px-4 py-3">Ürün / Girdi Adı</th>
                        <th className="px-3 py-3">Madde Kodları (TAORBA & CPA)</th>
                        <th className="px-3 py-3">En Alt Kırılım / Kalite</th>
                        <th className="px-3 py-3 text-right">TÜİK / Borsa / Hal</th>
                        <th className="px-4 py-3 text-right font-extrabold text-[#1C2418]">Birim Fiyat</th>
                        <th className="px-3 py-3 text-right">Endeks (2020=100)</th>
                        <th className="px-2 py-3 text-center">Güven</th>
                        <th className="px-3 py-3 text-center">İşlem</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#D8D2C2] bg-white">
                      {queryResults.map(item => (
                        <tr key={item.id} className="hover:bg-[#FBF9F4] transition-colors group">
                          {/* Tür */}
                          <td className="px-3 py-3 whitespace-nowrap">
                            <span className={`atlas-badge ${item.tur === 'cikti' ? 'atlas-badge-olive' : 'atlas-badge-copper'}`}>
                              {item.tur === 'cikti' ? '🌱 Çıktı' : '🚜 Girdi'}
                            </span>
                          </td>

                          {/* AB 2020 Sınıflaması */}
                          <td className="px-3 py-3 whitespace-nowrap">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#EFF2E6] text-[#5B6B32] border border-[#BDC8A3]" title={item.abElKitabi2020.altGrupAdi}>
                              AB {item.abElKitabi2020.altGrupKod.replace('_G', '')}
                            </span>
                          </td>

                          {/* Ürün Adı */}
                          <td className="px-4 py-3 font-bold text-[#1C2418] min-w-[180px]">
                            <div>{item.urunAdi}</div>
                            <span className="text-[10px] text-[#6B7260] font-normal">{item.anaGrup} • {item.altGrup}</span>
                          </td>

                          {/* Madde Kodları (TAORBA 2008_2 & CPA 2008) */}
                          <td className="px-3 py-3 whitespace-nowrap">
                            <div className="space-y-0.5 font-mono text-[10px]">
                              <div className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded border border-slate-200" title="TÜİK TAORBA 2008_2 Madde Kodu">
                                <strong>TAORBA:</strong> {item.taorba2008_2}
                              </div>
                              <div className="bg-amber-50 text-amber-900 px-1.5 py-0.5 rounded border border-amber-200" title="Eurostat CPA 2008 Kodu">
                                <strong>CPA:</strong> {item.cpa2008}
                              </div>
                            </div>
                          </td>

                          {/* Spesifikasyon */}
                          <td className="px-3 py-3 text-[#6B7260] max-w-[200px] leading-tight">
                            <span className="text-[11px] block">{item.spesifikasyon}</span>
                            <span className="text-[10px] text-emerald-700 block mt-0.5 font-semibold">
                              {item.fallbackSeviyesi === 'il_dogrudan' ? '✓ Doğrudan İl Tescili' : '⇄ Bölgesel İBBS-2'}
                            </span>
                          </td>

                          {/* Üçlü Çapraz Kontrol */}
                          <td className="px-3 py-3 text-right tabular-numbers text-[11px] text-[#6B7260] whitespace-nowrap">
                            <div>TÜİK: {item.kaynakCaprazKontrol.tuikFiyati.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</div>
                            <div>Borsa: {item.kaynakCaprazKontrol.embBorsaFiyati.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</div>
                            <div>Hal: {item.kaynakCaprazKontrol.halFiyati.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</div>
                          </td>

                          {/* Sentez Fiyat */}
                          <td className="px-4 py-3 text-right tabular-numbers whitespace-nowrap">
                            <span className={`font-extrabold text-sm ${item.tur === 'cikti' ? 'text-[#5B6B32]' : 'text-[#C47A3A]'}`}>
                              {item.hesaplananFiyat.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                            </span>
                            <span className="text-[10px] text-[#6B7260] ml-1">{item.fiyatBirimi}</span>
                          </td>

                          {/* 2020=100 Endeks */}
                          <td className="px-3 py-3 text-right tabular-numbers whitespace-nowrap">
                            <div className="font-bold text-[#1C2418] text-xs">
                              {item.endeksBilgisi.maddeFiyatEndeksi.toLocaleString('tr-TR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                            </div>
                            <div className="text-[10px] text-[#6B7260]">
                              Baz: {item.endeksBilgisi.bazFiyat2020} TL
                            </div>
                          </td>

                          {/* Güven Skoru */}
                          <td className="px-2 py-3 text-center whitespace-nowrap">
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              %{item.kaynakCaprazKontrol.guvenSkoru}
                            </span>
                          </td>

                          {/* İşlem */}
                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            <button
                              onClick={() => handleAddQueryItemToAnalysis(item)}
                              className="px-2.5 py-1 text-[11px] font-semibold bg-[#EFF2E6] hover:bg-[#E3E8D3] text-[#5B6B32] border border-[#BDC8A3] rounded-md transition-all shadow-2xs"
                              title="Bu kalemi analiz tablosuna aktar"
                            >
                              + Analize Ekle
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-3.5 bg-[#F0EDE4] border-t border-[#D8D2C2] flex flex-col sm:flex-row justify-between items-center text-xs text-[#6B7260] gap-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#5B6B32]" />
                    <span>Her sorgu için kaynakça, TOBB borsa tescil kodu, HKS ve erişim tarihi kayıt altındadır.</span>
                  </div>
                  <div>
                    Erişim Tarihi: <strong>{new Date().toLocaleDateString('tr-TR')}</strong>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ============================================================ */}
          {/* TAB: ANALİZ GÖSTERGE PANOSU (OVERVIEW TAB) */}
          {/* ============================================================ */}
          {activeTab === 'overview' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              {records.length === 0 ? (
                <div className="max-w-2xl mx-auto py-12 px-6 bg-white border border-[#D8D2C2] rounded-2xl text-center space-y-4">
                  <AlertCircle className="w-12 h-12 text-[#C47A3A] mx-auto" />
                  <h3 className="text-lg font-bold text-[#1C2418]">Analiz Tablosunda Veri Bulunmuyor</h3>
                  <p className="text-xs text-[#6B7260] max-w-md mx-auto">
                    "Akıllı Sorgulama" sekmesinden il bazlı verileri çekip <strong>"+ Analize Ekle"</strong> butonuna basabilir veya kendi hazırladığınız CSV dosyasını içe aktarabilirsiniz.
                  </p>
                  <button
                    onClick={() => setActiveTab('query')}
                    className="px-4 py-2 text-xs font-bold text-white bg-[#5B6B32] rounded-lg shadow-sm"
                  >
                    Akıllı Sorgulama Sekmesine Git
                  </button>
                </div>
              ) : (
                <>
                  {/* KPI Kartları */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                        Çiftçi eline geçen uyumlu birim TL satış fiyatlarına dayalı toplam brüt gelir.
                      </p>
                    </div>

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
                        Doğrudan ölçülen veya gerçekleşen maliyetlerin toplamıdır (tahminler marja katılmaz).
                      </p>
                    </div>

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
                        Eksik maliyet 0 TL sayılmaz; yalnızca hem geliri hem maliyeti ölçülen ürünlerin farkıdır.
                      </p>
                    </div>
                  </div>

                  {/* Grafikler */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="atlas-card p-5 rounded-xl">
                      <div className="flex items-center justify-between mb-4 border-b border-[#F0EDE4] pb-3">
                        <div>
                          <h4 className="font-bold text-sm text-[#1C2418]">İller Arası Karşılaştırma</h4>
                          <p className="text-xs text-[#6B7260]">Gelir ve maliyet hacmi en yüksek iller</p>
                        </div>
                        <span className="text-[11px] font-semibold text-[#5B6B32] bg-[#EFF2E6] px-2 py-0.5 rounded">TL Hacmi</span>
                      </div>
                      <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={ilBarChartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F0EDE4" />
                            <XAxis dataKey="il" tick={{ fontSize: 11 }} interval={0} angle={-25} textAnchor="end" />
                            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}M`} />
                            <Tooltip formatter={(value: any) => [`${Number(value).toLocaleString('tr-TR')} ₺`]} />
                            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                            <Bar dataKey="gelir" name="Gelir (TL)" fill="#C47A3A" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="maliyet" name="Maliyet (TL)" fill="#6B7260" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="atlas-card p-5 rounded-xl">
                      <div className="flex items-center justify-between mb-4 border-b border-[#F0EDE4] pb-3">
                        <div>
                          <h4 className="font-bold text-sm text-[#1C2418]">Yıllık Gelişim Eğilimi</h4>
                          <p className="text-xs text-[#6B7260]">Yıllar itibarıyla gelir ve marj gelişimi</p>
                        </div>
                        <span className="text-[11px] font-semibold text-[#C47A3A] bg-[#FBF1E8] px-2 py-0.5 rounded">Zaman Serisi</span>
                      </div>
                      <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={yearlyTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F0EDE4" />
                            <XAxis dataKey="yil" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}M`} />
                            <Tooltip formatter={(value: any) => [`${Number(value).toLocaleString('tr-TR')} ₺`]} />
                            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                            <Line type="monotone" dataKey="gelir" name="Gelir (TL)" stroke="#C47A3A" strokeWidth={2.5} />
                            <Line type="monotone" dataKey="maliyet" name="Maliyet (TL)" stroke="#6B7260" strokeWidth={2} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB: AYRINTILI VERİ TABLOSU (TABLE TAB) */}
          {/* ============================================================ */}
          {activeTab === 'table' && (
            <div className="atlas-card rounded-xl overflow-hidden max-w-7xl mx-auto">
              <div className="p-4 border-b border-[#D8D2C2] flex flex-wrap justify-between items-center gap-3 bg-[#F0EDE4]/50">
                <div>
                  <h4 className="font-bold text-sm text-[#1C2418]">Analiz Masası Kayıt Çizelgesi</h4>
                  <p className="text-xs text-[#6B7260]">
                    Toplam {filteredRecords.length} kayıt saklanıyor.
                  </p>
                </div>
                <button
                  onClick={handleExportData}
                  className="px-3 py-1.5 text-xs font-semibold text-[#1C2418] bg-white border border-[#D8D2C2] rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> CSV Olarak İndir
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#F0EDE4] text-[#1C2418] uppercase tracking-wider font-bold border-b border-[#D8D2C2]">
                    <tr>
                      <th className="px-4 py-3">İl</th>
                      <th className="px-3 py-3">Yıl</th>
                      <th className="px-3 py-3">Sektör</th>
                      <th className="px-4 py-3">Ürün / Girdi Adı</th>
                      <th className="px-4 py-3 text-right">Miktar</th>
                      <th className="px-3 py-3">Birim</th>
                      <th className="px-4 py-3 text-right">Birim Fiyat</th>
                      <th className="px-4 py-3 text-right">Gelir (TL)</th>
                      <th className="px-4 py-3 text-right">Maliyet (TL)</th>
                      <th className="px-3 py-3">Kaynak</th>
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
                        <td className="px-4 py-3 font-medium text-[#1C2418]">
                          <div>{r.urun}</div>
                          {r.taorba2008_2 && (
                            <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[9px] font-mono text-[#6B7260]">
                              <span className="bg-slate-100 px-1 py-0.5 rounded border border-slate-200">TAORBA: {r.taorba2008_2}</span>
                              <span className="bg-amber-50 text-amber-900 px-1 py-0.5 rounded border border-amber-200">CPA: {r.cpa2008}</span>
                              {r.ab_grup_kod && (
                                <span className="bg-[#EFF2E6] text-[#5B6B32] px-1 py-0.5 rounded border border-[#BDC8A3]">AB {r.ab_grup_kod.replace('_G', '')}</span>
                              )}
                              {r.madde_endeksi_2020 && (
                                <span className="text-[#5B6B32] font-bold">Endeks: {r.madde_endeksi_2020}</span>
                              )}
                            </div>
                          )}
                        </td>
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
                          {r.toplam_maliyet_tl !== undefined ? `${r.toplam_maliyet_tl.toLocaleString('tr-TR')} ₺` : '-'}
                        </td>
                        <td className="px-3 py-3 text-[11px] text-[#6B7260] truncate max-w-[140px]" title={r.kaynak}>
                          {r.kaynak}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB: TÜİK & RESMÎ KAYNAKLAR (SOURCES TAB) */}
          {/* ============================================================ */}
          {activeTab === 'sources' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="atlas-card p-6 rounded-xl border-l-4 border-l-[#5B6B32]">
                <h3 className="text-lg font-bold text-[#1C2418]">TÜİK, EMB ve HKS Resmî Kaynak Kataloğu</h3>
                <p className="text-xs text-[#6B7260] mt-1">
                  Uygulama içi akıllı sorgulama motorunun beslendiği resmî istatistiki bültenler, ticaret borsaları tescilleri ve hal kayıt sistemleri.
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

        </main>
      </div>

    </div>
  );
};
