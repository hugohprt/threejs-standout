var camera, scene, renderer;
var grid,sphere,hole,outlineHole;
var vertices;

Object.assign(THREE.PlaneBufferGeometry.prototype, {
  toGrid: function() {
    let segmentsX = this.parameters.widthSegments || 1;
    let segmentsY = this.parameters.heightSegments || 1;
    let indices = [];
    for (let i = 0; i < segmentsY + 1; i++) {
      let index11 = 0;
      let index12 = 0;
      for (let j = 0; j < segmentsX; j++) {
        index11 = (segmentsX + 1) * i + j;
        index12 = index11 + 1;
        let index21 = index11;
        let index22 = index11 + (segmentsX + 1);
        indices.push(index11, index12);
        if (index22 < ((segmentsX + 1) * (segmentsY + 1) - 1)) {
          indices.push(index21, index22);
        }
      }
      if ((index12 + segmentsX + 1) <= ((segmentsX + 1) * (segmentsY + 1) - 1)) {
        indices.push(index12, index12 + segmentsX + 1);
      }
    }
    this.setIndex(indices);
    return this;
  }
});

init();


var position = grid.geometry.attributes.position;
var positionStart = grid.geometry.attributes.positionStart;
var clock = new THREE.Clock();
var time = 0;

var perlin = new Perlin();
var peak = 0.01;
var smoothing = 32;
var sphereAnimSpeed = 0.7;
render();

function init(){
  scene = new THREE.Scene();

  renderer = new THREE.WebGLRenderer({
    antialias: true
  });

  if (window.innerWidth > 750) {
  	camera = new THREE.PerspectiveCamera( 35, window.innerWidth*0.62 / window.innerHeight, 1, 1000 );
    renderer.setSize(window.innerWidth*0.62-80, window.innerHeight-80);
  }
  else {
  	camera = new THREE.PerspectiveCamera( 35, window.innerWidth/ window.innerHeight*1.62, 1, 1000 );
    renderer.setSize(window.innerWidth-80, window.innerHeight*0.62-80);
  }

  camera.position.set( -30, 20, 8);
  camera.lookAt(scene.position);

  var controls = new THREE.OrbitControls(camera, renderer.domElement);
  //controls.update() must be called after any manual changes to the camera's transform
  controls.update();

	$(".wrapper").append( renderer.domElement );

  var material = new THREE.LineBasicMaterial({color: "white"})
  var planeGeometry = new THREE.PlaneBufferGeometry(40, 40,20,20);
  grid = new THREE.LineSegments(planeGeometry.toGrid(), material);
  grid.geometry.attributes.positionStart = grid.geometry.attributes.position.clone();
  grid.rotation.x = Math.PI / 2;
  scene.add(grid);

  var holeGeometry = new THREE.CircleGeometry( 3.3, 64 );
  var holeMaterial = new THREE.MeshBasicMaterial( { color: 0x000000,side: THREE.DoubleSide, depthTest: false } );
  hole = new THREE.Mesh( holeGeometry, holeMaterial );
  hole.renderOrder=2;
  scene.add(hole);
  hole.rotation.x =- Math.PI / 2;

  var outlineMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff,side: THREE.DoubleSide, depthTest: false } );
	outlineHole = new THREE.Mesh( holeGeometry, outlineMaterial );
	outlineHole.position.y = hole.position.y-0.001;
	outlineHole.scale.multiplyScalar(1.02);
  outlineHole.rotation.x =Math.PI / 2;
  outlineHole.renderOrder=0;
	scene.add(outlineHole);



  var sphereMaterial = new THREE.LineBasicMaterial({color: 0xffffff,side: THREE.DoubleSide, depthTest: false})
  var sphereGeometry = new THREE.SphereBufferGeometry(3,64,64);
  sphere = new THREE.Mesh(sphereGeometry,sphereMaterial);
  sphere.renderOrder=3;
  scene.add(sphere);

}

function refreshVertices() {
    // var curTime = new Date().getTime();
    // console.log(delta);
    vertices = grid.geometry.attributes.position.array;

    var map1 = vertices.map(x=>x*2);
    for (var i = 0; i <= vertices.length; i += 3) {
        vertices[i+2] = (peak * perlin.noise(
            ((grid.position.x + vertices[i]+time)/smoothing),
            ((grid.position.z + vertices[i+1]+time)/smoothing)
        )) *((Math.pow(vertices[i+1], 2)+(Math.pow(vertices[i], 2)))*1);
    }
    grid.geometry.attributes.position.needsUpdate = true;
    grid.geometry.computeVertexNormals();
}

// Render
function render() {
  requestAnimationFrame(render);
	// ---------------------------------------------------
  // Animation
  time += clock.getDelta();

  refreshVertices();

  sphere.position.y = (Math.sin(time*0.7)*3) + 2;


  $('#x').html(camera.position.x.toFixed(3));
  $('#y').html(camera.position.y.toFixed(3));
  $('#z').html(camera.position.z.toFixed(3));
  position.needsUpdate = true;
	// ---------------------------------------------------
	renderer.render( scene, camera );
}

window.addEventListener( 'resize', onWindowResize, false );

function onWindowResize(){

    if (window.innerWidth > 750) {
      camera.aspect = window.innerWidth*0.62 / window.innerHeight;
      renderer.setSize(window.innerWidth*0.62-80, window.innerHeight-80);
    }
    else {
      camera.aspect = window.innerWidth / window.innerHeight*1.62;
      renderer.setSize(window.innerWidth-80, window.innerHeight*0.62-80);
    }
    camera.updateProjectionMatrix();
}
