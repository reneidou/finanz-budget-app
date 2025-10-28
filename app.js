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

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore(); 

// --- 2. Globale Zustände und DOM-Elemente ---
let currentFamilyId = null; 
let unsubscribeFromTransactions = null;
let unsubscribeFromFixedCosts = null;

const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');
const logoutBtn = document.getElementById('logout-btn');
const authContainer = document.getElementById('auth-container');
const appContainer = document.getElementById('app-container');
const authMessage = document.getElementById('auth-message');
const currentBalanceSpan = document.getElementById('current-balance');
const currentFamilyIdSpan = document.getElementById('current-family-id'); // NEU
const transactionList = document.getElementById('transaction-list');
const fixedCostsList = document.getElementById('fixed-costs-list'); 

// DOM-Elemente für Variable Transaktion
const amountInput = document.getElementById('amount');
const descriptionInput = document.getElementById('description');
const typeSelect = document.getElementById('type');
const certaintySelect = document.getElementById('certainty'); 
const addTransactionBtn = document.getElementById('add-transaction-btn');

// DOM-Elemente für Fixkosten
const fixedCostDescriptionInput = document.getElementById('fixed-cost-description');
const fixedCostAmountInput = document.getElementById('fixed-cost-amount');
const fixedCostRecurrenceSelect = document.getElementById('fixed-cost-recurrence');
const fixedCostNextDueInput = document.getElementById('fixed-cost-next-due');
const addFixedCostBtn = document.getElementById('add-fixed-cost-btn');


// --- 3. Event Listener ---
if (signupBtn) signupBtn.addEventListener('click', handleSignUp);
if (loginBtn) loginBtn.addEventListener('click', handleLogin);
if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
if (addTransactionBtn) addTransactionBtn.addEventListener('click', addTransaction);
if (addFixedCostBtn) addFixedCostBtn.addEventListener('click', addFixedCost); 

// Event Delegation für dynamisch erstellte Buttons (z.B. Fixkosten Bestätigung)
document.addEventListener('click', (e) => {
    if (e.target.matches('.confirm-fixed-cost-btn')) {
        const docId = e.target.dataset.id;
        const plannedAmount = parseFloat(e.target.dataset.amount);
        promptForActualAmount(docId, plannedAmount);
    }
});


// --- 4. AUTHENTIFIZIERUNGS-FUNKTIONEN ---

function handleSignUp() {
    const email = emailInput.value;
    const password = passwordInput.value;
    auth.createUserWithEmailAndPassword(email, password)
        .then(() => {
            authMessage.textContent = "Erfolgreich registriert und angemeldet!";
        })
        .catch((error) => {
            authMessage.textContent = `Fehler bei der Registrierung: ${error.message}`;
        });
}
function handleLogin() {
    const email = emailInput.value;
    const password = passwordInput.value;
    auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            authMessage.textContent = "Erfolgreich angemeldet!";
        })
        .catch((error) => {
            authMessage.textContent = `Fehler beim Login: ${error.message}`;
        });
}

function handleLogout() {
    auth.signOut().then(() => {
        authMessage.textContent = "Erfolgreich abgemeldet.";
    }).catch((error) => {
        authMessage.textContent = `Fehler beim Abmelden: ${error.message}`;
    });
}

// --- 5. FIXKOSTEN-LOGIK ---

function addFixedCost() {
    const description = fixedCostDescriptionInput.value.trim();
    const amount = parseFloat(fixedCostAmountInput.value);
    const recurrence = fixedCostRecurrenceSelect.value;
    const nextDue = fixedCostNextDueInput.value;
    
    if (description === '' || isNaN(amount) || !currentFamilyId) {
        alert("Bitte Beschreibung, Betrag eingeben und sicherstellen, dass du einer Familie zugeordnet bist.");
        return;
    }

    db.collection('fixedCosts').add({
        familyId: currentFamilyId,
        description: description,
        plannedAmount: amount,
        recurrence: recurrence,
        nextDueDate: new Date(nextDue),
        lastConfirmedAmount: amount,
        lastConfirmedDate: new Date(),
        active: true,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        fixedCostDescriptionInput.value = '';
        fixedCostAmountInput.value = '';
        console.log("Fixkosten erfolgreich gespeichert.");
    })
    .catch((error) => {
        console.error("Fehler beim Speichern der Fixkosten: ", error);
        alert("Fehler beim Speichern der Fixkosten. Prüfe die Firebase-Regeln!");
    });
}

function promptForActualAmount(docId, plannedAmount) {
    const actualAmountStr = prompt(`Geplant war ${plannedAmount.toFixed(2)} €. Wie hoch war der tatsächlich bezahlte Betrag?`);
    const actualAmount = parseFloat(actualAmountStr);

    if (isNaN(actualAmount) || actualAmount <= 0) {
        alert("Ungültiger Betrag eingegeben. Bestätigung abgebrochen.");
        return;
    }

    // 1. Hole die Beschreibung aus dem DOM
    const descriptionElement = document.querySelector(`[data-id="${docId}"]`).closest('li').querySelector('.fc-desc');
    const description = `Bestätigte Fixkosten: ${descriptionElement ? descriptionElement.textContent : 'Unbekannt'}`;

    // 2. Speichere die tatsächliche Zahlung als Transaktion (Historie und Prognose-Korrektur)
    db.collection('transactions').add({
        familyId: currentFamilyId,
        description: description,
        amount: actualAmount,
        type: 'expense',
        certainty: 'exact', 
        isFixedCostConfirmation: true,
        plannedAmount: plannedAmount,
        difference: actualAmount - plannedAmount,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });

    // 3. Aktualisiere die Fixkosten-Position (nächste Fälligkeit)
    // HINWEIS: Realistische Berechnungslogik für das nächste Fälligkeitsdatum fehlt noch.
    const nextDate = new Date(); 
    const docRef = db.collection('fixedCosts').doc(docId);

    docRef.update({
        lastConfirmedAmount: actualAmount,
        lastConfirmedDate: firebase.firestore.FieldValue.serverTimestamp(),
        nextDueDate: firebase.firestore.Timestamp.fromDate(nextDate)
    })
    .then(() => {
        console.log("Fixkosten-Bestätigung erfolgreich abgeschlossen.");
    })
    .catch((error) => {
        console.error("Fehler bei der Fixkosten-Aktualisierung:", error);
    });
}

function loadFixedCosts(familyId) {
    if (unsubscribeFromFixedCosts) unsubscribeFromFixedCosts();
    
    const query = db.collection('fixedCosts')
        .where('familyId', '==', familyId) 
        .where('active', '==', true)
        .orderBy('nextDueDate', 'asc');

    unsubscribeFromFixedCosts = query.onSnapshot(snapshot => {
        fixedCostsList.innerHTML = ''; 
        
        snapshot.forEach(doc => {
            const cost = doc.data();
            const nextDueStr = cost.nextDueDate ? cost.nextDueDate.toDate().toLocaleDateString() : 'N/A';
            const isDue = cost.nextDueDate && cost.nextDueDate.toDate() <= new Date();

            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <span class="fc-desc">${cost.description}</span>: Geplant ${cost.plannedAmount.toFixed(2)} € (${cost.recurrence}) | Fällig: ${nextDueStr}
                ${isDue ? 
                    `<button class="confirm-fixed-cost-btn" data-id="${doc.id}" data-amount="${cost.plannedAmount}" style="margin-left: 10px; background-color: ${isDue ? 'orange' : 'none'};">
                        Bestätigen
                    </button>` : ''}
            `;
            fixedCostsList.appendChild(listItem);
        });
    }, error => {
        console.error("Fehler beim Laden der Fixkosten: ", error);
    });
}

// --- 6. VARIABLE TRANSAKTIONS-LOGIK ---

function addTransaction() {
    const amount = parseFloat(amountInput.value);
    const description = descriptionInput.value.trim();
    const type = typeSelect.value;
    const certainty = certaintySelect.value;

    if (isNaN(amount) || description === '' || !auth.currentUser || !currentFamilyId) {
        alert("Bitte gültigen Betrag und Beschreibung eingeben und sicherstellen, dass du einer Familie zugeordnet bist.");
        return;
    }

    db.collection('transactions').add({
        familyId: currentFamilyId,
        amount: amount,
        description: description,
        type: type,
        certainty: certainty, 
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        amountInput.value = '';
        descriptionInput.value = '';
        console.log("Bemerkenswerte Transaktion erfolgreich gespeichert.");
    })
    .catch((error) => {
        console.error("Fehler beim Speichern der Transaktion: ", error);
        alert("Fehler beim Speichern. Prüfe die Konsole und die Firestore-Regeln!");
    });
}

// Lade- und Stopp-Funktionen für Transaktionen (müssen familyId verwenden)
function loadTransactions(familyId) { 
    if (unsubscribeFromTransactions) unsubscribeFromTransactions();
    // Logik fehlt hier, wird im nächsten Schritt zur Übersicht hinzugefügt 
    // Muss auch nach familyId filtern!
}
function stopTransactionsListener() { 
    if (unsubscribeFromTransactions) {
        unsubscribeFromTransactions();
        unsubscribeFromTransactions = null;
    }
}


// --- 7. ZENTRALE STEUERUNG ---

function loadDashboard(familyId) {
    console.log(`Lade Dashboard für Familie: ${familyId}`);
    currentFamilyIdSpan.textContent = familyId; // Zeige die ID an
    // Startet die Listener
    loadTransactions(familyId); 
    loadFixedCosts(familyId); 
    // Später: loadAssets(familyId); und Prognosen starten
}

auth.onAuthStateChanged((user) => {
    if (user) {
        authContainer.style.display = 'none';
        appContainer.style.display = 'block';
        
        // 🚨 WICHTIG: Suche nach FamilyID 
        db.collection('families')
            .where('members', 'array-contains', user.uid)
            .limit(1) 
            .get()
            .then(snapshot => {
                if (!snapshot.empty) {
                    currentFamilyId = snapshot.docs[0].id;
                    loadDashboard(currentFamilyId); 
                } else {
                    currentFamilyId = null;
                    currentFamilyIdSpan.textContent = 'KEINE ZUGEORDNET';
                    authMessage.textContent = "Angemeldet, aber noch keiner Familie zugeordnet. Bitte erstelle oder trete einer Familie bei (Feature folgt).";
                    // App-Container bleibt sichtbar, um Abmeldung zu ermöglichen
                }
            })
            .catch(error => {
                console.error("Fehler beim Abrufen der Familien-ID:", error);
                authMessage.textContent = `Fehler: ${error.message}`;
            });
            
    } else {
        authContainer.style.display = 'block';
        appContainer.style.display = 'none';
        currentFamilyId = null;
        if (unsubscribeFromTransactions) stopTransactionsListener();
        if (unsubscribeFromFixedCosts) unsubscribeFromFixedCosts();
    }
});