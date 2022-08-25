#version 120

#define MAX_STEPS 100
#define MAX_DIST 100.
#define SURF_DIST .01

#define SPHERE_COLOR vec3(0.1, 0.8, 1.0)

uniform vec2 u_resolution;
uniform float u_time;


float GetDist(vec3 p) {
    
    float r = 1.0 + 0.1*sin(u_time + p.x*12.0) * sin((u_time * 2.0) + p.y * 12.) * sin(p.z * 12.);
    
    vec4 s = vec4(0, 1, 6, r);

    float sphereDist =  length(p-s.xyz)-s.w;
    sphereDist *= 0.5; // correct artifact
    
    float planeDist = p.y;
    
    //return sphereDist;
    float d = min(sphereDist, planeDist);
    return d;
}



float RayMarch(vec3 ro, vec3 rd) {
    float dO=0.;
    
    for(int i=0; i<MAX_STEPS; i++) {
        vec3 p = ro + rd*dO;
        float dS = GetDist(p);
        dO += dS;
        if(dO>MAX_DIST || dS<SURF_DIST) break;
    }
    
    return dO;
}

vec3 GetNormal(vec3 p) {
    float d = GetDist(p);
    vec2 e = vec2(.01, 0);
    
    vec3 n = d - vec3(
        GetDist(p-e.xyy),
        GetDist(p-e.yxy),
        GetDist(p-e.yyx));
    
    return normalize(n);
}

float GetLight(vec3 p) {
    vec3 lightPos = vec3(2, 5, 2);
    lightPos.xz += vec2(sin(u_time), cos(u_time))*2.;
    vec3 l = normalize(lightPos-p);
    vec3 n = GetNormal(p);
    
    float dif = clamp(dot(n, l), 0., 1.);
    float d = RayMarch(p+n*SURF_DIST*2., l);
    if(d<length(lightPos-p)) dif *= .1;
    
    return dif;
}

float remap01(float a, float b, float t){
    return (t-a)/(b-a);
}

void main()
{
    vec2 uv = (gl_FragCoord.xy - 0.5*u_resolution.xy) / u_resolution.y;
    
    vec3 col = vec3(0);
    
    // camera
    vec3 ro = vec3(0, 1, 0); // ray origine
    vec3 rd = normalize(vec3(uv.x, uv.y, 1.0)); // ray direction
    
    float d = RayMarch(ro, rd);
        
    vec3 p = ro + rd * d;
    
    float dif = GetLight(p);
    
    vec3 colt = mix(vec3(1.,0.5,0.3), vec3(0.7,1.0,0.8), 1.-(1.0-length(uv)));
    col = vec3(dif);
        
    col = pow(col * colt, vec3(.4545));    // gamma correction

    gl_FragColor = vec4(col, 1.0);
}
