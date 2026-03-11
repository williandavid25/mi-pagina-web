/**
 * Antigravity Field Professional Particle System
 * Replicates the dense, whole-screen reactive scatter field effect.
 * Features: High density, tiny sizes, constant slow movement, and magnetic evasion/attraction.
 */

const canvas = document.getElementById('particle-canvas');

if (canvas) {
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particlesArray = [];
    let mouse = {
        x: undefined,
        y: undefined,
        radius: 400 // ENORME radio magnético para que te sigan desde lejos
    };

    let isDesktop = window.innerWidth > 768;

    if (isDesktop) {
        window.addEventListener('mousemove', function(event) {
            mouse.x = event.x;
            mouse.y = event.y;
        });

        class Particle {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                this.baseX = this.x;
                this.baseY = this.y;
                
                this.size = Math.random() * 2 + 0.1; 
                
                const colors = ['#6F3ECD', '#FEBD01', '#888888', '#bbbbbb'];
                this.color = colors[Math.floor(Math.random() * colors.length)];
                
                this.opacity = Math.random() * 0.7 + 0.3;
                
                // Variación de velocidad MUCHO MÁS LENTA para movimiento elegante
                this.density = (Math.random() * 8) + 1; // Reducido drásticamente de 40 a 8
            }

            draw() {
                ctx.save();
                ctx.globalAlpha = this.opacity;
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }

            update() {
                // If mouse is present, calculate interaction
                if (mouse.x !== undefined && mouse.y !== undefined) {
                    let dx = mouse.x - this.x;
                    let dy = mouse.y - this.y;
                    let distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < mouse.radius) {
                        // FUERZA DE ATRACCIÓN MASIVA
                        let forceDirectionX = dx / distance;
                        let forceDirectionY = dy / distance;
                        
                        // Cuanto más cerca, más rápido vuelan hacia ti (ahora atenuado)
                        let force = (mouse.radius - distance) / mouse.radius;
                        
                        // Limitador estricto de velocidad máxima (suavidad)
                        let maxSpeed = 1.5; 
                        let directionX = forceDirectionX * force * this.density;
                        let directionY = forceDirectionY * force * this.density;
                        
                        // Clamp speed
                        if (directionX > maxSpeed) directionX = maxSpeed;
                        if (directionX < -maxSpeed) directionX = -maxSpeed;
                        if (directionY > maxSpeed) directionY = maxSpeed;
                        if (directionY < -maxSpeed) directionY = -maxSpeed;
                        
                        // SUMAMOS para que VAYAN hacia el mouse (ATRACCIÓN) pero de forma elegante
                        this.x += directionX;
                        this.y += directionY;
                    } else {
                        // Settle back to grid/base slowly slowly
                        if (this.x !== this.baseX) {
                            let dxBase = this.x - this.baseX;
                            this.x -= dxBase / 40;
                        }
                        if (this.y !== this.baseY) {
                            let dyBase = this.y - this.baseY;
                            this.y -= dyBase / 40;
                        }
                    }
                } else {
                    // Settle back to grid if mouse is gone
                    if (this.x !== this.baseX) {
                        let dxBase = this.x - this.baseX;
                        this.x -= dxBase / 20;
                    }
                    if (this.y !== this.baseY) {
                        let dyBase = this.y - this.baseY;
                        this.y -= dyBase / 20;
                    }
                }
                
                // Give them a constant, very slow drift even when resting
                this.baseX += (Math.random() - 0.5) * 0.5;
                this.baseY += (Math.random() - 0.5) * 0.5;
                
                // Keep them roughly in bounds of their original area
                if(this.baseX < 0 || this.baseX > canvas.width) this.baseX = this.x;
                if(this.baseY < 0 || this.baseY > canvas.height) this.baseY = this.y;

                this.draw();
            }
        }

        function init() {
            particlesArray = [];
            // MASSIVE amount of particles for the Antigravity dense field look
            // Carefully balanced formula so it doesn't crash browsers
            let numberOfParticles = (canvas.height * canvas.width) / 2500; 

            for (let i = 0; i < numberOfParticles; i++) {
                let x = Math.random() * canvas.width;
                let y = Math.random() * canvas.width; // Intentional spread
                particlesArray.push(new Particle(x, y));
            }
        }

        function animate() {
            requestAnimationFrame(animate);
            // Deep clear for crisp particles
            ctx.clearRect(0, 0, canvas.width, canvas.height); 

            for (let i = 0; i < particlesArray.length; i++) {
                particlesArray[i].update();
            }
        }

        init();
        animate();

        window.addEventListener('resize', function() {
            isDesktop = window.innerWidth > 768;
            if (isDesktop) {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
                init();
            } else {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                particlesArray = [];
            }
        });
    }
}
