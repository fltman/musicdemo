document.addEventListener('DOMContentLoaded', function () {
    const audioFileInput = document.getElementById('audioFile');
    const grid = document.getElementById('grid');
    const cells = [];

    const video = document.getElementById('dancerVideo');
    const canvas = document.getElementById('videoCanvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const circle1 = document.getElementById('circle1');
    const circle2 = document.getElementById('circle2');

    let currentEffect = 'dancers'; // Starting effect
    const switchInterval = 5000; // Switch effects every 5 seconds

    // Create the 10x10 grid
    for (let i = 0; i < 100; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        grid.appendChild(cell);
        cells.push(cell);
    }

    // Function to switch effects
    function switchEffect() {
        if (Math.random() < 0.3) { // 30% chance
            circle1.style.display = 'block';
            circle2.style.display = 'block';
        } else {
            circle1.style.display = 'none';
            circle2.style.display = 'none';
        }
        
        if (currentEffect === 'dancers') {
            currentEffect = 'colorWave';
        } else {
            currentEffect = 'dancers';
        }
    }

    // Set up interval to switch effects
    setInterval(switchEffect, switchInterval);

    audioFileInput.addEventListener('change', function (event) {
        const file = event.target.files[0];
        if (file) {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const reader = new FileReader();
document.getElementById('audioFile').style.display='none';
            reader.onload = function (e) {
                audioContext.decodeAudioData(e.target.result, function (buffer) {
                    const source = audioContext.createBufferSource();
                    source.buffer = buffer;

                    const analyser = audioContext.createAnalyser();
                    analyser.fftSize = 2048;
                    const bufferLength = analyser.frequencyBinCount;
                    const dataArray = new Uint8Array(bufferLength);

                    source.connect(analyser);
                    analyser.connect(audioContext.destination);
                    source.start();

                    function renderFrame() {
                        requestAnimationFrame(renderFrame);
                        analyser.getByteFrequencyData(dataArray);

                        const cellCount = cells.length;
                        const frequencyStep = Math.floor(bufferLength / cellCount);

                        // Calculate average volume for pulsating effect
                        let sum = 0;
                        for (let i = 0; i < bufferLength; i++) {
                            sum += dataArray[i];
                        }
                        const averageVolume = sum / bufferLength;

                        // Apply pulsating effect to the canvas
                        const scale = 1 + (averageVolume / 255) * 0.5;
                        canvas.style.transform = `scale(${scale})`;

                        if (currentEffect === 'dancers') {
                            for (let i = 0; i < cellCount; i++) {
                                const value = dataArray[i * frequencyStep];
                                const colorValue = Math.min(255, value * 2);
                                const hue = (i / cellCount) * 360 + (value / 255) * 120; // Added dynamic hue
                                const lightness = Math.min(50, (value / 255) * 100); // Adjusted to prevent full white

                                cells[i].style.backgroundColor = `hsla(${hue}, 100%, ${lightness}%, 0.5)`; // Added alpha for transparency
                                cells[i].style.transform = `scale(${(value / 255) * 8.5}) rotateX(${value * 2.5}deg) rotateY(${value * 2.5}deg)`; // Scale and rotate based on value
                                cells[i].style.boxShadow = `0 0 ${(value / 255) * 30}px hsla(${hue}, 100%, ${lightness}%, 0.7)`; // Added shadow
                            }

                            // Draw the video frame to the canvas
                            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                            // Perform chroma keying by inverting the logic to look for black pixels
                            const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
                            const length = frame.data.length / 4;
                            const threshold = 50; // Threshold for detecting black

                            for (let i = 0; i < length; i++) {
                                const r = frame.data[i * 4 + 0];
                                const g = frame.data[i * 4 + 1];
                                const b = frame.data[i * 4 + 2];

                                // Detect black pixels and make other pixels transparent
                                if (r < threshold && g < threshold && b < threshold) {
                                    frame.data[i * 4 + 3] = 255; // Opaque
                                } else {
                                    frame.data[i * 4 + 3] = 0; // Transparent
                                }
                            }

                            ctx.putImageData(frame, 0, 0);
                        } else if (currentEffect === 'colorWave') {
                            for (let i = 0; i < cellCount; i++) {
                                const value = dataArray[i * frequencyStep];
                                const colorValue = Math.min(255, value * 2);
                                const hue = (i / cellCount) * 360 + (value / 255) * 120; // Added dynamic hue
                                const lightness = Math.min(50, (value / 255) * 100); // Adjusted to prevent full white

                                cells[i].style.backgroundColor = `hsla(${hue}, 100%, ${lightness}%, 0.5)`; // Added alpha for transparency
                                cells[i].style.transform = `scale(${(value / 255) * 8.5}) rotateX(${value * 2.5}deg) rotateY(${value * 2.5}deg)`; // Scale and rotate based on value
                                cells[i].style.boxShadow = `0 0 ${(value / 255) * 30}px hsla(${hue}, 100%, ${lightness}%, 0.7)`; // Added shadow
                            }

                            // Create a simple color wave effect on the canvas
                            ctx.clearRect(0, 0, canvas.width, canvas.height);
                            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
                            gradient.addColorStop(0, `hsla(${Math.random() * 360}, 100%, 50%, 0.5)`);
                            gradient.addColorStop(1, `hsla(${Math.random() * 360}, 100%, 50%, 0.5)`);
                            ctx.fillStyle = gradient;
                            ctx.fillRect(0, 0, canvas.width, canvas.height);
                        }
                    }

                    renderFrame();
                });
            };

            reader.readAsArrayBuffer(file);
        }
    });

    // Resize canvas to match video
    video.addEventListener('loadeddata', function () {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
    });
});
