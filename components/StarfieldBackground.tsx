import React, { useEffect, useRef } from 'react';

const StarfieldBackground: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = window.innerWidth;
        let height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;

        const stars: { x: number, y: number, z: number, opacity: number }[] = [];
        const numStars = 250;
        
        for (let i = 0; i < numStars; i++) {
            stars.push({
                x: Math.random() * width,
                y: Math.random() * height,
                z: Math.random() * width,
                opacity: Math.random(),
            });
        }
        
        let mouse = { x: width / 2, y: height / 2 };
        
        const handleMouseMove = (e: MouseEvent) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        };

        const handleResize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };
        
        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', handleMouseMove);

        const draw = () => {
            ctx.fillStyle = "#1e1b4b";
            ctx.fillRect(0, 0, width, height);

            // Draw faint nebula
            const nebulaGradient = ctx.createRadialGradient(width/2, height/2, 100, width/2, height/2, Math.max(width, height) / 2);
            nebulaGradient.addColorStop(0, 'rgba(40, 30, 70, 0.4)');
            nebulaGradient.addColorStop(1, 'rgba(30, 27, 75, 0)');
            ctx.fillStyle = nebulaGradient;
            ctx.fillRect(0, 0, width, height);

            stars.forEach(star => {
                const perspective = width / star.z;
                const x = (star.x - width / 2) * perspective + width / 2 - (mouse.x - width / 2) * 0.02 / (star.z / width);
                const y = (star.y - height / 2) * perspective + height / 2 - (mouse.y - height / 2) * 0.02 / (star.z / width);
                const radius = Math.max(0, 1.5 * perspective);
                
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, 2 * Math.PI);
                ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
                ctx.fill();

                star.z -= 0.5;
                if (star.z <= 0) {
                    star.z = width;
                }
            });
            
            requestAnimationFrame(draw);
        };
        
        draw();

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    return <canvas ref={canvasRef} id="starfield-bg" />;
};

export default StarfieldBackground;