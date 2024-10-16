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

  const resultCanvas = document.getElementById("result");
  const resultctx = resultCanvas.getContext("2d");

  resultctx.putImageData(resultImageData, 0, 0);

  resizeAndDrawLogo(resultctx, canvasWidth, canvasHeight);
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

  keyColor = document.getElementById("keyColor").value;
  // Go through the image using x,y coordinates
  key = hexToRgb(keyColor);

  tolerance = document.getElementById("tolerance").value;

  for (var pixelIndex = 0; pixelIndex < personData.length; pixelIndex += 4) {
    var personR = personData[pixelIndex];
    var personG = personData[pixelIndex + 1];
    var personB = personData[pixelIndex + 2];

    //Klíčování podle předem zvolené barvy a rozsahu (tolerance)
    if (
      Math.abs(personG - key.g) < tolerance &&
      Math.abs(personR - key.r) < tolerance &&
      Math.abs(personB - key.b) < tolerance
    ) {
      personData[pixelIndex + 3] = 0;
    }
    if (personData[pixelIndex + 3] == 0) {
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

    //Přidání loga
    if (logoData[pixelIndex + 3] != 0) {
      resultData[pixelIndex] = logoData[pixelIndex];
      resultData[pixelIndex + 1] = logoData[pixelIndex + 1];
      resultData[pixelIndex + 2] = logoData[pixelIndex + 2];
      resultData[pixelIndex + 3] = logoData[pixelIndex + 3];
    }
  }

  //Funkce pro převod loga do šedotónové podoby
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

  //Funkce pro převod barvy z hexadecimálního formátu na RGB
  function hexToRgb(hex) {
    return {
      r: parseInt(hex.substring(1, 3), 16),
      g: parseInt(hex.substring(3, 5), 16),
      b: parseInt(hex.substring(5, 7), 16),
    };
  }
}
