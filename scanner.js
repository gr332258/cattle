import QrScanner from './lib/qr-scanner.min.js';

document.addEventListener('DOMContentLoaded', () => {
    const videoElement = document.getElementById('qr-video');
    const outputElement = document.getElementById('output');
    const scanButton = document.getElementById('scan-button');

    let scanner;

    scanButton.addEventListener('click', async () => {
        if (!scanner) {
            scanner = new QrScanner(videoElement, (scannedText) => {
                const cattleId = extractCattleId(scannedText); // Get the cattle ID from the text
                const currentTime = new Date().toISOString(); // Get the time 
                // Get the location. This gelocation is a build in web api that works on most search engines
                navigator.geolocation.getCurrentPosition((pos) => {
                    const lat = pos.coords.latitude;
                    const lng = pos.coords.longitude;

                    //get data from previous scans in local storage
                    const allScanData = JSON.parse(localStorage.getItem('cattleScans') || '{}');

                    //if its the first scan
                    if (!allScanData[cattleId]) {
                        allScanData[cattleId] = {
                            info: scannedText,
                            locations: []
                        };
                    }

                    //save location and timestamp
                    allScanData[cattleId].locations.push({
                        lat: lat,
                        lng: lng,
                        timestamp: currentTime
                    });

                    // Save updated data
                    localStorage.setItem('cattleScans', JSON.stringify(allScanData));

                    // Show scanned data
                    const locations = allScanData[cattleId].locations;
                    const latestLocation = locations[locations.length - 1];
                    
                    // Show scanned data + location history
                    outputElement.innerHTML = `
                    <pre>Scanned Data:\n${scannedText}\n\nLatest Location:\n${latestLocation.lat}, ${latestLocation.lng} at ${latestLocation.timestamp}</pre>
                    <button id="toggle-history">See Location History</button>
                    <pre id="full-history" style="display:none;">${locations.map(loc => `• ${loc.lat}, ${loc.lng} at ${loc.timestamp}`).join('\n')}</pre>
                    `;
                    outputElement.style.display = 'block';
                    //Show the full history section 
                    document.getElementById('toggle-history').addEventListener('click', () => {
                        const history = document.getElementById('full-history');
                        history.style.display = history.style.display === 'none' ? 'block' : 'none';
                    });

                    console.log(scannedText);
                    scanner.stop();
                    videoElement.style.display = 'none';
                });
            }); 
        }

        videoElement.style.display = 'block'; // Move this before scanner.start()
        try {
            await scanner.start();
        } catch (error) {
            outputElement.textContent = 'Error: Unable to access camera.';
            outputElement.style.display = 'block';
            console.error(error);
        }
    });
});

// Helper to extract Cattle ID
function extractCattleId(data) {
    const match = data.match(/Cattle ID:\s*(\d+)/);
    return match ? match[1] : 'unknown';
}
