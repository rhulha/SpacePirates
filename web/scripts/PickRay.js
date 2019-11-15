define(["glMatrix"], function(glmat){

// http://stackoverflow.com/questions/3235385/given-a-bounding-box-and-a-line-two-points-determine-if-the-line-intersects-t

// all args are Vec3, Hit will be filled by this algo
// returns the side where we hit the cube

var currentHit = vec3.create();
var currentDist;
var currentSide;

function checkLineBox( B1, B2, L1, L2, Hit)
{
    if (L2[0] < B1[0] && L1[0] < B1[0]) return -1;
    if (L2[0] > B2[0] && L1[0] > B2[0]) return -2;
    if (L2[1] < B1[1] && L1[1] < B1[1]) return -3;
    if (L2[1] > B2[1] && L1[1] > B2[1]) return -4;
    if (L2[2] < B1[2] && L1[2] < B1[2]) return -5;
    if (L2[2] > B2[2] && L1[2] > B2[2]) return -6;

    // this is the special case when the line start is in the box.
    // I don't like that it's returning here without still calculating the intersection hit point
    // I wonder if I could remove it.
    if (L1[0] > B1[0] && L1[0] < B2[0] &&
        L1[1] > B1[1] && L1[1] < B2[1] &&
        L1[2] > B1[2] && L1[2] < B2[2])
    {
        vec3.set( L1, Hit);
        console.log("this sucks");
        return 1;
    }

    currentDist = 100000;
    currentSide = 0;
    if (getIntersection(L1[0] - B1[0], L2[0] - B1[0], L1, L2, Hit) && inBox(Hit, B1, B2, 1))
    {
        var d = vec3.dist(  L1, Hit);
        if( d < currentDist )
        {
            currentDist = d;
            currentSide = 1; // LEFT
            vec3.set( Hit, currentHit);
        }
    }
    if (getIntersection(L1[1] - B1[1], L2[1] - B1[1], L1, L2, Hit) && inBox(Hit, B1, B2, 2))
    {
        var d = vec3.dist(  L1, Hit);
        if( d < currentDist )
        {
            currentDist = d;
            currentSide = 2;  // BOTTOM
            vec3.set( Hit, currentHit);
        }
    }
    if (getIntersection(L1[2] - B1[2], L2[2] - B1[2], L1, L2, Hit) && inBox(Hit, B1, B2, 3))
    {
        var d = vec3.dist(  L1, Hit);
        if( d < currentDist )
        {
            currentDist = d;
            currentSide = 3;  // FRONT
            vec3.set( Hit, currentHit);
        }
    }
    if (getIntersection(L1[0] - B2[0], L2[0] - B2[0], L1, L2, Hit) && inBox(Hit, B1, B2, 1))
    {
        var d = vec3.dist(  L1, Hit);
        if( d < currentDist )
        {
            currentDist = d;
            currentSide = 4;  // RIGHT
            vec3.set( Hit, currentHit);
        }
    }
    if (getIntersection(L1[1] - B2[1], L2[1] - B2[1], L1, L2, Hit) && inBox(Hit, B1, B2, 2))
    {
        var d = vec3.dist(  L1, Hit);
        if( d < currentDist )
        {
            currentDist = d;
            currentSide = 5; // TOP
            vec3.set( Hit, currentHit);
        }
    }
    if (getIntersection(L1[2] - B2[2], L2[2] - B2[2], L1, L2, Hit) && inBox(Hit, B1, B2, 3))
    {
        var d = vec3.dist(  L1, Hit);
        if( d < currentDist )
        {
            currentDist = d;
            currentSide = 6; // BACK
            vec3.set( Hit, currentHit);
        }
    }

    if( currentSide > 0)
    {
        vec3.set( currentHit, Hit);
    }
    return currentSide;
}

var temp = vec3.create();
function getIntersection( fDst1, fDst2, P1, P2, Hit)
{
    if ((fDst1 * fDst2) >= 0) return false;
    if (fDst1 == fDst2) return false;

    vec3.subtract(P2, P1, temp);
    vec3.scale( temp, (-fDst1 / (fDst2 - fDst1)));
    vec3.add( temp, P1, Hit);

    return true;
}

function inBox(Hit, B1, B2, Axis)
{
    if (Axis == 1 && Hit[2] > B1[2] && Hit[2] < B2[2] && Hit[1] > B1[1] && Hit[1] < B2[1]) return true;
    if (Axis == 2 && Hit[2] > B1[2] && Hit[2] < B2[2] && Hit[0] > B1[0] && Hit[0] < B2[0]) return true;
    if (Axis == 3 && Hit[0] > B1[0] && Hit[0] < B2[0] && Hit[1] > B1[1] && Hit[1] < B2[1]) return true;
    return false;
}

return {
    checkLineBox : checkLineBox
};


});