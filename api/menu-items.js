const express = require('express');
const menuItemsRouter = express.Router({mergeParams: true});
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

menuItemsRouter.param('menuItemId', (req, res, next, menuItemId) => {
  const sql = 'SELECT * from MenuItem WHERE MenuItem.id = $menuItemId';
  const values = {$menuItemId: menuItemId};
  db.get(sql, values, (error, menuItem) => {
    if (error) {
      next(error);
    } else if (menuItem) {
      req.menuItem = menuItem;
      next();
    } else {
      res.sendStatus(404);
    }
  });
});

menuItemsRouter.get('/', (req, res, next) => {
    const sql = `SELECT * FROM MenuItem WHERE MenuItem.menu_id = $menuId`;
    const values = { $menuId: req.params.menuId};
    
    db.all(sql, values, (err, menuItems) => {
      if(err) {
        next(err);
      } else { 
          res.status(200).json({menuItems: menuItems});
        }
    });
    
  });

menuItemsRouter.post('/', (req, res, next) => {
    const name = req.body.menuItem.name,
    description = req.body.menuItem.description,
    inventory = req.body.menuItem.inventory,
    price = req.body.menuItem.price
    menuId = req.params.menuId;

    if(!name || !description || !inventory || !price || !menuId) {
        return res.status(400).send();
      }

    const sql = `INSERT INTO MenuItem (name, description, inventory, price, menu_Id) 
    VALUES ($name, $description, $inventory, $price, $menuId)`;
    const values = {
        $name: name, 
        $description: description, 
        $inventory: inventory, 
        $price: price,
        $menuId: menuId
    };

    db.run(sql, values, function(error) {
        if (error) {
          next(error);
        } else {
          db.get(`SELECT * FROM MenuItem WHERE MenuItem.id = ${this.lastID}`,
            (error, menuItem) => {
              res.status(201).json({menuItem: menuItem});
            });
        }
      });
});

menuItemsRouter.put('/:menuItemId', (req, res, next) => {
  const name = req.body.menuItem.name,
        description = req.body.menuItem.description,
        inventory = req.body.menuItem.inventory,
        price = req.body.menuItem.price;
        menuId = req.params.menuId;

  if (!name || !description || !inventory || !price || !menuId) {
    return res.status(400).send();
  }

  const sql = `UPDATE MenuItem SET name = $name, description = $description, 
  inventory = $inventory, price= $price, menu_id = $menuId WHERE MenuItem.menu_id = $menuId`;

  const values = {
    $name: name,
    $description: description,
    $inventory: inventory,
    $price: price,
    $menuId: menuId
  };

  db.run(sql, values, function(err) {
    if(err) {
      next(err);
    } else {
      db.get(`SELECT * FROM MenuItem WHERE id = ${req.params.menuItemId}`,
        (err, menuItem) => {
          res.status(200).json({menuItem: menuItem});
        });
    }
  });
});



menuItemsRouter.delete('/:menuItemId', (req, res, next) => {
  const menuItemId = req.params.menuItemId;
  const sql = `DELETE FROM MenuItem WHERE id = $menuItemId`;
  const values = {$menuItemId: menuItemId};
  
  db.run(sql, values, (err) => {
   if (err) {
       next(err);
      } else {
        res.sendStatus(204);
    }
  });
});

module.exports = menuItemsRouter;
