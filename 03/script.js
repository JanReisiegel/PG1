// Callback function called, when file is "opened"
function handleFileSelect(item) {
	var files = item.files;

	console.log(files);

	for (var i = 0; i < files.length; i++) {
		console.log(files[i], files[i].name, files[i].size, files[i].type);

		// Only process image files.
		if (!files[i].type.match('image.*')) {
			continue;
		}

		var reader = new FileReader();

		// Closure for loading image to memory
		reader.onload = (function (file) {
			return function (evt) {

				var srcImg = new Image();
				srcImg.src = evt.target.result;

				srcImg.onload = function () {
					var srcCanvas = document.getElementById("src");
					var srcContext = srcCanvas.getContext("2d");

					// Change size of canvas
					srcCanvas.height = srcImg.height;
					srcCanvas.width = srcImg.width;

					srcContext.drawImage(srcImg, 0, 0);

					var convertButton = document.getElementById("convert");
					// Enabled button
					convertButton.disabled = false;
					// Add callback
					convertButton.addEventListener('click', convertImage, false);
				}
			}
		})(files[i]);

		reader.readAsDataURL(files[i]);

		break;
	}
}


// Callback function called, when clicked at Convert button
function convertImage() {
	var srcCanvas = document.getElementById("src");
	var srcContext = srcCanvas.getContext("2d");
	var canvasHeight = srcCanvas.height;
	var canvasWidth = srcCanvas.width;

	var srcImageData = srcContext.getImageData(0, 0, canvasWidth, canvasHeight);
	srcImageData = convertToGrayScale(srcImageData);

	convertImageData(srcImageData);

	srcContext.putImageData(srcImageData, 0, 0);
}


// Function for converting raw data of image
function convertImageData(imgData) {
	let testMatrix = getMatrixFromTable();
	console.log(testMatrix);
	let width = imgData.width;
	let height = imgData.height;
	var rawData = imgData.data;
	var M = [[0, 12, 3, 15], [8, 4, 11, 7], [2, 14, 1, 13], [10, 6, 9, 5]];
	var k = document.getElementById("k_parametr").value;
	var min = 0;
	var max = 255;
	var n = 4;

	// Go through the image using x,y coordinates
	var pixelIndex, red, green, blue, alpha;


	for (var y = 0; y < imgData.height; y++) {
		for (var x = 0; x < imgData.width; x++) {
			pixelIndex = ((imgData.width * y) + x) * 4

			let r = rawData[pixelIndex];     // Red
			let g = rawData[pixelIndex + 1]; // Green
			let b = rawData[pixelIndex + 2]; // Blue
			let a = rawData[pixelIndex + 3]; // Alpha

			let matrixValue = M[x % n][y % n];

			// Porovnání s maticí a použití ditheringu
			if (r > k * matrixValue) {
				// Pokud je pixel větší než matice, nastavíme na bílou
				rawData[pixelIndex] = rawData[pixelIndex + 1] = rawData[pixelIndex + 2] = max;
			} else {
				// Jinak černá
				rawData[pixelIndex] = rawData[pixelIndex + 1] = rawData[pixelIndex + 2] = min;
			}

			/*let grayscale = rawData[pixelIndex];

			let newColor = grayscale < 128 ? 0 : 255;

			// Chyba zaokrouhlení
			let error = grayscale - newColor;

			// Nastavíme nový černobílý pixel
			rawData[pixelIndex] = rawData[pixelIndex + 1] = rawData[pixelIndex + 2] = newColor;

			// Rozptyl chyby podle matice (přesahujeme okraje obrázku, tak se musíme omezit)
			if (x + 1 < width) rawData[(y * width + (x + 1)) * 4] += (7 / 16) * error;
			if (x - 1 >= 0 && y + 1 < height) rawData[((y + 1) * width + (x - 1)) * 4] += (3 / 16) * error;
			if (y + 1 < height) rawData[((y + 1) * width + x) * 4] += (5 / 16) * error;
			if (x + 1 < width && y + 1 < height) rawData[((y + 1) * width + (x + 1)) * 4] += (1 / 16) * error;*/

		}
	}
}

function convertToGrayScale(imgData) {
	var rawData = imgData.data;

	for (var i = 0; i < rawData.length; i += 4) {
		//BT.601
		var avg = 0.299 * rawData[i] + 0.587 * rawData[i + 1] + 0.114 * rawData[i + 2];
		rawData[i] = avg;
		rawData[i + 1] = avg;
		rawData[i + 2] = avg;
	}
	return imgData;
}

function generateMatrixInputs() {
	const rows = document.getElementById('rows').value;
	const cols = document.getElementById('cols').value;
	const form = document.getElementById('matrix-form');
	form.innerHTML = '';  // Vyprázdní formulář

	// Generování textových polí pro každou hodnotu matice
	for (let i = 0; i < rows; i++) {
		for (let j = 0; j < cols; j++) {
			const input = document.createElement('input');
			input.type = 'number';
			input.className = 'matrix-input';
			input.name = `cell-${i}-${j}`;
			input.min = 0;
			form.appendChild(input);
		}
		form.appendChild(document.createElement('br'));
	}
}

function submitMatrix() {
	const rows = document.getElementById('rows').value;
	const cols = document.getElementById('cols').value;
	const matrix = [];

	// Iterace přes zadané hodnoty a vytvoření matice
	for (let i = 0; i < rows; i++) {
		const row = [];
		for (let j = 0; j < cols; j++) {
			const value = document.querySelector(`input[name="cell-${i}-${j}"]`).value;
			row.push(parseInt(value, 10));  // Převod hodnoty na celé číslo
		}
		matrix.push(row);
	}

	// Zobrazení výsledné matice
	//document.getElementById('output_M').textContent = JSON.stringify(matrix, null, 2);
	//document.getElementById('output_M').style.visibility = 'none';
	displayMatrixAsTable(matrix);
}

function displayMatrixAsTable(matrix) {
	const outputDiv = document.getElementById('output');
	const table = document.createElement('table');
	table.className = 'matrix-table';

	matrix.forEach(row => {
		const tr = document.createElement('tr');
		row.forEach(cell => {
			const td = document.createElement('td');
			td.textContent = cell;
			tr.appendChild(td);
		});
		table.appendChild(tr);
	});

	// Vyprázdnění předchozího obsahu a přidání nové tabulky
	outputDiv.innerHTML = '';
	outputDiv.appendChild(table);
}
function getMatrixFromTable() {
	const table = document.querySelector('.matrix-table');
	const matrix = [];

	// Iterace přes řádky tabulky
	table.querySelectorAll('tr').forEach(row => {
		const rowData = [];
		// Iterace přes buňky v každém řádku
		row.querySelectorAll('td').forEach(cell => {
			rowData.push(parseInt(cell.textContent, 10));  // Převod na celé číslo
		});
		matrix.push(rowData);
	});

	return matrix;
	// Zobrazení získané matice ve formátu JSON
	//document.getElementById('retrieved-matrix').textContent = JSON.stringify(matrix, null, 2);

}