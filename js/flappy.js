var inputs = [] // input handler
var cars = [] // carros, é quem diria
var lanes = [[250,417],[535,535],[820,643]] // ponto base e medio para o calculo da curva de bezier
var count = 0   // contador goblal
var countv = 0  // contador com velocidade
var v = 0 // velocidade
var p = 0 // posição
var g = 0 // gasolina
var l = 0 // volta
var estradaoffset // offset da estrada

function novoElemento(tagName, className) {
    const elemento = document.createElement(tagName)
    elemento.className = className
    return elemento
}

function play(objeto,anim) {
    objeto.className = objeto.className.split(" ")[0];
    console.log()
    requestAnimationFrame((time) => {
      requestAnimationFrame((time) => {
        objeto.className = objeto.className + " " + anim;
      });
    });
}

function bezier(x1,x2,x3,t) {
    return (((1 - t) * (1 - t))*x1) + (2*t*(1 - t)*x2) + t*t*x3
}

function Carro(l = 0,i = 290,f = false) {

    let frames = ['/img/car_0.png','/img/car_1.png']

    this.elemento = novoElemento('img', 'carro')
    this.elemento.src = frames[0]
    this.color = Math.floor(Math.random()*360)
    this.isfake = f
    this.lane = l
    this.passed = false
    this.v = 2
    this.isfake ? this.elemento.style.opacity = "0" : this.elemento.style.opacity = "1"
    this.getY = () => parseFloat(this.elemento.style.top.split('px')[0])
    this.setY = y => this.elemento.style.top = y.toFixed(2) + "px"
    this.getX = () => parseFloat(this.elemento.style.left.split('px')[0])
    this.setX = x => this.elemento.style.left = x.toFixed(2) + "px"
    this.col = () => [this.getX() + estradaoffset + (60 - ((120*s)/2)),this.getY() + (20 - ((40*s)/2)),120*s,41*s]
    this.s = () => ((this.getY()*.0023)-.47)
    
    this.setX(535)
    this.setY(i)
    this.elemento.style.filter = "hue-rotate("+this.color+"deg)"

    let per = (this.getY()*-.0023)+1.64
    let s = ((this.getY()*.0023)-.47)

    this.fc = (f,c=0) => {
        this.color = c
        this.isfake = f
        this.isfake ? this.elemento.style.opacity = "0" : this.elemento.style.opacity = "1"
        this.elemento.style.filter = 'hue-rotate('+this.color+'deg)'
    }

    this.reset = (f = false, i = 285,p = false) => {
        per = 0
        s = 0
        this.elemento.style.transform = "scale("+ s +")"
        this.setY(i)
        this.isfake = f
        this.isfake ? this.elemento.style.opacity = "0" : this.elemento.style.opacity = "1"
        this.passed = p
        this.color = Math.floor(Math.random()*360)
        this.elemento.style.filter = 'hue-rotate('+this.color+'deg)'
    }

    this.animar = (c) => {
        per = (this.getY()*-.0024)+1.68
        s = ((this.getY()*.0028)-.76)
        this.elemento.style.transform = "scale("+ s +")"
        //this.setY(this.getY() + (v - this.v)*(((s>0 && s<1)?s:1)+.01))
        
        if(this.getY()>635 && !this.passed && !this.isfake){
            this.passed = true
            p--
        }
        if(this.getY()<635 && this.passed && !this.isfake){
            this.passed = false
            p++
        }
        this.setX(bezier(lanes[this.lane][0],lanes[this.lane][1],535 + c*.95,per))
        this.elemento.src = frames[count%2]
        
    }
}

function Jogador(largura,altura) {

    let frames = ['/img/car_0.png','/img/car_1.png']

    this.elemento = novoElemento('img', 'jogador')
    this.elemento.src = frames[0] 

    this.getY = () => parseFloat(this.elemento.style.top.split('px')[0])
    this.setY = y => this.elemento.style.top = y.toFixed(2) + "px"
    this.getX = () => parseFloat(this.elemento.style.left.split('px')[0])
    this.setX = x => this.elemento.style.left = x.toFixed(2) + "px"
    this.batida = false
    this.count = 0
    this.col = () => [this.getX(),this.getY(),120,41]

    window.onkeydown = e => inputs[e.key] = true;
    window.onkeyup = e => delete inputs[e.key];

    this.setY(altura - 65)
    this.setX(largura / 2 - 60)
    let direx = 0
    let direy = 0

    this.animar = () => {
        this.elemento.src = (v < 1 ? frames[0] : frames[Math.floor((count%(2*(5 - v+1))/(1*(5 - v+1))))])
        
        if (inputs['a'] == true && !this.batida){
            this.setX(this.getX() - v * 1.2)
        }
        if (inputs['d'] == true && !this.batida){
            this.setX(this.getX() + v * 1.2)
        }
        if (inputs['s'] == true && !this.batida){
            v -= .2
        }
        if (inputs[' '] == true && !this.batida){
            v += .1
        }

        this.setX((this.getX() > 737 ? 737 : this.getX()))
        this.setX((this.getX() < 337 ? 337 : this.getX()))

        
        let col
        for (let i = 0; i < cars.length; i++) {
            let car = cars[i]
            car.every((c) => {
                col = c.col()
                if( col[0] < this.getX() + 120 &&
                    col[0] + col[2] > this.getX() &&
                    col[1] < this.getY() + 41 &&
                    col[3] + col[1] > this.getY() &&
                    !c.isfake)
                        {
                            if(this.getX() > col[0]){
                                direx = .5
                            }else{
                                direx = -.5
                            }
                            if(this.getY() > col[1]){
                                direy = .5
                            }else{
                                direy = .1
                            }
                            this.batida = true
                            return false
                        }
                else{
                    return true 
                }
            })
            if(this.batida) break
        }

        if(this.batida){
            v -= direy
            this.setX(this.getX() + direx)
            setTimeout(() => {
                direx = 0
                direy = 0
                this.batida = false;
              }, 1000);
        }

        v = (v > 5 ? 5 : v)
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

function Estrada(largura,altura,curva = 0) {

    let alt = [340,360,380,400,450,550,690]
    let aux = 0

    this.elemento = novoElemento('div','estrada')
    this.xe = (y,c = curva) => bezier(250,422,(largura/2) + c,(y*-.0025)+1.725)
    this.xd = (y,c = curva) => bezier(945,770,(largura/2) + c,(y*-.0025)+1.725)
    this.getY = () => parseInt(this.elemento.style.top.split('px')[0])
    this.setY = y => this.elemento.style.top = `${y}px`
    this.getX = () => parseInt(this.elemento.style.left.split('px')[0])
    this.setX = x => this.elemento.style.left = `${x}px`
    this.setY(0)
    this.setX(0)

    //asfalto
    let af = new novoElemento('div','asfalto')
    let pix = new novoElemento('div','p')
    af.appendChild(pix)
    pix.appendChild(new novoElemento('div','ps'))
    let mask = ""

    criarlinha(250,690,(largura/2),290,"linha")

    // laterais
    let le = [new criarlinha(this.xe(310)+curva,310,(largura/2) + curva,290,"linha")]
    let ld = [new criarlinha(this.xd(310)+curva,310,(largura/2) + curva,290,"linha")]
    alt.forEach((e) => {
        le.push(new criarlinha(this.xe(e),e,le[aux].points[0],le[aux].points[1],"linha"))
        ld.push(new criarlinha(this.xd(e),e,ld[aux].points[0],ld[aux].points[1],"linha"))
        aux+=1
    })

    mask += ((le[0].points[2]/1190)*100).toFixed(2) + "% "+((le[0].points[3]/690)*100).toFixed(2) + "% ,"
    ld.forEach((e) => {
        this.elemento.appendChild(e.elemento)
        mask += ((e.points[0]/1190)*100).toFixed(2) + "% "+((e.points[1]/690)*100).toFixed(2) + "% ,"
    })
    le.reverse().forEach((e) => {
        this.elemento.appendChild(e.elemento)
        mask += ((e.points[0]/1190)*100).toFixed(2) + "% "+((e.points[1]/690)*100).toFixed(2) + "% ,"
    })
    af.style.clipPath = "polygon("+mask.slice(0, -1)+")" 
    this.elemento.appendChild(af)

    this.animar = (c) => {
        pix.style.backgroundPosition = "0px "+ countv + "px"
        mask = ""
        ld[0].animar(this.xd(310,c),310,(largura/2) + c,290)
        le[0].animar(this.xe(310,c),310,(largura/2) + c,290)
        mask += ((le[0].points[2]/1190)*100).toFixed(2) + "% "+((le[0].points[3]/690)*100).toFixed(2) + "% ,"
        aux = 1
        alt.forEach((e => {
            ld[aux].animar(this.xd(e,c),e,ld[aux-1].points[0],ld[aux-1].points[1])
            le[aux].animar(this.xe(e,c),e,le[aux-1].points[0],le[aux-1].points[1])
            mask += ((ld[aux-1].points[0]/1190)*100).toFixed(2) + "% "+((ld[aux-1].points[1]/690)*100).toFixed(2) + "% ,"
            aux +=1
        }))
        mask += ((ld[aux-1].points[0]/1190)*100).toFixed(2) + "% "+((ld[aux-1].points[1]/690)*100).toFixed(2) + "% ,"
        le.reverse().forEach((e) => {
            mask += ((e.points[0]/1190)*100).toFixed(2) + "% "+((e.points[1]/690)*100).toFixed(2) + "% ,"
        })
        af.style.clipPath = "polygon("+mask.slice(0, -1)+")" 
    }
}

function Inimigos(UI) {
    let esp = 120
    let aux
    let l
    while(cars.length < 8) {
        let l = []
        for (let i = 0; i < 3; i++) {
            l[i] = new Carro(i,290,
                            (Math.random() > .5 ? true : false),
                            UI)
        }
        if(!l[0].isfake && !l[1].isfake  && !l[2].isfake) {l[Math.floor(Math.random()*3)].reset(true,290)}
        cars.push(l)
    }

    this.animar = (jogador) => {
        for (let i = 0; i < cars.length; i++) {
            for (let j = 0; j < 3; j++) {
                cars[i][j].setY(((i - 1) < 0 ? cars[0][0].getY() + (v - cars[i][j].v)*(((cars[i][j].s()>0 && cars[i][j].s()<1)?cars[i][j].s():1)+.01) : cars[i - 1][0].getY() + (esp*cars[i][j].s())))
                cars[i][j].animar(c)
                if(cars[i][j].getY() >= 680 && !cars[i][j].isfake){
                    aux = jogador.getX()
                    console.log(aux)
                    if(aux > 660 && j == 2){
                        if(cars[i][1].isfake){
                            cars[i][1].fc(false,cars[i][j].color)
                            cars[i][j].fc(true)
                        }else{
                            cars[i][0].fc(false,cars[i][j].color)
                            cars[i][j].fc(true)
                        }
                    }else if(aux > 470 && aux < 660  && j == 1){
                        if(cars[i][2].isfake){
                            cars[i][2].fc(false,cars[i][j].color)
                            cars[i][j].fc(true)
                        }else{
                            cars[i][0].fc(false,cars[i][j].color)
                            cars[i][j].fc(true)
                        }
                    }else if(aux < 490  && j == 0){
                        if(cars[i][2].isfake){
                            cars[i][2].fc(false,cars[i][j].color)
                            cars[i][j].fc(true)
                        }else{
                            cars[i][1].fc(false,cars[i][j].color)
                            cars[i][j].fc(true)
                        }
                    }
                }
            }
        }
        if(cars.at(-1)[0].getY() > 790){
            l = cars.pop()
            l.forEach((c) => {
                c.reset((Math.random() > .5 ? true : false),(cars[0][0].getY() - (esp*cars[0][0].s())))
                //(cars[0][0].getY() - (esp*cars[0][0].s()))
            })
            if(!l[0].isfake && !l[1].isfake  && !l[2].isfake) {l[Math.floor(Math.random()*3)].reset(true,(cars[0][0].getY() - (esp*cars[0][0].s())))}
            cars.unshift(l)
        }

        if(cars[0][0].getY() < 240){
            l = cars.shift()
            l.forEach((c) => {
                c.reset((Math.random() > .5 ? true : false),700,true)
            })
            if(!l[0].isfake && !l[1].isfake  && !l[2].isfake) {l[Math.floor(Math.random()*3)].reset(true,700,true)}
            cars.push(l)
        }
    }
}

function Efeitos(largura,altura) {
    this.elemento = new novoElemento('div','efeitos')
    this.elemento.appendChild(new novoElemento('div','ceu'))
    this.elemento.appendChild(new novoElemento('div','sobre'))


    this.animar = (c,count) => {
        
    }
}

function col(corpo) {
    this.elemento = new novoElemento('div','col')

    this.getY = () => parseFloat(this.elemento.style.top.split('px')[0])
    this.setY = y => this.elemento.style.top = y.toFixed(2) + "px"
    this.getX = () => parseFloat(this.elemento.style.left.split('px')[0])
    this.setX = x => this.elemento.style.left = x.toFixed(2) + "px"


    this.animar = () => {
        let c = corpo.col()
        this.setX(c[0])
        this.setY(c[1])
        this.elemento.style.width = c[2] +"px"
        this.elemento.style.height = c[3] +"px"
    }
}

function UI() {

    this.elemento = novoElemento('div', 'UI')

    this.status = novoElemento('div','status')
    this.progesso = novoElemento('span', 'pos')
    this.pdiv = novoElemento('div', 'posdiv')
    this.voltas = novoElemento('span', 'vol')
    
    this.status.appendChild(this.pdiv)
    this.status.appendChild(this.progesso)
    this.status.appendChild(this.voltas)

    this.meter = novoElemento('div', 'meters')
    this.pv = novoElemento('img', 'pointerv')
    this.pg = novoElemento('img', 'pointerg')
    this.pv.src = '/img/pointer.png'
    this.pg.src = '/img/pointerp.png'
    this.velo = novoElemento('span', 'velo')

    this.meter.appendChild(this.pv)
    this.meter.appendChild(this.pg)
    this.meter.appendChild(this.velo)

    this.elemento.appendChild(this.meter)
    this.elemento.appendChild(this.status)

    this.animar = () => {
        this.pv.style.transform = "rotate("+ (((v*45)-45) + Math.random()*3)+"deg)";
        this.pg.style.transform = "rotate("+ (((g*.02)+30))+"deg)";
        this.velo.textContent = Math.floor(v*40)
        this.progesso.textContent = p + "°"
        this.voltas.textContent = l
    }
}

function RacyyCar() {
    p = 200
    g = 6000
    const areaDoJogo = document.querySelector('[wm-flappy]')
    const altura = areaDoJogo.clientHeight
    const largura = areaDoJogo.clientWidth

    const ceu = new Efeitos(largura,altura)
    const estrada = new Estrada(largura,altura)
    const jogador = new Jogador(largura,altura)
    const ui = new UI()
    //const colj = new col(jogador)
    //const cols = []
    
    const inimigos = new Inimigos((i) => ui.attprogresso(i))

    areaDoJogo.appendChild(jogador.elemento)
    areaDoJogo.appendChild(estrada.elemento)
    areaDoJogo.appendChild(ceu.elemento)
    //areaDoJogo.appendChild(colj.elemento)
    areaDoJogo.appendChild(ui.elemento)

    cars.forEach((l) => {
        l.forEach((c) => {
            estrada.elemento.appendChild(c.elemento)
            //cols.push(new col(c))
        })
    })
    /*cols.forEach((e) => {
        areaDoJogo.appendChild(e.elemento)
    })*/

    console.log(cars)

    this.start = () => {
        const temporizador = setInterval(() => {
            countv += 1 * (v)
            count += 1 
            g -= 1/2
            c = 0
            //c = Math.sin(countv/1000)*250
            
            
            estrada.animar(c)
            jogador.animar()
            inimigos.animar(jogador) 
            //colj.animar()
            //cols.forEach((e) => {e.animar()})
            if(p <=  1) {
                g = 6000
                p = 20
                l++
                play(ui.pdiv,"voltaanim")
            }

            ui.animar()

            jogador.setX(jogador.getX() - ((c/200)*(v/5)))
            estrada.setX(160.5 - (jogador.getX()*.3))
            estradaoffset = estrada.getX()
        }, 20)
    }
}

new RacyyCar().start() 