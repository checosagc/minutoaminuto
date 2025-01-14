document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.querySelector('#userTable tbody');

    // Configuration
    const rowCount = 11; // Number of rows
    const users = [
        'Alice', 'Bob', 'Charlie', 'David', 'Emma', 'Fiona', 'George', 'Hannah', 'Ian', 'Julia'
    ];
    const categories = [
        'Cat1', 'Cat2', 'Cat3', 'Cat4', 'Cat5', 'Cat6', 'Cat7', 'Cat8', 'Cat9', 'Cat10'
    ];
    const minutesIncrement = 5; // Minutes between each row
    const secondsIncrement = 0; // Seconds between each row

    let startTime = new Date();

    function formatTime(date) {
        return date.toTimeString().split(' ')[0]; // Format as HH:MM:SS
    }

    function generateTable(rows, userList, categoryList) {
        tableBody.innerHTML = ''; // Clear table body

        for (let i = 0; i < rows; i++) {
            const timeCell = document.createElement('td');
            const userCell = document.createElement('td');
            const categoryCell = document.createElement('td');

            const currentTime = new Date(startTime.getTime() + i * (minutesIncrement * 60000 + secondsIncrement * 1000)); // Increment by configured minutes and seconds

            timeCell.textContent = formatTime(currentTime);
            userCell.textContent = userList[i % userList.length]; // Loop through users if more rows than users
            categoryCell.textContent = categoryList[i % categoryList.length]; // Loop through categories if more rows than categories

            const row = document.createElement('tr');
            row.appendChild(timeCell);
            row.appendChild(userCell);
            row.appendChild(categoryCell);
            tableBody.appendChild(row);
        }
    }

    // Function to update the time every 5 seconds using AJAX
    function updateTime() {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', 'ajax/getTime.php', true); // Request to PHP file to get the current time
        xhr.onload = function() {
            if (xhr.status === 200) {
                const newTime = xhr.responseText; // Server's response (time in HH:MM:SS)
                const timeParts = newTime.split(':'); // Split time into hours, minutes, and seconds
                
                // Validate time format (ensure it's correct)
                if (timeParts.length === 3) {
                    startTime = new Date();
                    startTime.setHours(parseInt(timeParts[0]));
                    startTime.setMinutes(parseInt(timeParts[1]));
                    startTime.setSeconds(parseInt(timeParts[2]));

                    // Regenerate the table with the updated time
                    generateTable(rowCount, users, categories);
                } else {
                    console.error('Invalid time format received from the server:', newTime);
                }
            }
        };
        xhr.send();
    }

    // Initial table generation
    generateTable(rowCount, users, categories);

    // Update time every 5 seconds
    setInterval(updateTime, 5000); // Adjust interval as needed
});
