function getRandomArbitrary(min, max) {
    return Math.round(Math.random() * (max - min) + min);
}

function getLotto(){
    r = []
    while(r.length < 6) {
        n = getRandomArbitrary(1,45);
    
        if(!r.find((x)=>x==n)){
            r.push(n)
        }
    }

}

getLotto()
