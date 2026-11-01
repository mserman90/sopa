// app.js – TÜİK İl Bazlı Tarımsal Girdi Analizi
"use strict";

// --- DATA STRUCTURES ---
const cities = [
    "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Amasya", "Ankara", "Antalya", "Artvin", "Aydın", "Balıkesir",
    "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa", "Çanakkale", "Çankırı", "Çorum", "Denizli",
    "Diyarbakır", "Edirne", "Elazığ", "Erzincan", "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkari",
    "Hatay", "Isparta", "Mersin", "İstanbul", "İzmir", "Kars", "Kastamonu", "Kayseri", "Kırklareli", "Kırşehir",
    "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa", "Kahramanmaraş", "Mardin", "Muğla", "Muş", "Nevşehir",
    "Niğde", "Ordu", "Rize", "Sakarya", "Samsun", "Siirt", "Sinop", "Sivas", "Tekirdağ", "Tokat",
    "Trabzon", "Tunceli", "Şanlıurfa", "Uşak", "Van", "Yozgat", "Zonguldak", "Aksaray", "Bayburt", "Karaman",
    "Kırıkkale", "Batman", "Şırnak", "Bartın", "Ardahan", "Iğdır", "Yalova", "Karabük", "Kilis", "Osmaniye", "Düzce"
];

// Detaylı girdi kalemleri (Tüm ana gruplar ve alt ürünler)
const productDefinitions = [
    // Gübre ve Toprak İyileştiriciler
    { code: 'TGFE-G01', group: 'gubre', subtopic: 'Azotlu Gübreler', name: 'Üre Gübresi (%46 N)', basePrice: 14800.00, unit: 'TL/Ton', baseIndex: 142.5 },
    { code: 'TGFE-G02', group: 'gubre', subtopic: 'Azotlu Gübreler', name: 'Amonyum Sülfat (%21 N)', basePrice: 8900.00, unit: 'TL/Ton', baseIndex: 138.2 },
    { code: 'TGFE-G03', group: 'gubre', subtopic: 'Fosfatlı Gübreler', name: 'DAP Gübresi (18-46-0)', basePrice: 21500.00, unit: 'TL/Ton', baseIndex: 149.0 },
    { code: 'TGFE-G04', group: 'gubre', subtopic: 'Fosfatlı Gübreler', name: 'Kompoze Gübre (15-15-15)', basePrice: 16200.00, unit: 'TL/Ton', baseIndex: 144.1 },
    { code: 'TGFE-G05', group: 'gubre', subtopic: 'Potasyumlu Gübreler', name: 'Potasyum Sülfat Gübresi', basePrice: 26000.00, unit: 'TL/Ton', baseIndex: 151.4 },
    { code: 'TGFE-G06', group: 'gubre', subtopic: 'Kompostlar', name: 'Organik Katı Çiftlik Gübresi / Kompost', basePrice: 1250.00, unit: 'TL/Ton', baseIndex: 130.0 },

    // Hayvan Yemi
    { code: 'TGFE-Y01', group: 'yem', subtopic: 'Büyükbaş Yemleri', name: 'Büyükbaş Besi Yemi (%14 HP)', basePrice: 9.20, unit: 'TL/Kg', baseIndex: 136.4 },
    { code: 'TGFE-Y02', group: 'yem', subtopic: 'Büyükbaş Yemleri', name: 'Büyükbaş Süt Yemi (%19 HP)', basePrice: 10.40, unit: 'TL/Kg', baseIndex: 139.1 },
    { code: 'TGFE-Y03', group: 'yem', subtopic: 'Küçükbaş Yemleri', name: 'Koyun-Kuzu Büyütme Yemi', basePrice: 9.80, unit: 'TL/Kg', baseIndex: 137.0 },
    { code: 'TGFE-Y04', group: 'yem', subtopic: 'Kümes Hayvanı Yemleri', name: 'Yumurtacı Tavuk Yemi', basePrice: 12.50, unit: 'TL/Kg', baseIndex: 141.2 },
    { code: 'TGFE-Y05', group: 'yem', subtopic: 'Silajlık Bitkiler', name: 'Mısır Silajı (Paketli)', basePrice: 2.80, unit: 'TL/Kg', baseIndex: 129.5 },
    { code: 'TGFE-Y06', group: 'yem', subtopic: 'Silajlık Bitkiler', name: 'Yonca Kuru Otu (Balya)', basePrice: 6.50, unit: 'TL/Kg', baseIndex: 133.0 },

    // Tohum ve Fide
    { code: 'TGFE-T01', group: 'tohum', subtopic: 'Tahıl Tohumları', name: 'Sertifikalı Ekmeklik Buğday Tohumu', basePrice: 18.50, unit: 'TL/Kg', baseIndex: 132.8 },
    { code: 'TGFE-T02', group: 'tohum', subtopic: 'Tahıl Tohumları', name: 'Sertifikalı Arpa Tohumu', basePrice: 15.20, unit: 'TL/Kg', baseIndex: 130.4 },
    { code: 'TGFE-T03', group: 'tohum', subtopic: 'Endüstri Bitkileri Tohumları', name: 'Hibrit Mısır Tohumu (50.000 adet)', basePrice: 3450.00, unit: 'TL/Paket', baseIndex: 145.2 },
    { code: 'TGFE-T04', group: 'tohum', subtopic: 'Endüstri Bitkileri Tohumları', name: 'Yağlık Ayçiçeği Tohumu (150.000 adet)', basePrice: 4200.00, unit: 'TL/Paket', baseIndex: 143.0 },
    { code: 'TGFE-T05', group: 'tohum', subtopic: 'Sebze Fideleri', name: 'Aşılı Domates Fidesi', basePrice: 14.50, unit: 'TL/Adet', baseIndex: 148.6 },
    { code: 'TGFE-T06', group: 'tohum', subtopic: 'Meyve Fidanları', name: 'Sertifikalı Zeytin/Meyve Fidanı (Tüplü)', basePrice: 120.00, unit: 'TL/Adet', baseIndex: 138.0 },

    // Enerji ve Yakıtlar
    { code: 'TGFE-E01', group: 'enerji', subtopic: 'Motorin', name: 'Kırsal Motorin (Tarımsal Akaryakıt)', basePrice: 44.80, unit: 'TL/Lt', baseIndex: 154.2 },
    { code: 'TGFE-E02', group: 'enerji', subtopic: 'Benzin', name: 'Kurşunsuz Benzin 95 Oktan', basePrice: 45.20, unit: 'TL/Lt', baseIndex: 152.0 },
    { code: 'TGFE-E03', group: 'enerji', subtopic: 'Elektrik', name: 'Tarımsal Sulama Elektrik Tarifesi', basePrice: 3.10, unit: 'TL/kWh', baseIndex: 146.5 },
    { code: 'TGFE-E04', group: 'enerji', subtopic: 'LPG', name: 'Otogaz / Tarımsal LPG', basePrice: 25.40, unit: 'TL/Lt', baseIndex: 140.8 },
    { code: 'TGFE-E05', group: 'enerji', subtopic: 'Fuel-Oil', name: 'Kalorifer Yakıtı / Fuel-Oil', basePrice: 32.50, unit: 'TL/Kg', baseIndex: 139.0 },

    // Tarım İlaçları
    { code: 'TGFE-I01', group: 'ilac', subtopic: 'Herbisitler (Yabancı Ot)', name: 'Geniş Yapraklı Yabancı Ot İlacı (Herbisit)', basePrice: 650.00, unit: 'TL/Lt', baseIndex: 144.0 },
    { code: 'TGFE-I02', group: 'ilac', subtopic: 'İnsektisitler (Böcek)', name: 'Zararlı Böcek İlacı (İnsektisit)', basePrice: 850.00, unit: 'TL/Lt', baseIndex: 146.5 },
    { code: 'TGFE-I03', group: 'ilac', subtopic: 'Fungusitler (Mantar)', name: 'Külleme ve Pas İlacı (Fungusit)', basePrice: 920.00, unit: 'TL/Lt', baseIndex: 147.2 },

    // Tarım Makine ve Teçhizatı
    { code: 'TGFE-M01', group: 'makine', subtopic: 'Traktörler', name: '75-90 BG Çift Çeker Traktör Endeksi', basePrice: 1750000.00, unit: 'TL', baseIndex: 158.0 },
    { code: 'TGFE-M02', group: 'makine', subtopic: 'Pulluklar', name: '4 Soklu Döner Kulaklı Pulluk', basePrice: 185000.00, unit: 'TL', baseIndex: 143.5 },
    { code: 'TGFE-M03', group: 'makine', subtopic: 'Mibzerler', name: 'Pnömatik Hassas Ekim Mibzeri', basePrice: 320000.00, unit: 'TL', baseIndex: 147.0 },
    { code: 'TGFE-M04', group: 'makine', subtopic: 'Hasat Makineleri', name: 'Biçerdöver ve Balya Makinesi Endeksi', basePrice: 4200000.00, unit: 'TL', baseIndex: 162.0 },
    { code: 'TGFE-M05', group: 'makine', subtopic: 'Sulama Sistemleri', name: 'Damla Sulama Borusu (100m kangal)', basePrice: 1650.00, unit: 'TL/Rulo', baseIndex: 139.4 },

    // Hizmetler (Kira, İşçilik vb.)
    { code: 'TGFE-H01', group: 'hizmet', subtopic: 'İşçilik Ücretleri', name: 'Tarımsal Vasıfsız İşçi (Günlük Yevmiye)', basePrice: 850.00, unit: 'TL/Gün', baseIndex: 152.0 },
    { code: 'TGFE-H02', group: 'hizmet', subtopic: 'İşçilik Ücretleri', name: 'Traktör Operatörü / Usta İşçilik', basePrice: 1400.00, unit: 'TL/Gün', baseIndex: 155.0 },
    { code: 'TGFE-H03', group: 'hizmet', subtopic: 'Tamirat-Bakım', name: 'Traktör ve Makine Periyodik Bakım-Onarım', basePrice: 4500.00, unit: 'TL/İşlem', baseIndex: 148.0 },
    { code: 'TGFE-H04', group: 'hizmet', subtopic: 'Ulaşım-Nakliye', name: 'Ürün Nakliyesi (İl İçi Ortalama Sefer)', basePrice: 3800.00, unit: 'TL/Sefer', baseIndex: 150.5 },
    { code: 'TGFE-H05', group: 'hizmet', subtopic: 'Arazi Kiraları', name: 'Sulu Tarım Arazisi Kirası (Yıllık Dekar)', basePrice: 2200.00, unit: 'TL/Dekar/Yıl', baseIndex: 140.0 },
    { code: 'TGFE-H06', group: 'hizmet', subtopic: 'Sigorta Primleri', name: 'TARSİM Tarım Sigorta Poliçe Ortalaması', basePrice: 1250.00, unit: 'TL/Poliçe', baseIndex: 137.5 }
];

// Dinamik Kategori Eşleme Haritası
const inputCategories = {};
productDefinitions.forEach(p => {
    if (!inputCategories[p.group]) {
        inputCategories[p.group] = [];
    }
    if (!inputCategories[p.group].includes(p.subtopic)) {
        inputCategories[p.group].push(p.subtopic);
    }
});

// Dönem katsayıları
const periods = [
    { id: '2026-10', name: 'Ekim 2026', factor: 1.0 },
    { id: '2026-9', name: 'Eylül 2026', factor: 0.975 },
    { id: '2026-8', name: 'Ağustos 2026', factor: 0.952 },
    { id: '2026-all', name: '2026 Ortalaması', factor: 0.940 }
];

// Bölgesel maliyet katsayısı fonksiyonu (TÜİK İstatistiki Bölge Birimleri dikkate alınarak)
function getRegionCoefficient(city) {
    // Doğu ve Güneydoğu Anadolu (Lojistik/ulaşım mesafesi kaynaklı girdi farkı)
    if (["Erzurum", "Van", "Hakkari", "Ağrı", "Kars", "Iğdır", "Ardahan", "Muş", "Bitlis", "Şırnak"].includes(city)) return 1.05;
    // İç Anadolu ve Çukurova (Tarım merkezleri, yem ve tohumda lojistik avantaj)
    if (["Konya", "Karaman", "Adana", "Osmaniye", "Mersin", "Aksaray", "Niğde"].includes(city)) return 0.98;
    // Ege ve Marmara (Büyük sanayi ve liman yakınlığı, akaryakıt ve gübrede rekabet)
    if (["İzmir", "Manisa", "Aydın", "Bursa", "Tekirdağ", "Kocaeli", "İstanbul"].includes(city)) return 0.97;
    // Karadeniz (Eğimli arazi ve işçilik yoğun yapı)
    if (["Rize", "Trabzon", "Artvin", "Giresun", "Ordu"].includes(city)) return 1.03;
    return 1.00;
}

// 81 il ve tüm ürünler için veri havuzu oluşturucu
function generateComprehensiveData() {
    const data = [];
    
    cities.forEach(city => {
        const regCoeff = getRegionCoefficient(city);
        
        periods.forEach(p => {
            productDefinitions.forEach(prod => {
                // İl ve ürün bazlı deterministik hafif dalgalanma (hash tabanlı tutarlı sapma)
                const charCodeSum = (city.charCodeAt(0) + prod.name.charCodeAt(0) + p.id.charCodeAt(p.id.length - 1)) % 10;
                const variance = ((charCodeSum - 5) / 100); // +/- %5
                
                const finalIndex = (prod.baseIndex * regCoeff * p.factor * (1 + variance)).toFixed(1);
                const estimatedPrice = (prod.basePrice * regCoeff * p.factor * (1 + variance)).toFixed(2);

                data.push({
                    city: city,
                    code: prod.code,
                    group: prod.group,
                    subtopic: prod.subtopic,
                    name: prod.name,
                    periodId: p.id,
                    periodStr: p.name,
                    index: finalIndex,
                    price: estimatedPrice,
                    unit: prod.unit
                });
            });
        });
    });
    return data;
}

const mockDatabase = generateComprehensiveData();

// --- STATE MANAGEMENT ---
let reportItems = [];
let currentMode = 'structured';

// --- UI LOGIC ---
// Populate Cities Dropdown
const citySelect = document.getElementById('sel-city');
if (citySelect) {
    citySelect.innerHTML = '<option value="">Tüm İller (81 İl)</option>';
    cities.slice().sort((a, b) => a.localeCompare(b, 'tr')).forEach(city => {
        const opt = document.createElement('option');
        opt.value = city;
        opt.textContent = city;
        citySelect.appendChild(opt);
    });
}

function switchTab(tab) {
    const btnDash = document.getElementById('btn-dashboard');
    const btnRep = document.getElementById('btn-report');
    if (tab === 'dashboard') {
        btnDash.className = "w-full text-left px-4 py-3 rounded-xl bg-blue-600 text-white font-medium transition-all hover:bg-blue-700 flex items-center gap-3 shadow-md ring-1 ring-blue-500";
        btnRep.className = "w-full text-left px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all flex items-center gap-3";
    } else {
        btnRep.className = "w-full text-left px-4 py-3 rounded-xl bg-blue-600 text-white font-medium transition-all hover:bg-blue-700 flex items-center gap-3 shadow-md ring-1 ring-blue-500";
        btnDash.className = "w-full text-left px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all flex items-center gap-3";
    }
    document.getElementById('view-dashboard').classList.add('hidden');
    document.getElementById('view-report').classList.add('hidden');
    document.getElementById(`view-${tab}`).classList.remove('hidden');
    document.getElementById('page-title').innerHTML = tab === 'dashboard'
        ? '<span class="w-1.5 h-6 bg-blue-600 rounded-full"></span> İl Bazlı Tarımsal Girdi Analizi'
        : '<span class="w-1.5 h-6 bg-blue-600 rounded-full"></span> Rapor Düzenleme';
}

function setSearchMode(mode) {
    currentMode = mode;
    const btnStruct = document.getElementById('mode-structured');
    const btnFree = document.getElementById('mode-free');
    const formStruct = document.getElementById('form-structured');
    const formFree = document.getElementById('form-free');
    if (mode === 'structured') {
        btnStruct.className = "px-4 py-1.5 rounded-md text-sm font-medium bg-white shadow-sm text-blue-600 transition-all";
        btnFree.className = "px-4 py-1.5 rounded-md text-sm font-medium text-slate-500 hover:text-slate-700 transition-all";
        formStruct.classList.remove('hidden');
        formFree.classList.add('hidden');
    } else {
        btnFree.className = "px-4 py-1.5 rounded-md text-sm font-medium bg-white shadow-sm text-indigo-600 transition-all";
        btnStruct.className = "px-4 py-1.5 rounded-md text-sm font-medium text-slate-500 hover:text-slate-700 transition-all";
        formFree.classList.remove('hidden');
        formStruct.classList.add('hidden');
    }
}

// Ana Grup değiştiğinde alt kategorileri dinamik yükleme
const mainGroupSelect = document.getElementById('sel-main-group');
if (mainGroupSelect) {
    mainGroupSelect.addEventListener('change', e => {
        const subSelect = document.getElementById('sel-subtopic');
        const val = e.target.value;
        subSelect.innerHTML = '<option value="">Tüm Alt Kategoriler</option>';
        if (val && inputCategories[val]) {
            subSelect.disabled = false;
            inputCategories[val].forEach(sub => {
                const opt = document.createElement('option');
                opt.value = sub;
                opt.textContent = sub;
                subSelect.appendChild(opt);
            });
        } else {
            subSelect.disabled = true;
            const opt = document.createElement('option');
            opt.textContent = 'Önce ana grup seçiniz';
            subSelect.appendChild(opt);
        }
    });
}

// --- UTILITIES ---
function debounce(fn, delay = 250) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const msgEl = document.getElementById('toast-msg');
    if (toast && msgEl) {
        msgEl.innerText = message;
        toast.classList.remove('translate-y-20', 'opacity-0');
        setTimeout(() => toast.classList.add('translate-y-20', 'opacity-0'), 3000);
    }
}

// --- SEARCH LOGIC (Tüm filtreleri eksiksiz uygulayan fonksiyon) ---
const performSearch = debounce(() => {
    const btn = document.querySelector('#form-structured button');
    let originalText = '';
    if (btn) {
        originalText = btn.innerHTML;
        btn.innerHTML = '<div class="loader"></div>';
        btn.disabled = true;
    }

    const city = document.getElementById('sel-city').value;
    const mainGroup = document.getElementById('sel-main-group').value;
    const subtopic = document.getElementById('sel-subtopic').value;
    const period = document.getElementById('sel-period').value;

    setTimeout(() => {
        let results = mockDatabase;
        
        // 1. İl Filtresi
        if (city) {
            results = results.filter(item => item.city === city);
        }
        // 2. Ana Grup Filtresi
        if (mainGroup) {
            results = results.filter(item => item.group === mainGroup);
        }
        // 3. Alt Kategori Filtresi
        if (subtopic && subtopic !== 'Tüm Alt Kategoriler' && subtopic !== 'Önce ana grup seçiniz') {
            results = results.filter(item => item.subtopic === subtopic);
        }
        // 4. Dönem Filtresi
        if (period) {
            results = results.filter(item => item.periodId === period);
        }

        renderResults(results);

        if (btn) {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }

        const cityLabel = city ? `${city} ili için` : 'Tüm iller genelinde';
        showToast(`${cityLabel} ${results.length} adet veri listelendi.`);
    }, 350);
});

// --- AI / AKILLI ARAMA LOGIC ---
const performAISearch = debounce(() => {
    const promptInput = document.getElementById('ai-prompt');
    const prompt = promptInput ? promptInput.value.trim().toLowerCase() : '';
    if (!prompt) return showToast('Lütfen aramak istediğiniz il veya girdi adını yazınız.', 'error');

    const btn = document.querySelector('#form-free button');
    let originalText = '';
    if (btn) {
        originalText = btn.innerHTML;
        btn.innerHTML = '<div class="loader border-indigo-200 border-t-indigo-600"></div> Analiz...';
        btn.disabled = true;
    }

    setTimeout(() => {
        // İsim, grup, alt kategori veya il eşleşmesi
        let results = mockDatabase.filter(item =>
            item.name.toLowerCase().includes(prompt) ||
            item.city.toLowerCase().includes(prompt) ||
            item.subtopic.toLowerCase().includes(prompt) ||
            item.group.toLowerCase().includes(prompt)
        );

        // Varsayılan olarak en son döneme (2026-10) öncelik ver
        if (results.some(r => r.periodId === '2026-10')) {
            const currentPeriodResults = results.filter(r => r.periodId === '2026-10');
            if (currentPeriodResults.length > 0) {
                results = currentPeriodResults;
            }
        }

        // Çok fazla sonuç varsa kullanıcıyı boğmamak için ilk 100 kaydı göster
        if (results.length > 100) results = results.slice(0, 100);

        renderResults(results);

        if (btn) {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }

        showToast(`AI araması tamamlandı: ${results.length} kayıt eşleşti.`);
        setSearchMode('structured');
    }, 600);
});

// Sonuçları Tabloya Basma
function renderResults(data) {
    const tbody = document.getElementById('results-body');
    const countBadge = document.getElementById('result-count');
    tbody.innerHTML = '';
    countBadge.innerText = `${data.length} kayıt`;

    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="px-6 py-8 text-center text-slate-400 font-medium">Seçtiğiniz kriterlere uygun veri bulunamadı. Lütfen filtreleri kontrol ediniz.</td></tr>`;
        return;
    }

    // Performans için DocumentFragment kullanımı
    const fragment = document.createDocumentFragment();

    data.forEach(item => {
        const tr = document.createElement('tr');
        tr.className = "bg-white border-b hover:bg-blue-50/50 transition-colors group";
        tr.innerHTML = `
            <td class="px-6 py-4 font-bold text-slate-700">${item.city}</td>
            <td class="px-6 py-4 font-medium text-slate-800">
                <span class="block">${item.name}</span>
                <span class="text-xs text-slate-400">${item.subtopic}</span>
            </td>
            <td class="px-6 py-4 text-slate-600 font-medium">${item.periodStr}</td>
            <td class="px-6 py-4 text-right font-bold text-slate-700">${item.index}</td>
            <td class="px-6 py-4 text-right font-medium text-blue-600">${Number(item.price).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${item.unit}</td>
            <td class="px-6 py-4 text-center">
                <button onclick="addToReport('${item.city}', '${item.name}', '${Number(item.price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ${item.unit}', '${item.periodStr}')"
                    class="opacity-0 group-hover:opacity-100 text-blue-600 hover:text-blue-800 font-medium text-xs border border-blue-200 bg-blue-50 px-3 py-1.5 rounded hover:bg-blue-100 transition-all shadow-sm focus:opacity-100"
                    aria-label="${item.name} verisini rapora ekle">
                    + Rapora Ekle
                </button>
            </td>
        `;
        fragment.appendChild(tr);
    });

    tbody.appendChild(fragment);
}

// Excel Dışa Aktarma
function exportToExcel() {
    /* global XLSX */
    if (typeof XLSX === 'undefined') {
        return showToast('Excel kütüphanesi yüklenemedi.', 'error');
    }
    const rows = [];
    const headers = ['İl', 'Girdi Kalemi', 'Alt Kategori', 'Dönem', 'Endeks (2021=100)', 'Tahmini Birim Fiyat'];
    rows.push(headers);

    const tbody = document.getElementById('results-body');
    tbody.querySelectorAll('tr').forEach(tr => {
        const cells = tr.querySelectorAll('td');
        if (cells.length < 6) return;
        const namePart = cells[1].innerText.split('\n');
        rows.push([
            cells[0].innerText.trim(),
            namePart[0] ? namePart[0].trim() : '',
            namePart[1] ? namePart[1].trim() : '',
            cells[2].innerText.trim(),
            cells[3].innerText.trim(),
            cells[4].innerText.trim()
        ]);
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, 'TÜİK Girdi Analizi');
    XLSX.writeFile(wb, 'tuik_tarimsal_girdi_fiyatlari.xlsx');
    showToast('Excel dosyası başarıyla indirildi.');
}

// --- REPORT LOGIC ---
function addToReport(city, title, value, period) {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    reportItems.push({ id, city, title, value, period, date: new Date().toLocaleDateString('tr-TR') });
    updateReportBadge();
    renderReport();
    showToast('Seçilen kalem bilirkişi raporuna eklendi.');
}

function removeFromReport(id) {
    reportItems = reportItems.filter(item => item.id !== id);
    updateReportBadge();
    renderReport();
}

function clearReport() {
    if (reportItems.length > 0 && confirm('Tüm rapor içeriğini silmek istediğinize emin misiniz?')) {
        reportItems = [];
        updateReportBadge();
        renderReport();
        showToast('Rapor taslağı temizlendi.');
    }
}

function updateReportBadge() {
    const badge = document.getElementById('report-badge');
    if (reportItems.length > 0) {
        badge.innerText = reportItems.length;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
}

function renderReport() {
    const container = document.getElementById('report-content');
    const emptyState = document.getElementById('empty-state');
    if (reportItems.length === 0) {
        container.innerHTML = '';
        container.appendChild(emptyState);
        emptyState.style.display = 'block';
        return;
    }
    emptyState.style.display = 'none';
    container.innerHTML = '';
    reportItems.forEach((item, idx) => {
        const div = document.createElement('div');
        div.className = "bg-slate-50 border border-slate-200 rounded-lg p-6 relative group hover:border-blue-300 transition-colors shadow-sm break-inside-avoid";
        div.innerHTML = `
            <div class="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity no-print">
                <button onclick="removeFromReport(${item.id})" class="text-red-400 hover:text-red-600 p-2 bg-white rounded-full shadow-sm border border-slate-100" aria-label="Rapor öğesini kaldır">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
            </div>
            <div class="flex items-start gap-4">
                <div class="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">${idx + 1}</div>
                <div class="flex-1">
                    <div class="flex justify-between items-center mb-2">
                        <h4 class="text-lg font-bold text-slate-800">${item.title}</h4>
                        <span class="text-xs font-bold bg-slate-200 px-2 py-1 rounded text-slate-600">${item.city}</span>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                        <div class="bg-white p-3 rounded border border-slate-100">
                            <span class="text-xs text-slate-400 uppercase tracking-wide block mb-1">Dönem</span>
                            <p class="font-medium text-slate-700">${item.period}</p>
                        </div>
                        <div class="bg-white p-3 rounded border border-slate-100">
                            <span class="text-xs text-slate-400 uppercase tracking-wide block mb-1">Tahmini Birim Fiyat</span>
                            <p class="font-bold text-blue-700 text-xl">${item.value}</p>
                        </div>
                    </div>
                    <div class="mt-4 pt-3 border-t border-slate-200 text-xs text-slate-400 italic flex justify-between items-center">
                        <span>Kaynak: TÜİK, Bölgesel Endeks Uyarlaması</span>
                        <span>Erişim: ${item.date}</span>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(div);
    });
}

function printReport() {
    if (window.jspdf && window.jspdf.jsPDF) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'pt', 'a4');
        const reportEl = document.getElementById('view-report');
        doc.html(reportEl, {
            callback: function (doc) {
                doc.save('bilirkisi_tarimsal_girdi_raporu.pdf');
            },
            margin: [20, 20, 20, 20],
            autoPaging: true,
            x: 0,
            y: 0,
            width: 595
        });
    } else {
        window.print();
    }
}

// Başlangıçta tüm illeri ve Ekim 2026 dönemini listele
document.addEventListener('DOMContentLoaded', () => {
    performSearch();
});
