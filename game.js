/*
 * Skrivehastighed spil
 *
 * Et ord bevæger sig horisontalt over skærmen. Spilleren skal nå at skrive ordet
 * i inputfeltet, før ordet når frem til venstre kant. Ved korrekt indtastning
 * stiger hastigheden (ordet bevæger sig hurtigere). Ved fejlet forsøg falder
 * hastigheden (ordet bevæger sig langsommere). Efter 25 korrekte ord
 * skiftes der til en liste med længere ord, og hastigheden nulstilles til
 * starthastigheden. Spillet fortsætter, indtil de længste ord bruges.
 */

// Ord-lister opdelt efter længde
const wordLists = [
    // Korte ord (3-4 bogstaver)
    [
        'kat', 'hus', 'bil', 'bog', 'mad', 'sol', 'sne', 'mus', 'fod', 'hav',
        'hund', 'lys', 'far', 'mor', 'vej', 'sag', 'ros', 'ris', 'vand', 'vind',
        'fugl', 'bord', 'træ', 'kage', 'bøn', 'ost', 'by', 'dag', 'vin', 'var'
    ],
    // Mellemord (5-6 bogstaver)
    [
        'skole', 'stjerne', 'blomst', 'fisker', 'husene', 'cykler', 'telefon', 'sommer',
        'vinter', 'morgen', 'aften', 'venner', 'haver', 'skoven', 'hunden', 'kaffe',
        'frugt', 'bageri', 'søndag', 'mandag', 'tirsdag', 'onsdag', 'torsdag', 'fredag',
        'lørdag'
    ],
    // Lange ord (7-8 bogstaver)
    [
        'computer', 'forfatter', 'udvikler', 'arkitekt', 'eleverne', 'bibliotek',
        'kolleger', 'familie', 'økonomi', 'hospital', 'kantinen', 'univers', 'sygehus',
        'software', 'hardware', 'skuespil', 'teateret', 'spillede', 'bagerens', 'øvelser'
    ],
    // Meget lange ord (9+ bogstaver)
    [
        'destination', 'administration', 'international', 'koncentration', 'personlighed',
        'ansvarsområder', 'helbredelse', 'temperaturer', 'sprogundervisning', 'referencebog',
        'kommunikation', 'kulturinstitution', 'uddannelsesniveau', 'miljøforandringer', 'teknologiudvikling'
    ]
];

let currentListIndex = 0;              // Index over wordLists
let wordsWrittenThisLevel = 0;          // Antal korrekte ord i nuværende niveau
const wordsPerLevel = 25;               // Ord, der skal skrives før skift

// Hastighedsparametre (varighed i sekunder for ordets bevægelse)
const baseSpeed = 8;                    // Startvarighed (sekunder)
const minSpeed = 2;                     // Minimum varighed (hurtigste hastighed)
const maxSpeed = 12;                    // Maksimum varighed (langsommeste hastighed)
const speedIncreaseFactor = 0.90;       // Faktor for at gøre ordet hurtigere ved succes
const speedDecreaseFactor = 1.10;       // Faktor for at gøre ordet langsommere ved fejl
let currentSpeed = baseSpeed;           // Aktuel varighed

let currentWord = '';
let currentWordElement = null;
let animationStartTime = 0;
let animationFrameId = null;

const wordContainer = document.getElementById('word-container');
const inputField = document.getElementById('input-field');
const wordsCountSpan = document.getElementById('words-count');
const speedDisplaySpan = document.getElementById('speed-display');

// Opdaterer visningen af hastighed (afrundet til 1 decimal)
function updateSpeedDisplay() {
    speedDisplaySpan.textContent = currentSpeed.toFixed(1);
}

// Vælg et tilfældigt ord fra den aktuelle liste
function getRandomWord() {
    const list = wordLists[currentListIndex];
    if (!list || list.length === 0) {
        return '';
    }
    const index = Math.floor(Math.random() * list.length);
    return list[index];
}

// Start en ny ord-animation
function startWord() {
    // Fjern eventuelt tidligere ord og animation
    if (currentWordElement) {
        currentWordElement.remove();
        currentWordElement = null;
    }
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }

    currentWord = getRandomWord();
    if (!currentWord) {
        // Ingen ord tilbage (skulle ikke ske)
        return;
    }

    // Ryd inputfelt
    inputField.value = '';

    // Opret element for ordet
    const span = document.createElement('span');
    span.className = 'moving-word';
    span.textContent = currentWord;
    wordContainer.appendChild(span);
    currentWordElement = span;

    // Beregn start- og slutpositioner (i pixels)
    const containerWidth = wordContainer.clientWidth;
    const wordWidth = span.clientWidth;
    const startLeft = containerWidth;       // Start lige uden for højre kant
    const endLeft = -wordWidth;             // End lige uden for venstre kant

    // Opsæt animation
    animationStartTime = null;
    function animate(timestamp) {
        if (!animationStartTime) {
            animationStartTime = timestamp;
        }
        const elapsed = (timestamp - animationStartTime) / 1000; // sekunder
        const progress = Math.min(elapsed / currentSpeed, 1);
        const newLeft = startLeft + (endLeft - startLeft) * progress;
        span.style.left = newLeft + 'px';
        if (progress < 1) {
            animationFrameId = requestAnimationFrame(animate);
        } else {
            // Ord nåede slutpunktet uden at blive skrevet
            handleWordFailure();
        }
    }
    animationFrameId = requestAnimationFrame(animate);
}

// Håndter succes (ordet er skrevet korrekt)
function handleWordSuccess() {
    wordsWrittenThisLevel++;
    wordsCountSpan.textContent = parseInt(wordsCountSpan.textContent) + 1;
    // Gør hastigheden hurtigere men ikke under minSpeed
    currentSpeed = Math.max(minSpeed, currentSpeed * speedIncreaseFactor);
    updateSpeedDisplay();

    if (wordsWrittenThisLevel >= wordsPerLevel) {
        // Skift til næste niveau, hvis muligt
        if (currentListIndex < wordLists.length - 1) {
            currentListIndex++;
        }
        // Nulstil tæller og hastighed
        wordsWrittenThisLevel = 0;
        currentSpeed = baseSpeed;
        updateSpeedDisplay();
    }

    startWord();
}

// Håndter fejl (ordet nåede kanten)
function handleWordFailure() {
    // Øg varighed (gør ordet langsommere) men ikke over maxSpeed
    currentSpeed = Math.min(maxSpeed, currentSpeed * speedDecreaseFactor);
    updateSpeedDisplay();
    startWord();
}

// Håndter input fra spilleren
inputField.addEventListener('input', () => {
    const typed = inputField.value.trim();
    // Hvis spilleren har skrevet ordet korrekt
    if (typed.toLowerCase() === currentWord.toLowerCase()) {
        handleWordSuccess();
    }
});

// Forhindrer Enter-tasten i at genindlæse siden
inputField.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
    }
});

// Start spillet, når siden er indlæst
window.addEventListener('load', () => {
    wordsCountSpan.textContent = '0';
    currentSpeed = baseSpeed;
    updateSpeedDisplay();
    startWord();
    inputField.focus();
});
