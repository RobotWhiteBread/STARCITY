
// =====================================================================================================
// Data layers. A second data pack (property, people, traffic, places) and one engine that gives every
// dataset a 3D form: points become pillars of light, lines become walls, areas become raised blocks or
// ground tints with a glowing fence, and grids become hexagon columns. Each layer has clickable tiers,
// a height slider, a see-through slider and a card on tap.
// =====================================================================================================
let H2=null,S2=null;const DL=new Map(),dlOn=[],dlLabels=[];let dlHS=1,dlAL=1,dlTop=null,dlAuto=1;
const SKY=402.3; // a quarter mile in meters: how tall the tallest value in any metric layer stands at the default setting
const RAMP={value:[0x2b83ba,0x74c7b8,0xcfe8a6,0xfee08b,0xfdae61,0xf46d43,0xd7191c],heat:[0x2fbf71,0xa8d94a,0xffe14d,0xff9f1c,0xf2541b,0xd90429],civic:[0xe6dcff,0xbba6ff,0x9476f2,0x6d48d8,0x4a22b0],cool:[0xd9f7ff,0x97dcff,0x55adff,0x2f74e6,0x1c3fb0],green:[0xf1f8d8,0xbfe39a,0x7cc66b,0x3d9e50,0x1c6b3a],age:[0x5b3a8c,0x8f5fb8,0xd98fb3,0xf6c58f,0xf9f1a5]};
const AUTOPAL=[0x4cc9f0,0xf72585,0xffd166,0x06d6a0,0xb388ff,0xff9f1c,0x80ed99,0xef476f,0x48bfe3,0xf4a261,0x90be6d,0xc77dff,0xffadad,0x9bf6ff];
const c3=h=>[(h>>16&255)/255,(h>>8&255)/255,(h&255)/255];
function rampAt(name,t){const R=RAMP[name]||RAMP.value,x=Math.max(0,Math.min(.9999,t))*(R.length-1),i=x|0,f=x-i,a=c3(R[i]),b=c3(R[i+1]);return [a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f,a[2]+(b[2]-a[2])*f]}
const hex6=c=>'#'+[0,1,2].map(i=>Math.round(c[i]*255).toString(16).padStart(2,'0')).join('');
// numbers for cards: money, percents, plain counts, years
function fmtN(v,u,key){if(v===null||v===undefined||isNaN(v))return '';
  if(u==='$'){const a=Math.abs(v);return a>=1e9?'$'+(v/1e9).toFixed(2)+' billion':a>=1e6?'$'+(v/1e6).toFixed(a>=1e7?1:2)+' million':'$'+Math.round(v).toLocaleString('en-US')}
  if(u==='%')return (Math.round(v*10)/10)+'%';
  if(/year|built|installed/i.test(key||''))return String(Math.round(v));
  const s=Math.abs(v)>=100?Math.round(v).toLocaleString('en-US'):String(Math.round(v*10)/10);return u?s+' '+u:s}
const DLU={uSolo:-1};
function dlMat(vs,fs,extra){const u={uHS:{value:1},uA:{value:1},uSolo:{value:-1},uR:{value:4},uT:{value:0},uBar:{value:0}};
  return new THREE.ShaderMaterial(Object.assign({transparent:true,depthWrite:false,side:THREE.DoubleSide,uniforms:u,vertexShader:vs,fragmentShader:fs},extra||{}))}
const ON_GLSL='float on=(uSolo<0.||abs(aTi-uSolo)<.5)?1.:0.;';
// ---- points: pillars of light. Width follows the zoom so they stay visible from the whole-city view.
const VS_PT='attribute vec3 aP;attribute vec2 aS;attribute vec3 aC;attribute float aTi;uniform float uR,uHS,uSolo;varying float vY;varying vec3 vC;void main(){'+ON_GLSL+'if(aS.x<=0.)on=0.;vec3 p=position;p.xz*=uR*aS.y;p.y*=aS.x*uHS;vY=position.y;vC=aC;gl_Position=on>.5?projectionMatrix*modelViewMatrix*vec4(aP+p,1.):vec4(2.,2.,2.,1.);}';
// every metric fades into the sky: bright at the ground, clear at the top
const FS_PT='uniform float uA,uBar;varying float vY;varying vec3 vC;void main(){float a=vY<.03?1.:mix(.8*pow(1.-vY,1.35)+.03,.86*pow(1.-vY,.75)+.1,uBar);gl_FragColor=vec4(mix(vC,vec3(1.),vY<.03?.35:0.),a*min(1.,uA+(vY<.03?.5:0.)));}';
function mkPillars(n,X,Hh,Rm,C,Ti,opt){const bar=!!(opt&&opt.bar),cyl=new THREE.CylinderGeometry(1,1,1,bar?(mobile?6:8):12,1,!bar);cyl.translate(0,.5,0);const g=new THREE.InstancedBufferGeometry();g.index=cyl.index;g.setAttribute('position',cyl.attributes.position);
  const Pp=new Float32Array(n*3),Ss=new Float32Array(n*2);for(let i=0;i<n;i++){const x=X[2*i],z=X[2*i+1];Pp[3*i]=x;Pp[3*i+1]=hAt(x,z)+.6;Pp[3*i+2]=z;Ss[2*i]=Hh[i];Ss[2*i+1]=Rm?Rm[i]:1}
  g.setAttribute('aP',new THREE.InstancedBufferAttribute(Pp,3));g.setAttribute('aS',new THREE.InstancedBufferAttribute(Ss,2));g.setAttribute('aC',new THREE.InstancedBufferAttribute(C,3));g.setAttribute('aTi',new THREE.InstancedBufferAttribute(Ti,1));g.instanceCount=n;
  const m=new THREE.Mesh(g,dlMat(VS_PT,FS_PT));m.material.uniforms.uBar.value=bar?1:0;m.frustumCulled=false;m.renderOrder=3;return m}
// ---- lines: walls that rise from the street
const VS_LN='attribute vec2 a;attribute vec3 aC;attribute float aTi;uniform float uHS,uSolo;varying float vT;varying vec3 vC;void main(){'+ON_GLSL+'vec3 p=position;p.y+=a.x*a.y*uHS;vT=a.x;vC=aC;gl_Position=on>.5?projectionMatrix*modelViewMatrix*vec4(p,1.):vec4(2.,2.,2.,1.);}';
const FS_LN='uniform float uA;varying float vT;varying vec3 vC;void main(){gl_FragColor=vec4(vC,(.76*pow(1.-vT,1.5)+.02)*uA);}';
function mkWalls(N,X,Hh,C,Ti,closed){const P=[],A=[],Cc=[],T=[],I=[];let o=0,nv=0;
  for(let i=0;i<N.length;i++){const n=N[i],h=Hh[i],c=[C[3*i],C[3*i+1],C[3*i+2]],m=closed?n+1:n;
    for(let k=0;k<m;k++){const j=k%n,x=X[o+2*j],z=X[o+2*j+1],y=hAt(x,z)+1;P.push(x,y,z,x,y,z);A.push(0,h,1,h);Cc.push(...c,...c);T.push(Ti[i],Ti[i]);if(k){const b=nv+2*k;I.push(b-2,b-1,b,b,b-1,b+1)}}
    nv+=2*m;o+=2*n}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('a',new THREE.Float32BufferAttribute(A,2));g.setAttribute('aC',new THREE.Float32BufferAttribute(Cc,3));g.setAttribute('aTi',new THREE.Float32BufferAttribute(T,1));g.setIndex(I);
  const m=new THREE.Mesh(g,dlMat(VS_LN,FS_LN));m.frustumCulled=false;m.renderOrder=3;return m}
// ---- areas: raised blocks (when height carries a number) or a ground tint with a glowing fence
const VS_PG='attribute vec3 a;attribute vec3 aC;attribute float aTi;uniform float uHS,uSolo;varying float vT;varying float vS;varying vec3 vC;void main(){'+ON_GLSL+'vec3 p=position;p.y+=a.x*a.y*uHS;vT=a.x;vS=a.z;vC=aC;gl_Position=on>.5?projectionMatrix*modelViewMatrix*vec4(p,1.):vec4(2.,2.,2.,1.);}';
const FS_PG='uniform float uA;varying float vT;varying float vS;varying vec3 vC;void main(){float a=vS>.5?(.68*pow(1.-vT,1.4)+.04):.16;gl_FragColor=vec4(vC*(vS>.5?.9:1.),a*uA);}';
const FS_FLAT='uniform float uA;varying float vT;varying float vS;varying vec3 vC;void main(){gl_FragColor=vec4(vC,.5*uA);}';
function ringsOf(L,i){const out=[];let o=L.xo[i];for(let k=0;k<L.RC[i];k++){const n=L.RN[L.ro[i]+k],r=[];for(let j=0;j<n;j++)r.push([L.X[o+2*j],L.X[o+2*j+1]]);o+=2*n;out.push(r)}return out}
function mkPrisms(L,Hh,C,Ti,flat){const P=[],A=[],Cc=[],T=[],I=[],FP=[],FC=[],FT=[],FI=[];let nv=0,fv=0;L.top=new Float32Array(L.n);
  for(let i=0;i<L.n;i++){const rings=ringsOf(L,i),h=Hh[i],c=[C[3*i],C[3*i+1],C[3*i+2]];let ymax=-1e9;for(const p of rings[0]){const y=hAt(p[0],p[1]);if(y>ymax)ymax=y}L.top[i]=ymax;
    let tri;try{tri=THREE.ShapeUtils.triangulateShape(rings[0].map(p=>new THREE.Vector2(p[0],p[1])),rings.slice(1).map(r=>r.map(p=>new THREE.Vector2(p[0],p[1]))))}catch(e){tri=[]}
    const all=[];for(const r of rings)for(const p of r)all.push(p);
    if(flat){const b=fv;for(const p of all){FP.push(p[0],hAt(p[0],p[1])+1.2,p[1]);FC.push(...c);FT.push(Ti[i])}for(const t of tri)FI.push(b+t[0],b+t[1],b+t[2]);fv+=all.length}
    else{const b=nv;for(const p of all){P.push(p[0],ymax+1,p[1]);A.push(1,h,0);Cc.push(...c);T.push(Ti[i])}for(const t of tri)I.push(b+t[0],b+t[1],b+t[2]);nv+=all.length}
    for(const r of rings){const n=r.length,b=nv;for(let k=0;k<=n;k++){const p=r[k%n],y=hAt(p[0],p[1])+1;P.push(p[0],y,p[1],p[0],flat?y:ymax+1,p[1]);A.push(0,h,1,1,h,1);Cc.push(...c,...c);T.push(Ti[i],Ti[i]);if(k){const q=b+2*k;I.push(q-2,q-1,q,q,q-1,q+1)}}nv+=2*(n+1)}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('a',new THREE.Float32BufferAttribute(A,3));g.setAttribute('aC',new THREE.Float32BufferAttribute(Cc,3));g.setAttribute('aTi',new THREE.Float32BufferAttribute(T,1));g.setIndex(I);
  const grp=new THREE.Group(),m=new THREE.Mesh(g,dlMat(VS_PG,flat?FS_LN.replace('varying float vT;','varying float vT;varying float vS;'):FS_PG));m.frustumCulled=false;m.renderOrder=3;grp.add(m);grp.userData.mats=[m.material];
  if(flat){const fg=new THREE.BufferGeometry();fg.setAttribute('position',new THREE.Float32BufferAttribute(FP,3));fg.setAttribute('a',new THREE.Float32BufferAttribute(new Float32Array(fv*3),3));fg.setAttribute('aC',new THREE.Float32BufferAttribute(FC,3));fg.setAttribute('aTi',new THREE.Float32BufferAttribute(FT,1));fg.setIndex(FI);
    // painted on the ground: drawn right after the land and before the buildings, so it tints grass and streets and never a wall
    const fm=dlMat(VS_PG,FS_FLAT,{transparent:false,blending:THREE.CustomBlending,blendSrc:THREE.SrcAlphaFactor,blendDst:THREE.OneMinusSrcAlphaFactor,depthTest:false});const f=new THREE.Mesh(fg,fm);f.frustumCulled=false;f.renderOrder=-8;grp.add(f);grp.userData.mats.push(fm)}
  return grp}
// ---- hexagon columns
const HXG={};
function hexXZ(ci){const g=H2.hex,c=(ci/g.nr)|0,r=ci%g.nr;return [-g.half+c*1.5*g.R,-(-g.half+(r+((c&1)?.5:0))*Math.sqrt(3)*g.R)]}
function hexAt(x,z){const g=H2.hex,n=-z,c0=Math.round((x+g.half)/(1.5*g.R));let best=-1,bd=1e18;for(let c=c0-1;c<=c0+1;c++){if(c<0||c>=g.nc)continue;const r0=Math.round((n+g.half)/(Math.sqrt(3)*g.R)-((c&1)?.5:0));
    for(let r=r0-1;r<=r0+1;r++){if(r<0||r>=g.nr)continue;const cx=-g.half+c*1.5*g.R,cy=-g.half+(r+((c&1)?.5:0))*Math.sqrt(3)*g.R,d=(cx-x)**2+(cy-n)**2;if(d<bd){bd=d;best=c*g.nr+r}}}return best}
const VS_HX='attribute vec3 aP;attribute float aH;attribute vec3 aC;attribute float aTi;uniform float uHS,uSolo;varying float vY;varying float vN;varying vec3 vC;void main(){'+ON_GLSL+'if(aH<=0.)on=0.;vec3 p=position;p.y*=max(2.,aH*uHS);vY=position.y;vN=abs(normal.y)>.5?1.:(.72+.28*abs(normal.x));vC=aC;gl_Position=on>.5?projectionMatrix*modelViewMatrix*vec4(aP+p,1.):vec4(2.,2.,2.,1.);}';
const FS_HX='uniform float uA;varying float vY;varying float vN;varying vec3 vC;void main(){float a=vN>.99?(vY>.5?.12:0.):(.72*pow(1.-vY,1.3)+.03);gl_FragColor=vec4(vC*mix(.86,1.,vN),a*uA);}';
function mkHex(L){const I=S2.hx_i,n=I.length,R=H2.hex.R*.94,cyl=new THREE.CylinderGeometry(R,R,1,6,1,false);cyl.rotateY(Math.PI/6);cyl.translate(0,.5,0);
  const g=new THREE.InstancedBufferGeometry();g.index=cyl.index;g.setAttribute('position',cyl.attributes.position);g.setAttribute('normal',cyl.attributes.normal);
  const P=new Float32Array(n*3);for(let i=0;i<n;i++){const [x,z]=hexXZ(I[i]);P[3*i]=x;P[3*i+1]=hAt(x,z)+1;P[3*i+2]=z}
  g.setAttribute('aP',new THREE.InstancedBufferAttribute(P,3));g.setAttribute('aH',new THREE.InstancedBufferAttribute(L.Hh,1));g.setAttribute('aC',new THREE.InstancedBufferAttribute(L.C,3));g.setAttribute('aTi',new THREE.InstancedBufferAttribute(L.Ti,1));g.instanceCount=n;
  const mat=dlMat(VS_HX,FS_HX);const m=new THREE.Mesh(g,mat);m.frustumCulled=false;m.renderOrder=3;
  if(!HXG.map){HXG.map=new Int32Array(H2.hex.nc*H2.hex.nr).fill(-1);for(let i=0;i<n;i++)HXG.map[I[i]]=i}
  if(L.def.st.haze){ // one drifting mote for every few people, thicker and higher where more people live: the atmosphere over the city
    const per=mobile?22:11,V=L.val,pts=[],cs=[];let seed=7;const rn=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
    for(let i=0;i<n;i++){const ppl=V[i]/10*H2.hex.acres,k=Math.round(ppl/per+rn()-.5),[x,z]=hexXZ(I[i]),hh=L.Hh[i];for(let q=0;q<k;q++){const a=rn()*6.283,d=Math.sqrt(rn())*H2.hex.R;pts.push(x+Math.cos(a)*d,hAt(x,z)+4+rn()*rn()*(60+hh*1.6),z+Math.sin(a)*d);cs.push(L.C[3*i],L.C[3*i+1],L.C[3*i+2])}}
    const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));pg.setAttribute('color',new THREE.Float32BufferAttribute(cs,3));
    const cv=document.createElement('canvas');cv.width=cv.height=32;const cx=cv.getContext('2d'),gr=cx.createRadialGradient(16,16,0,16,16,16);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.4,'rgba(255,255,255,.55)');gr.addColorStop(1,'rgba(255,255,255,0)');cx.fillStyle=gr;cx.fillRect(0,0,32,32);
    const pm=new THREE.PointsMaterial({size:mobile?5:6,sizeAttenuation:false,map:new THREE.CanvasTexture(cv),vertexColors:true,transparent:true,opacity:.85,depthWrite:false,fog:false,blending:THREE.AdditiveBlending});
    const haze=new THREE.Points(pg,pm);haze.frustumCulled=false;haze.renderOrder=4;const grp=new THREE.Group();grp.add(m,haze);grp.userData={mats:[mat],haze,motes:pts.length/3};return grp}
  return m}
