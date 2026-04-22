/**
 * Sidebar: Handles the element list UI, search filtering, and categories.
 * Integrated with a callback pattern to bridge the 3D Engine and Info Cards.
 */
class Sidebar {
    constructor() {
        this.container = document.getElementById('sidebar-anchor');
        this.elementsData = null;
        this.onSelectCallback = null; 
        this.searchTerm = "";
        
        if (this.container) {
            this.init();
        } else {
            console.warn("HueMind Sidebar: '#sidebar-anchor' not found in DOM.");
        }
    }

    async init() {
        try {
            const response = await fetch('./data/elements.json');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            this.elementsData = await response.json();
            
            // 1. Setup Search Listener
            const searchInput = document.getElementById('el-search');
            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    this.searchTerm = e.target.value.toLowerCase();
                    this.renderList(); // Re-render list on every keystroke
                });
            }

            // 2. Initial Render
            this.renderList();
        } catch (error) {
            console.error("HueMind Sidebar: Data fetch failed.", error);
            if (this.container) {
                this.container.innerHTML = `<div class="error">Failed to load elements.</div>`;
            }
        }
    }

    /**
     * setCallback: Bridges Scene.js logic to the Sidebar
     */
    setCallback(callback) {
        this.onSelectCallback = callback;
    }

    /**
     * renderList: Builds the scrollable element list with search filtering
     */
    renderList() {
        // Ensure we have a dedicated list container inside the anchor
        let listWrapper = document.getElementById('element-list');
        if (!listWrapper) {
            listWrapper = document.createElement('div');
            listWrapper.id = 'element-list';
            this.container.appendChild(listWrapper);
        }
        
        listWrapper.innerHTML = '';

        Object.keys(this.elementsData).forEach(atomicNum => {
            const el = this.elementsData[atomicNum];
            
            // Search Filtering
            const matchesSearch = el.name.toLowerCase().includes(this.searchTerm) || 
                                 el.symbol.toLowerCase().includes(this.searchTerm) ||
                                 el.category.toLowerCase().includes(this.searchTerm);
            
            if (!matchesSearch) return;

            const btn = document.createElement('div');
            // Add category as a class for specialized CSS styling
            const category = el.category || "unknown"; // Fallback if missing
            const categoryClass = category.replace(/\s+/g, '-').toLowerCase();
            btn.className = `element-item ${categoryClass}`;
            
            // Re-apply active class if this was the last selected element
            // (Defaults to Carbon/6 on first load)
            if (this.currentSelectedId === atomicNum || (!this.currentSelectedId && atomicNum == "6")) {
                btn.classList.add('active');
            }

            btn.innerHTML = `
                <span class="atomic-num">${atomicNum}</span>
                <span class="symbol" style="color: ${el.color}">${el.symbol}</span>
                <div class="meta">
                    <span class="name">${el.name}</span>
                    <span class="category-label">${el.category}</span>
                </div>
            `;

            btn.onclick = (e) => this.selectElement(atomicNum, e);
            listWrapper.appendChild(btn);
        });
    }

    /**
     * selectElement: Updates 3D Scene, Info Cards, and UI State
     */
    selectElement(id, event) {
        const data = this.elementsData[id];
        if (!data) return;

        this.currentSelectedId = id;

        // 1. Update the 3D Engine via Callback
        if (this.onSelectCallback) {
            this.onSelectCallback(data.protons, data.neutrons, data.shells);
        }

        // 2. Update Info Card Text Content
        const uiMap = {
            'el-name': data.name,
            'el-symbol': data.symbol,
            'el-description': data.description,
            'stat-p': data.protons,
            'stat-n': data.neutrons,
            'stat-s': data.shells.join(', ')
        };

        for (const [id, value] of Object.entries(uiMap)) {
            const el = document.getElementById(id);
            if (el) el.innerText = value;
        }

        // 3. Visual Polish: Badge Glow and active states
        const badge = document.getElementById('el-symbol');
        if (badge) {
            badge.style.backgroundColor = data.color;
            badge.style.boxShadow = `0 0 15px ${data.color}44`; // 44 is transparency
        }
        
        // Update Active Class in List
        document.querySelectorAll('.element-item').forEach(i => i.classList.remove('active'));
        if (event && event.currentTarget) {
            event.currentTarget.classList.add('active');
        }
    }
}

export { Sidebar };