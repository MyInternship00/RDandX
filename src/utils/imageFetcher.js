

const fetch =  require('node-fetch');
const fetchImage = async(link)=>{

   return new Promise((resolve)=>{
       try{
        if(!link) resolve(null);
         fetch(link)
        .then((response) => response.buffer())
        .then((buffer) => {
          const b64 = buffer.toString('base64');
          resolve(b64);
        })
       
       }catch(err){
        resolve(err.message);
       }
    
   }) 
}
module.exports = {fetchImage};