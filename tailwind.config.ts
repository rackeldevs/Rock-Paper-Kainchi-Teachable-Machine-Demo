import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// Rainbow theme colors
				rainbow: {
					red: 'hsl(var(--rainbow-red))',
					orange: 'hsl(var(--rainbow-orange))',
					yellow: 'hsl(var(--rainbow-yellow))',
					green: 'hsl(var(--rainbow-green))',
					blue: 'hsl(var(--rainbow-blue))',
					indigo: 'hsl(var(--rainbow-indigo))',
					violet: 'hsl(var(--rainbow-violet))',
				},
				// Game specific colors
				game: {
					bg: 'hsl(var(--game-bg))',
					card: 'hsl(var(--game-card))',
					shadow: 'hsl(var(--game-shadow))',
					glow: 'hsl(var(--rainbow-glow))',
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'rainbow-glow': {
					'0%, 100%': { boxShadow: '0 0 20px hsl(var(--rainbow-red) / 0.5)' },
					'16%': { boxShadow: '0 0 20px hsl(var(--rainbow-orange) / 0.5)' },
					'33%': { boxShadow: '0 0 20px hsl(var(--rainbow-yellow) / 0.5)' },
					'50%': { boxShadow: '0 0 20px hsl(var(--rainbow-green) / 0.5)' },
					'66%': { boxShadow: '0 0 20px hsl(var(--rainbow-blue) / 0.5)' },
					'83%': { boxShadow: '0 0 20px hsl(var(--rainbow-violet) / 0.5)' }
				},
				'rainbow-border': {
					'0%, 100%': { borderColor: 'hsl(var(--rainbow-red))' },
					'16%': { borderColor: 'hsl(var(--rainbow-orange))' },
					'33%': { borderColor: 'hsl(var(--rainbow-yellow))' },
					'50%': { borderColor: 'hsl(var(--rainbow-green))' },
					'66%': { borderColor: 'hsl(var(--rainbow-blue))' },
					'83%': { borderColor: 'hsl(var(--rainbow-violet))' }
				},
				'pulse-glow': {
					'0%, 100%': { transform: 'scale(1)', opacity: '1' },
					'50%': { transform: 'scale(1.05)', opacity: '0.8' }
				},
				'shake': {
					'0%, 100%': { transform: 'translateX(0)' },
					'25%': { transform: 'translateX(-5px)' },
					'75%': { transform: 'translateX(5px)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'rainbow-glow': 'rainbow-glow 3s ease-in-out infinite',
				'rainbow-border': 'rainbow-border 3s ease-in-out infinite',
				'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
				'shake': 'shake 0.5s ease-in-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
