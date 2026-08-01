const tabs = document.querySelectorAll('.tabs > .tab');
const panels = { convert: 'convert-panel', material: 'material-panel', calculator: 'calculator-panel', weather: 'weather-panel' };
let weatherLoaded = false;

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    Object.values(panels).forEach(id => document.getElementById(id).style.display = 'none');
    document.getElementById(panels[tab.dataset.tab]).style.display = 'block';

    if (tab.dataset.tab === 'weather' && !weatherLoaded) {
      weatherLoaded = true;
      loadWeather();
    }
  });
});

initConverter();
initMaterialEstimate();
initCalculator();
initWeather();
initTheme();
