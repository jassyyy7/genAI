// Überprüfe den Server-Status
async function checkServerStatus() {
    try {
        const response = await fetch('/api/status');
        const data = await response.json();
        console.log('Server Status:', data);
    } catch (error) {
        console.error('Fehler beim Überprüfen des Server-Status:', error);
    }
}

// Initialisierung
document.addEventListener('DOMContentLoaded', () => {
    checkServerStatus();
}); 