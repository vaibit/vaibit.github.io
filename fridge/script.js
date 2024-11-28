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

  const colors = ['#44af69', '#f8333c', '#fcab10', '#2b9eb3']; // Define colors

  magnetsByCategory[category].forEach((magnet) => {
    const magnetDiv = document.createElement('div');
    magnetDiv.className = 'magnet'; // Base magnet class
    magnetDiv.draggable = true; // Make the parent div draggable

    if (category === 'letters') {
      // Create a styled letter
      const letterElem = document.createElement('h1');
      letterElem.textContent = magnet; // Use the letter from the array
      letterElem.className = 'letters-style'; // Add the styling class

      // Assign random color and rotation
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      const randomRotation = Math.floor(Math.random() * 41 - 20); // Between -20deg and 20deg
      letterElem.style.color = randomColor;
      letterElem.style.transform = `rotate(${randomRotation}deg)`;

      magnetDiv.appendChild(letterElem);
    } else if (category === 'countries') {
      // Handle country images
      const magnetImg = document.createElement('img');
      magnetImg.src = `magnets/${magnet}`;
      magnetImg.alt = magnet.split('.')[0];
      magnetImg.className = 'country-image';
      magnetDiv.appendChild(magnetImg);
    } else {
      // Handle emojis
      magnetDiv.textContent = magnet;
    }

    // Attach drag-and-drop functionality
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

fridge.addEventListener('drop', e => {
  e.preventDefault();
  if (draggedMagnet) {
    const fridgeRect = fridge.getBoundingClientRect();
    const x = e.clientX - fridgeRect.left - draggedMagnet.offsetWidth / 2;
    const y = e.clientY - fridgeRect.top - draggedMagnet.offsetHeight / 2;

    // Position the dragged magnet in the fridge
    draggedMagnet.style.position = 'absolute';
    draggedMagnet.style.left = `${x}px`;
    draggedMagnet.style.top = `${y}px`;

    // Add a specific class to identify magnets in the fridge
    draggedMagnet.classList.add('fridge-magnet');
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

function dragStart(e) {
  const draggedElement = e.target;

  // Clone the dragged element if it is from the storage
  if (draggedElement.parentElement === magnetContainer) {
    const clone = draggedElement.cloneNode(true); // Clone the element
    clone.classList.add('fridge-magnet'); // Add fridge-specific class
    clone.style.position = 'absolute'; // Ensure draggable positioning

    // Add drag-and-drop event listeners to the clone
    clone.addEventListener('dragstart', dragStart);
    clone.addEventListener('dragend', dragEnd);

    // Attach the clone to the fridge on drop
    draggedElement.cloneReference = clone; // Save reference to the clone
  }

  draggedElement.style.opacity = '1'; // Visual feedback
}

function dragEnd(e) {
  const draggedElement = e.target;

  // If a clone was created, append it to the fridge
  if (draggedElement.cloneReference) {
    const fridgeRect = fridge.getBoundingClientRect();
    const x = e.clientX - fridgeRect.left - draggedElement.offsetWidth / 2;
    const y = e.clientY - fridgeRect.top - draggedElement.offsetHeight / 2;

    draggedElement.cloneReference.style.left = `${x}px`;
    draggedElement.cloneReference.style.top = `${y}px`;

    fridge.appendChild(draggedElement.cloneReference); // Add clone to fridge
    draggedElement.cloneReference = null; // Clear reference
  }

  draggedElement.style.opacity = '1'; // Reset opacity
}

resetButton.addEventListener('click', () => {
  const selectedCategory = categoryDropdown.value; // Get the current category
  if (selectedCategory) {
    // Target only the magnets currently in the fridge
    const fridgeMagnets = fridge.querySelectorAll('.fridge-magnet');
    fridgeMagnets.forEach(magnet => fridge.removeChild(magnet)); // Remove each magnet

    // Repopulate storage for the selected category
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

