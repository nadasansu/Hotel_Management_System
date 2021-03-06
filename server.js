const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended : true}));

const data = fs.readFileSync('./database.json');
const conf = JSON.parse(data);
const mysql = require('mysql');

const connection = mysql.createConnection({
  host : conf.host,
  user : conf.user,
  password : conf.password,
  port : conf.port,
  database : conf.database
});
connection.connect();

const multer = require('multer');
const upload = multer({dest : './upload'});

app.get('/api/reservations', (req, res) => {
    connection.query(
      "SELECT reserve_number, guest_id, guest_name, room_number, number_of_members, check_in, check_out, real_check_in, real_check_out, payment_status, pick_up, cancel_status FROM Reservation NATURAL JOIN Guest WHERE isDeleted = 0",
      (err, rows, fields) => {
        res.send(rows);
      }
    )
});

app.get('/api/rooms', (req, res) => {
  connection.query(
    "SELECT * FROM Room",
    (err, rows, fields) => {
      res.send(rows);
    }
  )
});

app.put('/api/rooms', upload.single(), (req, res) => {
  let sql = 'UPDATE Room SET ' + req.body.revise_element + ' = ? WHERE room_number = ?';
  let revise_value = req.body.revise_value;
  let room_number = req.body.room_number;
  let params = [revise_value, room_number];
  connection.query(sql, params,
    (err, rows, fields) => {
      res.send(rows);
    });
});

app.get('/api/guests', (req, res) => {
  connection.query(
    "SELECT * FROM Guest",
    (err, rows, fields) => {
      res.send(rows);
    }
  )
});

app.post('/api/guests', upload.single(), (req, res) => {
  let sql = 'INSERT INTO Guest VALUES (?, ?, ?, ?, ?, ?)';
  let guest_id = req.body.guest_id;
  let guest_name = req.body.guest_name;
  let payment_info = req.body.payment_info;
  let guest_mail = req.body.guest_mail;
  let guest_phone_number = req.body.guest_phone_number;
  let unpaid = req.body.unpaid;
  let params = [guest_id, guest_name, payment_info, guest_mail, guest_phone_number, unpaid];
  connection.query(sql, params,
    (err, rows, fields) => {
      res.send(rows);
    });
});

app.get('/api/staffs', (req, res) => {
  connection.query(
    "SELECT * FROM Staff WHERE staff_isDeleted = 0",
    (err, rows, fields) => {
      res.send(rows);
    }
  )
});

app.use('/image', express.static('./upload'));

app.post('/api/staffs', upload.single('image'), (req, res) => {
  let sql = 'INSERT INTO Staff VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)';
  let image = '/image/' + req.file.filename;
  let staff_id = req.body.staff_id;
  let staff_name = req.body.staff_name;
  let staff_role = req.body.staff_role;
  let staff_area = req.body.staff_area;
  let staff_address = req.body.staff_address;
  let staff_mail = req.body.staff_mail;
  let staff_phone_number = req.body.staff_phone_number;
  let staff_salary = req.body.staff_salary;
  let staff_account = req.body.staff_account;
  let staff_memo = req.body.staff_memo;
  let params = [image, staff_id, staff_name, staff_role, staff_area, staff_address, staff_mail, staff_phone_number, staff_salary, staff_account, staff_memo];
  connection.query(sql, params,
    (err, rows, fields) => {
      res.send(rows);
    });
});

app.put('/api/staffs', upload.single(), (req, res) => {
  let sql = 'UPDATE Staff SET staff_memo = ? WHERE staff_id = ?';
  let staff_memo = req.body.staff_memo;
  let staff_id = req.body.staff_id;
  let params = [staff_memo, staff_id];
  connection.query(sql, params,
    (err, rows, fields) => {
      res.send(rows);
    });
});

app.patch('/api/staffs', upload.single(), (req, res) => {
  let sql = 'UPDATE Staff SET ' + req.body.revise_element + ' = ? WHERE staff_id = ?';
  let revise_value = req.body.revise_value;
  let staff_id = req.body.staff_id;
  let params = [revise_value, staff_id];
  connection.query(sql, params,
    (err, rows, fields) => {
      res.send(rows);
    });
});


app.delete('/api/staffs/:staff_id', (req, res) => {
  let sql = 'UPDATE Staff SET staff_isDeleted = 1 WHERE staff_id = ?';
  let params = [req.params.staff_id];
  connection.query(sql, params,
    (err,rows,fields) => {
      res.send(rows);
    })
})

app.post('/api/reservations', upload.single(), (req, res) => {
    let sql = 'UPDATE Reservation SET real_check_in = NOW() WHERE reserve_number = ?';
    let reserve_number = req.body.reserve_number;
    let params = [reserve_number];
    connection.query(sql, params,
      (err, rows, fields) => {
        res.send(rows);
      });
});

app.put('/api/reservations', upload.single(), (req, res) => {
    let sql = 'UPDATE Reservation SET real_check_out = NOW() WHERE reserve_number = ?';
    let reserve_number = req.body.reserve_number;
    let params = [reserve_number];
    connection.query(sql, params,
      (err, rows, fields) => {
        res.send(rows);
      });
});

app.patch('/api/reservations', upload.single(), (req, res) => {
  let sql = 'UPDATE Reservation SET ' + req.body.revise_element + ' = ? WHERE reserve_number = ?';
  let revise_value = req.body.revise_value;
  let reserve_number = req.body.reserve_number;
  let params = [revise_value, reserve_number];
  connection.query(sql, params,
    (err, rows, fields) => {
      res.send(rows);
    });
});

app.delete('/api/reservations/:reserve_number', (req, res) => {
  let sql = 'UPDATE Reservation SET isDeleted = 1 WHERE reserve_number = ?';
  let params = [req.params.reserve_number];
  connection.query(sql, params,
    (err,rows,fields) => {
      res.send(rows);
    })
})

app.listen(port, () => console.log(`Listening on port ${port}`));