// ---- The Sower's wardrobe. The statue on the dome is this map's own simple figure, and these are costumes for it. For fun, and the card says so.
const SWP={lam:(c,f)=>new THREE.MeshLambertMaterial({color:c,flatShading:f!==false}),
  std:(c,m,r)=>new THREE.MeshStandardMaterial({color:c,metalness:m,roughness:r,flatShading:false})};
// a small canvas letter or mark for a jersey front
function swMark(txt,ink,cloth){const cv=document.createElement('canvas');cv.width=cv.height=128;const c=cv.getContext('2d');
  c.fillStyle=cloth;c.fillRect(0,0,128,128);c.fillStyle=ink;c.textAlign='center';c.textBaseline='middle';c.font='800 92px Georgia,"Times New Roman",serif';c.fillText(txt,64,70);
  const t=new THREE.CanvasTexture(cv);t.colorSpace=THREE.SRGBColorSpace;return t}
// every piece is placed in the Capitol group's own coordinates, where the Sower stands at about y 122 to 127
function swAdd(g,geo,mat,x,y,z,rx,ry,rz){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);if(rx)m.rotation.x=rx;if(ry)m.rotation.y=ry;if(rz)m.rotation.z=rz;m.castShadow=false;m.receiveShadow=false;g.add(m);return m}
const SWEAR=[
 ['bronze','As cast','Lee Lawrie’s Sower has stood on the dome since 1930, 19 feet of bronze on a pedestal of wheat, facing north. This is the map’s own plain stand-in for him.',
  null,{body:0xd4a72c,head:0xd4a72c,arm:0xd4a72c,base:0xd4a72c}],
 ['husker','Husker','Scarlet and cream, with the N on his chest and a cap turned the right way round. Sowing seed in the spring, sowing something else in the fall.',
  g=>{const red=SWP.lam(0xd00000),white=SWP.lam(0xfffdf7);
    swAdd(g,new THREE.CylinderGeometry(.5,.6,2.0,10),red,0,125.0,0);
    const nm=new THREE.MeshLambertMaterial({map:swMark('N','#fffdf7','#d00000')});
    swAdd(g,new THREE.PlaneGeometry(.62,.62),nm,0,125.25,-.56,0,Math.PI,0);swAdd(g,new THREE.PlaneGeometry(.62,.62),nm,0,125.25,.56);
    swAdd(g,new THREE.CylinderGeometry(.47,.5,1.5,10),white,0,123.4,0);
    swAdd(g,new THREE.SphereGeometry(.45,12,8,0,Math.PI*2,0,Math.PI*.55),red,0,126.5,0);
    swAdd(g,new THREE.CylinderGeometry(.46,.46,.1,12),red,0,126.48,0);
    swAdd(g,new THREE.BoxGeometry(.5,.07,.34),red,0,126.5,-.52);
    swAdd(g,new THREE.CylinderGeometry(.2,.22,.5,8),red,.92,124.55,0,0,0,-1.05);},
  {body:0xd00000,head:0xe8c9a0,arm:0xe8c9a0,base:0xfffdf7}],
 ['cowboy','Cowboy','A hat with a brim wide enough for a Sand Hills afternoon, a denim shirt, a vest and a bandana. He was always a working man.',
  g=>{const den=SWP.lam(0x3f5f8f),hide=SWP.lam(0x6b4a2e),felt=SWP.lam(0x4a3a2a),red=SWP.lam(0xb02a2a);
    swAdd(g,new THREE.CylinderGeometry(.5,.58,2.1,10),den,0,125.0,0);
    swAdd(g,new THREE.CylinderGeometry(.53,.56,1.2,10,1,true),hide,0,125.5,0);
    swAdd(g,new THREE.TorusGeometry(.4,.1,6,12),red,0,126.0,0,Math.PI/2);
    swAdd(g,new THREE.CylinderGeometry(.9,1.0,.08,16),felt,0,126.75,0);
    swAdd(g,new THREE.CylinderGeometry(.34,.42,.62,12),felt,0,127.05,0);
    swAdd(g,new THREE.TorusGeometry(.39,.055,6,12),SWP.lam(0x2a2018),0,126.84,0,Math.PI/2);
    swAdd(g,new THREE.CylinderGeometry(.5,.52,1.4,10),SWP.lam(0x8a7556),0,123.35,0);
    swAdd(g,new THREE.BoxGeometry(.3,.18,.3),SWP.std(0xd9bb63,.7,.35),0,124.1,-.52);
    for(const sx of [-.22,.22])swAdd(g,new THREE.BoxGeometry(.3,.4,.55),SWP.lam(0x4a3426),sx,122.6,-.1);
    swAdd(g,new THREE.CylinderGeometry(.2,.22,.5,8),den,.92,124.55,0,0,0,-1.05);},
  {body:0x3f5f8f,head:0xe8c9a0,arm:0xe8c9a0,base:0x8a7556}],
 ['glam','Glam','A floor-length sequin gown, opera gloves and a tiara, because a statue that has stood still for ninety-five years has earned one night out.',
  g=>{const sil=SWP.std(0xe8e4f0,.92,.16),gown=SWP.std(0xd8b7e8,.78,.2),gold=SWP.std(0xf0d070,.9,.2);
    const sk=swAdd(g,new THREE.ConeGeometry(1.25,3.1,16,1,true),gown,0,123.6,0);sk.material.side=THREE.DoubleSide;
    swAdd(g,new THREE.CylinderGeometry(.48,.56,1.5,12),sil,0,125.4,0);
    swAdd(g,new THREE.TorusGeometry(.5,.06,6,16),gold,0,126.08,0,Math.PI/2);
    for(let i=0;i<9;i++){const a=i/9*Math.PI*2;swAdd(g,new THREE.ConeGeometry(.055,.2,5),gold,Math.cos(a)*.4,126.78,Math.sin(a)*.4)}
    swAdd(g,new THREE.TorusGeometry(.4,.045,6,14),gold,0,126.68,0,Math.PI/2);
    swAdd(g,new THREE.CylinderGeometry(.21,.23,1.5,8),sil,.88,124.85,0,0,0,-1.05);
    const N=46,P=new Float32Array(N*3),C=new Float32Array(N*3),col=new THREE.Color();
    for(let i=0;i<N;i++){const a=i*2.399,r=.7+(i%7)*.22;P[3*i]=Math.cos(a)*r;P[3*i+1]=122.4+(i%13)*.37;P[3*i+2]=Math.sin(a)*r;
      col.setHSL(.75+.2*((i%5)/5),.5,.86);C[3*i]=col.r;C[3*i+1]=col.g;C[3*i+2]=col.b}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(P,3));geo.setAttribute('color',new THREE.BufferAttribute(C,3));
    const pts=new THREE.Points(geo,new THREE.PointsMaterial({size:.26,vertexColors:true,transparent:true,opacity:.95,depthWrite:false,fog:false}));g.add(pts);g.userData.sparkle=pts;},
  {body:0xe8e4f0,head:0xf0dcc4,arm:0xe8e4f0,base:0xd8b7e8}],
 ['volleyball','Volleyball','A number 1 jersey, kneepads, and the seed in his raised hand swapped for a ball. The Devaney Center is a mile and a half northwest of here.',
  g=>{const red=SWP.lam(0xd00000),white=SWP.lam(0xfffdf7);
    swAdd(g,new THREE.CylinderGeometry(.5,.58,1.7,10),red,0,125.2,0);
    const vm=new THREE.MeshLambertMaterial({map:swMark('1','#d00000','#fffdf7')});
    swAdd(g,new THREE.PlaneGeometry(.55,.55),vm,0,125.35,-.56,0,Math.PI,0);swAdd(g,new THREE.PlaneGeometry(.55,.55),vm,0,125.35,.56);
    swAdd(g,new THREE.CylinderGeometry(.48,.5,1.5,10),white,0,123.4,0);
    for(const sx of [-.22,.22])swAdd(g,new THREE.TorusGeometry(.16,.07,6,10),SWP.lam(0xe8e4dc),sx,122.9,0,0,0,Math.PI/2);
    swAdd(g,new THREE.CylinderGeometry(.2,.22,.5,8),SWP.lam(0xe8c9a0),.92,124.55,0,0,0,-1.05);
    const ball=swAdd(g,new THREE.SphereGeometry(.4,16,12),SWP.lam(0xfffdf7,false),1.62,126.2,0);
    for(let i=0;i<3;i++){const t=swAdd(g,new THREE.TorusGeometry(.4,.035,6,18),SWP.lam(0xd00000,false),1.62,126.2,0);t.rotation.x=i*1.05;t.rotation.z=i*.7}
    g.userData.ball=ball;},
  {body:0xd00000,head:0xe8c9a0,arm:0xe8c9a0,base:0xfffdf7}],
 ['winter','Winter','A quilted coat, a long scarf and earmuffs. Lincoln gets to twenty below and he has never once gone inside.',
  g=>{const coat=SWP.lam(0x2f5d50),knit=SWP.lam(0xc4553a),fur=SWP.lam(0xd8d2c4);
    for(let i=0;i<3;i++)swAdd(g,new THREE.CylinderGeometry(.6,.62,.72,12),coat,0,124.3+i*.72,0);
    swAdd(g,new THREE.TorusGeometry(.46,.13,8,14),knit,0,126.1,0,Math.PI/2);
    const tail=swAdd(g,new THREE.BoxGeometry(.26,1.5,.12),knit,.3,125.3,.38);tail.rotation.z=.18;
    for(const sx of [-.44,.44])swAdd(g,new THREE.SphereGeometry(.17,10,8),fur,sx,126.5,0);
    swAdd(g,new THREE.TorusGeometry(.44,.05,6,14),fur,0,126.75,0,0,0,Math.PI/2);
    swAdd(g,new THREE.CylinderGeometry(.22,.25,.6,8),coat,.9,124.6,0,0,0,-1.05);
    swAdd(g,new THREE.SphereGeometry(.2,8,6),knit,1.38,125.85,0);},
  {body:0x2f5d50,head:0xe8c9a0,arm:0x2f5d50,base:0xd8d2c4}]];
function swClear(){const S=LM.sower;if(!S||!S.grp)return;
  S.grp.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material){const a=Array.isArray(o.material)?o.material:[o.material];for(const m of a){if(m.map)m.map.dispose();m.dispose()}}});
  if(S.grp.parent)S.grp.parent.remove(S.grp);S.grp=null}
function sowerWear(key,quiet){const S=LM.sower;if(!S)return false;const W=SWEAR.find(w=>w[0]===key)||SWEAR[0];
  swClear();S.wear=W[0];
  for(const [part,col] of Object.entries(W[4]))if(S[part])S[part].material.color.setHex(col);
  S.base.visible=W[0]==='bronze'||W[0]==='glam'?true:true;
  if(W[3]){const g=new THREE.Group();W[3](g);LM.capG.add(g);S.grp=g}
  try{localStorage.setItem('sc_sower',W[0])}catch(e){}
  if(!quiet)sowerCard();shadowDirty=true;dirty=true;return true}
function swFrame(now){const S=LM.sower;if(!S||!S.grp)return;const u=S.grp.userData;
  if(u.sparkle){u.sparkle.material.opacity=.55+.4*Math.sin(now*.004);dirty=true}
  if(u.ball){u.ball.position.y=126.2+Math.sin(now*.0022)*.1;dirty=true}}
function sowerFly(){flyTo(camTo(LM.capitol[0],LM.capitol[1],mobile?62:48,200,-7,125.2),2000)}
function sowerCard(){const S=LM.sower;if(!S){showCard('The Sower','The Capitol did not load with this copy of the map.');return}
  const W=SWEAR.find(w=>w[0]===S.wear)||SWEAR[0];
  menuCard('sower',()=>showCard('The Sower: '+W[1],W[2]+' This is a costume on the map’s own simple figure, not the statue. For fun.',undefined,
    {label:'Fly up to him',fn:sowerFly},
    SWEAR.filter(w=>w[0]!==S.wear).map(w=>({label:w[1],fn:()=>sowerWear(w[0])}))))}
function sowerInit(){if(!LM.sower)return;let k='bronze';try{k=localStorage.getItem('sc_sower')||'bronze'}catch(e){}
  if(k!=='bronze')sowerWear(k,true)}
