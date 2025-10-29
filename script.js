
document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;

  // Set the title
  document.title = 'Red Bunny';

  // Create the main container
  const mainContainer = document.createElement('div');
  mainContainer.id = 'app';
  body.appendChild(mainContainer);

  // Add the CSS styles
  const style = document.createElement('style');
  style.textContent = `
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
  `;
  document.head.appendChild(style);

  // Create the HTML elements
  const title = document.createElement('h1');
  title.textContent = 'Red Bunny';
  mainContainer.appendChild(title);

  const form = document.createElement('form');
  mainContainer.appendChild(form);

  // Host input
  const hostGroup = document.createElement('div');
  hostGroup.className = 'form-group';
  const hostLabel = document.createElement('label');
  hostLabel.textContent = 'Host:';
  hostLabel.htmlFor = 'host';
  const hostInput = document.createElement('input');
  hostInput.type = 'text';
  hostInput.id = 'host';
  hostGroup.appendChild(hostLabel);
  hostGroup.appendChild(hostInput);
  form.appendChild(hostGroup);

  // SNI input
  const sniGroup = document.createElement('div');
  sniGroup.className = 'form-group';
  const sniLabel = document.createElement('label');
  sniLabel.textContent = 'SNI:';
  sniLabel.htmlFor = 'sni';
  const sniInput = document.createElement('input');
  sniInput.type = 'text';
  sniInput.id = 'sni';
  sniGroup.appendChild(sniLabel);
  sniGroup.appendChild(sniInput);
  form.appendChild(sniGroup);

  // Country dropdown
  const countryGroup = document.createElement('div');
  countryGroup.className = 'form-group';
  const countryLabel = document.createElement('label');
  countryLabel.textContent = 'Country:';
  countryLabel.htmlFor = 'country';
  const countrySelect = document.createElement('select');
  countrySelect.id = 'country';
  countryGroup.appendChild(countryLabel);
  countryGroup.appendChild(countrySelect);
  form.appendChild(countryGroup);

  // Proxy list
  const proxyGroup = document.createElement('div');
  proxyGroup.className = 'form-group';
  const proxyLabel = document.createElement('label');
  proxyLabel.textContent = 'Proxy List:';
  const proxyList = document.createElement('div');
  proxyList.id = 'proxy-list';
  proxyGroup.appendChild(proxyLabel);
  proxyGroup.appendChild(proxyList);
  form.appendChild(proxyGroup);

  // Generate button
  const generateButton = document.createElement('button');
  generateButton.type = 'button';
  generateButton.textContent = 'Generate';
  form.appendChild(generateButton);

  // Output area
  const outputDiv = document.createElement('div');
  outputDiv.id = 'output';
  mainContainer.appendChild(outputDiv);

  // --- Start of Application Logic ---

  const proxyTxtUrl = 'https://raw.githubusercontent.com/mrzero0nol/My-v2ray/refs/heads/main/proxyList.txt';
  const proxyJsonUrl = 'https://raw.githubusercontent.com/mrzero0nol/My-v2ray/refs/heads/main/KvProxyList.json';

  let proxies = {};
  let selectedProxy = null;

  async function fetchProxies() {
    try {
      const [txtResponse, jsonResponse] = await Promise.all([
        fetch(proxyTxtUrl),
        fetch(proxyJsonUrl)
      ]);

      const txtData = await txtResponse.text();
      const jsonData = await jsonResponse.json();

      // Parse txt data
      txtData.split('\n').forEach(line => {
        const parts = line.split(',');
        if (parts.length >= 3) {
          const ip = parts[0];
          const port = parts[1];
          const country = parts[2];
          if (!proxies[country]) {
            proxies[country] = [];
          }
          proxies[country].push(`${ip}:${port}`);
        }
      });

      // Combine with json data
      for (const country in jsonData) {
        if (!proxies[country]) {
          proxies[country] = [];
        }
        proxies[country] = [...new Set([...proxies[country], ...jsonData[country]])];
      }

      populateCountries();
    } catch (error) {
      console.error('Error fetching proxies:', error);
    }
  }

  function populateCountries() {
    const countries = Object.keys(proxies).sort();
    countries.forEach(country => {
      const option = document.createElement('option');
      option.value = country;
      option.textContent = country;
      countrySelect.appendChild(option);
    });
    // Load proxies for the first country by default
    if (countries.length > 0) {
        countrySelect.value = countries[0];
        loadProxiesForCountry(countries[0]);
    }
  }

  function loadProxiesForCountry(country) {
    proxyList.innerHTML = '';
    selectedProxy = null;
    proxies[country].forEach((proxy, index) => {
      const radioLabel = document.createElement('label');
      radioLabel.style.display = 'block';
      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = 'proxy';
      radio.value = proxy;
      radio.id = `proxy-${index}`;
      radio.addEventListener('change', () => {
        selectedProxy = proxy;
      });

      radioLabel.appendChild(radio);
      radioLabel.append(` ${proxy}`);
      proxyList.appendChild(radioLabel);
    });
  }

  function generateLinks() {
    const host = hostInput.value;
    const sni = sniInput.value;

    if (!host || !sni || !selectedProxy) {
      outputDiv.textContent = 'Please fill in all fields and select a proxy.';
      return;
    }

    const [proxyHost, proxyPort] = selectedProxy.split(':');

    const vlessUUID = 'fff283d3-4d7a-4c6f-ac43-949a1517b3cf';
    const trojanUUID = '3f139b42-6f24-4390-8466-ac1f2fcf3610';

    const vlessLink = `vless://${vlessUUID}@${proxyHost}:${proxyPort}/?type=ws&encryption=none&flow=&host=${host}&path=%2F${proxyHost}-${proxyPort}&security=tls&sni=${sni}#ID%20PT%20Telekomunikasi%20Indonesia%20%5B${proxyHost}%5D`;
    const trojanLink = `trojan://${trojanUUID}@${proxyHost}:${proxyPort}/?type=ws&host=${host}&path=%2F${proxyHost}-${proxyPort}&security=tls&sni=${sni}#ID%20PT%20Telekomunikasi%20Indonesia%20%5B${proxyHost}%5D`;

    outputDiv.textContent = `${vlessLink}\n\n${trojanLink}`;
  }

  countrySelect.addEventListener('change', (e) => {
    loadProxiesForCountry(e.target.value);
  });

  generateButton.addEventListener('click', generateLinks);

  fetchProxies();
});
