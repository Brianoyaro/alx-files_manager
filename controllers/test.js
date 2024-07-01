const fs = require('fs');
let folder = '/tmp/dummy_folder'
if (!fs.existsSync(folder)) {
  console.log(`creating ${folder}`);
  fs.mkdirSync(folder);
}
fs.writeFile(`${folder}/here.txt`, 'just some data', (err)=>{
    if (err) console.log('error')
    else console.log('success');
})
