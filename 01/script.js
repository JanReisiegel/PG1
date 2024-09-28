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

    //canvas 4. stupně šedi s respektováním citlivosti lidského oka na základní barvy RGB
    const ctx4 = canvas4.getContext("2d");
    const width = canvas4.width / 4;
    const height = canvas4.height;

    const redChannel = ctx1.getImageData(0, 0, imgWidth, imgHeight);
    const redData = redChannel.data;
    const greenChannel = ctx1.getImageData(0, 0, imgWidth, imgHeight);
    const greenData = greenChannel.data;
    const blueChannel = ctx1.getImageData(0, 0, imgWidth, imgHeight);
    const blueData = blueChannel.data;
    const alphaChannel = ctx1.getImageData(0, 0, imgWidth, imgHeight);
    const alphaData = alphaChannel.data;

    for (let i = 0; i < redData.length; i += 4) {
      //RED Channel
      redData[i + 1] = 0; //green channel
      redData[i + 2] = 0; //blue channel

      //GREEN Channel
      greenData[i] = 0; //red channel
      greenData[i + 2] = 0; //blue channel

      //BLUE Channel
      blueData[i] = 0; //red channel
      blueData[i + 1] = 0; //green channel

      //ALPHA Channel
      const aplha = alphaData[i + 3];
      alphaData[i] = aplha; //red channel
      alphaData[i + 1] = aplha; //green channel
      alphaData[i + 2] = aplha; //blue channel
      alphaData[i + 3] = 255; //alpha channel
      if (i == redData.length - 4) {
        console.log(aplha);
      }
    }

    ctx4.putImageData(redChannel, 0, 0);
    ctx4.putImageData(greenChannel, imgWidth, 0);
    ctx4.putImageData(blueChannel, 0, imgHeight);
    ctx4.putImageData(alphaChannel, imgWidth, imgHeight);

    //canvas 5. Barevné kanály CMYK
    const ctx5 = canvas5.getContext("2d");
    const cmykImage = ctx1.getImageData(0, 0, imgWidth, imgHeight);
    const cmykData = cmykImage.data;
    const cChannel = ctx1.getImageData(0, 0, imgWidth, imgHeight);
    const cData = cChannel.data;
    const mChannel = ctx1.getImageData(0, 0, imgWidth, imgHeight);
    const mData = mChannel.data;
    const yChannel = ctx1.getImageData(0, 0, imgWidth, imgHeight);
    const yData = yChannel.data;
    const kChannel = ctx1.getImageData(0, 0, imgWidth, imgHeight);
    const kData = kChannel.data;
    for (let i = 0; i < cData.length; i += 4) {
      const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
      const [c, m, y, k] = rgbToCmyk(r, g, b);
      cData[i] = c * 255;
      cData[i + 1] = 255;
      cData[i + 2] = 255;
      mData[i] = 255;
      mData[i + 1] = m * 255;
      mData[i + 2] = 255;
      yData[i] = 255;
      yData[i + 1] = 255;
      yData[i + 2] = y * 255;
      kData[i] = k * 255;
      kData[i + 1] = k * 255;
      kData[i + 2] = k * 255;
    }
    ctx5.putImageData(cChannel, 0, 0);
    ctx5.putImageData(mChannel, imgWidth, 0);
    ctx5.putImageData(yChannel, 0, imgHeight);
    ctx5.putImageData(kChannel, imgWidth, imgHeight);
  };

  const rgbToCmyk = (r, g, b) => {
    const c = 1 - r / 255;
    const m = 1 - g / 255;
    const y = 1 - b / 255;
    const k = Math.min(c, m, y);
    return [c, m, y, k];
  };
});
