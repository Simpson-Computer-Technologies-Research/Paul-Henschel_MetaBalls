import * as THREE from 'three';
import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MarchingCubes, MarchingCube, Bounds } from '@react-three/drei';
import { Physics, RigidBody, BallCollider } from '@react-three/rapier';

function MetaBall({ color, position }) {
  // ref is for having changeable data that when changed, it updates the scene
  const ref = useRef();

  // Create a new vector3 object
  const vec = new THREE.Vector3();

  // this is like three.js's onupdate function, 
  // when the frame changes, call this code
  useFrame((_, delta) => {
    // delta = about: 0.012700000000186264
    
    // Add the bounce effect to the actual ball (moving the ball)
    ref.current.applyImpulse(
      vec
        // Get the balls current position
        .copy(ref.current.translation())
        .normalize()

        // Multiply it by a scalar
        .multiplyScalar(delta * -0.05),
    );
  });
  
  // RigidBody let's the object squish
  return (
    <RigidBody ref={ref} colliders={false} linearDamping={4} angularDamping={0.95} position={position}>
      
      {/* 
        The actual ball.
          (marching cube is what makes the ball have that color. thus a normal sphere would also work.)  
      */}
      <MarchingCube strength={0.35} subtract={6} color={color} />

      {/* The thing that makes the ball collide with other objects */}
      <BallCollider args={[0.1]} type="dynamic" />
    </RigidBody>
  );
}

// The ball at mouse position
function Pointer() {

  // ref is for having changeable data that when changed, it updates the scene
  const ref = useRef();

  // Create a new vector3 object
  // This is used for setting the ball to the position of
  // the mouse which requires it to be a vector3 object.
  //
  // Declare it up here so it's not constantly creating new
  // vec3 objects (less laggy)
  const vec = new THREE.Vector3();

  // this is like three.js's onupdate function, 
  // when the frame changes, call this code
  useFrame(({ mouse, viewport }) => {

    // Getting mouse position
    const { width, height } = viewport.getCurrentViewport();
    vec.set(mouse.x * (width / 2), mouse.y * (height / 2), 0);

    // Move the ball to the mouse point in a bouncy way
    ref.current.setNextKinematicTranslation(vec);
  });

  // This is the metaball at the mouse position
  return (
    <RigidBody type="kinematicPosition" colliders={false} ref={ref}>

      {/* 
        The actual ball.
          (marching cube is what makes the ball have that color. thus a normal sphere would also work.)  
      */}
      <MarchingCube strength={0.5} subtract={10} color="white" />

      {/* The thing that makes the ball collide with other objects */}
      <BallCollider args={[0.1]} type="dynamic" />
    </RigidBody>
  );
}

export default function App() {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 25 }}>

      { /* Lighting */ }
      <ambientLight intensity={1} />
      <directionalLight intensity={1} />
      <directionalLight intensity={10} position={[-10, -10, -10]} color="purple" />

      {/* Physics let's the object actually move. */}
      <Physics gravity={[0, 2, 0]}>

        {/* Marching Cubes is used to hold multiple marching cubes */}
        <MarchingCubes resolution={64} maxPolyCount={20000} enableUvs={false} enableColors>
          <meshStandardMaterial vertexColors roughness={0} />

          { /* The balls in the middle of screen */ }
          <MetaBall color="red" position={[1, 1, 0.5]} />
          <MetaBall color="blue" position={[-1, -1, -0.5]} />
          <MetaBall color="green" position={[2, 2, 0.5]} />
          <MetaBall color="orange" position={[-2, -2, -0.5]} />
          <MetaBall color="hotpink" position={[3, 3, 0.5]} />
          <MetaBall color="aquamarine" position={[-3, -3, -0.5]} />

          { /* The ball at mouse position */ }
          <Pointer />

        </MarchingCubes>
      </Physics>

      { /* 
        Barrier that when hit, the balls squishes because of it's rigidbody, instead of just dissapearing. 
          The margin is used to set the size of the barrier. the lower the margin, the more zoomed in the
          barrier is.
      */ }
      <Bounds fit clip observe margin={1}>
          <boxGeometry />
      </Bounds>
    </Canvas>
  )
}
