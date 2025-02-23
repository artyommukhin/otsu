const thresholdInput = document.getElementById("threshold")
thresholdInput.addEventListener("input", (event) => {
  thresholdRange.value = event.target.value;
});

const thresholdRange = document.getElementById("thresholdRange")
thresholdRange.addEventListener("input", (event) => {
  thresholdInput.value = event.target.value;
  drawBinarizedPixels()
});

const canvas = document.getElementById("canvas")
const context = canvas.getContext('2d')

const showRawImageButton = document.getElementById("button-show-raw-image")
showRawImageButton.onclick = showInputImage

const binarizeButton = document.getElementById("button-binarize")
binarizeButton.onclick = () => {
  setThreshold()
  drawBinarizedPixels()
}


const imageInput = document.getElementById("image-input");
imageInput.onchange = () => {
  binarizeButton.disabled = false
  showInputImage()
}

function showInputImage() {
  url = getInputImageUrl()
  image = createImage(url)
  image.onload = () => drawImageOnCanvas(image)
}

function getInputImageUrl() {
  const imageFile = imageInput.files[0];
  const url = window.URL.createObjectURL(imageFile);
  return url
}

function drawImageOnCanvas(image) {
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
}

function setThreshold() {
  const imageData = getImageData()
  const histogram = createHistogram(imageData)
  const threshold = otsu(histogram, imageData.data.length / 4)
  thresholdInput.value = threshold
}

function getImageData() {
  return context.getImageData(0, 0, canvas.width, canvas.height)
}

function drawBinarizedPixels() {
  const imageData = getImageData()
  const threshold = thresholdInput.value
  const binarizedImageData = binarizeImageData(imageData, threshold)
  context.putImageData(binarizedImageData, 0, 0);
}

function createImage(src) {
  const img = new Image()
  img.src = src
  return img
}

function createHistogram(imageData) {
  let histogram = Array(256)
    , i
    , red
    , green
    , blue
    , gray;

  histogram.fill(0)

  for (i = 0; i < imageData.data.length; i += 4) {
    red = imageData.data[i];
    blue = imageData.data[i + 1];
    green = imageData.data[i + 2];
    gray = red * .2126 + green * .7152 + blue * .0722;
    histogram[Math.round(gray)] += 1;
  }

  return histogram
}

function binarizeImageData(imageData, threshold) {
  for (i = 0; i < imageData.data.length; i += 4) {
    imageData.data[i] = imageData.data[i + 1] = imageData.data[i + 2] = imageData.data[i] >= threshold ? 255 : 0;
    imageData.data[i + 3] = 255;
  }

  return imageData
}

function otsu(histogram, pixelsNumber, threshold = 0) {
  var sum = 0
    , sumB = 0
    , sumF = 0
    , wB = 0
    , wF = 0
    , mB
    , mF
    , max = 0
    , between
    , i;

  for (i = 0; i < 256; i++)
    sum += i * histogram[i] / pixelsNumber;

  for (i = 0; i < 256; i++) {
    wB += histogram[i] / pixelsNumber;

    if (wB == 0) continue;

    wF = 1 - wB;

    if (wF == 0) break;

    sumB += i * histogram[i] / pixelsNumber;
    mB = sumB / wB;
    sumF = sum - mB * wB;
    mF = sumF / wF;

    between = wB * wF * Math.pow(mB - mF, 2);
    if (between > max) {
      max = between;
      threshold = i;
    }
  }

  return threshold;
}