// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAfE3X_1iU9Y5PFrTrKvlY94IermxG7eBI",
  authDomain: "finanz-budget-app.firebaseapp.com",
  projectId: "finanz-budget-app",
  storageBucket: "finanz-budget-app.firebasestorage.app",
  messagingSenderId: "323702967682",
  appId: "1:323702967682:web:14387250c9fe08d854539b",
  measurementId: "G-1YMM7Y34K5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// ** WICHTIG: Füge HIER DEINE EIGENE CONFIG EIN! **
const firebaseConfig = {
  // Ersetze dies mit dem Code, den du von Firebase erhalten hast
  apiKey: "DEIN_API_KEY",
  authDomain: "DEIN_AUTH_DOMAIN",
  projectId: "DEIN_PROJECT_ID",
  // ... restliche config ...
};

// Initialisiere Firebase
firebase.initializeApp(firebaseConfig);

// Hole die Auth-Instanz
const auth = firebase.auth();

const db = firebase.firestore();

// DOM-Elemente
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');
const logoutBtn = document.getElementById('logout-btn');
const authContainer = document.getElementById('auth-container');
const appContainer = document.getElementById('app-container');
const authMessage = document.getElementById('auth-message');

// --- Event Listener ---

// 1. Registrieren
signupBtn.addEventListener('click', () => {
    const email = emailInput.value;
    const password = passwordInput.value;
    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            authMessage.textContent = "Erfolgreich registriert und angemeldet!";
            // Die onAuthStateChanged-Funktion (unten) übernimmt die Anzeige
        })
        .catch((error) => {
            authMessage.textContent = `Fehler bei der Registrierung: ${error.message}`;
        });
});

// 2. Anmelden
loginBtn.addEventListener('click', () => {
    const email = emailInput.value;
    const password = passwordInput.value;
    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            authMessage.textContent = "Erfolgreich angemeldet!";
            // Die onAuthStateChanged-Funktion (unten) übernimmt die Anzeige
        })
        .catch((error) => {
            authMessage.textContent = `Fehler beim Login: ${error.message}`;
        });
});

// 3. Abmelden
logoutBtn.addEventListener('click', () => {
    auth.signOut().then(() => {
        authMessage.textContent = "Erfolgreich abgemeldet.";
    }).catch((error) => {
        authMessage.textContent = `Fehler beim Abmelden: ${error.message}`;
    });
});

// --- Zustandsüberwachung (Das Wichtigste!) ---
// Überprüft, ob der Benutzer angemeldet ist
auth.onAuthStateChanged((user) => {
    if (user) {
        // Benutzer ist angemeldet
        authContainer.style.display = 'none';
        appContainer.style.display = 'block';
        console.log("Angemeldet als:", user.email);
    } else {
        // Benutzer ist abgemeldet
        authContainer.style.display = 'block';
        appContainer.style.display = 'none';
        console.log("Abgemeldet.");
    }
});