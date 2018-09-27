const express = require('express');
const menuRouter = express.Router();
const sqlite3 = require('sqlite3');
const menuItemsRouter = require('./menuitems.js');

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

menuRouter.param('menuId', (req, res, next, menuId)=> {
    const sql = 'SELECT * FROM Menu WHERE Menu.id = $menuId';
    const values = {$menuId: menuId};
    db.get(sql, values, (error, menu)=> {
        if (error) {
            next(error);
        } else if (menu) {
            req.menu = menu;
            next();
        } else {
            res.status(404).send();
        }
    });
});

menuRouter.use('/:menuId/menu-items', menuItemsRouter);

menuRouter.get('/', (req, res, next) => {
    db.all('SELECT * FROM Menu',
      (err, menus) => {
        if (err) {
          next(err);
        } else {
          res.status(200).json({menus: menus});
        }
      });
  });

  menuRouter.get('/:menuId', (req, res, next) => {
    res.status(200).json({menu: req.menu});
});

  menuRouter.post('/', (req, res, next) => {
    const title = req.body.menu.title;
    if (!title) {
      return res.sendStatus(400);
    }
    const sql = 'INSERT INTO Menu (title) VALUES ($title)';
    const values = {
      $title: title
    };
  
    db.run(sql, values, function(error) {
      if (error) {
        next(error);
      } else {
        db.get(`SELECT * FROM Menu WHERE id = ${this.lastID}`,
          (error, menu) => {
            res.status(201).send({menu: menu});
          });
      }
    });
  });

  menuRouter.put('/:menuId', (req, res, next) => {
    const title = req.body.menu.title;
    if (!title) {
      return res.sendStatus(400);
    }
    const sql = 'UPDATE Menu SET title = $title WHERE Menu.id = $menuId';
    const values = {
        $title: title,
        $menuId: req.params.menuId
    };
    db.run(sql, values, (error) => {
        if (error) {
            next(error);
        } else {
            db.get(`SELECT * FROM Menu WHERE Menu.id = ${req.params.menuId}`,
        (error, menu) => {
            res.status(200).json({menu: menu});
        });
        }
    });
  });

  /* 
  4) should not delete menus with existing related menu items
  5) should return a 400 status code if deleted menu has existing related menu items

  */

  menuRouter.delete('/:menuId', (req, res, next) => {
    const menuItemSql = 'SELECT * FROM MenuItem WHERE MenuItem.menu_id = $menuId';
    const menuItemValues = {$menuId: req.params.menuId};
    db.get(menuItemSql, menuItemValues, (error, menuItem) => {
      if (error) {
        next(error);
      } else if (menuItem) {
        res.sendStatus(400);
      } else {
        const menuId = req.params.menuId;
        const deleteSql = 'DELETE FROM Menu WHERE id = $menuId';
        const deleteValues = {$menuId: menuId};
        
        db.run(deleteSql, deleteValues, (err) => {
         if (err) {
             next(err);
            } else {
            res.status(204).send();
          }
        });
      }
    });


   
  });


module.exports = menuRouter;
