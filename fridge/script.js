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

function populateMagnets(category) {
  magnetContainer.innerHTML = ''; // Clear storage
  magnetContainer.classList.remove('hidden'); // Show storage container

  magnetsByCategory[category].forEach(magnet => {
    const magnetDiv = document.createElement('div');
    magnetDiv.className = 'magnet'; // Parent div gets the magnet class
    magnetDiv.draggable = true; // Make the parent div draggable

    if (category === 'countries') {
      // Add country image with the magnet class
      const magnetImg = document.createElement('img');
      magnetImg.src = `magnets/${magnet}`;
      magnetImg.alt = magnet.split('.')[0]; // Use filename as alt text
      magnetImg.className = 'magnet country-image'; // Add magnet class for consistency
      magnetDiv.appendChild(magnetImg);
    } else {
      magnetDiv.textContent = magnet; // Default behavior for emojis and letters
    }

    // Attach drag-and-drop listeners to the parent div
    magnetDiv.addEventListener('dragstart', dragStart);
    magnetDiv.addEventListener('dragend', dragEnd);

    magnetContainer.appendChild(magnetDiv);
  });
}


// Drag-and-drop handlers
function dragStart(e) {
  draggedMagnet = e.target;
  e.dataTransfer.setData('text/plain', '');
  draggedMagnet.style.opacity = '1';
}

function dragEnd() {
  if (draggedMagnet) {
    draggedMagnet.style.opacity = '1';
    draggedMagnet = null;
  }
}

function dragOver(e) {
  e.preventDefault();
}

function drop(e) {
  e.preventDefault();
  const fridgeRect = fridge.getBoundingClientRect();
  const x = e.clientX - fridgeRect.left - draggedMagnet.offsetWidth / 2;
  const y = e.clientY - fridgeRect.top - draggedMagnet.offsetHeight / 2;

  draggedMagnet.style.position = 'absolute';
  draggedMagnet.style.left = `${x}px`;
  draggedMagnet.style.top = `${y}px`;

  fridge.appendChild(draggedMagnet);
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

// Event handler for dropdown selection
categoryDropdown.addEventListener('change', e => {
  const selectedCategory = e.target.value;
  if (selectedCategory) {
    populateMagnets(selectedCategory); // Populate magnets for the selected category
  }
});

// Reset button functionality
resetButton.addEventListener('click', () => {
  const selectedCategory = categoryDropdown.value; // Get the current category
  if (selectedCategory) {
    // Target all elements with the magnet class (including img with class magnet)
    const fridgeMagnets = fridge.querySelectorAll('.magnet');
    fridgeMagnets.forEach(magnet => fridge.removeChild(magnet)); // Remove each magnet

    // Rebuild storage for the selected category
    populateMagnets(selectedCategory);
  }
});



// Initial population (optional: auto-select first category)
function initializeMagnets() {
  const firstCategory = categoryDropdown.options[1]?.value; // Get the first category
  if (firstCategory) {
    categoryDropdown.value = firstCategory; // Set the dropdown to the first category
    populateMagnets(firstCategory); // Populate magnets for the first category
  }
}

// Call initialization on page load
initializeMagnets();

