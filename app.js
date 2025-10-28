// app.js

// --- 1. Firebase Konfiguration (Klassische Syntax, V8) ---
// 🚨 WICHTIG: Bitte mit DEINEN Werten aus der Firebase Console ersetzen!
const firebaseConfig = {
    apiKey: "AIzaSyAfE3X_1iU9Y5PFrTrKvlY94IermxG7eBI", 
    authDomain: "finanz-budget-app.firebaseapp.com",
    projectId: "finanz-budget-app",
    storageBucket: "finanz-budget-app.firebasestorage.app",
    messagingSenderId: "323702967682",
    appId: "1:323702967682:web:14387250c9fe08d854539b",
};

// Initialisiere Firebase
firebase.initializeApp(firebaseConfig);

// Hole die Instanzen
const auth = firebase.auth();
const db = firebase.firestore(); 

// --- 2. DOM-Elemente ---
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');
const logoutBtn = document.getElementById('logout-btn');
const authContainer = document.getElementById('auth-container');
const appContainer = document.getElementById('app-container');
const authMessage = document.getElementById('auth-message');

// DOM-Elemente für Transaktion
const amountInput = document.getElementById('amount');
const descriptionInput = document.getElementById('description');
const typeSelect = document.getElementById('type');
const addTransactionBtn = document.getElementById('add-transaction-btn');


// --- 3. Event Listener und Funktionen ---

// 1. Registrieren
signupBtn.addEventListener('click', () => {
    const email = emailInput.value;
    const password = passwordInput.value;
    auth.createUserWithEmailAndPassword(email, password)
        .then(() => {
            authMessage.textContent = "Erfolgreich registriert und angemeldet!";
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
        .then(() => {
            authMessage.textContent = "Erfolgreich angemeldet!";
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

// 4. Transaktion speichern
addTransactionBtn.addEventListener('click', addTransaction);

function addTransaction() {
    const amount = parseFloat(amountInput.value);
    const description = descriptionInput.value.trim();
    const type = typeSelect.value;
    
    // Validierung: Prüft auch, ob ein User angemeldet ist
    if (isNaN(amount) || description === '' || !auth.currentUser) {
        alert("Bitte gültigen Betrag und Beschreibung eingeben und sicherstellen, dass du angemeldet bist.");
        return;
    }

    db.collection('transactions').add({
        userId: auth.currentUser.uid, // WICHTIG für Sicherheitsregeln!
        amount: amount,
        description: description,
        type: type,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        amountInput.value = '';
        descriptionInput.value = '';
        console.log("Transaktion erfolgreich gespeichert.");
    })
    .catch((error) => {
        console.error("Fehler beim Speichern der Transaktion: ", error);
        alert("Fehler beim Speichern. Prüfe die Konsole und die Firestore-Regeln!");
    });
}


// --- 4. Zustandsüberwachung (Sichtbarkeit steuern) ---
auth.onAuthStateChanged((user) => {
    if (user) {
        // Benutzer ist angemeldet -> App anzeigen
        authContainer.style.display = 'none';
        appContainer.style.display = 'block';
        console.log("Angemeldet als:", user.email, "UID:", user.uid);
    } else {
        // Benutzer ist abgemeldet -> Login-Formular anzeigen
        authContainer.style.display = 'block';
        appContainer.style.display = 'none';
        console.log("Abgemeldet.");
    }
});