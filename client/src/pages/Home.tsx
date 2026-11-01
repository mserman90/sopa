import React, { useState, useMemo, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  LineChart, Line, CartesianGrid, Legend 
} from 'recharts';
import { 
  Upload, Download, FileText, AlertCircle, CheckCircle2, 
  HelpCircle, ChevronRight, Filter, RefreshCw, Layers, Database,
  TrendingUp, Scale, Sprout, Wheat, Building2, Search, ArrowRight,
  ShieldCheck, Calendar, MapPin, ExternalLink, PlusCircle,
  Zap, Key, Copy, Terminal, Code2, Check, Eye, EyeOff
} from 'lucide-react';
import { 
  TarimRecord, SektorType, parseAndValidateCSV, 
  computeKPIs, generateCSVTemplate, exportRecordsToCSV 
} from '../lib/analysis.ts';
import { sourceCatalog } from '../data/sourceCatalog.ts';
import { 
  executeAgriQuery, QueryResultItem, MASTER_AGRI_CATALOG, 
  findRegionForCity, getSeasonalityFactor,
  EU_HANDBOOK_2020_GROUPS, calculateGroupPriceIndices,
  TUIK_TGFE_METHODOLOGY, calculateCompositeTGFE
} from '../lib/queryEngine.ts';
import {
  TUIK_SDMX_CONFIG,
  PREDEFINED_AGRI_DATAFLOWS,
  SdmxDataflowMeta,
  TuikTokenResponse,
  requestTuikAccessToken,
  buildSdmxDataUrl,
  buildSdmxDataflowUrl,
  buildSdmxDsdUrl,
  generateSdmxCurlCommand,
  generateSdmxPowerShellCommand,
  generateSdmxPythonScript,
  parseSdmxCsvToTarimRecords
} from '../lib/tuikSdmx.ts';

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
  const [activeTab, setActiveTab] = useState<'query' | 'overview' | 'table' | 'sources' | 'sdmx'>('query');

  // TÜİK SDMX REST Web Servisi State'leri
  const [sdmxApiKey, setSdmxApiKey] = useState<string>(() => {
    try {
      return localStorage.getItem('tarimviz_tuik_api_key') || '';
    } catch {
      return '';
    }
  });
  const [showApiKey, setShowApiKey] = useState<boolean>(false);
  const [sdmxToken, setSdmxToken] = useState<TuikTokenResponse | null>(null);
  const [sdmxIsLoadingToken, setSdmxIsLoadingToken] = useState<boolean>(false);
  const [sdmxTokenError, setSdmxTokenError] = useState<string | null>(null);

  const [selectedDataflowId, setSelectedDataflowId] = useState<string>('DF_TARIM_GFE_2020');
  const [customDataflowId, setCustomDataflowId] = useState<string>('');
  const [sdmxSeriesKey, setSdmxSeriesKey] = useState<string>('');
  const [sdmxStartPeriod, setSdmxStartPeriod] = useState<number>(2020);
  const [sdmxEndPeriod, setSdmxEndPeriod] = useState<number>(2026);
  const [sdmxFormat, setSdmxFormat] = useState<'SDMX-CSV' | 'JSON' | 'SDMX_2_1_STRUCTURED'>('SDMX-CSV');

  const [sdmxRawResponse, setSdmxRawResponse] = useState<string>('');
  const [sdmxIsLoadingQuery, setSdmxIsLoadingQuery] = useState<boolean>(false);
  const [sdmxQueryError, setSdmxQueryError] = useState<string | null>(null);
  const [sdmxCopiedKey, setSdmxCopiedKey] = useState<string | null>(null);

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

  // TÜİK Resmî Tarım-GFE Bileşik Endeksi (2020=100: %88,87 Girdi 1 + %11,13 Girdi 2)
  const tgfeComposite = useMemo(() => {
    return calculateCompositeTGFE(queryResults);
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

  // TÜİK API Key Kaydetme
  const handleSaveApiKey = (key: string) => {
    setSdmxApiKey(key);
    try {
      localStorage.setItem('tarimviz_tuik_api_key', key.trim());
      showToast('TÜİK API Anahtarı tarayıcıya güvenle kaydedildi.');
    } catch (e) {
      console.error(e);
    }
  };

  // TÜİK OpenID Connect Token Alma
  const handleGetTuikToken = async () => {
    if (!sdmxApiKey.trim()) {
      setSdmxTokenError('Lütfen geçerli bir TÜİK API Anahtarı girin.');
      return;
    }
    setSdmxIsLoadingToken(true);
    setSdmxTokenError(null);
    try {
      handleSaveApiKey(sdmxApiKey);
      const res = await requestTuikAccessToken(sdmxApiKey);
      setSdmxToken(res);
      showToast('TÜİK Bearer Token başarıyla alındı.');
    } catch (err: any) {
      setSdmxTokenError(err?.message || 'Token alma işlemi başarısız oldu.');
    } finally {
      setSdmxIsLoadingToken(false);
    }
  };

  // Aktif Veri Akışı ID'si
  const activeDataflowId = customDataflowId.trim() || selectedDataflowId;

  // Hedef SDMX Veri URL'si
  const currentSdmxDataUrl = useMemo(() => {
    return buildSdmxDataUrl({
      dataflowId: activeDataflowId,
      seriesKey: sdmxSeriesKey.trim() || undefined,
      startPeriod: sdmxStartPeriod,
      endPeriod: sdmxEndPeriod,
      format: sdmxFormat
    });
  }, [activeDataflowId, sdmxSeriesKey, sdmxStartPeriod, sdmxEndPeriod, sdmxFormat]);

  // Canlı SDMX Sorgulama Çağrısı (Direct Fetch / CORS Fallback)
  const handleRunSdmxLiveQuery = async () => {
    if (!sdmxToken) {
      setSdmxQueryError('Lütfen önce "Token Al" butonuna basarak geçerli bir Bearer Token edinin.');
      return;
    }
    setSdmxIsLoadingQuery(true);
    setSdmxQueryError(null);
    try {
      const response = await fetch(currentSdmxDataUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${sdmxToken.access_token}`
        }
      });
      if (!response.ok) {
        throw new Error(`TÜİK SDMX Servis Hatası (${response.status}): ${response.statusText}`);
      }
      const text = await response.text();
      setSdmxRawResponse(text);
      showToast('TÜİK SDMX yanıtı başarıyla alındı.');
    } catch (err: any) {
      setSdmxQueryError(
        `${err.message || 'İstek başarısız oldu.'} Tarayıcı doğrudan nsiws.tuik.gov.tr servisini CORS nedeniyle engellemiş olabilir. ` +
        `Aşağıdaki hazır cURL / PowerShell komutunu çalıştırıp dönen çıktıyı alt kutuya yapıştırabilirsiniz.`
      );
    } finally {
      setSdmxIsLoadingQuery(false);
    }
  };

  // SDMX-CSV Yanıtını Ayrıştırıp Analiz Tablosuna Ekleme
  const handleParseSdmxResponseAndAddToAnalysis = () => {
    if (!sdmxRawResponse.trim()) {
      showToast('Ayrıştırılacak SDMX yanıtı bulunamadı.');
      return;
    }
    const { records: parsedRecords, warnings } = parseSdmxCsvToTarimRecords(sdmxRawResponse, {
      kaynak: `TÜİK SDMX (${activeDataflowId})`
    });

    if (parsedRecords.length === 0) {
      alert('SDMX-CSV içeriğinden geçerli kayıt üretilemedi. ' + (warnings.join('\n') || ''));
      return;
    }

    const updated = [...parsedRecords, ...records];
    saveRecords(updated);
    showToast(`${parsedRecords.length} SDMX kaydı analiz tablosuna aktarıldı.`);
    setActiveTab('overview');
  };

  // Kopyalama Yardımcısı
  const copySnippet = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setSdmxCopiedKey(key);
    setTimeout(() => setSdmxCopiedKey(null), 2000);
    showToast('Panoya kopyalandı.');
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

            {/* 5. TÜİK Canlı SDMX REST API */}
            <button
              onClick={() => setActiveTab('sdmx')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'sdmx' 
                  ? 'bg-[#C47A3A] text-white shadow-sm font-bold' 
                  : 'text-[#D8D2C2] hover:bg-white/5 hover:text-white'
              }`}
              title="TÜİK Resmî SDMX REST Servisi"
            >
              <Zap className="w-5 h-5 shrink-0 text-amber-300" />
              <div className="hidden md:flex flex-1 justify-between items-center">
                <span>Canlı SDMX API</span>
                <span className="bg-amber-500/30 text-amber-200 text-[9px] px-1.5 py-0.5 rounded font-mono font-bold">
                  REST
                </span>
              </div>
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
                  {activeTab === 'sdmx' && '⚡ TÜİK Resmî SDMX REST Web Servisi & Canlı Veri Masası'}
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
              <a
                href="https://biruni.tuik.gov.tr/medas/?kn=104&locale=tr"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 text-xs font-semibold text-[#1C2418] bg-[#FBF9F4] hover:bg-[#F0EDE4] border border-[#D8D2C2] rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
                title="TÜİK MEDAS Bitkisel Ürün Denge Tabloları (kn=104: Tüketim, İthalat/İhracat, Yeterlilik Derecesi %)"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#C47A3A]" /> TÜİK Denge (kn=104)
              </a>

              <a
                href="https://biruni.tuik.gov.tr/medas/?kn=92&locale=tr"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 text-xs font-semibold text-[#1C2418] bg-[#FBF9F4] hover:bg-[#F0EDE4] border border-[#D8D2C2] rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
                title="TÜİK MEDAS Bitkisel Üretim İstatistikleri (kn=92: İl Bazlı Üretim Ton, Ekilen Alan)"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#5B6B32]" /> TÜİK BÜİ (kn=92)
              </a>

              <button
                onClick={() => setActiveTab('sdmx')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs ${
                  activeTab === 'sdmx'
                    ? 'bg-[#C47A3A] text-white'
                    : 'text-[#C47A3A] bg-[#FBF1E6] hover:bg-[#F0D5BE] border border-[#F0D5BE]'
                }`}
                title="TÜİK Resmî SDMX REST Servisinden Canlı Veri Çek"
              >
                <Zap className="w-3.5 h-3.5" /> Canlı SDMX API
              </button>

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
                      <optgroup label="🚜 Tarım-GFE — Girdi 1: Ara Tüketim Malları (%88,87 Ağırlık)">
                        <option value="01.1_G">01.1: Tohum ve Dikim Materyali</option>
                        <option value="01.2_G">01.2: Enerji ve Yağlar (Motorin)</option>
                        <option value="01.3_G">01.3: Gübreler ve Toprak Geliştiriciler</option>
                        <option value="01.4_G">01.4: Bitki Koruma Ürünleri (Tarımsal İlaçlar)</option>
                        <option value="01.5_G">01.5: Hayvan Yemleri</option>
                        <option value="01.9_G">01.9: Diğer Mal ve Hizmetler (İşçilik vb.)</option>
                      </optgroup>
                      <optgroup label="🚜 Tarım-GFE — Girdi 2: Tarımsal Yatırıma Katkı Sağlayanlar (%11,13 Ağırlık)">
                        <option value="02.1_G">02.1: Makine ve Diğer Teçhizat (Traktör, Mibzer)</option>
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

                {/* TÜİK Resmî Tarım-GFE (2020=100) Ağırlık Şeması & Bileşik Endeks Paneli */}
                {(queryType === 'girdi' || queryType === 'hepsi') && (
                  <div className="mt-4 pt-4 border-t border-[#F0EDE4] bg-[#FBF9F4] rounded-xl p-4 border border-[#BDC8A3]/70">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#C47A3A]" />
                          <h4 className="text-xs sm:text-sm font-bold text-[#1C2418]">
                            TÜİK 2020=100 Tarım-GFE Resmî Ağırlık Şeması ve Bileşik Endeks
                          </h4>
                          <span className="atlas-badge atlas-badge-copper text-[10px] font-bold">
                            Resmî Metodoloji
                          </span>
                        </div>
                        <p className="text-[11px] text-[#6B7260] mt-0.5">
                          Tarımsal Yapı İstatistikleri Grup Başkanlığı 3 yıllık (2019-2021) ekonomik hesaplar ara tüketim ve yatırım ağırlıkları.
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] bg-white px-2.5 py-1 rounded-lg border border-[#D8D2C2] text-[#1C2418]">
                        <Calendar className="w-3.5 h-3.5 text-[#5B6B32]" />
                        <span>Fiyat Kapsamı: <strong>Ayın 1'i - 31'i Arası Çiftçi Satın Alma</strong></span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {/* Girdi 1: Tarımda Kullanılan Mal ve Hizmetler */}
                      <div className="bg-white p-3 rounded-xl border border-[#D8D2C2] shadow-2xs">
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="font-bold text-[#5B6B32]">Girdi 1: Ara Tüketim</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#EFF2E6] text-[#5B6B32] border border-[#BDC8A3]">
                            %88,87 Ağırlık
                          </span>
                        </div>
                        <div className="text-xl font-extrabold text-[#1C2418] tabular-numbers">
                          {tgfeComposite.girdi1Endeksi.toLocaleString('tr-TR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                          <span className="text-xs font-normal text-[#6B7260] ml-1">p</span>
                        </div>
                        <div className="text-[10px] text-[#6B7260] mt-1 leading-snug">
                          Tohum, gübre, hayvan yemi, ilaç, fide vb. ({tgfeComposite.girdi1KalemSayisi} kalem)
                        </div>
                      </div>

                      {/* Girdi 2: Tarımsal Yatırıma Katkı Sağlayan Mal ve Hizmetler */}
                      <div className="bg-white p-3 rounded-xl border border-[#D8D2C2] shadow-2xs">
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="font-bold text-[#C47A3A]">Girdi 2: Yatırım Katkısı</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#FBF1E6] text-[#C47A3A] border border-[#F0D5BE]">
                            %11,13 Ağırlık
                          </span>
                        </div>
                        <div className="text-xl font-extrabold text-[#1C2418] tabular-numbers">
                          {tgfeComposite.girdi2Endeksi.toLocaleString('tr-TR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                          <span className="text-xs font-normal text-[#6B7260] ml-1">p</span>
                        </div>
                        <div className="text-[10px] text-[#6B7260] mt-1 leading-snug">
                          Traktör, alet-makine vb. sermaye ({tgfeComposite.girdi2KalemSayisi} kalem)
                        </div>
                      </div>

                      {/* Bileşik Genel Tarım-GFE Endeksi */}
                      <div className="bg-[#1C2418] text-white p-3 rounded-xl shadow-sm flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between text-[11px] mb-1">
                            <span className="font-bold text-[#D8D2C2]">Genel Tarım-GFE (Bileşik)</span>
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/20 text-white">
                              2020=100
                            </span>
                          </div>
                          <div className="text-2xl font-black text-amber-300 tabular-numbers">
                            {tgfeComposite.genelTGFEEndeksi.toLocaleString('tr-TR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                            <span className="text-xs font-normal text-white/70 ml-1">puan</span>
                          </div>
                        </div>
                        <div className="text-[9.5px] text-[#A6AC9A] mt-1">
                          Formül: (0.8887 × I_Girdi1) + (0.1113 × I_Girdi2)
                        </div>
                      </div>
                    </div>

                    {/* TÜİK Tarım-GFE 4 Ayaklı Resmî Veri Kaynakları Mimarisi */}
                    <div className="mt-3.5 pt-3 border-t border-[#D8D2C2]/60">
                      <div className="text-[11px] font-bold text-[#1C2418] uppercase tracking-wider mb-2 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Database className="w-3.5 h-3.5 text-[#5B6B32]" />
                          TÜİK Tarım-GFE Resmî Veri Kaynakları Mimarisi (4 Temel Kanal)
                        </span>
                        <span className="text-[10px] text-[#6B7260] font-normal normal-case hidden sm:inline">
                          Soru Formları • TÜİK Diğer Çalışmaları • İdari Kayıtlar • Veri Kazıma
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                        {/* 1. Soru Formları */}
                        <div className="bg-white p-2.5 rounded-lg border border-[#D8D2C2] hover:border-[#5B6B32] transition-colors">
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#5B6B32] mb-1">
                            <FileText className="w-3.5 h-3.5 text-[#5B6B32]" />
                            <span>1. Soru Formları</span>
                          </div>
                          <ul className="text-[10px] text-[#6B7260] space-y-0.5 list-disc pl-3 leading-tight">
                            <li>Tarımsal Girdi İstatistikleri Aylık Soru Formu</li>
                            <li>Tarımsal Fiyatlar Çiftçinin Ödediği Hizmetler Formu</li>
                          </ul>
                          <span className="text-[9px] text-[#A6AC9A] block mt-1">Gübre, yem, tohum, zirai ilaç & işçilik</span>
                        </div>

                        {/* 2. TÜİK Tarafından Yapılan Diğer Çalışmalar */}
                        <div className="bg-white p-2.5 rounded-lg border border-[#D8D2C2] hover:border-[#C47A3A] transition-colors">
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#C47A3A] mb-1">
                            <TrendingUp className="w-3.5 h-3.5 text-[#C47A3A]" />
                            <span>2. TÜİK Diğer Çalışmaları</span>
                          </div>
                          <ul className="text-[10px] text-[#6B7260] space-y-0.5 list-disc pl-3 leading-tight">
                            <li>TÜFE & Yurt İçi ÜFE (Yİ-ÜFE)</li>
                            <li>Hizmet ÜFE (H-ÜFE) & İnşaat Maliyet Endeksi (İME)</li>
                          </ul>
                          <span className="text-[9px] text-[#A6AC9A] block mt-1">Elektrik, sera demir-çelik, bakım malzemeleri</span>
                        </div>

                        {/* 3. İdari Kayıtlar */}
                        <div className="bg-white p-2.5 rounded-lg border border-[#D8D2C2] hover:border-emerald-600 transition-colors">
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 mb-1">
                            <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>3. İdari Kayıtlar</span>
                          </div>
                          <ul className="text-[10px] text-[#6B7260] space-y-0.5 list-disc pl-3 leading-tight">
                            <li>TOB Devlet Su İşleri Genel Müdürlüğü (DSİ)</li>
                            <li>Enerji Piyasası Düzenleme Kurulu (EPDK)</li>
                            <li>Tarım Kredi Koop. & PANKOBİRLİK</li>
                            <li>Türk Veteriner Hekimleri Birliği</li>
                          </ul>
                          <span className="text-[9px] text-[#A6AC9A] block mt-1">Sulama suyu tarifesi, motorin, kooperatif fiyatları</span>
                        </div>

                        {/* 4. Veri Kazıma */}
                        <div className="bg-white p-2.5 rounded-lg border border-[#D8D2C2] hover:border-sky-600 transition-colors">
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-sky-700 mb-1">
                            <Search className="w-3.5 h-3.5 text-sky-600" />
                            <span>4. Veri Kazıma (Web Scraping)</span>
                          </div>
                          <ul className="text-[10px] text-[#6B7260] space-y-0.5 list-disc pl-3 leading-tight">
                            <li>Traktör ve Makine Satışı Yapan Bayiler</li>
                            <li>Yetkili distribütör liste fiyatları</li>
                          </ul>
                          <span className="text-[9px] text-[#A6AC9A] block mt-1">Sermaye/Yatırım malları (Traktör, mibzer vb.)</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-[#D8D2C2]/50 text-[10px] text-[#6B7260] flex flex-wrap items-center justify-between gap-2">
                      <span>📌 <strong>Cari Ağırlık Dönemi:</strong> 2019, 2020 ve 2021 yılları (t-1, t, t+1) 3 yıllık hareketli baz.</span>
                      <span>🏛️ <strong>Sorumlu Birim:</strong> {TUIK_TGFE_METHODOLOGY.kaynakBaskanlik} (MEDAS kn=82 & kn=104)</span>
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

                          {/* Ürün Adı & TÜİK Resmî Veri Kaynağı */}
                          <td className="px-4 py-3 font-bold text-[#1C2418] min-w-[200px]">
                            <div>{item.urunAdi}</div>
                            <div className="text-[10px] text-[#6B7260] font-normal">{item.anaGrup} • {item.altGrup}</div>
                            
                            {/* TÜİK 4 Ayaklı Veri Kaynağı Rozeti */}
                            {item.tuikVeriKaynagi ? (
                              <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-extrabold border ${
                                  item.tuikVeriKaynagi.kanalKodu === 'soru_formlari'
                                    ? 'bg-blue-50 text-blue-800 border-blue-200'
                                    : item.tuikVeriKaynagi.kanalKodu === 'tuik_diger_calismalar'
                                    ? 'bg-purple-50 text-purple-800 border-purple-200'
                                    : item.tuikVeriKaynagi.kanalKodu === 'idari_kayitlar'
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : 'bg-amber-50 text-amber-800 border-amber-200'
                                }`} title={`${item.tuikVeriKaynagi.kurumVeDokuman}: ${item.tuikVeriKaynagi.aciklama}`}>
                                  {item.tuikVeriKaynagi.kanalKodu === 'soru_formlari' && '📝 Soru Formu'}
                                  {item.tuikVeriKaynagi.kanalKodu === 'tuik_diger_calismalar' && '📊 TÜİK Diğer Endeks'}
                                  {item.tuikVeriKaynagi.kanalKodu === 'idari_kayitlar' && '🏢 İdari Kayıt'}
                                  {item.tuikVeriKaynagi.kanalKodu === 'veri_kazima' && '🤖 Veri Kazıma'}
                                </span>
                                <span className="text-[9px] text-[#6B7260] truncate max-w-[150px]" title={item.tuikVeriKaynagi.kurumVeDokuman}>
                                  {item.tuikVeriKaynagi.kurumVeDokuman}
                                </span>
                              </div>
                            ) : item.tur === 'cikti' ? (
                              <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-[#EFF2E6] text-[#5B6B32] border border-[#BDC8A3]" title="TÜİK Çiftçinin Eline Geçen Fiyatlar & Borsa Tescil Bültenleri">
                                  🌾 ÇEGF / Borsa
                                </span>
                                <span className="text-[9px] text-[#6B7260] truncate max-w-[150px]" title={item.birincilKaynak || item.kaynakCaprazKontrol.tuikKaynak}>
                                  {item.birincilKaynak || item.kaynakCaprazKontrol.tuikKaynak}
                                </span>
                              </div>
                            ) : null}
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

          {/* ============================================================ */}
          {/* TAB: TÜİK CANLI SDMX REST WEB SERVİSİ (SDMX TAB) */}
          {/* ============================================================ */}
          {activeTab === 'sdmx' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              
              {/* Başlık Kartı */}
              <div className="atlas-card p-6 rounded-2xl border-l-4 border-l-[#C47A3A] bg-gradient-to-r from-white via-white to-[#FBF1E6]/40">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#C47A3A] animate-pulse" />
                      <h3 className="text-lg font-bold text-[#1C2418]">
                        TÜİK Resmî SDMX REST API & Canlı Entegrasyon Masası
                      </h3>
                      <span className="atlas-badge atlas-badge-copper text-[10px] font-mono">
                        v1.5 SPEC
                      </span>
                    </div>
                    <p className="text-xs text-[#6B7260] mt-1 max-w-3xl leading-relaxed">
                      TÜİK SDMX Web Servis Dokümantasyonuna uygun olarak; OpenID Connect üzerinden SMS doğrulamalı API anahtarınızla token alın,
                      Dataflow/DSD metaverilerini inceleyin ve canlı tarımsal zaman serilerini (SDMX-CSV / JSON) doğrudan analiz panosuna aktarın.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href="https://data.tuik.gov.tr"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 text-xs font-semibold text-[#1C2418] bg-white border border-[#D8D2C2] hover:bg-[#F0EDE4] rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-[#5B6B32]" /> TÜİK Veri Portalı
                    </a>
                  </div>
                </div>
              </div>

              {/* 1. ADIM: KİMLİK DOĞRULAMA VE TOKEN ALMA (4.1 & 4.3) */}
              <div className="atlas-card p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-4 border-b border-[#F0EDE4] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#5B6B32] text-white text-xs font-bold flex items-center justify-center">1</span>
                    <h4 className="text-sm font-bold text-[#1C2418]">
                      Kimlik Doğrulama ve Token Servisi (OAuth2 Bearer Token)
                    </h4>
                  </div>
                  <span className="text-[11px] text-[#6B7260] font-mono">
                    POST giris.tuik.gov.tr/.../token
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Sol: API Key Girişi */}
                  <div className="lg:col-span-2 space-y-3.5">
                    <div>
                      <label className="block text-[11px] font-bold text-[#6B7260] uppercase tracking-wider mb-1">
                        SMS Doğrulamalı TÜİK API Anahtarı (API Key)
                      </label>
                      <div className="relative flex items-center">
                        <Key className="w-4 h-4 text-[#A6AC9A] absolute left-3 pointer-events-none" />
                        <input
                          type={showApiKey ? 'text' : 'password'}
                          value={sdmxApiKey}
                          onChange={(e) => setSdmxApiKey(e.target.value)}
                          placeholder="Örn: 9f8a7b6c5d4e3f2a1b0c..."
                          className="w-full text-xs font-mono bg-white border border-[#D8D2C2] rounded-lg pl-9 pr-24 py-2.5 outline-none focus:border-[#5B6B32]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowApiKey(!showApiKey)}
                          className="absolute right-3 text-xs text-[#6B7260] hover:text-[#1C2418] flex items-center gap-1 font-semibold"
                        >
                          {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          {showApiKey ? 'Gizle' : 'Göster'}
                        </button>
                      </div>
                      <p className="text-[11px] text-[#A6AC9A] mt-1">
                        Anahtarınız yalnızca tarayıcınızın yerel depolama (localStorage) alanında tutulur; hiçbir sunucuya gönderilmez.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                      <button
                        onClick={handleGetTuikToken}
                        disabled={sdmxIsLoadingToken || !sdmxApiKey.trim()}
                        className="px-4 py-2 text-xs font-bold text-white bg-[#5B6B32] hover:bg-[#4E5C2A] disabled:opacity-50 rounded-lg transition-all flex items-center gap-2 shadow-sm"
                      >
                        <Zap className="w-4 h-4 text-amber-300" />
                        {sdmxIsLoadingToken ? 'TÜİK İle Doğrulanıyor...' : 'TÜİK\'ten Token Al (OAuth2)'}
                      </button>

                      {sdmxApiKey && (
                        <button
                          onClick={() => handleSaveApiKey(sdmxApiKey)}
                          className="px-3 py-2 text-xs font-semibold text-[#1C2418] bg-white border border-[#D8D2C2] hover:bg-[#F0EDE4] rounded-lg transition-colors"
                        >
                          Anahtarı Kaydet
                        </button>
                      )}
                    </div>

                    {sdmxTokenError && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                        <span>{sdmxTokenError}</span>
                      </div>
                    )}
                  </div>

                  {/* Sağ: Token Durum Rozeti ve Rehber */}
                  <div className="bg-[#FBF9F4] p-4 rounded-xl border border-[#D8D2C2] flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-[#6B7260] uppercase tracking-wider block mb-1">
                        Erişim Belirteci Durumu
                      </span>
                      {sdmxToken ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Bearer Token Aktif</span>
                          </div>
                          <div className="font-mono text-[10px] bg-white p-2 rounded border border-[#D8D2C2] text-[#1C2418] break-all">
                            {sdmxToken.access_token.slice(0, 32)}...{sdmxToken.access_token.slice(-16)}
                          </div>
                          <div className="text-[10px] text-[#6B7260]">
                            Geçerlilik: <strong>{sdmxToken.expires_in} saniye</strong> ({new Date(sdmxToken.obtainedAt).toLocaleTimeString('tr-TR')})
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-[#6B7260] space-y-1">
                          <p>Henüz aktif bir belirteç alınmadı.</p>
                          <div className="text-[11px] text-[#A6AC9A] mt-2">
                            <strong>Nasıl Alınır?</strong><br />
                            TÜİK Veri Portalı &gt; Kullanıcı Ayarları &gt; Kullanıcı Bilgileri &gt; Telefon SMS Doğrulama &gt; API Anahtarı.
                          </div>
                        </div>
                      )}
                    </div>

                    {sdmxToken && (
                      <div className="mt-3 pt-2 border-t border-[#D8D2C2] flex justify-end">
                        <button
                          onClick={() => copySnippet(sdmxToken.access_token, 'token')}
                          className="text-[11px] font-semibold text-[#5B6B32] hover:underline flex items-center gap-1"
                        >
                          <Copy className="w-3.5 h-3.5" /> Token'ı Kopyala
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 2. ADIM: VERİ AKIŞI (DATAFLOW) VE SORGULAMA PARAMETRELERİ (5.1 & 6.1) */}
              <div className="atlas-card p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-4 border-b border-[#F0EDE4] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#C47A3A] text-white text-xs font-bold flex items-center justify-center">2</span>
                    <h4 className="text-sm font-bold text-[#1C2418]">
                      Tarımsal Veri Akışı (Dataflow) ve Filtre Seçimi
                    </h4>
                  </div>
                  <span className="text-[11px] text-[#6B7260] font-mono">
                    GET nsiws.tuik.gov.tr/rest/data/...
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Veri Akışı Seçimi */}
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-[#6B7260] uppercase tracking-wider mb-1">
                      Resmî TÜİK Veri Akışı (Dataflow)
                    </label>
                    <select
                      value={selectedDataflowId}
                      onChange={(e) => {
                        setSelectedDataflowId(e.target.value);
                        if (e.target.value !== 'custom') setCustomDataflowId('');
                      }}
                      className="w-full text-xs font-semibold bg-white border border-[#D8D2C2] rounded-lg px-3 py-2 outline-none focus:border-[#5B6B32]"
                    >
                      {PREDEFINED_AGRI_DATAFLOWS.map(df => (
                        <option key={df.dataflowId} value={df.dataflowId}>
                          {df.nameTr} [{df.dataflowId}]
                        </option>
                      ))}
                      <option value="custom">✍️ Özel Veri Akışı ID'si Gir...</option>
                    </select>

                    {selectedDataflowId === 'custom' && (
                      <input
                        type="text"
                        value={customDataflowId}
                        onChange={(e) => setCustomDataflowId(e.target.value)}
                        placeholder="Örn: DF_TARIM_GFE_2020"
                        className="w-full mt-2 text-xs font-mono bg-white border border-[#D8D2C2] rounded-lg px-3 py-2 outline-none focus:border-[#5B6B32]"
                      />
                    )}
                  </div>

                  {/* Format Seçimi */}
                  <div>
                    <label className="block text-[11px] font-bold text-[#6B7260] uppercase tracking-wider mb-1">
                      Çıktı Formatı (?format=)
                    </label>
                    <select
                      value={sdmxFormat}
                      onChange={(e) => setSdmxFormat(e.target.value as any)}
                      className="w-full text-xs font-semibold bg-white border border-[#D8D2C2] rounded-lg px-3 py-2 outline-none focus:border-[#5B6B32]"
                    >
                      <option value="SDMX-CSV">SDMX-CSV 1.0 (Tablo & Analiz Uyumlu)</option>
                      <option value="JSON">JSON (JSON-stat Formatı)</option>
                      <option value="SDMX_2_1_STRUCTURED">SDMX-ML 2.1 Structured Data (XML)</option>
                    </select>
                  </div>

                  {/* Seri Anahtarı (Dimensions) */}
                  <div>
                    <label className="block text-[11px] font-bold text-[#6B7260] uppercase tracking-wider mb-1">
                      Seri Anahtarı / Boyut Filtresi
                    </label>
                    <input
                      type="text"
                      value={sdmxSeriesKey}
                      onChange={(e) => setSdmxSeriesKey(e.target.value)}
                      placeholder="Örn: A.TR.13.1_A_1 veya .....3"
                      className="w-full text-xs font-mono bg-white border border-[#D8D2C2] rounded-lg px-3 py-2 outline-none focus:border-[#5B6B32]"
                    />
                  </div>

                  {/* Başlangıç Yılı */}
                  <div>
                    <label className="block text-[11px] font-bold text-[#6B7260] uppercase tracking-wider mb-1">
                      Başlangıç Yılı (?startPeriod=)
                    </label>
                    <input
                      type="number"
                      value={sdmxStartPeriod}
                      onChange={(e) => setSdmxStartPeriod(parseInt(e.target.value, 10))}
                      className="w-full text-xs font-semibold bg-white border border-[#D8D2C2] rounded-lg px-3 py-2 outline-none focus:border-[#5B6B32]"
                    />
                  </div>

                  {/* Bitiş Yılı */}
                  <div>
                    <label className="block text-[11px] font-bold text-[#6B7260] uppercase tracking-wider mb-1">
                      Bitiş Yılı (?endPeriod=)
                    </label>
                    <input
                      type="number"
                      value={sdmxEndPeriod}
                      onChange={(e) => setSdmxEndPeriod(parseInt(e.target.value, 10))}
                      className="w-full text-xs font-semibold bg-white border border-[#D8D2C2] rounded-lg px-3 py-2 outline-none focus:border-[#5B6B32]"
                    />
                  </div>
                </div>

                {/* Dinamik URL Göstergesi */}
                <div className="mt-4 pt-3 border-t border-[#F0EDE4]">
                  <span className="text-[10px] font-bold text-[#6B7260] uppercase tracking-wider block mb-1">
                    Üretilen TÜİK SDMX REST İstek URL'si:
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 font-mono text-xs bg-[#FBF9F4] p-2.5 rounded-lg border border-[#D8D2C2] text-[#1C2418] break-all select-all">
                      {currentSdmxDataUrl}
                    </div>
                    <button
                      onClick={() => copySnippet(currentSdmxDataUrl, 'url')}
                      className="p-2.5 text-xs bg-white hover:bg-[#F0EDE4] border border-[#D8D2C2] rounded-lg transition-colors shrink-0"
                      title="URL'yi Kopyala"
                    >
                      {sdmxCopiedKey === 'url' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-[#6B7260]" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* 3. ADIM: CANLI SORGULAMA & TERMİNAL ENTEGRASYON KONSOLU */}
              <div className="atlas-card p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-4 border-b border-[#F0EDE4] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#1C2418] text-white text-xs font-bold flex items-center justify-center">3</span>
                    <h4 className="text-sm font-bold text-[#1C2418]">
                      Canlı Sorgulama ve Konsol Entegrasyonu
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleRunSdmxLiveQuery}
                      disabled={sdmxIsLoadingQuery || !sdmxToken}
                      className="px-4 py-2 text-xs font-bold text-white bg-[#C47A3A] hover:bg-[#B36829] disabled:opacity-50 rounded-lg transition-all flex items-center gap-2 shadow-sm"
                    >
                      <Zap className="w-4 h-4" />
                      {sdmxIsLoadingQuery ? 'TÜİK Servisinden Çekiliyor...' : '⚡ Canlı Servisten Çek (Fetch)'}
                    </button>
                  </div>
                </div>

                {/* Hata veya CORS Bilgilendirmesi */}
                {sdmxQueryError && (
                  <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
                    <div className="font-bold flex items-center gap-1.5 text-amber-800">
                      <AlertCircle className="w-4 h-4" />
                      Tarayıcı Koruması / Doğrudan Bağlantı Notu
                    </div>
                    <p className="leading-relaxed">
                      {sdmxQueryError}
                    </p>
                  </div>
                )}

                {/* 1 Tıkla Kopyalanabilir Terminal ve Kod Şablonları */}
                <div className="mb-4">
                  <div className="text-[11px] font-bold text-[#6B7260] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-[#5B6B32]" />
                    <span>Terminal ve Yazılım İçin Hazır İstek Kodları (1 Tıkla Kopyala)</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* cURL */}
                    <div className="bg-[#1C2418] text-white p-3 rounded-xl shadow-xs">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-bold text-amber-300 font-mono">cURL Komutu</span>
                        <button
                          onClick={() => copySnippet(generateSdmxCurlCommand(sdmxToken?.access_token || '', currentSdmxDataUrl), 'curl')}
                          className="px-2 py-0.5 text-[10px] bg-white/10 hover:bg-white/20 rounded text-[#D8D2C2] flex items-center gap-1"
                        >
                          {sdmxCopiedKey === 'curl' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          Kopyala
                        </button>
                      </div>
                      <pre className="text-[10px] text-white/80 font-mono overflow-x-auto whitespace-pre-wrap">
                        {generateSdmxCurlCommand(sdmxToken?.access_token || '{token}', currentSdmxDataUrl)}
                      </pre>
                    </div>

                    {/* PowerShell */}
                    <div className="bg-[#1C2418] text-white p-3 rounded-xl shadow-xs">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-bold text-sky-300 font-mono">PowerShell</span>
                        <button
                          onClick={() => copySnippet(generateSdmxPowerShellCommand(sdmxToken?.access_token || '', currentSdmxDataUrl), 'ps')}
                          className="px-2 py-0.5 text-[10px] bg-white/10 hover:bg-white/20 rounded text-[#D8D2C2] flex items-center gap-1"
                        >
                          {sdmxCopiedKey === 'ps' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          Kopyala
                        </button>
                      </div>
                      <pre className="text-[10px] text-white/80 font-mono overflow-x-auto whitespace-pre-wrap">
                        {generateSdmxPowerShellCommand(sdmxToken?.access_token || '{token}', currentSdmxDataUrl)}
                      </pre>
                    </div>

                    {/* Python */}
                    <div className="bg-[#1C2418] text-white p-3 rounded-xl shadow-xs">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-bold text-emerald-300 font-mono">Python Requests</span>
                        <button
                          onClick={() => copySnippet(generateSdmxPythonScript(sdmxToken?.access_token || '', currentSdmxDataUrl), 'py')}
                          className="px-2 py-0.5 text-[10px] bg-white/10 hover:bg-white/20 rounded text-[#D8D2C2] flex items-center gap-1"
                        >
                          {sdmxCopiedKey === 'py' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          Kopyala
                        </button>
                      </div>
                      <pre className="text-[10px] text-white/80 font-mono overflow-x-auto whitespace-pre-wrap">
                        {generateSdmxPythonScript(sdmxToken?.access_token || '{token}', currentSdmxDataUrl)}
                      </pre>
                    </div>
                  </div>
                </div>

                {/* SDMX Yanıt / Yapıştırma Alanı */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-bold text-[#6B7260] uppercase tracking-wider">
                      SDMX-CSV veya JSON Servis Yanıtı (Buraya Yapıştırabilirsiniz)
                    </label>
                    {sdmxRawResponse && (
                      <span className="text-[11px] text-[#5B6B32] font-semibold">
                        {sdmxRawResponse.length} Karakter Yüklendi
                      </span>
                    )}
                  </div>
                  <textarea
                    rows={6}
                    value={sdmxRawResponse}
                    onChange={(e) => setSdmxRawResponse(e.target.value)}
                    placeholder="Terminalde veya Postman'de çalıştırdığınız SDMX-CSV çıktısını buraya yapıştırıp analiz tablosuna aktarabilirsiniz..."
                    className="w-full text-xs font-mono bg-white border border-[#D8D2C2] rounded-xl p-3 outline-none focus:border-[#5B6B32]"
                  />

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-[11px] text-[#6B7260]">
                      Format: Standart <strong>SDMX-CSV 1.0</strong> (DATAFLOW, TIME_PERIOD, REF_AREA, OBS_VALUE).
                    </p>

                    <button
                      onClick={handleParseSdmxResponseAndAddToAnalysis}
                      disabled={!sdmxRawResponse.trim()}
                      className="px-4 py-2 text-xs font-bold text-white bg-[#5B6B32] hover:bg-[#4E5C2A] disabled:opacity-50 rounded-lg transition-all flex items-center gap-2 shadow-sm"
                    >
                      <PlusCircle className="w-4 h-4" /> Bu Yanıtı Ayrıştır ve Analiz Panosuna Aktar
                    </button>
                  </div>
                </div>

              </div>

            </div>
          )}

        </main>
      </div>

    </div>
  );
};
