// Callback function called, when file is "opened"
function handleFileSelect(item, elementName) {
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
          var srcCanvas = document.getElementById(elementName);
          var srcContext = srcCanvas.getContext("2d");

          // Change size of canvas
          srcCanvas.height = srcImg.height;
          srcCanvas.width = srcImg.width;

          srcContext.drawImage(srcImg, 0, 0);

          var dstCanvas = document.getElementById("result");
          dstCanvas.height = srcImg.height;
          dstCanvas.width = srcImg.width;

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

// Callback function called, when clicked at Convert button
function convertImage() {
  var personCanvas = document.getElementById("person");
  var personContext = personCanvas.getContext("2d");
  var canvasHeight = personCanvas.height;
  var canvasWidth = personCanvas.width;

  var personImageData = personContext.getImageData(
    0,
    0,
    canvasWidth,
    canvasHeight
  );
  var backgroundImageData = document
    .getElementById("background")
    .getContext("2d")
    .getImageData(0, 0, canvasWidth, canvasHeight);
  var logoImageData = document
    .getElementById("logo")
    .getContext("2d")
    .getImageData(0, 0, canvasWidth, canvasHeight);
  var resultImageData = document
    .getElementById("result")
    .getContext("2d")
    .getImageData(0, 0, canvasWidth, canvasHeight);

  convertImageData(
    personImageData,
    backgroundImageData,
    logoImageData,
    resultImageData
  );

  document
    .getElementById("result")
    .getContext("2d")
    .putImageData(resultImageData, 0, 0);
}

// Function for converting raw data of image
function convertImageData(
  personImageData,
  backgroundImageData,
  logoImageData,
  resultImageData
) {
  console.log(
    personImageData,
    backgroundImageData,
    logoImageData,
    resultImageData
  );
  var personData = personImageData.data;
  var backgroundData = backgroundImageData.data;
  var logoData = convertToGray(logoImageData).data;
  var resultData = resultImageData.data;

  // Go through the image using x,y coordinates
  keyMin = { r: 0, g: 200, b: 0 };
  keyMax = { r: 20, g: 255, b: 20 };
  alphaMin = 1 - keyMin.g / 255 - Math.max(keyMin.r / 255, keyMin.b / 255);
  alphaMax = 1 - keyMax.g / 255 - Math.max(keyMax.r / 255, keyMax.b / 255);

  for (var pixelIndex = 0; pixelIndex < personData.length; pixelIndex += 4) {
    var personR = personData[pixelIndex];
    var personG = personData[pixelIndex + 1];
    var personB = personData[pixelIndex + 2];
    var personA = personData[pixelIndex + 3];
    var alpha = 1 - personG / 255 - Math.max(personR / 255, personB / 255);

    if (
      /*personR >= keyMin.r &&
      personR <= keyMax.r &&
      personG >= keyMin.g &&
      personG <= keyMax.g &&
      personB >= keyMin.b &&
      personB <= keyMax.b*/
      alpha >= alphaMin &&
      alpha <= alphaMax
    ) {
      const alpha = 1 - personG / 255 - Math.max(personR, personB) / 255;
      console.log(alpha);
      resultData[pixelIndex] =
        personData[pixelIndex] * alpha +
        backgroundData[pixelIndex] * (1 - alpha);
      resultData[pixelIndex + 1] =
        personData[pixelIndex + 1] * alpha +
        backgroundData[pixelIndex + 1] * (1 - alpha);
      resultData[pixelIndex + 2] =
        personData[pixelIndex + 2] * alpha +
        backgroundData[pixelIndex + 2] * (1 - alpha);
      resultData[pixelIndex + 3] = personData[pixelIndex + 3];
    } else if (
      /*personR < keyMin.r && personG < keyMin.g && personB < keyMin.b*/ alpha <
      alphaMin
    ) {
      resultData[pixelIndex] = backgroundData[pixelIndex];
      resultData[pixelIndex + 1] = backgroundData[pixelIndex + 1];
      resultData[pixelIndex + 2] = backgroundData[pixelIndex + 2];
      resultData[pixelIndex + 3] = backgroundData[pixelIndex + 3];
    } else {
      resultData[pixelIndex] = personData[pixelIndex];
      resultData[pixelIndex + 1] = personData[pixelIndex + 1];
      resultData[pixelIndex + 2] = personData[pixelIndex + 2];
      resultData[pixelIndex + 3] = personData[pixelIndex + 3];
    }

    if (logoData[pixelIndex + 3] > 0) {
      resultData[pixelIndex] = logoData[pixelIndex];
      resultData[pixelIndex + 1] = logoData[pixelIndex + 1];
      resultData[pixelIndex + 2] = logoData[pixelIndex + 2];
      resultData[pixelIndex + 3] = logoData[pixelIndex + 3];
    }
  }
}

function convertToGray(logoData) {
  const pixels = logoData.data;

  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const a = pixels[i + 3];

    const avg = 0.2126 * r + 0.7152 * g + 0.0722 * b;

    pixels[i] = avg;
    pixels[i + 1] = avg;
    pixels[i + 2] = avg;
    pixels[i + 3] = a;
  }

  return logoData;
}
