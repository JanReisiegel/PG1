// Callback function called, when file is "opened"
function handleFileSelect(item) {
  var files = item.files;

  console.log(files);

  for (var i = 0; i < files.length; i++) {
    console.log(files[i], files[i].name, files[i].size, files[i].type);

    // Only process image files.
    if (!files[i].type.match("image.*")) {
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
          convertButton.addEventListener("click", convertImage, false);
        };
      };
    })(files[i]);

    reader.readAsDataURL(files[i]);

    break;
  }
}

const matrixSelect = [];
function selectMatrix(item) {
  if (item.value === "3") {
    var input = document.getElementById("matrixSize");
    input.disabled = false;
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

// Matice Floyd-Steinberg
const floydSteinbergMatrix = [
  [0, 128, 32, 160],
  [192, 64, 224, 96],
  [48, 176, 16, 144],
  [240, 112, 208, 80],
];
const printer = [
  [1, 5, 9, 2],
  [8, 12, 13, 6],
  [4, 15, 14, 10],
  [0, 11, 7, 3],
]; //matice pro tiskázny z přednášky

// Function for converting raw data of image
function convertImageData(imgData) {
  let width = imgData.width;
  let height = imgData.height;
  var rawData = imgData.data;

  // Go through the image using x,y coordinates
  var pixelIndex;
  // Vytvoření matice pro display n×n
  var n = document.getElementById("matrixSize").value;
  let Mnxn = M2(n);

  var selectedMatrix = [];
  var select = document.getElementById("matrixSelect");
  console.log(select.value);
  switch (select.value) {
    case 1:
      selectedMatrix = floydSteinbergMatrix;
      break;
    case 2:
      selectedMatrix = printer;
      break;
    case 3:
      selectedMatrix = Mnxn;
      break;
    default:
      selectedMatrix = floydSteinbergMatrix;
      break;
  }

  matrices = [floydSteinbergMatrix, printer, Mnxn];

  // Vytvoření compares
  compares(imgData, matrices);

  var n = selectedMatrix.length;
  var k = document.getElementById("k_parametr").value;
  var min = 0;
  var max = 255;

  for (var y = 0; y < imgData.height; y++) {
    for (var x = 0; x < imgData.width; x++) {
      pixelIndex = (imgData.width * y + x) * 4;

      let r = rawData[pixelIndex]; // Red
      let g = rawData[pixelIndex + 1]; // Green
      let b = rawData[pixelIndex + 2]; // Blue
      let a = rawData[pixelIndex + 3]; // Alpha

      let matrixValue = selectedMatrix[x % n][y % n];

      // Porovnání s maticí a použití ditheringu
      if (r > k * matrixValue) {
        // Pokud je pixel větší než matice, nastavíme na bílou
        rawData[pixelIndex] =
          rawData[pixelIndex + 1] =
          rawData[pixelIndex + 2] =
            max;
      } else {
        // Jinak černá
        rawData[pixelIndex] =
          rawData[pixelIndex + 1] =
          rawData[pixelIndex + 2] =
            min;
      }
    }
  }
}

function convertToGrayScale(imgData) {
  var rawData = imgData.data;

  for (var i = 0; i < rawData.length; i += 4) {
    //BT.601
    var avg =
      0.299 * rawData[i] + 0.587 * rawData[i + 1] + 0.114 * rawData[i + 2];
    rawData[i] = avg;
    rawData[i + 1] = avg;
    rawData[i + 2] = avg;
  }
  return imgData;
}

function displayMatrixAsTable(matrix, outputDiv) {
  const table = document.createElement("table");
  table.className = "matrix-table";

  matrix.forEach((row) => {
    const tr = document.createElement("tr");
    row.forEach((cell) => {
      const td = document.createElement("td");
      td.textContent = cell;
      tr.appendChild(td);
    });
    table.appendChild(tr);
  });

  // přidání nové tabulky
  outputDiv.appendChild(table);
}

function J(n) {
  return Array.from({ length: n }, () => Array(n).fill(1));
}

function M(n) {
  if (n === 1) {
    return [[1]];
  }

  return M(n / 2);
}

function multiplyMatrix(matrix, scalar) {
  return matrix.map((row) => row.map((cell) => cell * scalar));
}

function addMatrices(matrix1, matrix2) {
  return matrix1.map((row, rowIndex) =>
    row.map((cell, cellIndex) => cell + matrix2[rowIndex][cellIndex])
  );
}

function M2(n) {
  let Mn = M(n);
  let Jn = J(n);

  return [
    [
      multiplyMatrix(Mn, 4),
      addMatrices(multiplyMatrix(Mn, 4), multiplyMatrix(Jn, 3)),
    ],
    [
      addMatrices(multiplyMatrix(Mn, 4), multiplyMatrix(Jn, 2)),
      addMatrices(multiplyMatrix(Mn, 4), Jn),
    ],
  ];
}

function compares(imgData, matrices) {
  console.log(matrices);
  const outputDiv = document.getElementById("compares");
  var k = document.getElementById("k_parametr").value;
  for (let i = 0; i < matrices.length; i++) {
    const canvasDiv = document.createElement("div");
    canvasDiv.id = "canvasDiv" + i;
    const canvas = document.createElement("canvas");
    canvas.width = imgData.width;
    canvas.height = imgData.height;
    canvasDiv.style.alignItems = "center";
    canvasDiv.style.margin = "10px";
    canvasDiv.appendChild(canvas);
    const ctx = canvas.getContext("2d");

    var rawData = imgData.data;
    var result = imgData;
    var resultData = result.data;

    var n = matrices[i].length;
    var min = 0;
    var max = 255;

    for (var y = 0; y < imgData.height; y++) {
      for (var x = 0; x < imgData.width; x++) {
        pixelIndex = (imgData.width * y + x) * 4;

        let r = rawData[pixelIndex]; // Red
        let g = rawData[pixelIndex + 1]; // Green
        let b = rawData[pixelIndex + 2]; // Blue
        let a = rawData[pixelIndex + 3]; // Alpha

        let matrixValue = matrices[i][x % n][y % n];

        // Porovnání s maticí a použití ditheringu
        if (r > k * matrixValue) {
          // Pokud je pixel větší než matice, nastavíme na bílou
          resultData[pixelIndex] =
            resultData[pixelIndex + 1] =
            resultData[pixelIndex + 2] =
              max;
        } else {
          // Jinak černá
          resultData[pixelIndex] =
            resultData[pixelIndex + 1] =
            resultData[pixelIndex + 2] =
              min;
        }
      }
    }

    ctx.putImageData(result, 0, 0);
    displayMatrixAsTable(matrices[i], canvasDiv);
    outputDiv.appendChild(canvasDiv);
  }
}
