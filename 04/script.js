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
          var histCanvas = document.getElementById("histogram");
          var histContext = histCanvas.getContext("2d");

          // Change size of canvas
          srcCanvas.height = histCanvas.height = srcImg.height;
          srcCanvas.width = histCanvas.width = srcImg.width;

          srcContext.drawImage(srcImg, 0, 0);

          var canvasHeight = srcCanvas.height;
          var canvasWidth = srcCanvas.width;
          var srcImageData = srcContext.getImageData(
            0,
            0,
            canvasWidth,
            canvasHeight
          );

          convertImageData(srcImageData, histCanvas);

          //histContext.putImageData(histImageData, 0, 0);
        };
      };
    })(files[i]);

    reader.readAsDataURL(files[i]);

    break;
  }
}

function onSelect(item) {
  var srcCanvas = document.getElementById("src");
  var srcContext = srcCanvas.getContext("2d");
  var histCanvas = document.getElementById("histogram");
  var canvasHeight = srcCanvas.height;
  var canvasWidth = srcCanvas.width;
  var srcImageData = srcContext.getImageData(0, 0, canvasWidth, canvasHeight);

  console.log("jsem tu");
  convertImageData(srcImageData, histCanvas);
}

// Function for converting raw data of image
function convertImageData(srcImageData, histCanvas) {
  printSelectedhistogram(srcImageData, histCanvas);
}

function printHistogram(histogram, histCanvas, color) {
  histCanvas.height = 256;
  histCanvas.width = 256;
  var max = Math.max(...histogram);
  histogram = histogram.map((value) =>
    convertHistogramToCAnvas(value, 0, max, histCanvas.height)
  );
  var ctx = histCanvas.getContext("2d");
  ctx.clearRect(0, 0, histCanvas.width, histCanvas.height);
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, histCanvas.width, histCanvas.height);
  ctx.beginPath();
  ctx.strokeStyle = color;

  for (let i = 0; i < histogram.length; i++) {
    const value = histogram[i];
    ctx.moveTo(i, histCanvas.height);
    ctx.lineTo(i, histCanvas.height - value);
  }

  ctx.stroke();
}

function printAllHistograms(histograms, canvas) {
  canvas.height = 512;
  canvas.width = 512;
  var greyHist = histograms[0];
  var rHist = histograms[1];
  var gHist = histograms[2];
  var bHist = histograms[3];

  var greyMax = Math.max(...greyHist);
  greyHist = greyHist.map((value) =>
    convertHistogramToCAnvas(value, 0, greyMax, canvas.height / 2)
  );

  var rMax = Math.max(...rHist);
  rHist = rHist.map((value) =>
    convertHistogramToCAnvas(value, 0, rMax, canvas.height / 2)
  );

  var gMax = Math.max(...gHist);
  gHist = gHist.map((value) =>
    convertHistogramToCAnvas(value, 0, gMax, canvas.height / 2)
  );

  var bMax = Math.max(...bHist);
  bHist = bHist.map((value) =>
    convertHistogramToCAnvas(value, 0, bMax, canvas.height / 2)
  );

  var ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.strokeStyle = "#f00";

  for (let i = 0; i < rHist.length; i++) {
    const value = rHist[i];
    ctx.moveTo(i, canvas.height / 2);
    ctx.lineTo(i, canvas.height / 2 - value);
  }

  ctx.stroke();

  ctx.beginPath();
  ctx.strokeStyle = "#0f0";

  for (let i = 0; i < gHist.length; i++) {
    const value = gHist[i];
    ctx.moveTo(256 + i, canvas.height / 2);
    ctx.lineTo(256 + i, canvas.height / 2 - value);
  }

  ctx.stroke();

  ctx.beginPath();
  ctx.strokeStyle = "#00f";

  for (let i = 0; i < bHist.length; i++) {
    const value = bHist[i];
    ctx.moveTo(i, canvas.height);
    ctx.lineTo(i, canvas.height - value);
  }

  ctx.stroke();

  ctx.beginPath();
  ctx.strokeStyle = "#888";

  for (let i = 0; i < greyHist.length; i++) {
    const value = greyHist[i];
    ctx.moveTo(256 + i, canvas.height);
    ctx.lineTo(256 + i, canvas.height - value);
  }

  ctx.stroke();
}

function printSelectedhistogram(srcImageData, canvas) {
  var selectedItem = document.getElementById("histSelect").value;
  var histograms = createHistogramsData(srcImageData);
  switch (selectedItem) {
    case "1":
      printHistogram(histograms[1], canvas, "#f00");
      break;
    case "2":
      printHistogram(histograms[2], canvas, "#0f0");
      break;
    case "3":
      printHistogram(histograms[3], canvas, "#00f");
      break;
    case "4":
      printHistogram(histograms[0], canvas, "#888");
      break;
    case "5":
      printAllHistograms(histograms, canvas);
      break;
    default:
      break;
  }
}

function convertHistogramToCAnvas(value, min, max, canvasHeight) {
  return Math.round(((value - min) / (max - min)) * canvasHeight);
}

function createHistogramsData(imgData) {
  var rawData = imgData.data;
  var greyHist = new Array(256).fill(0);
  var rHist = new Array(256).fill(0);
  var gHist = new Array(256).fill(0);
  var bHist = new Array(256).fill(0);

  for (var i = 0; i < rawData.length; i += 4) {
    //BT.601
    rHist[rawData[i]]++;
    gHist[rawData[i + 1]]++;
    bHist[rawData[i + 2]]++;
    var avg =
      0.299 * rawData[i] + 0.587 * rawData[i + 1] + 0.114 * rawData[i + 2];
    rawData[i] = avg;
    rawData[i + 1] = avg;
    rawData[i + 2] = avg;
    greyHist[Math.floor(avg)]++;
  }
  return [greyHist, rHist, gHist, bHist];
}
