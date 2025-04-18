#version 300 es

/* Assignment 5: Artistic Rendering
 * Original C++ implementation by UMN CSCI 4611 Instructors, 2012+
 * GopherGfx implementation by Evan Suma Rosenberg <suma@umn.edu>, 2022-2024
 * License: Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 * PUBLIC DISTRIBUTION OF SOURCE CODE OUTSIDE OF CSCI 4611 IS PROHIBITED
 */ 

precision mediump float;

// constants used to indicate the type of each light
#define POINT_LIGHT 0
#define DIRECTIONAL_LIGHT 1

// max number of simultaneous lights handled by this shader
const int MAX_LIGHTS = 8;


// INPUT FROM UNIFORMS SET WITHIN THE MAIN APPLICATION

// position of the camera in world coordinates
uniform vec3 eyePositionWorld;

// properties of the lights in the scene
uniform int numLights;
uniform int lightTypes[MAX_LIGHTS];
uniform vec3 lightPositionsWorld[MAX_LIGHTS];
uniform vec3 lightAmbientIntensities[MAX_LIGHTS];
uniform vec3 lightDiffuseIntensities[MAX_LIGHTS];
uniform vec3 lightSpecularIntensities[MAX_LIGHTS];

// material properties (coefficents of reflection)
uniform vec3 kAmbient;
uniform vec3 kDiffuse;
uniform vec3 kSpecular;
uniform float shininess;

// texture data
uniform int useTexture;
uniform sampler2D surfaceTexture;


// INPUT FROM THE VERTEX SHADER AFTER INTERPOLATION ACROSS TRIANGLES BY THE RASTERIZER

in vec3 interpPositionWorld;
in vec3 interpNormalWorld;
in vec4 interpColor;
in vec2 interpTexCoords;

// color map data
uniform int usecolorMap;
uniform sampler2D colorMap;
uniform int useNormalMap;
uniform sampler2D normalMap;

// OUTPUT

out vec4 fragColor;


void main() {
    // PART 2.0: In class example

    fragColor = vec4(0,0,0,1);

    // Normalize the interpolated normal vector
    vec3 n = normalize(interpNormalWorld);

    vec3 illumination = vec3(0, 0, 0);
    for(int i=0; i < numLights; i++) {
        // Ambient component
        illumination += kAmbient * lightAmbientIntensities[i];

        // Compute the vector from the vertex position to the light
        vec3 l;
        if (lightTypes[i] == DIRECTIONAL_LIGHT)
            l = normalize(lightPositionsWorld[i]);
        else
            l = normalize(lightPositionsWorld[i] - interpPositionWorld);

        // Diffuse component
        float diffuseIntensity = max(dot(n, l), 0.0);
        illumination += diffuseIntensity * kDiffuse * lightDiffuseIntensities[i];

        // Compute the vector from the vertex to the eye
        vec3 e = normalize(eyePositionWorld - interpPositionWorld);


        // Specular component

        // Compute the light vector reflected about the normal
        vec3 r = reflect(-l, n);
        float specularIntensity = pow(max(dot(e, r), 0.0), shininess);

        // Or, compute the halfway vector for the Blinn-Phong reflection model
        //vec3 h = normalize(l + e);
        //float specularIntensity = pow(max(dot(h, n), 0.0), shininess);

        illumination += specularIntensity * kSpecular * lightSpecularIntensities[i];
    }

    fragColor = interpColor;
    fragColor.rgb *= illumination;


    vec4 color = vec4(1);

    color = texture(surfaceTexture, interpTexCoords);
    float value = color.x;

    vec4 colorMapValue = texture(colorMap, vec2(value, 0.5));
    color = colorMapValue;

    fragColor *= color;
    //fragColor = color;

}
