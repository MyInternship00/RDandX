let fs = require('fs');

const saveSection =  async (data, filename) => {

    new Promise((resolve) => {

        console.log(`THE DATA of FILE "${filename}" : `, data);

        fs.writeFile(`data/${filename}.json`, JSON.stringify(data), function (err) {

            if(err){
                console.error("Data not saved : ", err);
                resolve( {error : true});
            } else {
                console.log("Data Saved !!!");
                resolve( {error : false });
            }

        });

    })

}

module.exports = {saveSection};