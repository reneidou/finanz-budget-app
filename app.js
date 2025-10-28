// app.js

// --- 1. Firebase Konfiguration (Klassische Syntax, V8) ---
// Bitte DEINE ECHTEN Firebase-Konfigurationsdaten hier einfügen
const firebaseConfig = {
  apiKey: "AIzaSyAfE3X_1iU9Y5PFrTrKvlY94IermxG7eBI",
  authDomain: "finanz-budget-app.firebaseapp.com",
  projectId: "finanz-budget-app",
  storageBucket: "finanz-budget-app.firebasestorage.app",
  messagingSenderId: "323702967682",
  appId: "1:323702967682:web:14387250c9fe08d854539b",
  // measurementId: "G-1YMM7Y34K5" // Kann weggelassen werden, wenn Analytics nicht über das CDN eingebunden ist
};

// Initialisiere Firebase (nutzt die globale Variable, die über das CDN erstellt wird)
firebase.initializeApp(firebaseConfig);

// Hole die Auth-Instanz und Firestore-Instanz
const auth = firebase.auth();
const db = firebase.firestore(); // ⬅️ WICHTIG: Füge dies HIER ein, da du Firestore nutzen willst

// --- 2. DOM-Elemente ---
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');
const logoutBtn = document.getElementById('logout-btn');
const authContainer = document.getElementById('auth-container');
const appContainer = document.getElementById('app-container');
const authMessage = document.getElementById('auth-message');

// NEUE DOM-Elemente für Transaktion (aus Schritt 5)
const amountInput = document.getElementById('amount');
const descriptionInput = document.getElementById('description');
const typeSelect = document.getElementById('type');
const addTransactionBtn = document.getElementById('add-transaction-btn');


// --- 3. Event Listener und Funktionen ---

// 1. Registrieren
signupBtn.addEventListener('click', () => {
    // ... (deine bestehende Registrierungslogik) ...
});

// 2. Anmelden
loginBtn.addEventListener('click', () => {
    // ... (deine bestehende Login-Logik) ...
});

// 3. Abmelden
logoutBtn.addEventListener('click', () => {
    auth.signOut().then(() => {
        authMessage.textContent = "Erfolgreich abgemeldet.";
    }).catch((error) => {
        authMessage.textContent = `Fehler beim Abmelden: ${error.message}`;
    });
});

// 4. Transaktion speichern (Aus dem letzten Schritt)
addTransactionBtn.addEventListener('click', addTransaction);

function addTransaction() {
    // ... (deine addTransaction Funktion, wie im letzten Schritt besprochen) ...
}


// --- 4. Zustandsüberwachung ---
auth.onAuthStateChanged((user) => {
    if (user) {
        authContainer.style.display = 'none';
        appContainer.style.display = 'block';
        console.log("Angemeldet als:", user.email, "UID:", user.uid);
        // HIER würde später der Code zum Laden der Transaktionen hinzukommen!
    } else {
        authContainer.style.display = 'block';
        appContainer.style.display = 'none';
        console.log("Abgemeldet.");
    }
});