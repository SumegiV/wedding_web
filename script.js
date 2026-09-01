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
        const webAppUrl = 'https://script.google.com/macros/s/AKfycbxE3X4ap0vCbqa00iYsdu9HkSKDo7jlkVn56ob_ObTPm0iVAwJuZIFCauk7K0XfW9Nh/exec';
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
        const MUSIC_SCRIPT_URL = "IDE_MASOLD_AZ_UJ_GOOGLE_APPS_SCRIPT_WEB_APP_URLT";
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

    // --- FÉNYKÉPFELTÖLTŐ LOGIKA ---
    const photoForm = document.getElementById("photoForm");
    if (photoForm) {
        const PHOTO_SCRIPT_URL = "IDE_MASOLD_A_FENYKEPFELTOLTO_SCRIPT_URLT";
        const uploaderNameInput = document.getElementById("uploaderName");
        const photoUploadInput = document.getElementById("photoUpload");
        const photoSubmitBtn = document.getElementById("photoSubmitBtn");
        const photoStatus = document.getElementById("photoStatus");
        const fileListDiv = document.getElementById("file-list");

        const validatePhotoForm = () => {
            const nameIsValid = uploaderNameInput.value.replace(/\s/g, '').length >= 3;
            const filesAreSelected = photoUploadInput.files.length > 0;
            photoSubmitBtn.disabled = !(nameIsValid && filesAreSelected);
        };

        uploaderNameInput.addEventListener('input', validatePhotoForm);
        photoUploadInput.addEventListener('change', () => {
            fileListDiv.innerHTML = "";
            if (photoUploadInput.files.length > 0) {
                let fileNames = Array.from(photoUploadInput.files).map(f => f.name).join('<br>');
                fileListDiv.innerHTML = `Kiválasztva: ${photoUploadInput.files.length} fájl`;
            }
            validatePhotoForm();
        });
        validatePhotoForm();

        photoForm.addEventListener("submit", function(e) {
            e.preventDefault();
            if (photoSubmitBtn.disabled) return;

            photoSubmitBtn.disabled = true;
            photoStatus.textContent = "Feltöltés előkészítése...";
            photoStatus.className = "status-message success visible";

            const uploaderName = uploaderNameInput.value.trim();
            const files = Array.from(photoUploadInput.files);
            let filesUploadedCount = 0;
            let totalFiles = files.length;
            let errors = [];

            const uploadFile = (file) => {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        const fileData = event.target.result.split(",");
                        const payload = {
                            uploaderName: uploaderName,
                            fileName: file.name,
                            mimeType: file.type || fileData[0].match(/:(\w.+);/)[1],
                            base64Data: fileData[1]
                        };
                        fetch(PHOTO_SCRIPT_URL, { method: "POST", body: JSON.stringify(payload) })
                            .then(res => res.json())
                            .then(data => {
                                if (data.result === 'success') {
                                    resolve(file.name);
                                } else {
                                    reject(new Error(data.error || `A(z) ${file.name} feltöltése sikertelen.`));
                                }
                            })
                            .catch(error => reject(error));
                    };
                    reader.onerror = error => reject(error);
                    reader.readAsDataURL(file);
                });
            };

            const processAllFiles = async () => {
                for (let i = 0; i < files.length; i++) {
                    try {
                        photoStatus.textContent = `Feltöltés folyamatban: ${i + 1}/${totalFiles} kép...`;
                        await uploadFile(files[i]);
                        filesUploadedCount++;
                    } catch (error) {
                        console.error("Fényképfeltöltő hiba:", error);
                        errors.push(files[i].name);
                    }
                }

                if (errors.length === 0) {
                    photoStatus.textContent = `Sikeres feltöltés! Mind a ${totalFiles} képet megkaptuk. Köszönjük!`;
                    photoStatus.className = "status-message success visible";
                } else {
                    photoStatus.textContent = `Feltöltés befejezve. ${filesUploadedCount} kép sikeres, ${errors.length} sikertelen. Hiba a következő fájloknál: ${errors.join(', ')}`;
                    photoStatus.className = "status-message error visible";
                }
                
                uploaderNameInput.value = '';
                photoUploadInput.value = '';
                fileListDiv.innerHTML = "";
                validatePhotoForm();
                
                setTimeout(() => { photoStatus.className = "status-message"; }, 8000);
            };

            processAllFiles();
        });
    }
});
