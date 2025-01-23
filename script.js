import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getDatabase, ref, get, onValue } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

        // Your web app's Firebase configuration
        // For Firebase JS SDK v7.20.0 and later, measurementId is optional
        const firebaseConfig = {
            apiKey: "AIzaSyAJsUMdYR-sNUCv8jvqSB6zKby6I-l_9eA",
            authDomain: "gdlyork2025.firebaseapp.com",
            projectId: "gdlyork2025",
            storageBucket: "gdlyork2025.firebasestorage.app",
            messagingSenderId: "426698963480",
            appId: "1:426698963480:web:61b4494074290f4964e16d",
            measurementId: "G-Y4VC9D8HSD"
        };

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Obtener datos de categorías y competidores
const fetchCategoriesAndCompetitors = async () => {
    const snapshot = await get(ref(db, 'categorias/'));
    if (snapshot.exists()) {
        return snapshot.val();
    } else {
        console.log("No hay datos disponibles en 'categorias/'");
        return {};
    }
};

// Escuchar cuando el DOM está cargado
document.addEventListener('DOMContentLoaded', async () => {
    const tableBody = document.querySelector('#userTable tbody');
    const minutesIncrement = 5; // Incremento de minutos
    let selectedRow = 0; // Fila seleccionada (por defecto)
    let rowCount = 0; // Número total de filas (se ajustará dinámicamente)
    let useFirebaseTime = false;
    let initialTime = new Date(); // Hora inicial local por defecto
    let defautlTime=new Date();

    // Obtener datos de Firebase
    const categoriesData = await fetchCategoriesAndCompetitors();
    const categories = Object.keys(categoriesData);
    const users = [];

    // Calcular el total de competidores y llenar la lista de usuarios
    categories.forEach(category => {
        const categoryData = categoriesData[category];
        Object.keys(categoryData).forEach(competitorId => {
            users.push({ name: categoryData[competitorId], category });
        });
    });

    rowCount = users.length; // Ajustar rowCount al número total de competidores

    function formatTime(date) {
        return date.toTimeString().split(' ')[0]; // Formato HH:MM:SS
    }

    function generateTable(rows, userList, selectedRowIndex) {
        tableBody.innerHTML = ''; // Limpiar cuerpo de la tabla

        for (let i = 0; i < rows; i++) {
            const timeCell = document.createElement('td');
            const userCell = document.createElement('td');
            const categoryCell = document.createElement('td');

            // Calcular el tiempo basado en la fila seleccionada
            const offset = (i - selectedRowIndex) * minutesIncrement * 60000;
            const currentTime = new Date(initialTime.getTime() + offset);

            if (i < selectedRowIndex) {
                // Si la fila está antes de la seleccionada, mostrar "Finished" en verde
                timeCell.textContent = 'Finished';
                timeCell.style.color = 'green';
            } else {
                // Mostrar la hora calculada
                timeCell.textContent = formatTime(currentTime);
            }

            // Obtener datos del usuario y la categoría
            const user = userList[i % userList.length]; // Ciclar si hay más filas que usuarios
            userCell.textContent = user.name; // Nombre del competidor
            categoryCell.textContent = user.category; // Nombre de la categoría

            const row = document.createElement('tr');
            row.appendChild(timeCell);
            row.appendChild(userCell);
            row.appendChild(categoryCell);
            tableBody.appendChild(row);
        }
    }

    // Escuchar cambios en 'admin/hora' y 'admin/activarReloj'
    onValue(ref(db, 'admin/activarReloj'), snapshot => {
        useFirebaseTime = snapshot.val();
    });

    onValue(ref(db, 'admin/hora'), snapshot => {
        if (useFirebaseTime && snapshot.exists()) {
            initialTime = new Date(snapshot.val());
            defautlTime=initialTime;
            generateTable(rowCount, users, selectedRow);
        }
    });

    // Escuchar cambios en 'admin/selectedRow'
    onValue(ref(db, 'admin/selectedRow'), snapshot => {
        if (snapshot.exists()) {
            selectedRow = snapshot.val(); // Actualizar el valor de selectedRow
            generateTable(rowCount, users, selectedRow); // Regenerar la tabla
        }
    });

    // Actualizar la tabla cada 5 segundos con la hora actualizada si `activarReloj` es `false`
    setInterval(() => {
        if (!useFirebaseTime) {
            initialTime = new Date(); // Actualizar hora inicial local
            generateTable(rowCount, users, selectedRow);
        }
        else{
            initialTime=defautlTime;
            generateTable(rowCount, users, selectedRow);
        }
        
    }, 1000);
});
