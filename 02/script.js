// Callback function called, when file is "opened"
function handleFileSelect(item, elementName) {
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
                    convertButton.addEventListener('click', convertImage, false);
                }
            }
        })(files[i]);

        reader.readAsDataURL(files[i]);

        break;
    };
};


// Callback function called, when clicked at Convert button
function convertImage() {
    var personCanvas = document.getElementById("person");
    var personContext = personCanvas.getContext("2d");
    var canvasHeight = personCanvas.height;
    var canvasWidth = personCanvas.width;

    var personImageData = personContext.getImageData(0, 0, canvasWidth, canvasHeight);
    var backgroundImageData = document.getElementById("background").getContext("2d").getImageData(0, 0, canvasWidth, canvasHeight);
    var logoImageData = document.getElementById("logo").getContext("2d").getImageData(0, 0, canvasWidth, canvasHeight);
    var resultImageData = document.getElementById("result").getContext("2d").getImageData(0, 0, canvasWidth, canvasHeight);

    convertImageData(personImageData, backgroundImageData, logoImageData, resultImageData);

    document.getElementById("result").getContext("2d").putImageData(resultImageData, 0, 0);
};

// Function for converting raw data of image
function convertImageData(personImageData, backgroundImageData, logoImageData, resultImageData) {
    console.log(personImageData, backgroundImageData, logoImageData, resultImageData);
    var personData = personImageData.data;
    //document.getElementById("person").getContext("2d").putImageData(personImageData, 0, 0);
    var backgroundData = backgroundImageData.data;
    var logoData = logoImageData.data;
    //document.getElementById("logo").getContext("2d").putImageData(logoImageData, 0, 0);
    var resultData = resultImageData.data;

    // Go through the image using x,y coordinates
    var red, green, blue, alpha;
    for (var pixelIndex = 0; pixelIndex < personData.length; pixelIndex += 4) {

        a_rozsah = [0.14, 0.47];

        a = Math.abs(1 - (personData[pixelIndex + 1] / 255) - Math.max((personData[pixelIndex + 0] / 255), (personData[pixelIndex + 2] / 255)));

        if (a < Math.min(a_rozsah)) {
            red = backgroundData[pixelIndex + 0];
            green = backgroundData[pixelIndex + 1];
            blue = backgroundData[pixelIndex + 2];
            alpha = backgroundData[pixelIndex + 3];
        } else if (a > Math.max(a_rozsah)) {
            red = personData[pixelIndex + 0];
            green = personData[pixelIndex + 1];
            blue = personData[pixelIndex + 2];
            alpha = personData[pixelIndex + 3];
        } else {
            red = (personData[pixelIndex + 0] * a + backgroundData[pixelIndex + 0] * (1 - a));
            green = (personData[pixelIndex + 1] * a + backgroundData[pixelIndex + 1] * (1 - a));
            blue = (personData[pixelIndex + 2] * a + backgroundData[pixelIndex + 2] * (1 - a));
            alpha = (personData[pixelIndex + 3] * a + backgroundData[pixelIndex + 3] * (1 - a));
        }

        //red = (personData[pixelIndex + 0] + backgroundData[pixelIndex + 0] + logoData[pixelIndex + 0]) / 3;
        //green = (personData[pixelIndex + 1] + backgroundData[pixelIndex + 1] + logoData[pixelIndex + 1]) / 3;
        //blue = (personData[pixelIndex + 2] + backgroundData[pixelIndex + 2] + logoData[pixelIndex + 2]) / 3;
        //alpha = (personData[pixelIndex + 3] + backgroundData[pixelIndex + 3] + logoData[pixelIndex + 3]) / 3;

        // Do magic at this place
        //console.log(red, green, blue, alpha);

        resultData[pixelIndex + 0] = red;
        resultData[pixelIndex + 1] = green;
        resultData[pixelIndex + 2] = blue;
        resultData[pixelIndex + 3] = alpha;
    }
}
