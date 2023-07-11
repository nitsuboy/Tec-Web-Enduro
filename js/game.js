var inputs = []    // input handler
var cars = []     // carros, é quem diria
var items = []   // adivinhe
var count = 0   // contador goblal
var countv = 0 // contador com velocidade
var v = 0       // velocidade
var p = 200    // posição
var s = 0     // score
var g = 6000 // gasolina
var l = 0       // volta
var d = 0      // dificuldade
var estradaoffset // offset da estrada
var nevoado = false
var pause = false
var pausec = false // contador pausa
const colors = ['#a2a22a','#6e9c42','#a28638','#429e82','#48a048','#4288b0','#b846a2','#c66c3a','#4272c2','#6848c6'];
const lanes = [[250,420],[535,535],[820,640]] // ponto base e medio para o calculo da curva de bezier
const backgrounds = [{'img' : '/img/backgrounds/back_2.png','shade_1' : '#6b947b','shade_2' : '#466150'},
                     {'img' : '/img/backgrounds/back_1.png','shade_1' : '#c3cbf1','shade_2' : '#5f77d7'},
                     {'img' : '/img/backgrounds/back_3.png','shade_1' : '#9c8473','shade_2' : '#846b5a'},
                     {'img' : '/img/backgrounds/back_4.png','shade_1' : '#4a637b','shade_2' : '#294a5a'}]
                     //repeating-linear-gradient(0deg, shade_1 0% 50%, shade_2 50% 100%);
                     //linear-gradient(0deg, rgba(0,0,0,0) 10%, shade_1 60%, shade_2 100%);
const frames = ['/img/car/pneu_0.png','/img/car/pneu_1.png']
var maxspeed = 10
const colorp = document.getElementById('colorpick');
const backp = document.getElementById('backpick');

// ~~ = math.trunc 

function novoElemento(tagName, className) {
    const elemento = document.createElement(tagName)
    elemento.className = className
    return elemento
}

function play(objeto,anim) {
    objeto.className = objeto.className.split(" ")[0];
    requestAnimationFrame((time) => {
      requestAnimationFrame((time) => {
        objeto.className = objeto.className + " " + anim;
      });
    });
}
// Bezier quadratica para a curva
function bezier(x1,x2,x3,t) {
    return (((1 - t) * (1 - t))*x1) + (2*t*(1 - t)*x2) + t*t*x3
}
// interpolação linear para aceleção fica mais macia
function lerp (start, end, amt){
    return (1-amt)*start+amt*end
}

function Carro(l = 0,i = 290,f = 0) {

    this.elemento = novoElemento('div', 'carro')

    this.chassi = novoElemento('div', 'chassi')
    this.pneu = novoElemento('img','pneu')
    this.pneu.src = frames[0]
    this.luzes = novoElemento('img','luzes')
    this.luzes.src = '/img/car/luz.png'
    this.elemento.appendChild(this.luzes)
    this.elemento.appendChild(this.chassi)
    this.elemento.appendChild(this.pneu)

    this.color = colors[~~(Math.random() * colors.length)]
    this.isfake = f
    this.elemento.style.opacity = +!f 
    this.lane = l
    this.passed = false
    this.v = 5
    this.getY = () => parseFloat(this.elemento.style.top.split('px')[0])
    this.setY = y => this.elemento.style.top = y.toFixed(2) + "px"
    this.getX = () => parseFloat(this.elemento.style.left.split('px')[0])
    this.setX = x => this.elemento.style.left = x.toFixed(2) + "px"
    this.s = () => ((this.getY()*.0023)-.47)
    this.col = (s = this.s()) => [this.getX() + (60 - ((120*s)/2)),this.getY() + (20 - ((40*s)/2)),120*s,41*s]

    this.setX(535)
    this.setY(i)
    this.elemento.style.transform = "scale("+ this.s() +")"
    this.chassi.style.backgroundColor = this.color;

    let per
    let s
    let auy

    this.fc = (f,c = 0,p = true) => {
        this.color = c
        this.isfake = f
        this.passed = p
        this.elemento.style.opacity = +!f
        this.chassi.style.backgroundColor = this.color;
    }

    this.reset = (f = 0, i = 285,p) => {
        this.elemento.style.transform = "scale("+ 0 +")"
        this.setY(i)
        this.isfake = f
        this.elemento.style.opacity = +!f
        this.passed = p
        this.color = colors[~~(Math.random() * colors.length)]
        this.chassi.style.backgroundColor = this.color;
    }

    this.animar = (c) => {
        auy = this.getY()
        per = (auy*-.0024)+1.68
        s = ((auy*.0028)-.76)

        this.elemento.style.transform = "scale("+ s +")"
        
        if(auy>635 && !this.passed && !this.isfake){
            this.passed = true
            p--
        }
        if(auy<635 && this.passed && !this.isfake){
            this.passed = false
            p++
        }
        this.setX(bezier(lanes[this.lane][0],lanes[this.lane][1],535 + c*.95,per) + estradaoffset)
        this.pneu.src = frames[count%2]
        count < 1400 || count > 4200 ? this.luzes.style.opacity = "0" : this.luzes.style.opacity = "1"
    }
}

function Item(i = 260) {

    this.elemento = novoElemento('img', 'item')
    this.elemento.src = "/img/items/boostpack.png"

    this.lane = ~~(Math.random()*3)
    this.used = false
    this.counter = 0
    this.flip = () => this.used = !this.used
    this.getY = () => +(this.elemento.style.top.split('px')[0])
    this.setY = y => this.elemento.style.top = y.toFixed(2) + "px"
    this.getX = () => +(this.elemento.style.left.split('px')[0])
    this.setX = x => this.elemento.style.left = x.toFixed(2) + "px"
    this.s = () => ((this.getY()*.0023)-.47)
    this.col = (s = this.s()) => [this.getX() + (50 - ((100*s)/2)),this.getY() + (50 - ((100*s)/2)),100*s,100*s]

    this.setX(535)
    this.setY(i)
    this.elemento.style.scale =  this.s()

    let per 
    let s
    let auy
    let pa = 0

    this.animar = (c) => {
        auy = this.getY()
        per = (auy*-.0027)+1.68
        s = ((auy*.0025)-.64)
        this.counter++
        this.elemento.style.scale =  s

        this.counter>5e2&&(Math.random()<.5-d&&(pa=1),this.counter=0);

        if(this.getY()>750){
            if(pa == 1){
                auy = 260
                this.elemento.style.scale = 0
                this.setY(auy)
                pa = 0
                this.used = false
                this.elemento.style.opacity = 1
                this.lane = ~~(Math.random()*3)
            }
        }else{
            this.setY(auy + (v*s))
            this.setX(bezier(lanes[this.lane][0],lanes[this.lane][1],535 + c*.95,per) + estradaoffset)
        }
    }

    this.efeito = () => {
        maxspeed += 4
        this.elemento.style.opacity = 0
    }
}

function Jogador(largura,altura) {

    this.elemento = new novoElemento('div', 'carro jogador')

    this.chassi = new novoElemento('div', 'chassi')
    this.pneu = new novoElemento('img','pneu')
    this.pneu.src = frames[0]
    this.luzes = new novoElemento('img','luzes')
    this.luzes.src = '/img/car/luz.png'
    const si = new novoElemento('img','go')
    si.src = '/img/car/go.png'
    si.style.opacity = 0

    this.chassi.appendChild(this.luzes)
    this.elemento.appendChild(this.chassi)
    this.elemento.appendChild(this.pneu)
    this.elemento.appendChild(si)

    this.getY = () => parseFloat(this.elemento.style.top.split('px')[0])
    this.setY = y => this.elemento.style.top = y.toFixed(2) + "px"
    this.getX = () => parseFloat(this.elemento.style.left.split('px')[0])
    this.setX = x => this.elemento.style.left = x.toFixed(2) + "px"
    this.batida = false
    this.col = () => [this.getX(),this.getY(),120,41]

    this.setY(altura - 65)
    this.setX(largura / 2 - 60)
    let direx = 0
    let aux

    this.animar = () => {
        this.pneu.src = (v < 1 ? frames[0] : frames[~~((count%(2*(maxspeed - v+1))/(1*(maxspeed - v+1))))])
        
        aux = this.getX()
        aux>1080?aux=1080:aux<0?aux=0:aux
        this.setX(aux)

        if (inputs['a'] == true && !this.batida){
            this.setX(aux - v * 1.2)
        }
        if (inputs['d'] == true && !this.batida){
            this.setX(aux + v * 1.2)
        }
        if (inputs['s'] == true && !this.batida){
            v -= .2
        }
        if (inputs[' '] == true && !this.batida){
            v = lerp(v,maxspeed,.02)
        }

        let car
        let col
        for (let i = 0; i < cars.length; i++) {
            car = cars[i]
            car.every((c) => {
                col = c.col()
                if( col[0] < aux + 120 &&
                    col[0] + col[2] > aux &&
                    col[1] < this.getY() + 41 &&
                    col[3] + col[1] > this.getY() &&
                    !c.isfake)
                        {
                            maxspeed = 10
                            if(aux > col[0]){
                                direx = .5
                            }else{
                                direx = -.5
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

        items.every((i)=>{
            col = i.col()
                if( col[0] < aux + 120 &&
                    col[0] + col[2] > aux &&
                    col[1] < this.getY() + 41 &&
                    col[3] + col[1] > this.getY() &&
                    !i.used)
                        {
                            i.used = true
                            i.efeito()
                            return false
                        }
                else{
                    return true 
                }
        })

        if (aux > 737 || aux < 337) {
            v -= .15
        }

        v = (v < 1 ? 1 : v)

        if(this.batida){
            v -= 3
            this.setX(aux + direx)
            setTimeout(() => {
                direx = 0
                this.batida = false;
              }, 1200);
        }

        if(g <  0) {
            g = 0
            v = 0
            si.style.opacity = 1
        }

    }
}

function linha(x1,y1,x2,y2,bw) {

    let d = Math.sqrt(((x1 - x2)*(x1 - x2)) + ((y1 - y2) *(y1 - y2)))
    this.elemento = new novoElemento('div','linha')
    this.elemento.style.width = d + "px"
    this.elemento.style.top = (y1+y2)/2 + "px"
    this.elemento.style.left = ((x1+x2)/2 - d/2) + "px"
    this.elemento.style.transform = "rotate("+((Math.atan2(y1-y2,x1-x2)*180)/Math.PI)+"deg)"
    this.points = [x1,y1,x2,y2]
    this.elemento.style.borderWidth = bw;

    this.animar = (x1,y1,x2,y2) => {
        d = Math.sqrt(((x1 - x2)*(x1 - x2)) + ((y1 - y2) *(y1 - y2)))
        this.elemento.style.width = d + "px"
        this.elemento.style.top = (y1+y2)/2 + "px"
        this.elemento.style.left = ((x1+x2)/2 - d/2) + "px"
        this.elemento.style.transform = "rotate("+((Math.atan2(y1-y2,x1-x2)*180)/Math.PI)+"deg)"
        this.points = [x1,y1,x2,y2]
    }
}

function Estrada(largura,curva = 0) {

    const alt = [340,360,380,400,450,550,690] //alturas
    let aux = 0

    this.elemento = new novoElemento('div','estrada')
    this.xe = (y,c = curva) => bezier(250,422,(largura/2) + c,(y*-.0025)+1.725)
    this.xd = (y,c = curva) => bezier(945,770,(largura/2) + c,(y*-.0025)+1.725)
    this.getY = () => +this.elemento.style.top.split('px')[0]
    this.setY = y => this.elemento.style.top = `${y}px`
    this.getX = () => +this.elemento.style.left.split('px')[0]
    this.setX = x => this.elemento.style.left = `${x}px`
    this.setY(0)
    this.setX(0)

    //asfalto
    const af = new novoElemento('div','asfalto')
    const pix = new novoElemento('div','p')
    this.grama = new novoElemento('div','g')
    af.appendChild(pix)
    pix.appendChild(new novoElemento('div','ps'))
    this.fog = new novoElemento('div','pg')
    this.grama.appendChild(this.fog)

    this.elemento.appendChild(af)
    this.elemento.appendChild(this.grama)
    let mask = ""

    // laterais
    let le = [new linha(this.xe(310)+curva,310,(largura/2) + curva,290,"1px")]
    let ld = [new linha(this.xd(310)+curva,310,(largura/2) + curva,290,"1px")]
    alt.forEach((e) => {
        le.push(new linha(this.xe(e),e,le[aux].points[0],le[aux].points[1],((e*.022)-5.6)+"px"))
        ld.push(new linha(this.xd(e),e,ld[aux].points[0],ld[aux].points[1],((e*.022)-5.6)+"px"))
        aux+=1
    })

    mask += ((le[0].points[2]/1190)*100).toFixed(2) + "% "+((le[0].points[3]/690)*100).toFixed(2) + "% ,"
    ld.forEach((e) => {
        this.elemento.appendChild(e.elemento)
        mask += ((e.points[0]/1190)*100).toFixed(2) + "% "+((e.points[1]/690)*100).toFixed(2) + "% ,"
    })
    le.forEach((e) => {
        this.elemento.appendChild(e.elemento)
    })
    le.slice().reverse().forEach((e) => {
        mask += ((e.points[0]/1190)*100).toFixed(2) + "% "+((e.points[1]/690)*100).toFixed(2) + "% ,"
    })

    af.style.clipPath = "polygon("+mask.slice(0, -1)+")"

    this.animar = (c) => {
        pix.style.backgroundPosition = "0px "+ countv + "px"
        this.grama.style.backgroundPosition = "0px "+ countv + "px"
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
        le.slice().reverse().forEach((e) => {
            mask += ((e.points[0]/1190)*100).toFixed(2) + "% "+((e.points[1]/690)*100).toFixed(2) + "% ,"
        })
        af.style.clipPath = "polygon("+mask.slice(0, -1)+")" 
    }
}

function Inimigos() {
    const esp = 180
    let l
    while(cars.length < 5) {
        l = []
        while(l.length < 3){
            l.push(new Carro(l.length,290,(Math.random() > .5 - d ? 1 : 0)))
        }
        l[0].isfake||l[1].isfake||l[2].isfake||l[~~(3*Math.random())].reset(1,290);
        cars.push(l)
    }
    items.push(new Item())

    this.animar = (aux) => {
        for (let i = 0, len = cars.length; i < len; i++) {
            for (let j = 0; j < 3; j++) {
                cars[i][j].setY(((i - 1) < 0 ? cars[0][0].getY() + (v - cars[i][j].v) * (( (cars[i][j].s()>0 && cars[i][j].s()<1) ? cars[i][j].s() : 1 ) +.01) : cars[i - 1][0].getY() + (esp*cars[i][j].s())))
                cars[i][j].animar(c)
                // não bater na frente, if gigante minificado
                cars[i][j].getY() >= 680 && !cars[i][j].isfake && (aux>660&&2==j?cars[i][1].isfake?(cars[i][1].fc(!1,cars[i][j].color),cars[i][j].fc(!0)):(cars[i][0].fc(!1,cars[i][j].color),cars[i][j].fc(!0)):aux>470&&aux<660&&1==j?cars[i][2].isfake?(cars[i][2].fc(!1,cars[i][j].color),cars[i][j].fc(!0)):(cars[i][0].fc(!1,cars[i][j].color),cars[i][j].fc(!0)):aux<470&&0==j&&(cars[i][2].isfake?(cars[i][2].fc(!1,cars[i][j].color),cars[i][j].fc(!0)):(cars[i][1].fc(!1,cars[i][j].color),cars[i][j].fc(!0))))
            }
        }
        //resolução da esteira infinita
        if(cars.at(-1)[0].getY() > 790){
            l = cars.pop()
            l.forEach((c) => {
                c.reset((Math.random() > .5 ? 1 : 0),(cars[0][0].getY() - (esp*cars[0][0].s())))
                //(cars[0][0].getY() - (esp*cars[0][0].s()))
            })
            l[0].isfake||l[1].isfake||l[2].isfake||l[~~(3*Math.random())].reset(1,cars[0][0].getY()-esp*cars[0][0].s());
            cars.unshift(l)
        }

        if(cars[0][0].getY() < 240){
            l = cars.shift()
            l.forEach((c) => {
                c.reset((Math.random() > .5 ? 1 : 0),700,1)
            })
            l[0].isfake||l[1].isfake||l[2].isfake||l[~~(3*Math.random())].reset(1,700,1);
            cars.push(l)
        }
    }

    this.animaritem = (aux) => {
        items.forEach((i) => {
            i.animar(c)
        })
    }
}

function Efeitos(estrada) {
    let backpos = 0
    
    this.elemento = new novoElemento('div','efeitos')

    this.ceu = new novoElemento('div','ceu')

    this.ceu.style.backgroundImage = "url("+backgrounds[0].img+")"
    estrada.grama.style.backgroundImage = "repeating-linear-gradient(0deg," + backgrounds[0].shade_1 + " 0% 50%, " + backgrounds[0].shade_2 + " 50% 100%)"
    estrada.fog.style.backgroundImage = "linear-gradient(0deg, rgba(0,0,0,0) 10%, " + backgrounds[0].shade_1 + " 60%, " + backgrounds[0].shade_2 + " 100%)"

    this.ciclo = new novoElemento('div','ciclo')
    this.nevoa = new novoElemento('div','nevoa')
    this.elemento.appendChild(this.ceu)
    this.elemento.appendChild(this.ciclo)
    this.elemento.appendChild(this.nevoa)

    this.change = (id) => {
        this.ceu.style.backgroundImage = "url("+backgrounds[id].img+")"
        estrada.grama.style.backgroundImage = "repeating-linear-gradient(0deg," + backgrounds[id].shade_1 + " 0% 50%, " + backgrounds[id].shade_2 + " 50% 100%)"
        estrada.fog.style.backgroundImage = "linear-gradient(0deg, rgba(0,0,0,0) 10%, " + backgrounds[id].shade_1 + " 60%, " + backgrounds[id].shade_2 + " 100%)"
    }

    this.animar = (c) => {
        backpos += (v*c*.001)
        this.ceu.style.backgroundPosition = backpos + "px 0px"
        this.ciclo.style.opacity = (count > 1200 ? (((count*count)/-480)+(count*12.5)-12000)/10000 : 0)
        if(count > 4800) {
            count = 0
            if(nevoado){
                play(this.nevoa,'nevoaanim-out')
                setTimeout(()=>{
                    this.nevoa.style.opacity = 0
                    nevoado = false
                }, 1000)
            }
            if(Math.random() > .8 - d && !nevoado){
                play(this.nevoa,'nevoaanim-in')
                setTimeout(()=>{
                    this.nevoa.style.opacity = 1
                    nevoado = true
                }, 1000)
            }
        }
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

    //Wrapper
    this.elemento = novoElemento('div', 'UI')

    // Parte superior
    this.status = novoElemento('div','status')
    this.progesso = novoElemento('span', 'pos')
    this.pdiv = novoElemento('div', 'posdiv')
    this.voltas = novoElemento('span', 'vol')
    this.pontos = novoElemento('span', 'points')
    
    this.status.appendChild(this.pdiv)
    this.status.appendChild(this.progesso)
    this.status.appendChild(this.voltas)
    this.status.appendChild(this.pontos)

    // Parte inferior
    this.meter = novoElemento('div', 'meters')
    this.pv = novoElemento('img', 'pointerv')
    this.pg = novoElemento('img', 'pointerg')
    this.pv.src = '/img/UI/pointer.png'
    this.pg.src = '/img/UI/pointerp.png'
    this.velo = novoElemento('span', 'velo')

    this.meter.appendChild(this.pv)
    this.meter.appendChild(this.pg)
    this.meter.appendChild(this.velo)
    let vdeg

    // Menu de pausa
    this.menu = document.querySelector('[menu]')

    pause?this.menu.style.display="flex":this.menu.style.display="none";

    this.elemento.appendChild(this.meter)
    this.elemento.appendChild(this.status)
    this.elemento.appendChild(this.menu)

    this.animar = () => {
        vdeg = (((v*22.5)-45) + Math.random()*3)
        this.pv.style.transform = "rotate("+ (vdeg < -45 ? -45 : vdeg )+"deg)";
        this.pg.style.transform = "rotate("+ (((g*.02)+30))+"deg)";
        this.velo.textContent = (v < 0 ? 0 : ~~(v*20))
        this.progesso.textContent = p + "°"
        this.voltas.textContent = l
        this.pontos.textContent = ('000000'+ ~~s).slice(-6);
    }

    this.pause = () => {
        pause?this.menu.style.display="flex":this.menu.style.display="none";
    }
}

function RacyyCar() {

    const areaDoJogo = document.querySelector('[wm-flappy]')
    const altura = areaDoJogo.clientHeight
    const largura = areaDoJogo.clientWidth

    const estrada = new Estrada(largura)
    const jogador = new Jogador(largura,altura)
    const efeitos = new Efeitos(estrada)
    const inimigos = new Inimigos()
    const ui = new UI()
    //const colj = new col(jogador)
    //const cols = []

    areaDoJogo.appendChild(jogador.elemento)
    areaDoJogo.appendChild(estrada.elemento)
    areaDoJogo.appendChild(efeitos.elemento)
    //areaDoJogo.appendChild(colj.elemento)
    areaDoJogo.appendChild(ui.elemento)

    cars.forEach((l) => {
        l.forEach((c) => {
            areaDoJogo.appendChild(c.elemento)
            //cols.push(new col(c))
        })
    })

    items.forEach((i) => {
        areaDoJogo.appendChild(i.elemento)
        //cols.push(new col(i))
    })

    // input handler
    window.onkeydown = e => inputs[e.key] = true;
    window.onkeyup = e => delete inputs[e.key];

    
    //cols.forEach((e) => {
    //    areaDoJogo.appendChild(e.elemento)
    //})

    this.changecolor = (color) => {
        jogador.chassi.style.backgroundColor = color
    }

    this.changeback = (id) => {
        efeitos.change(id)
    }

    this.loop = () => {
        const temporizador = setInterval(() => {
            if(!pause){
                countv += v
                count++
                g -= 1/2
                c = Math.sin(countv/1000)*500
                s += (v < 0 ? 0 : v)*.01
                
                estrada.animar(c)
                jogador.animar()
                inimigos.animar(jogador.getX())
                inimigos.animaritem() 
                efeitos.animar(c)
                //colj.animar()
                //cols.forEach((e) => {e.animar()})

                if(p <  1) {
                    play(ui.pdiv,"voltaanim")
                    g = 6000
                    p = 200
                    d += .01
                    l++
                }

                if (maxspeed > 10) {
                    maxspeed = lerp(maxspeed, 10, .01)
                }

                ui.animar()

                jogador.setX(jogador.getX() - ((c/200)*(v/maxspeed)))
                estrada.setX(160.5 - (jogador.getX()*.3))
                estradaoffset = estrada.getX()
            }

            if (inputs['Enter'] == true && !pausec){
                pause = !pause
                pausec = true
                ui.pause()
                setTimeout(()=>{
                    pausec = false
                }, 200)
            }
        }, 20)
    }
}

const game = new RacyyCar()

game.loop()

colorp.addEventListener('input', () => {
    game.changecolor(colorp.value)
});
backp.addEventListener('change', () => {
    game.changeback(backp.value)
});