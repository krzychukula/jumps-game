"use strict";

(function(){

  var stage = new PIXI.Stage();

  var width = 40;
  var height = 40;

  var grid = [];

  for (var i = 0; i < 10; i++){
    grid[i] = [];

    for (var j = 0; j < 10; j++){

      var x = 0 + j * width;
      var y = 0 + i * height;

      var tile = new PIXI.Graphics();
      tile.position.x = x;
      tile.position.y = y;
      tile.gridPosition = {
        x: i,
        y: j
      }
      tile.status = 'new';
      // tile.clear();
      // tile.lineStyle(1, 0xBB1288);
      // tile.beginFill(0xFA12AA);
      // tile.drawRect(x, y, width, height);
      // tile.endFill();



      grid[i][j] = tile;
      stage.addChild(tile);
    }
  }

  var currentText = new PIXI.Text("Current: 1/100", {font: height/2+"px Arial", fill:"white"});
  currentText.position.y = 10.5 * height;
  currentText.position.x = width/2;
  stage.addChild(currentText);


  var recordMessage = "Record: None Yet";
  if(localStorage.recordVisited){
    recordMessage = "Record: "+localStorage.recordVisited+"/100";
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
      if(x < 10 && y < 10){
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

    currentText.setText("Current: "+visited+"/100")

    if(!potentials){
      if(visited > recordText.recordVisited){
        recordText.recordVisited = visited;
        recordText.setText("Record: "+visited+"/100");
        localStorage.recordVisited = visited;
        alert("New RECORD: "+visited+"/100!");
      }else{
        alert("You have unlocked "+visited+"/100");
      }

      stage.children.forEach(function(tile){
        tile.status = 'new';
        drawTile(tile);
      });
      visit(0,0);
    }

  }

  visit(0,0);


  var renderer = PIXI.autoDetectRecommendedRenderer();

  document.body.appendChild(renderer.view);

  function draw(){
    requestAnimationFrame(draw);

    renderer.render(stage);
  }
  requestAnimationFrame(draw);

}());
