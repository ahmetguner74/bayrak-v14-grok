const flagTable = document.getElementById('flag-table');
const addBtn = document.getElementById('add-btn');
const countryCodeInput = document.getElementById('country-code');
const countryNameTrInput = document.getElementById('country-name-tr');
const countryNameEnInput = document.getElementById('country-name-en');
const uploadBtn = document.getElementById('upload-btn');
const csvFileInput = document.getElementById('csv-file');

let countries = [];

async function loadFlags() {
    try {
        const response = await fetch('flags.json');
        countries = await response.json();
        const storedFlags = localStorage.getItem('flags');
        if (storedFlags) countries = JSON.parse(storedFlags);
        displayFlags();
        console.log(`${countries.length} bayrak yüklendi`);
    } catch (error) {
        console.error('Bayraklar yüklenirken hata:', error);
        alert('Bayrak verileri yüklenirken hata oluştu!');
    }
}

function saveFlags() {
    localStorage.setItem('flags', JSON.stringify(countries));
    const jsonOutput = JSON.stringify(countries, null, 4);
    navigator.clipboard.writeText(jsonOutput).then(() => {
        alert('Bayraklar panoya kopyalandı. flags.json’u güncelleyin.');
    });
}

function displayFlags() {
    flagTable.innerHTML = '';
    countries.forEach((country, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${country.code}</td>
            <td>${country.name_tr}</td>
            <td>${country.name_en}</td>
            <td><img src="public/flags/${country.code}.svg" alt="${country.name_tr}" style="width: 40px;"></td>
            <td><button class="delete-btn" data-index="${index}">Sil</button></td>
        `;
        flagTable.appendChild(row);
    });
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const index = btn.getAttribute('data-index');
            countries.splice(index, 1);
            saveFlags();
            displayFlags();
        });
    });
}

addBtn.addEventListener('click', () => {
    const code = countryCodeInput.value.trim().toLowerCase();
    const name_tr = countryNameTrInput.value.trim();
    const name_en = countryNameEnInput.value.trim();
    if (code && name_tr && name_en) {
        if (countries.some(country => country.code === code)) {
            alert('Bu ülke kodu zaten var!');
            return;
        }
        countries.push({ code, name_tr, name_en });
        countryCodeInput.value = '';
        countryNameTrInput.value = '';
        countryNameEnInput.value = '';
        saveFlags();
        displayFlags();
    } else {
        alert('Tüm alanları doldurun!');
    }
});

uploadBtn.addEventListener('click', () => {
    const file = csvFileInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const lines = e.target.result.split('\n');
            lines.forEach(line => {
                const [code, name_tr, name_en] = line.split(',');
                if (code && name_tr && name_en) {
                    if (!countries.some(country => country.code === code)) {
                        countries.push({ code: code.trim(), name_tr: name_tr.trim(), name_en: name_en.trim() });
                    }
                }
            });
            saveFlags();
            displayFlags();
        };
        reader.readAsText(file);
    }
});

loadFlags();