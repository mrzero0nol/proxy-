
async function fetchAndProcessProxies() {
  const proxyTxtUrl = 'https://raw.githubusercontent.com/mrzero0nol/My-v2ray/refs/heads/main/proxyList.txt';
  const proxyJsonUrl = 'https://raw.githubusercontent.com/mrzero0nol/My-v2ray/refs/heads/main/KvProxyList.json';
  let proxies = {};

  try {
    const [txtResponse, jsonResponse] = await Promise.all([
      fetch(proxyTxtUrl),
      fetch(proxyJsonUrl)
    ]);

    const txtData = await txtResponse.text();
    const jsonData = await jsonResponse.json();

    txtData.split('\n').forEach(line => {
      const parts = line.split(',');
      if (parts.length >= 3) {
        const ip = parts[0];
        const port = parts[1];
        const country = parts[2];
        if (!proxies[country]) {
          proxies[country] = [];
        }
        proxies[country].push(\`\${ip}:\${port}\`);
      }
    });

    for (const country in jsonData) {
      if (!proxies[country]) {
        proxies[country] = [];
      }
      proxies[country] = [...new Set([...proxies[country], ...jsonData[country]])];
    }
  } catch (error) {
    console.error('Error fetching proxies:', error);
    // Return empty object on failure
    return {};
  }
  return proxies;
}

export default {
  async fetch(request) {
    const proxies = await fetchAndProcessProxies();
    const proxiesJson = JSON.stringify(proxies);

    const html = `
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Red Bunny</title>
    <style>
      body {
        font-family: sans-serif;
        background-color: #f0f0f0;
        color: #333;
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        margin: 0;
      }
      #app {
        background-color: #fff;
        padding: 2rem;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        width: 90%;
        max-width: 600px;
      }
      h1 {
        text-align: center;
        color: #ff4500;
      }
      .form-group {
        margin-bottom: 1rem;
      }
      label {
        display: block;
        margin-bottom: 0.5rem;
      }
      input[type="text"],
      select {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid #ccc;
        border-radius: 4px;
        box-sizing: border-box;
      }
      #proxy-list {
        height: 150px;
        overflow-y: auto;
        border: 1px solid #ccc;
        padding: 0.5rem;
        border-radius: 4px;
      }
      button {
        background-color: #ff4500;
        color: #fff;
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 1rem;
        width: 100%;
        margin-top: 1rem;
      }
      button:hover {
        background-color: #e03e00;
      }
      #output {
        margin-top: 1.5rem;
        background-color: #f9f9f9;
        padding: 1rem;
        border-radius: 4px;
        white-space: pre-wrap;
        word-wrap: break-word;
      }
    </style>
</head>
<body>
    <div id="app">
        <h1>Red Bunny</h1>
        <form>
            <div class="form-group">
                <label for="host">Host:</label>
                <input type="text" id="host">
            </div>
            <div class="form-group">
                <label for="sni">SNI:</label>
                <input type="text" id="sni">
            </div>
            <div class="form-group">
                <label for="country">Negara:</label>
                <select id="country"></select>
            </div>
            <div class="form-group">
                <label>Daftar Proksi:</label>
                <div id="proxy-list"></div>
            </div>
            <button type="button" id="generateButton">Hasilkan</button>
        </form>
        <div id="output"></div>
    </div>

    <script>
      document.addEventListener('DOMContentLoaded', () => {
        const hostInput = document.getElementById('host');
        const sniInput = document.getElementById('sni');
        const countrySelect = document.getElementById('country');
        const proxyList = document.getElementById('proxy-list');
        const generateButton = document.getElementById('generateButton');
        const outputDiv = document.getElementById('output');

        const proxies = ${proxiesJson};
        let selectedProxy = null;

        function populateCountries() {
          const countries = Object.keys(proxies).sort();
          countries.forEach(country => {
            const option = document.createElement('option');
            option.value = country;
            option.textContent = country;
            countrySelect.appendChild(option);
          });

          if (countries.length > 0) {
              countrySelect.value = countries[0];
              loadProxiesForCountry(countries[0]);
          }
        }

        function loadProxiesForCountry(country) {
          proxyList.innerHTML = '';
          selectedProxy = null;
          (proxies[country] || []).forEach((proxy, index) => {
            const radioLabel = document.createElement('label');
            radioLabel.style.display = 'block';
            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = 'proxy';
            radio.value = proxy;
            radio.id = \`proxy-\${index}\`;
            radio.addEventListener('change', () => {
              selectedProxy = proxy;
            });

            radioLabel.appendChild(radio);
            radioLabel.append(\` \${proxy}\`);
            proxyList.appendChild(radioLabel);
          });
        }

        function generateLinks() {
          const host = hostInput.value;
          const sni = sniInput.value;

          if (!host || !sni || !selectedProxy) {
            outputDiv.textContent = 'Silakan isi semua kolom dan pilih proksi.';
            return;
          }

          const [proxyHost, proxyPort] = selectedProxy.split(':');

          const vlessUUID = 'fff283d3-4d7a-4c6f-ac43-949a1517b3cf';
          const trojanUUID = '3f139b42-6f24-4390-8466-ac1f2fcf3610';

          const vlessLink = \`vless://\${vlessUUID}@\${proxyHost}:\${proxyPort}/?type=ws&encryption=none&flow=&host=\${host}&path=%2F\${proxyHost}-\${proxyPort}&security=tls&sni=\${sni}#ID%20PT%20Telekomunikasi%20Indonesia%20%5B\${proxyHost}%5D\`;
          const trojanLink = \`trojan://\${trojanUUID}@\${proxyHost}:\${proxyPort}/?type=ws&host=\${host}&path=%2F\${proxyHost}-\${proxyPort}&security=tls&sni=\${sni}#ID%20PT%20Telekomunikasi%20Indonesia%20%5B\${proxyHost}%5D\`;

          outputDiv.textContent = \`\${vlessLink}\\n\\n\${trojanLink}\`;
        }

        countrySelect.addEventListener('change', (e) => {
          loadProxiesForCountry(e.target.value);
        });

        generateButton.addEventListener('click', generateLinks);

        populateCountries();
      });
    <\/script>
</body>
</html>
`;
    return new Response(html, {
      headers: { 'content-type': 'text/html;charset=UTF-8' },
    });
  },
};
