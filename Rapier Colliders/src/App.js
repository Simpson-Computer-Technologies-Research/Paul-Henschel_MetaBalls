import * as THREE from 'three';
import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import { InstancedRigidBodies, Physics, RigidBody } from '@react-three/rapier';
import { easing } from 'maath';

function Scene() {
    const Vec = new THREE.Vector3();

    // Get random float for sphere positions
    const RFS = THREE.MathUtils.randFloatSpread;
    const SpherePositions = Array.from({ length: 15 }, () => [/* x */ RFS(10), /* y */ RFS(10), /* z */ RFS(10)]);

    // Store reference
    const Ref = useRef();

    // For each frame
    useFrame((_, delta) => Ref.current.forEach((sphere) => sphere.applyImpulse(Vec
		// Get sphere's current position
		.copy(sphere.translation())
		.normalize()

		// Multiply it by a scalar
		.multiplyScalar(-400 * delta),
    )));
    
    // InstancedRigidBodies is multiple rigid bodies
    return (
        <InstancedRigidBodies ref={Ref} linearDamping={0.65} angularDamping={0.95} positions={SpherePositions}>

			{ /* 15 different sphere objects */ }
            <instancedMesh args={[undefined, undefined, 15]}>
                <sphereGeometry />
            </instancedMesh>
			
        </InstancedRigidBodies>
    )
}

function Pointer() {
    const Vec = new THREE.Vector3();
    const Ref = useRef();

    useFrame(({ mouse, viewport }, delta) => {
        easing.damp3(
			Vec, [
				/* x */ (mouse.x * viewport.width) / 2, 
				/* y */ (mouse.y * viewport.height) / 2, 
				/* z */ 0
			], 0.1, delta, Infinity
		);
        Ref.current.setNextKinematicTranslation(Vec);
    });

    return (
        <RigidBody type="kinematicPosition" ref={Ref}>
            <Sphere/>
        </RigidBody>
    );
}

export default function App() {
	return (
		<Canvas camera={{ position: [0, 0, 20], fov: 35, near: 1, far: 40 }}>
			<Physics gravity={[0, 2, 0]}>
				<Scene />
				<Pointer />
			</Physics>
		</Canvas>
	)
}
