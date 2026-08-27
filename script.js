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
            slides[currentSlide].classList.remove('active');
            currentSlide = (currentSlide + 1) % slides.length;
            slides[currentSlide].classList.add('active');
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
        if (cardClone) {
            cardClone.remove();
        }
        overlay.classList.remove('visible');
        document.body.classList.remove('is-modal');
    }

    infoCards.forEach(card => {
        card.addEventListener('click', () => openCard(card));
    });


    // --- RSVP ŰRLAP LOGIKA ---
    const attendanceSwitch = document.getElementById('attendance');
    const guestsGroup = document.getElementById('guests-group');
    const hasAllergySwitch = document.getElementById('has-allergy');
    const foodAllergyGroup = document.getElementById('food-allergy-group');

    if (attendanceSwitch && guestsGroup) {
         guestsGroup.classList.toggle('disabled', !attendanceSwitch.checked);
    }
    if (hasAllergySwitch && foodAllergyGroup) {
        foodAllergyGroup.style.display = hasAllergySwitch.checked ? 'block' : 'none';
    }

    if (attendanceSwitch) {
        attendanceSwitch.addEventListener('change', () => {
            if (guestsGroup) {
                guestsGroup.classList.toggle('disabled', !attendanceSwitch.checked);
            }
        });
    }

    if (hasAllergySwitch) {
        hasAllergySwitch.addEventListener('change', () => {
            if (foodAllergyGroup) {
                foodAllergyGroup.style.display = hasAllergySwitch.checked ? 'block' : 'none';
            }
        });
    }

    const allSwitches = document.querySelectorAll('.switch-group');

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

    allSwitches.forEach(switchGroup => {
        updateSwitchLabel(switchGroup);
        const input = switchGroup.querySelector('input[type="checkbox"]');
        if (input) {
            input.addEventListener('change', () => updateSwitchLabel(switchGroup));
        }
    });

    // === ÚJ: GOOGLE SHEETS KÜLDÉSI LOGIKA ===
    const rsvpForm = document.querySelector('form[action="#"]');
    if (rsvpForm) {
        // Cseréld le ezt a saját URL-edre, amit a Google Apps Script adott!
        const webAppUrl = 'https://script.google.com/macros/library/d/1U1GDgtRG-cm7vrr40Je8ntW5zWZEU9EgTTfHwfvUwOXIUcKwug2TlCFJ/2';

        rsvpForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Megakadályozza az oldal újratöltődését

            const submitButton = this.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.textContent = 'Küldés...';

            // FormData összegyűjtése az űrlapból
            const formData = new FormData(this);

            fetch(webAppUrl, {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.result === 'success') {
                    submitButton.textContent = 'Köszönjük a visszajelzést!';
                    // Itt esetleg elrejtheted az űrlapot és kiírhatsz egy üzenetet
                    // rsvpForm.style.display = 'none';
                    // document.querySelector('.content-wrapper h2').insertAdjacentHTML('afterend', '<p>Sikeres visszajelzés!</p>');
                } else {
                    throw new Error(data.error || 'Ismeretlen hiba történt.');
                }
            })
            .catch(error => {
                console.error('Hiba:', error);
                submitButton.textContent = 'Hiba! Próbáld újra.';
                submitButton.style.backgroundColor = '#d9534f'; // Piros
                setTimeout(() => {
                    submitButton.disabled = false;
                    submitButton.textContent = originalButtonText;
                    submitButton.style.backgroundColor = ''; // Visszaállítjuk az eredeti színt
                }, 3000);
            });
        });
    }
});
