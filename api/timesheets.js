const express = require('express');
const timesheetsRouter = express.Router({mergeParams: true});
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

timesheetsRouter.param('timesheetId', (req, res, next, timesheetId) => {
    const sql = 'SELECT * FROM Timesheet WHERE Timesheet.id = $timesheetId';
    const values = {$timesheetId: timesheetId};
    db.get (sql, values, (error, timesheet) => {
        if (error) {
            next(error);
        } else if (timesheet) {
            req.timesheet = timesheet;
            next();
        } else {
            res.status(404).send();
        }
    })
});



timesheetsRouter.get('/', (req, res, next) => {
    const sql = 'SELECT * FROM Timesheet WHERE Timesheet.employee_id = $employeeId';
    const values = { $employeeId: req.params.employeeId};
    
    db.all(sql, values, (err,timesheets) => {
      if(err) {
          next(err);
        }
      else { 
          res.status(200).json({timesheets: timesheets});
        }
    });
    
  });


timesheetsRouter.post('/', (req, res, next) => {
    const hours = req.body.timesheet.hours,
    rate = req.body.timesheet.rate,
    date = req.body.timesheet.date,
    employeeId = req.params.employeeId;

    if(!hours || !rate || !date || !employeeId) {
        return res.status(400).send();
      }

    const sql = 'INSERT INTO Timesheet (hours, rate, date, employee_id)' +
    'VALUES ($hours, $rate, $date, $employeeId)';
    const values = {
        $hours: hours, 
        $rate: rate, 
        $date: date, 
        $employeeId: employeeId
    };

    db.run(sql, values, function(error) {
        if (error) {
          next(error);
        } else {
          db.get(`SELECT * FROM Timesheet WHERE Timesheet.id = ${this.lastID}`,
            (error, timesheet) => {
              res.status(201).json({timesheet: timesheet});
            });
        }
      });
});


timesheetsRouter.put('/:timesheetId', (req, res, next) => {
    const hours = req.body.timesheet.hours,
    rate = req.body.timesheet.rate,
    date = req.body.timesheet.date,
    employeeId = req.params.employeeId;

    if(!hours || !rate || !date || !employeeId) {
        return res.status(400).send();
      }
    
    const sql = 'UPDATE Timesheet  SET hours = $hours, rate = $rate, date = $date, employee_id = $employeeId WHERE Timesheet.employee_id = $employeeId';
    const values = {
        $hours: hours, 
        $rate: rate, 
        $date: date, 
        $employeeId: employeeId
    };

    db.run(sql, values, (error) => {
        if (error) {
            next(error);
        } else {
            db.get(`SELECT * FROM Timesheet WHERE Timesheet.employee_id = ${req.params.employeeId}`,
        (error, timesheet) => {
            res.status(200).json({timesheet: timesheet});
        });
        }
    })

});

timesheetsRouter.delete('/:timesheetId', (req, res, next) => {
    const timesheetId = req.params.timesheetId;
    const sql = `DELETE FROM Timesheet WHERE id = $timesheetId`;
    const values = {$timesheetId: timesheetId};
    
    db.run(sql, values, (err) => {
     if (err) {
         next(err);
        } else {
        res.status(204).send();
      }
    });
  });


module.exports = timesheetsRouter;
