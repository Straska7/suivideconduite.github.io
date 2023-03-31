function createExperience(id, date, distance, typeTrajet, manoeuvres, meteo, commentaires, latitude, longitude) {
  return {
    id: id,
    date: date,
    distance: distance,
    typeTrajet: typeTrajet,
    manoeuvres: manoeuvres,
    meteo: meteo,
    commentaires: commentaires,
    geolocalisation: {
      latitude: latitude,
      longitude: longitude
    }
  };
}

document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('experience-form');
  form.addEventListener('submit', handleSubmit);
  displayExperiences();
  createTypeTrajetChart();

  const exportCsvButton = document.getElementById('export-csv');
  exportCsvButton.addEventListener('click', exportDataAsCsv);

  const exportJsonButton = document.getElementById('export-json');
  exportJsonButton.addEventListener('click', exportDataAsJson);
});

async function handleSubmit(event) {
  event.preventDefault();

  const id = new Date().getTime();
  const date = document.getElementById('date').value;
  const distance = parseFloat(document.getElementById('distance').value);
  const typeTrajet = document.getElementById('typeTrajet').value;
  const manoeuvres = document.getElementById('manoeuvres').value.split(',');
  const meteo = document.getElementById('meteo').value;
  const commentaires = document.getElementById('commentaires').value;


  try {
    const position = await getLocation();
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    const experience = createExperience(id, date, distance, typeTrajet, manoeuvres, meteo, commentaires, latitude, longitude);


  saveExperience(experience);
  displayExperiences();
  createTypeTrajetChart(); 
} catch (error) {
    console.error("Error obtaining location:", error);
  }
}

function saveExperience(experience) {
  let experiences = JSON.parse(localStorage.getItem('experiences')) || [];

  experiences.push(experience);
  localStorage.setItem('experiences', JSON.stringify(experiences));
}

function displayExperiences() {
  const experiences = JSON.parse(localStorage.getItem('experiences')) || [];
  const tableBody = document.getElementById('experiences-table-body');

  tableBody.innerHTML = '';

  experiences.forEach((experience) => {
    const row = document.createElement('tr');

    const dateCell = document.createElement('td');
    dateCell.textContent = experience.date;
    row.appendChild(dateCell);

    const distanceCell = document.createElement('td');
    distanceCell.textContent = experience.distance;
    row.appendChild(distanceCell);

    const typeTrajetCell = document.createElement('td');
    typeTrajetCell.textContent = experience.typeTrajet;
    row.appendChild(typeTrajetCell);

    const manoeuvresCell = document.createElement('td');
    manoeuvresCell.textContent = experience.manoeuvres.join(', ');
    row.appendChild(manoeuvresCell);

    const meteoCell = document.createElement('td');
    meteoCell.textContent = experience.meteo;
    row.appendChild(meteoCell);

    const commentairesCell = document.createElement('td');
    commentairesCell.textContent = experience.commentaires;
    row.appendChild(commentairesCell);

    const geolocalisationCell = document.createElement('td');
    geolocalisationCell.textContent = `${experience.geolocalisation.latitude}, ${experience.geolocalisation.longitude}`;
    row.appendChild(geolocalisationCell);

    const actionsCell = document.createElement('td');
    const editButton = document.createElement('button');
    editButton.textContent = 'Modifier';
    editButton.addEventListener('click', () => editExperience(experience.id));
    actionsCell.appendChild(editButton);

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Supprimer';
    deleteButton.addEventListener('click', () => deleteExperience(experience.id));
    actionsCell.appendChild(deleteButton);

    row.appendChild(actionsCell);

    tableBody.appendChild(row);
  });
}

function createTypeTrajetChart() {
  const experiences = JSON.parse(localStorage.getItem('experiences')) || [];

  const typeTrajetCounts = experiences.reduce((acc, experience) => {
    acc[experience.typeTrajet] = (acc[experience.typeTrajet] || 0) + 1;
    return acc;
  }, {});

  const labels = Object.keys(typeTrajetCounts);
  const data = Object.values(typeTrajetCounts);

  const ctx = document.getElementById('typeTrajetChart').getContext('2d');
  const chart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [
        {
          data: data,
          backgroundColor: ['#ff6384', '#36a2eb', '#cc65fe', '#ffce56', '#4bc0c0'],
        },
      ],
    },
    options: {
      responsive: true,
      title: {
        display: true,
        text: 'Répartition des types de trajets',
      },
    },
  });
}

function updateTotalDistance() {
  const experiences = JSON.parse(localStorage.getItem('experiences')) || [];

  const totalDistance = experiences.reduce((acc, experience) => {
    return acc + experience.distance;
  }, 0);

  const totalDistanceElement = document.getElementById('totalDistance');
  totalDistanceElement.textContent = `Distance totale parcourue: ${totalDistance} km`;
}

function getLocation() {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position),
        (error) => reject(error)
      );
    } else {
      reject(new Error("Geolocation is not supported by this browser."));
    }
  });
}

function editExperience(experienceId) {
  const experiences = JSON.parse(localStorage.getItem('experiences')) || [];
  const experience = experiences.find((exp) => exp.id === experienceId);

  if (experience) {
    document.getElementById('date').value = experience.date;
    document.getElementById('distance').value = experience.distance;
    document.getElementById('typeTrajet').value = experience.typeTrajet;
    document.getElementById('manoeuvres').value = experience.manoeuvres.join(', ');
    document.getElementById('meteo').value = experience.meteo;
    document.getElementById('commentaires').value = experience.commentaires;

    const form = document.getElementById('experience-form');
    form.removeEventListener('submit', handleSubmit);
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      updateExperience(experienceId);
    });
  }
}

async function updateExperience(experienceId) {
  const experiences = JSON.parse(localStorage.getItem('experiences')) || [];
  const experienceIndex = experiences.findIndex((exp) => exp.id === experienceId);

  if (experienceIndex >= 0) {
    const date = document.getElementById('date').value;
    const distance = parseFloat(document.getElementById('distance').value);
    const typeTrajet = document.getElementById('typeTrajet').value;
    const manoeuvres = document.getElementById('manoeuvres').value.split(',');
    const meteo = document.getElementById('meteo').value;
    const commentaires = document.getElementById('commentaires').value;

    try {
      const position = await getLocation();
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      const updatedExperience = createExperience(experienceId, date, distance, typeTrajet, manoeuvres, meteo, commentaires, latitude, longitude);

      experiences.splice(experienceIndex, 1, updatedExperience);
      localStorage.setItem('experiences', JSON.stringify(experiences));

      displayExperiences();
      createTypeTrajetChart();

      const form = document.getElementById('experience-form');
      form.removeEventListener('submit', (event) => {
        event.preventDefault();
        updateExperience(experienceId);
      });
      form.addEventListener('submit', handleSubmit);
    } catch (error) {
      console.error('Error updating experience:', error);
    }
  }
}


function exportDataAsCsv() {
  const experiences = JSON.parse(localStorage.getItem('experiences')) || [];

  const header = [
    'Date',
    'Distance',
    'Type de trajet',
    'Manoeuvres',
    'Météo',
    'Commentaires',
    'Latitude',
    'Longitude',
  ];
  const csvContent = experiences.map((experience) => [
    experience.date,
    experience.distance,
    experience.typeTrajet,
    experience.manoeuvres.join(', '),
    experience.meteo,
    experience.commentaires,
    experience.geolocalisation.latitude,
    experience.geolocalisation.longitude,
  ]);
  csvContent.unshift(header);

  const csvData = csvContent.map((row) => row.join(',')).join('\n');
  const blob = new Blob([csvData], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = 'experiences.csv';
  link.click();

  URL.revokeObjectURL(url);
}

function exportDataAsJson() {
  const experiences = JSON.parse(localStorage.getItem('experiences')) || [];
  const jsonData = JSON.stringify(experiences, null, 2);
  const blob = new Blob([jsonData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = 'experiences.json';
  link.click();

  URL.revokeObjectURL(url);
}






