let fs = require('fs');
const { resolve } = require('path');

const saveSection =  async (data) => {

    new Promise((resolve) => {
        fs.writeFile('mainPageData.json', JSON.stringify(data), function (err) {

            if(err){
                console.error("Data not saved, something went wrong...");
                resolve( {error : true});
            }
        });

        resolve( {error : false });
    })

    console.log("Data Saved...");
}

module.exports = {saveSection};