/* Assignment 3: Earthquake Visualization
 * Concept and C++ implementation by Daniel Keefe and TAs, 2012+
 * GopherGfx implementation by Evan Suma Rosenberg <suma@umn.edu> 2022
 * License: Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * PUBLIC DISTRIBUTION OF SOURCE CODE OUTSIDE OF CSCI 4611 IS PROHIBITED
 */

import * as gfx from 'gophergfx'
import { GUI } from 'dat.gui'

export class App extends gfx.GfxApp
{

    // State variables
    private currentTime: number;

    // GUI variables
    public gui: GUI;
    public viewMode: string;
    public displayMode: string;


    // --- Create the App class ---
    constructor()
    {
        // initialize the base class gfx.GfxApp
        super();

        this.currentTime = Infinity;

        this.gui = new GUI();
        this.viewMode = 'Map';

        this.displayMode = 'Textured';
    }


    // --- Initialize the graphics scene ---
    createScene(): void 
    {
        // Setup camera
        this.camera.setPerspectiveCamera(60, 2, 0.1, 50)
        this.camera.position.set(0, 0, 3.25);
        this.camera.lookAt(gfx.Vector3.ZERO);

        // Create a directional light
        const directionalLight = new gfx.DirectionalLight(new gfx.Vector3(1.5, 1.5, 1.5));
        directionalLight.position.set(10, 10, 15);
        this.scene.add(directionalLight);

        // Set the background image
        const background = gfx.Geometry2Factory.createRect(2, 2);
        background.material.texture = new gfx.Texture('./assets/stars.png');
        background.layer = 1;
        this.scene.add(background);

        // Create a new GUI folder to hold earthquake controls
        const controls = this.gui.addFolder('Controls');

        // Create a GUI control for the view mode and add a change event handler
        const viewController = controls.add(this, 'viewMode', {Map: 'Map', Globe: 'Globe'});
        viewController.name('View Mode');
        viewController.onChange((value: string) => { /*this.earth.globeMode = value == 'Globe'*/ });

        // Create a GUI control for the debug mode and add a change event handler
        const debugController = controls.add(this, 'displayMode', ['Textured', 'Wireframe', 'Vertices']);
        debugController.name('Display Mode');
        debugController.onChange((value: string) => { /*this.earth.changeDisplayMode(value)*/ });

        // Make the GUI controls wider and open by default
        this.gui.width = 300;
        controls.open();
    }

    
    // --- Update is called once each frame by the main graphics loop ---
    update(deltaTime: number): void 
    {
    }


    // Mouse event handler for wizard functionality
    onMouseMove(event: MouseEvent): void
    {
        if (event.buttons == 1) {
            //this.earth.mouseRotation.multiply(gfx.Quaternion.makeRotationX(event.movementY *  0.01));
        }
    }

    // Mouse event handler for wizard functionality
    onMouseWheel(event: WheelEvent): void 
    {
        this.camera.position.z += event.deltaY * 0.001;
        this.camera.position.z = gfx.MathUtils.clamp(this.camera.position.z, 1.5, 3.25);
    }
}