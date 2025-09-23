import { AfterViewInit, Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import * as THREE from 'three';

@Component({
  selector: 'app-d20',
  imports: [],
  templateUrl: './d20.html',
  styleUrl: './d20.scss',
})
export class D20 implements AfterViewInit {
  constructor(private domRenderer: Renderer2) {}
  @ViewChild('d20', { static: true }) d6Ref!: ElementRef<HTMLCanvasElement>;
  ngAfterViewInit(): void {
    const scene = new THREE.Scene();

    const g = new THREE.IcosahedronGeometry(2);
    const edges = new THREE.EdgesGeometry(g);
    const edgeLines = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x0 }));

    const base = new THREE.Vector2(0, 0.5);
    const center = new THREE.Vector2();
    const angle = THREE.MathUtils.degToRad(120);
    let baseUVs = [
      base
        .clone()
        .rotateAround(center, angle * 1)
        .addScalar(0.5),
      base
        .clone()
        .rotateAround(center, angle * 2)
        .addScalar(0.5),
      base
        .clone()
        .rotateAround(center, angle * 0)
        .addScalar(0.5),
    ];

    let uvs = [];
    let sides = [];
    for (let i = 0; i < 20; i++) {
      uvs.push(baseUVs[1].x, baseUVs[1].y, baseUVs[2].x, baseUVs[2].y, baseUVs[0].x, baseUVs[0].y);
      sides.push(i, i, i);
    }
    console.log(baseUVs, uvs, sides);

    g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    g.setAttribute('sides', new THREE.Float32BufferAttribute(sides, 1));

    let m = new THREE.MeshStandardMaterial({
      roughness: 0.6,
      metalness: 0.75,
      map: this.createNumberTexture(),
    });
    m.onBeforeCompile = (shader) => {
      shader.vertexShader = `
    	attribute float sides;
      ${shader.vertexShader}
    `.replace(
        `#include <uv_vertex>`,
        `
      	#include <uv_vertex>
        
        vMapUv.x = (1./20.) * (vMapUv.x + sides);
      `
      );
    };
    let o = new THREE.Mesh(g, m);
    scene.add(o);
    //

    const light = new THREE.DirectionalLight(0xffffff, 5);
    light.position.set(0, 0, 10);
    light.target.position.set(0, 0, 0);

    scene.add(light);
    scene.add(light.target);
    const camera = new THREE.PerspectiveCamera(
      50,
      this.d6Ref.nativeElement.width / this.d6Ref.nativeElement.height,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      canvas: this.d6Ref.nativeElement,
    });
    //renderer.setClearColor(0xfff, 0);
    renderer.setSize(this.d6Ref.nativeElement.clientWidth, this.d6Ref.nativeElement.clientHeight);
    renderer.setAnimationLoop(() => this.animateSpin(o, edgeLines, renderer, scene, camera));
    scene.add(edgeLines);
    camera.position.z = 10;
    renderer.render(scene, camera);
  }

  animateSpin(
    shape: THREE.Mesh,
    edges: THREE.LineSegments,
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera
  ) {
    let x = 0.01;
    let y = 0.005;
    shape.rotation.x += x;
    shape.rotation.y += y;
    edges.rotation.x += x;
    edges.rotation.y += y;

    renderer.render(scene, camera);
  }

  createNumberTexture(): THREE.CanvasTexture {
    const canvas: HTMLCanvasElement = this.domRenderer.createElement('canvas');
    let side = 256;
    canvas.width = side * 20;
    canvas.height = side;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.fillStyle = '#7f7f7f';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = 'bold 72px Times New Roman New';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'red';
      ctx.textBaseline = 'middle';
      for (let i = 0; i < 20; i++) {
        let text = (i + 1).toString();
        if (text == '6' || text == '9') {
          text += '.';
        }
        ctx.fillText(text, side * 0.5 + side * i, side * 0.5);
      }
    }

    return new THREE.CanvasTexture(canvas);
  }
}
