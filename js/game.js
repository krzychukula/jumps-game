"use strict";

(function(){

  var stage = new PIXI.Container();

  var w = 800;
  var h = 600;

  var width = 40;
  var height = 40;

  var grid = [];

  var size = 5;
  if(localStorage.sizeOfGrid){
    size = +localStorage.sizeOfGrid;
  }
  var capacity = size * size;

  var gridContainer = new PIXI.Container();
  stage.addChild(gridContainer);

  function initGrid(){
    for (var i = 0; i < size; i++){
      if(!grid[i]){
        grid[i] = [];
      }


      for (var j = 0; j < size; j++){



        var x = 0 + j * width;
        var y = 0 + i * height;

        if(!grid[i][j]){
          grid[i][j] = new PIXI.Graphics();
          gridContainer.addChild(grid[i][j]);
        }
        var tile = grid[i][j];

        tile.position.x = x;
        tile.position.y = y;
        tile.gridPosition = {
          x: i,
          y: j
        }
        tile.status = 'new';


      }
    }
  }

  initGrid()


  var currentText = new PIXI.Text("Current: 1/100", {font: height/2+"px Arial", fill:"white"});
  currentText.position.y = 10.5 * height;
  currentText.position.x = width/2;
  stage.addChild(currentText);


  var recordMessage = "Record: None Yet";
  if(localStorage.recordVisited){
    recordMessage = "Record: "+localStorage.recordVisited+"/"+capacity;
  }

  var recordText = new PIXI.Text(recordMessage, {font: height/2+"px Arial", fill:"white"});
  recordText.position.y = 10.5 * height;
  recordText.position.x = 5.5 * width;
  recordText.recordVisited = 0;
  stage.addChild(recordText);

  var popup = new PIXI.Container();
  var popupDimensions = {
    w: w * 0.8,
    h: h * 0.8
  }
  popup.position.set(w * 0.5 - popupDimensions.w * 0.5, h * 0.5 - popupDimensions.h * 0.5);
  var box = new PIXI.Graphics();
  box.clear();
  box.lineStyle(1, 0x222222);
  box.beginFill(0x444444);
  box.drawRect(0,0, popupDimensions.w,popupDimensions.h);
  box.endFill();
  popup.addChild(box);
  var info = new PIXI.Text("Try to visit every box", {font: height * 0.5+"px Arial", fill:"white"} );
  info.anchor.set(0.5);
  info.position.set(popupDimensions.w * 0.5,popupDimensions.h * 0.25)
  popup.addChild(info);
  var close = new PIXI.Graphics();
  close.interactive = true;
  close.buttonMode = true;
  close.position.set(popupDimensions.w * 0.5, popupDimensions.h * 0.9);
  close.clear();
  close.lineStyle(1, 0x000000);
  close.beginFill(0xFFFFFF);
  var closeDimensions = {
    w: popupDimensions.w * 0.2,
    h: popupDimensions.h * 0.1
  }
  close.drawRect(-closeDimensions.w * 0.5,-closeDimensions.h*0.5, closeDimensions.w, closeDimensions.h);
  close.endFill();
  close.click = close.touchend = function(e){
    popup.visible = false;
  }
  popup.addChild(close);
  var closeText = new PIXI.Text("ok", {font: height/2+"px Arial", fill:"black"} );
  closeText.anchor.set(0.5);
  closeText.position.set(popupDimensions.w * 0.5,popupDimensions.h * 0.9)
  popup.addChild(closeText);
  stage.addChild(popup);

  function notifyUser (text){
    info.text = text;
    popup.visible = true;
  }

  function drawTile(tile){
    if(!tile.clear){
      return;
    }
    tile.clear();
    tile.lineStyle(1, 0x222222);
    var color = 0xC9D6F7;
    if(tile.status == 'current'){
      color = 0xEEEEEE;
    }else if(tile.status == 'potential'){
      color = 0x238923;
    }else if(tile.status == 'visited'){
      color = 0x444444;
    }
    tile.beginFill(color);
    tile.drawRect(0,0, width, height);
    tile.endFill();
  }

/*

xx7x0xxx
x6xxx1xx
xxxoxxxx
x5xxx2xx
xx4x3xxx

*/

  function get(x, y){
    if(x >=0 && y >= 0){
      if(x < grid.length && y < grid.length){
        return grid[x][y];
      }
    }
  }

  function visit(x, y){

    gridContainer.children.forEach(function(tile){
      if(tile.status == 'current'){
        tile.status = 'visited';
      }else if(tile.status == 'potential'){
        tile.status = 'new'
      }

      tile.interactive = false;
    })
    var current = get(x,y);

    current.status = 'current';

    var potential = [
      get(x+1,y-2),
      get(x+2,y-1),
      get(x+2,y+1),
      get(x+1,y+2),
      get(x-1,y+2),
      get(x-2,y+1),
      get(x-2,y-1),
      get(x-1,y-2)
    ];

    var potentials = 0;
    potential.forEach(function(tile){
      if(tile && tile.visible && tile.status == 'new'){
        tile.status = 'potential';
        tile.interactive = true;
        tile.buttonMode = true;
        tile.tap = tile.click = function(ev){
          visit(tile.gridPosition.x, tile.gridPosition.y);
        }
        potentials++;
      }
    });



    var visited = 0;

    gridContainer.children.forEach(function(tile){
      drawTile(tile);

      if(tile.status == 'visited' || tile.status == 'current'){
        visited++;
      }

    });

    currentText.text = "Current: "+visited+"/"+capacity;

    if(!potentials){

      setTimeout(function(){


      if(visited == capacity){
        recordText.text = "Record: "+visited+"/"+capacity;
        size++;
        capacity = size * size;
        localStorage.recordVisited = 1;
        localStorage.sizeOfGrid = size;
        notifyUser("You have unlocked "+capacity+" grid!");
        initGrid();
      }else if(visited > recordText.recordVisited){
        recordText.recordVisited = visited;
        recordText.text = "Record: "+visited+"/"+capacity;
        localStorage.recordVisited = visited;
        notifyUser("New RECORD: "+visited+"/"+capacity);
      }else{
        notifyUser("You have unlocked "+visited+"/"+capacity);
      }

      gridContainer.children.forEach(function(tile){
        tile.status = 'new';
        drawTile(tile);
      });
      visit(0,0);

    }, 500);
    }

  }

  visit(0,0);


  var renderer = PIXI.autoDetectRenderer(w, h);

  document.body.appendChild(renderer.view);

  function draw(){
    requestAnimationFrame(draw);

    renderer.render(stage);
  }
  requestAnimationFrame(draw);

}());
