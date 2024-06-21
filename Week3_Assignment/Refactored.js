const fs = require('fs');

function readFilePromise(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) reject(err);
            else resolve(data);
        });
    });
}

function writeFilePromise(filePath, data) {
    return new Promise((resolve, reject) => {
        fs.writeFile(filePath, data, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}

async function processFiles(inputPath, outputPath) {
    try {
        const data = await readFilePromise(inputPath);
        const processedData = data.toUpperCase(); // Example processing
        await writeFilePromise(outputPath, processedData);
        console.log('File processed successfully');
    } catch (err) {
        console.error('Error:', err);
    }
}

processFiles('input.txt', 'output.txt');
