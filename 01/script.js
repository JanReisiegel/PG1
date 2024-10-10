window.addEventListener("DOMContentLoaded", () => {
  var canvas1 = document.getElementById("canvas1");
  var canvas2 = document.getElementById("canvas2");
  var canvas3 = document.getElementById("canvas3");
  var canvas4 = document.getElementById("canvas4");
  var canvas5 = document.getElementById("canvas5");

  var image = new Image();
  image.src = "./lena.png"; //*/ "./rainbow.png";// test alpha kanálu (transparentní pozadí)

  image.onload = () => {
    //canvas 1. klasický obrázek
    var ctx1 = canvas1.getContext("2d");
    ctx1.drawImage(image, 0, 0);
    var imgHeight = image.height;
    var imgWidth = image.width;
    var imageData = ctx1.getImageData(0, 0, imgWidth, imgHeight);
    var data = imageData.data;

    //canvas 2. stupně šedi obrázek průměrovaný
    const ctx2 = canvas2.getContext("2d");
    ctx2.drawImage(image, 0, 0);
    let imageData2 = ctx2.getImageData(0, 0, imgWidth, imgHeight);
    let data2 = imageData2.data;

    for (let i = 0; i < data2.length; i += 4) {
      var avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      data2[i] = avg;
      data2[i + 1] = avg;
      data2[i + 2] = avg;
    }
    ctx2.putImageData(imageData2, 0, 0);

    //canvas 3. stupně šedi s respektováním citlivosti lidského oka na základní barvy RGB
    const ctx3 = canvas3.getContext("2d");
    ctx3.drawImage(image, 0, 0);
    let imageData3 = ctx3.getImageData(0, 0, imgWidth, imgHeight);
    let data3 = imageData3.data;

    //Y = 0.299R + 0.587G + 0.114B
    for (let i = 0; i < data3.length; i += 4) {
      var avg = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      data3[i] = avg;
      data3[i + 1] = avg;
      data3[i + 2] = avg;
    }
    ctx3.putImageData(imageData3, 0, 0);

    //canvas na základní barvy RGB
    const ctx4 = canvas4.getContext("2d");
    ctx4.drawImage(image, 0, 0, imgWidth / 2, imgHeight / 2);

    var img4 = ctx4.getImageData(0, 0, imgWidth / 2, imgHeight / 2);
    var imgData4 = img4.data;

    const redChannel = ctx4.createImageData(imgWidth / 2, imgHeight / 2);
    const redData = redChannel.data;
    const greenChannel = ctx4.createImageData(imgWidth / 2, imgHeight / 2);
    const greenData = greenChannel.data;
    const blueChannel = ctx4.createImageData(imgWidth / 2, imgHeight / 2);
    const blueData = blueChannel.data;
    const alphaChannel = ctx4.createImageData(imgWidth / 2, imgHeight / 2);
    const alphaData = alphaChannel.data;

    for (let i = 0; i < imgData4.length; i += 4) {
      var red = imgData4[i];
      var green = imgData4[i + 1];
      var blue = imgData4[i + 2];
      var alpha = imgData4[i + 3];

      //RED Channel
      redData[i] = red; //red channel
      redData[i + 1] = redData[i + 2] = 0; //green and channel
      redData[i + 3] = alpha; //alpha channel

      //GREEN Channel
      greenData[i] = greenData[i + 2] = 0; //red and blue channel
      greenData[i + 1] = green; //green channel
      greenData[i + 3] = alpha; //alpha channel

      //BLUE Channel
      blueData[i] = blueData[i + 1] = 0; //red and green channel
      blueData[i + 2] = blue; //blue channel
      blueData[i + 3] = alpha; //alpha channel

      //ALPHA Channel
      alphaData[i] =
        alphaData[i + 1] =
        alphaData[i + 2] =
        alphaData[i + 3] =
          alpha;
    }

    ctx4.putImageData(redChannel, 0, 0);
    ctx4.putImageData(greenChannel, 256, 0);
    ctx4.putImageData(blueChannel, 0, 256);
    ctx4.putImageData(alphaChannel, 256, 256);

    //canvas 5. Barevné kanály CMYK
    const ctx5 = canvas5.getContext("2d");
    ctx5.drawImage(image, 0, 0, imgWidth / 2, imgHeight / 2);

    var cmykImage = ctx5.getImageData(0, 0, imgWidth / 2, imgHeight / 2);
    var cmykData = cmykImage.data;

    var cChannel = ctx5.createImageData(imgWidth / 2, imgHeight / 2);
    var cData = cChannel.data;
    var mChannel = ctx5.createImageData(imgWidth / 2, imgHeight / 2);
    var mData = mChannel.data;
    var yChannel = ctx5.createImageData(imgWidth / 2, imgHeight / 2);
    var yData = yChannel.data;
    var kChannel = ctx5.createImageData(imgWidth / 2, imgHeight / 2);
    var kData = kChannel.data;

    for (let i = 0; i < cmykData.length; i += 4) {
      const [r, g, b] = [cmykData[i], cmykData[i + 1], cmykData[i + 2]];
      const [c, m, y, k] = rgbToCmyk(r, g, b);

      cData[i] = 255 - (c - k) * 255;
      cData[i + 1] = 255;
      cData[i + 2] = 255;
      cData[i + 3] = 255;

      mData[i] = 255;
      mData[i + 2] = 255;
      mData[i + 1] = 255 - (m - k) * 255;
      mData[i + 3] = 255;

      yData[i] = 255;
      yData[i + 1] = 255;
      yData[i + 2] = 255 - Math.round((y - k) * 255);
      yData[i + 3] = 255;

      kData[i] = kData[i + 1] = kData[i + 2] = (1 - k) * 255;
      kData[i + 3] = 255;
    }
    ctx5.putImageData(cChannel, 0, 0);
    ctx5.putImageData(mChannel, 256, 0);
    ctx5.putImageData(yChannel, 0, 256);
    ctx5.putImageData(kChannel, 256, 256);
  };

  const rgbToCmyk = (r, g, b) => {
    const c = 1 - r / 255;
    const m = 1 - g / 255;
    const y = 1 - b / 255;
    const k = Math.min(c, m, y);
    return [c, m, y, k];
  };
});
