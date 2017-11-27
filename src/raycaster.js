/* Return the distance from O to the intersection of the ray (O, D) with the
   sphere (S, R), or +inf if there is no intersection.
   O and S are 3D points, D (direction) is a normalized vector, R is a scalar. */

function intersectSphere(o, d, s, r) {
    let a = dotProduct(d, d)
    let os = subtract(o, s)
    let b = 2   * dotProduct(d, os)
    let c = dotProduct(os, os) - r*r
    let disc = b*b - 4*a*c
    if (disc > 0) {
        let distSqrt = Math.sqrt(disc)
        let q = (b < 0) ? (-b - distSqrt) / 2.0 : (-b + distSqrt) / 2.0

        let t0 = q / a
        let t1 = c / q
        t0 = Math.min(t0, t1)
        t1 = Math.max(t0, t1)
        if (t1 >= 0) {
            return (t0 < 0) ? t1 : t0
        }
    }
    return Infinity
}

// Compute reflection r = i - 2(i.n)n
function reflect(i, n) {
    return subtract(i, multiplyVectorByScalar(n, 2*dotProduct(i, n)) )
}

function raycast(ray, direction, depth, objects, rays) {
    for (let obj of objects) {

        let i = intersectSphere(ray, direction, obj.center, obj.radius)
        console.log('i', i)
        console.log(obj.center)
        console.log(obj.radius)
        //rays.push([ray, direction])

        
        if (i !== Infinity) {
            console.log('Ray '+ ray+ ' with direction '+ direction+ ' intersected sphere of radius '+ obj.radius+ ' centered at '+ obj.center)

            
            
            
            let incident = multiplyVectorByScalar(direction,i)

            console.log("incident")
            console.log(incident)
            
            let intersection = add(ray, incident)
            console.log("intersection")
            console.log(intersection)

            
            rays.push([ray, intersection])




            let normal = normalizeRet(subtract( obj.center,intersection))
            console.log("normal")
            console.log(normal)
            
            
            let reflection = reflect(incident, normal)
            console.log("reflection")
            console.log(reflection)
            
            rays.push([intersection, multiplyVectorByScalar(normal,10)])
            
            let away = add(intersection,reflection)
            console.log("away")
            console.log(away)

            rays.push([intersection, away])


            return raycast(intersection, normal, depth-1, objects, rays)
        }
    }
}

