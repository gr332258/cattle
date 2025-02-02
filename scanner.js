import QrScanner from './lib/qr-scanner.min.js';

document.addEventListener('DOMContentLoaded', () => {
    const videoElement = document.getElementById('qr-video');
    const outputElement = document.getElementById('output');
    const scanButton = document.getElementById('scan-button');

    let scanner;

    scanButton.addEventListener('click', async () => {
        if (!scanner) {
            scanner = new QrScanner(videoElement, (result) => {
                // Show scanned data
                outputElement.textContent = `Scanned Data: ${result}`;
                outputElement.style.display = 'block';
                console.log(result);
                scanner.stop(); // Stop scanning after QR code
                videoElement.style.display = 'none'; //stop vid
            });
        }

        try {
            videoElement.style.display = 'block'; // Show the video element
            await scanner.start();
        } catch (error) {
            outputElement.textContent = 'Error: Unable to access camera.';
            outputElement.style.display = 'block';
            console.error(error);
        }
    });
});

