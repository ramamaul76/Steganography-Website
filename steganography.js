function encodeText(imageData, secretMessage) {
    const binarySecretMessage = secretMessage.split('')
        .map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join('') + '1111111111111110';
    const totalPixels = imageData.data.length / 4;
    const requiredPixels = Math.ceil(binarySecretMessage.length / 3);

    if (requiredPixels > totalPixels) {
        alert('The image is too small to hold the secret message.');
        return null;
    }

    let dataIndex = 0;

    for (let i = 0; i < imageData.data.length; i += 4) {
        for (let j = 0; j < 3; j++) {
            if (dataIndex < binarySecretMessage.length) {
                imageData.data[i + j] = (imageData.data[i + j] & 0xFE) | parseInt(binarySecretMessage[dataIndex], 2);
                dataIndex++;
            } else {
                break;
            }
        }
        if (dataIndex >= binarySecretMessage.length) break;
    }
    return imageData;
}

function decodeText(imageData) {
    let binarySecretMessage = '';
    for (let i = 0; i < imageData.data.length; i += 4) {
        for (let j = 0; j < 3; j++) {
            binarySecretMessage += (imageData.data[i + j] & 1).toString();
        }
    }

    const delimiterIndex = binarySecretMessage.indexOf('1111111111111110');
    if (delimiterIndex === -1) {
        alert('No secret message found in the image.');
        return '';
    }
    binarySecretMessage = binarySecretMessage.substring(0, delimiterIndex);

    const secretMessage = binarySecretMessage.match(/.{1,8}/g)
        .map(byte => String.fromCharCode(parseInt(byte, 2)))
        .join('');
    return secretMessage;
}

function encodeImage() {
    const uploadImage = document.getElementById('uploadImage').files[0];
    const secretMessage = document.getElementById('secretMessage').value;

    if (!uploadImage || !secretMessage) {
        alert('Please upload an image and enter a message.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(event) {
        const image = new Image();
        image.onload = function() {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = image.width;
            canvas.height = image.height;
            context.drawImage(image, 0, 0);

            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const encodedData = encodeText(imageData, secretMessage);
            if (encodedData) {
                context.putImageData(encodedData, 0, 0);

                const encodedImage = document.getElementById('encodedImage');
                encodedImage.src = canvas.toDataURL();
                encodedImage.style.display = 'block';

                const downloadLink = document.getElementById('downloadLink');
                downloadLink.href = canvas.toDataURL();
                downloadLink.download = 'encoded_image.png';
                downloadLink.style.display = 'block';
                downloadLink.innerText = 'Download Encoded Image';
            }
        };
        image.src = event.target.result;
    };
    reader.readAsDataURL(uploadImage);
}

function decodeImage() {
    const decodeImageUpload = document.getElementById('decodeImageUpload').files[0];

    if (!decodeImageUpload) {
        alert('Please upload an image.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(event) {
        const image = new Image();
        image.onload = function() {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = image.width;
            canvas.height = image.height;
            context.drawImage(image, 0, 0);

            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const decodedMessage = decodeText(imageData);

            const decodedMessageElement = document.getElementById('decodedMessage');
            decodedMessageElement.value = decodedMessage;
        };
        image.src = event.target.result;
    };
    reader.readAsDataURL(decodeImageUpload);
}
