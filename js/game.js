"use strict";

(function(){

  var stage = new PIXI.Container();

  var width = 40;
  var height = 40;

  var grid = [];

  var size = 5;
  if(localStorage.sizeOfGrid){
    size = +localStorage.sizeOfGrid;
  }
  var capacity = size * size;

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
          stage.addChild(grid[i][j]);
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

    stage.children.forEach(function(tile){
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

    stage.children.forEach(function(tile){
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
        alert("You have unlocked "+capacity+" grid!");
        initGrid();
      }else if(visited > recordText.recordVisited){
        recordText.recordVisited = visited;
        recordText.text = "Record: "+visited+"/"+capacity;
        localStorage.recordVisited = visited;
        alert("New RECORD: "+visited+"/"+capacity);
      }else{
        alert("You have unlocked "+visited+"/"+capacity);
      }

      stage.children.forEach(function(tile){
        tile.status = 'new';
        drawTile(tile);
      });
      visit(0,0);

    }, 500);
    }

  }

  visit(0,0);


  var renderer = PIXI.autoDetectRenderer();

  document.body.appendChild(renderer.view);

  function draw(){
    requestAnimationFrame(draw);

    renderer.render(stage);
  }
  requestAnimationFrame(draw);

}());
