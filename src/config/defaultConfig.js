export const defaultParticleConfig = {
    particles: {
        number: {
            value: 50,
            density: {
                enable: true,
                area: 800
            }
        },
        color: {
            value: [
                "#FF6B6B", // Coral
                "#FFB067", // Light orange
                "#FFE66D", // Yellow
                "#4ECDC4", // Turquoise
                "#45B7D1"  // Sky blue
            ]
        },
        shape: {
            type: ["circle", "square", "triangle"]
        },
        opacity: {
            value: 0.5
        },
        size: {
            value: { min: 1, max: 8 }
        },
        links: {
            enable: true,
            distance: 300,
            color: "#ffffff",
            opacity: 0.2,
            width: 2
        },
        move: {
            enable: true,
            speed: 2,
            direction: "none",
            random: true,
            straight: false,
            outModes: {
                default: "out"
            }
        }
    },
    interactivity: {
        detectsOn: "canvas",
        events: {
            onClick: {
                enable: true,
                mode: "push"
            },
            resize: true
        },
        modes: {
            push: {
                quantity: 1
            }
        }
    },
    detectRetina: true
};
