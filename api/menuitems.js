const express = require('express');
const menuItemsRouter = express.Router();
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
      res.status(404).send;
    }
  });
});

menuItemsRouter.get('/', (req, res, next) => {
    const sql = 'SELECT * FROM MenuItem WHERE menu_id = $menuId';
    const values = { $menuId: req.params.menuId};
    
    db.all(sql, values, (err, menuItems) => {
      if(err) {
        console.log(err);
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

    const sql = 'INSERT INTO MenuItem (name, description, inventory, price, menuId)' +
    'VALUES ($name, $description, $inventory, $price, $menuId)';
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
  if (!name || !description || !inventory || !price) {
    return res.sendStatus(400);
  }

  const query = 'UPDATE MenuItem SET name=$name, description=$description, inventory=$inventory, price=$price ' +
                'WHERE MenuItem.id=$menuItemId';
  const values = {
    $name: name,
    $description: description,
    $inventory: inventory,
    $price: price,
    $menuItemId: req.params.menuItemId
  };

  db.run(query, values, function(err) {
    if(err) {
      next(err);
    } else {
      db.get(`SELECT * FROM MenuItem WHERE MenuItem.id = ${req.params.menuItemId}`,
        (err, item) => {
          res.status(200).json({menuItem: item});
        });
    }
  });
});

menuItemsRouter.delete('/:menuItemId', (req, res, next) => {
  const menuItemId = req.params.menuItemId;
  const sql = 'DELETE FROM MenuItem WHERE id = $menuItemId';
  const values = {$menuItemId: menuItemId};
  
  db.run(sql, values, (err) => {
   if (err) {
       next(err);
      } else {
        res.status(404).send();
    }
  });
});

module.exports = menuItemsRouter;