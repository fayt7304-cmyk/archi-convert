function initCalculator() {
  // ---------- mode switching ----------
  const modeButtons = document.querySelectorAll('[data-calc-mode]');
  const views = {
    standard: document.getElementById('calc-standard-view'),
    scientific: document.getElementById('calc-scientific-view'),
    graph: document.getElementById('calc-graph-view')
  };
  modeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      modeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      Object.values(views).forEach(v => v.style.display = 'none');
      views[btn.dataset.calcMode].style.display = 'block';
      if (btn.dataset.calcMode === 'graph') {
        plotGraph();
      }
    });
  });

  // ---------- standard calculator ----------
  const calcDisplay = document.getElementById('calc-display');
  let calcExpr = '';
  let calcJustEvaluated = false;

  document.querySelectorAll('[data-calc]').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.calc;

      if (key === 'clear') {
        calcExpr = '';
        calcDisplay.textContent = '0';
        return;
      }
      if (key === 'sqrt') {
        const val = Math.sqrt(parseFloat(calcExpr) || 0);
        calcExpr = String(val);
        calcDisplay.textContent = calcExpr;
        calcJustEvaluated = true;
        return;
      }
      if (key === 'square') {
        const val = Math.pow(parseFloat(calcExpr) || 0, 2);
        calcExpr = String(val);
        calcDisplay.textContent = calcExpr;
        calcJustEvaluated = true;
        return;
      }
      if (key === '=') {
        try {
          const result = Function('"use strict"; return (' + calcExpr + ')')();
          calcExpr = String(result);
          calcDisplay.textContent = calcExpr;
        } catch {
          calcDisplay.textContent = 'Error';
          calcExpr = '';
        }
        calcJustEvaluated = true;
        return;
      }

      if (calcJustEvaluated && !isNaN(key)) {
        calcExpr = '';
      }
      calcJustEvaluated = false;

      calcExpr += key;
      calcDisplay.textContent = calcExpr;
    });
  });

  // ---------- scientific calculator ----------
  const sciDisplay = document.getElementById('calc-sci-display');
  let sciExpr = '';

  function sciToJs(expr) {
    return expr
      .replace(/\^/g, '**')
      .replace(/sin\(/g, 'Math.sin(deg2rad(')
      .replace(/cos\(/g, 'Math.cos(deg2rad(')
      .replace(/tan\(/g, 'Math.tan(deg2rad(')
      .replace(/log\(/g, 'Math.log10(')
      .replace(/ln\(/g, 'Math.log(')
      .replace(/sqrt\(/g, 'Math.sqrt(')
      .replace(/pi/g, 'Math.PI')
      .replace(/(?<![a-zA-Z])e(?![a-zA-Z(])/g, 'Math.E');
  }

  // sin/cos/tan need an extra closing paren because we wrapped their
  // argument in deg2rad(...) in addition to the function's own paren.
  function balanceTrigParens(rawExpr, jsExpr) {
    const trigOpens = (rawExpr.match(/sin\(|cos\(|tan\(/g) || []).length;
    return jsExpr + ')'.repeat(trigOpens);
  }

  document.querySelectorAll('[data-sci]').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.sci;

      if (key === 'clear') {
        sciExpr = '';
        sciDisplay.textContent = '0';
        return;
      }
      if (key === 'del') {
        sciExpr = sciExpr.slice(0, -1);
        sciDisplay.textContent = sciExpr || '0';
        return;
      }
      if (key === '=') {
        try {
          const withHelper = 'const deg2rad = (d) => d * Math.PI / 180; return (' +
            balanceTrigParens(sciExpr, sciToJs(sciExpr)) + ')';
          const result = Function('"use strict"; ' + withHelper)();
          sciExpr = String(result);
          sciDisplay.textContent = sciExpr;
        } catch {
          sciDisplay.textContent = 'Error';
          sciExpr = '';
        }
        return;
      }

      sciExpr += key;
      sciDisplay.textContent = sciExpr;
    });
  });

  // ---------- graph ----------
  const graphExprInput = document.getElementById('graph-expr');
  const graphRangeSelect = document.getElementById('graph-range');
  const graphPlotBtn = document.getElementById('graph-plot');
  const graphStatus = document.getElementById('graph-status');
  const canvas = document.getElementById('graph-canvas');

  function exprToFunction(expr) {
    const jsBody = expr
      .replace(/\^/g, '**')
      .replace(/sin\(/g, 'Math.sin(')
      .replace(/cos\(/g, 'Math.cos(')
      .replace(/tan\(/g, 'Math.tan(')
      .replace(/sqrt\(/g, 'Math.sqrt(')
      .replace(/abs\(/g, 'Math.abs(')
      .replace(/log\(/g, 'Math.log10(')
      .replace(/ln\(/g, 'Math.log(')
      .replace(/pi/g, 'Math.PI');
    return Function('x', '"use strict"; return (' + jsBody + ')');
  }

  function plotGraph() {
    graphStatus.textContent = '';
    const range = parseFloat(graphRangeSelect.value);
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const w = rect.width, h = rect.height;
    ctx.clearRect(0, 0, w, h);

    let fn;
    try {
      fn = exprToFunction(graphExprInput.value.trim());
      fn(0);
    } catch (err) {
      graphStatus.textContent = 'Could not parse expression: ' + err.message;
      return;
    }

    const rootStyle = getComputedStyle(document.documentElement);
    const gridColor = rootStyle.getPropertyValue('--border').trim() || '#e3e1da';
    const axisColor = rootStyle.getPropertyValue('--text-secondary').trim() || '#6b6a64';
    const curveColor = rootStyle.getPropertyValue('--accent').trim() || '#185fa5';

    const xToPx = (x) => (x + range) / (2 * range) * w;
    const yToPx = (y, yRange) => h / 2 - (y / yRange) * (h / 2) * 0.9;

    const points = [];
    let maxAbsY = 1;
    for (let px = 0; px <= w; px++) {
      const x = (px / w) * (2 * range) - range;
      let y;
      try { y = fn(x); } catch { y = NaN; }
      points.push([x, y]);
      if (isFinite(y)) maxAbsY = Math.max(maxAbsY, Math.abs(y));
    }
    const yRange = maxAbsY * 1.1;

    // gridlines
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    for (let gx = -range; gx <= range; gx += range / 5) {
      const px = xToPx(gx);
      ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, h); ctx.stroke();
    }
    for (let gy = -yRange; gy <= yRange; gy += yRange / 5) {
      const py = yToPx(gy, yRange);
      ctx.beginPath(); ctx.moveTo(0, py); ctx.lineTo(w, py); ctx.stroke();
    }

    // axes
    ctx.strokeStyle = axisColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(xToPx(0), 0); ctx.lineTo(xToPx(0), h); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, yToPx(0, yRange)); ctx.lineTo(w, yToPx(0, yRange)); ctx.stroke();

    // curve
    ctx.strokeStyle = curveColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    let started = false;
    points.forEach(([x, y]) => {
      if (!isFinite(y)) { started = false; return; }
      const px = xToPx(x), py = yToPx(y, yRange);
      if (!started) { ctx.moveTo(px, py); started = true; }
      else ctx.lineTo(px, py);
    });
    ctx.stroke();
  }

  graphPlotBtn.addEventListener('click', plotGraph);
  graphRangeSelect.addEventListener('change', plotGraph);
  window.addEventListener('resize', () => {
    if (views.graph.style.display !== 'none') plotGraph();
  });

  window.__plotGraphOnShow = plotGraph;
}
