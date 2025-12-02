"use client";

import React, {
  useRef,
  useEffect,
  useState,
  ChangeEvent,
} from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const Viewer: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const currentModelRef = useRef<THREE.Mesh | null>(null);

  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);




  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  };

  const parseOBJ = (objString: string): THREE.BufferGeometry => {
    const vertices: number[] = [];
    const faces: number[] = [];

    const lines = objString.split("\n");

    for (let line of lines) {
      line = line.trim();
      if (!line || line.startsWith("#")) continue;

      if (line.startsWith("v ")) {
        const parts = line.split(/\s+/);
        vertices.push(
          parseFloat(parts[1]),
          parseFloat(parts[2]),
          parseFloat(parts[3])
        );
      } else if (line.startsWith("f ")) {
        const parts = line.split(/\s+/).slice(1);
        const faceVertices: number[] = [];

        for (const part of parts) {
          const indices = part.split("/");
          faceVertices.push(parseInt(indices[0], 10) - 1); // 1-based -> 0-based
        }

        if (faceVertices.length === 3) {
          faces.push(faceVertices[0], faceVertices[1], faceVertices[2]);
        } else if (faceVertices.length === 4) {
          // quad -> 2 triangles
          faces.push(faceVertices[0], faceVertices[1], faceVertices[2]);
          faces.push(faceVertices[0], faceVertices[2], faceVertices[3]);
        }
      }
    }

    const geometry = new THREE.BufferGeometry();
    const vertexArray = new Float32Array(faces.length * 3);

    for (let i = 0; i < faces.length; i++) {
      const vi = faces[i] * 3;
      vertexArray[i * 3] = vertices[vi];
      vertexArray[i * 3 + 1] = vertices[vi + 1];
      vertexArray[i * 3 + 2] = vertices[vi + 2];
    }

    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(vertexArray, 3)
    );
    geometry.computeVertexNormals();

    return geometry;
  };


  const centerAndScaleModel = (mesh: THREE.Mesh) => {
    const box = new THREE.Box3().setFromObject(mesh);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    mesh.position.sub(center);

    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 4 / maxDim;
    mesh.scale.multiplyScalar(scale);
  };
  const fitCameraToObject = (mesh: THREE.Object3D) => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;

    const box = new THREE.Box3().setFromObject(mesh);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    const maxSize = Math.max(size.x, size.y, size.z);
    const fitHeightDistance =
      maxSize / (2 * Math.tan((camera.fov * Math.PI) / 360));
    const distance = fitHeightDistance * 1.4; // add some padding

    const direction = new THREE.Vector3()
      .subVectors(camera.position, controls.target)
      .normalize();

    controls.target.copy(center);
    camera.position.copy(center).add(direction.multiplyScalar(distance));
    camera.near = maxSize / 100;
    camera.far = maxSize * 100;
    camera.updateProjectionMatrix();
    controls.update();
  };

  const disposeMesh = (mesh: THREE.Mesh) => {
    if (mesh.geometry) mesh.geometry.dispose();
    const mat = mesh.material;
    if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
    else mat.dispose();
  };


  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      60,
      width / height,
      0.1,
      1000
    );
    camera.position.set(6, 4, 6);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 0.9);
    mainLight.position.set(10, 10, 10);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
    fillLight.position.set(-8, 5, -5);
    scene.add(fillLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.6, 100);
    pointLight.position.set(0, 5, 0);
    scene.add(pointLight);

    const gridHelper = new THREE.GridHelper(20, 20, 0x555555, 0x333333);
    gridHelper.position.y = -2;
    scene.add(gridHelper);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.12;
    controls.rotateSpeed = 0.5;
    controls.zoomSpeed = 1.2;
    controlsRef.current = controls;

    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current)
        return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    const animate = () => {
      requestAnimationFrame(animate);

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
    window.removeEventListener("resize", handleResize);
    controls.dispose();
    renderer.dispose();
    container.removeChild(renderer.domElement);

    sceneRef.current = null;
    cameraRef.current = null;
    rendererRef.current = null;
    controlsRef.current = null;
    currentModelRef.current = null;
    };  
  }, []);


  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".obj")) {
      alert("Please upload a .obj file");
      return;
    }

    setFileName(file.name);
    setFileSize(formatFileSize(file.size));
    setLoading(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text !== "string") {
        setLoading(false);
        alert("Failed to read OBJ file.");
        return;
      }

      try {
        const geometry = parseOBJ(text);

        const material = new THREE.MeshStandardMaterial({
          color: 0x4a90e2, 
          metalness: 0.15,
          roughness: 0.55,
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        if (sceneRef.current) {
          if (currentModelRef.current) {
            sceneRef.current.remove(currentModelRef.current);
            disposeMesh(currentModelRef.current);
          }

          centerAndScaleModel(mesh);
          sceneRef.current.add(mesh);
          currentModelRef.current = mesh;

          fitCameraToObject(mesh);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error parsing OBJ:", err);
        setLoading(false);
        alert("Error parsing OBJ file. Please make sure it is valid.");
      }
    };

    reader.readAsText(file);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginTop: 40,
        }}
      >
        <label>Select mesh file (.obj):</label>
        <input
          type="file"
          accept=".obj"
          onChange={handleFileChange}
          style={{
            padding: 6,
            borderRadius: 8,
            border: "1px solid #444",
            background: "#222",
            color: "#eee",
          }}
        />
      </div>

      <p style={{ fontSize: 12, opacity: 0.7 }}>
        After uploading, drag to rotate and scroll to zoom.
      </p>

      {fileName && (
        <p style={{ fontSize: 11, opacity: 0.8 }}>
          Loaded: {fileName} ({fileSize})
        </p>
      )}

      {loading && (
        <p style={{ fontSize: 12, opacity: 0.8 }}>Loading OBJ...</p>
      )}

      <div
        ref={containerRef}
        style={{
          width: "80vw",
          maxWidth: 1100,
          height: "70vh",
          borderRadius: 24,
          overflow: "hidden",
          background:
            "radial-gradient(circle at center, #333333, #000000)",
        }}
      />
    </div>
  );
};

export default Viewer;
