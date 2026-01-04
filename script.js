// Time and greeting
function updateTime() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    document.getElementById('time').textContent = `${hours}:${minutes} ${ampm}`;

    const hour = now.getHours();
    let greetingText = 'Good evening';
    if (hour < 12) greetingText = 'Good morning';
    else if (hour < 18) greetingText = 'Good afternoon';
    document.getElementById('greeting').textContent = greetingText;
}

updateTime();
setInterval(updateTime, 1000);

// Search functionality
document.getElementById('searchBox').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const query = e.target.value.trim();
        if (query.match(/^https?:\/\//)) {
            window.location.href = query;
        } else if (query.includes('.') && !query.includes(' ')) {
            window.location.href = 'https://' + query;
        } else {
            window.location.href = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        }
    }
});

// Favicon helper
function getFavicon(url) {
    try {
        const urlObj = new URL(url);
        return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=128`;
    } catch {
        return null;
    }
}

// Quicklinks data
const quicklinks = [
    { name: 'YouTube', url: 'https://youtube.com', icon: '🎬' },
    { name: 'Gmail', url: 'https://mail.google.com', icon: '📧' },
    { name: 'GitHub', url: 'https://github.com', icon: '💻' },
    { name: 'Twitter / X', url: 'https://x.com', icon: '🐦' },
    { name: 'Reddit', url: 'https://reddit.com', icon: '🔴' },
    { name: 'ChatGPT', url: 'https://chat.openai.com', icon: '🤖' },
    { name: 'Netflix', url: 'https://netflix.com', icon: '🎥' },
    { name: 'Spotify', url: 'https://open.spotify.com', icon: '🎵' },
    { name: 'LinkedIn', url: 'https://linkedin.com', icon: '💼' },
    { name: 'Google Drive', url: 'https://drive.google.com', icon: '📁' },
    { name: 'WhatsApp', url: 'https://web.whatsapp.com', icon: '💬' },
    { name: 'Amazon', url: 'https://amazon.com', icon: '🛒' },
];

// Render quicklinks
function renderQuicklinks() {
    const grid = document.getElementById('quicklinksGrid');
    grid.innerHTML = '';

    quicklinks.forEach(link => {
        const a = document.createElement('a');
        a.href = link.url;
        a.className = 'quicklink-item';

        const iconDiv = document.createElement('div');
        iconDiv.className = 'quicklink-icon';

        const img = document.createElement('img');
        img.src = getFavicon(link.url);
        img.onerror = function () {
            this.parentElement.textContent = link.icon;
            this.parentElement.style.fontSize = '1.5rem';
        };
        iconDiv.appendChild(img);

        const nameDiv = document.createElement('div');
        nameDiv.className = 'quicklink-name';
        nameDiv.textContent = link.name;

        a.appendChild(iconDiv);
        a.appendChild(nameDiv);
        grid.appendChild(a);
    });
}

// Create sidebar bookmark item
function createSidebarBookmarkItem(bookmark) {
    if (bookmark.url) {
        const a = document.createElement('a');
        a.href = bookmark.url;
        a.className = 'bookmark-list-item';

        const img = document.createElement('img');
        img.src = getFavicon(bookmark.url);
        img.onerror = function () {
            const icon = document.createElement('span');
            icon.className = 'icon';
            icon.textContent = '🔗';
            this.replaceWith(icon);
        };

        const nameSpan = document.createElement('span');
        nameSpan.className = 'name';
        nameSpan.textContent = bookmark.title || 'Untitled';

        a.appendChild(img);
        a.appendChild(nameSpan);
        return a;
    } else if (bookmark.children) {
        const wrapper = document.createElement('div');

        const folderItem = document.createElement('div');
        folderItem.className = 'bookmark-list-item folder';

        const icon = document.createElement('span');
        icon.className = 'icon';
        icon.textContent = '📁';

        const nameSpan = document.createElement('span');
        nameSpan.className = 'name';
        nameSpan.textContent = bookmark.title || 'Folder';

        folderItem.appendChild(icon);
        folderItem.appendChild(nameSpan);

        const childrenDiv = document.createElement('div');
        childrenDiv.className = 'folder-children';

        if (bookmark.children.length > 0) {
            bookmark.children.forEach(child => {
                const childEl = createSidebarBookmarkItem(child);
                if (childEl) childrenDiv.appendChild(childEl);
            });
        }

        folderItem.addEventListener('click', (e) => {
            e.stopPropagation();
            childrenDiv.classList.toggle('expanded');
            icon.textContent = childrenDiv.classList.contains('expanded') ? '📂' : '📁';
        });

        wrapper.appendChild(folderItem);
        wrapper.appendChild(childrenDiv);
        return wrapper;
    }
    return null;
}

// Render sidebar section
function renderSidebarSection(title, bookmarks, container) {
    if (!bookmarks || bookmarks.length === 0) return;

    const header = document.createElement('div');
    header.className = 'bookmark-section-header';
    header.textContent = title;
    container.appendChild(header);

    bookmarks.forEach(bookmark => {
        const el = createSidebarBookmarkItem(bookmark);
        if (el) container.appendChild(el);
    });
}

// Load sidebar bookmarks
function loadSidebarBookmarks() {
    const container = document.getElementById('sidebarBookmarks');

    if (typeof chrome !== 'undefined' && chrome.bookmarks) {
        chrome.bookmarks.getTree((bookmarkTree) => {
            container.innerHTML = '';

            if (bookmarkTree && bookmarkTree[0] && bookmarkTree[0].children) {
                const root = bookmarkTree[0].children;

                // Bookmarks Bar
                const bookmarksBar = root.find(node =>
                    node.title === 'Bookmarks Bar' || node.title === 'Bookmarks bar'
                );
                if (bookmarksBar && bookmarksBar.children) {
                    renderSidebarSection('Bookmarks Bar', bookmarksBar.children, container);
                }

                // Other Bookmarks
                const otherBookmarks = root.find(node =>
                    node.title === 'Other Bookmarks' || node.title === 'Other bookmarks'
                );
                if (otherBookmarks && otherBookmarks.children) {
                    renderSidebarSection('Other Bookmarks', otherBookmarks.children, container);
                }

                // Mobile Bookmarks
                const mobileBookmarks = root.find(node =>
                    node.title === 'Mobile Bookmarks' || node.title === 'Mobile bookmarks'
                );
                if (mobileBookmarks && mobileBookmarks.children) {
                    renderSidebarSection('Mobile Bookmarks', mobileBookmarks.children, container);
                }

                if (container.children.length === 0) {
                    container.innerHTML = '<div class="empty-state">No bookmarks found</div>';
                }
            }
        });
    } else {
        container.innerHTML = '<div class="empty-state">Load as Chrome extension to see bookmarks</div>';
    }
}

// Initialize
renderQuicklinks();
loadSidebarBookmarks();
