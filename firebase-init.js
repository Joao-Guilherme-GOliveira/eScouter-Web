// eScouter — inicialização única do Firebase
// Todas as páginas que precisam de Auth/Firestore importam daqui,
// em vez de repetir a configuração em cada arquivo.

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAc6C36u1GSnPDNh6RsA3tMrq6eCHRJ2L4",
  authDomain: "escouter-5d137.firebaseapp.com",
  projectId: "escouter-5d137",
  storageBucket: "escouter-5d137.firebasestorage.app",
  messagingSenderId: "243325160017",
  appId: "1:243325160017:web:fb6c5f9ae4c30f41970670"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);