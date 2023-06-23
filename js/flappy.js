var inputs = {}
var count = 0
var countv = 0
var v = 0

function novoElemento(tagName, className) {
    const elemento = document.createElement(tagName)
    elemento.className = className
    return elemento
}

function Jogador(largura,altura) {

    let frames = ['/img/car_0.png','/img/car_1.png']

    this.elemento = novoElemento('img', 'jogador')
    this.elemento.src = frames[0] 

    this.getY = () => parseInt(this.elemento.style.top.split('px')[0])
    this.setY = y => this.elemento.style.top = `${y}px`
    this.getX = () => parseInt(this.elemento.style.left.split('px')[0])
    this.setX = x => this.elemento.style.left = `${x}px`

    window.onkeydown = e => inputs[e.key] = true;
    window.onkeyup = e => delete inputs[e.key];

    this.setY(altura - 65)
    this.setX(largura / 2 - 60)

    this.animar = () => {
        this.elemento.src = (v < 1 ? frames[0] : frames[Math.floor((count%(2*(10 - v+1))/(1*(10 - v+1))))])
        if (inputs['a'] == true){
            this.setX(this.getX() - v*0.6)
        }
        if (inputs['d'] == true){
            this.setX(this.getX() + v*0.6)
        }
        if (inputs['s'] == true){
            v -= 0.2
        }
        if (inputs[' '] == true){
            v += 0.5
        }

        v = (v > 10 ? 10 : v)
        v = (v < 0 ? 0 : v)
    }
}

function criarlinha(x1,y1,x2,y2,id) {

    let d = Math.sqrt(((x1 - x2)*(x1 - x2)) + ((y1 - y2) *(y1 - y2)))
    this.elemento = novoElemento('div',id)
    this.elemento.style.width = d + "px"
    this.elemento.style.top = (y1+y2)/2 + "px"
    this.elemento.style.left = ((x1+x2)/2 - d/2) + "px"
    this.elemento.style.transform = "rotate("+((Math.atan2(y1-y2,x1-x2)*180)/Math.PI)+"deg)"
    this.points = [x1,y1,x2,y2]
    this.animar = (x1,y1,x2,y2) => {
        d = Math.sqrt(((x1 - x2)*(x1 - x2)) + ((y1 - y2) *(y1 - y2)))
        this.elemento.style.width = d + "px"
        this.elemento.style.top = (y1+y2)/2 + "px"
        this.elemento.style.left = ((x1+x2)/2 - d/2) + "px"
        this.elemento.style.transform = "rotate("+((Math.atan2(y1-y2,x1-x2)*180)/Math.PI)+"deg)"
        this.points = [x1,y1,x2,y2]
    }
}

function fr(x1,y1,x2,y2,y) {
    let m = (y1-y2)/(x1-x2)
    return ((x1*m)+(y-y1))/m
}

function Estrada(largura,altura,curva = 0) {

    let alt = [340,360,380,400,450,550,690]
    let p = [-.35,-.45,-.5,-.55,-.6,-.4,0]
    let aux = 0

    this.elemento = novoElemento('div','estrada')
    this.xe = (y,c = curva) => fr(250,altura,(largura/2) + c,290,y)
    this.xd = (y,c = curva) => fr((largura/2) + 350,altura,(largura/2) + c,290,y)
    this.getY = () => parseInt(this.elemento.style.top.split('px')[0])
    this.setY = y => this.elemento.style.top = `${y}px`
    this.getX = () => parseInt(this.elemento.style.left.split('px')[0])
    this.setX = x => this.elemento.style.left = `${x}px`
    this.setY(0)
    this.setX(0)

    let le = [new criarlinha(this.xe(310)+curva * -.2,310,(largura/2) + curva,290,"linha")]
    let ld = [new criarlinha(this.xd(310)+curva * -.2,310,(largura/2) + curva,290,"linha")]
    alt.forEach((e) => {
        le.push(new criarlinha(this.xe(e)+curva * p[aux],e,le[aux].points[0],le[aux].points[1],"linha"))
        ld.push(new criarlinha(this.xd(e)+curva * p[aux],e,ld[aux].points[0],ld[aux].points[1],"linha"))
        aux+=1
    })
    ld.forEach((e) => {
        this.elemento.appendChild(e.elemento)
    })
    le.forEach((e) => {
        this.elemento.appendChild(e.elemento)
    })
    this.animar = (c) => {
        this.setX(this)
        ld[0].animar(this.xd(310,c)+c * -.2,310,(largura/2) + c,290)
        le[0].animar(this.xe(310,c)+c * -.2,310,(largura/2) + c,290)
        aux = 1
        alt.forEach((e => {
            ld[aux].animar(this.xd(e,c)+c * p[aux-1],e,ld[aux-1].points[0],ld[aux-1].points[1])
            le[aux].animar(this.xe(e,c)+c * p[aux-1],e,le[aux-1].points[0],le[aux-1].points[1])
            aux +=1
        }))
    }
}

function Ceu(largura,altura) {
    this.elemento = novoElemento('div','ceu')


    this.animar = (c) => {
        
    }
}

function UI() {

    this.elemento = novoElemento('span', 'progresso')
    this.atualizarPontos = pontos => {
        this.elemento.innerHTML = pontos
    }
    this.atualizarPontos(0)
}

function estaoSobrepostos(elementoA, elementoB) {

    const a = elementoA.getBoundingClientRect()
    const b = elementoB.getBoundingClientRect()
    const horizontal = a.left + a.width >= b.left && b.left + b.width >= a.left
    const vertical = a.top + a.height >= b.top && b.top + b.height >= a.top

    return horizontal && vertical
}

function colidiu(passaro, barreiras) {
    let colidiu = false

    barreiras.pares.forEach(parDeBarreiras => {
        if (!colidiu) {
            const superior = parDeBarreiras.superior.elemento
            const inferior = parDeBarreiras.inferior.elemento
            colidiu = estaoSobrepostos(passaro.elemento, superior)
                || estaoSobrepostos(passaro.elemento, inferior)
        }
    })
    return colidiu

}

function RacyyCar() {
    let d = 0
    const areaDoJogo = document.querySelector('[wm-flappy]')
    const altura = areaDoJogo.clientHeight
    const largura = areaDoJogo.clientWidth
    console.log(largura + " " + altura)

    const ceu = new Ceu(largura,altura)
    const estrada = new Estrada(largura,altura)
    const jogador = new Jogador(largura,altura)

    areaDoJogo.appendChild(jogador.elemento)
    areaDoJogo.appendChild(estrada.elemento)
    areaDoJogo.appendChild(ceu.elemento)

    this.start = () => {
        const temporizador = setInterval(() => {
            d += 1 * (v/10)
            count += 1 
            c = Math.sin(d/10)*300
            
            estrada.animar(c)
            jogador.animar()
            
            jogador.setX((c<0 ? (jogador.getX() + (c*.004)*v/10 ) : (jogador.getX() + (c*.01)*v/10)))
            estrada.setX(160.5 - (jogador.getX()*.3))

        }, 20)
    }
}
  new RacyyCar().start() 