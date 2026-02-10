// 1. INITIALIZE SUPABASE
// Pastikan URL dan KEY ini adalah tepat dari dashboard API anda
const SUPABASE_URL = 'https://yzmkqyrkkzobmpufdaae.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6bWtxeXJra3pvYm1wdWZkYWFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2OTQ0MDEsImV4cCI6MjA4NjI3MDQwMX0.BipsJiV7gr4nF39xmA8etbv0yrQ0hUvinjB_oE5vS2Q';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const messageForm = document.getElementById('messageForm');
const messageFeed = document.getElementById('messageFeed');
const searchInput = document.getElementById('searchInput');

// 2. FUNGSI AMBIL MESEJ (FETCH)
async function fetchMessages(searchTerm = '') {
    console.log("Memuatkan mesej...");
    let query = supabaseClient
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false });

    // Jika ada carian nama
    if (searchTerm) {
        query = query.ilike('receiver', `%${searchTerm}%`);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Ralat semasa mengambil data:', error.message);
        return;
    }
    renderMessages(data || []);
}

// 3. FUNGSI PAPAR MESEJ DI SKRIN (RENDER)
function renderMessages(notes) {
    if (!notes || notes.length === 0) {
        messageFeed.innerHTML = '<p class="loading">No echoes yet. Be the first to write.</p>';
        return;
    }

    messageFeed.innerHTML = notes.map(note => `
        <div class="note">
            <p class="to">To: ${note.receiver}</p>
            <p class="text">${note.message}</p>
            <span class="date">${new Date(note.created_at).toLocaleDateString()}</span>
        </div>
    `).join('');
}

// 4. FUNGSI HANTAR MESEJ BARU (POST)
messageForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = document.getElementById('submitBtn');
    
    const receiver = document.getElementById('receiver').value;
    const message = document.getElementById('message').value;

    // Elakkan hantar data kosong
    if (!receiver.trim() || !message.trim()) return;

    submitBtn.disabled = true;
    submitBtn.innerText = 'Sending to the void...';

    const { error } = await supabaseClient
        .from('notes')
        .insert([{ receiver: receiver, message: message }]);

    if (error) {
        alert('Gagal menghantar: ' + error.message);
        console.error(error);
    } else {
        console.log("Mesej berjaya dihantar!");
        messageForm.reset();
        // Mesej akan muncul sendiri jika Realtime dihidupkan, 
        // tapi kita panggil fetchMessages() sebagai backup.
        fetchMessages();
    }
    
    submitBtn.disabled = false;
    submitBtn.innerText = 'Post to the Void';
});

// 5. FUNGSI CARIAN (SEARCH)
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        fetchMessages(e.target.value);
    });
}

// 6. FUNGSI REALTIME (Mesej muncul tanpa refresh)
// Nota: Pastikan anda dah enable "Replication" untuk table 'notes' di dashboard Supabase
supabaseClient
    .channel('public:notes')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notes' }, (payload) => {
        console.log('Mesej baru dikesan!', payload.new);
        fetchMessages(); 
    })
    .subscribe();

// Jalankan fungsi ambil data buat kali pertama apabila page dibuka
fetchMessages();
