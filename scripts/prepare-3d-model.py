#!/usr/bin/env python3
"""
Medical Anatomical 3D Model Processor for SistemaCitas / VitalSalud EVA Assessment
Usage:
    python scripts/prepare-3d-model.py --input path/to/model.glb --output apps/frontend/public/models/female_anatomy_eva.glb
"""

import argparse
import os
import sys
import numpy as np
import trimesh

ANATOMICAL_LABELS = [
    'head', 'neck', 'chest', 'abdomen', 'back', 'pelvis',
    'leftShoulder', 'rightShoulder', 'leftArm', 'rightArm',
    'leftElbow', 'rightElbow', 'leftHand', 'rightHand',
    'leftThigh', 'rightThigh', 'leftKnee', 'rightKnee',
    'leftCalf', 'rightCalf', 'leftFoot', 'rightFoot'
]

def classify_triangle(xi, yi, zi, target_height=1.70):
    scale_factor = target_height / 1.70
    
    # Head & Neck
    if yi > 0.36 * 1.7 * scale_factor:
        return 'head'
    if yi > 0.30 * 1.7 * scale_factor and abs(xi) <= 0.045 * 1.7 * scale_factor:
        return 'neck'
    
    # Upper extremities (shoulders, arms, elbows, hands)
    if yi > 0.23 * 1.7 * scale_factor and abs(xi) > 0.045 * 1.7 * scale_factor:
        return 'leftShoulder' if xi > 0 else 'rightShoulder'
    if 0.11 * 1.7 * scale_factor <= yi <= 0.23 * 1.7 * scale_factor and abs(xi) > 0.065 * 1.7 * scale_factor:
        return 'leftArm' if xi > 0 else 'rightArm'
    if 0.05 * 1.7 * scale_factor <= yi < 0.11 * 1.7 * scale_factor and abs(xi) > 0.075 * 1.7 * scale_factor:
        return 'leftElbow' if xi > 0 else 'rightElbow'
    if -0.06 * 1.7 * scale_factor <= yi < 0.05 * 1.7 * scale_factor and abs(xi) > 0.08 * 1.7 * scale_factor:
        return 'leftArm' if xi > 0 else 'rightArm'
    if yi < -0.06 * 1.7 * scale_factor and abs(xi) > 0.085 * 1.7 * scale_factor:
        return 'leftHand' if xi > 0 else 'rightHand'
        
    # Torso
    if 0.12 * 1.7 * scale_factor <= yi <= 0.30 * 1.7 * scale_factor:
        return 'chest' if zi >= 0.005 * 1.7 * scale_factor else 'back'
    if -0.05 * 1.7 * scale_factor <= yi < 0.12 * 1.7 * scale_factor:
        return 'abdomen' if zi >= 0.005 * 1.7 * scale_factor else 'back'
        
    # Pelvis
    if -0.18 * 1.7 * scale_factor <= yi < -0.05 * 1.7 * scale_factor:
        return 'pelvis'
        
    # Lower extremities
    if -0.33 * 1.7 * scale_factor <= yi < -0.18 * 1.7 * scale_factor:
        return 'leftThigh' if xi > 0 else 'rightThigh'
    if -0.38 * 1.7 * scale_factor <= yi < -0.33 * 1.7 * scale_factor:
        return 'leftKnee' if xi > 0 else 'rightKnee'
    if -0.46 * 1.7 * scale_factor <= yi < -0.38 * 1.7 * scale_factor:
        return 'leftCalf' if xi > 0 else 'rightCalf'
    return 'leftFoot' if xi > 0 else 'rightFoot'

def process_model(input_path, output_path, target_height=1.70, rotate_y_deg=-90):
    print(f"Loading 3D asset from: {input_path}")
    scene = trimesh.load(input_path)
    
    if isinstance(scene, trimesh.Scene):
        meshes = [m for m in scene.geometry.values() if isinstance(m, trimesh.Trimesh)]
        if not meshes:
            raise ValueError("No Trimesh geometry found in input scene.")
        orig_mesh = trimesh.util.concatenate(meshes) if len(meshes) > 1 else meshes[0]
    else:
        orig_mesh = scene

    print(f"Loaded mesh with {len(orig_mesh.vertices)} vertices and {len(orig_mesh.faces)} faces.")
    
    # Optional rotation
    if rotate_y_deg != 0:
        R = trimesh.transformations.rotation_matrix(np.radians(rotate_y_deg), [0, 1, 0])
        orig_mesh.apply_transform(R)
        
    # Center bounds
    current_bounds = orig_mesh.bounds
    center = (current_bounds[0] + current_bounds[1]) / 2.0
    orig_mesh.vertices -= center
    
    # Scale to target height
    current_height = orig_mesh.bounds[1][1] - orig_mesh.bounds[0][1]
    if current_height > 0:
        scale = target_height / current_height
        orig_mesh.apply_scale(scale)
        print(f"Rescaled model from height {current_height:.3f}m to {target_height:.3f}m (factor {scale:.3f}).")
        
    # Classify triangles into named anatomical submeshes
    tri_centroids = orig_mesh.triangles.mean(axis=1)
    labels = np.array([
        classify_triangle(xi, yi, zi, target_height)
        for xi, yi, zi in zip(tri_centroids[:, 0], tri_centroids[:, 1], tri_centroids[:, 2])
    ])
    
    new_scene = trimesh.Scene()
    unique_labels = sorted(list(set(labels)))
    print(f"Segmenting into {len(unique_labels)} anatomical groups...")
    
    for label in unique_labels:
        mask = (labels == label)
        count = np.sum(mask)
        submesh = orig_mesh.submesh([mask], append=True)
        new_scene.add_geometry(submesh, geom_name=label, node_name=label)
        print(f"  - {label:15}: {count:5} triangles")
        
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    glb_bytes = new_scene.export(file_type='glb')
    with open(output_path, 'wb') as f:
        f.write(glb_bytes)
        
    print(f"[SUCCESS] Exported segmented medical GLB to: {output_path} ({len(glb_bytes)} bytes)")

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Prepare anatomical 3D GLB model for VitalSalud EVA")
    parser.add_argument('--input', default='temp_body.glb', help='Path to source raw GLB model')
    parser.add_argument('--output', default='apps/frontend/public/models/female_anatomy_eva.glb', help='Output path')
    parser.add_argument('--height', type=float, default=1.70, help='Target height in meters')
    parser.add_argument('--rotate-y', type=float, default=-90.0, help='Y rotation in degrees')
    args = parser.parse_args()
    
    process_model(args.input, args.output, args.height, args.rotate_y)
