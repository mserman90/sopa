// app.js – extracted from index.html
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

const inputCategories = {
    'gubre': ['Azotlu Gübreler', 'Fosfatlı Gübreler', 'Potasyumlu Gübreler', 'Kompostlar'],
    'yem': ['Büyükbaş Yemleri', 'Küçükbaş Yemleri', 'Kümes Hayvanı Yemleri', 'Silajlık Bitkiler'],
    'tohum': ['Tahıl Tohumları', 'Endüstri Bitkileri Tohumları', 'Sebze Fideleri', 'Meyve Fidanları'],
    'enerji': ['Motorin', 'Benzin', 'Elektrik', 'Fuel-Oil', 'LPG'],
    'ilac': ['Herbisitler (Yabancı Ot)', 'İnsektisitler (Böcek)', 'Fungusitler (Mantar)'],
    'makine': ['Traktörler', 'Pulluklar', 'Mibzerler', 'Hasat Makineleri', 'Sulama Sistemleri'],
    'hizmet': ['Arazi Kiraları', 'Tamirat-Bakım', 'Ulaşım-Nakliye', 'Sigorta Primleri', 'Faiz Ödemeleri', 'İşçilik Ücretleri']
};

// Mock Database Generator with City Logic
function generateCityData() {
    const data = [];
    const categories = [
        { code: 'TGFE-E01', group: 'enerji', name: 'Motorin Fiyat Endeksi', basePrice: 42.50 },
        { code: 'TGFE-G01', group: 'gubre', name: 'Azotlu Gübreler', basePrice: 1250.00 },
        { code: 'TGFE-Y01', group: 'yem', name: 'Büyükbaş Besi Yemleri', basePrice: 8.75 },
        { code: 'TGFE-M01', group: 'makine', name: 'Traktör Fiyat Endeksi', basePrice: 1200000 },
        { code: 'TGFE-H01', group: 'hizmet', name: 'Tarım İşçiliği (Günlük)', basePrice: 650.00 },
        { code: 'TGFE-T01', group: 'tohum', name: 'Hybrid Mısır Tohumu', basePrice: 3200.00 }
    ];

    cities.forEach(city => {
        let regionCoeff = 1.0;
        if (["Erzurum", "Van", "Hakkari", "Ağrı", "Kars"].includes(city)) regionCoeff = 1.05;
        if (["İstanbul", "İzmir", "Antalya"].includes(city)) regionCoeff = 0.98;
        categories.forEach(cat => {
            const randomVar = (Math.random() * 0.1) - 0.05; // +/-5%
            const finalIndex = (100 * regionCoeff * (1 + randomVar)).toFixed(1);
            const estimatedPrice = (cat.basePrice * regionCoeff * (1 + randomVar)).toFixed(2);
            data.push({
                city,
                code: cat.code,
                group: cat.group,
                name: cat.name,
                periodStr: 'Ekim 2026',
                index: finalIndex,
                price: estimatedPrice,
                unit: cat.group === 'enerji' ? 'TL/Lt' : (cat.group === 'hizmet' ? 'TL/Gün' : 'TL')
            });
        });
    });
    return data;
}

const mockDatabase = generateCityData();

// --- STATE MANAGEMENT ---
let reportItems = [];
let currentMode = 'structured';

// --- UI LOGIC ---
// Populate Cities
const citySelect = document.getElementById('sel-city');
cities.sort().forEach(city => {
    const opt = document.createElement('option');
    opt.value = city;
    opt.textContent = city;
    citySelect.appendChild(opt);
});

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

document.getElementById('sel-main-group').addEventListener('change', e => {
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

// --- UTILITIES ---
function debounce(fn, delay = 300) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const msgEl = document.getElementById('toast-msg');
    msgEl.innerText = message;
    toast.classList.remove('translate-y-20', 'opacity-0');
    setTimeout(() => toast.classList.add('translate-y-20', 'opacity-0'), 3000);
}

// --- SEARCH LOGIC ---
const performSearch = debounce(() => {
    const btn = document.querySelector('#form-structured button');
    const originalText = btn.innerHTML;
    const city = document.getElementById('sel-city').value;
    const mainGroup = document.getElementById('sel-main-group').value;
    btn.innerHTML = '<div class="loader"></div>';
    btn.disabled = true;
    setTimeout(() => {
        let results = mockDatabase;
        if (city) results = results.filter(item => item.city === city);
        if (mainGroup) results = results.filter(item => item.group === mainGroup);
        renderResults(results);
        btn.innerHTML = originalText;
        btn.disabled = false;
        showToast(`${results.length} adet il bazlı kayıt bulundu.`);
    }, 600);
});

const performAISearch = debounce(() => {
    const prompt = document.getElementById('ai-prompt').value.toLowerCase();
    if (!prompt) return showToast('Lütfen bir arama metni giriniz.', 'error');
    const btn = document.querySelector('#form-free button');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<div class="loader border-indigo-200 border-t-indigo-600"></div> Analiz...';
    btn.disabled = true;
    setTimeout(() => {
        let results = mockDatabase.filter(item =>
            item.name.toLowerCase().includes(prompt) || item.city.toLowerCase().includes(prompt)
        );
        if (results.length > 20) results = results.slice(0, 20);
        renderResults(results);
        btn.innerHTML = originalText;
        btn.disabled = false;
        showToast('AI analizi tamamlandı.');
        setSearchMode('structured');
    }, 1000);
});

function renderResults(data) {
    const tbody = document.getElementById('results-body');
    const countBadge = document.getElementById('result-count');
    tbody.innerHTML = '';
    countBadge.innerText = `${data.length} kayıt`;
    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="px-6 py-8 text-center text-slate-400">Aradığınız kriterlere uygun veri bulunamadı.</td></tr>`;
        return;
    }
    data.forEach(item => {
        const tr = document.createElement('tr');
        tr.className = "bg-white border-b hover:bg-blue-50/50 transition-colors group";
        tr.innerHTML = `
            <td class="px-6 py-4 font-bold text-slate-700">${item.city}</td>
            <td class="px-6 py-4 font-medium text-slate-800">${item.name}</td>
            <td class="px-6 py-4 text-slate-600 font-medium">${item.periodStr}</td>
            <td class="px-6 py-4 text-right font-bold text-slate-700">${item.index}</td>
            <td class="px-6 py-4 text-right font-medium text-blue-600">${Number(item.price).toLocaleString('tr-TR')} ${item.unit}</td>
            <td class="px-6 py-4 text-center">
                <button onclick="addToReport('${item.city}', '${item.name}', '${item.price} ${item.unit}', '${item.periodStr}')"
                    class="opacity-0 group-hover:opacity-100 text-blue-600 hover:text-blue-800 font-medium text-xs border border-blue-200 bg-blue-50 px-3 py-1.5 rounded hover:bg-blue-100 transition-all shadow-sm"
                    aria-label="${item.name} verisini rapora ekle">
                    + Rapora Ekle
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Excel export (uses SheetJS)
function exportToExcel() {
    /* global XLSX */
    const rows = [];
    const headers = ['İl', 'Girdi Kalemi', 'Dönem', 'Endeks (2021=100)', 'Tahmini Birim Fiyat'];
    rows.push(headers);
    const tbody = document.getElementById('results-body');
    tbody.querySelectorAll('tr').forEach(tr => {
        const cells = tr.querySelectorAll('td');
        if (cells.length < 6) return; // skip empty rows
        rows.push([
            cells[0].innerText.trim(),
            cells[1].innerText.trim(),
            cells[2].innerText.trim(),
            cells[3].innerText.trim(),
            cells[4].innerText.trim()
        ]);
    });
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, 'Sonuçlar');
    XLSX.writeFile(wb, 'tuik_sorgu.xlsx');
    showToast('Excel dosyası indirildi.');
}

// --- REPORT LOGIC ---
function addToReport(city, title, value, period) {
    const id = Date.now();
    reportItems.push({ id, city, title, value, period, date: new Date().toLocaleDateString('tr-TR') });
    updateReportBadge();
    renderReport();
    showToast('Veri başarıyla rapora eklendi');
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
        // Use jsPDF's html method to render the element
        doc.html(reportEl, {
            callback: function (doc) {
                doc.save('rapor.pdf');
            },
            margin: [20, 20, 20, 20],
            autoPaging: true,
            x: 0,
            y: 0,
            width: 595 // A4 width in points
        });
    } else {
        // Fallback to browser print if jsPDF not loaded
        window.print();
    }
}

// Initialize with all data
performSearch();
