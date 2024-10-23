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
var Mnxn; //matice pro tiskázny z přednášky

// Function for converting raw data of image
function convertImageData(imgData) {
  let width = imgData.width;
  let height = imgData.height;
  var rawData = imgData.data;

  // Go through the image using x,y coordinates
  var pixelIndex;
  // Vytvoření matice pro display n×n
  var n = Number(document.getElementById("matrixSize").value);

  Mnxn = M(n);

  var selectedMatrix = [];
  var select = document.getElementById("matrixSelect");

  var k = Number(document.getElementById("k_parametr").value);
  var n = Number(document.getElementById("matrixSize").value);
  // Vytvoření compares
  compares(imgData);
  switch (select.value) {
    case "1":
      floydSteinbergMethod(imgData);
      break;
    case "2":
      matrixMethod(imgData, printer, 4, k);
      break;
    case "3":
      console.log(Mnxn, n, k);
      matrixMethod(imgData, Mnxn, n, k);
      break;
    default:
      floydSteinbergMethod(imgData);
      break;
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
    return [[0]];
  } else {
    let Mn = M(n / 2);
    let Jn = J(n / 2);

    let topLeft = multiplyMatrix(Mn, 4);
    let topRight = addMatrices(multiplyMatrix(Mn, 4), multiplyMatrix(Jn, 3));
    let bottomLeft = addMatrices(multiplyMatrix(Mn, 4), multiplyMatrix(Jn, 2));
    let bottomRight = addMatrices(multiplyMatrix(Mn, 4), Jn);

    return mergeMatrices(topLeft, topRight, bottomLeft, bottomRight);
  }
}

function multiplyMatrix(matrix, scalar) {
  return matrix.map((row) => row.map((cell) => cell * scalar));
}

function addMatrices(matrix1, matrix2) {
  return matrix1.map((row, rowIndex) =>
    row.map((cell, cellIndex) => cell + matrix2[rowIndex][cellIndex])
  );
}

function mergeMatrices(topLeft, topRight, bottomLeft, bottomRight) {
  let n = topLeft.length;
  let result = [];

  for (let i = 0; i < n; i++) {
    result.push([...topLeft[i], ...topRight[i]]);
  }
  for (let i = 0; i < n; i++) {
    result.push([...bottomLeft[i], ...bottomRight[i]]);
  }

  return result;
}

function compares(imgData) {
  var rawData = imgData.data;
  var k = Number(document.getElementById("k_parametr").value);
  var n = Number(document.getElementById("matrixSize").value);

  const outputDiv = document.getElementById("compares");

  var divFloyd = document.createElement("div");
  divFloyd.style.margin = "10px";
  var floydHeader = document.createElement("h3");
  floydHeader.textContent = "Floyd-Steinberg";
  divFloyd.appendChild(floydHeader);
  var divPrinter = document.createElement("div");
  divPrinter.style.margin = "10px";
  var printerHeader = document.createElement("h3");
  printerHeader.textContent = "Printer";
  divPrinter.appendChild(printerHeader);
  var divMnxn = document.createElement("div");
  divMnxn.style.margin = "10px";
  var MnxnHeader = document.createElement("h3");
  MnxnHeader.textContent = `M${n}x${n}`;
  divMnxn.appendChild(MnxnHeader);
  var canvasFloyd = document.createElement("canvas");
  canvasFloyd.width = imgData.width;
  canvasFloyd.height = imgData.height;
  var canvasPrinter = document.createElement("canvas");
  canvasPrinter.width = imgData.width;
  canvasPrinter.height = imgData.height;
  var canvasMnxn = document.createElement("canvas");
  canvasMnxn.width = imgData.width;
  canvasMnxn.height = imgData.height;
  var ctxFloyd = canvasFloyd.getContext("2d");
  var ctxPrinter = canvasPrinter.getContext("2d");
  var ctxMnxn = canvasMnxn.getContext("2d");
  ctxFloyd.putImageData(imgData, 0, 0);
  ctxPrinter.putImageData(imgData, 0, 0);
  ctxMnxn.putImageData(imgData, 0, 0);

  var floydData = ctxFloyd.getImageData(0, 0, imgData.width, imgData.height);
  floydSteinbergMethod(floydData);
  var printerData = ctxPrinter.getImageData(
    0,
    0,
    imgData.width,
    imgData.height
  );
  matrixMethod(printerData, printer, 4, k);
  var MnxnData = ctxMnxn.getImageData(0, 0, imgData.width, imgData.height);
  matrixMethod(MnxnData, Mnxn, n, k);

  var min = 0;
  var max = 255;

  /*for (var y = 0; y < imgData.height; y++) {
    for (var x = 0; x < imgData.width; x++) {
      pixelIndex = (imgData.width * y + x) * 4;

      let r = rawData[pixelIndex]; // Red
      let g = rawData[pixelIndex + 1]; // Green
      let b = rawData[pixelIndex + 2]; // Blue
      let a = rawData[pixelIndex + 3]; // Alpha

      console.log(x, y, n, typeof n, typeof x, typeof y);
      let MnxnKeyData = Mnxn[x % n][y % n];
      let printerKeyData = printer[x % 4][y % 4];

      // Porovnání s maticí a použití ditheringu
      if (r > k * printerKeyData) {
        // Pokud je pixel větší než matice, nastavíme na bílou
        printerData.data[pixelIndex] =
          printerData.data[pixelIndex + 1] =
          printerData.data[pixelIndex + 2] =
            max;
      } else {
        // Jinak černá
        printerData.data[pixelIndex] =
          printerData.data[pixelIndex + 1] =
          printerData.data[pixelIndex + 2] =
            min;
      }
    }
  }*/

  ctxFloyd.putImageData(floydData, 0, 0);
  ctxPrinter.putImageData(printerData, 0, 0);
  ctxMnxn.putImageData(MnxnData, 0, 0);

  divFloyd.appendChild(canvasFloyd);
  divPrinter.appendChild(canvasPrinter);
  divMnxn.appendChild(canvasMnxn);

  displayMatrixAsTable(floydSteinbergMatrix, divFloyd);
  displayMatrixAsTable(printer, divPrinter);
  displayMatrixAsTable(Mnxn, divMnxn);

  outputDiv.appendChild(divFloyd);
  outputDiv.appendChild(divPrinter);
  outputDiv.appendChild(divMnxn);
}

function floydSteinbergMethod(imageData) {
  const data = imageData.data;
  const width = imageData.width;

  for (let y = 0; y < imageData.height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const oldPixel = data[i];
      const newPixel = oldPixel < 128 ? 0 : 255;
      const quantError = oldPixel - newPixel;

      // Nastavení nového pixelu na černou nebo bílou
      data[i] = data[i + 1] = data[i + 2] = newPixel;

      // Aplikace rozptylu chyb na okolní pixely
      if (x + 1 < width) data[i + 4] += (quantError * 7) / 16;
      if (x > 0 && y + 1 < imageData.height)
        data[i + 4 * width - 4] += (quantError * 3) / 16;
      if (y + 1 < imageData.height)
        data[i + 4 * width] += (quantError * 5) / 16;
      if (x + 1 < width && y + 1 < imageData.height)
        data[i + 4 * width + 4] += (quantError * 1) / 16;
    }
  }
}

function matrixMethod(imageData, matrix, n, k) {
  const data = imageData.data;
  const width = imageData.width;

  for (let y = 0; y < imageData.height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const oldPixel = data[i];
      var keyData = k * matrix[x % n][y % n];
      const newPixel = oldPixel < keyData ? 0 : 255;

      // Nastavení nového pixelu na černou nebo bílou
      data[i] = data[i + 1] = data[i + 2] = newPixel;
    }
  }
}
