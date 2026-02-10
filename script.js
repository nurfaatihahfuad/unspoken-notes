// INITIALIZE SUPABASE
const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
const SUPABASE_KEY = 'YOUR_ANON_PUBLIC_KEY';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const messageForm = document.getElementById('messageForm');
const messageFeed = document.getElementById('messageFeed');
const searchInput = document.getElementById('searchInput');

// 1. FETCH MESSAGES
async function fetchMessages(searchTerm = '') {
    let query = supabase
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false });

    if (searchTerm) {
        query = query.ilike('receiver', `%${searchTerm}%`);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching:', error);
        return;
    }
    renderMessages(data);
}

// 2. RENDER MESSAGES TO HTML
function renderMessages(notes) {
    if (notes.length === 0) {
        messageFeed.innerHTML = '<p class="loading">No echoes found...</p>';
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

// 3. POST NEW MESSAGE
messageForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = document.getElementById('submitBtn');
    
    const receiver = document.getElementById('receiver').value;
    const message = document.getElementById('message').value;

    submitBtn.disabled = true;
    submitBtn.innerText = 'Sending...';

    const { error } = await supabase
        .from('notes')
        .insert([{ receiver, message }]);

    if (error) {
        alert('Error sending message!');
        console.error(error);
    } else {
        messageForm.reset();
        fetchMessages();
    }
    
    submitBtn.disabled = false;
    submitBtn.innerText = 'Post to the Void';
});

// 4. SEARCH FILTER
searchInput.addEventListener('input', (e) => {
    fetchMessages(e.target.value);
});

// Initial Load
fetchMessages();
