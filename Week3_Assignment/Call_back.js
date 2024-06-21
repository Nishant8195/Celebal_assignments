const fs = require('fs');

function readFileCallback(filePath, callback) {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) return callback(err);
        callback(null, data);
    });
}

function writeFileCallback(filePath, data, callback) {
    fs.writeFile(filePath, data, (err) => {
        if (err) return callback(err);
        callback(null);
    });
}

function processFiles(inputPath, outputPath, callback) {
    readFileCallback(inputPath, (err, data) => {
        if (err) return callback(err);

        const processedData = data.toUpperCase(); // Example processing

        writeFileCallback(outputPath, processedData, (err) => {
            if (err) return callback(err);
            callback(null, 'File processed successfully');
        });
    });
}

processFiles('input.txt', 'output.txt', (err, message) => {
    if (err) {
        console.error('Error:', err);
    } else {
        console.log(message);
    }
});
