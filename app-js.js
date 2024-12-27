// Theme management
let theme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', theme);
updateThemeToggle();

function toggleTheme() {
    theme = theme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    updateThemeToggle();
}

function updateThemeToggle() {
    const button = document.querySelector('.theme-toggle i');
    button.className = theme === 'light' ? 'bx bx-moon' : 'bx bx-sun';
}

// Bookmark management
let bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];

// Search functionality
const searchInput = document.getElementById('searchInput');
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredBookmarks = bookmarks.filter(bookmark => 
        bookmark.title.toLowerCase().includes(searchTerm) || 
        bookmark.url.toLowerCase().includes(searchTerm)
    );
    renderBookmarks(filteredBookmarks);
});

// Render bookmarks
function renderBookmarks(bookmarksToRender = bookmarks) {
    const bookmarksList = document.getElementById('bookmarksList');
    
    if (bookmarksToRender.length === 0) {
        bookmarksList.innerHTML = `
            <div class="empty-state">
                <i class='bx bx-bookmark-alt' style="font-size: 3rem; color: var(--primary);"></i>
                <p>No bookmarks found. Add your first bookmark!</p>
            </div>
        `;
        return;
    }

    bookmarksList.innerHTML = bookmarksToRender.map((bookmark, index) => `
        <div class="bookmark-card" onclick="openBookmark('${encodeURIComponent(bookmark.url)}', event)">
            <div class="bookmark-icon">
                <i class='bx bx-bookmark'></i>
            </div>
            <h3 class="bookmark-title">${escapeHtml(bookmark.title)}</h3>
            <p class="bookmark-url">${escapeHtml(bookmark.url)}</p>
            <button class="delete-button" onclick="deleteBookmark(${index}, event)" title="Delete bookmark">
                <i class='bx bx-trash'></i>
            </button>
        </div>
    `).join('');
}

// Helper function to escape HTML
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Open bookmark in new tab
function openBookmark(url, event) {
    if (event.target.closest('.delete-button')) {
        return;
    }
    window.open(decodeURIComponent(url), '_blank');
}

// Modal management
function openModal() {
    const modalOverlay = document.getElementById('modalOverlay');
    modalOverlay.classList.add('active');
    document.getElementById('titleInput').focus();
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modalOverlay = document.getElementById('modalOverlay');
    modalOverlay.classList.remove('active');
    clearModalInputs();
    document.body.style.overflow = 'auto';
}

function clearModalInputs() {
    document.getElementById('titleInput').value = '';
    document.getElementById('urlInput').value = '';
}

// Save bookmark
function saveBookmark() {
    const titleInput = document.getElementById('titleInput');
    const urlInput = document.getElementById('urlInput');
    
    const title = titleInput.value.trim();
    let url = urlInput.value.trim();
    
    // Validate inputs
    if (!title || !url) {
        showNotification('Please fill in both title and URL fields', 'error');
        return;
    }
    
    // Add https:// if no protocol is specified
    if (!/^https?:\/\//i.test(url)) {
        url = 'https://' + url;
    }
    
    try {
        new URL(url); // Validate URL format
    } catch (e) {
        showNotification('Please enter a valid URL', 'error');
        return;
    }
    
    // Create new bookmark object
    const newBookmark = {
        title,
        url,
        dateAdded: new Date().toISOString()
    };
    
    // Add to bookmarks array
    bookmarks.unshift(newBookmark); // Add to beginning of array
    
    // Save to localStorage
    saveToLocalStorage();
    
    // Show success notification
    showNotification('Bookmark added successfully!', 'success');
    
    // Re-render bookmarks and close modal
    renderBookmarks();
    closeModal();
}

// Delete bookmark
function deleteBookmark(index, event) {
    event.stopPropagation();
    
    if (confirm('Are you sure you want to delete this bookmark?')) {
        bookmarks.splice(index, 1);
        saveToLocalStorage();
        renderBookmarks();
        showNotification('Bookmark deleted successfully!', 'success');
    }
}

// Save to localStorage
function saveToLocalStorage() {
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
}

// Notification system
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class='bx ${type === 'success' ? 'bx-check' : 'bx-x'}'></i>
        <span>${message}</span>
    `;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    renderBookmarks();
    
    // Close modal when clicking outside
    document.getElementById('modalOverlay').addEventListener('click', (event) => {
        if (event.target === event.currentTarget) {
            closeModal();
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeModal();
        }
        
        // Ctrl/Cmd + K to focus search
        if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
            event.preventDefault();
            searchInput.focus();
        }
        
        // Ctrl/Cmd + D to open add bookmark modal
        if ((event.ctrlKey || event.metaKey) && event.key === 'd') {
            event.preventDefault();
            openModal();
        }
    });
});

// Add form submission handler
document.querySelector('.modal form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    saveBookmark();
});