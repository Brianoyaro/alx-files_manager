const fs = require('fs');
fs.writeFile('/tmp/dummy_folder/here.txt', 'just some data', (err)=>{
    if (err) console.log('error')
    else console.log('success');
})