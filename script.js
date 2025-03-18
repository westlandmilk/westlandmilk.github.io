document.addEventListener("DOMContentLoaded", function () {
    const dateSelect = document.getElementById("date-select");
    const scheduleContainer = document.getElementById("schedule-container");
    const darkModeToggle = document.getElementById("dark-mode-toggle");
    
    let shiftData = [];
    
    // Fetch CSV
    fetch("shifts.csv")
        .then(response => response.text())
        .then(csvText => processCSV(csvText))
        .catch(error => console.error("Failed to load CSV:", error));
    
    function processCSV(csvText) {
        // Handle quoted fields and split properly
        const rows = csvText.trim().split("\n").map(row => row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/));
        
        shiftData = rows.slice(1).map(row => ({
            truck: row[0].trim(),
            start: row[1].trim(),
            driver: row[2].trim().split(" ")[0], // Extract only the first name
            run: row[3].trim().replace(/^"|"$/g, "").replace(/,/g, " - "), // Remove quotes and replace commas with dashes
            off: row[4].trim().split(" ")[0], // Extract only the first name
            shift: row[5].trim(),
            date: row[6].trim()
        }));
        
        // Populate date dropdown
        const uniqueDates = [...new Set(shiftData.map(entry => entry.date))].sort();
        uniqueDates.forEach(date => {
            let option = document.createElement("option");
            option.value = date;
            option.textContent = date;
            dateSelect.appendChild(option);
        });
        
        if (uniqueDates.length > 0) {
            updateSchedule(uniqueDates[0]); // Default to first date
        }
    }
    
    function updateSchedule(selectedDate) {
        scheduleContainer.innerHTML = "";

        let dayShift = shiftData.filter(entry => entry.date === selectedDate && entry.shift === "Day");
        let nightShift = shiftData.filter(entry => entry.date === selectedDate && entry.shift === "Night");

        if (dayShift.length > 0) {
            scheduleContainer.appendChild(createTable("Day Shift", dayShift));
        }
        if (nightShift.length > 0) {
            scheduleContainer.appendChild(createTable("Night Shift", nightShift));
        }
    }
    
    function createTable(title, data) {
        let section = document.createElement("div");
        section.style.position = "relative";
        section.style.marginBottom = "20px";

        let titleDiv = document.createElement("div");
        titleDiv.style.position = "sticky";
        titleDiv.style.top = "0";
        titleDiv.style.background = "#fff";
        titleDiv.style.zIndex = "150";
        titleDiv.style.padding = "10px 0";
        titleDiv.style.textAlign = "center";
        titleDiv.style.borderBottom = "1px solid #ddd";
        titleDiv.innerHTML = `<h3>${title}</h3>`;

        let tableContainer = document.createElement("div");
        tableContainer.style.overflow = "auto";
        tableContainer.style.maxHeight = "60vh";

        let table = document.createElement("table");
        let thead = document.createElement("thead");
        thead.innerHTML = `<tr>
            <th>Truck</th>
            <th>Start</th>
            <th>Driver</th>
            <th>Run</th>
            <th>Off</th>
        </tr>`;
        thead.style.position = "sticky";
        thead.style.top = "40px";
        thead.style.background = "#fff";
        thead.style.zIndex = "100";
        table.appendChild(thead);
        
        let tbody = document.createElement("tbody");
        data.forEach(entry => {
            let row = document.createElement("tr");
            row.innerHTML = `<td>${entry.truck}</td>
                             <td>${entry.start}</td>
                             <td>${entry.driver}</td>
                             <td>${entry.run}</td>
                             <td>${entry.off}</td>`;
            tbody.appendChild(row);
        });
        table.appendChild(tbody);
        
        tableContainer.appendChild(table);
        section.appendChild(titleDiv);
        section.appendChild(tableContainer);
        return section;
    }
    
    dateSelect.addEventListener("change", () => {
        updateSchedule(dateSelect.value);
    });

    // Dark Mode Handling
    function applyDarkMode() {
        const isDarkMode = localStorage.getItem("dark-mode") === "true" || window.matchMedia("(prefers-color-scheme: dark)").matches;
        document.body.classList.toggle("dark-mode", isDarkMode);
        darkModeToggle.textContent = isDarkMode ? "Light Mode" : "Dark Mode";
    }
    
    darkModeToggle.addEventListener("click", () => {
        const isDarkMode = !document.body.classList.contains("dark-mode");
        document.body.classList.toggle("dark-mode", isDarkMode);
        localStorage.setItem("dark-mode", isDarkMode);
        darkModeToggle.textContent = isDarkMode ? "Light Mode" : "Dark Mode";
    });

    applyDarkMode();
});