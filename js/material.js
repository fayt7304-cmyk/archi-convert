function initMaterialEstimate() {
  function updateMaterial() {
    const w = parseFloat(document.getElementById('mat-width').value) || 0;
    const wUnit = document.getElementById('mat-width-unit').value;
    const l = parseFloat(document.getElementById('mat-length').value) || 0;
    const lUnit = document.getElementById('mat-length-unit').value;
    const waste = parseFloat(document.getElementById('mat-waste').value) || 0;

    const wM = wUnit === 'ft' ? w * 0.3048 : w;
    const lM = lUnit === 'ft' ? l * 0.3048 : l;
    const areaM2 = wM * lM;
    const withWaste = areaM2 * (1 + waste / 100);

    document.getElementById('mat-result').textContent =
      fmt(areaM2, 2) + ' m\u00b2 (' + fmt(withWaste, 2) + ' m\u00b2 with waste)';
  }

  ['mat-width', 'mat-width-unit', 'mat-length', 'mat-length-unit', 'mat-waste'].forEach(id => {
    document.getElementById(id).addEventListener('input', updateMaterial);
    document.getElementById(id).addEventListener('change', updateMaterial);
  });
  updateMaterial();
}
