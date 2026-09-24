
function generateToken(user, role) {
    return btoa(JSON.stringify({ user, role, exp: Date.now() + 3600 * 1000 }));
}

function saveToken(token) {
    localStorage.setItem('sig_token', token);
}

function getToken() {
    return localStorage.getItem('sig_token');
}

function getUserRole() {
    const token = getToken();
    if (!token) return null;
    try {
        return JSON.parse(atob(token)).role;
    } catch {
        return null;
    }
}

function isAuthenticated() {
    const token = getToken();
    if (!token) return false;
    try {
        const payload = JSON.parse(atob(token));
        return payload.exp > Date.now();
    } catch {
        return false;
    }
}

function logout() {
    localStorage.removeItem('sig_token');
    location.href = 'login.html';
}

// Redirection auto si non connecté
if (window.location.pathname.endsWith("index.html") && !isAuthenticated()) {
    window.location.href = "login.html";
}


// Login
const loginForm = document.getElementById("loginForm");
if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;
        const users = JSON.parse(localStorage.getItem("sig_users") || "{}");
        if (users[username] && users[username].password === password) {
            saveToken(generateToken(username, users[username].role));
            location.href = "index.html";
        } else {
            alert("Identifiants invalides.");
        }
    });
}

// Register
const registerForm = document.getElementById("registerForm");
if (registerForm) {
    registerForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;
        const role = document.getElementById("role").value;
        const users = JSON.parse(localStorage.getItem("sig_users") || "{}");
        if (users[username]) {
            alert("Nom d'utilisateur déjà utilisé.");
        } else {
            users[username] = { password, role };
            localStorage.setItem("sig_users", JSON.stringify(users));
            alert("Inscription réussie. Connectez-vous !");
            location.href = "login.html";
        }
    });
}

// Masquer les boutons selon le rôle
window.addEventListener('DOMContentLoaded', () => {
    const role = getUserRole();
    if (!role) return;

    if (role === 'eleve') {
        document.querySelectorAll('.admin-only, .teacher-only').forEach(e => e.style.display = 'none');
    } else if (role === 'enseignant') {
        document.querySelectorAll('.admin-only').forEach(e => e.style.display = 'none');
    }
});
