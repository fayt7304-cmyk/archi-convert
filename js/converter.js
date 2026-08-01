// Shared formatting helper used across modules.
function fmt(n, decimals) {
  if (!isFinite(n)) return '—';
  decimals = decimals === undefined ? 4 : decimals;
  return Number(n.toFixed(decimals)).toLocaleString(undefined, { maximumFractionDigits: decimals });
}

const categories = {
  length: {
    label: 'Length', base: 'm',
    units: { m: 1, cm: 0.01, mm: 0.001, km: 1000, ft: 0.3048, in: 0.0254, yd: 0.9144, mi: 1609.344 },
    names: { m: 'Meters (m)', cm: 'Centimeters (cm)', mm: 'Millimeters (mm)', km: 'Kilometers (km)', ft: 'Feet (ft)', in: 'Inches (in)', yd: 'Yards (yd)', mi: 'Miles (mi)' }
  },
  area: {
    label: 'Area', base: 'm2',
    units: { m2: 1, cm2: 0.0001, ft2: 0.092903, yd2: 0.836127, ha: 10000, acre: 4046.86, km2: 1000000 },
    names: { m2: 'Square meters (m²)', cm2: 'Square centimeters (cm²)', ft2: 'Square feet (ft²)', yd2: 'Square yards (yd²)', ha: 'Hectares (ha)', acre: 'Acres', km2: 'Square kilometers (km²)' }
  },
  volume: {
    label: 'Volume', base: 'm3',
    units: { m3: 1, l: 0.001, ml: 0.000001, ft3: 0.0283168, yd3: 0.764555, gal: 0.00378541 },
    names: { m3: 'Cubic meters (m³)', l: 'Liters (L)', ml: 'Milliliters (mL)', ft3: 'Cubic feet (ft³)', yd3: 'Cubic yards (yd³)', gal: 'Gallons (US)' }
  },
  angle: {
    label: 'Angle', base: 'rad',
    units: { rad: 1, deg: Math.PI / 180, grad: Math.PI / 200 },
    names: { rad: 'Radians', deg: 'Degrees (°)', grad: 'Gradians' }
  },
  data: {
    label: 'Data', base: 'byte',
    units: { bit: 0.125, byte: 1, kb: 1024, mb: 1024 ** 2, gb: 1024 ** 3, tb: 1024 ** 4 },
    names: { bit: 'Bits', byte: 'Bytes', kb: 'Kilobytes (KB)', mb: 'Megabytes (MB)', gb: 'Gigabytes (GB)', tb: 'Terabytes (TB)' }
  },
  energy: {
    label: 'Energy', base: 'j',
    units: { j: 1, kj: 1000, cal: 4.184, kcal: 4184, wh: 3600, kwh: 3600000, btu: 1055.06 },
    names: { j: 'Joules (J)', kj: 'Kilojoules (kJ)', cal: 'Calories (cal)', kcal: 'Kilocalories (kcal)', wh: 'Watt-hours (Wh)', kwh: 'Kilowatt-hours (kWh)', btu: 'BTU' }
  },
  force: {
    label: 'Force', base: 'n',
    units: { n: 1, kn: 1000, lbf: 4.44822, kgf: 9.80665, dyn: 0.00001 },
    names: { n: 'Newtons (N)', kn: 'Kilonewtons (kN)', lbf: 'Pound-force (lbf)', kgf: 'Kilogram-force (kgf)', dyn: 'Dynes' }
  },
  fuel: {
    label: 'Fuel economy', base: 'kml',
    units: { kml: 1, l100km: 'inverse100', mpgus: 2.35215, mpguk: 2.82481 },
    names: { kml: 'km/L', l100km: 'L/100km', mpgus: 'mpg (US)', mpguk: 'mpg (UK)' }
  },
  power: {
    label: 'Power', base: 'w',
    units: { w: 1, kw: 1000, hp: 745.7, btuh: 0.293071 },
    names: { w: 'Watts (W)', kw: 'Kilowatts (kW)', hp: 'Horsepower (hp)', btuh: 'BTU/hour' }
  },
  pressure: {
    label: 'Pressure', base: 'pa',
    units: { pa: 1, kpa: 1000, bar: 100000, atm: 101325, psi: 6894.76, mmhg: 133.322 },
    names: { pa: 'Pascals (Pa)', kpa: 'Kilopascals (kPa)', bar: 'Bar', atm: 'Atmospheres (atm)', psi: 'PSI', mmhg: 'mmHg' }
  },
  speed: {
    label: 'Speed', base: 'ms',
    units: { ms: 1, kmh: 0.277778, mph: 0.44704, knot: 0.514444, fts: 0.3048 },
    names: { ms: 'Meters/second (m/s)', kmh: 'Kilometers/hour (km/h)', mph: 'Miles/hour (mph)', knot: 'Knots', fts: 'Feet/second (ft/s)' }
  },
  temperature: {
    label: 'Temperature', special: true,
    names: { c: 'Celsius (°C)', f: 'Fahrenheit (°F)', k: 'Kelvin (K)' }
  },
  weight: {
    label: 'Weight / Mass', base: 'kg',
    units: { kg: 1, g: 0.001, mg: 0.000001, ton: 1000, lb: 0.453592, oz: 0.0283495, stone: 6.35029 },
    names: { kg: 'Kilograms (kg)', g: 'Grams (g)', mg: 'Milligrams (mg)', ton: 'Metric tons', lb: 'Pounds (lb)', oz: 'Ounces (oz)', stone: 'Stone' }
  },
  currency: {
    label: 'Currency', special: 'currency',
    names: { USD: 'US Dollar (USD)', EUR: 'Euro (EUR)', GBP: 'British Pound (GBP)', MAD: 'Moroccan Dirham (MAD)', CNY: 'Chinese Yuan (CNY)', JPY: 'Japanese Yen (JPY)', CAD: 'Canadian Dollar (CAD)', AUD: 'Australian Dollar (AUD)', CHF: 'Swiss Franc (CHF)', AED: 'UAE Dirham (AED)' }
  }
};

let currencyRates = null;
let currencyBase = null;

function initConverter() {
  const categorySelect = document.getElementById('category-select');
  const inUnitSelect = document.getElementById('conv-in-unit');
  const outUnitSelect = document.getElementById('conv-out-unit');
  const convInput = document.getElementById('conv-in');
  const convResult = document.getElementById('conv-result');
  const convStatus = document.getElementById('conv-status');
  const convSwap = document.getElementById('conv-swap');

  Object.keys(categories).forEach(key => {
    const opt = document.createElement('option');
    opt.value = key;
    opt.textContent = categories[key].label;
    categorySelect.appendChild(opt);
  });

  function populateUnits(categoryKey) {
    const cat = categories[categoryKey];
    inUnitSelect.innerHTML = '';
    outUnitSelect.innerHTML = '';
    Object.keys(cat.names).forEach(u => {
      const o1 = document.createElement('option');
      o1.value = u; o1.textContent = cat.names[u];
      inUnitSelect.appendChild(o1);
      const o2 = document.createElement('option');
      o2.value = u; o2.textContent = cat.names[u];
      outUnitSelect.appendChild(o2);
    });
    const keys = Object.keys(cat.names);
    if (keys.length > 1) outUnitSelect.selectedIndex = 1;
  }

  function celsiusFrom(value, unit) {
    if (unit === 'c') return value;
    if (unit === 'f') return (value - 32) * 5 / 9;
    if (unit === 'k') return value - 273.15;
  }
  function celsiusTo(value, unit) {
    if (unit === 'c') return value;
    if (unit === 'f') return value * 9 / 5 + 32;
    if (unit === 'k') return value + 273.15;
  }

  function fuelToKmL(value, unit) {
    if (unit === 'kml') return value;
    if (unit === 'l100km') return value === 0 ? 0 : 100 / value;
    if (unit === 'mpgus') return value / 2.35215;
    if (unit === 'mpguk') return value / 2.82481;
  }
  function fuelFromKmL(value, unit) {
    if (unit === 'kml') return value;
    if (unit === 'l100km') return value === 0 ? 0 : 100 / value;
    if (unit === 'mpgus') return value * 2.35215;
    if (unit === 'mpguk') return value * 2.82481;
  }

  async function loadCurrencyRates(base) {
    convStatus.textContent = 'Fetching live exchange rates...';
    convStatus.classList.add('working');
    try {
      const resp = await fetch('https://open.er-api.com/v6/latest/' + base);
      const data = await resp.json();
      if (data.result !== 'success') throw new Error('Rate fetch failed');
      currencyRates = data.rates;
      currencyBase = base;
      convStatus.textContent = 'Rates updated: ' + new Date(data.time_last_update_utc).toLocaleString();
      convStatus.classList.remove('working');
    } catch (err) {
      convStatus.textContent = 'Could not fetch exchange rates. Check your connection and try again.';
      convStatus.classList.remove('working');
    }
  }

  async function updateConversion() {
    const categoryKey = categorySelect.value;
    const cat = categories[categoryKey];
    const val = parseFloat(convInput.value) || 0;
    const inUnit = inUnitSelect.value;
    const outUnit = outUnitSelect.value;

    if (categoryKey === 'temperature') {
      const c = celsiusFrom(val, inUnit);
      const result = celsiusTo(c, outUnit);
      convResult.textContent = fmt(result, 2) + ' ' + cat.names[outUnit].match(/\(([^)]+)\)/)?.[1];
      return;
    }

    if (categoryKey === 'fuel') {
      const kml = fuelToKmL(val, inUnit);
      const result = fuelFromKmL(kml, outUnit);
      convResult.textContent = fmt(result, 3) + ' ' + cat.names[outUnit];
      return;
    }

    if (categoryKey === 'currency') {
      if (!currencyRates || currencyBase !== inUnit) {
        await loadCurrencyRates(inUnit);
      }
      if (currencyRates && currencyRates[outUnit] !== undefined) {
        const result = val * currencyRates[outUnit];
        convResult.textContent = fmt(result, 2) + ' ' + outUnit;
      } else {
        convResult.textContent = '—';
      }
      return;
    }

    const result = (val * cat.units[inUnit]) / cat.units[outUnit];
    const label = cat.names[outUnit].match(/\(([^)]+)\)/);
    convResult.textContent = fmt(result) + (label ? ' ' + label[1] : ' ' + cat.names[outUnit]);
  }

  categorySelect.addEventListener('change', () => {
    populateUnits(categorySelect.value);
    currencyRates = null;
    convStatus.textContent = '';
    updateConversion();
  });
  convInput.addEventListener('input', updateConversion);
  inUnitSelect.addEventListener('change', updateConversion);
  outUnitSelect.addEventListener('change', updateConversion);
  convSwap.addEventListener('click', () => {
    const a = inUnitSelect.value, b = outUnitSelect.value;
    inUnitSelect.value = b;
    outUnitSelect.value = a;
    currencyRates = null;
    updateConversion();
  });

  populateUnits('length');
  updateConversion();
}
