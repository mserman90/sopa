import { describe, it, expect } from 'vitest';
import {
  TUIK_SDMX_CONFIG,
  PREDEFINED_AGRI_DATAFLOWS,
  buildSdmxDataUrl,
  buildSdmxDataflowUrl,
  buildSdmxDsdUrl,
  buildSdmxCodelistUrl,
  generateSdmxCurlCommand,
  generateSdmxPowerShellCommand,
  generateSdmxPythonScript,
  parseSdmxCsvToTarimRecords,
  requestTuikAccessToken
} from './tuikSdmx.ts';

describe('TÜİK Resmî SDMX REST Web Servisi Entegrasyonu', () => {

  it('1. TÜİK SDMX Endpoint ve konfigürasyon sabitleri dokümantasyon ile birebir eşleşmelidir', () => {
    expect(TUIK_SDMX_CONFIG.authUrl).toBe('https://giris.tuik.gov.tr/realms/web/protocol/openid-connect/token');
    expect(TUIK_SDMX_CONFIG.baseRestUrl).toBe('https://nsiws.tuik.gov.tr/rest');
    expect(TUIK_SDMX_CONFIG.clientId).toBe('nsi-ws-consumer');
    expect(TUIK_SDMX_CONFIG.agencyId).toBe('TR');
    expect(TUIK_SDMX_CONFIG.supportedFormats.sdmxCsv).toBe('SDMX-CSV');
    expect(TUIK_SDMX_CONFIG.supportedFormats.jsonStat).toBe('JSON');
    expect(TUIK_SDMX_CONFIG.supportedFormats.sdmxStructured).toBe('SDMX_2_1_STRUCTURED');
  });

  it('2. Önceden haritalanmış tarımsal dataflow listesi (Tarım-GFE, Tarım-ÜFE, BÜİ, Denge) tanımlı olmalıdır', () => {
    expect(PREDEFINED_AGRI_DATAFLOWS.length).toBeGreaterThanOrEqual(4);
    const tgfe = PREDEFINED_AGRI_DATAFLOWS.find(d => d.dataflowId === 'DF_TARIM_GFE_2020');
    expect(tgfe).toBeDefined();
    expect(tgfe?.agencyId).toBe('TR');
    expect(tgfe?.konuKodu).toBe('kn=82');

    const denge = PREDEFINED_AGRI_DATAFLOWS.find(d => d.dataflowId === 'DF_BITKISEL_DENGE');
    expect(denge).toBeDefined();
    expect(denge?.konuKodu).toBe('kn=104');
  });

  it('3. buildSdmxDataUrl dokümandaki URL yapısını (Boyutlar, Zaman, Format) eksiksiz üretmelidir', () => {
    // Örnek doküman formatı:
    // https://nsiws.tuik.gov.tr/rest/data/TR,DF_EMISYON_DEGISIM_ORAN,1.1/A.TR.13.1_A_1.C_ROCGHG.3?startPeriod=2008&endPeriod=2010&format=SDMX-CSV
    const url = buildSdmxDataUrl({
      dataflowId: 'DF_TARIM_GFE_2020',
      version: '1.0',
      seriesKey: 'A.TR.GIRDI1.GUBRE',
      startPeriod: 2020,
      endPeriod: 2026,
      format: 'SDMX-CSV'
    });

    expect(url).toBe('https://nsiws.tuik.gov.tr/rest/data/TR,DF_TARIM_GFE_2020,1.0/A.TR.GIRDI1.GUBRE?startPeriod=2020&endPeriod=2026&format=SDMX-CSV');
  });

  it('4. buildSdmxDataflowUrl, buildSdmxDsdUrl ve buildSdmxCodelistUrl geçerli URL üretmelidir', () => {
    const dfUrl = buildSdmxDataflowUrl('DF_BITKISEL_URETIM', '1.0', 'descendants');
    expect(dfUrl).toBe('https://nsiws.tuik.gov.tr/rest/dataflow/TR/DF_BITKISEL_URETIM/1.0/?references=descendants');

    const dsdUrl = buildSdmxDsdUrl('DSD_BITKISEL_URETIM', '1.0');
    expect(dsdUrl).toBe('https://nsiws.tuik.gov.tr/rest/datastructure/TR/DSD_BITKISEL_URETIM/1.0');

    const clUrl = buildSdmxCodelistUrl('all');
    expect(clUrl).toBe('https://nsiws.tuik.gov.tr/rest/codelist/TR/all');
  });

  it('5. cURL, PowerShell ve Python komut üreteçleri token ve hedef URL ile çalışmalıdır', () => {
    const testUrl = 'https://nsiws.tuik.gov.tr/rest/data/TR,DF_TARIM_GFE_2020,1.0?format=SDMX-CSV';
    const token = 'test-token-12345';

    const curl = generateSdmxCurlCommand(token, testUrl);
    expect(curl).toContain('curl -X GET');
    expect(curl).toContain('Authorization: Bearer test-token-12345');
    expect(curl).toContain(testUrl);

    const ps = generateSdmxPowerShellCommand(token, testUrl);
    expect(ps).toContain('Invoke-RestMethod');
    expect(ps).toContain('test-token-12345');

    const py = generateSdmxPythonScript(token, testUrl);
    expect(py).toContain('import requests');
    expect(py).toContain('test-token-12345');
  });

  it('6. parseSdmxCsvToTarimRecords geçerli SDMX-CSV çıktısını TarimRecord modeline çevirmelidir', () => {
    const sampleCsv = `DATAFLOW,FREQ,REF_AREA,INDICATOR,TIME_PERIOD,OBS_VALUE,OBS_FLAG,UNIT_MEASURE
TR:DF_BITKISEL_URETIM(1.0),A,Konya,Ekmeklik Buğday,2025,1850000,,Ton
TR:DF_BITKISEL_URETIM(1.0),A,Adana,Mısır,2025,950000,,Ton`;

    const { records, warnings } = parseSdmxCsvToTarimRecords(sampleCsv);

    expect(warnings.length).toBe(0);
    expect(records.length).toBe(2);

    expect(records[0].il).toBe('Konya');
    expect(records[0].urun).toBe('Ekmeklik Buğday');
    expect(records[0].yil).toBe(2025);
    expect(records[0].uretim_miktari).toBe(1850000);
    expect(records[0].uretim_birimi).toBe('Ton');
    expect(records[0].kaynak).toBe('TÜİK SDMX Web Servisi (nsiws.tuik.gov.tr)');

    expect(records[1].il).toBe('Adana');
    expect(records[1].urun).toBe('Mısır');
    expect(records[1].uretim_miktari).toBe(950000);
  });

  it('7. Boş API anahtarı ile istek yapıldığında hata fırlatmalıdır', async () => {
    await expect(requestTuikAccessToken('')).rejects.toThrow('TÜİK API Anahtarı boş bırakılamaz');
    await expect(requestTuikAccessToken('   ')).rejects.toThrow('TÜİK API Anahtarı boş bırakılamaz');
  });

});
