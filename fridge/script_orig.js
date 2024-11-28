const resetButton = document.getElementById('reset-button');
const categoryDropdown = document.getElementById('category-dropdown');
const magnetContainer = document.getElementById('magnet-container');
const fridge = document.getElementById('fridge');

// Define magnets by category
const magnetsByCategory = {
  emojis: ['🍎', '🌟', '🍕', '🐶', '🌸', '🍩', '🚀'],
  letters: Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ'),
  countries: [
    'amsterdam.png',
    'austria.png',
    'barcelona.png',
    'bern.png',
    'cambodia.png',
    'denmark.png',
    'edinburgh.png',
    'france.png',
    'germany.png',
    'ireland.png',
    'italy.png',
    'japan.png',
    'jordan.png',
    'korea.png',
    'laos.png',
    'lisbon.png',
    'london.png',
    'magnetas-klaipedos-svyturys.png',
    'malaysia.png',
    'malta.png',
    'philippines.png',
    'poland.png',
    'srilanka.png',
    'thailand.png',
    'vietnam.png'
  ]
};

let draggedMagnet = null;

// Populate magnets dynamically
function populateMagnets(category) {
  magnetContainer.innerHTML = ''; // Clear existing magnets
  magnetContainer.classList.remove('hidden'); // Show storage container

  magnetsByCategory[category].forEach(magnet => {
    const magnetDiv = document.createElement('div');
    magnetDiv.className = 'magnet';
    magnetDiv.draggable = true; // Make the parent div draggable

    if (category === 'countries') {
      const magnetImg = document.createElement('img');
      magnetImg.src = `magnets/${magnet}`;
      magnetImg.alt = magnet.split('.')[0];
      magnetImg.className = 'country-image';

      // Prevent image interference
      magnetImg.addEventListener('dragstart', e => e.preventDefault());

      magnetDiv.appendChild(magnetImg);
    } else {
      magnetDiv.textContent = magnet; // Default for other categories
    }

    // Add drag-and-drop listeners to the parent div
    magnetDiv.addEventListener('dragstart', dragStart);
    magnetDiv.addEventListener('dragend', dragEnd);

    magnetContainer.appendChild(magnetDiv);
  });
}

// Drag-and-drop handlers
function dragStart(e) {
  draggedMagnet = e.target;
  e.dataTransfer.setData('text/plain', '');
  setTimeout(() => {
    draggedMagnet.style.opacity = '0.5';
  }, 0);
}

function dragEnd() {
  if (draggedMagnet) {
    draggedMagnet.style.opacity = '1';
    draggedMagnet = null;
  }
}

fridge.addEventListener('dragover', e => e.preventDefault());
fridge.addEventListener('drop', e => {
  e.preventDefault();
  if (draggedMagnet) {
    const fridgeRect = fridge.getBoundingClientRect();
    const x = e.clientX - fridgeRect.left - draggedMagnet.offsetWidth / 2;
    const y = e.clientY - fridgeRect.top - draggedMagnet.offsetHeight / 2;

    draggedMagnet.style.position = 'absolute';
    draggedMagnet.style.left = `${x}px`;
    draggedMagnet.style.top = `${y}px`;

    fridge.appendChild(draggedMagnet);
  }
});

// Reset button functionality
resetButton.addEventListener('click', () => {
  const selectedCategory = categoryDropdown.value; // Get the current category
  if (selectedCategory) {
    const fridgeMagnets = fridge.querySelectorAll('.magnet');
    fridgeMagnets.forEach(magnet => magnet.remove()); // Clear the fridge

    populateMagnets(selectedCategory); // Rebuild storage
  }
});

// Category dropdown change event
categoryDropdown.addEventListener('change', e => {
  const selectedCategory = e.target.value;
  if (selectedCategory) {
    populateMagnets(selectedCategory);
  }
});

// Initialize with no magnets visible
magnetContainer.classList.add('hidden');
