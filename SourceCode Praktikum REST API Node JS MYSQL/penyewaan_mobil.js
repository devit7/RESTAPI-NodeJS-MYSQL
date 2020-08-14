// inisiasi library
const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")
const mysql = require("mysql")
const moment = require("moment")
const md5 = require("md5")
const Cryptr = require("cryptr")
const crypt = new Cryptr("12345678") 
// implementation
const app = express()
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
// create MySQL Connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "penyewaan_mobil"
})
db.connect(error => {
    if (error) {
        console.log(error.message)
    } else {
        console.log("MySQL Connected")
    }
})


// endpoint login karyawan (authentication)
app.post("/karyawan/auth", (req, res) => {
    // tampung username dan password
    let param = [
        req.body.username, //username
        md5(req.body.password) // password
    ]
    // create sql query
    let sql = "select * from karyawan where username = ? and password = ?"
    // run query
    db.query(sql, param, (error, result) => {
        if (error) throw error

        // cek jumlah data hasil query
        if (result.length > 0) {
            // user tersedia
            res.json({
                message: "Logged",
                token: crypt.encrypt(result[0].id_karyawan), // generate token
                data: result
            })
        } else {
            // user tidak tersedia
            res.json({
                message: "Invalid username/password"
            })
        }
    })
})
validateToken = () => {
    return (req, res, next) => {
        // cek keberadaan "Token" pada request header
        if (!req.get("Token")) {
// jika "Token" tidak ada
res.json({
    message: "Access Forbidden"
})
} else {
// tampung nilai Token
let token  = req.get("Token")

// decrypt token menjadi id_user
let decryptToken = crypt.decrypt(token)

// sql cek id_user
let sql = "select * from karyawan where ?"

// set parameter
let param = { id_karyawan: decryptToken}

// run query
db.query(sql, param, (error, result) => {
    if (error) throw error
     // cek keberadaan id_user
    if (result.length > 0) {
        // id_user tersedia
        next()
    } else {
        // jika user tidak tersedia
        res.json({
            message: "Invalid Token"
        })
    }
})
}
}
}

// semua end-point GET ALL
app.get('/:info', (req, res) => {
    var info = req.params.info    
    if(info != 'mobil' && info != 'pelanggan' && info != 'sewa' && info != 'karyawan'){
        res.json({ket : 'Invalid Url'})
    }else if(info == 'sewa'){
            // create sql query
        var sql = "select id_sewa,p.id_mobil, p.id_pelanggan,p.id_karyawan,p.tgl_sewa, p.tgl_kembali, p.total_bayar, s.nama_karyawan, t.nama_pelanggan, u.nomor_mobil, u.merk " +
        "from sewa p inner join mobil u on p.id_mobil = u.id_mobil "
        +"inner join pelanggan t on p.id_pelanggan = t.id_pelanggan"
        +" inner join karyawan s on p.id_karyawan = s.id_karyawan"
        // run query
        db.query(sql, (error, result) => {
            if (error) {
                res.json({ message: error.message})   
            }else{
                res.json({
                    count: result.length,
                    sewa: result
                })
            }
        })  
    }else{
        var sql = "select * from "+info
        db.query(sql, (error, result) => {
            let response = null
            if (error) {
                response = {
                    message: error.message // pesan error
            }
            } else {
                response = {
                    count: result.length, // jumlah data
                    info: result // isi data
                }
            }
            res.json(response) // send response
        })
}
})

// end-point GET by ID
app.get('/:info/:id',(req,res)=>{                      
    var info = req.params.info
    if(info != 'mobil' && info != 'pelanggan' && info != 'sewa' && info != 'karyawan'){
        res.json({ket : 'Invalid Url'})
    }else{
        var sql = "SELECT * FROM "+info+" WHERE id_"+info+"='"+req.params.id+"'"
        db.query(sql,(error, result) => {
            let response = null
            if (error) {
                response = {
                    message: error.message // pesan error
                }
            } else {
                response = {
                    count: result.length, // jumlah data
                    siswa: result // isi data
                }
            }
            res.json(response) // send response
        })
    }
})

// end-point POST
app.post('/:info',(req,res)=>{
    var info = req.params.info
    if(info != 'mobil' && info != 'pelanggan' && info != 'sewa' && info != 'karyawan'){
        res.json({ket : 'Invalid Url'})
    }else if(info == 'mobil'){ //jika mobil
        // prepare data
        let data = {
            id_mobil: req.body.id_mobil,
            nomor_mobil: req.body.nomor_mobil,
            merk: req.body.merk,
            jenis: req.body.jenis,
            warna: req.body.warna,
            tahun_pembuatan: req.body.tahun_pembuatan,
            biaya_sewa_per_hari: req.body.biaya_sewa_per_hari,
            image: req.body.image
        }
        // create sql query insert
        let sql = "insert into mobil set ?"
        // run query
        db.query(sql, data, (error, result) => {
            let response = null
            if (error) {
                response = {
                    message: error.message// pesan error
                }
            } else {
                response = {
                    message: result.affectedRows + " data inserted"
                }
            }
            res.json(response) // send response
        })
    }else if (info == 'pelanggan'){ //jika pelanggan
        // prepare data
        let data = {
            id_pelanggan: req.body.id_pelanggan,
            nama_pelanggan: req.body.nama_pelanggan,
            alamat_pelanggan: req.body.alamat_pelanggan,
            kontak: req.body.kontak
        }
        // create sql query insert
        let sql = "insert into pelanggan set ?"
        // run query
        db.query(sql, data, (error, result) => {
            let response = null
            if (error) {
                response = {
                    message: error.message// pesan error
                }
            } else {
                response = {
                    message: result.affectedRows + " data inserted"
                }
            }
            res.json(response) // send response
        })
    }else if(info == 'karyawan'){//jika karywan
        // prepare data
        let data = {
            id_karyawan: req.body.id_karyawan,
            nama_karyawan: req.body.nama_karyawan,
            alamat_karyawan: req.body.alamat_karyawan,
            kontak: req.body.kontak,
            username: req.body.username,
            password: md5(req.body.password)//menggunakan type hash md5
        }
        // create sql query insert
        let sql = "insert into karyawan set ?"
        // run query
        db.query(sql, data, (error, result) => {
            let response = null
            if (error) {
                response = {
                    message: error.message// pesan error
                }
            } else {
                response = {
                    message: result.affectedRows + " data inserted"
                }
            }
            res.json(response) // send response
        })
    }else if(info == 'sewa'){//jika sewa                                   
            // prepare data to sewa
        let data = {
            id_sewa: req.body.id_sewa,
            id_karyawan: req.body.id_karyawan,
            id_mobil: req.body.id_mobil,
            id_pelanggan: req.body.id_pelanggan,
            tgl_sewa: req.body.tgl_sewa,
            tgl_kembali: req.body.tgl_kembali,
            total_bayar: req.body.total_bayar
        }
        // create query insert to sewa
        let sql = "insert into sewa set ?"
        db.query(sql, data, (error, result) => {
            let response = null
            if (error) {
                response = {
                    message: error.message// pesan error
                }
            } else {
                response = {
                    message: result.affectedRows + " data inserted"
                }
            }
            res.json(response) // send response
            })
    }
})

// end-point PUT
app.put('/:info',(req,res)=>{
var info = req.params.info    
    if(info != 'mobil' && info != 'pelanggan' && info != 'sewa' && info != 'karyawan'){
        res.json({ket : 'Invalid Url'})
    }else if(info == 'karyawan'){ //jika karyawan
            // prepare data
            let data = [{
                    nama_karyawan: req.body.nama_karyawan,
                    alamat_karyawan: req.body.alamat_karyawan,
                    kontak: req.body.kontak,
                    username: req.body.username,
                    password: md5(req.body.password)
                },// parameter (primary key)
                {
                    id_karyawan: req.body.id_karyawan
                }]
            // create sql query update
            let sql = "update karyawan set ? where ?"
            // run query
            db.query(sql, data, (error, result) => {
                let response = null
                if (error) {
                    response = {
                        message: error.message//pesan error
                    }
                } else {
                    response = {
                        message: result.affectedRows + " data updated"
                    }
                }
                res.json(response) // send response
            })
       }else if(info == 'mobil'){//jika mobil
            // prepare data
            let data = [{
                    nomor_mobil: req.body.nomor_mobil,
                    merk: req.body.merk,
                    jenis: req.body.jenis,
                    warna: req.body.warna,
                    tahun_pembuatan: req.body.tahun_pembuatan,
                    biaya_sewa_per_hari: req.body.biaya_sewa_per_hari,
                    image: req.body.image
                },// parameter (primary key)
                {
                    id_mobil: req.body.id_mobil
                }]
            // create sql query update
            let sql = "update mobil set ? where ?"
            // run query
            db.query(sql, data, (error, result) => {
                let response = null
                if (error) {
                    response = {
                        message: error.message// pesan error
                    }
                } else {
                    response = {
                        message: result.affectedRows + " data updated"
                    }
                }
                res.json(response) // send response
            })
       }else if(info == 'pelanggan'){//jika pelanggan
        // prepare data
        let data = [{
                nama_pelanggan: req.body.nama_pelanggan,
                alamat_pelanggan: req.body.alamat_pelanggan,
                kontak: req.body.kontak
            },// parameter (primary key)
            {
                id_pelanggan: req.body.id_pelanggan
            }]
        // create sql query update
        let sql = "update pelanggan set ? where ?"
        // run query
        db.query(sql, data, (error, result) => {
            let response = null
            if (error) {
                response = {
                    message: error.message// pesan error
                }
            } else {
                response = {
                    message: result.affectedRows + " data updated"
                }
            }
            res.json(response) // send response
        })
       }
    })

    // end-point DELETE
    app.delete('/:info/:id',(req,res)=>{
        var info = req.params.info    
        if(info != 'mobil' && info != 'pelanggan' && info != 'sewa' && info != 'karyawan'){
            res.json({ket : 'Invalid Url'})
        }else{        
            var sql = 'DELETE FROM '+info+' WHERE id_'+info+' = '+req.params.id
            db.query(sql, (error, result) => {
                let response = null
                if (error) {
                    response = {
                        message: error.message// pesan error
                    }
                } else {
                    response = {
                        message: result.affectedRows + " data deleted"
                    }
                }
                res.json(response) // send response
                    })
                }
            })


app.listen(8000, () => {
    console.log("Run on port 8000")
})
