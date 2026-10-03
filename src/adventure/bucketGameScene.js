// A clean, standalone stage for Mira's next activity: Mira, a bucket, and
// enough open floor to make the next small action feel possible.
export function createBucketGameScene(THREE){
  const stage=new THREE.Group();
  stage.name='MiraBucketGameStage';

  const floor=new THREE.Mesh(
    new THREE.PlaneGeometry(14,14),
    new THREE.MeshStandardMaterial({color:'#394873',roughness:.9,metalness:.02}),
  );
  floor.name='EmptyStorybookFloor';
  floor.rotation.x=-Math.PI/2;
  floor.position.y=-.04;
  floor.receiveShadow=true;
  stage.add(floor);
  const backdrop=new THREE.Mesh(new THREE.PlaneGeometry(10,5.8),new THREE.MeshBasicMaterial({color:'#1c2d55'}));
  backdrop.name='SideViewStoryBackdrop';backdrop.position.set(0,1.45,-.8);stage.add(backdrop);
  const moon=new THREE.Mesh(new THREE.CircleGeometry(.62,40),new THREE.MeshBasicMaterial({color:'#f1dfb2'}));
  moon.position.set(2.35,3.05,-.76);stage.add(moon);
  const skylineMaterial=new THREE.MeshStandardMaterial({color:'#2b3d67',roughness:.9});
  for(let i=0;i<7;i++){
    const x=-4.1+i*1.35,height=1.25+(i%3)*.36;
    const tower=new THREE.Mesh(new THREE.BoxGeometry(.72,height,.24),skylineMaterial);
    tower.position.set(x,.02+height/2,-.68);stage.add(tower);
    const roof=new THREE.Mesh(new THREE.ConeGeometry(.52,.72,4),skylineMaterial);
    roof.rotation.y=Math.PI/4;roof.position.set(x,height+.36,-.68);stage.add(roof);
  }
  const path=new THREE.Mesh(new THREE.BoxGeometry(14,.22,1.6),new THREE.MeshStandardMaterial({color:'#34466b',roughness:.84}));
  path.name='MiraMovementPath';path.position.set(0,-.13,.05);path.receiveShadow=true;stage.add(path);
  const pathEdge=new THREE.Mesh(new THREE.BoxGeometry(14,.035,.035),new THREE.MeshStandardMaterial({color:'#d7b56f',metalness:.28,roughness:.5}));
  pathEdge.position.set(0,-.07,.86);path.add(pathEdge);

  const bucket=new THREE.Group();
  bucket.name='MirasBucket';
  bucket.position.set(.85,0,-.15);
  const bodyMaterial=new THREE.MeshStandardMaterial({color:'#b96f5d',roughness:.64,metalness:.08,side:THREE.DoubleSide});
  const brass=new THREE.MeshStandardMaterial({color:'#d7b56f',roughness:.38,metalness:.55});
  const body=new THREE.Mesh(new THREE.CylinderGeometry(.38,.27,.68,32,1,true),bodyMaterial);
  body.position.y=.34;
  body.castShadow=body.receiveShadow=true;
  bucket.add(body);
  const base=new THREE.Mesh(new THREE.CylinderGeometry(.27,.27,.025,32),bodyMaterial);
  base.position.y=.035;
  base.castShadow=base.receiveShadow=true;
  bucket.add(base);
  const rim=new THREE.Mesh(new THREE.TorusGeometry(.38,.035,8,32),brass);
  rim.rotation.x=Math.PI/2;
  rim.position.y=.68;
  rim.castShadow=true;
  bucket.add(rim);
  for(const y of [.13,.56]){
    const band=new THREE.Mesh(new THREE.TorusGeometry(.29+(y/.68)*.09,.014,6,32),brass);
    band.rotation.x=Math.PI/2;
    band.position.y=y;
    band.castShadow=true;
    bucket.add(band);
  }
  const handlePath=new THREE.CatmullRomCurve3([
    new THREE.Vector3(-.34,.63,0),new THREE.Vector3(-.4,.91,0),
    new THREE.Vector3(-.25,1.13,0),new THREE.Vector3(0,1.2,0),
    new THREE.Vector3(.25,1.13,0),new THREE.Vector3(.4,.91,0),
    new THREE.Vector3(.34,.63,0),
  ]);
  const handle=new THREE.Mesh(new THREE.TubeGeometry(handlePath,36,.022,8,false),brass);
  handle.castShadow=true;
  bucket.add(handle);
  stage.add(bucket);
  const rain=new THREE.Group();rain.name='StorybookRaindrops';stage.add(rain);
  const dropGeometry=new THREE.LatheGeometry([
    new THREE.Vector2(0,.65),new THREE.Vector2(.045,.52),new THREE.Vector2(.12,.3),
    new THREE.Vector2(.22,.06),new THREE.Vector2(.28,-.18),new THREE.Vector2(.26,-.34),
    new THREE.Vector2(.19,-.48),new THREE.Vector2(.09,-.55),new THREE.Vector2(0,-.57),
  ],16);
  // Keep the rain deliberate without filling the sky: show up to three drops,
  // and release waiting drops at least a second apart so the player can prepare.
  const drops=[];let untilNextDrop=1.8+Math.random()*.4,laneSlots=[];
  let fallCooldown=0;
  stage.userData.resetRain=()=>{
    for(const drop of drops){rain.remove(drop.mesh);drop.mesh.material.dispose();drop.mesh.userData.highlight?.geometry.dispose();drop.mesh.userData.highlight?.material.dispose();}
    drops.length=0;untilNextDrop=1.8+Math.random()*.4;laneSlots=[];fallCooldown=0;
  };
  function nextLanePosition(limit){
    if(!laneSlots.length){
      laneSlots=Array.from({length:6},(_,i)=>i);
      for(let i=laneSlots.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[laneSlots[i],laneSlots[j]]=[laneSlots[j],laneSlots[i]];}
    }
    const slot=laneSlots.pop(),segment=(2*limit)/6;
    return -limit+(slot+.5)*segment+(Math.random()-.5)*segment*.35;
  }
  stage.userData.updateRain=(dt,laneLimit=2.35,onCatch=()=>{})=>{
    let spawned=false;
    fallCooldown=Math.max(0,fallCooldown-dt);
    bucket.updateWorldMatrix(true,false);
    const bucketRim=new THREE.Vector3(0,.68,0).applyMatrix4(bucket.matrixWorld);
    if(drops.length<3){
      untilNextDrop-=dt;
    }
    if(drops.length<3&&untilNextDrop<=0){
      const mesh=new THREE.Mesh(dropGeometry,new THREE.MeshStandardMaterial({color:'#a9d9ff',roughness:.28,metalness:.03,emissive:'#28527c',emissiveIntensity:.08,transparent:true,opacity:0,depthWrite:false}));
      const highlight=new THREE.Mesh(new THREE.SphereGeometry(.1,10,8),new THREE.MeshBasicMaterial({color:'#f1f8ff',transparent:true,opacity:.2,depthWrite:false}));
      highlight.scale.set(.42,.72,.22);highlight.position.set(-.12,.2,.14);mesh.add(highlight);mesh.userData.highlight=highlight;
      // Keep drops in the same shallow plane and horizontal strip Mira can move through.
      mesh.position.set(nextLanePosition(laneLimit),2.35+Math.random()*1.45,.42);
      mesh.rotation.z=(Math.random()-.5)*.25;mesh.scale.set(.045*.72,.045*1.45,.045*.72);mesh.renderOrder=2;
      rain.add(mesh);drops.push({mesh,age:0,phase:'grow',holdRemaining:0,fallSpeed:0});spawned=true;untilNextDrop=2.3+Math.random()*.5;
    }
    let fullSizeDrops=drops.reduce((count,drop)=>count+(drop.phase==='grow'?0:1),0);
    let animated=false;
    for(let i=drops.length-1;i>=0;i--){
      const drop=drops[i];
      if(drop.phase==='grow'){
        if(drop.age<4.5||fullSizeDrops<3){drop.age=Math.min(5,drop.age+dt);animated=true;}
        const progress=drop.age/5,eased=progress*progress*(3-2*progress),size=.045+(.23-.045)*eased;
        drop.mesh.scale.set(size*.72,size*1.45,size*.72);drop.mesh.material.opacity=.42+.34*eased;drop.mesh.userData.highlight.material.opacity=.2+.28*eased;
        if(drop.age>=5){drop.phase='hold';drop.holdRemaining=Math.random()*4;fullSizeDrops++;}
      }else if(drop.phase==='hold'){
        drop.holdRemaining=Math.max(0,drop.holdRemaining-dt);
        const earlierDropsAreFalling=drops.slice(0,i).every(earlier=>earlier.phase==='fall');
        if(drop.holdRemaining===0&&fallCooldown===0&&earlierDropsAreFalling){drop.phase='fall';drop.fallSpeed=.15;fallCooldown=1;animated=true;}
      }else{
        const previousY=drop.mesh.position.y;
        drop.fallSpeed+=6.2*dt;drop.mesh.position.y-=drop.fallSpeed*dt;drop.mesh.rotation.z+=dt*.12;animated=true;
        const contactY=bucketRim.y+drop.mesh.scale.y*.57;
        const crossedRim=previousY>contactY&&drop.mesh.position.y<=contactY;
        if(crossedRim&&Math.abs(drop.mesh.position.x-bucketRim.x)<.28&&Math.abs(drop.mesh.position.z-bucketRim.z)<.3){
          rain.remove(drop.mesh);drop.mesh.material.dispose();drops.splice(i,1);fullSizeDrops--;onCatch();
        }else if(drop.mesh.position.y<-.5){rain.remove(drop.mesh);drop.mesh.material.dispose();drops.splice(i,1);fullSizeDrops--;}
      }
    }
    return spawned||animated;
  };
  return stage;
}

// The final building activity uses its own uncluttered stage, separate from
// the story vignette with Mira and the bucket.
export function createBuildingWorkspaceScene(THREE){
  const workspace=new THREE.Group();
  workspace.name='MiraBuildingWorkspace';
  const floor=new THREE.Mesh(
    new THREE.PlaneGeometry(12,12),
    new THREE.MeshStandardMaterial({color:'#46577f',roughness:.88,metalness:.02}),
  );
  floor.name='BuildingWorkspaceFloor';
  floor.rotation.x=-Math.PI/2;
  floor.position.y=-.04;
  floor.receiveShadow=true;
  workspace.add(floor);
  const grid=new THREE.GridHelper(11,.55,'#9aabc8','#7e90b2');
  grid.name='SubtleBuildGrid';
  grid.position.y=-.032;
  for(const material of Array.isArray(grid.material)?grid.material:[grid.material]){
    material.transparent=true;
    material.opacity=.18;
  }
  workspace.add(grid);

  return workspace;
}
