import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

interface ThreeJsContainerProps {
  length: number;
  width: number;
  height: number;
  className?: string;
}

export default function ThreeJsContainer({ length, width, height, className }: ThreeJsContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const boxRef = useRef<THREE.Mesh | null>(null);

  // Set up the scene
  useEffect(() => {
    if (!containerRef.current) return;

    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1f2937);
    sceneRef.current = scene;

    // Create camera
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(15, 10, 15);
    cameraRef.current = camera;

    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Add orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controlsRef.current = controls;

    // Add grid
    const gridHelper = new THREE.GridHelper(30, 30);
    scene.add(gridHelper);

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    scene.add(directionalLight);

    // Function to animate the scene
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };

    // Start animation
    animate();

    // Clean up on unmount
    return () => {
      if (containerRef.current && rendererRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      rendererRef.current?.dispose();
    };
  }, []);

  // Update the box dimensions when props change
  useEffect(() => {
    if (!sceneRef.current) return;

    // Remove existing box if it exists
    if (boxRef.current) {
      sceneRef.current.remove(boxRef.current);
    }

    // Create the cargo container box
    const geometry = new THREE.BoxGeometry(length, height, width);
    
    // Create materials with different colors for each face
    const materials = [
      new THREE.MeshStandardMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.7 }), // Right
      new THREE.MeshStandardMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.7 }), // Left
      new THREE.MeshStandardMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.7 }), // Top
      new THREE.MeshStandardMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.7 }), // Bottom
      new THREE.MeshStandardMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.7 }), // Front
      new THREE.MeshStandardMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.7 })  // Back
    ];
    
    // Create the box with the materials
    const box = new THREE.Mesh(geometry, materials);
    
    // Position the box to center it on the grid
    box.position.set(0, height / 2, 0);
    
    // Add edges to the box for better visibility
    const edges = new THREE.EdgesGeometry(geometry);
    const line = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({ color: 0xffffff })
    );
    line.position.copy(box.position);
    
    // Add box and edges to the scene
    sceneRef.current.add(box);
    sceneRef.current.add(line);
    
    // Save reference to box
    boxRef.current = box;
    
  }, [length, width, height]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      
      cameraRef.current.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className={`w-full h-full ${className || ''}`}
      style={{ minHeight: '300px' }}
    />
  );
}
