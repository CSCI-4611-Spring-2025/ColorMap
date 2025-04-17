/* Assignment 3: Earthquake Visualization
 * Concept and C++ implementation by Daniel Keefe and TAs, 2012+
 * GopherGfx implementation by Evan Suma Rosenberg <suma@umn.edu> 2022
 * License: Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * PUBLIC DISTRIBUTION OF SOURCE CODE OUTSIDE OF CSCI 4611 IS PROHIBITED
 */

import * as gfx from 'gophergfx'
import { GUI } from 'dat.gui'
import { MyGeometry3Factory } from './MyGeometry3Factory';
import { Arrow } from './Arrow'
import { MyTriangleMaterial } from './MyTriangleMaterial';
import { MyPhongMaterial } from './MyPhongMaterial';
import { MyColorMapMaterial } from './MyColorMapMaterial';

export class App extends gfx.GfxApp
{
    protected readonly gl: WebGL2RenderingContext;

    // State variables
    private currentTime: number;

    // GUI variables
    public gui: GUI;
    public viewMode: string;
    public displayMode: string;

    public object : gfx.Mesh3;
    //public normalNode = new gfx.Node3();
    public normalMeshes : gfx.Node3[] = []
    public texture : gfx.Texture;

    private cameraControls: gfx.OrbitControls;

    // --- Create the App class ---
    constructor()
    {
        // initialize the base class gfx.GfxApp
        super();
        
        this.gl  = this.renderer.gl;
        
        this.cameraControls = new gfx.OrbitControls(this.camera);

        this.currentTime = Infinity;

        this.gui = new GUI();
        this.viewMode = 'No';
        this.displayMode = 'Textured';
    }


    // --- Initialize the graphics scene ---
    createScene(): void 
    {
        // Setup camera
        this.camera.setPerspectiveCamera(60, 2, 0.1, 50)
        this.camera.position.set(0, 0, 3.25);
        this.camera.lookAt(gfx.Vector3.ZERO);

        this.cameraControls.setDistance(4);
        this.cameraControls.zoomSpeed = 0.1;
        //this.cameraControls.setOrbit(-30 * Math.PI / 180, 15 * Math.PI / 180);

        // Create a directional light
        const directionalLight = new gfx.DirectionalLight(new gfx.Vector3(0.9, 0.9, 0.9));
        directionalLight.position.set(10, 10, 15);
        this.scene.add(directionalLight);
        const ambientLight = new gfx.AmbientLight(new gfx.Color(0.25, 0.25, 0.25));
        this.scene.add(ambientLight);
        const pointLight = new gfx.PointLight(new gfx.Color(0.6, 0.6, 0.6));
        this.scene.add(pointLight);
        pointLight.position = new gfx.Vector3(10, 10, 10);

        // Set the background image
        const background = gfx.Geometry2Factory.createRect(2, 2);
        background.material.texture = new gfx.Texture('./assets/stars.png');
        background.layer = 1;
        this.scene.add(background);

        // Create a new GUI folder to hold earthquake controls
        const controls = this.gui.addFolder('Controls');

        // Create a GUI control for the view mode and add a change event handler
        const viewController = controls.add(this, 'viewMode',  ['No', 'Yes']);
        viewController.name('Show Normals');
        viewController.onChange((value: string) => { 
            for (let i = 0; i < this.normalMeshes.length; i++) {
                if (value == 'No') {
                    this.normalMeshes[i].visible = false;
                }
                else {
                    this.normalMeshes[i].visible = true;
                }
            }
        });

        // Create a GUI control for the debug mode and add a change event handler
        const debugController = controls.add(this, 'displayMode', ['Shaded', 'Textured']);
        debugController.name('Display Mode');
        debugController.onChange((value: string) => { this.changeDisplayMode(value) });

        // Make the GUI controls wider and open by default
        this.gui.width = 300;
        controls.open();

        this.object = gfx.Geometry3Factory.createSphere(1,4);
        const material = new MyColorMapMaterial();
        this.object.material = material;
        //this.object.setLocalToParentMatrix(gfx.Matrix4.makeRotationZ(Math.PI/8));


        this.texture = new gfx.Texture('./assets/earth-2k.png');
        //this.texture = new gfx.Texture('./assets/height-2k.png');
        this.texture.setMinFilter(true, false); 
        material.texture = this.texture;
        const colorMap = new gfx.Texture('./assets/color_map.png');
        //const colorMap = new gfx.Texture('./assets/bin_color_map.png');
        this.texture.setMinFilter(true, false); 
        material.colorMap = colorMap;

        this.scene.add(this.object);

        const verts = this.object.getVertices();
        const norms = this.object.getNormals();
        for (let i = 0; i < this.object.getNormals().length/3; i++) {
            const vertex = new gfx.Vector3(verts[i*3], verts[i*3+1], verts[i*3+2]);
            const normal = new gfx.Vector3(norms[i*3], norms[i*3+1], norms[i*3+2]);
            const normalMesh = new Arrow();
            normalMesh.position = vertex;
            normalMesh.vector = normal;
            normalMesh.color = gfx.Color.YELLOW;
            normalMesh.scale = new gfx.Vector3(0.2, 0.2, 0.2);
            normalMesh.visible = this.viewMode == "Yes";
            this.normalMeshes.push(normalMesh);
            this.scene.add(normalMesh);
        }
    }

    
    // --- Update is called once each frame by the main graphics loop ---
    update(deltaTime: number): void 
    {
        this.cameraControls.update(deltaTime);
    }

    changeDisplayMode(displayMode : string) {
        this.object.material.texture = null;
        if (displayMode == 'Textured') {
            this.object.material.texture = this.texture;
        }
        else if (displayMode == 'Shaded') {
            this.object.material.materialMode = gfx.MorphMaterialMode.SHADED;
        }
    }

}