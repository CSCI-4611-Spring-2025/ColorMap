#version 300 es

precision mediump float;

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

in vec3 positionModel;
in vec3 normalModel;
in vec4 color;
in vec2 texCoords;

out vec4 interpColor;
out vec2 interpTexCoords;

void main()  {
    gl_Position = vec4(0,0,0,1);
}
