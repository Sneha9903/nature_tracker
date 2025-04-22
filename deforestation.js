document.addEventListener("DOMContentLoaded", async () => {
    const countryCheckboxList = document.getElementById("countryCheckboxList");
    const chartContainer = document.getElementById("chartContainer");
  

    let data = [];

    try {
      const response = await fetch("./deforestation_data.csv");
      if (!response.ok) throw new Error("Failed to load CSV");
      const text = await response.text();
      const rows = text.trim().split("\n").slice(1);
      
      data = rows.map(row => {
        const columns = row.split(",");
        if (columns.length !== 3) {
          console.warn("Skipping invalid row:", row);
          return null;
        }
        const [Country, Year, ForestArea] = columns;
        return {
          Country: Country.trim(),
          Year: Year.trim(),
          Area: parseFloat(ForestArea)
        };
      }).filter(d => d !== null); // remove invalid rows
    
    } catch (error) {
      alert("Error loading data. Please check the CSV file.");
      console.error(error);
    }
    
    
  
    const countries = [...new Set(data.map(row => row.Country))].sort();
  
    function populateCheckboxes(countryList) {
      countryCheckboxList.innerHTML = '';
      countryList.forEach(country => {
        const label = document.createElement('label');
        label.classList.add('checkbox-pill');
        label.innerHTML = `
          <input type="checkbox" value="${country}" />
          ${country}
        `;
        countryCheckboxList.appendChild(label);
      });
    }
  
    populateCheckboxes(countries);
  
    function getSelectedCountries() {
      return Array.from(
        countryCheckboxList.querySelectorAll('input[type="checkbox"]:checked')
      ).map(cb => cb.value);
    }
  
    document.getElementById("plotBtn").addEventListener("click", () => {
      const selectedCountries = getSelectedCountries();
  
      if (selectedCountries.length === 0) {
        alert("Please select at least one country.");
        return;
      }
  
      const traces = selectedCountries.map(country => {
        const filtered = data.filter(d => d.Country === country);
        return {
          x: filtered.map(d => d.Year),
          y: filtered.map(d => d.Area),
          type: 'scatter',
          mode: 'lines+markers',
          name: country
        };
      });
  
      Plotly.newPlot(chartContainer, traces, {
        title: selectedCountries.length === 1
          ? `Forest Area in ${selectedCountries[0]}`
          : "Forest Area Comparison",
        xaxis: { title: "Year" },
        yaxis: { title: "Forest Area (%)" }
      });
    });
  
    document.getElementById("resetBtn").addEventListener("click", () => {
      countryCheckboxList.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
      chartContainer.innerHTML = '';
    });
  });
  
