const extractDataBtn = document.getElementById('extract-btn')

extractDataBtn.addEventListener('click', () => {
    const fileInput = document.getElementById('file-upload')
    if (fileInput.files.length === 0) {
        console.error('Please add one or more files')
    } else {
        extractData(fileInput)
            .then(extractedDataArray => {
                // Manipulate the dataArray or pass it to another function
                createCsv(extractedDataArray)
            })
            .catch(error => {
                console.error('Error extracting data:', error)
            });
    }
});

function extractData(fileInput) {
    return new Promise((resolve, reject) => {
        const files = Array.from(fileInput.files)
        const promises = []

        files.forEach(file => {
            const reader = new FileReader();
            const promise = new Promise((innerResolve, innerReject) => {
                reader.onload = function (e) {
                    try {
                        const jsonObject = JSON.parse(e.target.result)
                        const extractedData = {
                            title: jsonObject.title,
                            weight: jsonObject.description.split(';')[0],
                            finInfo: jsonObject.description.split(';')[1],
                            timestamp: jsonObject.photoTakenTime.timestamp,
                            formattedTimestamp: jsonObject.photoTakenTime.formatted,
                            latitude: jsonObject.geoData.latitude,
                            longitude: jsonObject.geoData.longitude,
                            altitude: jsonObject.geoData.altitude,
                            url: jsonObject.url
                        };
                        console.log(jsonObject.description.split(';')[0])
                        console.log(jsonObject.description.split(';')[1])
                        innerResolve(extractedData);
                    } catch (error) {
                        console.error(`Error parsing JSON file ${file.name}:`, error)
                        innerReject(error)
                    }
                };
                reader.readAsText(file)
            });
            promises.push(promise)
        });

        Promise.all(promises)
            .then(extractedDataArray => {
                resolve(extractedDataArray);
            })
            .catch(error => {
                reject(error);
            });
    });
}

function createCsv(extractedDataArray){
    let csvContent = 'title,weight,fin info,timestamp,formattedTimestamp,lat,long,altitude,url\n'
    extractedDataArray.forEach(data => {
        const row = `${data.title},${data.weight},${data.finInfo},${data.timestamp},"${data.formattedTimestamp}",${data.latitude},${data.longitude},${data.altitude},${data.url}\n`
        csvContent += row
    })
    const blob = new Blob([csvContent], {type:'text/csv;charset=utf-8'})
    const downloadLink = document.createElement('a')
    downloadLink.href = URL.createObjectURL(blob)
    downloadLink.setAttribute('download', 'extracted_data.csv')
    document.body.appendChild(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)
}