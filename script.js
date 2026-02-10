const SUPABASE_URL = 'https://yzmkqyrkkzobmpufdaae.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6bWtxeXJra3pvYm1wdWZkYWFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2OTQ0MDEsImV4cCI6MjA4NjI3MDQwMX0.BipsJiV7gr4nF39xmA8etbv0yrQ0hUvinjB_oE5vS2Q';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// --- LOGIK NAVIGASI ---
function showPage(pageId) {
    // Sembunyikan semua page
    document.querySelectorAll('.page').forEach(page => {
        page.classList.add('hidden');
    });
    // Tunjukkan page yang dipilih
    document.getElementById(pageId).classList.remove('hidden');
    
    // Jika buka feed, ambil data terbaru
    if(pageId === 'feed-page') {
        fetchMessages();
    }
}

// --- LOGIK DATABASE ---
const messageForm = document.getElementById('messageForm');
const messageFeed = document.getElementById('messageFeed');

async function fetchMessages(searchTerm = '') {
    let query = supabaseClient.from('notes').select('*').order('created_at', { ascending: false });
    if (searchTerm) query = query.ilike('receiver', `%${searchTerm}%`);

    const { data, error } = await query;
    if (!error) renderMessages(data);
}

function renderMessages(notes) {
    if (!notes || notes.length === 0) {
        messageFeed.innerHTML = '<p class="loading">NO ECHOES IN THE VOID...</p>';
        return;
    }

    messageFeed.innerHTML = notes.map(note => `
        <div class="note">
            <div class="ink-splat"></div> <p class="to">TO: ${note.receiver}</p>
            <p class="text">${note.message}</p>
            <span class="date">${new Date(note.created_at).toLocaleDateString()}</span>
        </div>
    `).join('');
}

messageForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const receiver = document.getElementById('receiver').value;
    const message = document.getElementById('message').value;

    const { error } = await supabaseClient.from('notes').insert([{ receiver, message }]);

    if (!error) {
        messageForm.reset();
        // BALIK KE INDEX/FEED SELEPAS BERJAYA
        showPage('feed-page'); 
    } else {
        alert("Error: " + error.message);
    }
});

// Initial load (Mula dengan Landing Page)
showPage('landing-page');
