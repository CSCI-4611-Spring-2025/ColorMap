#version 300 es


precision mediump float;

uniform int useTexture;
uniform sampler2D surfaceTexture;

in vec4 interpColor;
in vec2 interpTexCoords;

// OUTPUT
out vec4 fragColor;

void main() {
    fragColor = vec4(1,0,0,1);
    fragColor = interpColor;
    if (useTexture != 0) {
        fragColor *= texture(surfaceTexture, interpTexCoords);
    }

}
