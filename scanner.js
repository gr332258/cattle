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
                    outputElement.textContent = `Scanned Data:\n${scannedText}`;
                    outputElement.style.display = 'block';
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
