document.addEventListener('DOMContentLoaded', () => {
    // --- VISSZASZÁMLÁLÓ LOGIKA ---
    const countDownDate = new Date("Jul 24, 2027 16:00:00").getTime();
    const countdownInterval = setInterval(() => {
        const now = new Date().getTime();
        const distance = countDownDate - now;
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        const daysEl = document.getElementById("days");
        if (daysEl) {
            daysEl.innerText = days;
            document.getElementById("hours").innerText = hours;
            document.getElementById("minutes").innerText = minutes;
            document.getElementById("seconds").innerText = seconds;
        }
        if (distance < 0) {
            clearInterval(countdownInterval);
            const countdownEl = document.getElementById("countdown");
            if (countdownEl) {
                countdownEl.innerHTML = "<h2>Eljött a nagy nap!</h2>";
            }
        }
    }, 1000);

    // --- HÁTTÉR DIAVETÍTÉS LOGIKA ---
    const slides = document.querySelectorAll('.background-slideshow .slide');
    let currentSlide = 0;
    if (slides.length > 0) {
        setInterval(() => {
            if (slides[currentSlide]) slides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % slides.length;
            if (slides[currentSlide]) slides[currentSlide].classList.add('active');
        }, 3000);
    }

    // --- INTERAKTÍV KÁRTYÁK ---
    const infoCards = document.querySelectorAll('.info-card');
    const overlay = document.getElementById('modal-overlay');
    const openCard = (card) => {
        const cardClone = card.cloneNode(true);
        cardClone.classList.add('modal-card');
        cardClone.classList.remove('info-card');
        const closeButton = document.createElement('div');
        closeButton.innerHTML = '&times;';
        closeButton.className = 'modal-close-button';
        cardClone.appendChild(closeButton);
        document.body.appendChild(cardClone);
        overlay.classList.add('visible');
        document.body.classList.add('is-modal');
        const closeCardHandler = () => closeCard(cardClone);
        overlay.addEventListener('click', closeCardHandler, { once: true });
        closeButton.addEventListener('click', closeCardHandler, { once: true });
    }
    const closeCard = (cardClone) => {
        if (cardClone) cardClone.remove();
        overlay.classList.remove('visible');
        document.body.classList.remove('is-modal');
    }
    infoCards.forEach(card => card.addEventListener('click', () => openCard(card)));

    // --- RSVP UI LOGIKA (KAPCSOLÓK) ---
    const attendanceSwitch = document.getElementById('attendance');
    const guestsGroup = document.getElementById('guests-group');
    const hasAllergySwitch = document.getElementById('has-allergy');
    const foodAllergyGroup = document.getElementById('food-allergy-group');
    const allergySwitchGroup = hasAllergySwitch ? hasAllergySwitch.closest('.switch-group') : null;
    const updateSwitchLabel = (switchGroup) => {
        const input = switchGroup.querySelector('input[type="checkbox"]');
        const label = switchGroup.querySelector('.switch-label');
        if (input && label) {
            if (input.checked) {
                label.textContent = label.getAttribute('data-on');
                label.classList.add('is-on');
            } else {
                label.textContent = label.getAttribute('data-off');
                label.classList.remove('is-on');
            }
        }
    };
    const handleAttendanceChange = () => {
        if (!attendanceSwitch) return;
        const isAttending = attendanceSwitch.checked;
        if (guestsGroup) guestsGroup.classList.toggle('disabled', !isAttending);
        if (hasAllergySwitch && allergySwitchGroup) {
            if (!isAttending) {
                hasAllergySwitch.checked = false;
                hasAllergySwitch.disabled = true;
                allergySwitchGroup.classList.add('disabled');
                if (foodAllergyGroup) foodAllergyGroup.style.display = 'none';
            } else {
                hasAllergySwitch.disabled = false;
                allergySwitchGroup.classList.remove('disabled');
            }
            updateSwitchLabel(allergySwitchGroup);
        }
    };
    if (attendanceSwitch) {
        handleAttendanceChange();
        attendanceSwitch.addEventListener('change', handleAttendanceChange);
    }
    if (hasAllergySwitch) {
        hasAllergySwitch.addEventListener('change', () => {
            if (foodAllergyGroup) foodAllergyGroup.style.display = hasAllergySwitch.checked ? 'block' : 'none';
        });
    }
    document.querySelectorAll('.switch-group').forEach(switchGroup => {
        updateSwitchLabel(switchGroup);
        const input = switchGroup.querySelector('input[type="checkbox"]');
        if (input) input.addEventListener('change', () => updateSwitchLabel(switchGroup));
    });

    // --- RSVP VISSZAJELZÉS KÜLDÉSE ---
    const rsvpForm = document.querySelector('form[action="#"]');
    if (rsvpForm) {
        const webAppUrl = 'https://script.google.com/macros/s/AKfycbzTgGicF6Bw3n__-wL1kNYOHe_2UIAnTE5JhKe4A0bbvrMNKFksVN88JHDmTnj2xzZF/exec';
        const rsvpStatus = document.getElementById('rsvp-status');
        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const submitButton = rsvpForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;

        const validateRsvpForm = () => {
            const nameIsValid = nameInput.value.replace(/\s/g, '').length >= 3;
            const emailValue = emailInput.value.trim();
            const emailRegex = /\S+@\S+\.\S+/;
            const emailIsFilled = emailValue.length > 0;
            const emailFormatIsValid = emailRegex.test(emailValue);
            const emailFieldIsValid = !emailIsFilled || (emailIsFilled && emailFormatIsValid);

            if (!emailFieldIsValid) {
                submitButton.textContent = "Helytelen e-mail cím";
            } else {
                submitButton.textContent = originalButtonText;
            }
            submitButton.disabled = !(nameIsValid && emailFieldIsValid);
        };

        nameInput.addEventListener('input', validateRsvpForm);
        emailInput.addEventListener('input', validateRsvpForm);
        validateRsvpForm();

        rsvpForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (submitButton.disabled) return;
            submitButton.disabled = true;
            submitButton.textContent = 'Küldés...';
            rsvpStatus.className = "status-message";
            fetch(webAppUrl, { method: 'POST', body: new FormData(this) })
                .then(response => response.json())
                .then(data => {
                    if (data.result === 'success') {
                        rsvpStatus.textContent = 'Köszönjük a visszajelzést!';
                        rsvpStatus.className = "status-message success visible";
                        submitButton.style.display = 'none';
                    } else { throw new Error(data.error || 'Ismeretlen hiba.'); }
                })
                .catch(error => {
                    console.error('Hiba:', error);
                    rsvpStatus.textContent = 'Hiba! Próbáld újra.';
                    rsvpStatus.className = "status-message error visible";
                    validateRsvpForm();
                });
        });
    }

    // --- ZENEAJÁNLÓ ŰRLAP LOGIKA ---
    const musicForm = document.getElementById("musicForm");
    if (musicForm) {
        const MUSIC_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzTgGicF6Bw3n__-wL1kNYOHe_2UIAnTE5JhKe4A0bbvrMNKFksVN88JHDmTnj2xzZF/exec";
        const musicNameInput = document.getElementById("musicName");
        const musicInput = document.getElementById("musicInput");
        const musicSubmitBtn = document.getElementById("musicSubmitBtn");
        const musicStatus = document.getElementById("musicStatus");

        const validateMusicForm = () => {
            const nameIsValid = musicNameInput.value.replace(/\s/g, '').length >= 3;
            const musicIsValid = musicInput.value.replace(/\s/g, '').length >= 5;
            musicSubmitBtn.disabled = !(nameIsValid && musicIsValid);
        };

        musicNameInput.addEventListener('input', validateMusicForm);
        musicInput.addEventListener('input', validateMusicForm);
        validateMusicForm();

        musicForm.addEventListener("submit", function(e) {
            e.preventDefault();
            if (musicSubmitBtn.disabled) return;
            musicSubmitBtn.disabled = true;
            musicSubmitBtn.textContent = "Küldés...";
            musicStatus.className = "status-message";
            fetch(MUSIC_SCRIPT_URL, { method: "POST", body: new FormData(this) })
                .then(response => response.json())
                .then(data => {
                    if (data.result === "success") {
                        musicStatus.textContent = "Köszönjük az ajánlást! Nyugodtan küldhetsz újat.";
                        musicStatus.className = "status-message success visible";
                        musicInput.value = "";
                    } else { throw new Error(data.error || "Ismeretlen hiba."); }
                })
                .catch(error => {
                    console.error("Zeneajánló hiba:", error);
                    musicStatus.textContent = "Hiba történt a beküldéskor. Próbáld újra!";
                    musicStatus.className = "status-message error visible";
                })
                .finally(() => {
                    musicSubmitBtn.textContent = "Zene beküldése";
                    validateMusicForm();
                    setTimeout(() => { musicStatus.className = "status-message"; }, 5000);
                });
        });
    }

// --- FÉNYKÉPFELTÖLTŐ LOGIKA (PÁRHUZAMOS TÖMÖRÍTÉS + SZÁZALÉKOS FEEDBACK) ---
    const photoForm = document.getElementById("photoForm");
    if (photoForm) {
        const PHOTO_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzTgGicF6Bw3n__-wL1kNYOHe_2UIAnTE5JhKe4A0bbvrMNKFksVN88JHDmTnj2xzZF/exec";
        const uploaderNameInput = document.getElementById("uploaderName");
        const photoUploadInput = document.getElementById("photoUpload");
        const photoSubmitBtn = document.getElementById("photoSubmitBtn");
        const photoStatus = document.getElementById("photoStatus");
        const fileListDiv = document.getElementById("file-list");

        let processedFilesPayload = [];
        let isProcessingFiles = false;

        const validatePhotoForm = () => {
            const nameIsValid = uploaderNameInput.value.replace(/\s/g, '').length >= 3;
            const filesAreReady = processedFilesPayload.length > 0 && !isProcessingFiles;
            photoSubmitBtn.disabled = !(nameIsValid && filesAreReady);
        };

// IOS-KOMPATIBILIS KÉP ÁTMÉRETEZÉS ÉS TÖMÖRÍTÉS
        const readFileAsPayload = (file) => {
            return new Promise((resolve, reject) => {
                // Biztonsági időkorlát iOS-re (ha letagadásba kerülne a fájlbeolvasás)
                const timeout = setTimeout(() => {
                    reject(new Error("Időtúllépés a kép beolvasásakor: " + file.name));
                }, 10000);

                const reader = new FileReader();

                reader.onload = (e) => {
                    const img = new Image();
                    img.onload = () => {
                        clearTimeout(timeout);
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');

                        const MAX_SIZE = 1600;
                        let width = img.width;
                        let height = img.height;

                        if (width > height) {
                            if (width > MAX_SIZE) {
                                height *= MAX_SIZE / width;
                                width = MAX_SIZE;
                            }
                        } else {
                            if (height > MAX_SIZE) {
                                width *= MAX_SIZE / height;
                                height = MAX_SIZE;
                            }
                        }

                        canvas.width = width;
                        canvas.height = height;
                        ctx.drawImage(img, 0, 0, width, height);

                        // Kényszerített JPEG kimenet
                        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                        const base64Data = dataUrl.split(',')[1];
                        const cleanName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;

                        resolve({
                            fileName: cleanName + ".jpg",
                            mimeType: "image/jpeg",
                            base64Data: base64Data
                        });
                    };

                    img.onerror = (err) => {
                        clearTimeout(timeout);
                        reject(err);
                    };

                    img.src = e.target.result;
                };

                reader.onerror = (err) => {
                    clearTimeout(timeout);
                    reject(err);
                };

                reader.readAsDataURL(file);
            });
        };

        uploaderNameInput.addEventListener('input', validatePhotoForm);

        // AMINT A USER KIVÁLASZTJA A KÉPEKET, INDUL A PÁRHUZAMOS TÖMÖRÍTÉS!
        photoUploadInput.addEventListener('change', async () => {
            fileListDiv.innerHTML = "";
            processedFilesPayload = [];
            
            const rawFiles = Array.from(photoUploadInput.files);
            if (rawFiles.length === 0) {
                validatePhotoForm();
                return;
            }

            isProcessingFiles = true;
            validatePhotoForm();

            let processedCount = 0;
            const totalToProcess = rawFiles.length;
            const COMPRESS_CONCURRENCY = 8; // Egyszerre 4 képet tömörít párhuzamosan

            // Párhuzamos tömörítési folyamat kötegekben
            for (let i = 0; i < rawFiles.length; i += COMPRESS_CONCURRENCY) {
                const chunk = rawFiles.slice(i, i + COMPRESS_CONCURRENCY);
                
                await Promise.all(chunk.map(async (file) => {
                    try {
                        const processedFile = await readFileAsPayload(file);
                        processedFilesPayload.push(processedFile);
                    } catch (err) {
                        console.error("Hiba a kép előkészítésekor:", file.name, err);
                    } finally {
                        processedCount++;
                        const percent = Math.round((processedCount / totalToProcess) * 100);
                        fileListDiv.innerHTML = `Képek tömörítése: ${processedCount}/${totalToProcess} (${percent}%)...`;
                    }
                }));
            }

            isProcessingFiles = false;
            fileListDiv.innerHTML = `✓ ${processedFilesPayload.length} kép feldolgozva, készen áll a feltöltésre!`;
            validatePhotoForm();
        });

        validatePhotoForm();

        // FELTÖLTÉS INDÍTÁSA A GOMBRA KATTINTVA
        photoForm.addEventListener("submit", function(e) {
            e.preventDefault();
            if (photoSubmitBtn.disabled || processedFilesPayload.length === 0) return;

            photoSubmitBtn.disabled = true;
            photoStatus.textContent = "Feltöltés indítása...";
            photoStatus.className = "status-message success visible";

            const uploaderName = uploaderNameInput.value.trim();
            const totalFiles = processedFilesPayload.length;
            let filesUploadedCount = 0;
            let errors = [];

            const batchId = (crypto.randomUUID ? crypto.randomUUID() : (Date.now() + '-' + Math.random().toString(36).slice(2)));
            const BATCH_SIZE = 6; 
            let createdFolderId = null;

            const uploadBatch = async (fileChunk) => {
                const payload = {
                    uploaderName: uploaderName,
                    batchId: batchId,
                    folderId: createdFolderId,
                    files: fileChunk
                };
                const res = await fetch(PHOTO_SCRIPT_URL, { method: "POST", body: JSON.stringify(payload) });
                const data = await res.json();
                
                if (data.result === 'success') {
                    if (data.folderId) {
                        createdFolderId = data.folderId;
                    }
                } else {
                    throw new Error(data.error || 'A csoport feltöltése sikertelen.');
                }
            };

            const processAllFiles = async () => {
                try {
                    const firstChunk = processedFilesPayload.slice(0, BATCH_SIZE);
                    photoStatus.textContent = `Feltöltés folyamatban: ${Math.min(BATCH_SIZE, totalFiles)}/${totalFiles} kép...`;
                    await uploadBatch(firstChunk);
                    filesUploadedCount += firstChunk.length;

                    const remainingChunks = [];
                    for (let i = BATCH_SIZE; i < processedFilesPayload.length; i += BATCH_SIZE) {
                        remainingChunks.push(processedFilesPayload.slice(i, i + BATCH_SIZE));
                    }

                    const CONCURRENCY_LIMIT = 2;
                    for (let i = 0; i < remainingChunks.length; i += CONCURRENCY_LIMIT) {
                        const pool = remainingChunks.slice(i, i + CONCURRENCY_LIMIT);
                        
                        await Promise.all(pool.map(async (chunk) => {
                            try {
                                await uploadBatch(chunk);
                                filesUploadedCount += chunk.length;
                                photoStatus.textContent = `Feltöltés folyamatban: ${Math.min(filesUploadedCount, totalFiles)}/${totalFiles} kép...`;
                            } catch (error) {
                                console.error("Csomag hiba:", error);
                                chunk.forEach(f => errors.push(f.fileName));
                            }
                        }));
                    }

                } catch (error) {
                    console.error("Első csomag hiba:", error);
                    processedFilesPayload.slice(0, BATCH_SIZE).forEach(f => errors.push(f.fileName));
                }

                if (errors.length === 0) {
                    photoStatus.textContent = `Sikeres feltöltés! Mind a ${totalFiles} képet megkaptuk. Köszönjük!`;
                    photoStatus.className = "status-message success visible";
                } else {
                    photoStatus.textContent = `Feltöltés befejezve. ${filesUploadedCount} kép sikeres, ${errors.length} sikertelen.`;
                    photoStatus.className = "status-message error visible";
                }
                
                uploaderNameInput.value = '';
                photoUploadInput.value = '';
                fileListDiv.innerHTML = "";
                processedFilesPayload = [];
                validatePhotoForm();
                
                setTimeout(() => { photoStatus.className = "status-message"; }, 8000);
            };

            processAllFiles();
        });
    }
});