const express = require('express')
const bodyParser = require('body-parser')
const isSuccess = []
const multer = require('multer')({
    dest: './upload',
    limits: { fileSize: 1 * 1000 * 1000 },
    fileFilter: (req, file, cb) => {
        const fieldsName = ['image1', 'image2', 'image3']
        if (fieldsName.includes(file.fieldname)) {
            const mime = ['image/png', 'image/jpeg', 'image/jpg', 'image/pipeg', 'image/gif', 'image/bmp', 'image/svg+xml', 'image/webp']
            if (mime.includes(file.mimetype)) {
                cb(null, true)
            } else {
                isSuccess.push({
                    key: file.fieldname,
                    success: false,
                    msg: 'error mimetype'
                })
                cb(null, false)
            }
        } else {
            isSuccess.push({
                key: file.fieldname,
                success: false,
                msg: 'not allow key'
            })
            return cb(null, false);
        }
    }
})

const cors = require('cors')
const fs = require('fs')
const app = express()
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())

app.post('/upload', multer.any(), (req, res) => {
    req.files.forEach((file, index) => {
        const filetype = file.originalname.split('.')[1]
        const savePath = `./upload/${file.fieldname}.${filetype}`
        // file.fieldname : 這個是 formdata 的 key
        fs.renameSync(file.path, savePath)
        isSuccess.push({
            key: file.fieldname,
            success: fs.existsSync(savePath),
            msg: 'OK'
        })
    })
    res.status(200).send(isSuccess)
})

app.get('/showFile/:imageName/:mimetype', (req, res) => {
    const savePath = `./upload/${req.params.imageName}.${req.params.mimetype}`
    if (fs.existsSync(savePath)) {
        res.sendFile(`upload/${req.params.imageName}.${req.params.mimetype}`, { root: __dirname })
    } else {
        res.status(200).send('no image')
    }
})

const port = process.env.PORT || 3000
app.listen(port, () => {
    const url = `http://localhost:${port}`
    console.log(`listen on ${url}`);
})
