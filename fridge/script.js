const resetButton = document.getElementById('reset-button');
const categoryDropdown = document.getElementById('category-dropdown');
const magnetContainer = document.getElementById('magnet-container');
const fridge = document.getElementById('fridge');

// Define magnets by category
const magnetsByCategory = {
  emojis: ['🍎', '🌟', '🍕', '🐶', '🌸', '🍩', '🚀'],
  letters: Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ'),
  countries: [
    'amsterdam.png', 'austria.png', 'barcelona.png', 'bern.png',
    'cambodia.png', 'denmark.png', 'edinburgh.png', 'france.png',
    'germany.png', 'ireland.png', 'italy.png', 'japan.png',
    'jordan.png', 'korea.png', 'laos.png', 'lisbon.png',
    'london.png', 'magnetas-klaipedos-svyturys.png', 'malaysia.png',
    'malta.png', 'philippines.png', 'poland.png', 'srilanka.png',
    'thailand.png', 'vietnam.png'
  ]
};

// Keep track of the dragged or cloned element
let draggedMagnet = null;

function populateMagnets(category) {
  magnetContainer.innerHTML = ''; // Clear storage

  // Colors for letters
  const colors = ['#44af69', '#f8333c', '#fcab10', '#2b9eb3'];

  magnetsByCategory[category].forEach((magnet) => {
    const magnetDiv = document.createElement('div');
    magnetDiv.className = 'magnet'; // Base magnet class
    magnetDiv.draggable = true; // Make it draggable

    if (category === 'letters') {
      // Add letters with random styles
      const letterElem = document.createElement('h1');
      letterElem.textContent = magnet;
      letterElem.className = 'letters-style';

      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      const randomRotation = Math.floor(Math.random() * 41 - 20); // Between -20deg and 20deg
      letterElem.style.color = randomColor;
      letterElem.style.transform = `rotate(${randomRotation}deg)`;

      magnetDiv.appendChild(letterElem);
    } else if (category === 'countries') {
      // Add country images
      const magnetImg = document.createElement('img');
      magnetImg.src = `magnets/${magnet}`;
      magnetImg.alt = magnet.split('.')[0];
      magnetImg.className = 'country-image';

    // Prevent image default drag behavior
    magnetImg.addEventListener('dragstart', (e) => e.preventDefault());

      magnetDiv.appendChild(magnetImg);
    } else if (category === 'emojis') {
      // Emojis are just text
      magnetDiv.textContent = magnet;
    }

    // Attach drag-and-drop event listeners
    magnetDiv.addEventListener('dragstart', dragStart);
    magnetDiv.addEventListener('dragend', dragEnd);

    magnetContainer.appendChild(magnetDiv);
  });
}

function dragStart(e) {
  const originalMagnet = e.target.closest('.magnet');
  if (originalMagnet) {
    if (originalMagnet.parentElement === magnetContainer) {
      
      // Clone the magnet if dragged from storage
      draggedMagnet = originalMagnet.cloneNode(true);
      draggedMagnet.classList.add('fridge-magnet'); // Mark as fridge item
      draggedMagnet.style.position = 'absolute'; // Prepare for positioning
      draggedMagnet.addEventListener('dragstart', dragStart);
      draggedMagnet.addEventListener('dragend', dragEnd);
    } else {
      // If already in the fridge, just drag the existing one
      draggedMagnet = originalMagnet;
    }

    console.log('Drag started:', draggedMagnet);
    e.dataTransfer.setData('text/plain', ''); // Required for drag-and-drop
    draggedMagnet.style.opacity = '0.5'; // Visual feedback
  }
}

function dragEnd() {
  if (draggedMagnet) {
    draggedMagnet.style.opacity = '1'; // Reset opacity
    draggedMagnet = null; // Clear reference
  }
}

function dropOnFridge(e) {
  e.preventDefault();
  if (draggedMagnet) {
    const fridgeRect = fridge.getBoundingClientRect();
    const x = e.clientX - fridgeRect.left - draggedMagnet.offsetWidth / 2;
    const y = e.clientY - fridgeRect.top - draggedMagnet.offsetHeight / 2;

    draggedMagnet.style.left = `${x}px`;
    draggedMagnet.style.top = `${y}px`;

    // Add the magnet to the fridge if it's a clone
    if (!fridge.contains(draggedMagnet)) {
      fridge.appendChild(draggedMagnet);
    }
  }
}

// Fridge event listeners
fridge.addEventListener('dragover', (e) => e.preventDefault());
fridge.addEventListener('drop', dropOnFridge);

// Reset functionality
resetButton.addEventListener('click', () => {
  // Remove all fridge magnets
  const fridgeMagnets = fridge.querySelectorAll('.fridge-magnet');
  fridgeMagnets.forEach((magnet) => fridge.removeChild(magnet));

  // Repopulate the selected category
  const selectedCategory = categoryDropdown.value;
  if (selectedCategory) {
    populateMagnets(selectedCategory);
  }
});

// Initialize the magnets on page load
function initializeMagnets() {
  const firstCategory = categoryDropdown.options[1]?.value;
  if (firstCategory) {
    categoryDropdown.value = firstCategory;
    populateMagnets(firstCategory);
  }
}

initializeMagnets(); // Run on page load

// Dropdown category change handler
categoryDropdown.addEventListener('change', (e) => {
  const selectedCategory = e.target.value;
  if (selectedCategory) {
    populateMagnets(selectedCategory);
  }
});


// Touch event handlers for mobile devices
let isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

function touchStart(e) {
  const originalMagnet = e.target.closest('.magnet');
  if (originalMagnet) {
    if (originalMagnet.parentElement === magnetContainer) {
      // Clone the magnet if dragged from storage
      draggedMagnet = originalMagnet.cloneNode(true);
      draggedMagnet.classList.add('fridge-magnet');
      draggedMagnet.style.position = 'absolute';
      fridge.appendChild(draggedMagnet); // Add to fridge immediately
    } else {
      // Drag existing magnet in the fridge
      draggedMagnet = originalMagnet;
    }

    const touch = e.touches[0];
    draggedMagnet.style.opacity = '0.5'; // Visual feedback
    draggedMagnet.startX = touch.clientX;
    draggedMagnet.startY = touch.clientY;
    draggedMagnet.offsetX = parseInt(draggedMagnet.style.left || 0, 10);
    draggedMagnet.offsetY = parseInt(draggedMagnet.style.top || 0, 10);
  }
}

function touchMove(e) {
  if (draggedMagnet) {
    const touch = e.touches[0];
    const deltaX = touch.clientX - draggedMagnet.startX;
    const deltaY = touch.clientY - draggedMagnet.startY;

    draggedMagnet.style.left = `${draggedMagnet.offsetX + deltaX}px`;
    draggedMagnet.style.top = `${draggedMagnet.offsetY + deltaY}px`;
  }
}

function touchEnd() {
  if (draggedMagnet) {
    draggedMagnet.style.opacity = '1'; // Reset opacity
    draggedMagnet = null; // Clear reference
  }
}

// Add touch or mouse event listeners
if (isTouchDevice) {
  fridge.addEventListener('touchstart', touchStart, { passive: false });
  fridge.addEventListener('touchmove', touchMove, { passive: false });
  fridge.addEventListener('touchend', touchEnd);
} else {
  fridge.addEventListener('dragover', (e) => e.preventDefault());
  fridge.addEventListener('drop', dropOnFridge);
}