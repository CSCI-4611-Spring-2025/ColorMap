/* Assignment 5: Artistic Rendering
 * Original C++ implementation by UMN CSCI 4611 Instructors, 2012+
 * GopherGfx implementation by Evan Suma Rosenberg <suma@umn.edu>, 2022-2024
 * License: Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * PUBLIC DISTRIBUTION OF SOURCE CODE OUTSIDE OF CSCI 4611 IS PROHIBITED
 */ 

// You only need to modify the shaders for this assignment.
// You do not need to write any TypeScript code unless
// you are planning to add wizard functionality.

// @ts-ignore
import colorMapVertexShader from './shaders/mycolormap.vert'
// @ts-ignore
import colorMapFragmentShader from './shaders/mycolormap.frag'

import * as gfx from 'gophergfx'

export class MyColorMapMaterial extends gfx.Material3
{
    public static shader = new gfx.ShaderProgram(colorMapVertexShader, colorMapFragmentShader);
    public static tangentBuffers: Map<gfx.Mesh3, WebGLBuffer> = new Map();

    public texture: gfx.Texture | null;
    public colorMap: gfx.Texture | null;
    public normalMap: gfx.Texture | null;
    public ambientColor: gfx.Color;
    public diffuseColor: gfx.Color;
    public specularColor: gfx.Color;
    public shininess: number;

    private kAmbientUniform: WebGLUniformLocation | null;
    private kDiffuseUniform: WebGLUniformLocation | null;
    private kSpecularUniform: WebGLUniformLocation | null;
    private shininessUniform: WebGLUniformLocation | null;
    
    private textureUniform: WebGLUniformLocation | null;
    private useTextureUniform: WebGLUniformLocation | null;

    private colorMapUniform: WebGLUniformLocation | null;
    private usecolorMapUnifirom: WebGLUniformLocation | null;
    private normalMapUniform: WebGLUniformLocation | null;
    private useNormalMapUnifirom: WebGLUniformLocation | null;

    private eyePositionUniform: WebGLUniformLocation | null;
    private modelUniform: WebGLUniformLocation | null;
    private viewUniform: WebGLUniformLocation | null;
    private projectionUniform: WebGLUniformLocation | null;
    private normalUniform: WebGLUniformLocation | null;

    private numLightsUniform: WebGLUniformLocation | null;
    private lightTypesUniform: WebGLUniformLocation | null;
    private lightPositionsUniform: WebGLUniformLocation | null;
    private ambientIntensitiesUniform: WebGLUniformLocation | null;
    private diffuseIntensitiesUniform: WebGLUniformLocation | null;
    private specularIntensitiesUniform: WebGLUniformLocation | null;

    private positionAttribute: number;
    private normalAttribute: number;
    private tangentAttribute: number;
    private colorAttribute: number;
    private texCoordAttribute: number;

    constructor()
    {
        super();

        this.texture = null;
        this.colorMap = null;
        this.normalMap = null;
        this.ambientColor = new gfx.Color(1, 1, 1);
        this.diffuseColor = new gfx.Color(1, 1, 1);
        this.specularColor = new gfx.Color(0, 0, 0);
        this.shininess = 30;

        MyColorMapMaterial.shader.initialize(this.gl);

        this.kAmbientUniform = MyColorMapMaterial.shader.getUniform(this.gl, 'kAmbient');
        this.kDiffuseUniform = MyColorMapMaterial.shader.getUniform(this.gl, 'kDiffuse');
        this.kSpecularUniform = MyColorMapMaterial.shader.getUniform(this.gl, 'kSpecular');
        this.shininessUniform = MyColorMapMaterial.shader.getUniform(this.gl, 'shininess');

        this.textureUniform = MyColorMapMaterial.shader.getUniform(this.gl, 'surfaceTexture');
        this.useTextureUniform = MyColorMapMaterial.shader.getUniform(this.gl, 'useTexture');

        this.colorMapUniform = MyColorMapMaterial.shader.getUniform(this.gl, 'colorMap');
        this.usecolorMapUnifirom = MyColorMapMaterial.shader.getUniform(this.gl, 'usecolorMap');
        this.normalMapUniform = MyColorMapMaterial.shader.getUniform(this.gl, 'normalMap');
        this.useNormalMapUnifirom = MyColorMapMaterial.shader.getUniform(this.gl, 'useNormalMap');

        this.eyePositionUniform = MyColorMapMaterial.shader.getUniform(this.gl, 'eyePositionWorld');
        this.viewUniform = MyColorMapMaterial.shader.getUniform(this.gl, 'viewMatrix');
        this.modelUniform = MyColorMapMaterial.shader.getUniform(this.gl, 'modelMatrix');
        this.projectionUniform = MyColorMapMaterial.shader.getUniform(this.gl, 'projectionMatrix');
        this.normalUniform = MyColorMapMaterial.shader.getUniform(this.gl, 'normalMatrix');

        this.numLightsUniform = MyColorMapMaterial.shader.getUniform(this.gl, 'numLights');
        this.lightTypesUniform = MyColorMapMaterial.shader.getUniform(this.gl, 'lightTypes');
        this.lightPositionsUniform = MyColorMapMaterial.shader.getUniform(this.gl, 'lightPositionsWorld');
        this.ambientIntensitiesUniform = MyColorMapMaterial.shader.getUniform(this.gl, 'lightAmbientIntensities');
        this.diffuseIntensitiesUniform = MyColorMapMaterial.shader.getUniform(this.gl, 'lightDiffuseIntensities');
        this.specularIntensitiesUniform = MyColorMapMaterial.shader.getUniform(this.gl, 'lightSpecularIntensities');

        this.positionAttribute = MyColorMapMaterial.shader.getAttribute(this.gl, 'positionModel');
        this.normalAttribute = MyColorMapMaterial.shader.getAttribute(this.gl, 'normalModel');
        this.tangentAttribute = MyColorMapMaterial.shader.getAttribute(this.gl, 'tangentModel');
        this.colorAttribute = MyColorMapMaterial.shader.getAttribute(this.gl, 'color');
        this.texCoordAttribute = MyColorMapMaterial.shader.getAttribute(this.gl, 'texCoords');   
    }

    draw(mesh: gfx.Mesh3, camera: gfx.Camera, lightManager: gfx.LightManager): void
    {
        if(!this.visible || mesh.triangleCount == 0)
            return;

        this.initialize();

        // Switch to this shader
        this.gl.useProgram(MyColorMapMaterial.shader.getProgram());

        // If we don't have a tbm matrix for this mesh yet, then compute it
        if(!MyColorMapMaterial.tangentBuffers.get(mesh))
        {
            this.updateTangentBuffers(mesh);
        }

        // Set the camera uniforms
        const cameraPosition = new gfx.Vector3();
        cameraPosition.transformPoint(camera.localToWorldMatrix);
        this.gl.uniform3f(this.eyePositionUniform, cameraPosition.x, cameraPosition.y, cameraPosition.z);
        this.gl.uniformMatrix4fv(this.modelUniform, false, mesh.localToWorldMatrix.mat);
        this.gl.uniformMatrix4fv(this.viewUniform, false, camera.viewMatrix.mat);
        this.gl.uniformMatrix4fv(this.projectionUniform, false, camera.projectionMatrix.mat);
        this.gl.uniformMatrix4fv(this.normalUniform, false, mesh.localToWorldMatrix.getInverse().getTranspose().mat);

        // Set the material property uniforms
        this.gl.uniform3f(this.kAmbientUniform, this.ambientColor.r, this.ambientColor.g, this.ambientColor.b);
        this.gl.uniform3f(this.kDiffuseUniform, this.diffuseColor.r, this.diffuseColor.g, this.diffuseColor.b);
        this.gl.uniform3f(this.kSpecularUniform,this.specularColor.r, this.specularColor.g, this.specularColor.b);
        this.gl.uniform1f(this.shininessUniform, this.shininess);

        // Set the light uniforms
        this.gl.uniform1i(this.numLightsUniform, lightManager.getNumLights());
        this.gl.uniform1iv(this.lightTypesUniform, lightManager.lightTypes);
        this.gl.uniform3fv(this.lightPositionsUniform, lightManager.lightPositions);
        this.gl.uniform3fv(this.ambientIntensitiesUniform, lightManager.ambientIntensities);
        this.gl.uniform3fv(this.diffuseIntensitiesUniform, lightManager.diffuseIntensities);
        this.gl.uniform3fv(this.specularIntensitiesUniform, lightManager.specularIntensities);

        // Set the vertex positions
        if (this.positionAttribute != -1) {
            this.gl.enableVertexAttribArray(this.positionAttribute);
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, mesh.positionBuffer);
            this.gl.vertexAttribPointer(this.positionAttribute, 3, this.gl.FLOAT, false, 0, 0);
        }

        // Set the vertex normals
        if (this.normalAttribute != -1) {
            this.gl.enableVertexAttribArray(this.normalAttribute);
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, mesh.normalBuffer);
            this.gl.vertexAttribPointer(this.normalAttribute, 3, this.gl.FLOAT, false, 0, 0);
        }

        // Set the vertex tangents
        if (this.tangentAttribute != -1) {
            this.gl.enableVertexAttribArray(this.tangentAttribute);
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, MyColorMapMaterial.tangentBuffers.get(mesh) as WebGLBuffer);
            this.gl.vertexAttribPointer(this.tangentAttribute, 3, this.gl.FLOAT, false, 0, 0);
        }

        // Set the vertex colors
        if (this.colorAttribute != -1) {
            if (mesh.hasVertexColors) {
                this.gl.enableVertexAttribArray(this.colorAttribute);
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, mesh.colorBuffer);
                this.gl.vertexAttribPointer(this.colorAttribute, 4, this.gl.FLOAT, false, 0, 0);
            }
            else {
                this.gl.disableVertexAttribArray(this.colorAttribute);
                this.gl.vertexAttrib4f(this.colorAttribute, 1, 1, 1, 1);
            }
        }

        if (this.texture) {
            // Activate the texture in the shader
            this.gl.uniform1i(this.useTextureUniform, 1);

            // Set the texture
            this.gl.activeTexture(this.gl.TEXTURE0)
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture.texture);
            this.gl.uniform1i(this.textureUniform, 0);
        }
        else {
            // Disable the texture in the shader
            this.gl.uniform1i(this.useTextureUniform, 0);
        }

                
        if (this.colorMap) {
            // Activate the normal map in the shader
            this.gl.uniform1i(this.usecolorMapUnifirom, 1);

            // Set the normal map
            this.gl.activeTexture(this.gl.TEXTURE1);
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.colorMap.texture);
            this.gl.uniform1i(this.colorMapUniform, 1);
        }
        else {
            // Disable the normal map in the shader
            this.gl.uniform1i(this.usecolorMapUnifirom, 0);
        }

        if (this.normalMap) {
            // Activate the normal map in the shader
            this.gl.uniform1i(this.useNormalMapUnifirom, 1);

            // Set the normal map
            this.gl.activeTexture(this.gl.TEXTURE2);
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.normalMap.texture);
            this.gl.uniform1i(this.normalMapUniform, 2);
        }
        else {
            // Disable the normal map in the shader
            this.gl.uniform1i(this.useNormalMapUnifirom, 0);
        }

        if (this.texture || this.colorMap || this.normalMap) {
            // Set the texture coordinates
            if (this.texCoordAttribute != -1) {
                this.gl.enableVertexAttribArray(this.texCoordAttribute);
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, mesh.texCoordBuffer);
                this.gl.vertexAttribPointer(this.texCoordAttribute, 2, this.gl.FLOAT, false, 0, 0);
            }
        }
        else {
            if (this.texCoordAttribute != -1) {
                this.gl.disableVertexAttribArray(this.texCoordAttribute);
            }
        }

        // Draw the triangles
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer);
        this.gl.drawElements(this.gl.TRIANGLES, mesh.triangleCount*3, this.gl.UNSIGNED_SHORT, 0);
    }

    // based on method described at: https://learnopengl.com/Advanced-Lighting/Normal-Mapping#:~:text=Advanced%2DLighting%2FNormal%2DMapping
    public updateTangentBuffers(mesh: gfx.Mesh3): void
    {
        const vertices = mesh.getVertices();
        const uvs = mesh.getTextureCoordinates();
        const indices = mesh.getIndices();

        // Create an array of vectors to hold the tangents
        const tangents: gfx.Vector3[] = [];
        for(let i=0; i < vertices.length/3; i++)
        {
            tangents.push(new gfx.Vector3(0, 0, 0));
        }

        // Compute tangents
        for(let i=0; i < indices.length; i+=3)
        {
            const v1 = indices[i];
            const v2 = indices[i+1];
            const v3 = indices[i+2];

            const pos1 = new gfx.Vector3(vertices[v1*3], vertices[v1*3+1], vertices[v1*3+2]);
            const pos2 = new gfx.Vector3(vertices[v2*3], vertices[v2*3+1], vertices[v2*3+2]);
            const pos3 = new gfx.Vector3(vertices[v3*3], vertices[v3*3+1], vertices[v3*3+2]);

            const uv1 = new gfx.Vector2(uvs[v1*2], uvs[v1*2+1]);
            const uv2 = new gfx.Vector2(uvs[v2*2], uvs[v2*2+1]);
            const uv3 = new gfx.Vector2(uvs[v3*2], uvs[v3*2+1]);


            const edge1 = gfx.Vector3.subtract(pos2, pos1);
            const edge2 = gfx.Vector3.subtract(pos3, pos1);

            const deltaUV1 = gfx.Vector2.subtract(uv2, uv1);
            const deltaUV2 = gfx.Vector2.subtract(uv3, uv1);

            const f = 1 / (deltaUV1.x * deltaUV2.y - deltaUV2.x * deltaUV1.y);

            const tangent = new gfx.Vector3();
            tangent.x = f * (deltaUV2.y * edge1.x - deltaUV1.y * edge2.x);
            tangent.y = f * (deltaUV2.y * edge1.y - deltaUV1.y * edge2.y);
            tangent.z = f * (deltaUV2.y * edge1.z - deltaUV1.y * edge2.z);
            tangent.normalize();

            tangents[v1].add(tangent);
            tangents[v2].add(tangent);
            tangents[v3].add(tangent);
        }

        // Create the tangent buffer if it does not already exist
        let tangentBuffer: WebGLBuffer | null | undefined;
        tangentBuffer = MyColorMapMaterial.tangentBuffers.get(mesh);

        if(!tangentBuffer)
        {
            tangentBuffer = this.gl.createBuffer();
            
            if(tangentBuffer)
                MyColorMapMaterial.tangentBuffers.set(mesh, tangentBuffer);
        }

        const tangentArray: number[] = [];
        tangents.forEach((elem: gfx.Vector3) =>
        {
            elem.normalize();
            tangentArray.push(elem.x, elem.y, elem.z);
        });
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, tangentBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(tangentArray), this.gl.STATIC_DRAW);
    }

    setColor(color: gfx.Color): void
    {
        this.ambientColor.copy(color);
        this.diffuseColor.copy(color);
        this.specularColor.copy(color);
    }

    getColor(): gfx.Color
    {
        return this.diffuseColor;
    }
}