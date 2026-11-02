/**
 * TarımViz — TÜİK Resmî SDMX REST Web Servis İstemcisi ve Entegrasyon Motoru
 * 
 * Kaynak: TÜİK SDMX Web Servis Dokümantasyonu (SDMX REST API Specification v1.5)
 * - Kimlik Doğrulama: https://giris.tuik.gov.tr/realms/web/protocol/openid-connect/token
 * - Veri ve Metaveri Servisi: https://nsiws.tuik.gov.tr/rest
 */

import { TarimRecord } from './analysis.ts';

// ============================================================================
// 1. TÜİK SDMX RESMÎ SABİTLERİ VE ENDPOINT'LERİ
// ============================================================================

export const TUIK_SDMX_CONFIG = {
  // Kimlik Doğrulama Servisi
  authUrl: 'https://giris.tuik.gov.tr/realms/web/protocol/openid-connect/token',
  clientId: 'nsi-ws-consumer',
  grantType: 'password',

  // REST API Web Servisi
  baseRestUrl: 'https://nsiws.tuik.gov.tr/rest',
  agencyId: 'TR',

  // Toplu Veri İndirme (Bulk Download) Servisi
  bulkDownloadUrl: 'https://veriportali.tuik.gov.tr/tr/bulk-download',

  // Desteklenen Çıktı Formatları
  supportedFormats: {
    sdmxCsv: 'SDMX-CSV',
    jsonStat: 'JSON',
    sdmxStructured: 'SDMX_2_1_STRUCTURED',
    sdmxGeneric: 'SDMX-ML'
  }
} as const;

export interface TuikTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_expires_in?: number;
  token_type: string;
  scope?: string;
  obtainedAt: number; // Date.now()
}

export interface SdmxDataflowMeta {
  dataflowId: string;
  version: string;
  agencyId: string;
  nameTr: string;
  nameEn?: string;
  descriptionTr?: string;
  dsdId: string;
  dsdVersion: string;
  konuKodu?: string;
}

// Önceden Haritalandırılmış TÜİK Tarımsal Veri Akışları (Dataflows)
export const PREDEFINED_AGRI_DATAFLOWS: SdmxDataflowMeta[] = [
  {
    dataflowId: 'DF_TARIM_GFE_2020',
    version: '1.0',
    agencyId: 'TR',
    nameTr: 'Tarımsal Girdi Fiyat Endeksi (Tarım-GFE, 2020=100)',
    nameEn: 'Agricultural Input Price Index',
    descriptionTr: 'Girdi 1 (%88,87 ara tüketim) ve Girdi 2 (%11,13 yatırım) ana/alt grupları zaman serileri.',
    dsdId: 'DSD_TARIM_GFE',
    dsdVersion: '1.0',
    konuKodu: 'kn=82'
  },
  {
    dataflowId: 'DF_TARIM_UFE_2020',
    version: '1.0',
    agencyId: 'TR',
    nameTr: 'Tarım Ürünleri Üretici Fiyat Endeksi (Tarım-ÜFE, 2020=100)',
    nameEn: 'Agricultural Producer Price Index',
    descriptionTr: 'Bitkisel ve hayvansal ürünler aylık çiftçi üretici fiyat endeks serileri.',
    dsdId: 'DSD_TARIM_UFE',
    dsdVersion: '1.0',
    konuKodu: 'kn=83'
  },
  {
    dataflowId: 'DF_BITKISEL_URETIM',
    version: '1.0',
    agencyId: 'TR',
    nameTr: 'Bitkisel Üretim İstatistikleri (BÜİ — İl Bazlı Ton/Dekar)',
    nameEn: 'Crop Production Statistics',
    descriptionTr: '81 il düzeyinde tahıllar, sebzeler ve meyveler ekilen alan, hasat ve üretim miktarları.',
    dsdId: 'DSD_BITKISEL_URETIM',
    dsdVersion: '1.0',
    konuKodu: 'kn=92'
  },
  {
    dataflowId: 'DF_BITKISEL_DENGE',
    version: '1.0',
    agencyId: 'TR',
    nameTr: 'Bitkisel Ürün Denge Tabloları (Arz, Tüketim, Yeterlilik %)',
    nameEn: 'Supply and Utilization Accounts for Crops',
    descriptionTr: 'Üretim, ithalat, ihracat, kişi başı tüketim ve yeterlilik derecesi (%) göstergeleri.',
    dsdId: 'DSD_BITKISEL_DENGE',
    dsdVersion: '1.0',
    konuKodu: 'kn=104'
  },
  {
    dataflowId: 'DF_HAYVANSAL_URETIM',
    version: '1.0',
    agencyId: 'TR',
    nameTr: 'Hayvansal Üretim İstatistikleri (HÜİ — Hayvan Sayıları & Süt)',
    nameEn: 'Animal Production Statistics',
    descriptionTr: 'İl bazlı büyükbaş, küçükbaş hayvan varlığı ve süt, yün, yumurta üretim miktarları.',
    dsdId: 'DSD_HAYVANSAL_URETIM',
    dsdVersion: '1.0',
    konuKodu: 'kn=101'
  }
];

// ============================================================================
// 2. TOKEN VE KİMLİK DOĞRULAMA FONKSİYONLARI
// ============================================================================

/**
 * TÜİK OpenID Connect üzerinden SMS Doğrulamalı API Key ile Token Alır
 * curl -X POST "https://giris.tuik.gov.tr/realms/web/protocol/openid-connect/token" \
 *   --header "Content-Type: application/x-www-form-urlencoded" \
 *   --data "grant_type=password" \
 *   --data "client_id=nsi-ws-consumer" \
 *   --data "api_key={API KEY}"
 */
export async function requestTuikAccessToken(apiKey: string): Promise<TuikTokenResponse> {
  const cleanKey = apiKey.trim();
  if (!cleanKey) {
    throw new Error('TÜİK API Anahtarı boş bırakılamaz.');
  }

  const params = new URLSearchParams();
  params.append('grant_type', TUIK_SDMX_CONFIG.grantType);
  params.append('client_id', TUIK_SDMX_CONFIG.clientId);
  params.append('api_key', cleanKey);

  const response = await fetch(TUIK_SDMX_CONFIG.authUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params.toString()
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `TÜİK Token Alımı Başarısız (${response.status}): ${response.statusText}. ` +
      `Lütfen TÜİK Veri Portalı Kullanıcı Ayarları'ndan SMS doğrulaması ile ürettiğiniz geçerli API anahtarını kontrol edin.`
    );
  }

  const data = await response.json();
  if (!data.access_token) {
    throw new Error('TÜİK giriş servisi geçerli bir access_token döndürmedi.');
  }

  return {
    access_token: data.access_token,
    expires_in: data.expires_in || 300,
    refresh_expires_in: data.refresh_expires_in,
    token_type: data.token_type || 'Bearer',
    scope: data.scope,
    obtainedAt: Date.now()
  };
}

// ============================================================================
// 3. SDMX REST URL OLUŞTURUCULARI
// ============================================================================

export interface SdmxDataQueryParams {
  dataflowId: string;
  version?: string;
  seriesKey?: string; // Örn: 'A.TR.13.1_A_1' veya '.....3'
  startPeriod?: number | string; // Örn: 2020
  endPeriod?: number | string;   // Örn: 2026
  format?: 'SDMX-CSV' | 'JSON' | 'SDMX_2_1_STRUCTURED';
}

/**
 * TÜİK SDMX Veri Sorgulama URL'sini Üretir:
 * https://nsiws.tuik.gov.tr/rest/data/TR,{dataflowId},{version}/{seriesKey}?startPeriod=...&endPeriod=...&format=...
 */
export function buildSdmxDataUrl(params: SdmxDataQueryParams): string {
  const version = params.version || '1.0';
  const series = params.seriesKey ? `/${params.seriesKey.trim()}` : '';
  const searchParams = new URLSearchParams();

  if (params.startPeriod) {
    searchParams.append('startPeriod', String(params.startPeriod));
  }
  if (params.endPeriod) {
    searchParams.append('endPeriod', String(params.endPeriod));
  }
  if (params.format) {
    searchParams.append('format', params.format);
  }

  const queryStr = searchParams.toString() ? `?${searchParams.toString()}` : '';
  return `${TUIK_SDMX_CONFIG.baseRestUrl}/data/${TUIK_SDMX_CONFIG.agencyId},${params.dataflowId},${version}${series}${queryStr}`;
}

/**
 * Dataflow Metaveri ve DSD Bağlantı URL'sini Üretir:
 * https://nsiws.tuik.gov.tr/rest/dataflow/TR/{dataflowId}/{version}?references=descendants
 */
export function buildSdmxDataflowUrl(dataflowId: string, version: string = '1.0', references: 'descendants' | 'children' | 'none' = 'none'): string {
  const refQuery = references !== 'none' ? `?references=${references}` : '';
  return `${TUIK_SDMX_CONFIG.baseRestUrl}/dataflow/${TUIK_SDMX_CONFIG.agencyId}/${dataflowId}/${version}/${refQuery}`;
}

/**
 * Veri Yapısı Tanımı (DSD) URL'sini Üretir:
 * https://nsiws.tuik.gov.tr/rest/datastructure/TR/{dsdId}/{version}
 */
export function buildSdmxDsdUrl(dsdId: string, version: string = '1.0'): string {
  return `${TUIK_SDMX_CONFIG.baseRestUrl}/datastructure/${TUIK_SDMX_CONFIG.agencyId}/${dsdId}/${version}`;
}

/**
 * Kod Listesi (Codelist) URL'sini Üretir:
 * https://nsiws.tuik.gov.tr/rest/codelist/TR/{codelistId}/{version}
 */
export function buildSdmxCodelistUrl(codelistId?: string, version: string = '1.0'): string {
  if (!codelistId || codelistId === 'all') {
    return `${TUIK_SDMX_CONFIG.baseRestUrl}/codelist/${TUIK_SDMX_CONFIG.agencyId}/all`;
  }
  return `${TUIK_SDMX_CONFIG.baseRestUrl}/codelist/${TUIK_SDMX_CONFIG.agencyId}/${codelistId}/${version}`;
}

// ============================================================================
// 4. KULLANICI İÇİN KONSOL / SCRIPT ÜRETEÇLERİ (CURL, POWERSHELL, PYTHON)
// ============================================================================

/**
 * Resmî dokümantasyonda tanımlanan cURL komutunu üretir
 */
export function generateSdmxCurlCommand(token: string, targetUrl: string): string {
  const safeToken = token || '{access_token}';
  return `curl -X GET "${targetUrl}" \\\n  --header "Authorization: Bearer ${safeToken}" \\\n  --verbose`;
}

/**
 * Windows PowerShell için hazır Invoke-RestMethod script'i üretir
 */
export function generateSdmxPowerShellCommand(token: string, targetUrl: string): string {
  const safeToken = token || '{access_token}';
  return `$headers = @{\n  "Authorization" = "Bearer ${safeToken}"\n}\nInvoke-RestMethod -Uri "${targetUrl}" -Method Get -Headers $headers`;
}

/**
 * Python 'requests' kütüphanesi için hazır kod üretir
 */
export function generateSdmxPythonScript(token: string, targetUrl: string): string {
  const safeToken = token || '{access_token}';
  return `import requests\n\nurl = "${targetUrl}"\nheaders = {\n    "Authorization": "Bearer ${safeToken}"\n}\n\nresponse = requests.get(url, headers=headers)\nprint(response.status_code)\nprint(response.text[:500])`;
}

// ============================================================================
// 5. SDMX-CSV YANIT AYRIŞTIRICI VE TARIMVİZ KAYIT DÖNÜŞTÜRÜCÜSÜ
// ============================================================================

/**
 * TÜİK SDMX-CSV 1.0 formatındaki yanıtı TarımViz TarimRecord[] modeline dönüştürür.
 * 
 * Standart SDMX-CSV Başlıkları:
 * DATAFLOW, FREQ, REF_AREA, INDICATOR, TIME_PERIOD, OBS_VALUE, OBS_FLAG, UNIT_MEASURE, etc.
 */
export function parseSdmxCsvToTarimRecords(csvText: string, metadataFallback?: Partial<TarimRecord>): {
  records: TarimRecord[];
  warnings: string[];
} {
  const lines = csvText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const warnings: string[] = [];
  const records: TarimRecord[] = [];

  if (lines.length < 2) {
    return { records: [], warnings: ['SDMX-CSV içeriği boş veya yalnızca başlık satırından oluşuyor.'] };
  }

  // Başlıkları ayıkla
  const headerLine = lines[0];
  const delimiter = headerLine.includes(';') ? ';' : ',';
  const headers = headerLine.split(delimiter).map(h => h.trim().toUpperCase().replace(/^"|"$/g, ''));

  const findColIndex = (...candidates: string[]): number => {
    for (const c of candidates) {
      const idx = headers.indexOf(c.toUpperCase());
      if (idx !== -1) return idx;
    }
    return -1;
  };

  const colTime = findColIndex('TIME_PERIOD', 'TIME', 'YIL', 'PERIOD');
  const colVal = findColIndex('OBS_VALUE', 'VALUE', 'DEGER', 'MIKTAR');
  const colArea = findColIndex('REF_AREA', 'IBBS', 'IL', 'GEO');
  const colIndicator = findColIndex('INDICATOR', 'GOSTERGE', 'URUN', 'MADDE');
  const colUnit = findColIndex('UNIT_MEASURE', 'UNIT', 'BIRIM');

  if (colTime === -1 || colVal === -1) {
    warnings.push('SDMX-CSV dosyasında zorunlu TIME_PERIOD veya OBS_VALUE sütunu tespit edilemedi.');
  }

  for (let i = 1; i < lines.length; i++) {
    const rawCols = lines[i].split(delimiter).map(c => c.trim().replace(/^"|"$/g, ''));
    if (rawCols.length < 2) continue;

    const rawTime = colTime !== -1 ? rawCols[colTime] : '2026';
    const yearMatch = rawTime.match(/\b(19\d\d|20\d\d)\b/);
    const yil = yearMatch ? parseInt(yearMatch[1], 10) : (metadataFallback?.yil || 2026);

    const rawVal = colVal !== -1 ? rawCols[colVal].replace(',', '.') : '0';
    const numVal = parseFloat(rawVal);
    if (isNaN(numVal)) continue;

    const rawArea = colArea !== -1 ? rawCols[colArea] : (metadataFallback?.il || 'Türkiye Geneli');
    const rawIndicator = colIndicator !== -1 ? rawCols[colIndicator] : (metadataFallback?.urun || 'Tarımsal Gösterge');
    const rawUnit = colUnit !== -1 ? rawCols[colUnit] : (metadataFallback?.uretim_birimi || 'Ton');

    records.push({
      id: `sdmx-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
      il: rawArea,
      yil,
      sektor: metadataFallback?.sektor || 'bitkisel',
      urun: rawIndicator,
      uretim_miktari: numVal,
      uretim_birimi: rawUnit,
      kaynak: 'TÜİK SDMX Web Servisi (nsiws.tuik.gov.tr)',
      cografi_duzey: rawArea.toLowerCase().includes('türkiye') ? 'Ulusal' : 'İl',
      donem: rawTime,
      veri_durumu: 'kesin'
    });
  }

  return { records, warnings };
}
